import Caver from 'caver-js'
import { ethers } from 'ethers'
import { BigNumber } from '@ethersproject/bignumber'
import { splitSignature } from '@ethersproject/bytes'
import { Contract } from '@ethersproject/contracts'
import { abi as IUniswapV2Router02ABI } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import ConnectWalletButton from 'components/ConnectWalletButton'
import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent,
  TransactionSubmittedContent
} from 'components/TransactionConfirmationModal'
import { KlipModalContext } from '@sixnetwork/klaytn-use-wallet'
import { useCaverJsReact } from '@sixnetwork/caverjs-react-core'
import { KlipConnector } from "@sixnetwork/klip-connector"
import { Currency, currencyEquals, ETHER, Percent, WETH } from 'definixswap-sdk'
import React, { useCallback, useContext, useMemo, useState } from 'react'
import { ArrowDown, Plus } from 'react-feather'
import { RouteComponentProps } from 'react-router'
import { ThemeContext } from 'styled-components'
import { AnountButton, Button, CardBody, ColorStyles, Flex, Text, Box, ButtonScales, ChangeIcon, Noti, NotiType, TitleSet, BalanceInput } from 'definixswap-uikit'
import UseDeParam from 'hooks/useDeParam'
import { useTranslation } from 'react-i18next'
import { AutoColumn } from '../../components/Column'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import CurrencyLogo from '../../components/CurrencyLogo'
import DoubleCurrencyLogo from '../../components/DoubleLogo'
import { RowBetween, RowFixed } from '../../components/Row'
import { StyledInternalLink } from '../../components/Shared'
import Slider from '../../components/Slider'
import { Dots } from '../../components/swap/styleds'
import { ROUTER_ADDRESS } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { usePairContract } from '../../hooks/useContract'
import { Field } from '../../state/burn/actions'
import { useBurnActionHandlers, useBurnState, useDerivedBurnInfo } from '../../state/burn/hooks'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { KlaytnTransactionResponse } from '../../state/transactions/actions'
import { useUserDeadline, useUserSlippageTolerance } from '../../state/user/hooks'
import { calculateGasMargin, calculateSlippageAmount, getRouterContract } from '../../utils'
import { currencyId } from '../../utils/currencyId'
import useDebouncedChangeHandler from '../../utils/useDebouncedChangeHandler'
import { wrappedCurrency } from '../../utils/wrappedCurrency'
import * as klipProvider from '../../hooks/KlipProvider'
import { getAbiByName } from '../../hooks/HookHelper'

