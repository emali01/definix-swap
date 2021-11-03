import React from 'react'
import styled from 'styled-components'

const Maxwidth = styled.div`
  width: 100%;
  border: 1px solid red;
  ${({ theme }) => theme.mediaQueries.sm} {
    padding-bottom: 76px;
  }
`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody({ children, title }: { children: React.ReactNode; title?: React.ReactNode }) {
  return (
    <Maxwidth>
      {title && title}
      {children}
    </Maxwidth>
  )
}
