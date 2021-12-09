import { Trade, TradeType } from 'definixswap-sdk'
import { useTranslation } from 'react-i18next'
import React, { useContext, useMemo } from 'react'
import { ArrowDown } from 'react-feather'
import styled, { DefaultTheme, ThemeContext } from 'styled-components'
import { Button, Text, Flex, Box, ChangeBottomIcon, Noti, NotiType } from 'definixswap-uikit-v2'
import { Field } from '../../state/swap/actions'
import { isAddress, shortenAddress } from '../../utils'
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import { AutoColumn } from '../Column'
import CurrencyLogo from '../CurrencyLogo'
import { RowBetween, RowFixed } from '../Row'

const BalanceText = styled(Text)<{ isAcceptChange: boolean }>`
  ${({ theme }) => theme.textStyle.R_16R}
  color: ${({ isAcceptChange, theme }) => isAcceptChange ? theme.colors.red : theme.colors.black};
`

const WrapIcon = styled(Flex)`
  margin-top: -30px;
  transform: translateY(20px);
  justify-content: center;
` 

const WrapPriceUpdate = styled(Flex)`
  margin-top: 20px;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  border: solid 1px ${({ theme }) => theme.colors.lightGrey50};
  background-color: ${({ theme }) => theme.colors.lightGrey10};
}
`

const SwapTokenInfo = ({
  isInput,
  trade,
  showAcceptChanges,
  priceImpactSeverity}: {
    isInput: boolean
    trade: Trade
    showAcceptChanges?: boolean
    priceImpactSeverity?: 0 | 1 | 2 | 3 | 4
  }) => {

  return (
    <Flex justifyContent="space-between" alignItems="center" height="60px">
      <Flex alignItems="center">
        <Box mr="12px" mt="2px">
          {isInput && <CurrencyLogo currency={trade.inputAmount.currency} size="32px" />}
          {!isInput && <CurrencyLogo currency={trade.outputAmount.currency} size="32px" />}
        </Box>
        <Text textStyle="R_16M">
          {isInput && trade.inputAmount.currency.symbol}
          {!isInput && trade.outputAmount.currency.symbol}
        </Text>
      </Flex>
      {isInput && (
        <BalanceText
          isAcceptChange={showAcceptChanges && trade.tradeType === TradeType.EXACT_OUTPUT}
        >
          {trade.inputAmount.toSignificant(6)}
        </BalanceText>
      )}
      {!isInput && (
        <BalanceText 
          // isAcceptChange={priceImpactSeverity > 2}
          isAcceptChange={showAcceptChanges}
        >
          {trade.outputAmount.toSignificant(6)}
        </BalanceText>
      )}
    </Flex>
  )
}

export default function SwapModalHeader({
  trade,
  allowedSlippage = 0,
  recipient = null,
  showAcceptChanges = false,
  onlyCurrency = false,
  onAcceptChanges,
}: {
  trade: Trade
  allowedSlippage?: number
  recipient?: string | null
  showAcceptChanges?: boolean
  onlyCurrency?: boolean
  onAcceptChanges?: () => void
}) {
  const { t } = useTranslation();
  const slippageAdjustedAmounts = useMemo(() => computeSlippageAdjustedAmounts(trade, allowedSlippage), [
    trade,
    allowedSlippage,
  ])
  const { priceImpactWithoutFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  return (
    <Flex flexDirection="column">
      <Flex flexDirection="column">
        <SwapTokenInfo 
          isInput
          trade={trade}
          showAcceptChanges={showAcceptChanges}
        />
        <WrapIcon>
          <ChangeBottomIcon />
        </WrapIcon>
        <SwapTokenInfo
          isInput={false}
          trade={trade}
          showAcceptChanges={showAcceptChanges}
          priceImpactSeverity={priceImpactSeverity}
        />
      </Flex>

      {
        // true && <WrapPriceUpdate>
        !onlyCurrency && showAcceptChanges && <WrapPriceUpdate>
          <Noti type={NotiType.ALERT}>
            {t('Price update')}
          </Noti>
          <Button xs variant="red" minWidth="107px" onClick={onAcceptChanges}>{t('Accept')}</Button>
        </WrapPriceUpdate>
      }
    
      {/* {!onlyCurrency && (
        <>
          {showAcceptChanges ? (
            <RowBetween>
              <div className="flex align-center">
                <Text>Price Updated</Text>
              </div>
              <Button onClick={onAcceptChanges} size="sm" className="flex-shrink">
                Accept Price
              </Button>
            </RowBetween>
          ) : null}

          {trade.tradeType === TradeType.EXACT_INPUT ? (
            <PriceInfoText>
              {`Output is estimated. You will receive at least `}
              <span>
                {slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(6)} {trade.outputAmount.currency.symbol}
              </span>
              {' or the transaction will revert.'}
            </PriceInfoText>
          ) : (
            <PriceInfoText>
              {`Input is estimated. You will sell at most `}
              <span>
                {slippageAdjustedAmounts[Field.INPUT]?.toSignificant(6)} {trade.inputAmount.currency.symbol}
              </span>
              {' or the transaction will revert.'}
            </PriceInfoText>
          )}

          {recipient !== null ? (
            <Text>
              Output will be sent to{' '}
              <b title={recipient}>{isAddress(recipient) ? shortenAddress(recipient) : recipient}</b>
            </Text>
          ) : null}
        </>
      )} */}
    </Flex>
  )
}
