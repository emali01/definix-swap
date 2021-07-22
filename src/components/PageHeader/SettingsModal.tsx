import React from 'react'
import { useTranslation } from 'contexts/Localization'
import { Modal } from 'uikit-dev'
import SlippageToleranceSetting from './SlippageToleranceSetting'
import TransactionDeadlineSetting from './TransactionDeadlineSetting'

type SettingsModalProps = {
  onDismiss?: () => void
}

// TODO: Fix UI Kit typings
const defaultOnDismiss = () => null

const SettingsModal = ({ onDismiss = defaultOnDismiss }: SettingsModalProps) => {
  const { t } = useTranslation()
  return (
    <Modal title={t('Settings')} onDismiss={onDismiss} isRainbow={false}>
      <SlippageToleranceSetting />
      <TransactionDeadlineSetting />
    </Modal>
  )
}

export default SettingsModal
