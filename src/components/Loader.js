import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Image,
  Animated,
  ActivityIndicator,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import AppText from "./AppText";
import { AuthContext } from "../context/AuthContext";

const loaderFrames = [
  require("../../public_assets/media/images/l1.png"),
  require("../../public_assets/media/images/l2.png"),
  require("../../public_assets/media/images/l3.png"),
  // add more frames if available
];

const Loader = ({ visible, message = "Loading..." }) => {
  const [frameIndex, setFrameIndex] = useState(0);
  const intervalRef = useRef(null);
  const { theme } = useContext(AuthContext);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Frame animation
      intervalRef.current = setInterval(() => {
        setFrameIndex((prevIndex) => (prevIndex + 1) % loaderFrames.length);
      }, 120);

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      clearInterval(intervalRef.current);
      setFrameIndex(0);
      pulseAnim.setValue(1);
    }

    return () => {
      clearInterval(intervalRef.current);
      pulseAnim.stopAnimation();
    };
  }, [visible]);

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
         
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          {/* <Image
            source={loaderFrames[frameIndex]}
            style={styles.image}
            resizeMode="contain"
          /> */}
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <AppText style={[styles.message, { color: '#ffff' }]}>
            {message}
          </AppText>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(12, 12, 13, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    padding: hp("3%"),
    borderRadius: wp("5%"),
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  image: {
    width: wp("28%"),
    height: wp("28%"),
    marginBottom: hp("2%"),
  },
  message: {
    fontSize: wp("5%"),
    textAlign: "center",
    fontWeight: "600",
    marginTop: hp("1%"),
  },
});

export default Loader;




// import React, { useEffect, useRef } from 'react';
// import {
//   View,
//   StyleSheet,
//   Modal,
//   Animated,
//   Image,
// } from 'react-native';
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp
// } from 'react-native-responsive-screen';
// import AppText from './AppText';

// const Loader = ({ visible, message = 'Loading...' }) => {
//   const rotateAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     if (visible) {
//       Animated.loop(
//         Animated.timing(rotateAnim, {
//           toValue: 1,
//           duration: 1200,
//           useNativeDriver: true,
//         })
//       ).start();
//     } else {
//       rotateAnim.stopAnimation(); // stops animation if not visible
//     }
//   }, [visible]);

//   const rotateInterpolate = rotateAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: ['0deg', '360deg'],
//   });

//   return (
//     <Modal transparent animationType="fade" visible={visible}>
//       <View style={styles.overlay}>
//         <Animated.Image
//           source={require('../../public_assets/media/images/tyre.png')}
//           style={[
//             styles.image,
//             { transform: [{ rotate: rotateInterpolate }] }
//           ]}
//           resizeMode="contain"
//         />
//         <AppText style={styles.message}>{message}</AppText>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(62, 59, 59, 0.5)', // light transparent background
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   image: {
//     width: wp('50%'),
//     height: wp('50%'),
//     marginBottom: hp('2%'),
//   },
//   message: {
//     fontSize: wp('5.5%'),
//     color: '#000',
//     textAlign: 'center',
//     fontWeight: '500',
//   },
// });

// export default Loader;
