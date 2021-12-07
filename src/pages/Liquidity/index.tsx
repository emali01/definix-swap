import React, { useCallback, useState, useContext, useMemo } from 'react'
import { useParams } from 'react-router';
import Caver from 'caver-js'
import { ethers } from 'ethers'
import { BigNumber } from '@ethersproject/bignumber'
import { abi as IUniswapV2Router02ABI } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import { KlipModalContext } from '@sixnetwork/klaytn-use-wallet'
import { useCaverJsReact } from '@sixnetwork/caverjs-react-core'
import { KlipConnector } from "@sixnetwork/klip-connector"
import tp from 'tp-js-sdk'
import {sendAnalyticsData} from 'utils/definixAnalytics'
import TransactionConfirmationModal, {
  ConfirmationModalContent,
} from 'components/TransactionConfirmationModal'
import { ETHER } from 'definixswap-sdk'
import { useActiveWeb3React } from 'hooks'
import { useCurrency } from 'hooks/Tokens'
import { useApproveCallback } from 'hooks/useApproveCallback'
import { useTranslation } from 'react-i18next'
import { Field } from 'state/mint/actions'
import { useDerivedMintInfo, useMintActionHandlers } from 'state/mint/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import { KlaytnTransactionResponse } from 'state/transactions/actions'
import { useUserDeadline, useUserSlippageTolerance } from 'state/user/hooks'
import { Box, Flex, TitleSet, useMatchBreakpoints, Tabs, ColorStyles } from 'definixswap-uikit'
import { calculateGasMargin, calculateSlippageAmount, getRouterContract } from 'utils'
import { wrappedCurrency } from 'utils/wrappedCurrency'
import UseDeParam from 'hooks/useDeParam'
import { ROUTER_ADDRESS, HERODOTUS_ADDRESS } from '../../constants'
import farms from '../../constants/farm'
import * as klipProvider from '../../hooks/KlipProvider'
import { getAbiByName } from '../../hooks/HookHelper'
import LiquidityList from './LiquidityList'
import AddLiquidity from './AddLiquidity'
import ModalBottom from './ModalBottom'
import ModalHeader from './ModalHeader'
import ErrorContent from './ErrorContent'
import SubmittedContent from './SubmittedContent'

const isKlipConnector = (connector) => connector instanceof KlipConnector;

const Liquidity: React.FC = () => {
  const { currencyIdA, currencyIdB } = useParams<{currencyIdA?: string; currencyIdB?: string;}>();
  const { isXl, isXxl } = useMatchBreakpoints()
  const isMobile = useMemo(() => !isXl && !isXxl, [isXl, isXxl])
  const { t } = useTranslation();

  const { account, chainId, library } = useActiveWeb3React()
  const { connector } = useCaverJsReact()
  const { setShowModal } = useContext(KlipModalContext())
  const currencyA = useCurrency(currencyIdA)
  const currencyB = useCurrency(currencyIdB)

  const herodotusAddress = useMemo(() => HERODOTUS_ADDRESS[chainId || ''], [chainId]);

  const {
    currencies,
    parsedAmounts,
    price,
    noLiquidity,
    liquidityMinted,
    poolTokenPercentage,
  } = useDerivedMintInfo(currencyA ?? undefined, currencyB ?? undefined)
  const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noLiquidity)

  // modal, loading, error
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm
  const [errorMsg, setErrorMsg] = useState<string>('')

  const tabNames = useMemo(() => [t('Add'), t('Remove')], [t]);
  const [curTab, setCurTab] = useState<string>(tabNames[0]);

  // txn values
  const [deadline] = useUserDeadline() // custom from users settings
  const [allowedSlippage] = useUserSlippageTolerance() // custom from users
  const [txHash, setTxHash] = useState<string>('')

  const [approvalLP, approveLPCallback] = useApproveCallback(liquidityMinted, herodotusAddress)

  const addTransaction = useTransactionAdder();

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

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    if (txHash) {
      onFieldAInput('')
    }
    setTxHash('')
    setErrorMsg('')
  }, [onFieldAInput, txHash])
  
  return (
    <Flex width="100%" justifyContent="center">
      <Flex flexDirection="column" width={isMobile ? "100%" : "629px"}>
        <Flex mb="40px">
          <TitleSet
            title={t("Liquidity")}
            description={t("Pair your tokens and deposit in a liquidity pool to get high interest profit.")}
            link="/"
            linkLabel={t("Learn to swap.")}
          />
        </Flex>
        <Flex
          flexDirection="column"
          borderRadius="16px"
        >
          <Box
            backgroundColor={ColorStyles.WHITE}
          >
            <Tabs 
              tabs={tabNames}
              curTab={curTab}
              setCurTab={setCurTab}
              small={isMobile}
              equal={isMobile}
            />
          </Box>
          <Box>
            {curTab === tabNames[0] && (
              <AddLiquidity
                onAdd={onAdd}
                setShowConfirm={setShowConfirm}
              />
            )}
            {curTab === tabNames[1] && (
              <LiquidityList />
            )}
          </Box>
        </Flex>
      </Flex>

      <TransactionConfirmationModal
        isOpen={showConfirm}
        isPending={!!attemptingTxn}
        isSubmitted={!!txHash}
        isError={!!errorMsg}
        confirmContent={() => (
          <ConfirmationModalContent
            mainTitle={t("Confirm Add liquidity")}
            title={noLiquidity ? t('You are creating a pool') : t('You will receive')}
            topContent={() => 
              <ModalHeader
                noLiquidity={noLiquidity}
                currencies={currencies}
                liquidityMinted={liquidityMinted}
              />
            }
            bottomContent={() =>
              <ModalBottom 
                price={price}
                currencies={currencies}
                parsedAmounts={parsedAmounts}
                noLiquidity={noLiquidity}
                onAdd={onAdd}
                poolTokenPercentage={poolTokenPercentage}
                allowedSlippage={allowedSlippage}
              />}
          />
        )}
        pendingIcon={null}
        submittedContent={() => 
          <SubmittedContent
            txHash={txHash}
            currencies={currencies}
            liquidityMinted={liquidityMinted}
            setAttemptingTxn={setAttemptingTxn}
            approvalLP={approvalLP}
            approveLPCallback={approveLPCallback}
            content={() => 
              <ModalHeader
                noLiquidity={noLiquidity}
                currencies={currencies}
                liquidityMinted={liquidityMinted}
              />}
          />
        }
        errorContent={() => 
          <ErrorContent
            txHash={txHash}
            content={() => 
              <ModalHeader
                noLiquidity={noLiquidity}
                currencies={currencies}
                liquidityMinted={liquidityMinted}
              />}
          />
        }
        onDismiss={handleDismissConfirmation}

        setShowConfirm={setShowConfirm}
        setTxHash={setTxHash}
        onFieldAInput={onFieldAInput}
        onFieldBInput={onFieldBInput}
      />
    </Flex>
  )
}

export default React.memo(Liquidity);