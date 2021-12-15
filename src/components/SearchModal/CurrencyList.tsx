import { Currency, CurrencyAmount, currencyEquals, ETHER, Token } from 'definixswap-sdk'
import React, { CSSProperties, MutableRefObject } from 'react'
import { FixedSizeList } from 'react-window'
import styled from 'styled-components'
import { Text, Flex, Box } from '@fingerlabs/definixswap-uikit-v2'
import { useActiveWeb3React } from '../../hooks'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import CurrencyLogo from '../CurrencyLogo'
import { MenuItem } from './styleds'
import Loader from '../Loader'

const StyledBalanceText = styled(Text)`
  white-space: nowrap;
  overflow: hidden;
  max-width: 5rem;
  text-overflow: ellipsis;
`

function Balance({ balance }: { balance: CurrencyAmount }) {
  // return <></>
  return <StyledBalanceText textStyle="R_16R" title={balance.toExact()}>{balance.toSignificant(4)}</StyledBalanceText>
}

function CurrencyRow({
  currency,
  onSelect,
  isSelected,
  otherSelected,
  style,
}: {
  currency: Currency
  onSelect: () => void
  isSelected: boolean
  otherSelected: boolean
  style: CSSProperties
}) {
  const { account } = useActiveWeb3React()
  const balance = useCurrencyBalance(account ?? undefined, currency)

  // only show add or remove buttons if not on selected list
  return (
    <MenuItem
      style={style}
      // className={`token-item-${key}`}
      onClick={() => (isSelected ? null : onSelect())}
      disabled={isSelected}
      selected={otherSelected}
    >
      <Flex alignItems="center">
        <CurrencyLogo currency={currency} size="32px" />
        <Text ml="12px">{currency.symbol}</Text>
      </Flex>

      {/* <TokenTags currency={currency} /> */}

      <Flex justifySelf="flex-end">
        {balance ? <Balance balance={balance} /> : account ? <Loader /> : null}
      </Flex>
    </MenuItem>
  )
}

export default function CurrencyList({
  currencies,
  selectedCurrency,
  onCurrencySelect,
  otherCurrency,
  fixedListRef,
}: {
  currencies: Currency[]
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherCurrency?: Currency | null
  fixedListRef?: MutableRefObject<FixedSizeList | undefined>
}) {

  return (
    <Box height="auto">
      {
        currencies.map((item) => {
          const currency = item;
          return <CurrencyRow
            key={item.symbol}
            style={{}}
            currency={currency}
            isSelected={Boolean(selectedCurrency && currencyEquals(selectedCurrency, currency))}
            onSelect={() => onCurrencySelect(currency)}
            otherSelected={Boolean(otherCurrency && currencyEquals(otherCurrency, currency))}
          />
        })
      }
    </Box>
  )
}
