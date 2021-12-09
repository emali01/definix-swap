import React, { useCallback, useState, useContext, useEffect } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { ethers } from 'ethers'
import tp from 'tp-js-sdk'
import Caver from 'caver-js'
import { abi as IUniswapV2Router02ABI } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import { KlipConnector } from "@sixnetwork/klip-connector"
import { KlipModalContext } from '@sixnetwork/klaytn-use-wallet'
import { useCaverJsReact } from '@sixnetwork/caverjs-react-core';
import { Flex, Modal, Box, InjectedModalProps, Divider, ModalBody } from 'definixswap-uikit-v2'
import styled from 'styled-components'
import { Currency, CurrencyAmount, Percent, Price, TokenAmount, ETHER } from 'definixswap-sdk'
import { useTranslation } from 'react-i18next'
import { useActiveWeb3React } from 'hooks'
import * as klipProvider from 'hooks/KlipProvider'
import { getAbiByName } from 'hooks/HookHelper';
import UseDeParam from 'hooks/useDeParam'
import farms from 'constants/farm'
import { ROUTER_ADDRESS } from 'constants/index';
import { useUserDeadline, useUserSlippageTolerance } from 'state/user/hooks';
import { useTransactionAdder } from 'state/transactions/hooks'
import { Field } from 'state/mint/actions'
import { useToast } from 'state/toasts/hooks'
import { KlaytnTransactionResponse } from 'state/transactions/actions'
import KlaytnScopeLink from 'components/KlaytnScopeLink'
import { calculateGasMargin, calculateSlippageAmount, getRouterContract } from 'utils';
import { wrappedCurrency } from 'utils/wrappedCurrency'
import {sendAnalyticsData} from 'utils/definixAnalytics'
import ModalHeader from './ModalHeader'
import ConfirmAddModalBottom from './ConfirmAddModalBottom';

const isKlipConnector = (connector) => connector instanceof KlipConnector;

interface Props extends InjectedModalProps {
  noLiquidity: boolean;
  currencies: {
    CURRENCY_A?: Currency;
    CURRENCY_B?: Currency;
  };
  liquidityMinted: TokenAmount;
  price: Price;
  parsedAmounts: {
    CURRENCY_A?: CurrencyAmount;
    CURRENCY_B?: CurrencyAmount;
  };
  // onAdd: () =>  Promise<void>;
  poolTokenPercentage: Percent;
  onDismissModal: () => void;
  currencyA: Currency;
  currencyB: Currency;
}

const Wrap = styled(Box)`
  width: calc(100vw - 48px);
  height: 100%;

  @media screen and (min-width: 464px) {
    width: 416px;
  }
`


