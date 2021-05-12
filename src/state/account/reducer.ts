import { createReducer } from '@reduxjs/toolkit'
import {
  updateAccountAddress,
} from './actions'

export interface AccountState {
  account: string | null | undefined
}

export const initialState: AccountState = {
  account: null,
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateAccountAddress, (state, action) => {
      state.account = action.payload.accountAddress
    })
)
