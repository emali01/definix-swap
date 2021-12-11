import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import numeral from 'numeral'
import { CurrencyAmount, JSBI, Trade } from 'definixswap-sdk'
import { AutoColumn } from 'components/Column'
import ConnectWalletButton from 'components/ConnectWalletButton'
import CurrencyInputPanel from 'components/CurrencyInputPanel'
import Loader from 'components/Loader'
import { AutoRow, RowBetween } from 'components/Row'
import AdvancedSwapDetailsDropdown from 'components/swap/AdvancedSwapDetailsDropdown'
import ConfirmSwapModal from 'components/swap/ConfirmSwapModal'
import { ArrowWrapper } from 'components/swap/styleds'
import TradePrice from 'components/swap/TradePrice'
import { useActiveWeb3React } from 'hooks'
import { ApprovalState, useApproveCallbackFromTrade } from 'hooks/useApproveCallback'
import { useSwapCallback } from 'hooks/useSwapCallback'
import useWrapCallback, { WrapType } from 'hooks/useWrapCallback'
import { Field } from 'state/swap/actions'
import { SWAP_STATE, useDerivedSwapInfo, useSwapActionHandlers, useSwapState } from 'state/swap/hooks'
import { useExpertModeManager, useUserDeadline, useUserSlippageTolerance } from 'state/user/hooks'

import {
  Button,
  IconButton,
  Text,
  useMatchBreakpoints,
  useModal,
  Flex,
  TitleSet,
  ButtonScales,
  ColorStyles,
  ChangeIcon,
  ButtonVariants,
  Noti,
  NotiType,
  Box,
} from 'definixswap-uikit-v2'

import { maxAmountSpend } from 'utils/maxAmountSpend'
import { computeTradePriceBreakdown, warningSeverity } from 'utils/prices'
import CurrencyLogo from 'components/CurrencyLogo'
import { useToast } from 'state/toasts/hooks'
import { useAllTokens } from 'hooks/Tokens'
import { allTokenAddresses } from 'constants/index';

