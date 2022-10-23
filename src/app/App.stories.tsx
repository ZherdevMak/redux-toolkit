import React from 'react'
import App from './App'
import {ReduxStoreProviderDecorator, storyBookStore} from '../stories/decorators/ReduxStoreProviderDecorator'
import {BrowserRouter, HashRouter} from "react-router-dom";
import {Provider} from "react-redux";



export const AppBaseExample = (props: any) => {
  return (<Provider store={storyBookStore}>
    <HashRouter>
      <App demo={true}/>
    </HashRouter>
    </Provider>
  )
}
export default {
  title: 'App Stories',
  component: AppBaseExample,
  decorators: [ReduxStoreProviderDecorator]
}

