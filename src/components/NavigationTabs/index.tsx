import QuestionHelper from 'components/QuestionHelper'
import React from 'react'
import { ArrowLeft } from 'react-feather'
import { Link as HistoryLink } from 'react-router-dom'
import styled from 'styled-components'
import { Heading, Text } from 'uikit-dev'

const Tabs = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  border-radius: ${({ theme }) => theme.radii.default};
  justify-content: space-evenly;
`

const StyledArrowLeft = styled(ArrowLeft)`
  color: ${({ theme }) => theme.colors.text};
`

export function FindPoolTabs() {
  return (
    <Tabs className="flex flex-column pa-6 pb-0 align-start">
      <HistoryLink to="/liquidity" className="flex align-center">
        <StyledArrowLeft className="mr-2" width="16px" />
        <Text color="textSubtle">Back</Text>
      </HistoryLink>
      <div className="flex align-center mt-5">
        <Heading fontSize="20px !important">Import Pool</Heading>
        <QuestionHelper text={"Use this tool to find pairs that don't automatically appear in the interface."} />
      </div>
    </Tabs>
  )
}

export function AddRemoveTabs({ adding }: { adding: boolean }) {
  return (
    <Tabs className="flex flex-column pa-6 pb-0 align-start">
      <HistoryLink to="/liquidity" className="flex align-center">
        <StyledArrowLeft className="mr-2" width="16px" />
        <Text color="textSubtle">Back</Text>
      </HistoryLink>
      <div className="flex align-center mt-5">
        <Heading fontSize="20px !important">{adding ? 'Add' : 'Remove'} Liquidity</Heading>
        <QuestionHelper
          text={
            adding
              ? 'When you add liquidity, you are given pool tokens representing your position. These tokens automatically earn fees proportional to your share of the pool, and can be redeemed at any time.'
              : 'Removing pool tokens converts your position back into underlying tokens at the current rate, proportional to your share of the pool. Accrued fees are included in the amounts you receive.'
          }
        />
      </div>
    </Tabs>
  )
}
