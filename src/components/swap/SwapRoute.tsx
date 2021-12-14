import { Trade } from 'definixswap-sdk'
import React, { Fragment, memo } from 'react'
import { Text, Flex, ArrowDoubleArrowIcon, ColorStyles } from 'definixswap-uikit-v2'
import { useTranslation } from 'react-i18next'
import CurrencyLogo from '../CurrencyLogo'

export default memo(function SwapRoute({ trade, isMobile, isPriceImpactCaution }: { 
  trade: Trade; 
  isMobile: boolean; 
  isPriceImpactCaution?:boolean; 
}) {
  const { t } = useTranslation();
  return (
    <Flex alignItems="center" justifyContent="flex-end" flexWrap="wrap" alignContent="">
      {!isPriceImpactCaution && trade.route.path.map((token, i, path) => {
        const isLastItem: boolean = i === path.length - 1
        return (
          // eslint-disable-next-line react/no-array-index-key
          <Fragment key={i}>
            <Flex alignItems="center" ml="10px" mb="6px">
              <CurrencyLogo currency={token} size={isMobile ? "20px" : "22px"} />
              <Text textStyle="R_14M" color={ColorStyles.DEEPGREY} ml="6px">
                {token.symbol}
              </Text>
              {!isLastItem && <Flex ml="10px"><ArrowDoubleArrowIcon/></Flex>}
            </Flex>
          </Fragment>
        )
      })}
      {isPriceImpactCaution && <Text textStyle="R_14M" color={ColorStyles.DEEPGREY}>{t('There are no routes.')}</Text>}
    </Flex>
  )
})
