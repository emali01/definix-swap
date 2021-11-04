import { Currency, Pair } from 'definixswap-sdk'
import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { Text, useMatchBreakpoints, Flex, AnountButton, SmallDownIcon, ColorStyles } from 'definixswap-uikit'
import { useActiveWeb3React } from '../../hooks'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import { TranslateString } from '../../utils/translateTextHelpers'
import CurrencyLogo from '../CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
import { Input as NumericalInput } from '../NumericalInput'
import CurrencySearchModal from '../SearchModal/CurrencySearchModal'

const Container = styled.div<{ hideInput: boolean }>``;

const InputBox = styled.div`
  display: flex;
  /* flex-flow: row nowrap; */
  /* flex-wrap: wrap; */
  /* align-items: center; */
  /* justify-content: flex-end; */
`
const CurrencySelect = styled.button<{ selected: boolean }>`
  align-items: center;
  background-color: transparent;
  outline: none;
  cursor: pointer;
  user-select: none;
  border: none;
  /* :focus,
  :hover {
    background-color: ${({ theme }) => theme.colors.tertiary};
  } */
`

interface CurrencyInputPanelProps {
  value: string
  showMaxButton: boolean
  label?: string
  currency?: Currency | null
  disableCurrencySelect?: boolean
  hideBalance?: boolean
  pair?: Pair | null
  hideInput?: boolean
  otherCurrency?: Currency | null
  id: string
  showCommonBases?: boolean
  className?: string
  onMax?: () => void
  onQuarter?: () => void
  onHalf?: () => void
  onUserInput: (value: string) => void
  onCurrencySelect?: (currency: Currency) => void
}

export default function CurrencyInputPanel({
  value,
  showMaxButton,
  label = TranslateString(132, 'Input'),
  currency,
  disableCurrencySelect = false,
  hideBalance = false,
  pair = null, // used for double token logo
  hideInput = false,
  otherCurrency,
  id,
  showCommonBases,
  className,
  onMax,
  onQuarter,
  onHalf,
  onUserInput,
  onCurrencySelect,
}: CurrencyInputPanelProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const { account } = useActiveWeb3React()
  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  const { isXl, isMd, isLg } = useMatchBreakpoints()
  const isMobile = !isXl && !isMd && !isLg

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  return (
    <>
      <Container id={id} hideInput={hideInput} className={className}>
        {!hideInput && (
          <div className="flex justify-space-between mb-1">
            {account && (
              <Flex>
                <Text textStyle="R_14R" color={ColorStyles.DEEPGREY} mr="4px" >
                  Balance
                </Text>
                <Text textStyle="R_14B" color={ColorStyles.DEEPGREY}>
                  {!hideBalance && !!currency && selectedCurrencyBalance
                    ? selectedCurrencyBalance?.toSignificant(6)
                    : '-'}
                </Text>
              </Flex>
             
            )}
          </div>
        )}

        <InputBox>
          {!hideInput && (
            <NumericalInput
              value={value}
              onUserInput={(val) => onUserInput(val)}
            />
          )}

          <CurrencySelect
            selected={!!currency}
            className="open-currency-select-button"
            onClick={() => {
              if (!disableCurrencySelect) {
                setModalOpen(true)
              }
            }}
          >
            <Flex>
              <Flex alignItems="center" flex="1 1 0" mr="6px">
                <Flex>
                  {!disableCurrencySelect && <SmallDownIcon />}
                </Flex>
              </Flex>
              <Flex flexDirection="column" alignItems="center">
                <Flex mb="5px">
                  {pair ? (
                      <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={16} margin />
                    ) : currency ? (
                      <CurrencyLogo currency={currency} size="40px" />
                  ) : null}
                </Flex>
                {pair ? (
                  <Text textStyle="R_14B" color={ColorStyles.BLACK}>
                    {pair?.token0.symbol}:{pair?.token1.symbol}
                  </Text>
                ) : (
                  <Text
                    textStyle="R_14B"
                    color={ColorStyles.BLACK}
                  >
                    {(currency && currency.symbol && currency.symbol.length > 20
                      ? `${currency.symbol.slice(0, 4)}...${currency.symbol.slice(
                          currency.symbol.length - 5,
                          currency.symbol.length
                        )}`
                      : currency?.symbol) || <Text textStyle="R_14B" color={ColorStyles.BLACK}>Select Token</Text>}
                  </Text>
                )}
              </Flex>
            </Flex>
          </CurrencySelect>

        </InputBox>

        {account && currency && label !== 'To' && (
          <div className="flex align-center" style={{ width: isMobile ? '100%' : 'auto' }}>
            <AnountButton onClick={onQuarter} mr="6px">
              25%
            </AnountButton>
            <AnountButton onClick={onHalf} mr="6px">
              50%
            </AnountButton>
            <AnountButton onClick={onMax}>
              MAX
            </AnountButton>
          </div>
        )}

      </Container>

      {!disableCurrencySelect && onCurrencySelect && (
        <CurrencySearchModal
          isOpen={modalOpen}
          onDismiss={handleDismissSearch}
          onCurrencySelect={onCurrencySelect}
          selectedCurrency={currency}
          otherSelectedCurrency={otherCurrency}
          showCommonBases={showCommonBases}
        />
      )}
    </>
  )
}
