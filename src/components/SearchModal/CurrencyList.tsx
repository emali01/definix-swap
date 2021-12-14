import { Currency, CurrencyAmount, currencyEquals, ETHER, Token } from 'definixswap-sdk'
import React, { CSSProperties, MutableRefObject } from 'react'
import { FixedSizeList } from 'react-window'
import styled from 'styled-components'
import { Text, Flex, Box } from 'definixswap-uikit-v2'
import { useActiveWeb3React } from '../../hooks'
import { useSelectedTokenList, WrappedTokenInfo } from '../../state/lists/hooks'
import { useAddUserToken, useRemoveUserAddedToken } from '../../state/user/hooks'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import { LinkStyledButton } from '../Shared'
import { useIsUserAddedToken } from '../../hooks/Tokens'
import CurrencyLogo from '../CurrencyLogo'
import { FadedSpan, MenuItem } from './styleds'
import Loader from '../Loader'
import { isTokenOnList } from '../../utils'

function currencyKey(currency: Currency): string {
  return currency instanceof Token ? currency.address : currency === ETHER ? 'ETHER' : ''
}

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
  const { account, chainId } = useActiveWeb3React()
  const key = currencyKey(currency)
  const selectedTokenList = useSelectedTokenList()
  const isOnSelectedList = isTokenOnList(selectedTokenList, currency)
  const customAdded = useIsUserAddedToken(currency)
  const balance = useCurrencyBalance(account ?? undefined, currency)

  const removeToken = useRemoveUserAddedToken()
  const addToken = useAddUserToken()

  // only show add or remove buttons if not on selected list
  return (
    <MenuItem
      style={style}
      // className={`token-item-${key}`}
      onClick={() => (isSelected ? null : onSelect())}
      disabled={isSelected}
      selected={otherSelected}
    >
      <CurrencyLogo currency={currency} size="32px" />
      <Flex>
        <Text title={currency.name}>{currency.symbol}</Text>
        <FadedSpan>
          {!isOnSelectedList && customAdded && !(currency instanceof WrappedTokenInfo) ? (
            <Text>
              Added by user
              <LinkStyledButton
                onClick={(event) => {
                  event.stopPropagation()
                  if (chainId && currency instanceof Token) removeToken(chainId, currency.address)
                }}
              >
                (Remove)
              </LinkStyledButton>
            </Text>
          ) : null}
          {!isOnSelectedList && !customAdded && !(currency instanceof WrappedTokenInfo) ? (
            <Text>
              Found by address
              <LinkStyledButton
                onClick={(event) => {
                  event.stopPropagation()
                  if (currency instanceof Token) addToken(currency)
                }}
              >
                (Add)
              </LinkStyledButton>
            </Text>
          ) : null}
        </FadedSpan>
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
