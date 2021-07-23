import QuestionHelper from 'components/QuestionHelper'
import { useTranslation } from 'contexts/Localization'
import React from 'react'
import { Link as HistoryLink } from 'react-router-dom'
import styled from 'styled-components'
import { ArrowBackIcon, Button, Heading, Text } from 'uikit-dev'

const Tabs = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  border-radius: ${({ theme }) => theme.radii.default};
  justify-content: space-evenly;
  padding: 8px 8px 8px 24px !important;
`

export function FindPoolTabs() {
  const { t } = useTranslation()
  return (
    <Tabs className="flex flex-column pb-0 align-start">
      <Button variant="text" as={HistoryLink} to="/liquidity" ml="-12px" padding="0 12px" startIcon={<ArrowBackIcon />}>
        <Text fontSize="14px" color="textSubtle">
          {t('Back')}
        </Text>
      </Button>
      <div className="flex align-center mt-5">
        <Heading fontSize="24px !important">{t('Import Pool')}</Heading>
        <QuestionHelper text={t("Use this tool to find pairs that don't automatically appear in the interface.")} />
      </div>
    </Tabs>
  )
}

export function AddRemoveTabs({ adding }: { adding: boolean }) {
  const { t } = useTranslation()
  return (
    <Tabs className="flex flex-column align-start">
      <Button variant="text" as={HistoryLink} to="/liquidity" ml="-12px" padding="0 12px" startIcon={<ArrowBackIcon />}>
        <Text fontSize="14px" color="textSubtle">
          {t('Back')}
        </Text>
      </Button>
      <div className="flex align-center mt-5">
        <Heading fontSize="24px !important">
          {adding ? t('Add') : t('Remove')} {t('Liquidity')}
        </Heading>
        <QuestionHelper
          text={
            adding
              ? t(
                  'When you add liquidity, you are given pool tokens representing your position. These tokens automatically earn fees proportional to your share of the pool, and can be redeemed at any time.'
                )
              : t(
                  'Removing pool tokens converts your position back into underlying tokens at the current rate, proportional to your share of the pool. Accrued fees are included in the amounts you receive.'
                )
          }
        />
      </div>
    </Tabs>
  )
}
