import React from 'react';
import { useTranslation } from 'react-i18next';
import { ColorStyles, Flex, Text } from 'definixswap-uikit-v2';
import { Field } from 'state/mint/actions';
import DoubleCurrencyLogo from 'components/DoubleLogo';
import { Currency, TokenAmount } from 'definixswap-sdk';

interface IProps {
  noLiquidity: boolean;
  currencies: {
    CURRENCY_A?: Currency;
    CURRENCY_B?: Currency;
  };
  liquidityMinted: TokenAmount;
}

const ModalHeader: React.FC<IProps> = ({
  noLiquidity,
  currencies,
  liquidityMinted,
}) => {
  const { t } = useTranslation();
  return (
    <>
      {!noLiquidity ? (
        <Flex alignItems="center">
          <DoubleCurrencyLogo
            currency0={currencies[Field.CURRENCY_A]}
            currency1={currencies[Field.CURRENCY_B]}
            size={32}
          />
          <Text textStyle="R_16M" color={ColorStyles.BLACK}>
            {`${currencies[Field.CURRENCY_A]?.symbol}/${currencies[Field.CURRENCY_B]?.symbol}`}
          </Text>
        </Flex>
      ) : (
        <Flex flexDirection="column">
          <Text textStyle="R_16M" color={ColorStyles.DEEPGREY}>{t('You are creating a pool')}</Text>
          <Flex justifyContent="space-between" alignItems="center" p="14px 0px" mb="20px">
            <Flex alignItems="center">
              <DoubleCurrencyLogo
                currency0={currencies[Field.CURRENCY_A]}
                currency1={currencies[Field.CURRENCY_B]}
                size={32}
              />
              <Text ml="10px" textStyle="R_16M" color={ColorStyles.BLACK}>
                {`${currencies[Field.CURRENCY_A]?.symbol}-${currencies[Field.CURRENCY_B]?.symbol}`}
              </Text>
            </Flex>

            <Text textStyle="R_16R" color={ColorStyles.BLACK}>
              {liquidityMinted?.toSignificant(6)}
            </Text>
          </Flex>
        </Flex>
      )}
    </>
  )
}

export default ModalHeader;