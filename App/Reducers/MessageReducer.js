import { SEND_MESSAGE } from '../Utilities/Constants';

const initialState = {
    messages: []
};

const MessageReducer = (state = initialState, action) => {
    switch (action.type) {
        case SEND_MESSAGE:
            let messages = [...state.messages]
            messages.push(action.payload)
            return { ...state, messages };
        default:
            return state;
    }
}

export default MessageReducer;