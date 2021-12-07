import React, { useMemo } from 'react';
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
  useModal
} from 'definixswap-uikit';
import { Currency, TokenAmount } from 'definixswap-sdk';
import { Field } from 'state/mint/actions'
import { maxAmountSpend } from 'utils/maxAmountSpend'

import numeral from 'numeral'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { PairState } from 'data/Reserves'
import { MinimalPositionCard } from 'components/PositionCard';
import { useActiveWeb3React } from 'hooks';
import { useIsExpertMode, useUserSlippageTolerance } from 'state/user/hooks';
import { useDerivedMintInfo, useMintState } from 'state/mint/hooks';
import { ROUTER_ADDRESS } from 'constants/index';

import CurrencyLogo from 'components/CurrencyLogo';
import { Dots } from 'components/swap/styleds'
import ConnectWalletButton from 'components/ConnectWalletButton'
import CurrencyInputPanel from 'components/CurrencyInputPanel';

import NoLiquidity from './NoLiquidity';
import { PoolPriceBar } from './PoolPriceBar';
import ConfirmAddModal from './ConfirmAddModal';

interface IProps {
  currencyA: Currency;
  currencyB: Currency;
  onFieldAInput: (typedValue: string) => void
  onFieldBInput: (typedValue: string) => void
  handleCurrencyASelect: (currA: Currency) => void
  handleCurrencyBSelect: (currB: Currency) => void
  onAdd: () => Promise<void>
  setShowConfirm: React.Dispatch<React.SetStateAction<boolean>>
  oneCurrencyIsWETH: boolean
}

const AddLiquidity: React.FC<IProps> = ({
  onFieldAInput,
  handleCurrencyASelect,
  onFieldBInput,
  handleCurrencyBSelect,
  onAdd,
  setShowConfirm,
  oneCurrencyIsWETH,
  currencyA,
  currencyB,
}) => {
  const { chainId, account } = useActiveWeb3React()
  const expertMode = useIsExpertMode()
  const { isXl, isXxl } = useMatchBreakpoints()
  const isMobile = useMemo(() => !isXl && !isXxl, [isXl, isXxl])
  const { t } = useTranslation(); 
  const [allowedSlippage] = useUserSlippageTolerance()

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

  const [onPresentConfirmAddModal] = useModal(<ConfirmAddModal
    noLiquidity={noLiquidity}
    currencies={currencies}
    liquidityMinted={liquidityMinted}
    price={price}
    parsedAmounts={parsedAmounts}
    onAdd={onAdd}
    poolTokenPercentage={poolTokenPercentage}
    allowedSlippage={allowedSlippage} />);

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
                              Approved to {currencies[Field.CURRENCY_A]?.symbol}
                            </Text>
                          </Button> )}

                          {approvalA !== ApprovalState.APPROVED && (<Button
                            scale={ButtonScales.LG}
                            onClick={approveACallback}
                            disabled={approvalA === ApprovalState.PENDING}
                            width="186px"
                          >
                            {approvalA === ApprovalState.PENDING ? (
                              <Dots>Approving {currencies[Field.CURRENCY_A]?.symbol}</Dots>
                            ) : (
                              `Approve ${currencies[Field.CURRENCY_A]?.symbol}`
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
                              Approved to {currencies[Field.CURRENCY_B]?.symbol}
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
                              `Approve to ${currencies[Field.CURRENCY_B]?.symbol}`
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
                      // setShowConfirm(true)
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
                  {error ?? 'Supply'}
                </Button>
              </Flex>
            )}
          </Box>

          <Noti type={NotiType.ALERT} mt="12px">
            Error message
          </Noti>

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