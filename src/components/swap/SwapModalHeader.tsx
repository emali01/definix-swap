import { Trade, TradeType } from 'definixswap-sdk'
import React, { useContext, useMemo } from 'react'
import { ArrowDown } from 'react-feather'
import styled, { DefaultTheme, ThemeContext } from 'styled-components'
import { Button, Text, Flex, Box, ArrowBottomGIcon } from 'definixswap-uikit'
import { Field } from '../../state/swap/actions'
import { isAddress, shortenAddress } from '../../utils'
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import { AutoColumn } from '../Column'
import CurrencyLogo from '../CurrencyLogo'
import { RowBetween, RowFixed } from '../Row'

const PriceInfoText = styled(Text)`
  span {
    font-weight: 600;
  }
`

const SwapTokenInfo = ({
  isInput,
  trade,
  theme,
  showAcceptChanges,
  priceImpactSeverity}: {
    isInput: boolean
    trade: Trade
    theme: DefaultTheme
    showAcceptChanges?: boolean
    priceImpactSeverity?: 0 | 1 | 2 | 3 | 4
  }) => {
  return (
    <Flex justifyContent="space-between" alignItems="center" p="15px 0">
      <Flex alignItems="center">
        <Box mr="12px" mt="2px">
          {isInput && <CurrencyLogo currency={trade.inputAmount.currency} size="30px" />}
          {!isInput && <CurrencyLogo currency={trade.outputAmount.currency} size="30px" />}
        </Box>
        <Text textStyle="R_16M">
          {isInput && trade.inputAmount.currency.symbol}
          {!isInput && trade.outputAmount.currency.symbol}
        </Text>
      </Flex>
      {isInput && (
        <Text
          textStyle="R_16R"
          color={showAcceptChanges && trade.tradeType === TradeType.EXACT_OUTPUT ? theme.colors.primary : 'text'}
        >
          {trade.inputAmount.toSignificant(6)}
        </Text>
      )}
      {!isInput && priceImpactSeverity && (
        <Text 
          textStyle="R_16R"
          color={priceImpactSeverity > 2 ? theme.colors.failure : 'text'}
        >
          {trade.outputAmount.toSignificant(6)}
        </Text>
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
  const slippageAdjustedAmounts = useMemo(() => computeSlippageAdjustedAmounts(trade, allowedSlippage), [
    trade,
    allowedSlippage,
  ])
  const { priceImpactWithoutFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  const theme = useContext(ThemeContext)

  return (
    <Flex flexDirection="column">
      <Flex flexDirection="column">

        <SwapTokenInfo 
          isInput
          trade={trade}
          theme={theme}
          showAcceptChanges={showAcceptChanges}
        />

        <SwapTokenInfo
          isInput={false}
          trade={trade}
          theme={theme}
          priceImpactSeverity={priceImpactSeverity}
        />
      </Flex>
    {/* 
      {!onlyCurrency && (
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
