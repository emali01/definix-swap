import React from 'react'
import styled from 'styled-components'
import { Flex, lightColors } from 'definixswap-uikit'

export const MaxWidthLeft = styled.div`
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

export const SwapContainer = styled.div`
  width: 629px;
  margin-top: 28px;
`

export const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 40px;
  border-radius: 16px;
  background-color: ${lightColors.white};
  border: 1px solid ${lightColors.yellowBg2};
  box-shadow: 0 12px 12px 0 rgba(254, 169, 72, 0.2);
`;


export const AppWrapper = ({children}) => {
  return (
    <Flex
      position="relative"
      flexDirection="column"
      alignItems="flex-start"
      maxWidth="1280px"
      height="100%"
    >
      {children}
    </Flex>
  )
}

export default undefined;
