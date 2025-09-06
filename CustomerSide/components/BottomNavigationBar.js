import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useNavigationState } from '@react-navigation/native';

const BottomNavigationBar = () => {
  const navigation = useNavigation();
  const navigationState = useNavigationState(state => state);
  const currentRouteName = navigationState?.routes[navigationState.index]?.name;

  const navItems = [
    { name: 'home', icon: 'home-outline', activeIcon: 'home', screen: 'Home' },
    { name: 'categories', icon: 'contrast-outline', activeIcon: 'contrast', screen: 'CategoryScreen' },
    { name: 'wishlist', icon: 'heart-outline', activeIcon: 'heart', screen: 'Wishlist' },
    { name: 'cart', icon: 'cart-outline', activeIcon: 'cart', screen: 'CartScreen' },
    { name: 'account', icon: 'person-outline', activeIcon: 'person', screen: 'ProfileScreen' },
  ];

  const insets = useSafeAreaInsets();

  const handlePress = (item) => {
    // Navigate only if the screen is different from the current one
    if (item.screen && item.screen !== currentRouteName) {
      navigation.navigate(item.screen);
    }
  };

  return (
    <View style={[styles.bottomNav, { paddingBottom: insets.bottom }]}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.name}
          style={styles.navItem}
          onPress={() => handlePress(item)}
        >
          <Ionicons
            // Check if the current route name matches the item's screen name
            name={currentRouteName === item.screen ? item.activeIcon : item.icon}
            size={26}
            color={currentRouteName === item.screen ? '#A68B69' : 'gray'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
});

export default BottomNavigationBar;