const Swap: React.FC = () => {
  const { t } = useTranslation();
  const { isXl, isXxl } = useMatchBreakpoints()
  const isMobile = useMemo(() => !isXl && !isXxl, [isXl, isXxl])
 
  const { account, chainId = '' } = useActiveWeb3React()

  const [isExpertMode] = useExpertModeManager()

  const [deadline] = useUserDeadline()
  const [allowedSlippage] = useUserSlippageTolerance()

  const { independentField, typedValue, recipient } = useSwapState()
  const { v2Trade, currencyBalances, parsedAmount, currencies, inputError: swapInputError, swapState } = useDerivedSwapInfo()
  const { wrapType, execute: onWrap, inputError: wrapInputError } = useWrapCallback(
    currencies[Field.INPUT],
    currencies[Field.OUTPUT],
    typedValue
  )
  const showWrap: boolean = useMemo(() => wrapType !== WrapType.NOT_APPLICABLE, [wrapType]);
  const trade: Trade = useMemo(() => v2Trade, [v2Trade]);

  const parsedAmounts = useMemo(() => showWrap
    ? {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount,
      }
    : {
        [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
        [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
      }
    , [independentField, parsedAmount, showWrap, trade?.inputAmount, trade?.outputAmount]);

  const { onSwitchTokens, onCurrencySelection, onUserInput } = useSwapActionHandlers()
  const isValid = useMemo(() => !swapInputError, [swapInputError]);
  const dependentField: Field = useMemo(() => independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT, [independentField]);

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput]
  )
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput]
  )

  const formattedAmounts = useMemo(() => {
    return {
      [independentField]: typedValue,
      [dependentField]: showWrap
        ? parsedAmounts[independentField]?.toExact() ?? ''
        : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
    }
  }, [dependentField, independentField, parsedAmounts, showWrap, typedValue]);

  const route = useMemo(() => trade?.route, [trade?.route]);
  const userHasSpecifiedInputOutput = useMemo(() => Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  ), [currencies, independentField, parsedAmounts]);

  const noRoute = useMemo(() => !route, [route]);

  const [approval, approveCallback, approveErr, setApproveErr] = useApproveCallbackFromTrade(chainId, trade, allowedSlippage)

  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)
  const { toastError } = useToast();

  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted])

  useEffect(() => {
    if(approveErr){
      toastError(t('{{Action}} Failed', {
        Action: t('Approve')
      }));
      setApproveErr('');
    }
  }, [approveErr, setApproveErr, t, toastError])

  const maxAmountInput: CurrencyAmount | undefined = useMemo(() => 
    maxAmountSpend(currencyBalances[Field.INPUT])
    , [currencyBalances]);

  const atMaxAmountInput = useMemo(() => 
    Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput)),
    [maxAmountInput, parsedAmounts]);

  const { error: swapCallbackError } = useSwapCallback(
    trade,
    allowedSlippage,
    deadline,
    recipient
  )

  const { priceImpactWithoutFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade]);
  const priceImpactSeverity = useMemo(() => warningSeverity(priceImpactWithoutFee), [priceImpactWithoutFee]);

  const showApproveFlow = useMemo(() => !swapInputError &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3 && !isExpertMode), 
    [approval, approvalSubmitted, isExpertMode, priceImpactSeverity, swapInputError]);

    const initSwapData = useCallback(() => {
      onUserInput(Field.INPUT, '')
      onUserInput(Field.OUTPUT, '')
      onCurrencySelection(Field.INPUT, '')
      onCurrencySelection(Field.OUTPUT, '')
    }, [onCurrencySelection, onUserInput])

  const handleConfirmDismiss = useCallback(() => {
    onUserInput(Field.INPUT, '')
    initSwapData();
  }, [onUserInput, initSwapData])

  const handleInputSelect = useCallback(
    (inputCurrency) => {
      setApprovalSubmitted(false)
      onCurrencySelection(Field.INPUT, inputCurrency)
    },
    [onCurrencySelection, setApprovalSubmitted]
  )

  const handleMaxInput = useCallback(() => {
    if (maxAmountInput) {
      if (window.localStorage.getItem('connector') === 'klip') {
        const floorDigit = 1000000
        const valueMax = +maxAmountInput.toExact()
        const max = Math.floor(valueMax * floorDigit) / floorDigit
        onUserInput(Field.INPUT, max.toString())
      } else {
        onUserInput(Field.INPUT, maxAmountInput.toExact())
      }
    }
  }, [maxAmountInput, onUserInput])

  const handleQuarterInput = useCallback(() => {
    if (maxAmountInput) {
      onUserInput(Field.INPUT, numeral(parseFloat(maxAmountInput.toExact()) / 4).format('0.00'))
    }
  }, [maxAmountInput, onUserInput])

  const handleHalfInput = useCallback(() => {
    if (maxAmountInput) {
      onUserInput(Field.INPUT, numeral(parseFloat(maxAmountInput.toExact()) / 2).format('0.00'))
    }
  }, [maxAmountInput, onUserInput])

  const handleOutputSelect = useCallback(
    (outputCurrency) => {
      onCurrencySelection(Field.OUTPUT, outputCurrency)
    },
    [onCurrencySelection]
  )

  const [onPresentConfirmModal] = useModal(
    <ConfirmSwapModal
      recipient={recipient}
      onDismissModal={handleConfirmDismiss}
    />, false)

  const onClickSwapButton = useCallback(() => {
    onPresentConfirmModal();
  }, [onPresentConfirmModal])

  const renderNoti = useCallback(() => {
    if (isExpertMode) return <></>;

    if (priceImpactSeverity > 3) {
      return <Noti type={NotiType.ALERT} mt="12px">
        {t('Price Impact Too High')}
      </Noti>
    }
    if (priceImpactSeverity > 2) {
      return <Noti type={NotiType.ALERT} mt="12px">
        {t('This swap has a price impact of at least 10%')}
      </Noti>
    }
    return <></>
  }, [priceImpactSeverity, isExpertMode, t]);

  const allTokens = useAllTokens()

  useEffect(() => {
    if(chainId){
      handleInputSelect(allTokens[allTokenAddresses.SIX[chainId]]);
    }
  }, [allTokens, chainId, handleInputSelect]);

  return (
    <Flex flexDirection="column" alignItems="center" pb={isMobile ? "40px" : "75px"}>
      <Box
        width={isMobile ? '100%' : '629px'}
      >
        <TitleSet
          title={t("Swap")}
          description={t('Swap it for any token')}
          link="https://sixnetwork.gitbook.io/definix-on-klaytn-en/exchange/how-to-trade-on-definix-exchange"
          linkLabel={t('Learn how to Swap')}
        />
        <Flex 
          flexDirection="column"
          width="100%"
          p={isMobile ? "20px" : "40px"}
          backgroundColor={ColorStyles.WHITE}
          mt={isMobile ? "28px" : "40px"}
          borderRadius="16px"
          border="1px solid #ffedcb"
          style={{boxShadow: '0 12px 12px 0 rgba(254, 169, 72, 0.2)'}}
        >
          <Flex
            flexDirection="column"
            mb="20px"
          >
            <Flex flexDirection="column">
              <CurrencyInputPanel
                isMobile={isMobile}
                value={formattedAmounts[Field.INPUT]}
                showMaxButton={!atMaxAmountInput}
                currency={currencies[Field.INPUT]}
                onUserInput={handleTypeInput}
                onQuarter={handleQuarterInput}
                onHalf={handleHalfInput}
                onMax={handleMaxInput}
                onCurrencySelect={handleInputSelect}
                otherCurrency={currencies[Field.OUTPUT]}
                isInsufficientBalance={swapState === SWAP_STATE.INSUFFICIENT_BALANCE}
                id="swap-currency-input"
              />

              <AutoColumn justify="space-between">
                <AutoRow justify={isExpertMode ? 'space-between' : 'center'} style={{ padding: '0 1rem' }}>
                  <ArrowWrapper clickable>
                    <IconButton
                      onClick={() => {
                        setApprovalSubmitted(false)
                        onSwitchTokens()
                      }}
                    >
                      <ChangeIcon />
                    </IconButton>
                  </ArrowWrapper>
                </AutoRow>
              </AutoColumn>

              <CurrencyInputPanel
                isMobile={isMobile}
                value={formattedAmounts[Field.OUTPUT]}
                onUserInput={handleTypeOutput}
                currency={currencies[Field.OUTPUT]}
                onCurrencySelect={handleOutputSelect}
                otherCurrency={currencies[Field.INPUT]}
                id="swap-currency-output"
                showMaxButton={!atMaxAmountInput}
              />
            </Flex>

            {!showWrap && (
              <Flex mb="32px">
                  <Flex flex="1 1 0" justifyContent="space-between">
                    <Text textStyle="R_14R" color={ColorStyles.MEDIUMGREY}>
                      {t('Slippage Tolerance')}
                    </Text>
                    <Text textStyle="R_14M" color={ColorStyles.DEEPGREY}>
                      {allowedSlippage / 100}%
                    </Text>
                </Flex>
              </Flex>
            )}
          </Flex>

          <Flex flexDirection="column">
            <Flex mb="20px">
              {!account ? (
                <ConnectWalletButton />
              ) : showWrap ? (
                <Button disabled={Boolean(wrapInputError)} onClick={onWrap}>
                  {wrapInputError ??
                    (wrapType === WrapType.WRAP ? 'Wrap' : wrapType === WrapType.UNWRAP ? 'Unwrap' : null)}
                </Button>
              ) : noRoute && userHasSpecifiedInputOutput ? (
                <Button
                  width="100%"
                  lg
                  onClick={onClickSwapButton}
                  id="swap-button"
                  disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError}
                  variant={isValid && priceImpactSeverity > 2 && !swapCallbackError ? 'danger' : 'primary'}
                  isLoading={Boolean(noRoute && userHasSpecifiedInputOutput)}
                >
                  {t('Swap')}
                </Button>
              ) : showApproveFlow ? (
                <RowBetween className="mb-3">

                  <Flex flexDirection="column" flex="1 1 0">

                    <Flex justifyContent="space-between" alignItems="center" flex="1 1 0" mb="20px">
                      <Flex alignItems="center">
                        <CurrencyLogo
                          currency={currencies[Field.INPUT]} 
                          size="32px"
                          style={{marginRight: '12px'}}
                        />
                        <Text textStyle="R_16M" color={ColorStyles.MEDIUMGREY}>
                          {`${currencies[Field.INPUT]?.symbol}`}
                        </Text>
                      </Flex>

                      <Button
                        scale={ButtonScales.MD}
                        onClick={approveCallback}
                        disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                        width="186px"
                        variant={approval === ApprovalState.APPROVED ?  'primary' : ButtonVariants.BROWN}
                      >
                        {approval === ApprovalState.PENDING ? (
                          <AutoRow gap="6px" justify="center">
                            Approving <Loader stroke="white" />
                          </AutoRow>
                        ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
                          'Approved'
                        ) : (
                          `Approve ${currencies[Field.INPUT]?.symbol}`
                        )}
                      </Button>
                    </Flex>

                    <Button
                      width="100%"
                      variant={isValid && priceImpactSeverity > 2 ? 'danger' : 'primary'}
                      scale={ButtonScales.LG}
                      id="swap-button"
                      onClick={onClickSwapButton}
                      disabled={
                        !isValid ||
                        approval !== ApprovalState.APPROVED ||
                        (priceImpactSeverity > 3 && !isExpertMode)
                      }
                    >
                      {priceImpactSeverity > 3 && !isExpertMode
                        ? `Price Impact High`
                        : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
                    </Button>
                  </Flex>

                </RowBetween>
              ) : (
                <Flex flexDirection="column" flex="1">
                  <Button
                    width="100%"
                    lg
                    onClick={onClickSwapButton}
                    id="swap-button"
                    disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError}
                    variant={isValid && priceImpactSeverity > 2 && !swapCallbackError ? 'danger' : 'primary'}
                  >
                    {t('Swap')}
                  </Button>
                  {renderNoti()}
                </Flex>
              )}
            </Flex>

            {trade && (
              <Flex flexDirection="column" mt="24px">
                <Text textStyle={isMobile ? "R_14M" : "R_16M"} color={ColorStyles.DEEPGREY} mb="12px">{t('Estimated Returns')}</Text>

                {Boolean(trade) && (
                  <Flex flex="1 1 0" justifyContent="space-between" mb="12px">
                    <Text textStyle="R_14R" color={ColorStyles.MEDIUMGREY}>
                      {t('Price Rate')}
                    </Text>
                    <TradePrice
                      price={trade?.executionPrice}
                    />
                  </Flex>
                )}
                <AdvancedSwapDetailsDropdown trade={trade} isMobile={isMobile} />
              </Flex>
            )}
          </Flex>
        </Flex>
      </Box>
    </Flex>
  )
}

export default Swap;