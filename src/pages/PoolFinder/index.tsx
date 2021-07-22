import { BorderCard } from 'components/Card'
import { useTranslation } from 'contexts/Localization'
import { AutoColumn, ColumnCenter } from 'components/Column'
import CurrencyLogo from 'components/CurrencyLogo'
import { FindPoolTabs } from 'components/NavigationTabs'
import { MinimalPositionCard } from 'components/PositionCard'
import CurrencySearchModal from 'components/SearchModal/CurrencySearchModal'
import { StyledInternalLink } from 'components/Shared'
import { Dots } from 'components/swap/styleds'
import TranslatedText from 'components/TranslatedText'
import { PairState, usePair } from 'data/Reserves'
import { Currency, ETHER, JSBI, TokenAmount } from 'definixswap-sdk'
import { useActiveWeb3React } from 'hooks'
import React, { useCallback, useEffect, useState } from 'react'
import { usePairAdder } from 'state/user/hooks'
import { useTokenBalance } from 'state/wallet/hooks'
import { AddIcon, Button, CardBody, ChevronDownIcon, Text } from 'uikit-dev'
import { LeftPanel, MaxWidthLeft } from 'uikit-dev/components/TwoPanelLayout'
import { currencyId } from 'utils/currencyId'
import AppBody from '../AppBody'

enum Fields {
  TOKEN0 = 0,
  TOKEN1 = 1,
}

export default function PoolFinder() {
  const { t: translate } = useTranslation()
  const { account } = useActiveWeb3React()

  const [showSearch, setShowSearch] = useState<boolean>(false)
  const [activeField, setActiveField] = useState<number>(Fields.TOKEN1)

  const [currency0, setCurrency0] = useState<Currency | null>(ETHER)
  const [currency1, setCurrency1] = useState<Currency | null>(null)

  const [pairState, pair] = usePair(currency0 ?? undefined, currency1 ?? undefined)
  const addPair = usePairAdder()
  useEffect(() => {
    if (pair) {
      addPair(pair)
    }
  }, [pair, addPair])

  const validPairNoLiquidity: boolean =
    pairState === PairState.NOT_EXISTS ||
    Boolean(
      pairState === PairState.EXISTS &&
        pair &&
        JSBI.equal(pair.reserve0.raw, JSBI.BigInt(0)) &&
        JSBI.equal(pair.reserve1.raw, JSBI.BigInt(0))
    )

  const position: TokenAmount | undefined = useTokenBalance(account ?? undefined, pair?.liquidityToken)
  const hasPosition = Boolean(position && JSBI.greaterThan(position.raw, JSBI.BigInt(0)))

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

  const handleSearchDismiss = useCallback(() => {
    setShowSearch(false)
  }, [setShowSearch])

  return (
    <LeftPanel isShowRightPanel={false}>
      <MaxWidthLeft>
        <AppBody>
          <FindPoolTabs />
          <CardBody p="32px !important">
            <div className="mb-6">
              <Button
                onClick={() => {
                  setShowSearch(true)
                  setActiveField(Fields.TOKEN0)
                }}
                startIcon={currency0 ? <CurrencyLogo currency={currency0} style={{ marginRight: '.5rem' }} /> : null}
                endIcon={<ChevronDownIcon width="24px" color="white" />}
                fullWidth
                radii="card"
                className="mb-4"
              >
                {currency0 ? currency0.symbol : translate('Select a token')}
              </Button>

              <ColumnCenter>
                <AddIcon color="textSubtle" />
              </ColumnCenter>

              <Button
                onClick={() => {
                  setShowSearch(true)
                  setActiveField(Fields.TOKEN1)
                }}
                className="mt-4"
                startIcon={currency1 ? <CurrencyLogo currency={currency1} style={{ marginRight: '.5rem' }} /> : null}
                endIcon={<ChevronDownIcon width="24px" color="white" />}
                fullWidth
                radii="card"
              >
                {currency1 ? currency1.symbol : translate('Select a token')}
              </Button>
            </div>

            {hasPosition && (
              <ColumnCenter
                style={{ justifyItems: 'center', backgroundColor: '', padding: '12px 0px', borderRadius: '12px' }}
              >
                <Text textAlign="center">{translate('Pool Found!')}</Text>
              </ColumnCenter>
            )}

            {currency0 && currency1 ? (
              pairState === PairState.EXISTS ? (
                hasPosition && pair ? (
                  <MinimalPositionCard pair={pair} />
                ) : (
                  <BorderCard padding="32px">
                    <AutoColumn gap="sm" justify="center">
                      <Text color="textSubtle" textAlign="center" fontSize="16px" className="mb-1">
                        {translate('You don’t have liquidity in this pool yet.')}
                      </Text>

                      <StyledInternalLink to={`/add/${currencyId(currency0)}/${currencyId(currency1)}`}>
                        {translate('Add Liquidity')}
                      </StyledInternalLink>
                    </AutoColumn>
                  </BorderCard>
                )
              ) : validPairNoLiquidity ? (
                <BorderCard padding="32px">
                  <AutoColumn gap="sm" justify="center">
                    <Text color="textSubtle" textAlign="center" fontSize="16px" className="mb-1">
                      {translate('No pool found.')}
                    </Text>
                    <StyledInternalLink to={`/add/${currencyId(currency0)}/${currencyId(currency1)}`}>
                      {translate('Create pool.')}
                    </StyledInternalLink>
                  </AutoColumn>
                </BorderCard>
              ) : pairState === PairState.INVALID ? (
                <BorderCard padding="32px">
                  <Text color="textSubtle" textAlign="center" fontSize="16px">
                    {translate('Invalid pair.')}
                  </Text>
                </BorderCard>
              ) : pairState === PairState.LOADING ? (
                <BorderCard padding="32px">
                  <AutoColumn gap="sm" justify="center">
                    <Text color="textSubtle" textAlign="center" fontSize="16px">
                      <Dots>{translate('Loading')}</Dots>
                    </Text>
                  </AutoColumn>
                </BorderCard>
              ) : null
            ) : (
              <BorderCard padding="32px">
                <Text textAlign="center" color="textSubtle" fontSize="16px">
                  {!account
                    ? translate('Connect to a wallet to find pools')
                    : translate('Select a token to find your liquidity.')}
                </Text>
              </BorderCard>
            )}

            <CurrencySearchModal
              isOpen={showSearch}
              onCurrencySelect={handleCurrencySelect}
              onDismiss={handleSearchDismiss}
              showCommonBases
              selectedCurrency={(activeField === Fields.TOKEN0 ? currency1 : currency0) ?? undefined}
            />
          </CardBody>
        </AppBody>
      </MaxWidthLeft>
    </LeftPanel>
  )
}
