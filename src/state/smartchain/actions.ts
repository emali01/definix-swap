/* eslint-disable import/prefer-default-export */
import { createAction } from '@reduxjs/toolkit'

export const setSmartChianName = createAction<{ name: string }>('smartchain/setSmartChianName')
