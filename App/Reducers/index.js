import { createStore, combineReducers } from 'redux';
import MessageReducer from './MessageReducer';

const rootReducer = combineReducers(
    { messages: MessageReducer }
);

const configureStore = () => {
    return createStore(rootReducer);
}

export default configureStore;