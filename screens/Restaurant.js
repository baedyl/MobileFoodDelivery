import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Keyboard,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import { Globalstyles } from "../styles/GlobalStyle";
import {
  CustomButton,
  CartIcon,
  MenuList,
  CategoriesList,
} from "../components";
import {
  COLORS,
  icons,
  SIZES,
  images,
  FONTS,
  categoryData,
  DATABASE_URL,
} from "../constants";
import { isIphoneX } from "react-native-iphone-x-helper";
import { firebase } from "@react-native-firebase/database";
import { useSelector } from "react-redux";

const Restaurant = ({ route, navigation }) => {
  const { user } = useSelector((state) => state.userReducer);
  const [item, setItem] = useState(null);
  const [category, setCategory] = useState(null);
  const [restaurant, setRestaurant] = React.useState(null);
  const [currentLocation, setCurrentLocation] = React.useState(null);
  const [favorites, setFavorites] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categorySelected, setCategorySelected] = useState(false);
  const [menu, setMenu] = useState(null);

  useEffect(() => {
    let { item, currentLocation } = route.params;
    let array = [];
    console.log(Object.values(item.menu));
    console.log(typeof item.menu);
    Object.values(item.menu).forEach((item) => {
        // let snapshotItem = item.val();
        array.push(item)
    })
    setMenu(array);
    array = []
    console.log(array);
    // setMenu(item.menu);
    setRestaurant(item);
    setCurrentLocation(currentLocation);
    setCategorySelected(false);
  }, []);

  //function for adding item in cart in firebase
  function addToCart() {
    const REFERENCE_URL = "/Cart/" + item?.name;
    const cartReference = firebase
      .app()
      .database(DATABASE_URL)
      .ref(REFERENCE_URL);
    if (user) {
      cartReference
        .set({
          ...item,
          qty: 1,
          total: item?.price,
          uid: user.uid,
          category: category,
        })
        .then(() => {
          console.log("Added to Cart");
        })
        .catch((e) => console.log(e));
    } else {
      navigation.navigate("SignUp", {
        screen: "Restaurant",
        currentItem: item,
        currentCategory: category,
      });
    }
  }

  function onSelectCategory(category) {
    setCategorySelected(true);
    let array = [];
    menuReference.on("value", (snapshot) => {
      snapshot.forEach((item) => {
        var snapshotItem = item.val();
        if (snapshotItem.category == category.id) {
          array.push(snapshotItem);
        }
      });
      setMenu(array);
    });
    setSelectedCategory(category);
  }

  function addToFavorite(favoriteItem) {
    if (user) {
      const REFERENCE_URL = "/Favorite/" + favoriteItem.name;
      const favoriteReference = firebase
        .app()
        .database(DATABASE_URL)
        .ref(REFERENCE_URL);

      favoriteReference.once("value").then((snapshot) => {
        var item = snapshot.val();
        if (item != null) {
          firebase.app().database(DATABASE_URL).ref(REFERENCE_URL).remove();
          setFavorites(favorites.filter((a) => a != item.name));
        } else {
          favoriteReference
            .set({ ...favoriteItem, uid: user.uid })
            .then(() => {
              console.log("Added to favorite");
            })
            .catch((e) => console.log(e));
          setFavorites([...favorites, favoriteItem.name]);
        }
      });
    } else Alert.alert("", "Please Sign up/Sign in to add this to favorite");
  }

  // Header function
  function renderHeader() {
    return (
      <View style={{ flexDirection: "row", height: 50 }}>
        {/* Go back */}
        <TouchableOpacity
          style={{
            width: 50,
            paddingLeft: SIZES.padding * 2,
            justifyContent: "center",
          }}
          onPress={() => navigation.goBack()}
        >
          <Image
            source={icons.back}
            resizeMode="contain"
            style={{
              width: 30,
              height: 30,
            }}
          />
        </TouchableOpacity>

        {/* Restaurant Name Section */}
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              height: 50,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: SIZES.padding * 3,
              borderRadius: SIZES.radius,
              backgroundColor: COLORS.lightGray3,
            }}
          >
            <Text style={{ ...FONTS.h3 }}>{restaurant?.name}</Text>
          </View>
        </View>

        {/* Cart */}
        <CartIcon navigation={navigation} />
      </View>
    );
  }

  //function for displaying food item information
  function renderFoodInfo() {
    return (
      <>
        <View style={{ alignItems: "center" }}>
          <View style={styles.food_image}>
            {/* Food Image */}
            <Image
              source={{ uri: item?.photoUrl }}
              resizeMode="contain"
              style={{
                width: SIZES.width - 24,
                height: "95%",
              }}
            />
          </View>
        </View>

        <View style={styles.bottom_container}>
          {/* Name */}
          <Text style={styles.name}>{item?.name}</Text>

          {/* Description */}
          <Text style={styles.description}>{item?.description}</Text>

          {/* Duration */}
          <View style={styles.row_container}>
            <Text style={styles.duration_text}>Préparation</Text>
            <Text style={styles.duration_text}>{item?.duration}</Text>
          </View>

          <View style={styles.row_container}>
            {/* Price */}
            <Text style={styles.price}>{item?.price} DH</Text>

            {/* Rating */}
            <View style={{ flexDirection: "row" }}>
              <Image
                source={icons.star}
                resizeMode="contain"
                style={{
                  width: 23,
                  height: 23,
                }}
              />
              <Text style={styles.rating}>{item?.rating}</Text>
            </View>
          </View>

          {/* Add to Cart Button */}
          <View style={{ margin: SIZES.padding * 2, marginTop: 0 }}>
            <CustomButton
              text="Ajouter au panier"
              onPressButton={() => addToCart()}
            />
          </View>
        </View>

        {isIphoneX() && (
          <View
            style={{
              position: "absolute",
              bottom: -34,
              left: 0,
              right: 0,
              height: 34,
              backgroundColor: COLORS.white,
            }}
          ></View>
        )}
      </>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={Globalstyles.container_1}>
        {renderHeader()}

        <MenuList
          navigation={navigation}
          menu={menu}
          onPressFavorite={addToFavorite}
          favorites={favorites}
          categories={categoryData}
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default Restaurant;

const styles = StyleSheet.create({
  food_image: {
    height: SIZES.height * 0.3,
    marginTop: 16,
    paddingBottom: 20,
  },

  bottom_container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 5,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  name: {
    ...FONTS.h3,
    textAlign: "center",
    paddingVertical: SIZES.padding * 2,
    marginHorizontal: SIZES.padding * 3,
    borderBottomColor: COLORS.lightGray3,
    borderBottomWidth: 1,
  },

  description: {
    ...FONTS.body4,
    textAlign: "center",
    paddingVertical: SIZES.padding * 2,
    marginHorizontal: SIZES.padding * 3,
    color: COLORS.black,
    borderBottomColor: COLORS.lightGray3,
    borderBottomWidth: 1,
  },

  row_container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: SIZES.padding * 2,
    paddingHorizontal: SIZES.padding * 3,
  },

  duration_text: {
    marginLeft: SIZES.padding,
    ...FONTS.body3,
    color: COLORS.black,
  },

  price: {
    marginLeft: SIZES.padding,
    ...FONTS.h3,
  },

  rating: {
    marginLeft: SIZES.padding,
    ...FONTS.h4,
  },

  go_back: {
    width: 50,
    paddingLeft: SIZES.padding * 2,
    justifyContent: "center",
  },

  category: {
    height: "100%",
    width: "75%",
    backgroundColor: COLORS.lightGray3,
    paddingHorizontal: SIZES.padding * 3,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: SIZES.radius,
  },

  cart: {
    width: 50,
    paddingRight: SIZES.padding * 2,
    justifyContent: "center",
  },
});
