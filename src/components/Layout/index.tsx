import React from 'react'
import styled from 'styled-components'
import { Flex, lightColors } from 'definixswap-uikit'

export const MaxWidthLeft = styled.div`
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

export const ContentContainer = styled.div`
  width: 100%;
  max-width: 629px;

  min-height: 100%;
  padding: 40px;
  margin-bottom: 76px;
  
  border-radius: 16px;
  background-color: ${lightColors.greyscale.white};
  border: ${`1px solid ${lightColors.bg.yellow[1]}`};
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
      <Flex
        position="absolute"
        flexDirection="column"
        width= "100%"
        height="100%"
      >
        <Flex
          background={lightColors.bg.yellow[0]}
          width="100%"
          height="370px"
        />
        <Flex 
          background={lightColors.bg.yellow[1]}
          width="100%"
          flex="1 1 0"
        />
      </Flex>
      {children}
    </Flex>
  )
}

export default undefined;
