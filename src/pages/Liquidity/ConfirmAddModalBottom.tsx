import { Currency, CurrencyAmount, Fraction, Percent } from 'definixswap-sdk'
import React from 'react'
import { Flex, Button, Text, ColorStyles, ButtonScales, NotiIcon } from 'definixswap-uikit'
import { useTranslation } from 'react-i18next'
import { Field } from 'state/mint/actions'

function ConfirmAddModalBottom({
  noLiquidity,
  price,
  currencies,
  parsedAmounts,
  poolTokenPercentage,
  onAdd,
  allowedSlippage,
}: {
  noLiquidity?: boolean
  price?: Fraction
  currencies: { [field in Field]?: Currency }
  parsedAmounts: { [field in Field]?: CurrencyAmount }
  poolTokenPercentage?: Percent
  onAdd: () => void
  allowedSlippage: number;
}) {
  const { t } = useTranslation();

  return (
    <>
      <Flex flexDirection="column">
        <Text textStyle="R_16M" color={ColorStyles.DEEPGREY} mb="12px">{t('Estimated Returns')}</Text>

        <Flex justifyContent="space-between" mb="8px">
          <Text textStyle="R_14R" color={ColorStyles.MEDIUMGREY}>Deposited</Text>
          <Flex flexDirection="column" alignItems="flex-end">
            <Text textStyle="R_14M" color={ColorStyles.DEEPGREY}>
              {parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} {currencies[Field.CURRENCY_A]?.symbol}
            </Text>
            <Text textStyle="R_14M" color={ColorStyles.DEEPGREY}>
              {parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} {currencies[Field.CURRENCY_B]?.symbol}
            </Text>
          </Flex>
        </Flex>

        <Flex justifyContent="space-between" mb="8px">
          <Text textStyle="R_14R" color={ColorStyles.MEDIUMGREY}>Price Rate</Text>
          <Flex flexDirection="column">
            <Text textStyle="R_14M" color={ColorStyles.DEEPGREY}>
                {`1 ${currencies[Field.CURRENCY_A]?.symbol} = ${price?.toSignificant(4)} ${
                  currencies[Field.CURRENCY_B]?.symbol
                }`}
            </Text>
            <Text textStyle="R_14M" color={ColorStyles.DEEPGREY}>
              {`1 ${currencies[Field.CURRENCY_B]?.symbol} = ${price?.invert().toSignificant(4)} ${
                currencies[Field.CURRENCY_A]?.symbol
              }`}
            </Text>
          </Flex>
        </Flex>

        <Flex justifyContent="space-between" mb="20px">
          <Text textStyle="R_14R" color={ColorStyles.MEDIUMGREY}>{t('Share of Pool')}</Text>
          <Text textStyle="R_14M" color={ColorStyles.DEEPGREY}>
            {noLiquidity ? '100' : poolTokenPercentage?.toSignificant(4)}%
          </Text>
        </Flex>
      </Flex>

      <Flex>
        <NotiIcon />
        <Text ml="4px" textStyle="R_12R" color={ColorStyles.MEDIUMGREY} mb="32px">
          Output is estimated. If the price changes by more than {allowedSlippage / 100}% your transaction will revert.
        </Text>
      </Flex>

      <Button onClick={onAdd} width="100%" scale={ButtonScales.LG}>
        {noLiquidity ? 'Create Pool & Supply' : 'Confirm Supply'}
      </Button>
    </>
  )
}

export default ConfirmAddModalBottom
