import React from 'react'
import styled from 'styled-components'
import { Modal } from 'definixswap-uikit'
import { useActiveWeb3React } from '../../hooks'
// import ConfirmationPendingContent from './ConfirmationPendingContent'

interface ConfirmationModalProps {
  isOpen: boolean
  isPending: boolean
  isSubmitted: boolean
  isError: boolean
  confirmContent: () => React.ReactNode
  pendingIcon?: any
  submittedContent?: () => React.ReactNode
  errorContent?: () => React.ReactNode
  onDismiss: () => void
}

const ModalWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.3);

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;

  padding: 24px;
  z-index: ${({ theme }) => theme.zIndices.modal - 1};
  ${({ theme }) => theme.mediaQueries.sm} {
    padding: 40px;
  }
`

const TransactionConfirmationModal = ({
  isOpen,
  isPending,
  isSubmitted,
  isError,
  confirmContent,
  onDismiss,
  pendingIcon,
  submittedContent,
  errorContent
}: ConfirmationModalProps) => {
  const { chainId } = useActiveWeb3React()

  if (!chainId) return null

  // confirmation screen
  return isOpen ? (
    <ModalWrapper>
      <Modal
        title=""
        // onBack={!isPending ? onDismiss : undefined}
        onDismiss={onDismiss}
        hideCloseButton
      >
        {!isSubmitted && !isError && (
          confirmContent()
        )}
      </Modal>
    </ModalWrapper>
  ) : (
    <></>
  )
}

export default TransactionConfirmationModal
