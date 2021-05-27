import React from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import { CogIcon, IconButton, useModal } from 'uikit-dev'
import SettingsModal from './PageHeader/SettingsModal'

const Tabs = styled.div`
  display: flex;
  align-items: center;
  justify-content: stretch;
  background: ${({ theme }) => theme.colors.backgroundDisabled};
`

const Tab = styled(NavLink)<{ active: boolean }>`
  position: relative;
  display: block;
  flex-grow: 1;
  text-align: center;
  padding: 20px;
  font-size: 16px;
  font-weight: bold;
  background: ${({ theme, active }) => (active ? theme.colors.primary : 'transparent')};
  color: ${({ theme, active }) => (active ? theme.colors.white : theme.colors.textSubtle)};
  border-right: 1px solid ${({ theme }) => theme.colors.textDisabled};

  &:before {
    content: '';
    width: 0;
    height: 0;
    border: 8px solid transparent;
    border-top-color: ${({ theme, active }) => (active ? theme.colors.primary : 'transparent')};
    position: absolute;
    top: 100%;
    left: calc(50% - 8px);
  }

  &:hover {
    color: ${({ theme, active }) => (active ? theme.colors.white : theme.colors.primary)};
  }
`

const StyleButton = styled(IconButton)`
  padding: 0 20px !important;
  width: auto;
  background: transparent !important;
  height: 56px;
  border-radius: 0;

  svg {
    stroke: ${({ theme }) => theme.colors.text} !important;
  }

  &:hover {
    svg {
      stroke: ${({ theme }) => theme.colors.primary} !important;
    }
  }
`

const ExchangeTab = ({ current }) => {
  const [onPresentSettings] = useModal(<SettingsModal />)

  return (
    <Tabs>
      <Tab to="/swap" active={current === '/swap'}>
        SWAP TOKEN
      </Tab>
      <Tab to="/liquidity" active={current === '/liquidity'}>
        LIQUIDITY
      </Tab>
      <Tab to="#" active={current === '/bridge'}>
        BRIDGE
      </Tab>
      <StyleButton variant="text" onClick={onPresentSettings} title="Settings">
        <CogIcon />
      </StyleButton>
    </Tabs>
  )
}

export default ExchangeTab
