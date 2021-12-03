import { Currency, Pair } from 'definixswap-sdk'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { 
  Text,
  Flex,
  Box,
  AnountButton,
  SmallDownIcon,
  ColorStyles,
  Noti,
  NotiType,
  UnSelectTokenIcon,
  useModal,
  textStyle
} from 'definixswap-uikit'
import { useWallet } from '@sixnetwork/klaytn-use-wallet'
import { escapeRegExp } from 'utils'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import { TranslateString } from '../../utils/translateTextHelpers'
import CurrencyLogo from '../CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
import { Input as NumericalInput } from '../NumericalInput'
import CurrencySearchModal from '../SearchModal/CurrencySearchModal'

interface CurrencyInputPanelProps {
  isMobile: boolean;
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
  isInsufficientBalance?: boolean
}

const Container = styled.div<{ hideInput: boolean }>``;

const InputBox = styled.div`
  display: flex;
  justify-content: space-between;
`
const CurrencySelect = styled.button<{ selected: boolean }>`
  padding: 0;
  align-items: center;
  background-color: transparent;
  outline: none;
  cursor: pointer;
  user-select: none;
  border: none;
`
const Input = styled.input`
  width: 100%;
  border: none;
  outline: none;
  ${textStyle.R_14M}
  ${ColorStyles.BLACK}
`;

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`) // match escaped "." characters via in a non-capturing group
export const CurrencyInputPanelOnRemoveLP: React.FC<any> = ({
  onMax,
  onHalf,
  onQuarter,
  onUserInput,
  value,
  currency,
  currencyA,
  currencyB
}) => {
  const enforcer = (nextUserInput: string) => {
    if (nextUserInput === '' || inputRegex.test(escapeRegExp(nextUserInput))) {
      onUserInput(nextUserInput)
    }
  };

  return (
    <Flex flexDirection="column">
      <Flex alignItems="center" mb="16px">
        {currencyA && currencyB && (
          <>
            <Box mr="10px">
              <DoubleCurrencyLogo size={32} currency0={currencyA} currency1={currencyB}/>
            </Box>
            <Text textStyle="R_16M" color={ColorStyles.DEEPGREY}>
              {currencyA?.symbol}-{currencyB?.symbol}
            </Text>
          </>
        )}
        {currency && (
          <>
            <Box mr="10px">
              <CurrencyLogo size="32px" currency={currency}/>
            </Box>
            <Text textStyle="R_16M" color={ColorStyles.DEEPGREY}>
              {currency?.symbol}
            </Text>
          </>
        )}
      </Flex>
      <Flex
        width="100%"
        borderRadius="8px"
        border="solid 1px #e0e0e0"
        p="14px 12px 14px 16px"
        justifyContent="space-between"
        alignItems="center"
      >
        <Input
          value={value}
          onChange={(event) => {
            // replace commas with periods, because uniswap exclusively uses period as the decimal separator
            enforcer(event.target.value.replace(/,/g, '.'))
          }}
        />
        <Flex>
          <AnountButton onClick={onQuarter} mr="6px">
            25%
          </AnountButton>
          <AnountButton onClick={onHalf} mr="6px">
            50%
          </AnountButton>
          <AnountButton onClick={onMax}>
            MAX
          </AnountButton>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default function CurrencyInputPanel({
  isMobile,
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
  isInsufficientBalance,
}: CurrencyInputPanelProps) {
  const { t } = useTranslation();
  const { account } = useWallet()
  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  const handleDismissSearch = useCallback(() => {
    // setModalOpen(false)
  }, [])

  const [onPresentCurrencySearchModal] = useModal(<CurrencySearchModal
    // onChangeList={() => {
    //   console.log('onChangeList')
    // }}
    onCurrencySelect={onCurrencySelect}
    selectedCurrency={currency}
    otherSelectedCurrency={otherCurrency}
    showCommonBases={false}
  />, false)


  return (
    <>
      <Container id={id} hideInput={hideInput} className={className}>
        <InputBox>
          {!hideInput && (
            <Flex flexDirection="column" flex="1" position="relative">
              {account && (
                <Flex mb="4px">
                  <Text textStyle="R_14R" color={ColorStyles.DEEPGREY} mr="4px" >
                    {t('Balance')}
                  </Text>
                  <Text textStyle="R_14B" color={ColorStyles.DEEPGREY}>
                    {!hideBalance && !!currency && selectedCurrencyBalance
                      ? selectedCurrencyBalance?.toSignificant(6)
                      : '-'}
                  </Text>
                </Flex>
              )}
              <NumericalInput
                value={value}
                onUserInput={(val) => onUserInput(val)}
              />
              {(account && currency && showMaxButton) && 
                <>
                  <Flex mt="8px">
                    <AnountButton onClick={onQuarter} mr="6px">
                      25%
                    </AnountButton>
                    <AnountButton onClick={onHalf} mr="6px">
                      50%
                    </AnountButton>
                    <AnountButton onClick={onMax}>
                      MAX
                    </AnountButton>
                  </Flex>
                  {isInsufficientBalance && <Noti type={NotiType.ALERT} mt="12px">
                    {t('Insufficient balance')}
                  </Noti>}
                </>
              }
            </Flex>
          )}

          <CurrencySelect
            selected={!!currency}
            className="open-currency-select-button"
            onClick={() => {
              if (!disableCurrencySelect) {
                onPresentCurrencySearchModal();
              }
            }}
          >
            <Flex>
              <Flex alignItems="center" height={isMobile ? "32px" : "40px"} mr="6px">
                <Flex>
                  {!disableCurrencySelect && <SmallDownIcon />}
                </Flex>
              </Flex>
              <Flex flexDirection="column" alignItems="center">
                <Flex mb="5px">
                  {pair ? (
                      <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={16} margin />
                    ) : currency ? (
                      <CurrencyLogo currency={currency} size={isMobile ? "32px" : "40px"} />
                  ) : <UnSelectTokenIcon viewBox="0 0 40 40" width={isMobile ? "32" : "40"} height={isMobile ? "32" : "40"} />}
                </Flex>
                {pair ? (
                  <Text textStyle={isMobile ? "R_12B" : "R_14B"} color={ColorStyles.BLACK}>
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
                      : currency?.symbol) || 
                        <Text textStyle="R_14B" color={ColorStyles.BLACK}>{t('Token')}</Text>
                  }
                  </Text>
                )}
              </Flex>
            </Flex>
          </CurrencySelect>
        </InputBox>
      </Container>

      {/* {!disableCurrencySelect && onCurrencySelect && (
        <CurrencySearchModal
          isOpen={modalOpen}
          onDismiss={handleDismissSearch}
          onCurrencySelect={onCurrencySelect}
          selectedCurrency={currency}
          otherSelectedCurrency={otherCurrency}
          showCommonBases={showCommonBases}
        />
      )} */}
    </>
  )
}
