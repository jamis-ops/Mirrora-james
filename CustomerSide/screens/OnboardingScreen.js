// screens/OnboardingScreen.js
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts as useLeagueSpartan, LeagueSpartan_700Bold } from '@expo-google-fonts/league-spartan';
import { useFonts as useMontserrat, Montserrat_400Regular, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    image: require('../assets/Onboarding/onboarding1.png'),
    title: 'Welcome to Mirrora PH',
    description: 'Explore a world of mirrors and find the perfect mirror to complete your space.',
  },
  {
    id: '2',
    image: require('../assets/Onboarding/onboarding2.png'),
    title: 'Customize your Mirror',
    description: 'You can choose shape, size, and style to perfectly fit your living space.',
  },
  {
    id: '3',
    image: require('../assets/Onboarding/onboarding3.png'),
    title: 'Add your Favorites',
    description: 'Create your wishlist to save the mirrors you love.',
  },
];

export default function OnboardingScreen() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const flatListRef = useRef(null);
  const navigation = useNavigation();

  // Load fonts
  const [leagueSpartanLoaded] = useLeagueSpartan({ LeagueSpartan_700Bold });
  const [montserratLoaded] = useMontserrat({ Montserrat_400Regular, Montserrat_600SemiBold });

  if (!leagueSpartanLoaded || !montserratLoaded) {
    return <ActivityIndicator size="large" style={styles.loadingContainer} />;
  }

  const updateCurrentSlideIndex = (e) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / width);
    setCurrentSlideIndex(newIndex);
  };

  // mark onboarding as done and navigate to Welcome
  const finishOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasOnboarded', 'true');
    } catch (err) {
      console.warn('Failed to save onboarding flag', err);
    }
    navigation.replace('Welcome');
  };

  const goToNextSlide = () => {
    const nextSlideIndex = currentSlideIndex + 1;
    if (nextSlideIndex < slides.length) {
      const offset = nextSlideIndex * width;
      flatListRef?.current?.scrollToOffset({ offset, animated: true });
      setCurrentSlideIndex(nextSlideIndex);
    } else {
      finishOnboarding();
    }
  };

  const renderSlide = ({ item }) => (
    <ImageBackground
      source={item.image}
      style={styles.slideImageBackground}
      imageStyle={styles.slideImageStyle}
    >
      <View style={styles.overlay}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.paginationDots}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, currentSlideIndex === index && styles.activeDot]}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.nextButton} onPress={goToNextSlide}>
            <Icon name="arrow-right" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );

  return (
    <View style={styles.container}>
      {/* Skip button top-right */}
      <View style={styles.skipContainer}>
        <TouchableOpacity onPress={finishOnboarding}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        onMomentumScrollEnd={updateCurrentSlideIndex}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        data={slides}
        keyExtractor={(item) => item.id}
        renderItem={renderSlide}
        style={styles.flatList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  skipContainer: {
    position: 'absolute',
    zIndex: 2,
    right: 20,
    top: 40,
  },
  skipText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  flatList: { flex: 1 },
  slideImageBackground: { width: width, height: '100%', justifyContent: 'flex-end' },
  slideImageStyle: { resizeMode: 'cover' },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 60,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  textContainer: { marginBottom: 30 },
  title: {
    fontSize: 32,
    fontFamily: 'LeagueSpartan_700Bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'left',
  },
  description: {
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
    color: '#fff',
    lineHeight: 24,
    textAlign: 'left',
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 20,
  },
  paginationDots: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.5)', marginHorizontal: 4 },
  activeDot: { width: 20, backgroundColor: '#fff' },
  nextButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#A68B69',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
