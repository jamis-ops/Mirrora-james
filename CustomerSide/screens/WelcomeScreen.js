// screens/WelcomeScreen.js
import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';

import { useFonts as useLeagueSpartan, LeagueSpartan_700Bold } from '@expo-google-fonts/league-spartan';
import { useFonts as useMontserrat, Montserrat_400Regular, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';

const WelcomeScreen = () => {
  const [spartanLoaded] = useLeagueSpartan({ LeagueSpartan_700Bold });
  const [montLoaded] = useMontserrat({
    Montserrat_400Regular,
    Montserrat_600SemiBold,
  });

  const navigation = useNavigation();

  if (!spartanLoaded || !montLoaded) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      {/* Images */}
      <View style={styles.imageContainer}>
        <Image source={require('../assets/WelcomeScreen/mirror1.png')} style={styles.largeImage} />
        <View style={styles.smallImages}>
          <Image source={require('../assets/WelcomeScreen/mirror2.png')} style={styles.mirror2Image} />
          <Image source={require('../assets/WelcomeScreen/mirror3.png')} style={styles.mirror3Image} />
        </View>
      </View>

      {/* Title with League Spartan */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>
          REFLECT YOUR <Text style={styles.styleHighlight}>STYLE</Text>
        </Text>
        <Text style={styles.title}>WITH MIRRORA</Text>
      </View>

      {/* Description with Montserrat */}
      <Text style={styles.description}>
        Explore elegant mirrors, personalize your design, and bring beauty into every room
      </Text>

      {/* Create Account Button */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('CreateAccount')}
      >
        <Text style={styles.buttonText}>Let's Get Started</Text>
      </TouchableOpacity>

      {/* Sign In */}
      <Text style={styles.signinText}>
        Already have an account?{' '}
        <Text 
          style={styles.signinLink} 
          onPress={() => navigation.navigate('SignIn')}
        >
          Sign In
        </Text>
      </Text>
    </View>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    alignItems: 'center',
  },
  largeImage: {
    width: 180,
    height: 480,
    borderRadius: 112,
    marginRight: 10,
    marginTop: 35,
  },
  mirror2Image: {
    width: 160,
    height: 280,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    marginBottom: 20,
    marginTop: 35,
  },
  mirror3Image: {
    width: 160,
    height: 192,
    borderRadius: 50,
    marginTop: -13,
  },
  title: {
    fontSize: 30,
    fontFamily: 'LeagueSpartan_700Bold',
    textAlign: 'center',
    color: '#A6A6A6',
    marginBottom: -10,
  },
  styleHighlight: {
    color: '#A68B69',
  },
  description: {
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
    textAlign: 'center',
    color: '#666',
    marginTop: 25,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#a17c55',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 10,
  },
  buttonText: {
    fontFamily: 'Montserrat_600SemiBold',
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  signinText: {
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
    color: '#444',
  },
  signinLink: {
    color: '#7a5c3d',
    fontFamily: 'Montserrat_700Bold',
    textDecorationLine: 'underline',
  },
});
