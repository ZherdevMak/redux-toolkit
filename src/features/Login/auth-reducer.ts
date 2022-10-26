import {setAppStatusAC} from '../../app/app-reducer'
import {authAPI, fieldErrorType, LoginParamsType} from '../../api/todolists-api'
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils'
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AxiosError} from "axios";

export const loginTC = createAsyncThunk<{ isLoggedIn: boolean }, LoginParamsType,
  { rejectValue: { errors: Array<string>, fieldsErrors?: Array<fieldErrorType> } }>("auth/loginTC", async (data, thunkAPI) => {
  thunkAPI.dispatch(setAppStatusAC({status: 'loading'}))
  try {
    const res = await authAPI.login(data)
    if (res.data.resultCode === 0) {
      thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}))
      return {isLoggedIn: true}
    } else {
      handleServerAppError(res.data, thunkAPI.dispatch)
      return thunkAPI.rejectWithValue({errors: res.data.messages, fieldsErrors: res.data.fieldsErrors})
    }
  } catch (err: any) {
    const error: AxiosError = err
    handleServerNetworkError(error, thunkAPI.dispatch)
    return thunkAPI.rejectWithValue({errors: [error.message], fieldsErrors: undefined})
  }
})
export const logoutTC = createAsyncThunk("auth/logoutTC", async (data, thunkAPI) => {
  thunkAPI.dispatch(setAppStatusAC({status: 'loading'}))
  try {
    const res = await authAPI.logout()
    if (res.data.resultCode === 0) {
      thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}))
      return {isLoggedIn: false}
    } else {
      handleServerAppError(res.data, thunkAPI.dispatch)
      return thunkAPI.rejectWithValue({})
    }
  } catch (error: any) {
    handleServerNetworkError(error, thunkAPI.dispatch)
    return thunkAPI.rejectWithValue({})
  }
})

const slice = createSlice({
  name: "auth",
  initialState: {isLoggedIn: false},
  reducers: {
    setIsLoggedInAC(state, action: PayloadAction<{ value: boolean }>) {
      state.isLoggedIn = action.payload.value
    }
  },
  extraReducers: builder => {
    builder.addCase(loginTC.fulfilled, (state, action) => {
        state.isLoggedIn = action.payload.isLoggedIn
      }
    )
    builder.addCase(logoutTC.fulfilled, (state, action) => {
        state.isLoggedIn = action.payload.isLoggedIn
      }
    )
  }
})

export const authReducer = slice.reducer
// actions
export const setIsLoggedInAC = slice.actions.setIsLoggedInAC




