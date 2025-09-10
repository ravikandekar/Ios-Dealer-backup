import React, { useRef, useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Image, Dimensions } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const screenWidth = Dimensions.get('window').width;

const CarScrollComponent = ({ images = [], autoScroll = true }) => {
  const scrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoScroll || images.length === 0) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % images.length;
      scrollRef.current?.scrollTo({
        x: nextIndex * (screenWidth * 0.9 + wp('2%')),
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex, images.length, autoScroll]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
      >
        {images.map((imageSource, index) => (
          <View key={index} style={styles.card}>
            <Image
              source={imageSource}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: hp('24%'),
    alignSelf: 'center',
    width: wp('95%'),
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1%'),
  },
  card: {
    width: wp('92%'),
    height: hp('21%'),
    backgroundColor: '#EAEAEA',
    borderRadius: wp('3%'),
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default CarScrollComponent;
