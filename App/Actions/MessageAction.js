import { SEND_MESSAGE } from '../Utilities/Constants';

export const sendMessage = (message) => {
    return {
        type: SEND_MESSAGE,
        payload: message
    }
}