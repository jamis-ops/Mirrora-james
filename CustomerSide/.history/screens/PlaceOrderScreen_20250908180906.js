// screens/PlaceOrderScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Toast from "react-native-toast-message";

// fonts
import { useFonts as useLeagueSpartan, LeagueSpartan_700Bold } from "@expo-google-fonts/league-spartan";
import { useFonts as useMontserrat, Montserrat_400Regular, Montserrat_600SemiBold } from "@expo-google-fonts/montserrat";

// firebase
import { auth, db } from "../Backend/firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

export default function PlaceOrderScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedPaymentMethod: initialPayment } = route.params ?? {};

  const [leagueLoaded] = useLeagueSpartan({ LeagueSpartan_700Bold });
  const [montLoaded] = useMontserrat({ Montserrat_400Regular, Montserrat_600SemiBold });

  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(initialPayment || "bankTransfer");

  // local fallback if cart empty or user not logged in
  const localFallback = [
    { id: "sample-1", name: "Floor Standing Mirror", price: 2000, quantity: 1, imageUrl: null, size: '60.2" x 51.2"' },
  ];

  useEffect(() => {
    let mounted = true;
    const loadCart = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) {
          if (mounted) {
            setCartItems(localFallback);
            setLoading(false);
          }
          return;
        }

        const itemsCol = collection(db, "carts", user.uid, "items");
        const snap = await getDocs(itemsCol);
        if (!mounted) return;

        if (snap.empty) setCartItems(localFallback);
        else {
          const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setCartItems(items);
        }
      } catch (err) {
        console.error("Failed loading cart:", err);
        setCartItems(localFallback);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadCart();
    return () => (mounted = false);
  }, []);

  if (!leagueLoaded || !montLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#A68B69" />
      </View>
    );
  }

  const subtotal = cartItems.reduce((s, it) => s + (Number(it.price || 0) * Number(it.quantity || 1)), 0);
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    const user = auth.currentUser;
    if (!user) {
      Toast.show({ type: "info", text1: "Login Required", text2: "Please sign in before placing an order." });
      return;
    }

    setPlacing(true);
    try {
      const itemsCol = collection(db, "carts", user.uid, "items");
      const snap = await getDocs(itemsCol);

      const items = snap.empty
        ? cartItems
        : snap.docs.map(d => ({ id: d.id, ...d.data() }));

      const orderData = {
        userId: user.uid,
        items: items.map(it => ({
          productId: it.productId || it.id,
          name: it.name,
          price: Number(it.price || 0),
          quantity: Number(it.quantity || 1),
          imageUrl: it.imageUrl || "",
        })),
        subtotal,
        deliveryFee,
        total,
        address: "123 Tonying Street, Mactan Proper, Lapu-Lapu City",
        paymentMethod: selectedPaymentMethod,
        status: "pending",
        createdAt: serverTimestamp(),
      };

      const ordersCol = collection(db, "orders");
      const orderRef = await addDoc(ordersCol, orderData);

      // clear cart
      if (!snap.empty) {
        const deletes = snap.docs.map(d => deleteDoc(doc(db, "carts", user.uid, "items", d.id)));
        await Promise.all(deletes);
      }

      Toast.show({ type: "success", text1: "🛒 Order placed", text2: "Your order was placed successfully." });

      // go to confirmation and pass orderId
      navigation.replace("OrderConfirmationScreen", { orderId: orderRef.id });
    } catch (err) {
      console.error("Place order failed:", err);
      Toast.show({ type: "error", text1: "Order Failed", text2: "Something went wrong. Try again." });
    } finally {
      setPlacing(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.checkoutItemContainer}>
      <View style={{ width: 72, height: 72, borderRadius: 8, overflow: "hidden", backgroundColor: "#fff", justifyContent:"center", alignItems:"center" }}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={{ width: 72, height: 72, resizeMode: "cover" }} />
        ) : (
          <Image source={require("../assets/mirror4.png")} style={{ width: 64, height: 64, resizeMode: "contain" }} />
        )}
      </View>
      <View style={styles.checkoutItemDetails}>
        <Text style={styles.checkoutItemName}>{item.name}</Text>
        <Text style={styles.checkoutItemSize}>Size: {item.size || item.dimensions || "—"}</Text>
        <Text style={styles.checkoutItemPrice}>₱ {Number(item.price || 0).toLocaleString()}</Text>
      </View>
      <Text style={styles.checkoutItemQuantity}>x{item.quantity || 1}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#A68B69" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Place Order</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <FlatList data={cartItems} keyExtractor={(i) => i.id} renderItem={renderItem} scrollEnabled={false} />

        {/* Address */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Address</Text>
          <View style={styles.addressContainer}>
            <Text style={styles.addressText}>123 Tonying Street, Mactan Proper, Lapu-Lapu City</Text>
            <TouchableOpacity>
              <Icon name="pencil-outline" size={20} color="#888" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>₱ {Number(subtotal).toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee:</Text>
            <Text style={styles.summaryValue}>Free</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total:</Text>
            <Text style={styles.summaryValue}>₱ {Number(total).toLocaleString()}</Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethodOption}>
            <TouchableOpacity style={styles.radioButton} onPress={() => setSelectedPaymentMethod("bankTransfer")}>
              {selectedPaymentMethod === "bankTransfer" && <View style={styles.radioButtonInner} />}
            </TouchableOpacity>
            <View style={styles.paymentDetails}>
              <Text style={styles.paymentLabel}>Bank Transfer</Text>
              <Text style={styles.paymentInfo}>50% down payment is required upon placing the order</Text>
            </View>
          </View>

          <View style={[styles.bankInfoContainer, styles.shadow]}>
            <Image source={require("../assets/bpi.png")} style={styles.bankLogo} />
            <View>
              <Text style={styles.bankName}>Bank of the Philippine Islands</Text>
              <Text style={styles.accountName}>John Doe</Text>
              <Text style={styles.accountNumber}>********3721</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Place Order bottom bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder} disabled={placing}>
          {placing ? <ActivityIndicator color="#fff" /> : <Text style={styles.placeOrderButtonText}>Place Order</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF7EC" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#eee" },
  headerTitle: { fontFamily: "LeagueSpartan_700Bold", fontSize: 22, color: "#000" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { paddingHorizontal: 20, paddingTop: 10 },
  sectionContainer: { marginBottom: 20 },
  sectionTitle: { fontFamily: "Montserrat_600SemiBold", fontSize: 18, color: "#000", marginBottom: 10 },
  checkoutItemContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 15, padding: 15, marginBottom: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  checkoutItemDetails: { flex: 1, paddingHorizontal: 12 },
  checkoutItemName: { fontFamily: "Montserrat_600SemiBold", fontSize: 16, color: "#000" },
  checkoutItemSize: { fontFamily: "Montserrat_400Regular", fontSize: 12, color: "#777", marginTop: 4 },
  checkoutItemPrice: { fontFamily: "Montserrat_600SemiBold", fontSize: 16, color: "#A68B69", marginTop: 5 },
  checkoutItemQuantity: { fontFamily: "Montserrat_400Regular", fontSize: 14, color: "#666" },
  addressContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 15, backgroundColor: "#fff", borderRadius: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  addressText: { fontFamily: "Montserrat_400Regular", fontSize: 14, color: "#000", flex: 1 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  summaryLabel: { fontFamily: "Montserrat_400Regular", fontSize: 14, color: "#666" },
  summaryValue: { fontFamily: "Montserrat_600SemiBold", fontSize: 14, color: "#000" },
  paymentMethodOption: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  radioButton: { height: 20, width: 20, borderRadius: 10, borderWidth: 2, borderColor: "#A68B69", alignItems: "center", justifyContent: "center", marginRight: 10 },
  radioButtonInner: { height: 12, width: 12, borderRadius: 6, backgroundColor: "#A68B69" },
  paymentDetails: { flex: 1 },
  paymentLabel: { fontFamily: "Montserrat_600SemiBold", fontSize: 16, color: "#000" },
  paymentInfo: { fontFamily: "Montserrat_400Regular", fontSize: 12, color: "#666", marginTop: 2 },
  bankInfoContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 15, padding: 10, marginBottom: 15, marginTop: -7 },
  bankLogo: { width: 40, height: 40, marginRight: 15, resizeMode: "contain" },
  bankName: { fontFamily: "Montserrat_400Regular", fontSize: 14, color: "#000" },
  accountName: { fontFamily: "Montserrat_600SemiBold", fontSize: 14, color: "#000" },
  accountNumber: { fontFamily: "Montserrat_400Regular", fontSize: 12, color: "#888" },
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingVertical: 15, backgroundColor: "#fff", borderTopLeftRadius: 30, borderTopRightRadius: 30, shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 10 },
  placeOrderButton: { backgroundColor: "#A68B69", borderRadius: 25, paddingVertical: 15, alignItems: "center", justifyContent: "center" },
  placeOrderButtonText: { fontFamily: "Montserrat_600SemiBold", fontSize: 16, color: "#fff" },
  shadow: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
});
