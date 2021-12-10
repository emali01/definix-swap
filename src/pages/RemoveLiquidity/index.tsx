import { splitSignature } from '@ethersproject/bytes'
import { Contract } from '@ethersproject/contracts'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { Currency, currencyEquals, ETHER, Percent, WETH } from 'definixswap-sdk'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { RouteComponentProps } from 'react-router'
import { 
  Button,
  CardBody,
  ColorStyles,
  Flex,
  Text,
  Box,
  ButtonScales,
  TitleSet,
  useMatchBreakpoints,
  useModal,
  Divider,
  ChangeBottomIcon,
  ChangePlusIcon,
  ArrowChangeIcon
} from 'definixswap-uikit-v2'
import { useTokenBalance } from 'state/wallet/hooks'
import { useTranslation } from 'react-i18next'
import { useToast } from 'state/toasts/hooks'
import { CurrencyInputPanelOnRemoveLP } from '../../components/CurrencyInputPanel'
import CurrencyLogo from '../../components/CurrencyLogo'
import DoubleCurrencyLogo from '../../components/DoubleLogo'
import { StyledInternalLink } from '../../components/Shared'
import Slider from '../../components/Slider'
import { ROUTER_ADDRESS } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { usePairContract } from '../../hooks/useContract'
import { Field } from '../../state/burn/actions'
import { useBurnActionHandlers, useBurnState, useDerivedBurnInfo } from '../../state/burn/hooks'
import { useUserDeadline } from '../../state/user/hooks'
import { currencyId } from '../../utils/currencyId'
import useDebouncedChangeHandler from '../../utils/useDebouncedChangeHandler'
import { wrappedCurrency } from '../../utils/wrappedCurrency'
import ConfirmRemoveModal from './ConfirmRemoveModal'

