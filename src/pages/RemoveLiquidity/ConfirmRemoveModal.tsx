import React, { useCallback, useState, useContext, useEffect } from 'react'
import Caver from 'caver-js'
import { useTranslation } from 'react-i18next'
import { ethers } from 'ethers'
import styled from 'styled-components'
import { BigNumber } from '@ethersproject/bignumber'
import { Flex, Text, Modal, Box, Divider, InjectedModalProps, ColorStyles, Button, ButtonScales, NotiIcon } from 'definixswap-uikit'
import { Currency, Percent, TokenAmount, CurrencyAmount, Pair, Token, ETHER } from 'definixswap-sdk'
import { abi as IUniswapV2Router02ABI } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'

import { KlipConnector } from "@sixnetwork/klip-connector"
import { useCaverJsReact } from '@sixnetwork/caverjs-react-core'
import { KlipModalContext } from '@sixnetwork/klaytn-use-wallet'

import { useTransactionAdder } from 'state/transactions/hooks'
import { Field } from 'state/burn/actions'
import { useUserDeadline, useUserSlippageTolerance } from 'state/user/hooks'
import { KlaytnTransactionResponse } from 'state/transactions/actions'
import { useToast } from 'state/toasts/hooks'

import { useActiveWeb3React } from 'hooks'
import * as klipProvider from 'hooks/KlipProvider'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { getAbiByName } from 'hooks/HookHelper'
import UseDeParam from 'hooks/useDeParam'

import { ROUTER_ADDRESS } from 'constants/index'

import DoubleCurrencyLogo from 'components/DoubleLogo'
import CurrencyLogo from 'components/CurrencyLogo'
import KlaytnScopeLink from 'components/KlaytnScopeLink'

import { calculateGasMargin, calculateSlippageAmount, getRouterContract } from 'utils'

interface Props extends InjectedModalProps {
  currencyA: Currency;
  currencyB: Currency;
  parsedAmounts: {
    LIQUIDITY_PERCENT: Percent;
    LIQUIDITY?: TokenAmount;
    CURRENCY_A?: CurrencyAmount;
    CURRENCY_B?: CurrencyAmount;
  }
  pair: Pair;
  tokenA: Token;
  tokenB: Token;
  signatureData: { v: number; r: string; s: string; deadline: number }
  onDismissModal: () => void;
}

const Wrap = styled(Box)`
  width: calc(100vw - 48px);
  height: 100%;

  @media screen and (min-width: 464px) {
    width: 416px;
  }
`

const StyledNotiIcon = styled(NotiIcon)`
  flex-shrink: 0;
`

const isKlipConnector = (connector) => connector instanceof KlipConnector

