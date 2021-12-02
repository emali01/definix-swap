import { Trade } from 'definixswap-sdk'
import React, { Fragment, memo } from 'react'
import { Text, Flex, ArrowDoubleArrowIcon } from 'definixswap-uikit'
import CurrencyLogo from '../CurrencyLogo'

export default memo(function SwapRoute({ trade, isMobile }: { trade: Trade; isMobile: boolean; }) {
  return (
    <Flex alignItems="center" justifyContent="flex-end" flexWrap="wrap" alignContent="">
      {trade.route.path.map((token, i, path) => {
        const isLastItem: boolean = i === path.length - 1
        return (
          // eslint-disable-next-line react/no-array-index-key
          <Fragment key={i}>
            <Flex alignItems="center" ml="10px" mb="6px">
              <CurrencyLogo currency={token} size={isMobile ? "20px" : "22px"} />
              <Text textStyle="R_14M" color="deepgrey" ml="6px">
                {token.symbol}
              </Text>
              {isLastItem ? <></> : <Flex ml="10px"><ArrowDoubleArrowIcon/></Flex>}
            </Flex>
          </Fragment>
        )
      })}
    </Flex>
  )
})
