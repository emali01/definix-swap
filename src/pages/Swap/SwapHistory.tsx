import React from 'react'
import { MaxWidthRight, RightPanel, ShowHideButton } from 'uikit-dev/components/TwoPanelLayout'
import TransactionHistoryBox from 'components/TransactionHistoryBox'
import {
  Card,
  Heading,
  Text,
} from 'definixswap-uikit'
import { ETHER, Token } from 'definixswap-sdk'
import { getBscScanLink } from 'utils'
import { TransactionDetails } from 'state/transactions/reducer'

interface IProps {
  isShowRightPanel: boolean;
  showConfirm: boolean;
  setIsShowRightPanel: React.Dispatch<React.SetStateAction<boolean>>
  sortedRecentTransactions: TransactionDetails[],
  allTokens: {
    [address: string]: Token;
  };
  wklay: Token;
  chainId: number | string;
}

const SwapHistory: React.FC<IProps> = ({
  isShowRightPanel,
  showConfirm,
  setIsShowRightPanel,
  sortedRecentTransactions,
  allTokens,
  wklay,
  chainId
}) => {
  return (
    <RightPanel isShowRightPanel={isShowRightPanel}>
        {!showConfirm && (
          <ShowHideButton
            isShow={isShowRightPanel}
            action={() => {
              setIsShowRightPanel(!isShowRightPanel)
            }}
          />
        )}
        {isShowRightPanel && (
          <MaxWidthRight>
            <Heading fontSize="20px !important" className="mb-3">
              SWAP HISTORY
            </Heading>
            <Card style={{ overflow: 'auto', flexGrow: 1 }}>
              {sortedRecentTransactions.length > 0 ? (
                sortedRecentTransactions.map((tx) => {
                  const firstToken =
                    tx.data?.firstToken === 'KLAY' || tx.data?.firstToken === 'WKLAY'
                      ? tx.data?.firstToken === 'WKLAY'
                        ? wklay
                        : ETHER
                      : Object.values(allTokens).find((t: any) => t.symbol === tx.data?.firstToken)
                  const secondToken =
                    tx.data?.secondToken === 'KLAY' || tx.data?.secondToken === 'WKLAY'
                      ? tx.data?.secondToken === 'WKLAY'
                        ? wklay
                        : ETHER
                      : Object.values(allTokens).find((t: any) => t.symbol === tx.data?.secondToken)
                  return (
                    <TransactionHistoryBox
                      href={chainId ? getBscScanLink(Number(chainId), tx.hash, 'transaction') : '/'}
                      firstCoin={firstToken}
                      firstCoinAmount={tx.data?.firstTokenAmount}
                      secondCoin={secondToken}
                      secondCoinAmount={tx.data?.secondTokenAmount}
                      title="Swap"
                      withText="to"
                      isFailed={!tx.confirmedTime}
                      date={
                        tx.confirmedTime
                          ? new Date(tx.confirmedTime || 0).toLocaleString('en-US', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: 'numeric',
                            })
                          : ''
                      }
                    />
                  )
                })
              ) : (
                <div className="flex align-center justify-center" style={{ height: '100%' }}>
                  <Text color="textSubtle" fontSize="14px" textAlign="center">
                    No Swap History
                  </Text>
                </div>
              )}
            </Card>
          </MaxWidthRight>
        )}
      </RightPanel>
  )
}

export default SwapHistory;