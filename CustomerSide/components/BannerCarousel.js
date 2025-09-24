import React, { useState } from 'react';
import {
  View,
  FlatList,
  ImageBackground,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

// Helper that guarantees a valid Image source or returns null
const safeImageSource = (src, placeholder) => {
  if (typeof src === 'number') return src;
  if (src && typeof src === 'object' && typeof src.uri === 'string' && src.uri.trim() !== '') {
    return src;
  }
  if (typeof src === 'string' && src.trim() !== '') {
    return { uri: src.trim() };
  }
  return placeholder;
};

const BannerCarousel = ({ 
  banners, 
  placeholder = require('../assets/placeholder.png'),
  onCustomizePress 
}) => {
  const [activeBanner, setActiveBanner] = useState(0);

  // Filter only active banners
  const activeBanners = banners.filter(banner => banner.active !== false);

  const renderBannerItem = ({ item }) => {
    const bannerSrc = safeImageSource(item?.imageUrl, placeholder);
    
    return (
      <ImageBackground
        source={bannerSrc}
        style={styles.banner}
        imageStyle={styles.bannerImageStyle}
        resizeMode="cover"
      >
        <View style={styles.bannerContent}>
          {/* Use actual banner data from Firestore */}
          <Text style={styles.bannerText}>{item.title || "Design Your Perfect"}</Text>
          <Text style={[styles.bannerText, { color: '#fff' }]}>
            {item.subtitle || "Mirror Today"}
          </Text>
          <Text style={[styles.bannerSubtext, { color: '#fff' }]}>
            {item.description || "Crafted Just for You!"}
          </Text>
          <TouchableOpacity 
            style={styles.customizeButton}
            onPress={() => onCustomizePress(item)}
          >
            <Text style={styles.customizeButtonText}>
              {item.buttonText || "Customize Now"}
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  };

  // Don't show carousel if no active banners
  if (activeBanners.length === 0) {
    return (
      <View style={styles.placeholderContainer}>
        <Text style={styles.placeholderText}>No active banners</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={activeBanners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScroll={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x /
            event.nativeEvent.layoutMeasurement.width
          );
          setActiveBanner(index);
        }}
        style={styles.bannerList}
        renderItem={renderBannerItem}
      />
      
      {/* Banner Dots Indicator */}
      {activeBanners.length > 1 && (
        <View style={styles.bannerDotsContainer}>
          {activeBanners.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, activeBanner === index && styles.activeDot]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  bannerList: {
    paddingHorizontal: 20,
  },
  banner: {
    width: width - 40, // Account for padding
    height: 150,
    marginRight: 15,
    borderRadius: 15,
    overflow: 'hidden',
    justifyContent: 'center',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  bannerImageStyle: {
    borderRadius: 15,
  },
  bannerContent: { 
    width: '60%', 
    padding: 10 
  },
  bannerText: { 
    fontFamily: 'LeagueSpartan_700Bold', 
    fontSize: 18, 
    color: '#000' 
  },
  bannerSubtext: { 
    fontFamily: 'Montserrat_400Regular', 
    fontSize: 12, 
    marginTop: 5, 
    color: '#000' 
  },
  customizeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  customizeButtonText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 12,
    color: '#A68B69',
  },
  bannerDotsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: 10 
  },
  dot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: '#D9D9D9', 
    marginHorizontal: 4 
  },
  activeDot: { 
    backgroundColor: '#A68B69' 
  },
  placeholderContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    marginTop: 20,
  },
  placeholderText: {
    fontFamily: 'Montserrat_400Regular',
    color: '#999',
    fontSize: 14,
  },
});

export default BannerCarousel;