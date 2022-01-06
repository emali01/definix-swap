import {
  ArrowBottomGIcon,
  BackIcon,
  Box,
  Button,
  ButtonScales,
  ButtonVariants,
  ChangePlusIcon,
  Coin,
  ColorStyles,
  Flex,
  Noti,
  Text,
  TitleSet,
  useMatchBreakpoints,
  useModal,
} from '@fingerlabs/definixswap-uikit-v2'
import { MinimalPositionCard } from 'components/PositionCard'
import CurrencySearchModal from 'components/SearchModal/CurrencySearchModal'
import { PairState, usePair } from 'data/Reserves'
import { Currency, ETHER, JSBI, TokenAmount } from 'definixswap-sdk'
import { useActiveWeb3React } from 'hooks'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { usePairAdder } from 'state/user/hooks'
import { useTokenBalance } from 'state/wallet/hooks'
import { currencyId } from 'utils/currencyId'
import { useTranslation } from 'react-i18next'

const SelectCurrencyPanel = React.memo(({currency, onCurrencySelect, handleSearchDismiss}: any) => {
  const { t } = useTranslation();

  const [onPresentCurrencySearchModal] = useModal(
    <CurrencySearchModal
      onCurrencySelect={onCurrencySelect}
      onDismiss={handleSearchDismiss}
      selectedCurrency={currency}
    />
  , false)

  return (
    <Flex
      position="relative"
      height="48px"
      borderRadius="8px"
      border="1px solid"
      borderColor={ColorStyles.LIGHTGREY}
      onClick={onPresentCurrencySearchModal}
      justifyContent="center"
      alignItems="center"
      style={{ cursor: 'pointer' }}
    >
      {currency ? (
        <>
          <Flex>
            <Coin symbol={currency.symbol} size="32px" />
            <Text ml="10px" textStyle="R_16M" color={ColorStyles.BLACK} style={{ alignSelf: 'center' }}>
              {currency.symbol}
            </Text>
          </Flex>
        </>
      ) : (
        <Text textStyle="R_14M" color={ColorStyles.MEDIUMGREY}>
          {t('Select a token')}
        </Text>
      )}
      <Box position="absolute" right="20px">
        <ArrowBottomGIcon />
      </Box>
    </Flex>
  )
});

export default function PoolFinder() {
  const history = useHistory()
  const { account } = useActiveWeb3React()

  const { t } = useTranslation()
  const { isXl, isXxl } = useMatchBreakpoints()
  const isMobile = useMemo(() => !isXl && !isXxl, [isXl, isXxl])

  const [currency0, setCurrency0] = useState<Currency | null>(ETHER)
  const [currency1, setCurrency1] = useState<Currency | null>(null)

  const [pairState, pair] = usePair(currency0 ?? undefined, currency1 ?? undefined)
  const addPair = usePairAdder()

  const position: TokenAmount | undefined = useTokenBalance(account ?? undefined, pair?.liquidityToken)
  const hasPosition = useMemo(() => Boolean(position && JSBI.greaterThan(position.raw, JSBI.BigInt(0))), [position])

  const handleCurrency0 = useCallback((currency: Currency) => {
    if(currency === currency1){
      setCurrency1(currency0)
      setCurrency0(currency1)
      return;
    }
    setCurrency0(currency)
  }, [currency1, currency0]);

  const handleCurrency1 = useCallback((currency: Currency) => {
    if(currency === currency0){
      setCurrency0(currency1)
      setCurrency1(currency0)
      return;
    }
    setCurrency1(currency)
  }, [currency0, currency1]);

  const onClickCreatePoolButton = useCallback(() => {
    if (pair) {
      addPair(pair)
      history.replace(`/liquidity`)
    }
  }, [pair, addPair, history])

  const onClickAddLiquidityButton = useCallback(
    (currencyId0, currencyId1) => {
      history.replace(`/liquidity/add/${currencyId0}/${currencyId1}`)
    },
    [history]
  )

  useEffect(() => {
    if(!account) {
      history.push('/liquidity')
    }
  }, [account, history])

  return (
    <Flex flexDirection="column" width="100%" alignItems="center">
      <Flex flexDirection="column" width={isMobile ? '100%' : '629px'} mb="40px">
        <Flex mb="20px" onClick={() => history.replace('/liquidity')} style={{ cursor: 'pointer' }}>
          <BackIcon />
          <Text
            ml="6px"
            textStyle={isMobile ? 'R_14M' : 'R_16M'}
            color={ColorStyles.MEDIUMGREY}
            mt={isMobile ? '0px' : '-2px'}
          >
            {t('Back')}
          </Text>
        </Flex>
        <TitleSet title={t('Import Pool')} description={t('Use this tool to find')} />
      </Flex>

      <Flex
        flexDirection="column"
        width={isMobile ? '100%' : '629px'}
        p="40px"
        mb="80px"
        backgroundColor={ColorStyles.WHITE}
        borderRadius="16px"
        border="1px solid"
        borderColor={ColorStyles.YELLOWBG2}
        style={{ boxShadow: '0 12px 12px 0 rgba(254, 169, 72, 0.2)' }}
      >
        <SelectCurrencyPanel 
          currency={currency0}
          onCurrencySelect={handleCurrency0}
        />

        <Flex justifyContent="center" m="12px 0">
          <ChangePlusIcon />
        </Flex>

        <SelectCurrencyPanel 
          currency={currency1}
          onCurrencySelect={handleCurrency1}
        />

        {(!currency0 || !currency1) && (
          <Noti type="guide" mt="12px">
            {t('Select a token to find')}
          </Noti>
        )}

        {currency0 && currency1 && (
          <>
            {pairState === PairState.EXISTS && (
              <>
                {hasPosition && pair && (
                  <Flex mt="40px" flexDirection="column">
                    <MinimalPositionCard pair={pair} isPadding={false} />
                    <Button mt="40px" width="100%" scale={ButtonScales.LG} onClick={onClickCreatePoolButton}>
                      {t('Import')}
                    </Button>
                  </Flex>
                )}
                {(!hasPosition || !pair) && (
                  <Flex mt="40px" justifyContent="space-between" alignItems="center">
                    <Text textStyle="R_14R" color={ColorStyles.DEEPGREY}>
                      {t('You don’t have liquidity')}
                    </Text>
                    <Button
                      width="186px"
                      scale={ButtonScales.MD}
                      variant={ButtonVariants.BROWN}
                      onClick={() => onClickAddLiquidityButton(currencyId(currency0), currencyId(currency1))}
                    >
                      {t('Add Liquidity')}
                    </Button>
                  </Flex>
                )}
              </>
            )}
            {pairState === PairState.NOT_EXISTS && (
              <>
                <Flex mt="40px" flexDirection="column">
                  {pair && <MinimalPositionCard pair={pair} isPadding={false} />}
                  <Button
                    mt={pair ? '40px' : '0px'}
                    width="100%"
                    scale={ButtonScales.LG}
                    onClick={onClickCreatePoolButton}
                  >
                    {t('Import')}
                  </Button>
                </Flex>
              </>
            )}
          </>
        )}
      </Flex>
    </Flex>
  )
}
