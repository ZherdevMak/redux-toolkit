import {todolistsAPI, TodolistType} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {RequestStatusType, setAppStatusAC} from '../../app/app-reducer'
import {handleServerNetworkError} from '../../utils/error-utils'
import {AppDispatch, AppThunk} from "../../app/store";
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {loginTC} from "../Login/auth-reducer";

export const fetchTodolistsTC = createAsyncThunk('todolist/fetchTodolistsTC', async (param, thunkAPI) => {
  thunkAPI.dispatch(setAppStatusAC({status: 'loading'}))
  try {
    const res = await todolistsAPI.getTodolists()
    thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}))
    return {todolists: res.data}
  } catch (error: any) {
    handleServerNetworkError(error, thunkAPI.dispatch);
    return thunkAPI.rejectWithValue(null)
  }
})
export const removeTodolistTC = (todolistId: string): AppThunk => {
  return (dispatch: Dispatch) => {
    //изменим глобальный статус приложения, чтобы вверху полоса побежала
    dispatch(setAppStatusAC({status: 'loading'}))
    //изменим статус конкретного тудулиста, чтобы он мог задизеблить что надо
    dispatch(changeTodolistEntityStatusAC({id: todolistId, status: 'loading'}))
    todolistsAPI.deleteTodolist(todolistId)
      .then((res) => {
        dispatch(removeTodolistAC({id: todolistId}))
        //скажем глобально приложению, что асинхронная операция завершена
        dispatch(setAppStatusAC({status: 'succeeded'}))
      })
  }
}
export const addTodolistTC = (title: string): AppThunk => {
  return (dispatch: Dispatch) => {
    dispatch(setAppStatusAC({status: 'loading'}))
    todolistsAPI.createTodolist(title)
      .then((res) => {
        dispatch(addTodolistAC({todolist: res.data.data.item}))
        dispatch(setAppStatusAC({status: 'succeeded'}))
      })
  }
}
export const changeTodolistTitleTC = (id: string, title: string): AppThunk => {
  return (dispatch: AppDispatch) => {
    todolistsAPI.updateTodolist(id, title)
      .then((res) => {
        dispatch(changeTodolistTitleAC({id, title}))
      })
  }
}
export const slice = createSlice({
  name: "todolists",
  initialState: [] as Array<TodolistDomainType>,
  reducers: {
    removeTodolistAC(state, action: PayloadAction<{ id: string }>) {
      return state.filter(tl => tl.id !== action.payload.id)
    },
    addTodolistAC(state, action: PayloadAction<{ todolist: TodolistType }>) {
      state.unshift({...action.payload.todolist, filter: 'all', entityStatus: 'idle'})
    },
    changeTodolistTitleAC(state, action: PayloadAction<{ id: string, title: string }>) {
      return state.map(tl => tl.id === action.payload.id ? {...tl, title: action.payload.title} : tl)
    },
    changeTodolistFilterAC(state, action: PayloadAction<{ id: string, filter: FilterValuesType }>) {
      return state.map(tl => tl.id === action.payload.id ? {...tl, filter: action.payload.filter} : tl)
    },
    changeTodolistEntityStatusAC(state, action: PayloadAction<{ id: string, status: RequestStatusType }>) {
      return state.map(tl => tl.id === action.payload.id ? {...tl, entityStatus: action.payload.status} : tl)
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchTodolistsTC.fulfilled, (state, action) => {
        return action.payload.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
      }
    )
  }
})
export const todolistsReducer = slice.reducer
export const {
  removeTodolistAC, addTodolistAC, changeTodolistTitleAC, changeTodolistFilterAC,
  changeTodolistEntityStatusAC
} = slice.actions

// types

export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
  filter: FilterValuesType
  entityStatus: RequestStatusType
}
