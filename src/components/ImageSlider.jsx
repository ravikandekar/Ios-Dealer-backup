


// import React, { useEffect, useRef, useState } from 'react';
// import {
//   View,
//   FlatList,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions
// } from 'react-native';
// import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

// const { width: SCREEN_WIDTH } = Dimensions.get('window');

// const ImageSlider = ({ images = [], theme }) => {
//   const flatListRef = useRef(null);
//   const [currentIndex, setCurrentIndex] = useState(0);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       const nextIndex = (currentIndex + 1) % images.length;
//       flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
//       setCurrentIndex(nextIndex);
//     }, 3000);

//     return () => clearInterval(interval);
//   }, [currentIndex, images.length]);

//   const onScrollEnd = (e) => {
//     const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
//     setCurrentIndex(index);
//   };

//   return (
//     <View style={styles.container}>
//       <FlatList
//         ref={flatListRef}
//         data={images}
//         keyExtractor={(_, index) => index.toString()}
//         horizontal
//         pagingEnabled
//         showsHorizontalScrollIndicator={false}
//         onMomentumScrollEnd={onScrollEnd}
//         renderItem={({ item }) => (
//           <View style={styles.imageWrapper}>
//             <Image
//               source={typeof item === 'string' ? { uri: item } : item}
//               style={styles.image}
//               resizeMode="cover"
//             />
//           </View>
//         )}
//       />

//       {/* Pagination Dots */}
//       <View style={styles.pagination}>
//         {images.map((_, index) => (
//           <TouchableOpacity
//             key={index}
//             onPress={() => {
//               flatListRef.current?.scrollToIndex({ index, animated: true });
//               setCurrentIndex(index);
//             }}
//           >
//             <View
//               style={[
//                 styles.dot,
//                 {
//                   backgroundColor:
//                     currentIndex === index
//                       ? theme?.colors?.primary || '#f7941d'
//                       : 'rgba(255,255,255,0.5)',
//                 },
//               ]}
//             />
//           </TouchableOpacity>
//         ))}
//       </View>
//     </View>
//   );
// };

// export default ImageSlider;

// const styles = StyleSheet.create({
//   container: {
//     width: SCREEN_WIDTH,
//     height: hp('24%'),
//     alignSelf: 'center',
//     marginBottom: hp('1.5%'),
//     paddingHorizontal: wp('0%'),
//     justifyContent: 'center',
//     position: 'relative',
//   },
//   imageWrapper: {
//     width: SCREEN_WIDTH - wp('5%'),
//     marginHorizontal: wp('2%'),
//     height: '100%',
//     borderRadius: wp('3%'),
//     overflow: 'hidden',
//     backgroundColor: '#f0f0f0',
//     alignSelf: 'center',
//     justifyContent: 'center',
//   },
//   image: {
//     width: '100%',
//     height: '100%',
//     borderRadius: wp('3%'),
//   },
//   pagination: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     position: 'absolute',
//     bottom: hp('1.5%'),
//     width: '100%',
//   },
//   dot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     marginHorizontal: 4,
//     borderWidth: 1,
//     borderColor: '#fff',
//   },
// });
import React, { useRef, useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Swiper from 'react-native-swiper';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const ImageSlider = ({ images = [], theme, height = hp('24%'), width = wp('100%') ,paginationshow=true}) => {
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
        onIndexChanged={(index) => setActiveIndex(index)} // track index here
      >
        {images.map((item, index) => (
          <View style={styles.imageWrapper} key={index}>
            <Image
              source={typeof item === 'string' ? { uri: item } : item}
              style={[styles.image, { height, width: width - wp('5%') }]}
              resizeMode="cover"
            />
          </View>
        ))}
      </Swiper>

      {/* Custom Pagination */}
      {paginationshow && (
        <View style={[styles.pagination, { width }]}>
          {images.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => swiperRef.current?.scrollBy(index - activeIndex, true)}
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
});