export default function RemoveLiquidity({
  history,
  match: {
    params: { currencyIdA, currencyIdB }
  }
}: RouteComponentProps<{ currencyIdA: string; currencyIdB: string }>) {
  const { isXl, isXxl } = useMatchBreakpoints()
  const isMobile = useMemo(() => !isXl && !isXxl, [isXl, isXxl])

  const { t } = useTranslation();
  const [currencyA, currencyB] = useMemo(
    () => [useCurrency(currencyIdA) ?? undefined, useCurrency(currencyIdB) ?? undefined], 
    [currencyIdA, currencyIdB]
  );
  const { account, chainId } = useActiveWeb3React()
  const [tokenA, tokenB] = useMemo(() => [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)], [
    currencyA,
    currencyB,
    chainId
  ])

  const { independentField, typedValue } = useBurnState()
  const { pair, parsedAmounts, error } = useDerivedBurnInfo(currencyA ?? undefined, currencyB ?? undefined)
  const { onUserInput: _onUserInput } = useBurnActionHandlers()
  const isValid = !error

  const [showDetailed, setShowDetailed] = useState<boolean>(false)

  const formattedAmounts = useMemo(() => {
    return (
      {
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
    )
  }, [independentField, parsedAmounts, typedValue]);

  const [signatureData, setSignatureData] = useState<{ v: number; r: string; s: string; deadline: number } | null>(null)
  const [approval, approveCallback, approveErr, setApproveErr] = useApproveCallback(
    parsedAmounts[Field.LIQUIDITY],
    ROUTER_ADDRESS[chainId || parseInt(process.env.REACT_APP_CHAIN_ID || '0')]
  );
  const { toastError } = useToast();

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

  const liquidityPercentChangeCallback = useCallback(
    (value: number) => {
      onUserInput(Field.LIQUIDITY_PERCENT, value.toString())
    },
    [onUserInput]
  )

  const oneCurrencyIsETH = useMemo(() => currencyA === ETHER || currencyB === ETHER, [currencyA, currencyB])
  const oneCurrencyIsWETH = useMemo(() => Boolean(
    chainId &&
    ((currencyA && currencyEquals(WETH(chainId), currencyA)) ||
      (currencyB && currencyEquals(WETH(chainId), currencyB)))
  ), [chainId, currencyA, currencyB]);

  const handleDismissConfirmation = useCallback(() => {
    setSignatureData(null) // important that we clear signature data to avoid bad sigs
    // if there was a tx hash, we want to clear the input
    onUserInput(Field.LIQUIDITY_PERCENT, '0')
  }, [onUserInput])


  const [innerLiquidityPercentage, setInnerLiquidityPercentage] = useDebouncedChangeHandler(
    Number.parseInt(parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0)),
    liquidityPercentChangeCallback
  );

  useEffect(() => {
    if(!account) {
      history.replace('/liquidity');
    }
  }, [account, history]);

  useEffect(() => {
    return () => {
      onUserInput(Field.LIQUIDITY_PERCENT, '0')
      onCurrencyAInput('0')
      onCurrencyBInput('0')
    }
  }, [onUserInput, onCurrencyAInput, onCurrencyBInput])

  const userPoolBalance = useTokenBalance(account ?? undefined, pair?.liquidityToken)

  const [onPresentConfirmRemoveModal] = useModal(<ConfirmRemoveModal {
    ...{
      currencyA,
      currencyB,
      parsedAmounts,
      pair,
      tokenA,
      tokenB,
      signatureData,
      onDismissModal: handleDismissConfirmation,
      onUserInput
    }
  } />)

  useEffect(() => {
    if(approveErr){
      toastError(t('{{Action}} Failed', {
        Action: t('Approve')
      }));
      setApproveErr('');
    }
  }, [approveErr, toastError, t, setApproveErr])

  return (
    <Flex width="100%" flexDirection="column" alignItems="center">
      <Flex width={isMobile ? "100%" : "629px"} mb="40px">
        <TitleSet
          title={t("Liquidity")}
          description={t("Remove LP and take back tokens")}
          link="https://sixnetwork.gitbook.io/definix-on-klaytn-en/exchange/liquidity-pools-and-adding-liquidity"
          linkLabel={t("Learn how to add Liquidity")}
        />
      </Flex>
      {account && (
        <Flex 
          backgroundColor={ColorStyles.WHITE}
          borderRadius="16px"
          width={isMobile ? "100%" : "629px"}
          border="1px solid #ffe5c9"
          style={{boxShadow: '0 12px 12px 0 rgba(227, 132, 0, 0.1)'}}
          mb={isMobile ? "40px" : "80px"}
        >
          <Flex flexDirection="column" width="100%">
            <CardBody>
              <Flex flexDirection="column" mb="20px">
                <Flex 
                  justifyContent={isMobile ? "flex-start" : "space-between"}
                  alignItems="center"
                  mb="20px"
                >
                  <Flex 
                    alignItems="center"
                    mr={isMobile ? "10px" : "20px"}
                  >
                    <DoubleCurrencyLogo 
                      size={isMobile ? 36 : 40} 
                      currency0={currencyA} 
                      currency1={currencyB}
                    />
                  </Flex>
                  <Flex 
                    flexDirection={isMobile ? "column" : "row"}
                    justifyContent={isMobile ? "flex-start" : "space-between"}
                    width={isMobile ? "auto" : "100%"}
                  >
                    <Text 
                      textStyle={isMobile ? "R_16M" : "R_18M"}
                      color={ColorStyles.BLACK}
                    >
                      {currencyA?.symbol}-{currencyB?.symbol}
                    </Text>
                    <Flex alignItems="center">
                      <Text textStyle="R_14R" color={ColorStyles.DEEPGREY} mr="5px">
                        {t('Balance')}
                      </Text>
                      <Text textStyle="R_14B" color={ColorStyles.DEEPGREY}>
                        {userPoolBalance ? userPoolBalance.toSignificant(4) : '-'}
                      </Text>
                    </Flex>
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
                        {showDetailed ? t('Simple') : t('Detail')}
                      </Text>
                    </Box>
                  </Flex>

                  <Box mt="15px" mb="15px">
                    <Slider value={innerLiquidityPercentage} onChange={setInnerLiquidityPercentage} />
                  </Box>
                </Flex>
              </Flex>
              {showDetailed && (
                <>
                  <Flex flexDirection="column">
                    <CurrencyInputPanelOnRemoveLP
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
                      currencyA={currencyA}
                      currencyB={currencyB}
                    />

                    <Flex justifyContent="center">
                      <ChangeBottomIcon />
                    </Flex>

                    <CurrencyInputPanelOnRemoveLP
                      value={formattedAmounts[Field.CURRENCY_A]}
                      onUserInput={onCurrencyAInput}
                      onMax={() => {
                        onUserInput(Field.LIQUIDITY_PERCENT, '100')
                      }}
                      onQuarter={() => {
                        onUserInput(Field.LIQUIDITY_PERCENT, '25')
                      }}
                      onHalf={() => {
                        onUserInput(Field.LIQUIDITY_PERCENT, '50')
                      }}
                      currency={currencyA}
                    />

                    <Flex justifyContent="center">
                      <ChangePlusIcon />
                    </Flex>

                    <CurrencyInputPanelOnRemoveLP
                      value={formattedAmounts[Field.CURRENCY_B]}
                      onUserInput={onCurrencyBInput}
                      onMax={() => {
                        onUserInput(Field.LIQUIDITY_PERCENT, '100')
                      }}
                      onQuarter={() => {
                        onUserInput(Field.LIQUIDITY_PERCENT, '25')
                      }}
                      onHalf={() => {
                        onUserInput(Field.LIQUIDITY_PERCENT, '50')
                      }}
                      currency={currencyB}
                    />
                  </Flex>

                  <Divider mt={isMobile ? "24px" :"32px"} mb={isMobile ? "24px" : "32px"} />
                </>
              )}

              <Flex width="100%" flexDirection="column">
                <Flex justifyContent="space-between" alignItems="center" mb="14px">
                  <Text textStyle="R_16M" color={ColorStyles.DEEPGREY}>
                    {t('You will receive')}
                  </Text>
                  {chainId && (oneCurrencyIsWETH || oneCurrencyIsETH) && (
                    <Flex alignItems="center">
                      {oneCurrencyIsETH ? (
                        <StyledInternalLink
                          to={`/liquidity/remove/${currencyA === ETHER ? WETH(chainId).address : currencyIdA}/${currencyB === ETHER ? WETH(chainId).address : currencyIdB
                            }`}
                        >
                          <Flex alignItems="center">
                            <Text mr="4px">{t('Receive')} WKLAY</Text>
                            <ArrowChangeIcon />
                          </Flex>
                        </StyledInternalLink>
                      ) : oneCurrencyIsWETH ? (
                        <StyledInternalLink
                          to={`/liquidity/remove/${currencyA && currencyEquals(currencyA, WETH(chainId)) ? 'KLAY' : currencyIdA
                            }/${currencyB && currencyEquals(currencyB, WETH(chainId)) ? 'KLAY' : currencyIdB}`}
                        >
                          <Flex alignItems="center">
                            <Text mr="4px">{t('Receive')} KLAY</Text>
                            <ArrowChangeIcon />
                          </Flex>
                        </StyledInternalLink>
                      ) : null}
                    </Flex>
                  )}
                </Flex>

                <Flex 
                  alignItems="center"
                  justifyContent="space-between"
                  mb={isMobile ? "10px" : "0"}
                  p={isMobile ? "5px 0" : "14px 0"}
                >
                  <Flex alignItems="center">
                    <CurrencyLogo size={isMobile ? "30px" : "32px"} currency={currencyA}/>
                    <Text
                      textStyle={isMobile ? "R_14M" : "R_16M"}
                      color={ColorStyles.BLACK}
                      ml="10px"
                      id="remove-liquidity-tokena-symbol"
                    >
                      {currencyA?.symbol}
                    </Text>
                  </Flex>
                  <Text>{formattedAmounts[Field.CURRENCY_A] || '-'}</Text>
                </Flex>
                <Flex
                  alignItems="center"
                  justifyContent="space-between"
                  p={isMobile ? "5px 0" : "14px 0"}
                >
                  <Flex alignItems="center">
                    <CurrencyLogo size={isMobile ? "30px" : "32px"} currency={currencyB}/>
                    <Text
                      textStyle={isMobile ? "R_14M" : "R_16M"}
                      color={ColorStyles.BLACK}
                      ml="10px"
                      id="remove-liquidity-tokenb-symbol"
                    >
                      {currencyB?.symbol}
                    </Text>
                  </Flex>
                  <Text>{formattedAmounts[Field.CURRENCY_B] || '-'}</Text>
                </Flex>
              </Flex>

              <Divider mt={isMobile ? "24px" :"20px"} mb={isMobile ? "24px" : "32px"} />

              <Flex>
                {!account ? (
                  <ConnectWalletButton />
                ) : (
                  <Flex flexDirection="column" width="100%">
                    <Flex 
                      flexDirection={isMobile ? "column" : "row"}
                      justifyContent="space-between"
                      mb={isMobile ? "32px" : "16px"}
                    >
                      <Flex alignItems="center" mb={isMobile ? "8px" : "0px"}>
                        <Box mr="12px">
                          <DoubleCurrencyLogo size={32} currency0={currencyA} currency1={currencyB}/>
                        </Box>
                        <Text textStyle={isMobile ? "R_16M" : "R_18M"} color={ColorStyles.MEDIUMGREY}>
                          {currencyA?.symbol}-{currencyB?.symbol}
                        </Text>
                      </Flex>
                      <Button
                        // onClick={onAttemptToApprove}
                        onClick={approveCallback}
                        textStyle="R_14B"
                        scale={ButtonScales.LG}
                        width={isMobile ? "100%" : "186px"}
                        disabled={approval !== ApprovalState.NOT_APPROVED || signatureData !== null}
                        isLoading={approval === ApprovalState.PENDING}
                      >
                        {t('Approve')}
                      </Button>
                    </Flex>
                    
                    <Button
                      onClick={() => {
                        onPresentConfirmRemoveModal();
                      }}
                      disabled={!isValid || (signatureData === null && approval !== ApprovalState.APPROVED)}
                      scale={ButtonScales.LG}
                      width="100%"
                      textStyle="R_16B"
                    >
                      {t('Remove')}
                    </Button>
                    
                    {/* {error && (
                      <Noti type={NotiType.ALERT} mt="12px">
                        {t(`${error}`)}
                      </Noti>
                    )} */}

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
      )}

      {/* <TransactionConfirmationModal
        isOpen={showConfirm}
        isPending={!!attemptingTxn}
        isSubmitted={!!txHash}
        isError={!!errorMsg}
        confirmContent={() => (
          <ConfirmationModalContent
            mainTitle={t("Confirm Remove Liquidity")}
            title="You will receive"
            topContent={modalHeader}
            bottomContent={modalBottom}
          />
        )}
        submittedContent={() => <></>}
        errorContent={errorContent}
        onDismiss={handleDismissConfirmation}
        
        setShowConfirm={setShowConfirm}
        setTxHash={setTxHash}
      /> */}
    </Flex>
  )
}
