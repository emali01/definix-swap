import { Price } from 'definixswap-sdk'
import React from 'react'
import { ColorStyles, Box, Flex, Text } from 'definixswap-uikit'

interface TradePriceProps {
  price?: Price
  showInverted?: boolean
  setShowInverted?: (showInverted: boolean) => void
}

export default function TradePrice({ price, showInverted, setShowInverted }: TradePriceProps) {
  const show = Boolean(price?.baseCurrency && price?.quoteCurrency)

  return (
    <div className="flex align-center justify-end flex-wrap">
      {show ? (
        <Box>
          <Flex justifyContent="flex-end">
            <Text textStyle="R_14M" color={ColorStyles.DEEPGREY}>
              1 {price?.baseCurrency?.symbol}
            </Text>
            <Text textStyle="R_14M" color={ColorStyles.DEEPGREY} ml="2px" mr="2px">
              =
            </Text>
            <Text textStyle="R_14M" color={ColorStyles.DEEPGREY} mr="2px">
              {price?.toSignificant(6) ?? '-'}
            </Text>
            <Text textStyle="R_14M" color={ColorStyles.DEEPGREY}>
              {price?.quoteCurrency?.symbol}
            </Text>
          </Flex>
          <Flex justifyContent="flex-end">
            <Text textStyle="R_14M" color={ColorStyles.DEEPGREY}>
              1 {price?.quoteCurrency?.symbol}
            </Text>
            <Text textStyle="R_14M" color={ColorStyles.DEEPGREY} ml="2px" mr="2px">
              =
            </Text>
            <Text textStyle="R_14M" color={ColorStyles.DEEPGREY} mr="2px">
              {price?.invert()?.toSignificant(6) ?? '-'}
            </Text>
            <Text textStyle="R_14M" color={ColorStyles.DEEPGREY}>
              {price?.baseCurrency?.symbol}
            </Text>
          </Flex>
        </Box>
      ) : (
        '-'
      )}
    </div>
  )
}
