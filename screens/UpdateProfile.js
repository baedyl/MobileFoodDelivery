import React, { useState, useEffect } from "react";
import {
  Alert,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  SafeAreaView,
  StyleSheet,
  Keyboard,
  ScrollView,
} from "react-native";
import { Globalstyles } from "../styles/GlobalStyle";
import { CustomButton } from "../components";
import { launchImageLibrary } from "react-native-image-picker";
import { Formik } from "formik";
import * as yup from "yup";
import { InnerHeader, ProgressBar } from "../components";
import { FONTS, SIZES, COLORS, icons, DATABASE_URL } from "../constants";
import { firebase } from "@react-native-firebase/database";
import storage from "@react-native-firebase/storage";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import Geocoder from "react-native-geocoding";

const GOOGLE_PLACES_API_KEY = "AIzaSyBSWfme3FulpbRxcMzQ9JOaRUJPWIn2vKo"; // never save your real api key in a snack!
Geocoder.init("AIzaSyBSWfme3FulpbRxcMzQ9JOaRUJPWIn2vKo");

//validation schema for update
const updateSchema = yup.object({
  name: yup.string().label("Name").required().min(3),
  phone: yup
    .string()
    .label("Phone number")
    .required()
    .matches(/^\d{10}$/, "Phone number is not valid"),
});
let newAddress = "";

