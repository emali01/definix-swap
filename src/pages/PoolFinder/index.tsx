import { Box, Button, Flex, Text } from '@fingerlabs/definixswap-uikit-v2'
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

enum Fields {
  TOKEN0 = 0,
  TOKEN1 = 1,
}

export default function PoolFinder() {
  const history = useHistory();
  const { account } = useActiveWeb3React()

  const [showSearch, setShowSearch] = useState<boolean>(false)
  const [activeField, setActiveField] = useState<number>(Fields.TOKEN1)

  const [currency0, setCurrency0] = useState<Currency | null>(ETHER)
  const [currency1, setCurrency1] = useState<Currency | null>(null)

  const [pairState, pair] = usePair(currency0 ?? undefined, currency1 ?? undefined)
  const addPair = usePairAdder()

  const validPairNoLiquidity: boolean = useMemo(() => {
    return (
      pairState === PairState.NOT_EXISTS ||
      Boolean(
        pairState === PairState.EXISTS &&
          pair &&
          JSBI.equal(pair.reserve0.raw, JSBI.BigInt(0)) &&
          JSBI.equal(pair.reserve1.raw, JSBI.BigInt(0))
      )
    )
  }, [pair, pairState])

  const position: TokenAmount | undefined = useTokenBalance(account ?? undefined, pair?.liquidityToken)
  const hasPosition = useMemo(() => Boolean(position && JSBI.greaterThan(position.raw, JSBI.BigInt(0))), [position]);

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

  const onClickCreatePoolButton = useCallback((currencyId0, currencyId1) => {
    history.replace(`/liquidity/add/${currencyId0}/${currencyId1}`);
    console.log('~~~')
  }, [history]);

  useEffect(() => {
    if (pair) {
      addPair(pair)
    }
  }, [pair, addPair])

  return (
    <Flex 
      flexDirection="column"
      alignItems="center"
      width="600px"
    >
        <Flex 
          flexDirection="column"
          width="50%"
        >
          <Button
            onClick={() => {
              setShowSearch(true)
              setActiveField(Fields.TOKEN0)
            }}
          >
            {currency0 ? currency0.symbol : <Text>Select a Token</Text>}
          </Button>

          <Button
            mt="10px"
            onClick={() => {
              setShowSearch(true)
              setActiveField(Fields.TOKEN1)
            }}
          >
            {currency1 ? currency1.symbol : <Text>Select a Token</Text>}
          </Button>
        </Flex>

        {hasPosition && (
          <Flex mt="20px">
            <Text textAlign="center">Pool Found!</Text>
          </Flex>
        )}
        
        <Box mt="20px" width="50%">
          {currency0 && currency1 ? (
            pairState === PairState.EXISTS ? (
              hasPosition && pair ? (
                <MinimalPositionCard pair={pair} />
              ) : (
                  <Flex>
                    <Text textAlign="center">
                      You don’t have liquidity in this pool yet.
                    </Text>
                    <Button
                      onClick={() => onClickCreatePoolButton(currencyId(currency0), currencyId(currency1))} 
                    >
                      Add Liquidity
                    </Button>
                  </Flex>
              )
            ) : validPairNoLiquidity ? (
                <Flex flexDirection="column">
                  <Text textAlign="center">
                    No pool found.
                  </Text>
                  <Button
                    onClick={() => onClickCreatePoolButton(currencyId(currency0), currencyId(currency1))} 
                  >
                    Create Pool
                  </Button>
                </Flex>
            ) : pairState === PairState.INVALID ? (
                <Text>Invalid pair.</Text>
            ) : pairState === PairState.LOADING ? (
                <Text>
                  Loading
                </Text>
            ) : null
          ) : (
            null
          )}
        </Box>

        <Box mt="20px">
          {!account && (<ConnectWalletButton />)}
        </Box>

        <CurrencySearchModal
          isOpen={showSearch}
          onCurrencySelect={handleCurrencySelect}
          onDismiss={handleSearchDismiss}
          showCommonBases
          selectedCurrency={(activeField === Fields.TOKEN0 ? currency1 : currency0) ?? undefined}
        />
    </Flex>
  )
}

