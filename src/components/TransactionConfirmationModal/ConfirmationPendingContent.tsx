import React from 'react'
import Lottie from 'react-lottie'
import styled from 'styled-components'
import { Text } from 'uikit-dev'
import processing from 'uikit-dev/animation/processing.json'

const options = {
  loop: true,
  autoplay: true,
  animationData: processing,
}

const TextCenter = styled(Text)`
  position: absolute;
  bottom: calc(50% - 48px);
  left: 50%;
  transform: translate(-50%, 0);
`

const ConfirmationPendingContent = () => {
  return (
    <div
      className="flex align-center justify-center pa-6"
      style={{ position: 'relative', width: '480px', height: '480px' }}
    >
      <Lottie options={options} height={120} width={120} />
      <TextCenter color="textSubtle">Progressing…</TextCenter>
    </div>
  )
}

export default ConfirmationPendingContent
