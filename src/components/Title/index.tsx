import React from 'react'
import { Heading, Link, Flex, Text, Box } from '@fingerlabs/definixswap-uikit-v2'
import styled from 'styled-components'

const TutorailsLink = styled(Link)`
  text-decoration-line: underline;
`

const Title: React.FC = () => {
  return (
    <Box>
      <Flex mb="8px">
        <Heading 
          as="h1"
          size="xl"
          fontWeight="bold"
          mr="12px"
        >
          Swap
        </Heading>
        <TutorailsLink
          href="https://sixnetwork.gitbook.io/definix-on-klaytn-en/exchange/how-to-trade-on-definix-exchange"
          target="_blank"
        >
          Learn to swap.
        </TutorailsLink>
      </Flex>
      <Text>
        Trade tokens in an instant
      </Text>
    </Box>
  )
}

export default Title;