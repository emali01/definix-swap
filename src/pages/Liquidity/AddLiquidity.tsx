import React, { useCallback, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  useModal,
  Divider
} from 'definixswap-uikit';
import { Currency, currencyEquals, TokenAmount, WETH } from 'definixswap-sdk';
import { Field } from 'state/mint/actions'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { currencyId } from 'utils/currencyId';

import numeral from 'numeral'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { PairState } from 'data/Reserves'
import { MinimalPositionCard } from 'components/PositionCard';
import { useActiveWeb3React } from 'hooks';
import { DerivedMintInfoError, useDerivedMintInfo, useMintActionHandlers, useMintState } from 'state/mint/hooks';
import { ROUTER_ADDRESS } from 'constants/index';
import { useHistory, useParams } from 'react-router';
import { useCurrency } from 'hooks/Tokens';

import CurrencyLogo from 'components/CurrencyLogo';
import ConnectWalletButton from 'components/ConnectWalletButton'
import CurrencyInputPanel from 'components/CurrencyInputPanel';

import NoLiquidity from './NoLiquidity';
import { PoolPriceBar } from './PoolPriceBar';
import ConfirmAddModal from './ConfirmAddModal';


const AddLiquidity: React.FC = () => {
  const { t } = useTranslation();
  const { currencyIdA, currencyIdB } = useParams<{currencyIdA: string; currencyIdB: string;}>();
  const currencyA = useCurrency(currencyIdA)
  const currencyB = useCurrency(currencyIdB)
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
  const history = useHistory();
  const { chainId, account } = useActiveWeb3React()
  const { isXl, isXxl } = useMatchBreakpoints()

  const { independentField, typedValue, otherTypedValue } = useMintState()

  const [approvalA, approveACallback] = useApproveCallback(parsedAmounts[Field.CURRENCY_A], ROUTER_ADDRESS[chainId || parseInt(process.env.REACT_APP_CHAIN_ID || '0')])
  const [approvalB, approveBCallback] = useApproveCallback(parsedAmounts[Field.CURRENCY_B], ROUTER_ADDRESS[chainId || parseInt(process.env.REACT_APP_CHAIN_ID || '0')])

  const isMobile = useMemo(() => !isXl && !isXxl, [isXl, isXxl])
  const isValid = useMemo(() => !error, [error]);
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

  const handleDismissConfirmation = useCallback(() => {
    onFieldAInput('');
    onFieldBInput('');
  }, [onFieldAInput, onFieldBInput]);


  const [onPresentConfirmAddModal] = useModal(
    <ConfirmAddModal
      noLiquidity={noLiquidity}
      currencies={currencies}
      liquidityMinted={liquidityMinted}
      price={price}
      parsedAmounts={parsedAmounts}
      poolTokenPercentage={poolTokenPercentage}
      currencyA={currencyA}
      currencyB={currencyB}
      onDismissModal={handleDismissConfirmation}
    />
  );

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
  );

  useEffect(() => {
    return () => handleDismissConfirmation();
  }, [handleDismissConfirmation]);

  console.log('~~~error', error)

  return (
    <>
      <Flex 
        flexDirection="column"
        backgroundColor={ColorStyles.WHITE}
        borderRadius="16px"
        mb="12px"
      >
        {noLiquidity && (
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
              isInsufficientBalance={error === DerivedMintInfoError.INSUFFICIENT_A_BALANCE}
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
              isInsufficientBalance={error === DerivedMintInfoError.INSUFFICIENT_B_BALANCE}
            />
          </Flex>

          <Divider m="32px 0" />

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
                    <Flex flexDirection="column" mb={isMobile ? "32px" : "16px"}>
                      <Flex 
                        flexDirection={isMobile ? "column" : "row"}
                        justifyContent="space-between"
                        alignItems={isMobile ? "flex-start" : "center"}
                        mb={isMobile ? "24px" : "8px"}
                      >
                          <Flex alignItems="center" mb={isMobile ? "8px" : "0px"}>
                            <CurrencyLogo currency={currencies[Field.CURRENCY_A]} size="32px" />
                            <Text ml={isMobile ? "10px" : "12px"} textStyle="R_16M" color={ColorStyles.MEDIUMGREY}>
                              {currencies[Field.CURRENCY_A]?.symbol}
                            </Text>
                          </Flex>

                          {approvalA === ApprovalState.APPROVED && (
                            <Button
                              scale={ButtonScales.LG}
                              onClick={approveBCallback}
                              disabled
                              width={isMobile ? "100%" : "186px"}
                              textStyle="R_14B"
                              color={ColorStyles.MEDIUMGREY}
                            >
                              <Box style={{opacity: 0.5}} mt="4px">
                                <CheckBIcon />
                              </Box>
                              <Text ml="6px">
                                {t('Approve')} {currencies[Field.CURRENCY_A]?.symbol}
                              </Text>
                            </Button>
                          )}

                          {approvalA !== ApprovalState.APPROVED && (
                            <Button
                              scale={ButtonScales.LG}
                              onClick={approveACallback}
                              disabled={approvalA === ApprovalState.PENDING}
                              isLoading={approvalA === ApprovalState.PENDING}
                              width={isMobile ? "100%" : "186px"}
                            >
                              {t('Approve')} {currencies[Field.CURRENCY_A]?.symbol}
                            </Button>
                          )}
                      </Flex>

                      <Flex 
                        flexDirection={isMobile ? "column" : "row"}
                        justifyContent="space-between"
                        alignItems={isMobile ? "flex-start" : "center"}
                      >
                          <Flex alignItems="center" mb={isMobile ? "8px" : "0px"}>
                            <CurrencyLogo currency={currencies[Field.CURRENCY_B]} size="32px" />
                            <Text ml={isMobile ? "10px" : "12px"} textStyle="R_16M" color={ColorStyles.MEDIUMGREY}>
                              {currencies[Field.CURRENCY_B]?.symbol}
                            </Text>
                          </Flex>
                          
                          {approvalB === ApprovalState.APPROVED && (
                            <Button
                              scale={ButtonScales.LG}
                              onClick={approveBCallback}
                              disabled
                              width={isMobile ? "100%" : "186px"}
                              textStyle="R_14B"
                              color={ColorStyles.MEDIUMGREY}
                            >
                              <Box style={{opacity: 0.5}} mt="4px">
                                <CheckBIcon />
                              </Box>
                              <Text ml="6px">
                                {t('Approve')} {currencies[Field.CURRENCY_B]?.symbol}
                              </Text>
                            </Button>
                          )}

                          {approvalB !== ApprovalState.APPROVED && (
                            <Button
                              scale={ButtonScales.LG}
                              onClick={approveBCallback}
                              disabled={approvalB === ApprovalState.PENDING}
                              isLoading={approvalB === ApprovalState.PENDING}
                              width={isMobile ? "100%" : "186px"}
                            >
                              {t('Approve')} {currencies[Field.CURRENCY_B]?.symbol}
                            </Button>
                          )}
                      </Flex>
                    </Flex>
                  )}
                <Button
                  onClick={() => onPresentConfirmAddModal()}
                  disabled={
                    !isValid || approvalA !== ApprovalState.APPROVED || approvalB !== ApprovalState.APPROVED
                  }
                  width="100%"
                  scale={ButtonScales.LG}
                >
                  {t('Add Liquidity')}
                </Button>
              </Flex>
            )}
          </Box>

          {/* {error && (
            <>
              {error === DerivedMintInfoError.ENTER_AN_AMOUNT && (
                <Noti type={NotiType.ALERT} mt={isMobile ? "10px" : "12px"}>
                  {t(DerivedMintInfoError.ENTER_AN_AMOUNT)}
                </Noti>
              )}
              {error === DerivedMintInfoError.INVALID_PAIR && (
                <Noti type={NotiType.ALERT} mt={isMobile ? "10px" : "12px"}>
                  {t(DerivedMintInfoError.INVALID_PAIR)}
                </Noti>
              )}
            </>
          )} */}

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

      {pair && !noLiquidity && pairState !== PairState.INVALID && (
        <Box mb={isMobile ? "40px" : "80px"}>
          <MinimalPositionCard showUnwrapped={oneCurrencyIsWETH} pair={pair} />
        </Box>
      )}
    </>
  )
}

export default AddLiquidity;