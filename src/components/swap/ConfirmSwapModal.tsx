import { currencyEquals, Trade } from 'definixswap-sdk'
import { useActiveWeb3React } from 'hooks'
import React, { useCallback, useEffect, useMemo } from 'react'
import { Button } from 'definixswap-uikit'
import { useHistory } from 'react-router'
import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent,
  TransactionSubmittedContent,
} from '../TransactionConfirmationModal'
import SwapModalFooter from './SwapModalFooter'
import SwapModalHeader from './SwapModalHeader'

/**
 * Returns true if the trade requires a confirmation of details before we can submit it
 * @param tradeA trade A
 * @param tradeB trade B
 */
function tradeMeaningfullyDiffers(tradeA: Trade, tradeB: Trade): boolean {
  return (
    tradeA.tradeType !== tradeB.tradeType ||
    !currencyEquals(tradeA.inputAmount.currency, tradeB.inputAmount.currency) ||
    !tradeA.inputAmount.equalTo(tradeB.inputAmount) ||
    !currencyEquals(tradeA.outputAmount.currency, tradeB.outputAmount.currency) ||
    !tradeA.outputAmount.equalTo(tradeB.outputAmount)
  )
}

export default function ConfirmSwapModal({
  trade,
  originalTrade,
  onAcceptChanges,
  allowedSlippage,
  onConfirm,
  onDismiss,
  recipient,
  swapErrorMessage,
  isOpen,
  attemptingTxn,
  txHash,
  initSwapData,
}: {
  isOpen: boolean
  trade: Trade | undefined
  originalTrade: Trade | undefined
  attemptingTxn: boolean
  txHash: string | undefined
  recipient: string | null
  allowedSlippage: number
  onAcceptChanges: () => void
  onConfirm: () => void
  swapErrorMessage: string | undefined
  onDismiss: () => void
  initSwapData: () => void
}) {
  const history = useHistory();
  const { chainId } = useActiveWeb3React()

  const showAcceptChanges = useMemo(
    () => Boolean(trade && originalTrade && tradeMeaningfullyDiffers(trade, originalTrade)),
    [originalTrade, trade]
  )

  const modalHeader = useCallback(() => {
    return trade ? (
      <SwapModalHeader
        trade={trade}
        allowedSlippage={allowedSlippage}
        recipient={recipient}
        showAcceptChanges={showAcceptChanges}
        onAcceptChanges={onAcceptChanges}
      />
    ) : null
  }, [allowedSlippage, onAcceptChanges, recipient, showAcceptChanges, trade])

  const modalHeaderWithoutAction = useCallback(() => {
    return trade ? <SwapModalHeader trade={trade} onlyCurrency /> : null
  }, [trade])

  const modalBottom = useCallback(() => {
    return trade ? (
      <SwapModalFooter
        onConfirm={onConfirm}
        trade={trade}
        disabledConfirm={showAcceptChanges}
        swapErrorMessage={swapErrorMessage}
        allowedSlippage={allowedSlippage}
        isPending={attemptingTxn}
      />
    ) : null
  }, [allowedSlippage, onConfirm, showAcceptChanges, swapErrorMessage, trade, attemptingTxn])

  const confirmContent = useCallback(
    () => (
      <ConfirmationModalContent
        mainTitle="Confirm Swap"
        title=""
        topContent={modalHeader}
        bottomContent={modalBottom}
      />
    ),
    [modalBottom, modalHeader]
  )

  const submittedContent = useCallback(
    () => {
      return (
        <TransactionSubmittedContent
          title="Swap Complete"
          date={`${new Date().toDateString()}, ${new Date().toTimeString().split(" ")[0]}`}
          chainId={chainId}
          hash={txHash}
          content={modalHeaderWithoutAction}
          button={
            <Button onClick={onDismiss}>
              Back to Swap
            </Button>
          }
        />
      )
    },
    [chainId, modalHeaderWithoutAction, onDismiss, txHash]
  )

  const errorContent = useCallback(
    () => (
      <TransactionErrorContent
        title="Swap Failed"
        date={`${new Date().toDateString()}, ${new Date().toTimeString().split(" ")[0]}`}
        chainId={chainId}
        hash={txHash}
        content={modalHeaderWithoutAction}
        button={
          <Button onClick={onDismiss}>
            Back to Swap
          </Button>
        }
      />
    ),
    [chainId, modalHeaderWithoutAction, onDismiss, txHash]
  )

  useEffect(() => {
    if(attemptingTxn){
      console.log('~~~isPending', attemptingTxn)
    }
  }, [attemptingTxn, history])

  useEffect(() => {
    // 성공
    if(txHash) {
      console.log('~~~isSubmitted', txHash)
      initSwapData();
    }
  }, [txHash, initSwapData])

  useEffect(() => {
    // 실패
    if(swapErrorMessage) {
      console.log('~~~isError', swapErrorMessage)
      initSwapData();
    }
  }, [swapErrorMessage, initSwapData])

  return (
    <TransactionConfirmationModal
      isOpen={isOpen}
      isPending={attemptingTxn}
      isSubmitted={!!txHash}
      isError={!!swapErrorMessage}
      confirmContent={confirmContent}
      // pendingIcon={swap}
      // submittedContent={submittedContent}
      // errorContent={errorContent}
      onDismiss={onDismiss}
    />
  )
}
