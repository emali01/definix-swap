import React, { useMemo } from "react";
import FullPositionCard from "components/PositionCard";
import { toV2LiquidityToken, useTrackedTokenPairs } from "state/user/hooks";
import { useTokenBalancesWithLoadingIndicator } from "state/wallet/hooks";
import { usePairs } from "data/Reserves";
import { Pair } from "definixswap-sdk";
import { useActiveWeb3React } from "hooks";
import { Box, ColorStyles } from "definixswap-uikit";

const LiquidityList: React.FC = () => {
  const { account } = useActiveWeb3React()
  const trackedTokenPairs = useTrackedTokenPairs()
  const tokenPairsWithLiquidityTokens = useMemo(
    () => trackedTokenPairs.map((tokens) => ({ liquidityToken: toV2LiquidityToken(tokens), tokens })),
    [trackedTokenPairs]
  );

  const liquidityTokens = useMemo(() => tokenPairsWithLiquidityTokens.map((tpwlt) => tpwlt.liquidityToken), [
    tokenPairsWithLiquidityTokens,
  ])
  const [v2PairsBalances] = useTokenBalancesWithLoadingIndicator(
    account ?? undefined,
    liquidityTokens
  )
  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
        v2PairsBalances[liquidityToken.address]?.greaterThan('0')
      ),
    [tokenPairsWithLiquidityTokens, v2PairsBalances]
  )

  const v2Pairs = usePairs(liquidityTokensWithBalances.map(({ tokens }) => tokens))
  const allV2PairsWithLiquidity = v2Pairs.map(([, pair]) => pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair))

  return (
    <Box 
      p="24px 40px"
      backgroundColor={ColorStyles.WHITE}
      borderRadius="16px"
      style={{boxShadow: '0 12px 12px 0 rgba(227, 132, 0, 0.1)'}}
    >
      {allV2PairsWithLiquidity.map((v2Pair, i) => (
        <FullPositionCard 
          key={v2Pair.liquidityToken.address}
          pair={v2Pair}
          isLastCard={allV2PairsWithLiquidity.length - 1 === i}
        />
      ))}
    </Box>
  )
}

export default React.memo(LiquidityList);