import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native";
import { Globalstyles } from "../styles/GlobalStyle";
import { CartItems, InnerHeader } from "../components";
import { DATABASE_URL } from "../constants";
import { firebase } from "@react-native-firebase/database";
import { useSelector } from "react-redux";

const Cart = ({ navigation }) => {
  const { user } = useSelector((state) => state.userReducer);
  const [userInfo, setUserInfo] = useState(null);
  const [cartItems, setCartItems] = useState(null);
  const cartReference = firebase.app().database(DATABASE_URL).ref("/Cart/");

  useEffect(() => {
    const currentUser = firebase.auth().currentUser;
    if (currentUser) {
      // Get current user complete data (We mainly need the user's address)
      const userReference = firebase
        .app()
        .database(DATABASE_URL)
        .ref("/Users/" + currentUser.uid);
      userReference.on("value", (snapshot) => {
        setUserInfo(snapshot.val());
      });
    }
    if (user) {
      let array = [];
      cartReference.on(
        "value",
        (snapshot) => {
          console.log("cart snapshot!");
          snapshot.forEach((snapshotItem) => {
            var item = snapshotItem.val();
            console.log(item);
            if (item.uid == user.uid) array.push(item);
          });
          setCartItems(array);
          array = [];
        },
        (err) => {
          console.log(err);
        }
      );
    } else setCartItems([]);
  }, [user]);

  // function for saving order data in firebase
  function confirmOrder() {
    let durations = cartItems.map((item) =>
      parseInt(
        item.duration.charAt(item.duration.length - 6) +
          item.duration.charAt(item.duration.length - 5)
      )
    );

    let total_duration = durations.reduce((a, b) => a + (b || 0), 0);

    let array = [];
    const Oid = firebase.app().database(DATABASE_URL).ref("/Order/").push();

    console.log("DELIVER HERE: ", userInfo);

    array.push({
      total: getTotal(),
      oid: Oid.key,
      totalItems: cartItems.length,
      uid: user.uid,
      time: total_duration,
      address: userInfo?.address,
    });

    for (let index = 0; index < cartItems.length; index++) {
      // Add each cart item in the order
      var key = `item${index + 1}`;
      var obj = {};
      obj[key] =
        cartItems[index].qty +
        " " +
        cartItems[index].name +
        " " +
        cartItems[index].price +
        " DH";
      array.push(obj);

      // Remove item from cart
      deleteItem(cartItems[index].name);
    }

    Oid.set(Object.assign(...array));
    navigation.navigate("Order", { screen: "Order" });
  }

  //function to delete a cart item
  function deleteItem(name) {
    firebase
      .app()
      .database(DATABASE_URL)
      .ref("/Cart/" + name)
      .remove();
  }

  //function for getting total price
  function getTotal() {
    let total = 0;
    if (cartItems != null)
      total = cartItems.reduce((a, b) => a + (b.total || 0), 0);
    return total;
  }

  //function for changing item quantity
  function changeQty(item, action) {
    const itemReference = firebase
      .app()
      .database(DATABASE_URL)
      .ref("/Cart/" + item.name);
    if (action == "+") {
      itemReference
        .update({ qty: item.qty + 1, total: (item.qty + 1) * item.price })
        .then(() => console.log("qty increased!"));
    } else {
      if (item.qty > 1) {
        itemReference
          .update({ qty: item.qty - 1, total: (item.qty - 1) * item.price })
          .then(() => console.log("qty decreased!"));
      }
    }
  }

  return (
    <SafeAreaView style={Globalstyles.container_1}>
      <CartItems
        cartItems={cartItems}
        getTotal={getTotal}
        deleteItem={deleteItem}
        changeQty={changeQty}
        confirmOrder={confirmOrder}
        navigation={navigation}
      />
    </SafeAreaView>
  );
};

export default Cart;
