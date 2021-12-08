import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Flex, TitleSet, useMatchBreakpoints, Tabs, ColorStyles } from 'definixswap-uikit'
import LiquidityList from './LiquidityList'
import AddLiquidity from './AddLiquidity'

const Liquidity: React.FC = () => {
  const { isXl, isXxl } = useMatchBreakpoints()
  const isMobile = useMemo(() => !isXl && !isXxl, [isXl, isXxl])
  const { t } = useTranslation();

  const tabNames = useMemo(() => [t('Add'), t('Remove')], [t]);
  const [curTab, setCurTab] = useState<string>(tabNames[0]);
  return (
    <Flex width="100%" justifyContent="center">
      <Flex flexDirection="column" width={isMobile ? "100%" : "629px"}>
        <Flex mb="40px">
          <TitleSet
            title={t("Liquidity")}
            description={t("Pair tokens and add to liquidity to earn high interest profit")}
            link="/"
            linkLabel={t("Learn how to add Liquidity")}
          />
        </Flex>
        <Flex
          flexDirection="column"
        >
          <Box
            backgroundColor={ColorStyles.WHITE}
            borderTopLeftRadius="16px"
            borderTopRightRadius="16px"
          >
            <Tabs 
              tabs={tabNames}
              curTab={curTab}
              setCurTab={setCurTab}
              small={isMobile}
              equal={isMobile}
            />
          </Box>
          <Box>
            {curTab === tabNames[0] && (
              <AddLiquidity />
            )}
            {curTab === tabNames[1] && (
              <LiquidityList />
            )}
          </Box>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default React.memo(Liquidity);