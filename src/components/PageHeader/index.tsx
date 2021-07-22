import React, { ReactNode } from 'react'
import { useTranslation } from 'contexts/Localization'
import styled from 'styled-components'
import { CogIcon, Flex, Heading, HistoryIcon, IconButton, Text, useModal } from 'uikit-dev'
import RecentTransactionsModal from './RecentTransactionsModal'
import SettingsModal from './SettingsModal'

interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
}

const StyledPageHeader = styled.div`
  padding: 24px 24px 0 24px;
`

const Details = styled.div`
  flex: 1;
`

const PageHeader = ({ title, description, children }: PageHeaderProps) => {
  const [onPresentSettings] = useModal(<SettingsModal />)
  const [onPresentRecentTransactions] = useModal(<RecentTransactionsModal />)
  const { t } = useTranslation()
  return (
    <StyledPageHeader>
      <Flex alignItems="center">
        <Details>
          <Heading>{title}</Heading>
          {description && (
            <Text mt="8px" color="textSubtle" fontSize="14px">
              {description}
            </Text>
          )}
        </Details>
        <IconButton variant="text" onClick={onPresentSettings} title={t('Settings')}>
          <CogIcon width={20} />
        </IconButton>
        <IconButton variant="text" onClick={onPresentRecentTransactions} title={t('Recent transactions')}>
          <HistoryIcon width={20} />
        </IconButton>
      </Flex>
      {children && <Text mt="16px">{children}</Text>}
    </StyledPageHeader>
  )
}

export default PageHeader
