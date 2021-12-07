import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { RouteComponentProps } from 'react-router-dom'
import numeral from 'numeral'
import { CurrencyAmount, JSBI, Trade, Token } from 'definixswap-sdk'
import { AutoColumn } from 'components/Column'
import ConnectWalletButton from 'components/ConnectWalletButton'
import CurrencyInputPanel from 'components/CurrencyInputPanel'
import Loader from 'components/Loader'
import { AutoRow, RowBetween } from 'components/Row'
import { LinkStyledButton } from 'components/Shared'
import AdvancedSwapDetailsDropdown from 'components/swap/AdvancedSwapDetailsDropdown'
import confirmPriceImpactWithoutFee from 'components/swap/confirmPriceImpactWithoutFee'
import ConfirmSwapModal from 'components/swap/ConfirmSwapModal'
import { ArrowWrapper } from 'components/swap/styleds'
import TradePrice from 'components/swap/TradePrice'
import SyrupWarningModal from 'components/SyrupWarningModal'
import TokenWarningModal from 'components/TokenWarningModal'
import { useActiveWeb3React } from 'hooks'
import { ApprovalState, useApproveCallbackFromTrade } from 'hooks/useApproveCallback'
import { useSwapCallback } from 'hooks/useSwapCallback'
import useWrapCallback, { WrapType } from 'hooks/useWrapCallback'
import { useCurrency } from 'hooks/Tokens'
import { Field } from 'state/swap/actions'
import { SWAP_STATE, useDefaultsFromURLSearch, useDerivedSwapInfo, useSwapActionHandlers, useSwapState } from 'state/swap/hooks'
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
} from 'definixswap-uikit'

// import { Overlay } from 'uikit-dev/components/Overlay'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { computeTradePriceBreakdown, warningSeverity } from 'utils/prices'
import { SwapContainer, CardContainer } from 'components/Layout'
import CurrencyLogo from 'components/CurrencyLogo'
import {
  SIX_ADDRESS,
  FINIX_ADDRESS,
  KSP_ADDRESS,
  KDAI_ADDRESS,
  KUSDT_ADDRESS,
  WKLAY_ADDRESS,
  KBNB_ADDRESS,
  KXRP_ADDRESS,
  KETH_ADDRESS,
  KWBTC_ADDRESS,
} from '../../constants'
import TimerWrapper from './TimerWrapper'

const WrapTop = styled(Flex)`
  flex-direction: column;
  margin-bottom: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

const WrapCardContainer = styled(CardContainer)`
  margin-top: 40px;
  ${({ theme }) => theme.mediaQueries.mobile} {
    margin-bottom: 28px;
  }