export default function RemoveLiquidity({
  history,
  match: {
    params: { currencyIdA, currencyIdB }
  }
}: RouteComponentProps<{ currencyIdA: string; currencyIdB: string }>) {
  const { t } = useTranslation();
  const [currencyA, currencyB] = [useCurrency(currencyIdA) ?? undefined, useCurrency(currencyIdB) ?? undefined]
  const { account, chainId, library } = useActiveWeb3React()
  const [tokenA, tokenB] = useMemo(() => [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)], [
    currencyA,
    currencyB,
    chainId
  ])

  const theme = useContext(ThemeContext)
  const { connector } = useCaverJsReact()
  const { setShowModal } = useContext(KlipModalContext())

  // burn state
  const { independentField, typedValue } = useBurnState()
  const { pair, parsedAmounts, error } = useDerivedBurnInfo(currencyA ?? undefined, currencyB ?? undefined)
  const { onUserInput: _onUserInput } = useBurnActionHandlers()
  const isValid = !error

  // modal, loading, error
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [showDetailed, setShowDetailed] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm
  const [errorMsg, setErrorMsg] = useState<string>('')

  // txn values
  const [txHash, setTxHash] = useState<string>('')
  const [deadline] = useUserDeadline()
  const [allowedSlippage] = useUserSlippageTolerance()

  const formattedAmounts = {
    [Field.LIQUIDITY_PERCENT]: parsedAmounts[Field.LIQUIDITY_PERCENT].equalTo('0')
      ? '0'
      : parsedAmounts[Field.LIQUIDITY_PERCENT].lessThan(new Percent('1', '100'))
        ? '<1'
        : parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0),
    [Field.LIQUIDITY]:
      independentField === Field.LIQUIDITY ? typedValue : parsedAmounts[Field.LIQUIDITY]?.toSignificant(6) ?? '',
    [Field.CURRENCY_A]:
      independentField === Field.CURRENCY_A ? typedValue : parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) ?? '',
    [Field.CURRENCY_B]:
      independentField === Field.CURRENCY_B ? typedValue : parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) ?? ''
  }

  const atMaxAmount = parsedAmounts[Field.LIQUIDITY_PERCENT]?.equalTo(new Percent('1'))

  // pair contract
  const pairContract: Contract | null = usePairContract(pair?.liquidityToken?.address)

  // allowance handling
  const [signatureData, setSignatureData] = useState<{ v: number; r: string; s: string; deadline: number } | null>(null)
  const [approval, approveCallback] = useApproveCallback(parsedAmounts[Field.LIQUIDITY], ROUTER_ADDRESS[chainId || parseInt(process.env.REACT_APP_CHAIN_ID || '0')])
  async function onAttemptToApprove() {
    if (!pairContract || !pair || !library) throw new Error('missing dependencies')
    const liquidityAmount = parsedAmounts[Field.LIQUIDITY]
    if (!liquidityAmount) throw new Error('missing liquidity amount')
    // try to gather a signature for permission
    const nonce = await pairContract.nonces(account)

    const deadlineForSignature: number = Math.ceil(Date.now() / 1000) + deadline

    const EIP712Domain = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' }
    ]
    const domain = {
      name: 'Definix LPs',
      version: '1',
      chainId,
      verifyingContract: pair.liquidityToken.address
    }
    const Permit = [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' }
    ]
    const message = {
      owner: account,
      spender: ROUTER_ADDRESS[chainId || parseInt(process.env.REACT_APP_CHAIN_ID || '0')],
      value: liquidityAmount.raw.toString(),
      nonce: nonce.toHexString(),
      deadline: deadlineForSignature
    }
    const data = JSON.stringify({
      types: {
        EIP712Domain,
        Permit
      },
      domain,
      primaryType: 'Permit',
      message
    })

    library
      .send('eth_signTypedData_v4', [account, data])
      .then(splitSignature)
      .then(signature => {
        setSignatureData({
          v: signature.v,
          r: signature.r,
          s: signature.s,
          deadline: deadlineForSignature
        })
      })
      .catch(e => {
        // for all errors other than 4001 (EIP-1193 user rejected request), fall back to manual approve
        if (e?.code !== 4001) {
          approveCallback()
        }
      })
  }

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback(
    (field: Field, val: string) => {
      setSignatureData(null)
      return _onUserInput(field, val)
    },
    [_onUserInput]
  )

  const onLiquidityInput = useCallback((val: string): void => onUserInput(Field.LIQUIDITY, val), [onUserInput])
  const onCurrencyAInput = useCallback((val: string): void => onUserInput(Field.CURRENCY_A, val), [onUserInput])
  const onCurrencyBInput = useCallback((val: string): void => onUserInput(Field.CURRENCY_B, val), [onUserInput])

  // tx sending
  const addTransaction = useTransactionAdder()
  async function onRemove() {
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
                  console.log(methodName, ' tx = ', response)
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
  }


  const modalHeader = useCallback(() => {
    return (
      <div>
        <AutoColumn gap="24px">
          <AutoColumn gap="16px">
            <RowBetween align="flex-end">
              <Text>{parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}</Text>
              <RowFixed mb="0 !important">
                <CurrencyLogo currency={currencyA} size="24px" />
                <Text>
                  {currencyA?.symbol}
                </Text>
              </RowFixed>
            </RowBetween>
            <RowFixed>
              <Plus size="16" color={theme.colors.textSubtle} />
            </RowFixed>
            <RowBetween align="flex-end">
              <Text>{parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}</Text>
              <RowFixed mb="0 !important">
                <CurrencyLogo currency={currencyB} size="24px" />
                <Text>
                  {currencyB?.symbol}
                </Text>
              </RowFixed>
            </RowBetween>
          </AutoColumn>

          <Text>
            {`Output is estimated. If the price changes by more than ${allowedSlippage / 100
              }% your transaction will revert.`}
          </Text>
        </AutoColumn>
      </div>
    )
  }, [allowedSlippage, currencyA, currencyB, parsedAmounts, theme.colors.textSubtle])

  const modalBottom = () => {
    return (
      <AutoColumn gap="16px">
        <RowBetween>
          <Text color="textSubtle">{`FLIP ${currencyA?.symbol}/${currencyB?.symbol}`} Burned</Text>
          <RowFixed>
            <DoubleCurrencyLogo currency0={currencyA} currency1={currencyB} margin />
            <Text>{parsedAmounts[Field.LIQUIDITY]?.toSignificant(6)}</Text>
          </RowFixed>
        </RowBetween>
        {pair && (
          <>
            <RowBetween>
              <Text color="textSubtle">Price</Text>
              <Text>
                1 {currencyA?.symbol} = {tokenA ? pair.priceOf(tokenA).toSignificant(6) : '-'} {currencyB?.symbol}
              </Text>
            </RowBetween>
            <RowBetween>
              <div />
              <Text>
                1 {currencyB?.symbol} = {tokenB ? pair.priceOf(tokenB).toSignificant(6) : '-'} {currencyA?.symbol}
              </Text>
            </RowBetween>
          </>
        )}
        <Button
          disabled={!(approval === ApprovalState.APPROVED || signatureData !== null)}
          onClick={onRemove}
        >
          Confirm
        </Button>
      </AutoColumn>
    )
  }

  const liquidityPercentChangeCallback = useCallback(
    (value: number) => {
      onUserInput(Field.LIQUIDITY_PERCENT, value.toString())
    },
    [onUserInput]
  )

  const oneCurrencyIsETH = currencyA === ETHER || currencyB === ETHER
  const oneCurrencyIsWETH = Boolean(
    chainId &&
    ((currencyA && currencyEquals(WETH(chainId), currencyA)) ||
      (currencyB && currencyEquals(WETH(chainId), currencyB)))
  )

  const handleSelectCurrencyA = useCallback(
    (currency: Currency) => {
      if (currencyIdB && currencyId(currency) === currencyIdB) {
        history.push(`/remove/${currencyId(currency)}/${currencyIdA}`)
      } else {
        history.push(`/remove/${currencyId(currency)}/${currencyIdB}`)
      }
    },
    [currencyIdA, currencyIdB, history]
  )
  const handleSelectCurrencyB = useCallback(
    (currency: Currency) => {
      if (currencyIdA && currencyId(currency) === currencyIdA) {
        history.push(`/remove/${currencyIdB}/${currencyId(currency)}`)
      } else {
        history.push(`/remove/${currencyIdA}/${currencyId(currency)}`)
      }
    },
    [currencyIdA, currencyIdB, history]
  )

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    setSignatureData(null) // important that we clear signature data to avoid bad sigs
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.LIQUIDITY_PERCENT, '0')
    }
    setTxHash('')
    setErrorMsg('')
  }, [onUserInput, txHash])

  const submittedContent = useCallback(
    () => (
      <TransactionSubmittedContent
        title="Remove Liquidity Complete"
        date={`${new Date().toDateString()}, ${new Date().toTimeString().split(" ")[0]}`}
        chainId={chainId}
        hash={txHash}
        content={modalHeader}
        button={
          <Button
            onClick={() => {
              console.log('Remove this Liquidity from Farm')
            }}
          >
            Remove this Liquidity from Farm
          </Button>
        }
      />
    ),
    [chainId, modalHeader, txHash]
  )

  const errorContent = useCallback(
    () => (
      <TransactionErrorContent
        title="Remove Liquidity Failed"
        date={`${new Date().toDateString()}, ${new Date().toTimeString().split(" ")[0]}`}
        chainId={chainId}
        hash={txHash}
        content={modalHeader}
        button={
          <Button
            onClick={() => {
              console.log('Remove Liquidity Again')
            }}
          >
            Remove Liquidity Again
          </Button>
        }
      />
    ),
    [chainId, modalHeader, txHash]
  )

  const [innerLiquidityPercentage, setInnerLiquidityPercentage] = useDebouncedChangeHandler(
    Number.parseInt(parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0)),
    liquidityPercentChangeCallback
  )

  return (
    <>
      <Box mb="40px">
        <TitleSet
          title={t("Liquidity")}
          description={t("Pair your tokens and deposit in a liquidity pool to get high interest profit.")}
          link="https://sixnetwork.gitbook.io/definix-on-klaytn-en/exchange/how-to-trade-on-definix-exchange"
          linkLabel={t("Learn how to Liquidity.")}
        />
      </Box>
      <Flex 
        backgroundColor={ColorStyles.WHITE}
        borderRadius="16px"
        width="629px"
        border="solid 1px #ffe5c9"
        style={{boxShadow: '0 12px 12px 0 rgba(227, 132, 0, 0.1)'}}
      >
        <Flex flexDirection="column" width="100%">
          <CardBody>
            <Flex flexDirection="column" mb="20px">
              <Flex justifyContent="space-between" mb="20px">
                <Flex alignItems="center">
                  <Box mr="10px">
                    <DoubleCurrencyLogo size={40} currency0={currencyA} currency1={currencyB}/>
                  </Box>
                  <Text textStyle="R_18M" color={ColorStyles.BLACK}>
                    {currencyA?.symbol}-{currencyB?.symbol}
                  </Text>
                </Flex>
              </Flex>


              <Flex width="100%" flexDirection="column">
                <Flex justifyContent="space-between">
                  
                  <Flex alignItems="center">
                    <Text mr="6px" textStyle="R_28M" color={ColorStyles.BLACK}>
                      {formattedAmounts[Field.LIQUIDITY_PERCENT]}
                    </Text>
                    <Text textStyle="R_20M" color={ColorStyles.MEDIUMGREY}>%</Text>
                  </Flex>
                  
                  <Box
                    onClick={() => {
                      setShowDetailed(!showDetailed)
                    }}
                    style={{cursor: 'pointer'}}
                  >
                    <Text textStyle="R_14R" color={ColorStyles.MEDIUMGREY}>
                      {showDetailed ? 'Simple' : 'Detail'}
                    </Text>
                  </Box>

                </Flex>
                <Slider value={innerLiquidityPercentage} onChange={setInnerLiquidityPercentage} />
              </Flex>
            </Flex>

            {!showDetailed && (
              <>
                <Flex width="100%" flexDirection="column">
                  <Flex justifyContent="space-between" mb="14px">
                    <Text textStyle="R_16M" color={ColorStyles.DEEPGREY}>
                      {t('You will receive')}
                    </Text>
                    {chainId && (oneCurrencyIsWETH || oneCurrencyIsETH) ? (
                      <Flex>
                        {oneCurrencyIsETH ? (
                          <StyledInternalLink
                            to={`/remove/${currencyA === ETHER ? WETH(chainId).address : currencyIdA}/${currencyB === ETHER ? WETH(chainId).address : currencyIdB
                              }`}
                          >
                            Receive WKLAY
                          </StyledInternalLink>
                        ) : oneCurrencyIsWETH ? (
                          <StyledInternalLink
                            to={`/remove/${currencyA && currencyEquals(currencyA, WETH(chainId)) ? 'KLAY' : currencyIdA
                              }/${currencyB && currencyEquals(currencyB, WETH(chainId)) ? 'KLAY' : currencyIdB}`}
                          >
                            Receive KLAY
                          </StyledInternalLink>
                        ) : null}
                      </Flex>
                    ) : null}
                  </Flex>

                  <Flex alignItems="center" justifyContent="space-between" mb="32px">
                    <Flex alignItems="center">
                      <CurrencyLogo size="32px" currency={currencyA}/>
                      <Text textStyle="R_16R" color={ColorStyles.BLACK} ml="10px" id="remove-liquidity-tokena-symbol">
                        {currencyA?.symbol}
                      </Text>
                    </Flex>
                    <Text>{formattedAmounts[Field.CURRENCY_A] || '-'}</Text>
                  </Flex>
                  <Flex alignItems="center" justifyContent="space-between">
                    <Flex alignItems="center">
                      <CurrencyLogo size="32px" currency={currencyB}/>
                      <Text textStyle="R_16R" color={ColorStyles.BLACK} ml="10px" id="remove-liquidity-tokenb-symbol">
                        {currencyB?.symbol}
                      </Text>
                    </Flex>
                    <Text>{formattedAmounts[Field.CURRENCY_B] || '-'}</Text>
                  </Flex>
                </Flex>
              </>
            )}

            {showDetailed && (
              <>
                <Flex flexDirection="column">
                  <Flex alignItems="center" mb="16px">
                    <Box mr="10px">
                      <DoubleCurrencyLogo size={32} currency0={currencyA} currency1={currencyB}/>
                    </Box>
                    <Text textStyle="R_16M" color={ColorStyles.DEEPGREY}>
                      {currencyA?.symbol}-{currencyB?.symbol}
                    </Text>
                  </Flex>

                  <Flex
                    width="100%"
                    borderRadius="8px"
                    border="solid 1px #e0e0e0"
                    p="14px 12px 14px 16px"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Text textStyle="R_14M" color={ColorStyles.BLACK}>
                      {formattedAmounts[Field.LIQUIDITY].length > 0 ? formattedAmounts[Field.LIQUIDITY] : 0}
                    </Text>
                    <Flex>
                      <AnountButton onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '25')} mr="6px">
                        25%
                      </AnountButton>
                      <AnountButton onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '50')} mr="6px">
                        50%
                      </AnountButton>
                      <AnountButton onClick={() =>onUserInput(Field.LIQUIDITY_PERCENT, '100')}>
                        MAX
                      </AnountButton>
                    </Flex>
                  </Flex>
                </Flex>

                {/* <CurrencyInputPanel
                  value={formattedAmounts[Field.LIQUIDITY]}
                  onUserInput={onLiquidityInput}
                  onMax={() => {
                    onUserInput(Field.LIQUIDITY_PERCENT, '100')
                  }}
                  onQuarter={() => {
                    onUserInput(Field.LIQUIDITY_PERCENT, '25')
                  }}
                  onHalf={() => {
                    onUserInput(Field.LIQUIDITY_PERCENT, '50')
                  }}
                  showMaxButton={!atMaxAmount}
                  disableCurrencySelect
                  currency={pair?.liquidityToken}
                  pair={pair}
                  id="liquidity-amount"
                /> */}

                <Flex justifyContent="center">
                  <ArrowDown size="16"/>
                </Flex>

                <CurrencyInputPanel
                  hideBalance
                  value={formattedAmounts[Field.CURRENCY_A]}
                  onUserInput={onCurrencyAInput}
                  onMax={() => onUserInput(Field.LIQUIDITY_PERCENT, '100')}
                  onHalf={() => onUserInput(Field.LIQUIDITY_PERCENT, '50')}
                  onQuarter={() => onUserInput(Field.LIQUIDITY_PERCENT, '25')}
                  showMaxButton={!atMaxAmount}
                  currency={currencyA}
                  label="Output"
                  onCurrencySelect={handleSelectCurrencyA}
                  id="remove-liquidity-tokena"
                  className="mb-4"
                />

                <Flex justifyContent="center">
                  <Plus size="16"/>
                </Flex>

                <CurrencyInputPanel
                  hideBalance
                  value={formattedAmounts[Field.CURRENCY_B]}
                  onUserInput={onCurrencyBInput}
                  onMax={() => onUserInput(Field.LIQUIDITY_PERCENT, '100')}
                  showMaxButton={!atMaxAmount}
                  currency={currencyB}
                  label="Output"
                  onCurrencySelect={handleSelectCurrencyB}
                  id="remove-liquidity-tokenb"
                />
              </>
            )}

            <Flex>
              {!account ? (
                <ConnectWalletButton />
              ) : (
                <Flex flexDirection="column" width="100%" mt="32px">
                  <Flex justifyContent="space-between" mb="16px">
                    <Flex alignItems="center">
                      <Box mr="10px">
                        <DoubleCurrencyLogo size={32} currency0={currencyA} currency1={currencyB}/>
                      </Box>
                      <Text textStyle="R_18M" color={ColorStyles.BLACK}>
                        {currencyA?.symbol}-{currencyB?.symbol}
                      </Text>
                    </Flex>
                    <Button
                      onClick={onAttemptToApprove}
                      disabled={approval !== ApprovalState.NOT_APPROVED || signatureData !== null}
                      textStyle="R_14B"
                      scale={ButtonScales.LG}
                      width="186px"
                    >
                      {approval === ApprovalState.PENDING ? (
                        <Dots>Approving</Dots>
                      ) : approval === ApprovalState.APPROVED || signatureData !== null ? (
                        t('Approved to LP')
                      ) : (
                        'Approve'
                      )}
                    </Button>
                  </Flex>
                  
                  <Button
                    onClick={() => {
                      setShowConfirm(true)
                    }}
                    disabled={!isValid || (signatureData === null && approval !== ApprovalState.APPROVED)}
                    scale={ButtonScales.LG}
                    width="100%"
                    textStyle="R_16B"
                  >
                    {error || 'Remove'}
                  </Button>

                  <Noti type={NotiType.ALERT} mt="12px">
                    Error message
                  </Noti>
                </Flex>
              )}
            </Flex>

            {pair && (
              <Flex flexDirection="column" width="100%" mt="24px">
                <Text textStyle="R_16M" color={ColorStyles.DEEPGREY} mb="12px">
                  {t('Estimated Returns')}
                </Text>
                <Flex justifyContent="space-between">
                  <Text textStyle="R_14R" color={ColorStyles.MEDIUMGREY}>
                    {t('Price Rate')}
                  </Text>
                  <Flex flexDirection="column">
                    <Text textStyle="R_14M" color={ColorStyles.DEEPGREY}>
                      1 {currencyA?.symbol} = {tokenA ? pair.priceOf(tokenA).toSignificant(6) : '-'}{' '}
                      {currencyB?.symbol}
                    </Text>
                    <Text textStyle="R_14M" color={ColorStyles.DEEPGREY}>
                      1 {currencyB?.symbol} = {tokenB ? pair.priceOf(tokenB).toSignificant(6) : '-'}{' '}
                      {currencyA?.symbol}
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
            )}
          </CardBody>

          
        </Flex>
      </Flex>

        <TransactionConfirmationModal
          isOpen={showConfirm}
          isPending={!!attemptingTxn}
          isSubmitted={!!txHash}
          isError={!!errorMsg}
          confirmContent={() => (
            <ConfirmationModalContent
              mainTitle="Confirm Liquidity"
              title="You will receive"
              topContent={modalHeader}
              bottomContent={modalBottom}
            />
          )}
          submittedContent={() => <div />}
          errorContent={errorContent}
          onDismiss={handleDismissConfirmation}
        />
    </>
  )
}
const isKlipConnector = (connector) => connector instanceof KlipConnector
