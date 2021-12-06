import React from 'react'
import { Text, Flex, ColorStyles, CloseIcon } from 'definixswap-uikit'

type ConfirmationModalContentProps = {
  mainTitle: string
  title?: string
  topContent: () => React.ReactNode
  bottomContent: () => React.ReactNode
}

const ConfirmationModalContent = ({ 
  mainTitle, 
  title,
  topContent, 
  bottomContent 
}: ConfirmationModalContentProps) => {
  return (
    <Flex width={`${464 - (24 * 2)}px`} flexDirection="column">
      <Flex justifyContent="space-between" p="22px 0">
        <Text textStyle="R_18B" color={ColorStyles.BLACK}>
          {mainTitle}
        </Text>
        <CloseIcon />
      </Flex>

      <Flex flexDirection="column" mb="20px" mt="16px">
        {topContent()}
      </Flex>
      <Flex flexDirection="column">
        {bottomContent()}
      </Flex>
    </Flex>
  )
}

export default React.memo(ConfirmationModalContent)
