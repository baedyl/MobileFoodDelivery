import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  FlatList,
} from "react-native";

import {
  icons,
  images,
  SIZES,
  COLORS,
  FONTS,
  categoryData,
  DATABASE_URL,
} from "../constants";
import database from "@react-native-firebase/database";
import { useSelector } from "react-redux";

const Home = ({ navigation }) => {
  // Dummy Datas
  const initialCurrentLocation = {
    streetName: "AfricanBasket",
    gps: {
      latitude: 1.5496614931250685,
      longitude: 110.36381866919922,
    },
  };

  // price rating
  const affordable = 1;
  const fairPrice = 2;
  const expensive = 3;

  // Data from API
  // const [restaurantData, setRestaurantData] = React.useState(null)
  const restaurantsReference = database().ref("/Restaurants");
  const { user } = useSelector((state) => state.userReducer);
  const [userPhoto, setUserPhoto] = useState(null);

  const [categories, setCategories] = React.useState(categoryData);
  const [selectedCategory, setSelectedCategory] = React.useState(null);
  const [restaurantData, setRestaurants] = React.useState(restaurantData);
  const [restaurantDataCopy, setRestaurantsCopy] = React.useState(null);
  const [currentLocation, setCurrentLocation] = React.useState(
    initialCurrentLocation
  );

  useEffect(() => {
    let array = [];
    console.log("restaurants ref: ", restaurantsReference);
    restaurantsReference.on(
      "value",
      (snapshot) => {
        console.log("Restaurants data: ", snapshot.val());
        snapshot.forEach((item) => {
          var snapshotItem = item.val();
          // snapshotItem.categories = JSON.parse(snapshotItem.categories);
          if (snapshotItem.rating >= 4.8) {
            array.push(snapshotItem);
          }
          console.log(snapshotItem.categories);
        });
        setRestaurants(array);
        setRestaurantsCopy(array);
        array = [];
      },
      (err) => {
        console.log(err);
      }
    );
    getUserPhoto();
    // setCategorySelected(false)
    setSelectedCategory(null);
  }, [user]);

  function getUserPhoto() {
    if (user) {
      const userReference = database(DATABASE_URL).ref(
        "/Users/" + user.uid + "/photoUrl"
      );
      userReference.on("value", (snapshot) => {
        setUserPhoto(snapshot.val());
      });
    } else setUserPhoto("default");
  }

  function onSelectCategory(category) {
    //filter restaurant
    if (category === selectedCategory) {
      // unselect category
      setSelectedCategory(null);
      setRestaurants(restaurantDataCopy);
    } else {
      // Select category
      let restaurantList = restaurantDataCopy.filter((a) =>
        a.categories.includes(category.id)
      );
      setRestaurants(restaurantList);
      setSelectedCategory(category);
    }
  }

  function getCategoryNameById(id) {
    let category = categories.filter((a) => a.id == id);

    if (category.length > 0) return category[0].name;

    return "";
  }

  function renderHeader() {
    return (
      <View style={{ flexDirection: "row", height: 50 }}>
        <TouchableOpacity
          style={{
            width: 50,
            paddingLeft: SIZES.padding * 2,
            justifyContent: "center",
          }}
        >
          <Image
            source={icons.nearby}
            resizeMode="contain"
            style={{
              width: 30,
              height: 30,
            }}
          />
        </TouchableOpacity>

        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <View
            style={{
              width: "70%",
              height: "100%",
              backgroundColor: COLORS.lightGray3,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: SIZES.radius,
            }}
          >
            <Text style={{ ...FONTS.h3 }}>{currentLocation.streetName}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={{
            width: 50,
            paddingRight: SIZES.padding * 2,
            justifyContent: "center",
          }}
        >
          <Image
            source={icons.basket}
            resizeMode="contain"
            style={{
              width: 30,
              height: 30,
            }}
          />
        </TouchableOpacity>
      </View>
    );
  }

  function renderMainCategories() {
    const renderItem = ({ item }) => {
      return (
        <TouchableOpacity
          style={{
            padding: SIZES.padding,
            paddingBottom: SIZES.padding * 2,
            backgroundColor:
              selectedCategory?.id == item.id ? COLORS.primary : COLORS.white,
            borderRadius: SIZES.radius,
            alignItems: "center",
            justifyContent: "center",
            marginRight: SIZES.padding,
            ...styles.shadow,
          }}
          onPress={() => onSelectCategory(item)}
        >
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor:
                selectedCategory?.id == item.id
                  ? COLORS.white
                  : COLORS.lightGray,
            }}
          >
            <Image
              source={item.icon}
              resizeMode="contain"
              style={{
                width: 30,
                height: 30,
              }}
            />
          </View>

          <Text
            style={{
              marginTop: SIZES.padding,
              color:
                selectedCategory?.id == item.id ? COLORS.white : COLORS.black,
              ...FONTS.body5,
            }}
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      );
    };

    return (
      <View style={{ padding: SIZES.padding * 2 }}>
        <Text style={{ ...FONTS.h1 }}>Categories</Text>

        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => `${item.id}`}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: SIZES.padding * 2 }}
        />
      </View>
    );
  }

  function renderRestaurantList() {
    const renderItem = ({ item }) => (
      <TouchableOpacity
        style={[styles.restaurantItem]}
        onPress={() =>
          navigation.navigate("Restaurant", {
            item,
            currentLocation,
          })
        }
        disabled={item.closed}
      >
        {/* Image */}
        <View
          style={{
            marginBottom: SIZES.padding,
          }}
        >
          <ImageBackground
            source={images[item.photo]}
            resizeMode="cover"
            style={{
              width: "100%",
              height: 200,
              borderRadius: SIZES.radius,
              opacity: item.closed ? 0.3 : 1,
            }}
          >
            <Text style={{ ...FONTS.h1 }}>{item.closed ? 'Coming Soon...' : ''}</Text>
          </ImageBackground>

          <View
            style={{
              position: "absolute",
              bottom: 0,
              height: 50,
              width: SIZES.width * 0.3,
              backgroundColor: COLORS.white,
              borderTopRightRadius: SIZES.radius,
              borderBottomLeftRadius: SIZES.radius,
              alignItems: "center",
              justifyContent: "center",
              ...styles.shadow,
            }}
          >
            <Text style={{ ...FONTS.h4 }}>{item.duration}</Text>
          </View>
        </View>

        {/* Restaurant Info */}
        <Text style={{ ...FONTS.body2 }}>{item.name}</Text>

        <View
          style={{
            marginTop: SIZES.padding,
            flexDirection: "row",
          }}
        >
          {/* Rating */}
          <Image
            source={icons.star}
            style={{
              height: 20,
              width: 20,
              tintColor: COLORS.primary,
              marginRight: 10,
            }}
          />
          <Text style={{ ...FONTS.body3 }}>{item.rating}</Text>

          {/* Categories */}
          <View
            style={{
              flexDirection: "row",
              marginLeft: 10,
            }}
          >
            {item.categories.map((categoryId) => {
              return (
                <View style={{ flexDirection: "row" }} key={categoryId}>
                  <Text style={{ ...FONTS.body3 }}>
                    {getCategoryNameById(categoryId)}
                  </Text>
                  <Text style={{ ...FONTS.h3, color: COLORS.darkgray }}>
                    {" "}
                    .{" "}
                  </Text>
                </View>
              );
            })}

            {/* Price */}
            {[1, 2, 3].map((priceRating) => (
              <Text
                key={priceRating}
                style={{
                  ...FONTS.body3,
                  color:
                    priceRating <= item.priceRating
                      ? COLORS.black
                      : COLORS.darkgray,
                }}
              >
                $
              </Text>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );

    return (
      <FlatList
        data={restaurantData}
        keyExtractor={(item) => `${item.id}`}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingHorizontal: SIZES.padding * 2,
          paddingBottom: 30,
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderMainCategories()}
      {renderRestaurantList()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray4,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  restaurantItem: {
    marginBottom: SIZES.padding * 2,
    padding: 10,
  },
});

export default Home;
