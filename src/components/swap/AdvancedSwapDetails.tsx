import { Trade, TradeType } from 'definixswap-sdk'
import React from 'react'
import { Text, Flex, ColorStyles } from 'definixswap-uikit'
import { Field } from '../../state/swap/actions'
import { useUserSlippageTolerance } from '../../state/user/hooks'
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown } from '../../utils/prices'
import QuestionHelper from '../QuestionHelper'
import FormattedPriceImpact from './FormattedPriceImpact'
import SwapRoute from './SwapRoute'

function TradeSummary({
  trade,
  allowedSlippage,
  className,
}: {
  trade: Trade
  allowedSlippage: number
  className?: string
}) {
  const { priceImpactWithoutFee, realizedLPFee } = computeTradePriceBreakdown(trade)
  const isExactIn = trade.tradeType === TradeType.EXACT_INPUT
  const slippageAdjustedAmounts = computeSlippageAdjustedAmounts(trade, allowedSlippage)

  return (
    <Flex flexDirection="column" mb="12px">

      <Flex alignItems="center" justifyContent="space-between" mb="12px">
        <Flex>
          <Text textStyle="R_14R" color={ColorStyles.MEDIUMGREY}>
            {isExactIn ? 'Minimum received' : 'Maximum sold'}
          </Text>
          <QuestionHelper text="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed." />
        </Flex>
        <Flex>
          <Text textStyle="R_14M" color={ColorStyles.DEEPGREY} textAlign="right">
            {isExactIn
              ? `${slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4)} ${trade.outputAmount.currency.symbol}` ??
                '-'
              : `${slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4)} ${trade.inputAmount.currency.symbol}` ?? '-'}
          </Text>
        </Flex>
      </Flex>

      <Flex justifyContent="space-between" mb="12px">
        <Flex margin="0">
          <Text textStyle="R_14R" color={ColorStyles.MEDIUMGREY}>
            Price Impact
          </Text>
          <QuestionHelper text="The difference between the market price and estimated price due to trade size." />
        </Flex>
        <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
      </Flex>

      <Flex justifyContent="space-between">
        <Flex marginBottom="0 !important">
          <Text textStyle="R_14R" color={ColorStyles.MEDIUMGREY}>
            Liquidity Provider Fee
          </Text>
          <QuestionHelper
            text="For each trade a 0.2% fee is paid.
0.15% goes to liquidity providers and 0.05% goes to the Definix Swap treasury"
          />
        </Flex>
        <Text textStyle="R_14M" color={ColorStyles.DEEPGREY} textAlign="right">
          {realizedLPFee ? `${realizedLPFee.toSignificant(4)} ${trade.inputAmount.currency.symbol}` : '-'}
        </Text>
      </Flex>
    </Flex>
  )
}

export interface AdvancedSwapDetailsProps {
  trade?: Trade
}

export function AdvancedSwapDetails({ trade }: AdvancedSwapDetailsProps) {
  const [allowedSlippage] = useUserSlippageTolerance()

  const showRoute = Boolean(trade && trade.route.path.length > 2)

  return trade ? (
    <Flex flexDirection="column">
      <TradeSummary trade={trade} allowedSlippage={allowedSlippage} className={showRoute ? 'col-6' : 'col-12'} />
      {showRoute && (
        <Flex justifyContent="space-between">
          <Flex className="mb-3">
            <Text textStyle="R_14R" color={ColorStyles.MEDIUMGREY}>
              Routing
            </Text>
            <QuestionHelper text="Routing through these tokens resulted in the best price for your trade." />
          </Flex>
          <SwapRoute trade={trade} />
        </Flex>
      )}
    </Flex>
  ) : (
    <></>
  )
}
