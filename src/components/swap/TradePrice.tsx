import { Price } from 'definixswap-sdk'
import React from 'react'
import { ColorStyles, Box, Flex, Text } from 'definixswap-uikit-v2'
import styled from 'styled-components'

interface TradePriceProps {
  price?: Price
  isPriceImpactCaution?: boolean
}

const StyledText = styled(Text)`
  ${({ theme }) => theme.textStyle.R_14M}
  color: ${({ theme }) => theme.colors.deepgrey};
`

export default function TradePrice({ price, isPriceImpactCaution = false }: TradePriceProps) {
  const show = Boolean((price?.baseCurrency && price?.quoteCurrency))
  
  return (
    <Flex
      alignItems="center"
      justifyContent="flex-end"
      flexWrap="wrap"
    >
      {show && !isPriceImpactCaution ? (
        <Box>
          <Flex justifyContent="flex-end">
            <StyledText>
              1 {price?.baseCurrency?.symbol}
            </StyledText>
            <StyledText ml="2px" mr="2px">
              =
            </StyledText>
            <StyledText mr="2px">
              {price?.toSignificant(6) ?? '-'}
            </StyledText>
            <StyledText>
              {price?.quoteCurrency?.symbol}
            </StyledText>
          </Flex>
          <Flex justifyContent="flex-end">
            <StyledText>
              1 {price?.quoteCurrency?.symbol}
            </StyledText>
            <StyledText ml="2px" mr="2px">
              =
            </StyledText>
            <StyledText mr="2px">
              {price?.invert()?.toSignificant(6) ?? '-'}
            </StyledText>
            <StyledText>
              {price?.baseCurrency?.symbol}
            </StyledText>
          </Flex>
        </Box>
      ) : (
        '-'
      )}
    </Flex>
  )
}
