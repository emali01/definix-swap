import { Trade, TradeType } from 'definixswap-sdk'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, Flex, ColorStyles, Helper } from 'definixswap-uikit'
import { Field } from '../../state/swap/actions'
import { useUserSlippageTolerance } from '../../state/user/hooks'
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown } from '../../utils/prices'
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
  const { t } = useTranslation();
  const { priceImpactWithoutFee, realizedLPFee } = computeTradePriceBreakdown(trade)
  const isExactIn = trade.tradeType === TradeType.EXACT_INPUT
  const slippageAdjustedAmounts = computeSlippageAdjustedAmounts(trade, allowedSlippage)

  return (
    <Flex flexDirection="column" mb="12px">

      <Flex alignItems="center" justifyContent="space-between" mb="12px">
        <Flex>
          <Text textStyle="R_14R" color={ColorStyles.MEDIUMGREY}>
            {t(isExactIn ? 'Minimum Received' : 'Maximum sold')}
          </Text>
          <Helper ml="4px" text={t('Your transaction will revert if there')} />
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
            {t('Price Impact')}
          </Text>
          <Helper ml="4px" text={t('The difference between the market')} />
        </Flex>
        <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
      </Flex>

      <Flex justifyContent="space-between">
        <Flex marginBottom="0 !important">
          <Text textStyle="R_14R" color={ColorStyles.MEDIUMGREY}>
            {t('Liquidity Provider Fee')}
          </Text>
          <Helper ml="4px"
            text={t('For each trade a 0.2%')}
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
  trade?: Trade;
  isMobile?: boolean;
}

export function AdvancedSwapDetails({ trade, isMobile }: AdvancedSwapDetailsProps) {
  const [allowedSlippage] = useUserSlippageTolerance()
  const { t } = useTranslation();

  const showRoute = Boolean(trade && trade.route.path.length > 2)

  return trade ? (
    <Flex flexDirection="column">
      <TradeSummary trade={trade} allowedSlippage={allowedSlippage} className={showRoute ? 'col-6' : 'col-12'} />
      {showRoute && (
        <Flex justifyContent="space-between" alignItems="flex-start">
          <Flex className="mb-3">
            <Text textStyle="R_14R" color={ColorStyles.MEDIUMGREY}>
              {t('Routing')}
            </Text>
            <Helper ml="4px" text={t('Routing through these tokens')} />
          </Flex>
          <SwapRoute trade={trade} isMobile={isMobile} />
        </Flex>
      )}
    </Flex>
  ) : (
    <></>
  )
}
