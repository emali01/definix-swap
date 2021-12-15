import styled from 'styled-components'
import { Currency } from 'definixswap-sdk'
import { Modal, Box, ModalBody } from '@fingerlabs/definixswap-uikit-v2'
import { useTranslation } from 'react-i18next'
import React from 'react'
import { CurrencySearch } from './CurrencySearch'

const Wrap = styled(Box)`
  width: calc(100vw - 48px);
  height: 100%;

  @media screen and (min-width: 464px) {
    width: 416px;
  }
`

interface CurrencySearchModalProps {
  isOpen?: boolean;
  onDismiss?: () => void;
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherSelectedCurrency?: Currency | null
  // eslint-disable-next-line react/no-unused-prop-types
  showCommonBases?: boolean
}

export default function CurrencySearchModal({
  isOpen,
  onDismiss,
  onCurrencySelect,
  selectedCurrency,
  otherSelectedCurrency,
}: CurrencySearchModalProps) {
  const { t } = useTranslation();

  return (
    <Modal title={t('Select a token')} mobileFull onDismiss={onDismiss}>
      <ModalBody isBody>
        <Wrap>
          <CurrencySearch
            onCurrencySelect={onCurrencySelect}
            selectedCurrency={selectedCurrency}
            otherSelectedCurrency={otherSelectedCurrency}
            onDismiss={onDismiss}
          />
        </Wrap>
      </ModalBody>
    </Modal>
  )
}
