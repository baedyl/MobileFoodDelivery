import React from "react";
import {
  View,
  Text,
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { setDeliver } from "../redux/actions";
import { useDispatch } from "react-redux";
import { COLORS, SIZES, FONTS, icons } from "../constants";

const OrderList = ({ navigation, orders, deleteOrder }) => {
  const dispatch = useDispatch();

  function displayOrderItems(item) {
    var items = "\n";
    for (let i = 1; i <= item.totalItems; i++)
      items = items + item[`item${i}`] + "\n";

    return items;
  }

  function showOrderDelivery(order) {
    // console.log("deliver_by ", order.deliver_by);
    if (!order.accepted || !order.valid) {
      Alert.alert("Info!", "Veuillez patienter, votre commande est en cours de traitement")
    } else {
      dispatch(setDeliver(order));
      navigation.navigate("OrderDelivery", { time: order.time + 10 });
    }
  }

  const renderItem = ({ item, index }) => {
    return (
      <View style={styles.container}>
        {/* Order No */}
        <View style={{ padding: SIZES.padding * 2 }}>
          {/* Order No */}
          <View style={styles.row}>
            <Text style={styles.order_no_text}>Commande : {index + 1}</Text>

            {/* Time */}
            <View style={{ flexDirection: "row" }}>
              <Image
                source={icons.time}
                style={{ height: 20, width: 20, tintColor: COLORS.primary }}
              />
              <Text style={{ ...FONTS.body4, color: COLORS.black }}>
                {" "}
                {item.time} mins
              </Text>
            </View>
          </View>

          {/* Order Items */}
          <Text style={styles.order_items_text}>{displayOrderItems(item)}</Text>

          {/* Total */}
          <View style={styles.total}>
            <Text style={{ ...FONTS.body3, color: COLORS.black }}>Total: </Text>
            <Text style={{ ...FONTS.body2, color: COLORS.black }}>
              {item.total} DH
            </Text>
          </View>

          {/* Track & Cancel buttons */}
          <View style={styles.buttons_container}>
            <TouchableOpacity
              style={[
                styles.buttons,
                !item.delivered
                  ? styles.button_enabled
                  : styles.button_disabled,
              ]}
              disabled={item.delivered}
              onPress={() => showOrderDelivery(item)}
            >
              <Text style={styles.buttons_text}>Suivre</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ ...styles.buttons, backgroundColor: "red" }}
              disabled={item.delivered}
              onPress={() => deleteOrder(item.oid)}
            >
              <Text style={styles.buttons_text}>
                {!item.delivered ? "Annuler" : "Livrée"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={orders}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{
          padding: 16,
        }}
      />
    </View>
  );
};

export default OrderList;

const styles = StyleSheet.create({
  container: {
    margin: 8,
    elevation: 3,
    width: SIZES.width - 45,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
  },
  order_no_text: {
    ...FONTS.h4,
    color: COLORS.black,
  },
  order_items_text: {
    ...FONTS.body4,
    color: COLORS.black,
  },
  total: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray3,
    paddingVertical: 8,
    borderBottomColor: COLORS.lightGray3,
    borderBottomWidth: 1,
  },
  buttons_container: {
    padding: SIZES.padding * 2,
    paddingBottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  buttons: {
    backgroundColor: COLORS.primary,
    width: SIZES.width * 0.35,
    padding: SIZES.padding,
    alignItems: "center",
    borderRadius: SIZES.radius,
    marginHorizontal: 20,
  },
  button_disabled: {
    opacity: 0.3,
  },
  button_enabled: {
    opacity: 1,
  },
  buttons_text: {
    ...FONTS.body4,
    color: COLORS.white,
  },
  row: {
    paddingBottom: 8,
    borderBottomColor: COLORS.lightGray3,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
