import React from 'react'
import styled from 'styled-components'
import { Flex, lightColors } from 'definixswap-uikit'

export const MaxWidthLeft = styled.div`
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

export const ContentContainer = styled.div`
  width: 629px;
  padding: 40px;
  border-radius: 16px;
  background-color: ${lightColors.white};
  border: ${`1px solid ${lightColors.yellow[1]}`};
`

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
