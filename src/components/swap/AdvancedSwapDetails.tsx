import { Trade, TradeType } from 'definixswap-sdk'
import React from 'react'
import styled from 'styled-components'
import { CardBody, Text } from 'uikit-dev'
import { Field } from '../../state/swap/actions'
import { useUserSlippageTolerance } from '../../state/user/hooks'
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown } from '../../utils/prices'
import { AutoColumn } from '../Column'
import QuestionHelper from '../QuestionHelper'
import { RowBetween, RowFixed } from '../Row'
import FormattedPriceImpact from './FormattedPriceImpact'
import SwapRoute from './SwapRoute'

const StyledCard = styled(CardBody)`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.default};
  margin-top: 1rem;
  margin-bottom: 1rem;
`

function TradeSummary({ trade, allowedSlippage }: { trade: Trade; allowedSlippage: number }) {
  const { priceImpactWithoutFee, realizedLPFee } = computeTradePriceBreakdown(trade)
  const isExactIn = trade.tradeType === TradeType.EXACT_INPUT
  const slippageAdjustedAmounts = computeSlippageAdjustedAmounts(trade, allowedSlippage)

  return (
    <StyledCard>
      <RowBetween align="baseline">
        <RowFixed>
          <Text fontSize="14px">{isExactIn ? 'Minimum received' : 'Maximum sold'}</Text>
          <QuestionHelper text="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed." />
        </RowFixed>
        <RowFixed>
          <Text fontSize="14px" fontWeight="600">
            {isExactIn
              ? `${slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4)} ${trade.outputAmount.currency.symbol}` ??
                '-'
              : `${slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4)} ${trade.inputAmount.currency.symbol}` ?? '-'}
          </Text>
        </RowFixed>
      </RowBetween>

      <RowBetween align="baseline">
        <RowFixed margin="0">
          <Text fontSize="14px">Price Impact</Text>
          <QuestionHelper text="The difference between the market price and estimated price due to trade size." />
        </RowFixed>
        <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
      </RowBetween>

      <RowBetween>
        <RowFixed marginBottom="0 !important">
          <Text fontSize="14px">Liquidity Provider Fee</Text>
          <QuestionHelper text="For each trade a 0.2% fee is paid. 0.17% goes to liquidity providers and 0.03% goes to the DefinixSwap treasury." />
        </RowFixed>
        <Text fontSize="14px" fontWeight="600">
          {realizedLPFee ? `${realizedLPFee.toSignificant(4)} ${trade.inputAmount.currency.symbol}` : '-'}
        </Text>
      </RowBetween>
    </StyledCard>
  )
}

export interface AdvancedSwapDetailsProps {
  trade?: Trade
}

export function AdvancedSwapDetails({ trade }: AdvancedSwapDetailsProps) {
  const [allowedSlippage] = useUserSlippageTolerance()

  const showRoute = Boolean(trade && trade.route.path.length > 2)

  return (
    <AutoColumn gap="md">
      {trade && (
        <>
          <TradeSummary trade={trade} allowedSlippage={allowedSlippage} />
          {showRoute && (
            <AutoColumn>
              <RowFixed>
                <Text fontSize="14px">Route</Text>
                <QuestionHelper text="Routing through these tokens resulted in the best price for your trade." />
              </RowFixed>
              <SwapRoute trade={trade} />
            </AutoColumn>
          )}
        </>
      )}
    </AutoColumn>
  )
}
