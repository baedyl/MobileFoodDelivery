import { createStore, combineReducers, applyMiddleware } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from '@react-native-async-storage/async-storage'
import thunk from "redux-thunk";
import userReducer from "./reducers";
import {deliverReducer} from "./reducers"

const persistConfig = {
    key: 'root',
    storage: AsyncStorage
}

const rootReducer = combineReducers({
    userReducer: persistReducer(persistConfig, userReducer),
    deliverReducer: persistReducer(persistConfig, deliverReducer)
});

export const store = createStore(rootReducer, applyMiddleware(thunk));
export const persistor = persistStore(store);

