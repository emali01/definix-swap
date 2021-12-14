import React from 'react'
import { useTranslation } from 'react-i18next'
import { ErrorBlock } from 'definixswap-uikit-v2'

const Error = () => {
  const { t } = useTranslation()

  return (
    <>
      <ErrorBlock 
        message={t('Unknown error')} 
        label={t('Home')} 
        onBack={() => window.location.replace(`${process.env.REACT_APP_FRONTEND_URL}`)} 
      />
    </>
  )
}

export default Error
