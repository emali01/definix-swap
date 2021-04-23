import { Trade } from 'definixswap-sdk'
import React, { Fragment, memo, useContext } from 'react'
import { ArrowRight } from 'react-feather'
import { ThemeContext } from 'styled-components'
import { Flex, Text } from 'uikit-dev'
import CurrencyLogo from '../CurrencyLogo'

export default memo(function SwapRoute({ trade }: { trade: Trade }) {
  const theme = useContext(ThemeContext)
  return (
    <Flex
      px="1rem"
      py="0.5rem"
      style={{ borderRadius: theme.radii.default, backgroundColor: theme.colors.backgroundBox }}
      flexWrap="wrap"
      justifyContent="space-evenly"
      alignItems="center"
    >
      {trade.route.path.map((token, i, path) => {
        const isLastItem: boolean = i === path.length - 1
        return (
          // eslint-disable-next-line react/no-array-index-key
          <Fragment key={i}>
            <Flex my="0.5rem" alignItems="center" style={{ flexShrink: 0 }}>
              <CurrencyLogo currency={token} size="1.5rem" />
              <Text fontSize="14px" color="text" ml="0.5rem" fontWeight="600">
                {token.symbol}
              </Text>
            </Flex>
            {isLastItem ? null : <ArrowRight size="20" />}
          </Fragment>
        )
      })}
    </Flex>
  )
})