export default function ConfirmRemoveModal({
  onDismiss,
  currencyA,
  currencyB,
  parsedAmounts,
  pair,
  tokenA,
  tokenB,
  signatureData,
  onDismissModal

}: Props) {
  const { t } = useTranslation();
  const addTransaction = useTransactionAdder()
  const { account, chainId, library } = useActiveWeb3React()
  const [approval] = useApproveCallback(parsedAmounts[Field.LIQUIDITY], ROUTER_ADDRESS[chainId || parseInt(process.env.REACT_APP_CHAIN_ID || '0')])
  const { connector } = useCaverJsReact()
  const { setShowModal } = useContext(KlipModalContext())
  const { toastSuccess, toastError } = useToast();

  const [attemptingTxn, setAttemptingTxn] = useState(false)
  const [txHash, setTxHash] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [deadline] = useUserDeadline()
  const [allowedSlippage] = useUserSlippageTolerance()

  const onRemove = useCallback(async () => {
    if (!chainId || !library || !account) throw new Error('missing dependencies')
    const { [Field.CURRENCY_A]: currencyAmountA, [Field.CURRENCY_B]: currencyAmountB } = parsedAmounts
    if (!currencyAmountA || !currencyAmountB) {
      throw new Error('missing currency amounts')
    }
    const router = getRouterContract(chainId, library, account)

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(currencyAmountA, allowedSlippage)[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(currencyAmountB, allowedSlippage)[0]
    }

    if (!currencyA || !currencyB) throw new Error('missing tokens')
    const liquidityAmount = parsedAmounts[Field.LIQUIDITY]
    if (!liquidityAmount) throw new Error('missing liquidity amount')

    const currencyBIsETH = currencyB === ETHER
    const oneCurrencyIsETH = currencyA === ETHER || currencyBIsETH
    const deadlineFromNow = Math.ceil(Date.now() / 1000) + deadline

    if (!tokenA || !tokenB) throw new Error('could not wrap')

    let methodNames: string[]
    let args: Array<string | string[] | number | boolean>
    // we have approval, use normal remove liquidity
    if (approval === ApprovalState.APPROVED) {
      // removeLiquidityETH
      if (oneCurrencyIsETH) {
        methodNames = ['removeLiquidityETH', 'removeLiquidityETHSupportingFeeOnTransferTokens']
        args = [
          currencyBIsETH ? tokenA.address : tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
          account,
          deadlineFromNow
        ]
      }
      // removeLiquidity
      else {
        methodNames = ['removeLiquidity']
        args = [
          tokenA.address,
          tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[Field.CURRENCY_A].toString(),
          amountsMin[Field.CURRENCY_B].toString(),
          account,
          deadlineFromNow
        ]
      }
    }
    // we have a signataure, use permit versions of remove liquidity
    else if (signatureData !== null) {
      // removeLiquidityETHWithPermit
      if (oneCurrencyIsETH) {
        methodNames = ['removeLiquidityETHWithPermit', 'removeLiquidityETHWithPermitSupportingFeeOnTransferTokens']
        args = [
          currencyBIsETH ? tokenA.address : tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
          account,
          signatureData.deadline,
          false,
          signatureData.v,
          signatureData.r,
          signatureData.s
        ]
      }
      // removeLiquidityETHWithPermit
      else {
        methodNames = ['removeLiquidityWithPermit']
        args = [
          tokenA.address,
          tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[Field.CURRENCY_A].toString(),
          amountsMin[Field.CURRENCY_B].toString(),
          account,
          signatureData.deadline,
          false,
          signatureData.v,
          signatureData.r,
          signatureData.s
        ]
      }
    } else {
      throw new Error('Attempting to confirm without approval or a signature. Please contact support.')
    }
    const safeGasEstimates: (BigNumber | undefined)[] = await Promise.all(
      methodNames.map((methodName, index) =>
        router.estimateGas[methodName](...args)
          .then(calculateGasMargin)
          .catch(e => {
            console.error(`estimateGas failed`, index, methodName, args, e)
            return undefined
          })
      )
    )

    const indexOfSuccessfulEstimation = safeGasEstimates.findIndex(safeGasEstimate =>
      BigNumber.isBigNumber(safeGasEstimate)
    )

    // all estimations failed...
    if (indexOfSuccessfulEstimation === -1) {
      console.error('This transaction would fail. Please contact support.')
    } else {
      const methodName = methodNames[indexOfSuccessfulEstimation]
      const safeGasEstimate = safeGasEstimates[indexOfSuccessfulEstimation]

      setAttemptingTxn(true)

      if (isKlipConnector(connector)) {
        
        klipProvider.genQRcodeContactInteract(
          router.address,
          JSON.stringify(getAbiByName(methodName)),
          JSON.stringify(args),
          "0",
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

        if (flagFeeDelegate === "Y") {
          const caverFeeDelegate = new Caver(process.env.REACT_APP_SIX_KLAYTN_EN_URL)
          const feePayerAddress = process.env.REACT_APP_FEE_PAYER_ADDRESS

          // @ts-ignore
          const caver = new Caver(window.caver)

          await caver.klay.signTransaction({
            type: 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION',
            from: account,
            to: ROUTER_ADDRESS[chainId || parseInt(process.env.REACT_APP_CHAIN_ID || '0')],
            gas: safeGasEstimate,
            data: iface.encodeFunctionData(methodName, [...args]),
          })
            .then(function (userSignTx) {
              // console.log('userSignTx tx = ', userSignTx)
              const userSigned = caver.transaction.decode(userSignTx.rawTransaction)
              // console.log('userSigned tx = ', userSigned)
              userSigned.feePayer = feePayerAddress
              // console.log('userSigned After add feePayer tx = ', userSigned)

              caverFeeDelegate.rpc.klay.signTransactionAsFeePayer(userSigned).then(function (feePayerSigningResult) {
                // console.log('feePayerSigningResult tx = ', feePayerSigningResult)
                caver.rpc.klay.sendRawTransaction(feePayerSigningResult.raw).then((response: KlaytnTransactionResponse) => {
                  setAttemptingTxn(false)

                  addTransaction(response, {
                    type: 'removeLiquidity',
                    data: {
                      firstToken: currencyA?.symbol,
                      firstTokenAmount: parsedAmounts[Field.CURRENCY_A]?.toSignificant(3),
                      secondToken: currencyB?.symbol,
                      secondTokenAmount: parsedAmounts[Field.CURRENCY_B]?.toSignificant(3)
                    },
                    summary: `Remove ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(3)} ${currencyA?.symbol
                      } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(3)} ${currencyB?.symbol}`
                  })

                  setTxHash(response.transactionHash)
                }).catch(e => {
                  setAttemptingTxn(false)
                  setErrorMsg(e.message)
                  // we only care if the error is something _other_ than the user rejected the tx
                  console.error(e)
                })
              })
            })
            .catch(e => {
              setAttemptingTxn(false)
              setErrorMsg(e.message)
              // we only care if the error is something _other_ than the user rejected the tx
              console.error(e)
            })
        } else {
          await router[methodName](...args, {
            gasLimit: safeGasEstimate
          })
            .then((response: KlaytnTransactionResponse) => {
              setAttemptingTxn(false)

              addTransaction(response, {
                type: 'removeLiquidity',
                data: {
                  firstToken: currencyA?.symbol,
                  firstTokenAmount: parsedAmounts[Field.CURRENCY_A]?.toSignificant(3),
                  secondToken: currencyB?.symbol,
                  secondTokenAmount: parsedAmounts[Field.CURRENCY_B]?.toSignificant(3)
                },
                summary: `Remove ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(3)} ${currencyA?.symbol
                  } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(3)} ${currencyB?.symbol}`
              })

              setTxHash(response.hash)
            })
            .catch((e: Error) => {
              setAttemptingTxn(false)
              setErrorMsg(e.message)
              // we only care if the error is something _other_ than the user rejected the tx
              console.error(e)
            })
        }
      }
    }
  }, [account, addTransaction, allowedSlippage, approval, chainId, connector, currencyA, currencyB, deadline, library, parsedAmounts, setShowModal, signatureData, tokenA, tokenB]);

  useEffect(() => {
    if (txHash) {
      toastSuccess(t('{{Action}} Complete', {
        Action: t('Remove Liquidity')
      }), <KlaytnScopeLink hash={txHash} />)
      onDismiss();
    }
  }, [txHash, t, toastSuccess, onDismissModal, onDismiss])

  useEffect(() => {
    if (errorMsg) {
      toastError(t('{{Action}} Failed', {
        Action: t('Remove Liquidity')
      }))
      onDismiss();
    }
  }, [errorMsg, t, onDismissModal, onDismiss, toastError])

  return (
    <Modal title={t('Confirm Remove Liquidity')} mobileFull onDismiss={onDismiss}>
      <Wrap>
        <Flex flexDirection="column" mb="20px" mt="16px">
          <Text textStyle="R_16M" color={ColorStyles.DEEPGREY}>{t('LP amount before removal')}</Text>

          <Flex justifyContent="space-between" alignItems="center" p="14px 0px" mb="20px">
            <Flex alignItems="center">
              <DoubleCurrencyLogo currency0={currencyA} currency1={currencyB} size={32} />
              <Text ml="10px" textStyle="R_16M" color={ColorStyles.BLACK}>{currencyA?.symbol}-{currencyB?.symbol}</Text>
            </Flex>
            <Text textStyle="R_16R" color={ColorStyles.BLACK}>
              {parsedAmounts[Field.LIQUIDITY]?.toSignificant(6)}
            </Text>
          </Flex>

          <Text textStyle="R_16M" color={ColorStyles.DEEPGREY}>{t('You will receive')}</Text>
          <Flex justifyContent="space-between" alignItems="center" p="14px 0px">
            <Flex alignItems="center">
              <CurrencyLogo currency={currencyA} size="32px" />
              <Text textStyle="R_16M" color={ColorStyles.BLACK} ml="10px">
                {currencyA?.symbol}
              </Text>
            </Flex>
            <Text textStyle="R_16R" color={ColorStyles.BLACK}>
              {parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}
            </Text>
          </Flex>

          <Flex justifyContent="space-between" alignItems="center" p="14px 0px">
            <Flex alignItems="center">
              <CurrencyLogo currency={currencyB} size="32px" />
              <Text textStyle="R_16M" color={ColorStyles.BLACK} ml="10px">
                {currencyB?.symbol}
              </Text>
            </Flex>
            <Text textStyle="R_16R" color={ColorStyles.BLACK}>
              {parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}
            </Text>
          </Flex>
        </Flex>
        <Divider mb="24px" mt="35px" />
        <Flex flexDirection="column">
          <Flex>
            <Text textStyle="R_16M" color={ColorStyles.DEEPGREY}>{t('Estimated Returns')}</Text>
          </Flex>
          {pair && (
            <Flex justifyContent="space-between" mt="12px">
              <Text textStyle="R_14R" color={ColorStyles.MEDIUMGREY}>{t('Price Rate')}</Text>
              <Flex flexDirection="column" alignItems="flex-end">
                <Text textStyle="R_14M" color={ColorStyles.DEEPGREY}>
                  1 {currencyA?.symbol} = {tokenA ? pair.priceOf(tokenA).toSignificant(6) : '-'} {currencyB?.symbol}
                </Text>
                <Text textStyle="R_14M" color={ColorStyles.DEEPGREY}>
                  1 {currencyB?.symbol} = {tokenB ? pair.priceOf(tokenB).toSignificant(6) : '-'} {currencyA?.symbol}
                </Text>
              </Flex>
            </Flex>
          )}
          <Flex alignItems="flex-start" mt="20px">
            <StyledNotiIcon />
            <Text ml="4px" textStyle="R_12R" color={ColorStyles.MEDIUMGREY}>
              {t('Output is estimated')}
              {/* {`Output is estimated. If the price changes by more than ${allowedSlippage / 100
                }% your transaction will revert.`} */}
            </Text>
          </Flex>
          <Button
            mt="32px"
            disabled={!(approval === ApprovalState.APPROVED || signatureData !== null)}
            onClick={onRemove}
            scale={ButtonScales.LG}
            isLoading={attemptingTxn}
          >
            {t('Remove')}
          </Button>
        </Flex>
      </Wrap>
    </Modal>
  )
}