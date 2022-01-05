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
  ImgEmptyStateWallet,
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
import { Link, useHistory } from 'react-router-dom'
import { usePairAdder } from 'state/user/hooks'
import { useTokenBalance } from 'state/wallet/hooks'
import { currencyId } from 'utils/currencyId'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { useTranslation } from 'react-i18next'

enum Fields {
  TOKEN0 = 0,
  TOKEN1 = 1,
}

export default function PoolFinder() {
  const history = useHistory()
  const { account } = useActiveWeb3React()

  const { t } = useTranslation()
  const { isXl, isXxl } = useMatchBreakpoints()
  const isMobile = useMemo(() => !isXl && !isXxl, [isXl, isXxl])

  const [showSearch, setShowSearch] = useState<boolean>(false)
  const [activeField, setActiveField] = useState<number>(Fields.TOKEN0)

  const [currency0, setCurrency0] = useState<Currency | null>(ETHER)
  const [currency1, setCurrency1] = useState<Currency | null>(null)

  const [pairState, pair] = usePair(currency0 ?? undefined, currency1 ?? undefined)
  const addPair = usePairAdder()

  const position: TokenAmount | undefined = useTokenBalance(account ?? undefined, pair?.liquidityToken)
  const hasPosition = useMemo(() => Boolean(position && JSBI.greaterThan(position.raw, JSBI.BigInt(0))), [position])

  const handleSearchDismiss = useCallback(() => {
    setShowSearch(false)
  }, [setShowSearch])

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      if (activeField === Fields.TOKEN0) {
        setCurrency0(currency)
      } else {
        setCurrency1(currency)
      }
    },
    [activeField]
  )

  const renderModal = useCallback(() => {
    return (
      <CurrencySearchModal
        isOpen={showSearch}
        onCurrencySelect={handleCurrencySelect}
        onDismiss={handleSearchDismiss}
        showCommonBases
        selectedCurrency={(activeField === Fields.TOKEN0 ? currency1 : currency0) ?? undefined}
      />
    )
  }, [activeField, currency0, currency1, handleCurrencySelect, handleSearchDismiss, showSearch])

  const [onPresentCurrencySearchModal] = useModal(renderModal(), false)

  const onClickSelectTokenButton = useCallback(
    (field: Fields) => {
      setShowSearch(true)
      onPresentCurrencySearchModal()
      setActiveField(field)
    },
    [setShowSearch, onPresentCurrencySearchModal, setActiveField]
  )

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
        {account && (
          <>
            <Flex
              position="relative"
              height="48px"
              borderRadius="8px"
              border="1px solid"
              borderColor={ColorStyles.LIGHTGREY}
              onClick={() => onClickSelectTokenButton(Fields.TOKEN0)}
              justifyContent="center"
              alignItems="center"
              style={{ cursor: 'pointer' }}
            >
              {currency0 ? (
                <>
                  <Flex>
                    <Coin symbol={currency0.symbol} size="32px" />
                    <Text ml="10px" textStyle="R_16M" color={ColorStyles.BLACK} style={{ alignSelf: 'center' }}>
                      {currency0.symbol}
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

            <Flex justifyContent="center" m="12px 0">
              <ChangePlusIcon />
            </Flex>

            <Flex
              position="relative"
              height="48px"
              borderRadius="8px"
              border="1px solid"
              borderColor={ColorStyles.LIGHTGREY}
              onClick={() => onClickSelectTokenButton(Fields.TOKEN1)}
              justifyContent="center"
              alignItems="center"
              style={{ cursor: 'pointer' }}
            >
              {currency1 ? (
                <>
                  <Flex>
                    <Coin symbol={currency1.symbol} size="32px" />
                    <Text ml="10px" textStyle="R_16M" color={ColorStyles.BLACK} style={{ alignSelf: 'center' }}>
                      {currency1.symbol}
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
          </>
        )}
        {!account && (
          <Flex flexDirection="column" justifyContent="center" alignItems="center">
            <Box mb="24px">
              <ImgEmptyStateWallet />
            </Box>
            <Text mb="60px" textStyle="R_16M" color={ColorStyles.DEEPGREY} textAlign="center">
              {t('Connect to a wallet to view')}
            </Text>
            <ConnectWalletButton />
          </Flex>
        )}
      </Flex>
    </Flex>
  )
}
