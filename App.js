/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import { Provider } from 'react-redux';
import Chat from './App/Screen/Chat'

import configureStore from './App/Reducers';
const store = configureStore()

const App: () => React$Node = () => {
  return (
    <Provider store={store}>
      <Chat />
    </Provider>
  );
};


export default App;
