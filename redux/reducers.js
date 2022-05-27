import { SET_USER, SET_DELIVER } from "./actions";

const initialSate = {
    user: null,
    deliver: null,
}

export function userReducer(state = initialSate, action) {
    switch (action.type) {
        case SET_USER:
            return { ...state, user: action.payload };
        default:
            return state;
    }
}

export function deliverReducer(state = initialSate, action) {
    switch (action.type) {
        case SET_DELIVER:
            return { ...state, deliver: action.payload };
        default:
            return state;
    }
}

export default userReducer;