import React, { useState, useEffect } from "react";
import { Linking } from "react-native";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { useSelector } from "react-redux";
import { firebase } from "@react-native-firebase/database";
import {
  COLORS,
  icons,
  SIZES,
  images,
  FONTS,
  DATABASE_URL,
} from "../constants";
import MapView, {
  PROVIDER_GOOGLE,
  Marker,
  AnimatedRegion,
  Polyline,
} from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import {GOOGLE_API_KEY} from '@env';
// import {usePubNub} from 'pubnub-react';

const screen = Dimensions.get("window");

// Rabat, Morocco coordinates
const ASPECT_RATIO = screen.width / screen.height;
const LATITUDE = 34.01325;
const LONGITUDE = -6.83255;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const OrderDelivery = ({ route }) => {
  const { deliver } = useSelector((state) => state.deliverReducer);

  const mapView = React.useRef();
  const [currentRestaurant, setCurrentRestaurant] = useState(null);
  const [streetName, setStreetName] = useState("");
  const [fromLocation, setFromLocation] = useState({});
  const [toLocation, setToLocation] = useState({});
  const [region, setRegion] = useState(null);
  const [duration, setDuration] = useState(0);
  const [coordinates, setCoordinates] = useState([]);
  const [userInfo, setUserInfo] = useState(null);

  // const pubnub = usePubNub();

  let thisState = {
    latitude: userInfo?.location?.latitude,
    longitude: userInfo?.location?.longitude,
    coordinate: new AnimatedRegion({
      latitude: LATITUDE,
      longitude: LONGITUDE,
      latitudeDelta: 0,
      longitudeDelta: 0,
    }),
  };

  useEffect(() => {
    const currentUser = firebase.auth().currentUser;
    console.log("current: ", currentUser);
    if (currentUser) {
      const userReference = firebase
        .app()
        .database(DATABASE_URL)
        .ref("/Users/" + currentUser.uid);
      userReference.on("value", (snapshot) => {
        console.log("WE IN!");
        setUserInfo(snapshot.val());
        console.log("user: ", snapshot.val());
        const userLocation = snapshot.val().location;
        console.log("user: ", userLocation);
        thisState.latitude = userLocation?.latitude;
        thisState.longitude = userLocation?.longitude;
        // thisState = {
        //   latitude: userLocation?.latitude,
        //   longitude: userLocation?.longitude,
        //   coordinate: new AnimatedRegion({
        //     latitude: LATITUDE,
        //     longitude: LONGITUDE,
        //     latitudeDelta: 0,
        //     longitudeDelta: 0,
        //   }),
        // };

        const locations = {
          streetName: deliver.boutique?.address,
          myLocation: {
            latitude: userLocation?.latitude,
            longitude: userLocation?.longitude,
          },
          resLocation: {
            latitude: deliver.boutique?.location.latitude,
            longitude: deliver.boutique?.location.longitude,
          },
        };

        let fromLoc = locations.resLocation;
        let toLoc = locations.myLocation;
        let street = locations.streetName;
        let mapRegion = {
          latitude: (fromLoc.latitude + toLoc.latitude) / 2,
          longitude: (fromLoc.longitude + toLoc.longitude) / 2,
        };

        setStreetName(street);
        setFromLocation(fromLoc);
        setToLocation(toLoc);
        setRegion(mapRegion);
        setCoordinates([
          { latitude: fromLoc.latitude, longitude: fromLoc.longitude },
          { latitude: toLoc.latitude, longitude: toLoc.longitude },
        ]);
      });
    }

    if (!mapView.current) {
      // do componentDidMount logic
      console.log("componentDidMount ", userInfo?.location);
      // subscribeToPubNub();
      mapView.current = true;
    } else {
      // do componentDidUpdate logic
      console.log("deliver update ", deliver);
    }

    let { time } = route.params;
    setDuration(time);
  }, []);

  // subscribeToPubNub = () => {
  //   pubnub.subscribe({
  //     channels: ['location'],
  //     withPresence: true,
  //   });
  //   pubnub.getMessage('location', msg => {
  //     const { coordinate } = this.state;
  //     const { latitude, longitude } = msg.message;
  //     const newCoordinate = { latitude, longitude };

  //     if (Platform.OS === 'android') {
  //       if (this.marker) {
  //         this.marker._component.animateMarkerToCoordinate(newCoordinate, 500);
  //       }
  //     } else {
  //       coordinate.timing(newCoordinate).start();
  //     }

  //     thisState.latitude = latitude;
  //     thisState.longitude = longitude;
  //   });
  // };

  //zoom in function
  function zoomIn() {
    let newRegion = {
      latitude: region.latitude,
      longitude: region.longitude,
      latitudeDelta: region.latitudeDelta / 2,
      longitudeDelta: region.longitudeDelta / 2,
    };
    setRegion(newRegion);
    mapView.current.animateToRegion(newRegion, 200);
  }

  //zoom out function
  function zoomOut() {
    let newRegion = {
      latitude: region.latitude,
      longitude: region.longitude,
      latitudeDelta: region.latitudeDelta * 2,
      longitudeDelta: region.longitudeDelta * 2,
    };
    setRegion(newRegion);
    mapView.current.animateToRegion(newRegion, 200);
  }

  //Map function
  function renderMap() {
    // delivery boy icon
    const deliveryBoy = () => (
      <Marker coordinate={fromLocation}>
        <View style={styles.innerView_1}>
          <View style={styles.innerView_2}>
            <Image
              source={images.avatar_3}
              style={{
                height: 25,
                width: 25,
                borderRadius: 10,
              }}
            />
          </View>
        </View>
      </Marker>
    );

    // home icon
    const homeIcon = () => (
      <Marker coordinate={toLocation} anchor={{ x: 0.5, y: 0.5 }}>
        <Image
          source={icons.home}
          style={{
            height: 40,
            width: 40,
          }}
        />
      </Marker>
    );

    const getMapRegion = () => ({
      latitude: thisState.latitude,
      longitude: thisState.longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    });

    return (
      <View style={{ flex: 1 }}>
        <MapView
          ref={mapView}
          style={{ flex: 1 }}
          provider={PROVIDER_GOOGLE}
          region={getMapRegion()}
          // initialRegion={{
          //   latitude: LATITUDE,
          //   longitude: LONGITUDE,
          //   latitudeDelta: LATITUDE_DELTA,
          //   longitudeDelta: LONGITUDE_DELTA,
          // }}
        >
          {deliveryBoy()}
          {homeIcon()}

          {/* <Polyline
            coordinates={coordinates}
            strokeColor="red"
            strokeWidth={3}
          /> */}
          <MapViewDirections
            origin={coordinates[0]}
            destination={coordinates[1]}
            apikey={GOOGLE_API_KEY} // insert your API Key here
            strokeWidth={4}
            strokeColor="red"
          />
        </MapView>
      </View>
    );
  }

  // Header function
  function renderDestinationHeader() {
    return (
      <View style={styles.topView}>
        <View style={styles.topView_inner}>
          <Image
            source={icons.pin}
            style={{
              width: 30,
              height: 30,
              tintColor: COLORS.darkgray,
              marginRight: SIZES.padding,
            }}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.header_text}>{streetName}</Text>
          </View>
          <Text style={styles.header_text}>{Math.ceil(duration)} mins</Text>
        </View>
      </View>
    );
  }

  // Delivery boy info function
  function renderDeliveryInfo() {
    return (
      <View style={styles.bottomView}>
        <View style={styles.bottomView_inner}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {/* Avatar */}
            <Image
              source={
                (deliver.deliver_by.photoUrl &&
                  deliver.deliver_by.photoUrl !== "default") ||
                icons.user
              }
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
              }}
            />

            {/* Name */}
            <View style={{ flex: 1, marginLeft: SIZES.padding }}>
              <Text style={styles.name}>{deliver.deliver_by?.name}</Text>
              <Text style={styles.deliveryBoy}>
                {deliver.deliver_by?.phone}
              </Text>
            </View>
          </View>

          {/* phone */}
          <TouchableOpacity
            style={styles.call}
            onPress={() => Linking.openURL(`tel:${deliver.deliver_by?.phone}`)}
          >
            <Image
              source={icons.phone}
              style={{
                width: 30,
                height: 30,
                tintColor: COLORS.white,
              }}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  //zoom buttons function
  function renderZoomButtons() {
    return (
      <View style={styles.zoomView}>
        {/* Zoom In  button*/}
        <TouchableOpacity style={styles.zoom} onPress={() => zoomIn()}>
          <Text style={styles.zoom_text}>+</Text>
        </TouchableOpacity>

        {/* Zoom Out button */}
        <TouchableOpacity style={styles.zoom} onPress={() => zoomOut()}>
          <Text style={styles.zoom_text}>-</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {fromLocation.latitude && toLocation.latitude ? renderMap() : null}
      {renderDestinationHeader()}
      {renderDeliveryInfo()}
      {/* {renderZoomButtons()} */}
    </View>
  );
};

