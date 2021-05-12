import { FC } from 'react'
import { SvgProps } from '../../components/Svg/types'


export type Login = (connectorId: String) => void

export interface Config {
  title: string
}
