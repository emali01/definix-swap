import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Trade } from 'definixswap-sdk'
import { Button, Text, Flex, ColorStyles, ButtonScales } from 'definixswap-uikit'
import AdvancedSwapDetailsDropdown from 'components/swap/AdvancedSwapDetailsDropdown'
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
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
  const { t } = useTranslation();
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
        {t('Estimated Returns')}
      </Text>

      <Flex flexDirection="column" mb="24px">
        <Flex justifyContent="space-between" mb="8px">
          <Text textStyle="R_14R" color={ColorStyles.MEDIUMGREY}>
            {t('Price Rate')}
          </Text>
          <TradePrice 
            price={trade?.executionPrice} 
            showInverted={showInverted} 
            setShowInverted={setShowInverted} 
          />
        </Flex>
        <AdvancedSwapDetailsDropdown isRoute={false} trade={trade} isMobile={false} />
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
