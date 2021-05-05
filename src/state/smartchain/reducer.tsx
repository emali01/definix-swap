import { createReducer } from '@reduxjs/toolkit'
import { setSmartChianName } from './actions'

export interface SmartChainState {
  smartchainName: string
}

export const initialState: SmartChainState = {
  smartchainName: '',
}

export default createReducer(initialState, (builder) =>
  builder.addCase(setSmartChianName, (state, action) => {
    state.smartchainName = action.payload.name
  })
)
