import React from 'react'
import styled from 'styled-components'
import { CheckmarkCircleIcon, ChevronRightIcon, Link, Text } from 'uikit-dev'
import CurrencyLogo from './CurrencyLogo'

const Currency = styled.div`
  display: flex;
  align-items: center;
  margin: 0 8px;
`

const Box = styled.div`
  padding: 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border: none;
  }
`

const TransactionHistoryBox = ({ date, isFailed = false }) => {
  return (
    <Box>
      <div className="flex justify-space-between">
        <Text fontSize="12px" color="textSubtle">
          {date}
        </Text>
        <Text fontSize="12px" color={isFailed ? 'failure' : 'success'} className="flex align-center" bold>
          <CheckmarkCircleIcon className="mr-2" /> {isFailed ? 'Failed' : 'Complete'}
        </Text>
      </div>

      <div className="flex align-center flex-wrap my-2">
        <Text bold>Swap</Text>
        <Currency>
          <CurrencyLogo currency={undefined} size="24px" style={{ marginRight: '8px' }} />
          <Text bold>0.219 FINIX</Text>
        </Currency>
        <Text color="textSubtle">for</Text>
        <Currency>
          <CurrencyLogo currency={undefined} size="24px" style={{ marginRight: '8px' }} />
          <Text bold>0.00985 BNB</Text>
        </Currency>
      </div>

      <Link external href="/" bold={false} color="textSubtle" fontSize="12px" style={{ display: 'inline-flex' }}>
        View on BscScan
        <ChevronRightIcon color="textSubtle" />
      </Link>
    </Box>
  )
}
export default TransactionHistoryBox
