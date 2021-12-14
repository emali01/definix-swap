import { Currency, Pair } from 'definixswap-sdk'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import BigNumber from "bignumber.js";
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
  textStyle,
  useMatchBreakpoints,
} from 'definixswap-uikit-v2'
import { useCaverJsReact } from '@sixnetwork/caverjs-react-core'
import { escapeRegExp } from 'utils'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import CurrencyLogo from '../CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
import { Input as NumericalInput } from '../NumericalInput'
import CurrencySearchModal from '../SearchModal/CurrencySearchModal'

interface CurrencyInputPanelProps {
  isMobile: boolean;
  value: string
  showMaxButton: boolean
  currency?: Currency | null
  disableCurrencySelect?: boolean
  hideBalance?: boolean
  pair?: Pair | null
  hideInput?: boolean
  otherCurrency?: Currency | null
  id: string
  onMax?: () => void
  onQuarter?: () => void
  onHalf?: () => void
  onUserInput: (value: string) => void
  onCurrencySelect?: (currency: Currency) => void
  isInsufficientBalance?: boolean
  maxTokenAmount?: string
}

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
  const { isXl, isXxl } = useMatchBreakpoints()
  const isMobile = useMemo(() => !isXl && !isXxl, [isXl, isXxl])
  const { t } = useTranslation();
  const enforcer = (nextUserInput: string) => {
    if (nextUserInput === '' || inputRegex.test(escapeRegExp(nextUserInput))) {
      onUserInput(nextUserInput)
    }
  };

  return (
    <Flex flexDirection="column">
      <Flex alignItems="center" mb={isMobile ? "8px" : "16px"}>
        {currencyA && currencyB && (
          <>
            <Box mr={isMobile ? "12px" : "10px"}>
              <DoubleCurrencyLogo size={32} currency0={currencyA} currency1={currencyB}/>
            </Box>
            <Text textStyle="R_16M" color={ColorStyles.DEEPGREY}>
              {currencyA?.symbol}-{currencyB?.symbol}
            </Text>
          </>
        )}
        {currency && (
          <>
            <Box mr={isMobile ? "12px" : "10px"}>
              <CurrencyLogo size="32px" currency={currency}/>
            </Box>
            <Text
              textStyle="R_16M"
              color={ColorStyles.DEEPGREY}
            >
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
          placeholder="0"
          value={value}
          onChange={(event) => {
            // replace commas with periods, because uniswap exclusively uses period as the decimal separator
            enforcer(event.target.value.replace(/,/g, '.'))
          }}
        />
        <Flex>
          <AnountButton 
            onClick={onQuarter} 
            mr="6px" 
            backgroundColor="rgba(224, 224, 224, 0.3)"
          >
            {t('25%')}
          </AnountButton>
          <AnountButton 
            onClick={onHalf}
            mr="6px"
            backgroundColor="rgba(224, 224, 224, 0.3)"
          >
            {t('50%')}
          </AnountButton>
          <AnountButton 
            onClick={onMax}
            backgroundColor="rgba(224, 224, 224, 0.3)"
          >
            {t('MAX')}
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
  currency,
  disableCurrencySelect = false,
  hideBalance = false,
  pair = null, // used for double token logo
  hideInput = false,
  otherCurrency,
  id,
  onMax,
  onQuarter,
  onHalf,
  onUserInput,
  onCurrencySelect,
  isInsufficientBalance,
  maxTokenAmount,
}: CurrencyInputPanelProps) {
  const { t } = useTranslation();
  const { account } = useCaverJsReact()
  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  const [isMaxKlayNoti, setIsMaxKlayNoti] = useState<boolean>(false);
  const [balance, setBalance] = useState<string>('');

  const [onPresentCurrencySearchModal] = useModal(
  <CurrencySearchModal
    onCurrencySelect={onCurrencySelect}
    selectedCurrency={currency}
    otherSelectedCurrency={otherCurrency}
  />, false);

  const decimals = useMemo(() => 18, []);
  const overDp = useMemo(() => new BigNumber(value).decimalPlaces() > decimals, [value, decimals])

  const renderNoti = useCallback(() => {
    if(isInsufficientBalance){
      return (
        <Noti type={NotiType.ALERT} mt="12px">
          {t('Insufficient balance')}
        </Noti>
      )
    }
    if(isMaxKlayNoti) {
      return (
        <Noti type={NotiType.ALERT} mt="12px">
          {t('Full payment of KLAY')}
        </Noti>
      )
    }
    if(overDp){
      return (
        <Noti type={NotiType.ALERT} mt="12px">
          {t('The value entered is out of the valid range')}
        </Noti>
      )
    }
    return null;
  }, [isInsufficientBalance, isMaxKlayNoti, t, overDp]);

  useEffect(() => {
    if(!hideBalance && !!currency && selectedCurrencyBalance){
      setBalance(selectedCurrencyBalance?.toFixed(5));
      return;
    }
    setBalance('-');
  }, [hideBalance, currency, selectedCurrencyBalance])


  useEffect(() => {
    if(currency?.symbol === 'KLAY'){
      if(value >= balance) setIsMaxKlayNoti(true);
    }
    setIsMaxKlayNoti(false);
  }, [value, balance, maxTokenAmount, currency?.symbol]);

  return (
    <>
      <Box id={id} mb="12px">
        <InputBox>
          {!hideInput && (
            <Flex flexDirection="column" flex="1" position="relative">
              <Flex mb="4px">
                <Text textStyle="R_14R" color={ColorStyles.DEEPGREY} mr="4px" >
                  {t('Balance')}
                </Text>
                <Text textStyle="R_14B" color={ColorStyles.DEEPGREY}>
                  {balance}
                </Text>
              </Flex>
              <NumericalInput
                value={value}
                onUserInput={(val) => onUserInput(val)}
              />
              {(account && currency && onQuarter && onHalf && onMax) && 
                <>
                  <Flex mt="8px">
                    <AnountButton onClick={onQuarter} mr="6px">
                      {t('25%')}
                    </AnountButton>
                    <AnountButton onClick={onHalf} mr="6px">
                      {t('50%')}
                    </AnountButton>
                    <AnountButton onClick={onMax}>
                      {t('MAX')}
                    </AnountButton>
                  </Flex>
                  {renderNoti()}
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
                  {pair && <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={16} margin />}
                  {!pair && currency && <CurrencyLogo currency={currency} size={isMobile ? "32px" : "40px"} />}
                  {!pair && !currency && <UnSelectTokenIcon viewBox="0 0 40 40" width={isMobile ? "32" : "40"} height={isMobile ? "32" : "40"} />}
                </Flex>
                {pair && (
                  <Text textStyle={isMobile ? "R_12B" : "R_14B"} color={ColorStyles.BLACK}>
                    {pair?.token0.symbol}:{pair?.token1.symbol}
                  </Text>
                )}
                {!pair && (
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
                        <Text textStyle="R_14B" color={ColorStyles.BLACK}>
                          {t('Token')}
                        </Text>
                  }
                  </Text>
                )}
              </Flex>
            </Flex>
          </CurrencySelect>
        </InputBox>
      </Box>
    </>
  )
}
