import React from 'react';
import { Flex, Text, Box, useMatchBreakpoints, ColorStyles } from 'definixswap-uikit';
import { useTranslation } from 'react-i18next';

const NoLiquidity: React.FC<{children?: React.ReactNode}> = () => {
  const { t } = useTranslation();
  const { isLg } = useMatchBreakpoints();
  const isMobile = !isLg;

  return (
    <Flex 
      flexDirection="column"
      justifyContent="center"
      p={isMobile ? "20px 28px" : "24px 40px"}
      style={{backgroundColor: 'rgba(224, 224, 224, 0.2)'}}
    >
      <Flex mb="10px">
        <Box mr="6px" />
        <Text textStyle="R_16M" color={ColorStyles.DEEPGREY}>
          {t('You are the first liquidity provider.')}
        </Text>
      </Flex>
      <Text textStyle="R_14R" color={ColorStyles.MEDIUMGREY}>
        {t('The ratio of tokens you add will set the price of this pool.')}
      </Text>
      <Text textStyle="R_14R" color={ColorStyles.MEDIUMGREY}>
        {t('Once you are happy with the rate click supply to review.')}
      </Text>
    </Flex>
  );
}

export default NoLiquidity;