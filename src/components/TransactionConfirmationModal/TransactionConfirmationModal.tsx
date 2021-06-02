import React from 'react'
import styled from 'styled-components'
import { Modal } from 'uikit-dev'
import bg from 'uikit-dev/images/for-ui-v2/bg.png'
import { useActiveWeb3React } from '../../hooks'
import ConfirmationPendingContent from './ConfirmationPendingContent'

interface ConfirmationModalProps {
  isOpen: boolean
  isPending: boolean
  isSubmitted: boolean
  isError: boolean
  confirmContent: () => React.ReactNode
  pendingIcon?: any
  submittedContent: () => React.ReactNode
  errorContent: () => React.ReactNode
  onDismiss: () => void
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
  isPending,
  isSubmitted,
  isError,
  confirmContent,
  pendingIcon,
  submittedContent,
  errorContent,
  onDismiss,
}: ConfirmationModalProps) => {
  const { chainId } = useActiveWeb3React()

  if (!chainId) return null

  // confirmation screen
  return isOpen ? (
    <ModalWrapper>
      <Modal
        title=""
        onBack={!isPending ? onDismiss : undefined}
        onDismiss={onDismiss}
        isRainbow={false}
        bodyPadding="0"
        maxWidth="720px"
        hideCloseButton
        classHeader="bd-b-n"
      >
        {isPending ? (
          <ConfirmationPendingContent pendingIcon={pendingIcon} />
        ) : isSubmitted ? (
          submittedContent()
        ) : isError ? (
          errorContent()
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
