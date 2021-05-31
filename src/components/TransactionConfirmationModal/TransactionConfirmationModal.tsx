import React from 'react'
import styled from 'styled-components'
import { Modal } from 'uikit-dev'
import bg from 'uikit-dev/images/for-ui-v2/bg.png'
import { useActiveWeb3React } from '../../hooks'
import ConfirmationPendingContent from './ConfirmationPendingContent'
import TransactionSubmittedContent from './TransactionSubmittedContent'

interface ConfirmationModalProps {
  isOpen: boolean
  onDismiss: () => void
  hash: string | undefined
  confirmContent: () => React.ReactNode
  submittedContent: () => React.ReactNode
  errorContent: () => React.ReactNode
  attemptingTxn: boolean
  pendingText: string
}

const ModalWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: ${({ theme }) => theme.zIndices.modal - 1};
  background: url(${bg});
  background-size: cover;
  background-repeat: no-repeat;
  background-color: ${({ theme }) => theme.colors.grayBlue};
`

const TransactionConfirmationModal = ({
  isOpen,
  onDismiss,
  attemptingTxn,
  hash,
  pendingText,
  confirmContent,
  submittedContent,
  errorContent,
}: ConfirmationModalProps) => {
  const { chainId } = useActiveWeb3React()

  if (!chainId) return null

  // confirmation screen
  return isOpen ? (
    <ModalWrapper>
      <Modal
        title=""
        onBack={!attemptingTxn && !hash ? onDismiss : undefined}
        onDismiss={onDismiss}
        isRainbow={false}
        bodyPadding="0"
        hideCloseButton
        classHeader="bd-b-n"
      >
        {attemptingTxn ? (
          <ConfirmationPendingContent onDismiss={onDismiss} pendingText={pendingText} />
        ) : hash ? (
          <TransactionSubmittedContent
            title=""
            date="17 Apr 2021, 15:32"
            chainId={chainId}
            hash={hash}
            onDismiss={onDismiss}
          />
        ) : (
          confirmContent()
        )}
      </Modal>
    </ModalWrapper>
  ) : (
    <></>
  )
}

export default TransactionConfirmationModal
