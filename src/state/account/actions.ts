/* eslint-disable import/prefer-default-export */
import { createAction } from '@reduxjs/toolkit'

export const updateAccountAddress = createAction<{ accountAddress: string | undefined | null }>('account/updateAccountAddress')
