import { Price } from 'definixswap-sdk'
import React from 'react'
import { ColorStyles, IconButton, Text } from 'definixswap-uikit'

interface TradePriceProps {
  price?: Price
  showInverted: boolean
  setShowInverted: (showInverted: boolean) => void
}

export default function TradePrice({ price, showInverted, setShowInverted }: TradePriceProps) {
  const formattedPrice = showInverted ? price?.toSignificant(6) : price?.invert()?.toSignificant(6)

  const show = Boolean(price?.baseCurrency && price?.quoteCurrency)
  const label = showInverted ? (
    <>
      <Text textStyle="R_14M" color={ColorStyles.DEEPGREY}>
        {price?.quoteCurrency?.symbol}
      </Text>
      <Text textStyle="R_14M" color={ColorStyles.DEEPGREY} ml="2px" mr="2px">
        =
      </Text>
      <Text textStyle="R_14M" color={ColorStyles.DEEPGREY}>
        {price?.baseCurrency?.symbol}
      </Text>
    </>
  ) : (
    <>
      <Text textStyle="R_14M" color={ColorStyles.DEEPGREY}>
        {price?.baseCurrency?.symbol}
      </Text>
      <Text textStyle="R_14M" color={ColorStyles.DEEPGREY} ml="2px" mr="2px">
        =
      </Text>
      <Text textStyle="R_14M" color={ColorStyles.DEEPGREY}>
        {price?.quoteCurrency?.symbol}
      </Text>
    </>
  )

  return (
    <div className="flex align-center justify-end flex-wrap">
      {show ? (
        <>
          <Text textStyle="R_14M" color={ColorStyles.DEEPGREY} mr="2px">
            {formattedPrice ?? '-'}
          </Text>
          {label}
          {/* <IconButton size="xs" onClick={() => setShowInverted(!showInverted)} variant="tertiary" className="ml-2">
            <SyncAltIcon width="14px" color="primary" />
          </IconButton> */}
        </>
      ) : (
        '-'
      )}
    </div>
  )
}
