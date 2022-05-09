import React, { useState, useEffect } from "react";
import { StatusBar } from "react-native";
import { COLORS } from "./constants";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import Tabs from "./navigation/tabs";
import RNBootSplash from "react-native-bootsplash";
import { Provider } from "react-redux";
import Store from "./Store";
import { store, persistor } from "./redux/store";
import {
  Restaurant,
  Order,
  Home,
  OrderDelivery,
  LoginScreen,
  SignUp,
  Cart,
  ItemDetails,
  UpdateProfile,
  Account,
} from "./screens";
import auth from "@react-native-firebase/auth";
import firebase from "@react-native-firebase/app";
import { PersistGate } from "redux-persist/integration/react";

const Stack = createStackNavigator();

// Your secondary Firebase project credentials...
const credentials = {
  clientId: "",
  appId: "1:570616527377:web:fbdb1f3b7cbb0e624d8fb0",
  apiKey: "AIzaSyDRThURWQTcE9HVIMR98iYMiYkdIIuJpuA",
  databaseURL:
    "https://africanbasket-341203-default-rtdb.europe-west1.firebasedatabase.app",
  storageBucket: "africanbasket-341203.appspot.com",
  messagingSenderId: "570616527377",
  projectId: "africanbasket-341203",
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(credentials);
}

const App = () => {
  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  return (
    <>
      <StatusBar backgroundColor={COLORS.lightGray} barStyle="dark-content" />
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <NavigationContainer onReady={() => RNBootSplash.hide()}>
            <Stack.Navigator>
              {user ? (
                <>
                  <Stack.Screen
                    name="Home"
                    component={Tabs}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="Restaurant" component={Restaurant} />
                  <Stack.Screen name="ItemDetails" component={ItemDetails} />
                  <Stack.Screen name="Order" component={Order} />
                  <Stack.Screen name="Account" component={Account} />
                  <Stack.Screen
                    name="OrderDelivery"
                    component={OrderDelivery}
                  />
                  <Stack.Screen name="Cart" component={Cart} />
                  <Stack.Screen
                    name="UpdateProfile"
                    component={UpdateProfile}
                  />
                </>
              ) : (
                <>
                  <Stack.Screen name="Login" component={LoginScreen} />
                  <Stack.Screen name="SignUp" component={SignUp} />
                </>
              )}
            </Stack.Navigator>
            {/* <Stack.Navigator>
              {state.userInfo == null ? (
                <>
                  <Stack.Screen name="LoginScreen" component={LoginScreen} />
                  <Stack.Screen name="SignUp" component={SignUp} />
                </>
              ) : (
                <>
                  <Stack.Screen name="Home" component={Tabs} />
                  <Stack.Screen name="Order" component={Order} />
                  <Stack.Screen name="Account" component={Account} />
                  <Stack.Screen name="Restaurant" component={Restaurant} />
                  <Stack.Screen name="ItemDetails" component={ItemDetails} />
                  <Stack.Screen
                    name="OrderDelivery"
                    component={OrderDelivery}
                  />
                  <Stack.Screen name="Cart" component={Cart} />
                  <Stack.Screen
                    name="UpdateProfile"
                    component={UpdateProfile}
                  />
                </>
              )}
            </Stack.Navigator>
            ); */}
          </NavigationContainer>
        </PersistGate>
      </Provider>
    </>
  );
};

export default App;