export default OrderDelivery;

const styles = StyleSheet.create({
  innerView_1: {
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },

  innerView_2: {
    height: 30,
    width: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
  },

  topView: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },

  topView_inner: {
    flexDirection: "row",
    alignItems: "center",
    width: SIZES.width * 0.9,
    paddingHorizontal: SIZES.padding * 2,
    paddingVertical: SIZES.padding,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    elevation: 3,
  },

  header_text: {
    ...FONTS.body3,
    color: COLORS.black,
  },

  bottomView: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },

  bottomView_inner: {
    width: SIZES.width * 0.9,
    paddingHorizontal: SIZES.padding * 2,
    paddingVertical: SIZES.padding * 3,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
    elevation: 3,
  },
  name: {
    ...FONTS.h4,
    color: COLORS.black,
  },

  deliveryBoy: {
    ...FONTS.body4,
    color: COLORS.darkgray,
  },

  call: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    padding: SIZES.padding,
    borderRadius: 30,
    height: 50,
    width: 50,
    position: "absolute",
    right: 16,
    top: 28,
  },

  zoomView: {
    position: "absolute",
    bottom: SIZES.height * 0.35,
    right: SIZES.padding * 2,
    width: 60,
    height: 130,
    justifyContent: "space-between",
  },

  zoom: {
    height: 60,
    width: 60,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    elevation: 3,
  },

  zoom_text: {
    ...FONTS.body1,
    color: COLORS.black,
  },
});
