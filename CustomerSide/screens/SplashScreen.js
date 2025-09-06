// screens/SplashScreen.js
import React, { useEffect } from 'react';
import { View, ImageBackground, Image, StyleSheet, Dimensions } from 'react-native';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, 3000); // show splash for 3 seconds

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/background.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <Image
          source={require('../assets/logoo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </ImageBackground>
    </View>
  );
};

export default SplashScreen;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: width * 0.6,
    height: 100,
  },
});
