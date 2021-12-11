import React, { useCallback, useMemo, useState } from 'react'
import { currencyEquals, Trade } from 'definixswap-sdk'
import { Modal, Box, Divider, ModalBody, useMatchBreakpoints } from 'definixswap-uikit-v2'
import { useTranslation } from 'react-i18next'
import { useDerivedSwapInfo } from 'state/swap/hooks'
import { useToast } from 'state/toasts/hooks'
import { useSwapCallback } from 'hooks/useSwapCallback'
import KlaytnScopeLink from 'components/KlaytnScopeLink'
import { useUserDeadline, useUserSlippageTolerance } from 'state/user/hooks'
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
  recipient,
  onDismiss = () => null,
  onDismissModal,
}: {
  recipient: string | null
  onDismiss?: () => void
  onDismissModal: () => void
}) {
  const { t } = useTranslation();
  const { isXl, isXxl } = useMatchBreakpoints()
  const isMobile = useMemo(() => !isXl && !isXxl, [isXl, isXxl])
  const { v2Trade: trade } = useDerivedSwapInfo()
  const [originalTrade, setOriginalTrade] = useState(trade);
  const [isPending, setIsPending] = useState(false);
  const [txHash, setTxHash] = useState(undefined);
  const [errorMessage, setErrorMessage] = useState(undefined);
  const [deadline] = useUserDeadline()
  const [allowedSlippage] = useUserSlippageTolerance()
  const { toastSuccess, toastError } = useToast();
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(
    trade,
    allowedSlippage,
    deadline,
    recipient
  )

  const showAcceptChanges = useMemo(() => Boolean(trade && originalTrade && tradeMeaningfullyDiffers(trade, originalTrade)), [originalTrade, trade]);

  const onAcceptChanges = useCallback(() => {
    setOriginalTrade(trade);
  }, [trade])

  const handleSwap = useCallback(() => {
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
  }, [swapCallback, onDismiss, onDismissModal, toastSuccess, toastError, t])

  return (
    <Modal title={t('Confirm Swap')} mobileFull onDismiss={onDismiss}>
      <ModalBody isBody>
        <Box
          width={isMobile ? "100%" : "414px"}
          height="100%"
        >
          {!txHash && trade && (
            <>
              <SwapModalHeader
                trade={trade}
                allowedSlippage={allowedSlippage}
                recipient={recipient}
                showAcceptChanges={showAcceptChanges}
                onAcceptChanges={onAcceptChanges}
              />
              <Divider mt="20px" mb="24px"/>
              <SwapModalFooter
                onConfirm={handleSwap}
                trade={trade}
                disabledConfirm={showAcceptChanges}
                swapErrorMessage={errorMessage}
                isPending={isPending}
              />
            </>
          )}
        </Box>
      </ModalBody>
    </Modal>
  )
}