export default function ConfirmAddModal({
  noLiquidity,
  currencies,
  liquidityMinted,
  price,
  parsedAmounts,
  // onAdd,
  poolTokenPercentage,
  onDismiss = () => null,
  onDismissModal = () => null,
  currencyA,
  currencyB,
}: Props) {
  const { t } = useTranslation()
  const { chainId, account, library } = useActiveWeb3React()
  const { setShowModal } = useContext(KlipModalContext())
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm
  const [txHash, setTxHash] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string>(undefined)
  const [deadline] = useUserDeadline()
  const [allowedSlippage] = useUserSlippageTolerance()
  const addTransaction = useTransactionAdder();
  const { connector } = useCaverJsReact()
  const { toastSuccess, toastError } = useToast();

  const sendDefinixAnalytics = useCallback(() =>{
    if (tp.isConnected()) {
      const firstToken = currencies[Field.CURRENCY_A]
      const secondToken = currencies[Field.CURRENCY_B]
      const farm = farms.find(
        x =>
          x.pid !== 0 &&
          x.pid !== 1 &&
          ((x.tokenSymbol === firstToken?.symbol && x.quoteTokenSymbol === secondToken?.symbol) ||
            (x.tokenSymbol === secondToken?.symbol && x.quoteTokenSymbol === firstToken?.symbol))
      )
      if(farm && account ){
        tp.getDeviceId().then(res=>{
          sendAnalyticsData(farm.pid,account,res.device_id)
        })
        
      }
    }
  }, [account, currencies]);


  const onAdd = useCallback(async () => {
    if (!chainId || !library || !account) return
    
    const { [Field.CURRENCY_A]: parsedAmountA, [Field.CURRENCY_B]: parsedAmountB } = parsedAmounts;
    if (!parsedAmountA || !parsedAmountB || !currencyA || !currencyB) {
      return
    }

    const router = getRouterContract(chainId, library, account)

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(parsedAmountA, noLiquidity ? 0 : allowedSlippage)[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(parsedAmountB, noLiquidity ? 0 : allowedSlippage)[0]
    }

    const deadlineFromNow = Math.ceil(Date.now() / 1000) + deadline

    let estimate
    let method: (...args: any) => Promise<KlaytnTransactionResponse>
    let args: Array<string | string[] | number>
    let value: BigNumber | null
    let methodName

    if (currencyA === ETHER || currencyB === ETHER) {
      const tokenBIsETH = currencyB === ETHER
      estimate = router.estimateGas.addLiquidityETH
      method = router.addLiquidityETH
      methodName = "addLiquidityETH"
      args = [
        wrappedCurrency(tokenBIsETH ? currencyA : currencyB, chainId)?.address ?? '', // token
        (tokenBIsETH ? parsedAmountA : parsedAmountB).raw.toString(), // token desired
        amountsMin[tokenBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(), // token min
        amountsMin[tokenBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(), // eth min
        account,
        deadlineFromNow
      ]
      value = BigNumber.from((tokenBIsETH ? parsedAmountB : parsedAmountA).raw.toString())
    } else {
      estimate = router.estimateGas.addLiquidity
      method = router.addLiquidity
      methodName = "addLiquidity"
      args = [
        wrappedCurrency(currencyA, chainId)?.address ?? '',
        wrappedCurrency(currencyB, chainId)?.address ?? '',
        parsedAmountA.raw.toString(),
        parsedAmountB.raw.toString(),
        amountsMin[Field.CURRENCY_A].toString(),
        amountsMin[Field.CURRENCY_B].toString(),
        account,
        deadlineFromNow
      ]
      value = null
    }

    setAttemptingTxn(true)
    setErrorMsg(undefined)
    const valueNumber = (Number(value ? (+value).toString() : "0") / (10 ** 18)).toString()
    const valueklip = Number.parseFloat(valueNumber).toFixed(6)

    if (isKlipConnector(connector)) {
      setShowModal(true)
      klipProvider.genQRcodeContactInteract(
        router.address,
        JSON.stringify(getAbiByName(methodName)),
        JSON.stringify(args),
        +valueklip !==0 ? `${Math.ceil(+valueklip)}000000000000000000` : "0",
        setShowModal
      )
      const tx = await klipProvider.checkResponse()
      setTxHash(tx)
      setAttemptingTxn(false)
      setShowModal(false)
     
      addTransaction(undefined, {
        type: 'removeLiquidity',
        klipTx: tx,
        data: {
          firstToken: currencyA?.symbol,
          firstTokenAmount: parsedAmounts[Field.CURRENCY_A]?.toSignificant(3),
          secondToken: currencyB?.symbol,
          secondTokenAmount: parsedAmounts[Field.CURRENCY_B]?.toSignificant(3)
        },
        summary: `Remove ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(3)} ${currencyA?.symbol
          } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(3)} ${currencyB?.symbol}`
      })

    } else {
      const iface = new ethers.utils.Interface(IUniswapV2Router02ABI)
      const flagFeeDelegate = await UseDeParam(chainId, 'KLAYTN_FEE_DELEGATE', 'N')
      const flagDefinixAnalaytics = await UseDeParam(chainId, 'GA_TP', 'N')

      await estimate(...args, value ? { value } : {})
        .then(estimatedGasLimit => {
          if (flagFeeDelegate === "Y") {
            const caverFeeDelegate = new Caver(process.env.REACT_APP_SIX_KLAYTN_EN_URL)
            const feePayerAddress = process.env.REACT_APP_FEE_PAYER_ADDRESS
            // @ts-ignore
            const caver = new Caver(window.caver)
            caver.klay.signTransaction({
              type: 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION',
              from: account,
              to: ROUTER_ADDRESS[chainId],
              gas: calculateGasMargin(estimatedGasLimit),
              value,
              data: iface.encodeFunctionData(methodName, [...args]),
            })
              .then(function (userSignTx) {
                const userSigned = caver.transaction.decode(userSignTx.rawTransaction)
                userSigned.feePayer = feePayerAddress
                caverFeeDelegate.rpc.klay.signTransactionAsFeePayer(userSigned).then(function (feePayerSigningResult) {
                  if(flagDefinixAnalaytics==='Y'){
                    sendDefinixAnalytics()
                  }
                  caver.rpc.klay.sendRawTransaction(feePayerSigningResult.raw).then((response: KlaytnTransactionResponse) => {
                    setAttemptingTxn(false)
                    setTxHash(response.transactionHash)
                    addTransaction(response, {
                      type: 'addLiquidity',
                      data: {
                        firstToken: currencies[Field.CURRENCY_A]?.symbol,
                        firstTokenAmount: parsedAmounts[Field.CURRENCY_A]?.toSignificant(3),
                        secondToken: currencies[Field.CURRENCY_B]?.symbol,
                        secondTokenAmount: parsedAmounts[Field.CURRENCY_B]?.toSignificant(3)
                      },
                      summary: `Add ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(3)} ${currencies[Field.CURRENCY_A]?.symbol
                        } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(3)} ${currencies[Field.CURRENCY_B]?.symbol}`
                    })
                  }).catch(e => {
                    setAttemptingTxn(false)
                    if (e?.code !== 4001) {
                      console.error(e)
                      setErrorMsg(e)
                    }
                  })
                })
              })
              .catch(e => {
                setAttemptingTxn(false)
                alert(`err ${e}`)
                if (e?.code !== 4001) {
                  console.error(e)
                  setErrorMsg(e)
                }
              })
          } else {
            method(...args, {
              ...(value ? { value } : {}),
              gasLimit: calculateGasMargin(estimatedGasLimit)
            }).then(response => {
              if(flagDefinixAnalaytics==='Y'){
                sendDefinixAnalytics()
              }
              setAttemptingTxn(false)
              addTransaction(response, {
                type: 'addLiquidity',
                data: {
                  firstToken: currencies[Field.CURRENCY_A]?.symbol,
                  firstTokenAmount: parsedAmounts[Field.CURRENCY_A]?.toSignificant(3),
                  secondToken: currencies[Field.CURRENCY_B]?.symbol,
                  secondTokenAmount: parsedAmounts[Field.CURRENCY_B]?.toSignificant(3)
                },
                summary: `Add ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(3)} ${currencies[Field.CURRENCY_A]?.symbol
                  } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(3)} ${currencies[Field.CURRENCY_B]?.symbol}`
              })
              setTxHash(response.hash)
            }).catch((e) => {
              setAttemptingTxn(false)
              setErrorMsg(e)
              console.error(e)
            })
          }
        })
        .catch(e => {
          setAttemptingTxn(false)
          if (e?.code !== 4001) {
            console.error(e)
            setErrorMsg(e)
          }
        })
    }
  }, [
    account,
    chainId,
    connector,
    addTransaction,
    allowedSlippage,
    currencies,
    currencyA,
    currencyB,
    deadline,
    library,
    noLiquidity,
    parsedAmounts,
    sendDefinixAnalytics,
    setShowModal,
  ]);

  useEffect(() => {
    if (txHash) {
      toastSuccess(t('{{Action}} Complete', {
        Action: t('Add Liquidity')
      }), <KlaytnScopeLink hash={txHash} />)
      onDismiss();
    }
  }, [txHash, t, toastSuccess, onDismissModal, onDismiss])

  useEffect(() => {
    if (errorMsg) {
      toastError(t('{{Action}} Failed', {
        Action: t('Add Liquidity')
      }))
      onDismiss();
    }
  }, [errorMsg, t, onDismissModal, onDismiss, toastError])

  return (
    <Modal title={t('Confirm Add Liquidity')} mobileFull onDismiss={onDismiss}>
      <ModalBody>
        <Wrap>
          <Flex flexDirection="column" mb="20px" mt="16px">
            <ModalHeader
              noLiquidity={noLiquidity}
              currencies={currencies}
              liquidityMinted={liquidityMinted}
            />
          </Flex>
          <Divider mb="24px" mt="35px" />
          <Flex flexDirection="column">
            <ConfirmAddModalBottom 
              price={price}
              currencies={currencies}
              parsedAmounts={parsedAmounts}
              noLiquidity={noLiquidity}
              onAdd={onAdd}
              isPending={attemptingTxn}
              poolTokenPercentage={poolTokenPercentage}
              allowedSlippage={allowedSlippage}
            />
          </Flex>
        </Wrap>
      </ModalBody>
    </Modal>
  )
}
