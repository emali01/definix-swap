import { Currency, CurrencyAmount, Fraction, Percent } from 'definixswap-sdk'
import React from 'react'
import { Button, Text } from 'uikit-dev'
import CurrencyLogo from '../../components/CurrencyLogo'
import { RowBetween } from '../../components/Row'
import { Field } from '../../state/mint/actions'

export function ConfirmAddModalBottom({
  noLiquidity,
  price,
  currencies,
  parsedAmounts,
  poolTokenPercentage,
  onAdd,
}: {
  noLiquidity?: boolean
  price?: Fraction
  currencies: { [field in Field]?: Currency }
  parsedAmounts: { [field in Field]?: CurrencyAmount }
  poolTokenPercentage?: Percent
  onAdd: () => void
}) {
  return (
    <>
      <RowBetween className="my-2">
        <div className="flex align-center">
          <CurrencyLogo currency={currencies[Field.CURRENCY_A]} style={{ marginRight: '8px' }} />
          <div className="flex">
            <Text className="mr-1" bold>
              {currencies[Field.CURRENCY_A]?.symbol}
            </Text>
            <Text color="textSubtle">Deposited</Text>
          </div>
        </div>
        <div className="flex justify-end">
          <Text bold className="mr-1">
            {parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}
          </Text>
          <Text bold>{currencies[Field.CURRENCY_A]?.symbol}</Text>
        </div>
      </RowBetween>

      <RowBetween className="mt-2 mb-4">
        <div className="flex align-center">
          <CurrencyLogo currency={currencies[Field.CURRENCY_B]} style={{ marginRight: '8px' }} />
          <div className="flex">
            <Text className="mr-1" bold>
              {currencies[Field.CURRENCY_B]?.symbol}
            </Text>
            <Text color="textSubtle">Deposited</Text>
          </div>
        </div>
        <div className="flex justify-end">
          <Text bold className="mr-1">
            {parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}
          </Text>
          <Text bold>{currencies[Field.CURRENCY_B]?.symbol}</Text>
        </div>
      </RowBetween>

      <RowBetween className="my-1">
        <Text color="textSubtle">Rates</Text>

        <Text bold>
          {`1 ${currencies[Field.CURRENCY_A]?.symbol} = ${price?.toSignificant(4)} ${
            currencies[Field.CURRENCY_B]?.symbol
          }`}
        </Text>
      </RowBetween>

      <RowBetween className="mb-4" style={{ justifyContent: 'flex-end' }}>
        <Text bold>
          {`1 ${currencies[Field.CURRENCY_B]?.symbol} = ${price?.invert().toSignificant(4)} ${
            currencies[Field.CURRENCY_A]?.symbol
          }`}
        </Text>
      </RowBetween>

      <RowBetween className="my-1">
        <Text color="textSubtle">Share of Pool</Text>
        <Text bold>{noLiquidity ? '100' : poolTokenPercentage?.toSignificant(4)}%</Text>
      </RowBetween>

      <Button className="mt-6" onClick={onAdd} fullWidth radii="card">
        {noLiquidity ? 'Create Pool & Supply' : 'Confirm Supply'}
      </Button>
    </>
  )
}

export default ConfirmAddModalBottom
