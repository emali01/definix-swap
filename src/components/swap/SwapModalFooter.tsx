import { Trade, TradeType } from 'definixswap-sdk'
import React, { useMemo, useState } from 'react'
import { Button, Text, Flex, ColorStyles, ButtonScales } from 'definixswap-uikit'
import { Field } from '../../state/swap/actions'
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import { AutoColumn } from '../Column'
import QuestionHelper from '../QuestionHelper'
import { AutoRow, RowBetween, RowFixed } from '../Row'
import FormattedPriceImpact from './FormattedPriceImpact'
import { SwapCallbackError } from './styleds'
import TradePrice from './TradePrice'

export default function SwapModalFooter({
  trade,
  onConfirm,
  allowedSlippage,
  swapErrorMessage,
  disabledConfirm,
  isPending,
}: {
  trade: Trade
  allowedSlippage: number
  onConfirm: () => void
  swapErrorMessage: string | undefined
  disabledConfirm: boolean
  isPending: boolean
}) {
  const [showInverted, setShowInverted] = useState<boolean>(false)
  const slippageAdjustedAmounts = useMemo(() => computeSlippageAdjustedAmounts(trade, allowedSlippage), [
    allowedSlippage,
    trade,
  ])
  const { priceImpactWithoutFee, realizedLPFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
  const severity = warningSeverity(priceImpactWithoutFee)

  return (
    <Flex flexDirection="column">
      <Text 
        textStyle="R_16M"
        color={ColorStyles.DEEPGREY}
        mb="12px"
      >
        Estimated Returns
      </Text>

      <Flex flexDirection="column" mb="32px">
        <Flex justifyContent="space-between" mb="8px">
          <Text textStyle="R_14R" color={ColorStyles.MEDIUMGREY}>
            Price Rate
          </Text>
          <TradePrice 
            price={trade?.executionPrice} 
            showInverted={showInverted} 
            setShowInverted={setShowInverted} 
          />
        </Flex>

        <Flex justifyContent="space-between" mb="8px">
          <Flex>
            <Text textStyle="R_14R" color={ColorStyles.MEDIUMGREY} mr="5px">
              {trade.tradeType === TradeType.EXACT_INPUT ? 'Minimum received' : 'Maximum sold'}
            </Text>
            <QuestionHelper 
              text="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed." 
            />
          </Flex>
          <Flex>
            <Text textStyle="R_14M" color={ColorStyles.DEEPGREY} mr="4px">
              {trade.tradeType === TradeType.EXACT_INPUT
                ? slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4) ?? '-'
                : slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4) ?? '-'}
            </Text>
            <Text textStyle="R_14M" color={ColorStyles.DEEPGREY}>
              {trade.tradeType === TradeType.EXACT_INPUT
                ? trade.outputAmount.currency.symbol
                : trade.inputAmount.currency.symbol}
            </Text>
          </Flex>
        </Flex>

        <Flex justifyContent="space-between" mb="8px">
          <RowFixed mb="0 !important">
            <Text textStyle="R_14R" color={ColorStyles.MEDIUMGREY}>
              Price Impact
            </Text>
            <QuestionHelper text="The difference between the market price and your price due to trade size." />
          </RowFixed>
          <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
        </Flex>

        <Flex justifyContent="space-between">
          <RowFixed mb="0 !important">
            <Text textStyle="R_14R" color={ColorStyles.MEDIUMGREY}>
              Liquidity Provider Fee
            </Text>
            <QuestionHelper
              text="For each trade a 0.2% fee is paid.
0.15% goes to liquidity providers and 0.05% goes to the Definix Swap treasury"
            />
          </RowFixed>
          <Text textStyle="R_14M" color={ColorStyles.DEEPGREY}>
            {realizedLPFee ? `${realizedLPFee?.toSignificant(6)} ${trade.inputAmount.currency.symbol}` : '-'}
          </Text>
        </Flex>
      </Flex>

      <Flex>
        <Button
          scale={ButtonScales.LG}
          width="100%"
          onClick={onConfirm}
          disabled={disabledConfirm}
          variant={severity > 2 ? 'danger' : 'primary'}
          id="confirm-swap-or-send"
        >
          <Text textStyle="R_16B">
            {isPending ? 'Pending...' : severity > 2 ? 'Swap Anyway' : 'Swap'}
          </Text>
        </Button>

        {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
      </Flex>
    </Flex>
  )
}