`

export default function Swap({
  match: {
    params: { currencyIdA, currencyIdB },
  },
  history,
}: RouteComponentProps<{ currencyIdA?: string; currencyIdB?: string }>) {
  const { t } = useTranslation();
  const { isXl, isXxl } = useMatchBreakpoints()
  const isMobile = useMemo(() => !isXl && !isXxl, [isXl, isXxl])
  const loadedUrlParams = useDefaultsFromURLSearch()

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId),
  ]
  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false)
  const [isSyrup, setIsSyrup] = useState<boolean>(false)
  const [syrupTransactionType, setSyrupTransactionType] = useState<string>('')
  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c instanceof Token) ?? [],
    [loadedInputCurrency, loadedOutputCurrency]
  )
  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
  }, [])

  const handleConfirmSyrupWarning = useCallback(() => {
    setIsSyrup(false)
    setSyrupTransactionType('')
  }, [])

  const [isPhrase2, setIsPhrase2] = useState(false)
  const phrase2TimeStamp = process.env.REACT_APP_PHRASE_2_TIMESTAMP
    ? parseInt(process.env.REACT_APP_PHRASE_2_TIMESTAMP || '', 10) || new Date().getTime()
    : new Date().getTime()
  const currentTime = new Date().getTime()
  useEffect(() => {
    if (currentTime < phrase2TimeStamp) {
      setTimeout(() => {
        setIsPhrase2(true)
      }, phrase2TimeStamp - currentTime)
    } else {
      setIsPhrase2(true)
    }
  }, [currentTime, phrase2TimeStamp])

  const { account, chainId = '' } = useActiveWeb3React()

  const [isExpertMode] = useExpertModeManager()

  // get custom setting values for user
  const [deadline] = useUserDeadline()
  const [allowedSlippage] = useUserSlippageTolerance()

  // swap state
  const { independentField, typedValue, recipient } = useSwapState()
  const { v2Trade, currencyBalances, parsedAmount, currencies, inputError: swapInputError, swapState } = useDerivedSwapInfo()
  const { wrapType, execute: onWrap, inputError: wrapInputError } = useWrapCallback(
    currencies[Field.INPUT],
    currencies[Field.OUTPUT],
    typedValue
  )
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
  const trade = v2Trade

  const parsedAmounts = showWrap
    ? {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount,
      }
    : {
        [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
        [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
      }

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()
  const isValid = !swapInputError
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

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

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ''
      : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  const route = trade?.route
  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  )
  const noRoute = !route

  // check whether the user has approved the router on the input token
  const [approval, approveCallback] = useApproveCallbackFromTrade(chainId, trade, allowedSlippage)

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted])

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))

  // the callback to execute the swap
  const { error: swapCallbackError } = useSwapCallback(
    trade,
    allowedSlippage,
    deadline,
    recipient
  )

  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)

  // warnings on slippage
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !swapInputError &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3 && !isExpertMode)

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

  // This will check to see if the user has selected Syrup to either buy or sell.
  // If so, they will be alerted with a warning message.
  const checkForSyrup = useCallback(
    (selected: string, purchaseType: string) => {
      if (selected === 'syrup') {
        setIsSyrup(true)
        setSyrupTransactionType(purchaseType)
      }
    },
    [setIsSyrup, setSyrupTransactionType]
  )

  const handleInputSelect = useCallback(
    (inputCurrency) => {
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency)
      if (inputCurrency.symbol.toLowerCase() === 'syrup') {
        checkForSyrup(inputCurrency.symbol.toLowerCase(), 'Selling')
      }
    },
    [onCurrencySelection, setApprovalSubmitted, checkForSyrup]
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
      if (outputCurrency.symbol.toLowerCase() === 'syrup') {
        checkForSyrup(outputCurrency.symbol.toLowerCase(), 'Buying')
      }
    },
    [onCurrencySelection, checkForSyrup]
  )

  const [onPresentConfirmModal] = useModal(<ConfirmSwapModal
    recipient={recipient}
    onDismissModal={handleConfirmDismiss}
  />, false)

  const onClickSwapButton = useCallback(() => {
    // if (isExpertMode) return
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

  return (
    <TimerWrapper isPhrase2={!(currentTime < phrase2TimeStamp && isPhrase2 === false)} date={phrase2TimeStamp}>
      <Flex flexDirection="column" alignItems="center">
        <SwapContainer isMobile={isMobile}>
          <TitleSet
            title={t("Swap")}
            description={t('Swap it for any token')}
            link="https://sixnetwork.gitbook.io/definix-on-klaytn-en/exchange/how-to-trade-on-definix-exchange"
            linkLabel={t('Learn how to Swap')}
          />
          <WrapCardContainer isMobile={isMobile}>
            <WrapTop>
              <Flex flexDirection="column">
                <CurrencyInputPanel
                  isMobile={isMobile}
                  className="mb-s20"
                  label="From"
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
                          setApprovalSubmitted(false) // reset 2 step UI for approvals
                          onSwitchTokens()
                        }}
                      >
                        <ChangeIcon />
                      </IconButton>
                    </ArrowWrapper>
                    
                    {recipient === null && !showWrap && isExpertMode ? (
                      <LinkStyledButton id="add-recipient-button" onClick={() => onChangeRecipient('')}>
                        + Add a send (optional)
                      </LinkStyledButton>
                    ) : null}
                  </AutoRow>
                </AutoColumn>

                <CurrencyInputPanel
                  isMobile={isMobile}
                  className="mb-s20"
                  value={formattedAmounts[Field.OUTPUT]}
                  onUserInput={handleTypeOutput}
                  label="To"
                  showMaxButton={false}
                  currency={currencies[Field.OUTPUT]}
                  onCurrencySelect={handleOutputSelect}
                  otherCurrency={currencies[Field.INPUT]}
                  id="swap-currency-output"
                />
              </Flex>

              {/* (Boolean(trade) || allowedSlippage !== INITIAL_ALLOWED_SLIPPAGE) && */}
              {!showWrap && (
                <Flex mb="32px">
                  {/* 슬리피지 발생 시 */}
                  {/* {allowedSlippage !== INITIAL_ALLOWED_SLIPPAGE && ( */}
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

              {/* 영수증 발행 */}
              {/* {recipient !== null && !showWrap ? (
                <>
                  <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
                    <ArrowWrapper clickable={false}>
                      <ArrowDown size="16" color={theme.colors.textSubtle} />
                    </ArrowWrapper>
                    <LinkStyledButton id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
                      - Remove send
                    </LinkStyledButton>
                  </AutoRow>
                  <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
                </>
              ) : null} */}
            </WrapTop>

            {/* 하단 버튼 및 스왑 정보 */}
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

                {/* {showApproveFlow && <ProgressSteps steps={[approval === ApprovalState.APPROVED]} />} */}
                {/* {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null} */}
              </Flex>

              

              {/* 라우팅 및 기타 스왑 정보 */}
              {trade && (
                <Flex flexDirection="column" mt="24px">
                  {/* Price Rate 화면 */}
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
          </WrapCardContainer>
        </SwapContainer>
      </Flex>

      {/* 스왑 히스토리 화면 */}
      {/* <SwapHistory 
        isShowRightPanel={isShowRightPanel}
        showConfirm={showConfirm}
        setIsShowRightPanel={setIsShowRightPanel}
        sortedRecentTransactions={sortedRecentTransactions}
        allTokens={allTokens}
        wklay={wklay}
        chainId={chainId}
      /> */}

      <TokenWarningModal
        isOpen={
          urlLoadedTokens.filter(
            (x) =>
              x.address.toLowerCase() !== SIX_ADDRESS[chainId].toLowerCase() &&
              x.address.toLowerCase() !== FINIX_ADDRESS[chainId].toLowerCase() &&
              x.address.toLowerCase() !== KSP_ADDRESS[chainId].toLowerCase() &&
              x.address.toLowerCase() !== KDAI_ADDRESS[chainId].toLowerCase() &&
              x.address.toLowerCase() !== KUSDT_ADDRESS[chainId].toLowerCase() &&
              x.address.toLowerCase() !== WKLAY_ADDRESS[chainId].toLowerCase() &&
              x.address.toLowerCase() !== KBNB_ADDRESS[chainId].toLowerCase() &&
              x.address.toLowerCase() !== KXRP_ADDRESS[chainId].toLowerCase() &&
              x.address.toLowerCase() !== KETH_ADDRESS[chainId].toLowerCase() &&
              x.address.toLowerCase() !== KWBTC_ADDRESS[chainId].toLowerCase()
          ).length > 0 && !dismissTokenWarning
        }
        tokens={urlLoadedTokens}
        onConfirm={handleConfirmTokenWarning}
      />

      <SyrupWarningModal
        isOpen={isSyrup}
        transactionType={syrupTransactionType}
        onConfirm={handleConfirmSyrupWarning}
      />

    </TimerWrapper>
  )
}
