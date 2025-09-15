import React, { useRef, useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import Swiper from 'react-native-swiper';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const ImageSlider = ({
  images = [],
  theme,
  height = hp('24%'),
  width = wp('100%'),
  paginationshow = true,
  watermark = true,
}) => {
  const swiperRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <View style={[styles.container, { height, width }]}>
      <Swiper
        ref={swiperRef}
        autoplay
        autoplayTimeout={3}
        showsPagination={false}
        loop
        style={{ height }}
        onIndexChanged={(index) => setActiveIndex(index)}
      >
        {images.map((item, index) => (
          <View style={styles.imageWrapper} key={index}>
            <ImageBackground
              source={typeof item === 'string' ? { uri: item } : item}
              style={[styles.image, { height, width: width - wp('5%') }]}
              resizeMode="cover"
            >
              {watermark && (
                <Image
                  source={require('../../public_assets/media/images/watermark.png')}
                  style={styles.watermark}
                  resizeMode="contain"
                />
              )}
            </ImageBackground>
          </View>
        ))}
      </Swiper>

      {/* Custom Pagination */}
      {paginationshow && (
        <View style={[styles.pagination, { width }]}>
          {images.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() =>
                swiperRef.current?.scrollBy(index - activeIndex, true)
              }
            >
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      activeIndex === index
                        ? theme?.colors?.primary || '#f7941d'
                        : 'rgba(255,255,255,0.5)',
                    borderColor: theme?.colors?.primary,
                  },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default ImageSlider;

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    marginBottom: hp('1.5%'),
    justifyContent: 'center',
    position: 'relative',
  },
  imageWrapper: {
    marginHorizontal: wp('4%'),
    borderRadius: wp('3%'),
    overflow: 'hidden',
    backgroundColor: '#f9f5f5ff',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  image: {
    borderRadius: wp('3%'),
    overflow: 'hidden',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: -hp('2%'),
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
    borderWidth: 1,
  },
  watermark: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: wp('20%'),
    height: hp('5%'),
    opacity: 0.5,
  },
});
