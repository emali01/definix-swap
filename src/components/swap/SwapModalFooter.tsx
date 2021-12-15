import React from 'react'
import { useTranslation } from 'react-i18next'
import { Trade } from 'definixswap-sdk'
import { Button, Text, Flex, ColorStyles, ButtonScales } from '@fingerlabs/definixswap-uikit-v2'
import AdvancedSwapDetailsDropdown from 'components/swap/AdvancedSwapDetailsDropdown'
import { SwapCallbackError } from './styleds'
import TradePrice from './TradePrice'

export default function SwapModalFooter({
  trade,
  onConfirm,
  swapErrorMessage,
  disabledConfirm,
  isPending,
}: {
  trade: Trade
  onConfirm: () => void
  swapErrorMessage: string | undefined
  disabledConfirm: boolean
  isPending: boolean
}) {
  const { t } = useTranslation();

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
          />
        </Flex>
        <AdvancedSwapDetailsDropdown isRoute={false} trade={trade} isMobile={false} />
      </Flex>
      <Flex>
        <Button
          scale={ButtonScales.LG}
          width="100%"
          onClick={onConfirm}
          isLoading={isPending}
          disabled={disabledConfirm}
          id="confirm-swap-or-send"
        >
          <Text textStyle="R_16B">
            {t('Swap')}
          </Text>
        </Button>
        {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
      </Flex>
    </Flex>
  )
}
