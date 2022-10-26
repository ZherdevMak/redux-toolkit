import {authAPI} from '../api/todolists-api'
import {setIsLoggedInAC} from '../features/Login/auth-reducer'
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";


export const initializeAppTC = createAsyncThunk("app/initializeAppTC", async (data, thunkAPI) => {
  const res = await authAPI.me()
  if (res.data.resultCode === 0) {
    thunkAPI.dispatch(setIsLoggedInAC({value: true}));
  }
  return {value: true};
})
const slice = createSlice({
  name: "app",
  initialState: {
    status: 'idle',
    error: null,
    isInitialized: false
  } as InitialStateType,
  reducers: {
    setAppErrorAC(state, action: PayloadAction<{ error: string | null }>) {
      if (action.payload.error) {
        state.error = action.payload.error
      }
    },
    setAppStatusAC(state, action: PayloadAction<{ status: RequestStatusType }>) {
      state.status = action.payload.status
    }
  },
  extraReducers: builder => {
    builder.addCase(initializeAppTC.fulfilled, (state, action) => {
      state.isInitialized = action.payload.value
    })
  }
})
export const appReducer = slice.reducer

export const {setAppErrorAC, setAppStatusAC} = slice.actions

export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'
export type InitialStateType = {
  // происходит ли сейчас взаимодействие с сервером
  status: RequestStatusType
  // если ошибка какая-то глобальная произойдёт - мы запишем текст ошибки сюда
  error: string | null
  // true когда приложение проинициализировалось (проверили юзера, настройки получили и т.д.)
  isInitialized: boolean
}




