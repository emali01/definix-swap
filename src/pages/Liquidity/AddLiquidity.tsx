import React, { useCallback, useMemo, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import Caver from 'caver-js'
import { BigNumber } from '@ethersproject/bignumber'
import { KlipModalContext } from '@sixnetwork/klaytn-use-wallet'
import { abi as IUniswapV2Router02ABI } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import { ethers } from 'ethers'
import { 
  ColorStyles,
  Flex,
  CardBody,
  Box,
  PlusIcon,
  Text,
  Button,
  ButtonScales,
  CheckBIcon,
  NotiType,
  Noti,
  useMatchBreakpoints,
  useModal
} from 'definixswap-uikit';
import tp from 'tp-js-sdk'
import { Currency, currencyEquals, TokenAmount, WETH, ETHER } from 'definixswap-sdk';
import { Field } from 'state/mint/actions'
import { useTransactionAdder } from 'state/transactions/hooks'
import { KlipConnector } from "@sixnetwork/klip-connector"
import { useCaverJsReact } from '@sixnetwork/caverjs-react-core';
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { currencyId } from 'utils/currencyId';
import {sendAnalyticsData} from 'utils/definixAnalytics'

import numeral from 'numeral'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { PairState } from 'data/Reserves'
import { MinimalPositionCard } from 'components/PositionCard';
import { useActiveWeb3React } from 'hooks';
import UseDeParam from 'hooks/useDeParam'
import { KlaytnTransactionResponse } from 'state/transactions/actions'
import { useIsExpertMode, useUserDeadline, useUserSlippageTolerance } from 'state/user/hooks';
import { useDerivedMintInfo, useMintActionHandlers, useMintState } from 'state/mint/hooks';
import { ROUTER_ADDRESS } from 'constants/index';
import farms from 'constants/farm'
import { useHistory, useParams } from 'react-router';
import { calculateGasMargin, calculateSlippageAmount, getRouterContract } from 'utils';
import { wrappedCurrency } from 'utils/wrappedCurrency'
import { useCurrency } from 'hooks/Tokens';
import * as klipProvider from 'hooks/KlipProvider'
import { getAbiByName } from 'hooks/HookHelper';

import CurrencyLogo from 'components/CurrencyLogo';
import { Dots } from 'components/swap/styleds'
import ConnectWalletButton from 'components/ConnectWalletButton'
import CurrencyInputPanel from 'components/CurrencyInputPanel';

import NoLiquidity from './NoLiquidity';
import { PoolPriceBar } from './PoolPriceBar';
import ConfirmAddModal from './ConfirmAddModal';


const isKlipConnector = (connector) => connector instanceof KlipConnector;

const AddLiquidity: React.FC = () => {
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm
  const [txHash, setTxHash] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string>('')
  const { setShowModal } = useContext(KlipModalContext())
  const history = useHistory();
  const { currencyIdA, currencyIdB } = useParams<{currencyIdA: string; currencyIdB: string;}>();
  const { connector } = useCaverJsReact()
  const currencyA = useCurrency(currencyIdA)
  const currencyB = useCurrency(currencyIdB)
  const { chainId, account, library } = useActiveWeb3React()
  const expertMode = useIsExpertMode()
  const { isXl, isXxl } = useMatchBreakpoints()
  const isMobile = useMemo(() => !isXl && !isXxl, [isXl, isXxl])
  const { t } = useTranslation(); 
  const [deadline] = useUserDeadline()
  const [allowedSlippage] = useUserSlippageTolerance()
  const addTransaction = useTransactionAdder();

  const {
    currencyBalances,
    dependentField,
    currencies,
    pair,
    pairState,
    parsedAmounts,
    price,
    noLiquidity,
    poolTokenPercentage,
    liquidityMinted,
    error
  } = useDerivedMintInfo(currencyA ?? undefined, currencyB ?? undefined)
  const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noLiquidity)
  const isValid = useMemo(() => !error, [error]);

  const { independentField, typedValue, otherTypedValue } = useMintState()

  const [approvalA, approveACallback] = useApproveCallback(parsedAmounts[Field.CURRENCY_A], ROUTER_ADDRESS[chainId || parseInt(process.env.REACT_APP_CHAIN_ID || '0')])
  const [approvalB, approveBCallback] = useApproveCallback(parsedAmounts[Field.CURRENCY_B], ROUTER_ADDRESS[chainId || parseInt(process.env.REACT_APP_CHAIN_ID || '0')])
  const formattedAmounts = useMemo(() => {
    return (
      {
        [independentField]: typedValue,
        [dependentField]: noLiquidity ? otherTypedValue : parsedAmounts[dependentField]?.toSignificant(6) ?? ''
      }
    )
  }, [noLiquidity, independentField, dependentField, typedValue, parsedAmounts, otherTypedValue]);

  const maxAmounts: { [field in Field]?: TokenAmount } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmountSpend(currencyBalances[field])
      }
    },
    {}
  )

  const atMaxAmounts: { [field in Field]?: TokenAmount } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmounts[field]?.equalTo(parsedAmounts[field] ?? '0')
      }
    },
    {}
  )

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

  const handleDismissConfirmation = useCallback(() => {
    if (txHash) {
      onFieldAInput('')
    }
    setTxHash('')
    setErrorMsg('')
  }, [onFieldAInput, txHash])

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

  const [onPresentConfirmAddModal] = useModal(<ConfirmAddModal
    noLiquidity={noLiquidity}
    currencies={currencies}
    liquidityMinted={liquidityMinted}
    price={price}
    parsedAmounts={parsedAmounts}
    onAdd={onAdd}
    poolTokenPercentage={poolTokenPercentage}
    allowedSlippage={allowedSlippage} />);

  const handleCurrencyASelect = useCallback(
    (currA: Currency) => {
      const newCurrencyIdA = currencyId(currA)
      if (newCurrencyIdA === currencyIdB) {
        history.push(`/liquidity/add/${currencyIdB}/${currencyIdA}`)
      } else {
        history.push(`/liquidity/add/${newCurrencyIdA}/${currencyIdB}`)
      }
    },
    [currencyIdB, history, currencyIdA]
  )
  const handleCurrencyBSelect = useCallback(
    (currB: Currency) => {
      const newCurrencyIdB = currencyId(currB)
      if (currencyIdA === newCurrencyIdB) {
        if (currencyIdB) {
          history.push(`/liquidity/add/${currencyIdB}/${newCurrencyIdB}`)
        } else {
          history.push(`/liquidity/add/${newCurrencyIdB}`)
        }
      } else {
        history.push(`/liquidity/add/${currencyIdA || 'KLAY'}/${newCurrencyIdB}`)
      }
    },
    [currencyIdA, history, currencyIdB]
  )

  const oneCurrencyIsWETH = Boolean(
    chainId &&
    ((currencyA && currencyEquals(currencyA, WETH(chainId))) ||
      (currencyB && currencyEquals(currencyB, WETH(chainId))))
  )

  return (
    <>
      <Flex 
        flexDirection="column"
        backgroundColor={ColorStyles.WHITE}
        borderRadius="16px"
        mb="12px"
      >
        {!noLiquidity && (
          <NoLiquidity />
        )}
        <CardBody>
          <Flex flexDirection="column">
            <CurrencyInputPanel
              isMobile={isMobile}
              value={formattedAmounts[Field.CURRENCY_A]}
              onUserInput={onFieldAInput}
              onMax={() => {
                onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
              }}
              onQuarter={() => {
                onFieldAInput(
                  numeral(parseFloat(maxAmounts[Field.CURRENCY_A]?.toExact() || '') / 4).format('0.00') ?? ''
                )
              }}
              onHalf={() => {
                onFieldAInput(
                  numeral(parseFloat(maxAmounts[Field.CURRENCY_A]?.toExact() || '') / 2).format('0.00') ?? ''
                )
              }}
              onCurrencySelect={handleCurrencyASelect}
              showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
              currency={currencies[Field.CURRENCY_A]}
              id="add-liquidity-input-tokena"
              showCommonBases={false}
            />
              <Flex width="100%" justifyContent="center">
                <Box p="14px">
                  <PlusIcon />
                </Box>
              </Flex>

            <CurrencyInputPanel
              isMobile={isMobile}
              value={formattedAmounts[Field.CURRENCY_B]}
              onUserInput={onFieldBInput}
              onCurrencySelect={handleCurrencyBSelect}
              onMax={() => {
                onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '')
              }}
              onQuarter={() => {
                onFieldBInput(
                  numeral(parseFloat(maxAmounts[Field.CURRENCY_B]?.toExact() || '') / 4).format('0.00') ?? ''
                )
              }}
              onHalf={() => {
                onFieldBInput(
                  numeral(parseFloat(maxAmounts[Field.CURRENCY_B]?.toExact() || '') / 2).format('0.00') ?? ''
                )
              }}
              showMaxButton={!atMaxAmounts[Field.CURRENCY_B]}
              currency={currencies[Field.CURRENCY_B]}
              id="add-liquidity-input-tokenb"
              showCommonBases={false}
            />
          </Flex>

          <Box width="100%" height="1px" m="32px 0" backgroundColor={ColorStyles.LIGHTGREY} />

          <Box>
            {!account ? (
              <ConnectWalletButton />
            ) : (
              <Flex flexDirection="column">
                {(approvalA === ApprovalState.NOT_APPROVED ||
                  approvalA === ApprovalState.PENDING ||
                  approvalB === ApprovalState.NOT_APPROVED ||
                  approvalB === ApprovalState.PENDING) &&
                  isValid && (
                    <Flex flexDirection="column" mb="16px">
                      <Flex 
                        flexDirection={isMobile ? "column" : "row"}
                        justifyContent="space-between"
                        alignItems={isMobile ? "flex-start" : "center"}
                        mb="8px"
                      >
                          <Flex alignItems="center">
                            <CurrencyLogo currency={currencies[Field.CURRENCY_A]} size="32px" />
                            <Text ml="12px" textStyle="R_16M" color={ColorStyles.MEDIUMGREY}>{currencies[Field.CURRENCY_A]?.symbol}</Text>
                          </Flex>

                          {approvalA === ApprovalState.APPROVED && ( <Button
                            scale={ButtonScales.LG}
                            onClick={approveBCallback}
                            disabled
                            width="186px"
                            textStyle="R_14B"
                            color={ColorStyles.MEDIUMGREY}
                            variant="line"
                          >
                            <Box style={{opacity: 0.5}} mt="4px">
                              <CheckBIcon />
                            </Box>
                            <Text ml="6px">
                              {t('Approved to')} {currencies[Field.CURRENCY_A]?.symbol}
                            </Text>
                          </Button> )}

                          {approvalA !== ApprovalState.APPROVED && (<Button
                            scale={ButtonScales.LG}
                            onClick={approveACallback}
                            disabled={approvalA === ApprovalState.PENDING}
                            width="186px"
                          >
                            {approvalA === ApprovalState.PENDING ? (
                              <Dots>{t('Approving')} {currencies[Field.CURRENCY_A]?.symbol}</Dots>
                            ) : (
                              `${t('Approve')} ${currencies[Field.CURRENCY_A]?.symbol}`
                            )}
                          </Button>)}
                      </Flex>

                      <Flex 
                        flexDirection={isMobile ? "column" : "row"}
                        justifyContent="space-between"
                        alignItems={isMobile ? "flex-start" : "center"}
                      >
                          <Flex alignItems="center">
                            <CurrencyLogo currency={currencies[Field.CURRENCY_B]} size="32px" />
                            <Text ml="12px" textStyle="R_16M" color={ColorStyles.MEDIUMGREY}>{currencies[Field.CURRENCY_B]?.symbol}</Text>
                          </Flex>
                          
                          {approvalB === ApprovalState.APPROVED && ( <Button
                            scale={ButtonScales.LG}
                            onClick={approveBCallback}
                            disabled
                            width="186px"
                            textStyle="R_14B"
                            color={ColorStyles.MEDIUMGREY}
                            variant="line"
                          >
                            <Box style={{opacity: 0.5}} mt="4px">
                              <CheckBIcon />
                            </Box>
                            <Text ml="6px">
                              {t('Approved to')} {currencies[Field.CURRENCY_B]?.symbol}
                            </Text>
                          </Button> )}

                          {approvalB !== ApprovalState.APPROVED && ( <Button
                            scale={ButtonScales.LG}
                            onClick={approveBCallback}
                            disabled={approvalB === ApprovalState.PENDING}
                            width="186px"
                          >
                            {approvalB === ApprovalState.PENDING ? (
                              <Dots>Approving {currencies[Field.CURRENCY_B]?.symbol}</Dots>
                            ) : (
                              `${t('Approve to')} ${currencies[Field.CURRENCY_B]?.symbol}`
                            )}
                          </Button>)}
                      </Flex>
                    </Flex>
                  )}
                <Button
                  onClick={() => {
                    if (expertMode) {
                      onAdd()
                    } else {
                      onPresentConfirmAddModal();
                    }
                  }}
                  disabled={
                    !isValid || approvalA !== ApprovalState.APPROVED || approvalB !== ApprovalState.APPROVED
                  }
                  variant={
                    !isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]
                      ? 'danger'
                      : 'primary'
                  }
                  width="100%"
                  scale={ButtonScales.LG}
                >
                  {error ?? t('Supply')}
                </Button>
              </Flex>
            )}
          </Box>

          {error && (
            <Noti type={NotiType.ALERT} mt="12px">
              {t('Error message')}
            </Noti>)
          }

          <Box mt="24px">
            {currencies[Field.CURRENCY_A] && currencies[Field.CURRENCY_B] && pairState !== PairState.INVALID && (
              <Box>
                <Text textStyle="R_16M" color={ColorStyles.DEEPGREY} mb="12px">
                  {noLiquidity ? t('Initial Prices and Pool Share') : t('Estimated Returns')}
                </Text>
                <PoolPriceBar
                  currencies={currencies}
                  poolTokenPercentage={poolTokenPercentage}
                  noLiquidity={noLiquidity}
                  price={price}
                />
              </Box>
            )}
          </Box>
        </CardBody>
      </Flex>

      {pair && !noLiquidity && pairState !== PairState.INVALID ? (
        <Box mb={isMobile ? "40px" : "80px"}>
          <MinimalPositionCard showUnwrapped={oneCurrencyIsWETH} pair={pair} />
        </Box>
      ) : null}
    </>
  )
}

export default React.memo(AddLiquidity);