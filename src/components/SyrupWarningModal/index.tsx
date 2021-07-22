import React, { useCallback, useState } from 'react'
import { useTranslation } from 'contexts/Localization'
import styled from 'styled-components'
import { Button, Text } from 'uikit-dev'
import { AlertTriangle } from 'react-feather'
import Modal from '../Modal'
import { AutoRow, RowBetween } from '../Row'
import { AutoColumn } from '../Column'

const WarningContainer = styled.div`
  max-width: 420px;
  width: 100%;
  padding: 1rem;
  background: rgba(242, 150, 2, 0.05);
  border: 1px solid #f3841e;
  border-radius: ${({ theme }) => theme.radii.default};
  overflow: auto;
`

const StyledWarningIcon = styled(AlertTriangle)`
  stroke: ${({ theme }) => theme.colors.failure};
`

export default function SyrupWarningModal({
  isOpen,
  transactionType,
  onConfirm,
}: {
  isOpen: boolean
  transactionType: string
  onConfirm: () => void
}) {
  const [understandChecked, setUnderstandChecked] = useState(false)
  const toggleUnderstand = useCallback(() => setUnderstandChecked((uc) => !uc), [])

  const handleDismiss = useCallback(() => null, [])
  const { t } = useTranslation()
  return (
    <Modal isOpen={isOpen} onDismiss={handleDismiss} maxHeight={90}>
      <WarningContainer className="token-warning-container">
        <AutoColumn gap="lg">
          <AutoRow gap="6px">
            <StyledWarningIcon />
            <Text small color="failure">
              {t('Syrup Warning')}
            </Text>
          </AutoRow>
          {transactionType !== '' && (
            <>
              <Text color="failure">
                {t('Please be careful when')} <strong>{transactionType}</strong> SYRUP.
              </Text>
              <Text color="failure">
                {transactionType === 'Buying'
                  ? t('You will not receive FINIX rewards for holding purchased SYRUP.')
                  : t('You will need to buy back the same amount of SYRUP to be able to convert back to FINIX.')}
              </Text>
            </>
          )}
          <RowBetween>
            <div>
              <label htmlFor="understand-checkbox" style={{ cursor: 'pointer', userSelect: 'none' }}>
                <input
                  id="understand-checkbox"
                  type="checkbox"
                  className="understand-checkbox"
                  checked={understandChecked}
                  onChange={toggleUnderstand}
                />{' '}
                <Text as="span">{t('I understand')}</Text>
              </label>
            </div>
            <Button
              disabled={!understandChecked}
              variant="danger"
              style={{ width: '140px' }}
              onClick={() => {
                setUnderstandChecked(false)
                onConfirm()
              }}
            >
              {t('Continue')}
            </Button>
          </RowBetween>
        </AutoColumn>
      </WarningContainer>
    </Modal>
  )
}
