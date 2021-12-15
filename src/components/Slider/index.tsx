import { ColorStyles } from '@fingerlabs/definixswap-uikit-v2'
import React, { useCallback } from 'react'
import styled from 'styled-components'

const StyledRangeInput = styled.input<{ size: number }>`
  -webkit-appearance: none;
  width: 100%;
  background: transparent;
  cursor: pointer;

  &:focus {
    outline: none;
  }

  &::-moz-focus-outer {
    border: 0;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: ${({ size }) => size}px;
    width: ${({ size }) => size}px;
    border-radius: 50%;
    transform: translateY(-50%);
    background-color: ${ColorStyles.WHITE};
    border: 7px solid #ff6828;
  }

  &::-moz-range-thumb {
    height: ${({ size }) => size}px;
    width: ${({ size }) => size}px;
    border-radius: 50%;
  }

  &::-ms-thumb {
    height: ${({ size }) => size}px;
    width: ${({ size }) => size}px;
    border-radius: 50%;
  }

  &::-webkit-slider-runnable-track {
    background-color: #ff6828;
    height: 5px;
    border-radius: 2.5px;
  }

  &::-moz-range-track {
    background-color: #ff6828;
    height: 5px;
    border-radius: 2.5px;
  }

  &::-ms-track {
    width: 100%;
    border-color: transparent;
    color: transparent;
    background-color: #ff6828;
    height: 5px;
    border-radius: 2.5px;
  }
  &::-ms-fill-lower {
    background-color: #e0e0e0;
  }
  &::-ms-fill-upper {
    background-color: #e0e0e0;
  }
`

interface InputSliderProps {
  value: number
  onChange: (value: number) => void
  step?: number
  min?: number
  max?: number
  size?: number
}

export default function Slider({ value, onChange, min = 0, step = 1, max = 100, size = 28 }: InputSliderProps) {
  const changeCallback = useCallback(
    e => {
      onChange(parseInt(e.target.value))
    },
    [onChange]
  )

  return (
    <StyledRangeInput
      size={size}
      type="range"
      value={value}
      onChange={changeCallback}
      // aria-labelledby="input slider"
      step={step}
      min={min}
      max={max}
    />
  )
}
