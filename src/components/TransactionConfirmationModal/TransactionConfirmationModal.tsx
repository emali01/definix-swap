import React, { useEffect } from 'react'
import styled from 'styled-components'
import { Modal } from 'definixswap-uikit'
import { useHistory } from 'react-router'
import { useActiveWeb3React } from '../../hooks'

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

  setShowConfirm: any
  setTxHash: any
  onFieldAInput?: any
  onFieldBInput?: any
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
  z-index: ${({ theme }) => theme.zIndices.modal - 1};
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
  errorContent,
  setShowConfirm,
  setTxHash,
  onFieldAInput,
  onFieldBInput
}: ConfirmationModalProps) => {
  const history = useHistory();

  const { chainId } = useActiveWeb3React()

  useEffect(() => {
    if(isSubmitted){
      setShowConfirm(false);
      setTxHash('');
      if(onFieldAInput && onFieldBInput){
        onFieldAInput('');
        onFieldBInput('');
        // history.replace('/liquidity')
      }
    }
  }, [history, isSubmitted, onFieldAInput, onFieldBInput, setShowConfirm, setTxHash])

  if (!chainId) return null

  return (
    <>
      {isOpen && (
        <ModalWrapper>
          <Modal
            onDismiss={onDismiss}
            hideHeader
            hideCloseButton
          >
            {/* {!isSubmitted && !isError && ( */}
              {confirmContent()}
            {/* )} */}
          </Modal>
        </ModalWrapper>
      )}
    </>
  )
}

export default TransactionConfirmationModal