const UpdateProfile = ({ route, navigation }) => {
  const [user, setUser] = useState({});
  const [image, setImage] = useState("");
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    const { currentUser } = route.params;
    setUser(currentUser);
    setImage(currentUser.photoUrl);
  }, []);

  //function for updating user information
  const updateUser = async (values, navigation, user, image, setClicked) => {
    // console.log("wtf");
    setClicked(true);
    const userReference = firebase
      .app()
      .database(DATABASE_URL)
      .ref("/Users/" + user.uid);
    let userLocation = null;
    
    // Geocoding user's location
    await Geocoder.from(newAddress !== "" ? newAddress : user.address)
      .then((json) => {
        const location = json.results[0].geometry.location;
        console.log('location: ', location);
        userLocation = {
          latitude: location.lat,
          longitude: location.lng,
        }
      })
      .catch((error) => console.warn(error));

    try {
      if (
        image == "default" ||
        image == undefined ||
        (image && image.includes("https:"))
      ) {
        console.log('location', userLocation);
        await userReference
          .update({
            name: values.name,
            address: newAddress !== "" ? newAddress : user.address,
            phone: values.phone,
            location: userLocation,
          })
          .then(() => {
            console.log("User updated successfully");
            setClicked(false);
            navigation.goBack();
          })
          .catch((e) => {
            setClicked(false);
            Alert.alert("Error", e.message);
          });
      } else {
        const filename = image.substring(image.lastIndexOf("/") + 1);
        const uploadUri =
          Platform.OS === "ios" ? image.replace("file://", "") : image;
        const reference = storage().ref("/Users profile pics/" + filename);

        await reference.putFile(uploadUri);
        const url = await reference.getDownloadURL();

        await userReference
          .update({
            name: values.name,
            address: newAddress !== "" ? newAddress : user.address,
            phone: values.phone,
            location: userLocation,
            photoUrl: url,
          })
          .then(() => {
            console.log("User updated successfully");
            setClicked(false);
            navigation.goBack();
          })
          .catch((e) => {
            Alert.alert("Error", e.message);
            setClicked(false);
          });
      }
    } catch (e) {
      Alert.alert("Error", e.message);
      setClicked(false);
    }
  };

  //function for taking/selecting photo
  const selectImage = () => {
    const options = {
      maxWidth: 2000,
      maxHeight: 2000,
      storageOptions: {
        skipBackup: true,
        path: "images",
      },
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.error) {
        console.log("ImagePicker Error: ", response.error);
      } else if (response.customButton) {
        console.log("User tapped custom button: ", response.customButton);
      } else {
        const source = { uri: response.uri };
        setImage(source.uri);
      }
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss()}>
      <SafeAreaView style={Globalstyles.container_1}>
        {/* Header */}
        {/* <InnerHeader title="Modifier Profil" navigation={navigation} /> */}

        <View style={Globalstyles.container_2}>
          {/* User Photo */}
          {image == "default" || image == "" || image == undefined ? (
            <View style={styles.image_view}>
              <Image
                source={icons.user}
                resizeMode="center"
                style={{
                  width: "50%",
                  height: "50%",
                }}
              />
            </View>
          ) : (
            <Image source={{ uri: image }} style={styles.image} />
          )}

          {/* Change profile pic */}
          <TouchableOpacity onPress={selectImage}>
            <Text style={styles.hyperlink_text}>Changer photo de profil</Text>
          </TouchableOpacity>

          <ScrollView keyboardShouldPersistTaps="always">
            <Formik
              enableReinitialize={true}
              initialValues={{
                name: user.name,
                phone: user.phone,
                address: user.address,
              }}
              validationSchema={updateSchema}
              onSubmit={(values) => {
                updateUser(values, navigation, user, image, setClicked);
              }}
            >
              {(props) => (
                <View>
                  {/* Name field */}
                  <TextInput
                    style={Globalstyles.input}
                    placeholder={user.name}
                    onChangeText={props.handleChange("name")}
                    value={props.values.name}
                    onBlur={props.handleBlur("name")}
                  />
                  {props.touched.name && props.errors.name && (
                    <Text style={Globalstyles.errorText}>
                      {props.errors.name}
                    </Text>
                  )}

                  {/* Phone number field */}
                  <TextInput
                    style={Globalstyles.input}
                    placeholder={user.phone}
                    onChangeText={props.handleChange("phone")}
                    value={props.values.phone}
                    keyboardType="numeric"
                    onBlur={props.handleBlur("phone")}
                  />
                  {props.touched.phone && props.errors.phone && (
                    <Text style={Globalstyles.errorText}>
                      {props.errors.phone}
                    </Text>
                  )}

                  {/* Address field */}
                  {/* <TextInput
                    style={Globalstyles.input}
                    placeholder={user.address || "Adresse"}
                    onChangeText={props.handleChange("address")}
                    value={props.values.address}
                    onBlur={props.handleBlur("address")}
                  />
                  {props.touched.address && props.errors.address && (
                    <Text style={Globalstyles.errorText}>
                      {props.errors.address}
                    </Text>
                  )} */}

                  <View style={Globalstyles.input}>
                    <GooglePlacesAutocomplete
                      placeholder={user.address || "Adresse"}
                      value={props.values.address}
                      query={{
                        key: GOOGLE_PLACES_API_KEY,
                        language: "fr", // language of the results
                      }}
                      onPress={(data, details = null) =>
                        (newAddress = data.description)
                      }
                      onFail={(error) => console.error(error)}
                      requestUrl={{
                        url: "https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api",
                        useOnPlatform: "web",
                      }} // this in only required for use on the web. See https://git.io/JflFv more for details.
                    />
                  </View>

                  {/* Save button */}
                  <CustomButton
                    text="Sauvegarder"
                    onPressButton={props.handleSubmit}
                  />
                </View>
              )}
            </Formik>
          </ScrollView>

          {/* progress bar */}
          {clicked && <ProgressBar text="Updating..." />}
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default UpdateProfile;

const styles = StyleSheet.create({
  image_view: {
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: 100,
    borderRadius: 55,
    marginTop: SIZES.padding * 4,
    backgroundColor: COLORS.white,
  },

  image: {
    width: 100,
    height: 100,
    borderRadius: 55,
    marginTop: SIZES.padding * 4,
    alignSelf: "center",
  },

  hyperlink_text: {
    alignSelf: "center",
    ...FONTS.body3,
    color: "blue",
    textDecorationLine: "underline",
    marginTop: SIZES.padding,
    marginBottom: SIZES.padding * 2,
  },
});
