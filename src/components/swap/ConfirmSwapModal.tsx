import React, { useCallback, useState } from 'react'
import { currencyEquals, Trade } from 'definixswap-sdk'
import { Modal, Box, Divider, ModalBody } from 'definixswap-uikit-v2'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { computeTradePriceBreakdown } from 'utils/prices'
import { useDerivedSwapInfo } from 'state/swap/hooks'
import { useToast } from 'state/toasts/hooks'
import { useSwapCallback } from 'hooks/useSwapCallback'
import KlaytnScopeLink from 'components/KlaytnScopeLink'
import { useUserDeadline, useUserSlippageTolerance } from 'state/user/hooks'
import SwapModalFooter from './SwapModalFooter'
import SwapModalHeader from './SwapModalHeader'
import confirmPriceImpactWithoutFee from './confirmPriceImpactWithoutFee'

const Wrap = styled(Box)`
  width: calc(100vw - 48px);
  height: 100%;

  @media screen and (min-width: 464px) {
    width: 416px;
  }
`

const StyledDivider = styled(Divider)`
  margin-top: 20px;
  margin-bottom: 24px;
`

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
  recipient,
  onDismiss = () => null,
  onDismissModal,
}: {
  recipient: string | null
  onDismiss?: () => void
  onDismissModal: () => void
}) {
  const { t } = useTranslation();
  const { v2Trade: trade } = useDerivedSwapInfo()
  const [originalTrade, setOriginalTrade] = useState(trade);
  const [isPending, setIsPending] = useState(false);
  const [txHash, setTxHash] = useState(undefined);
  const [errorMessage, setErrorMessage] = useState(undefined);
  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)
  const [deadline] = useUserDeadline()
  const [allowedSlippage] = useUserSlippageTolerance()
  const { toastSuccess, toastError } = useToast();
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(
    trade,
    allowedSlippage,
    deadline,
    recipient
  )

  const showAcceptChanges = Boolean(trade && originalTrade && tradeMeaningfullyDiffers(trade, originalTrade))

  const onAcceptChanges = useCallback(() => {
    setOriginalTrade(trade);
  }, [trade])

  const handleSwap = useCallback(() => {
    if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee)) {
      return
    }
    if (!swapCallback) {
      return
    }
    setIsPending(true);
    setTxHash(undefined);
    swapCallback()
      .then((hash) => {
        setTxHash(hash);
        toastSuccess(t('Swap Complete'), <KlaytnScopeLink hash={hash} />)
        onDismiss();
        onDismissModal();
      })
      .catch((error) => {
        setErrorMessage(error.message);
        toastError(t('Swap Failed'))
        onDismiss();
        onDismissModal();
      })
  }, [priceImpactWithoutFee, swapCallback, onDismiss, onDismissModal, toastSuccess, toastError, t])

  return (
    <Modal title={t('Confirm Swap')} mobileFull onDismiss={onDismiss}>
      <ModalBody isBody>
        <Wrap>
          {!txHash && trade && (
            <>
              <SwapModalHeader
                trade={trade}
                allowedSlippage={allowedSlippage}
                recipient={recipient}
                showAcceptChanges={showAcceptChanges}
                onAcceptChanges={onAcceptChanges}
              />
              <StyledDivider />
              <SwapModalFooter
                onConfirm={handleSwap}
                trade={trade}
                disabledConfirm={showAcceptChanges}
                swapErrorMessage={errorMessage}
                isPending={isPending}
              />
            </>
          )}
        </Wrap>
      </ModalBody>
    </Modal>
  )
}
