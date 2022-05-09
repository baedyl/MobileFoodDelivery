import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  Image,
  Keyboard,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from "react-native";
import Button from "react-native-button";
import { AppStyles } from "../AppStyles";
import firebase from "@react-native-firebase/app";
import auth from "@react-native-firebase/auth";
import {
  GoogleSignin,
  GoogleSigninButton,
} from "@react-native-google-signin/google-signin";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Globalstyles } from "../styles/GlobalStyle";
import { CustomButton, ProgressBar } from "../components";
import { Formik } from "formik";
import * as yup from "yup";
import { images } from "../constants";
import { setUser } from "../redux/actions";
import { useDispatch } from "react-redux";
import { login } from "../reducers";

//validation schema for signin form
const signInSchema = yup.object({
  email: yup
    .string()
    .label("Email")
    .required()
    .matches(
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "email address is not valid"
    ),
  password: yup.string().label("Password").required().min(8),
});

const LoginScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const [screen, setScreen] = useState(null);
  const [item, setItem] = useState(null);
  const [category, setCategory] = useState(null);
  const [clicked, setClicked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    if (route && route.params) {
      const { screen, currentItem, currentCategory } = route.params;
      setScreen(screen);
      setItem(currentItem);
      setCategory(currentCategory);
    }
    GoogleSignin.configure({
      webClientId:
        "570616527377-sot48n6od7d6de2hsjs00btvadrufqu2.apps.googleusercontent.com",
    });
  }, []);

  //signin user with email and password
  const signInUser = async (
    values,
    navigation,
    screen,
    item,
    category,
    setClicked,
    dispatch
  ) => {
    setClicked(true);
    try {
      let response = await auth().signInWithEmailAndPassword(
        values.email,
        values.password
      );
      if (response && response.user) {
        setClicked(false);
        dispatch(setUser(response.user));
        setUserInfo(response.user);
        // navigation.navigate("Home", { screen: "Home" });
        // if (screen == "Account") {
        //   navigation.navigate("Account", { screen: "Account" });
        // } else {
        //   navigation.navigate("Restaurant", {
        //     currentItem: item,
        //     currentCategory: category,
        //   });
        // }
      }
    } catch (e) {
      Alert.alert("Error", e.message);
      setClicked(false);
    }
  };

  const onPressGoogle = () => {
    setLoading(true);
    GoogleSignin.signIn()
      .then((data) => {
        console.log("data", data);
        // Create a new Firebase credential with the token
        const credential = firebase.auth.GoogleAuthProvider.credential(
          data.idToken
        );
        // Login with the credential
        const accessToken = data.idToken;
        AsyncStorage.setItem(
          "@loggedInUserID:googleCredentialAccessToken",
          accessToken
        );
        return auth().signInWithCredential(credential);
      })
      .then((result) => {
        setLoading(false);
        var user = result.user;
        AsyncStorage.setItem("@loggedInUserID:id", user.uid);
        var userDict = {
          id: user.uid,
          fullname: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        };
        var data = {
          ...userDict,
          appIdentifier: "rn-android-universal-listings",
        };
        console.log("data", data);
        firestore().collection("users").doc(user.uid).set(data);
        dispatch(setUser(response.user));
        setUserInfo(response.user);
        dispatch(login(userDict));
        navigation.navigate("DrawerStack", {
          user: userDict,
        });
      })
      .catch((error) => {
        console.log(error);
        const { message } = error;
        setLoading(false);
        Alert.alert(message);
      });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss()}>
      {/* <Text style={[styles.title, styles.leftTitle]}>Connectez-vous</Text> */}
      <View style={Globalstyles.container_2}>
        {/*logo */}
        <Image
          source={images.logo}
          resizeMode="contain"
          style={Globalstyles.logo}
        />

        <ScrollView>
          {/* signin form */}
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={signInSchema}
            onSubmit={(values) => {
              signInUser(
                values,
                navigation,
                screen,
                item,
                category,
                setClicked,
                dispatch
              );
            }}
          >
            {(props) => (
              <View>
                {/* email field */}
                <TextInput
                  style={Globalstyles.input}
                  placeholder=" Email"
                  autoCapitalize="none"
                  onChangeText={props.handleChange("email")}
                  value={props.values.email}
                  keyboardType="email-address"
                  onBlur={props.handleBlur("email")}
                />
                {props.touched.email && props.errors.email && (
                  <Text style={Globalstyles.errorText}>
                    {props.errors.email}
                  </Text>
                )}

                {/* password field*/}
                <TextInput
                  style={Globalstyles.input}
                  placeholder=" Mot de passe"
                  onChangeText={props.handleChange("password")}
                  value={props.values.password}
                  secureTextEntry
                  onBlur={props.handleBlur("password")}
                />
                {props.touched.password && props.errors.password && (
                  <Text style={Globalstyles.errorText}>
                    {props.errors.password}
                  </Text>
                )}

                {/* signin button */}
                <CustomButton
                  text="Se connecter"
                  onPressButton={props.handleSubmit}
                />

                {/* forgot password */}
                {/* <TouchableOpacity
                    onPress={() => navigation.navigate("ForgotPassword")}
                    style={Globalstyles.hyperlink_container}
                  >
                    <Text style={Globalstyles.hyperlink_text}>
                      Forgot password?
                    </Text>
                  </TouchableOpacity> */}
              </View>
            )}
          </Formik>

          {/* hyperlink signup */}
          <View style={Globalstyles.hyperlink_container}>
            <Text style={Globalstyles.account_text}>
              Vous n'avez pas de compte?{" "}
            </Text>

            <TouchableOpacity
              onPress={() => navigation.navigate("SignUp", { screen: screen })}
            >
              <Text style={Globalstyles.hyperlink_text}>Créer un compte</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* progress bar */}
        {clicked && <ProgressBar text="Veuillez patienter..." />}

        <View style={Globalstyles.hyperlink_container}>
          <GoogleSigninButton
            style={styles.googleContainer}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Light}
            onPress={onPressGoogle}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  or: {
    color: "black",
    marginTop: 40,
    marginBottom: 10,
  },
  title: {
    fontSize: AppStyles.fontSize.title,
    fontWeight: "bold",
    color: AppStyles.color.tint,
    marginTop: 20,
    marginBottom: 20,
  },
  leftTitle: {
    alignSelf: "stretch",
    textAlign: "left",
    marginLeft: 20,
  },
  content: {
    paddingLeft: 50,
    paddingRight: 50,
    textAlign: "center",
    fontSize: AppStyles.fontSize.content,
    color: AppStyles.color.text,
  },
  loginContainer: {
    width: AppStyles.buttonWidth.main,
    backgroundColor: AppStyles.color.tint,
    borderRadius: AppStyles.borderRadius.main,
    padding: 10,
    marginTop: 30,
  },
  loginText: {
    color: AppStyles.color.white,
  },
  placeholder: {
    color: "red",
  },
  InputContainer: {
    width: AppStyles.textInputWidth.main,
    marginTop: 30,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: AppStyles.color.grey,
    borderRadius: AppStyles.borderRadius.main,
  },
  body: {
    height: 42,
    paddingLeft: 20,
    paddingRight: 20,
    color: AppStyles.color.text,
  },
  facebookContainer: {
    width: 192,
    backgroundColor: AppStyles.color.facebook,
    borderRadius: AppStyles.borderRadius.main,
    padding: 10,
    marginTop: 30,
  },
  facebookText: {
    color: AppStyles.color.white,
  },
  googleContainer: {
    width: 192,
    height: 48,
    marginTop: 30,
  },
  googleText: {
    color: AppStyles.color.white,
  },
});

export default LoginScreen;
