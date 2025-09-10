import React from 'react';
import Svg, { G, Path } from 'react-native-svg';
import { View, StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const WaveBackground = () => {
  const width = wp('94%');
  const height = hp('18%');

  return (
  <Svg width="100%" height="100%" viewBox="0 0 354 110" preserveAspectRatio="none">
    <G transform="translate(0, 71)">
      <Path
        d="M0 39H354V0.623604C354 0.623604 275.052 -5.76778 187.395 22.3726C99.7381 50.5129 0 13.233 0 13.233V39Z"
        fill="#BEDFFF"
      />
    </G>
    <G transform="translate(148, 0)">
      <Path
        d="M0 110H206V0C206 0 174.286 2.51908 133.872 54.0204C93.4578 105.522 0 110 0 110Z"
        fill="#8DC8FF"
      />
    </G>
  </Svg>
);


};

const styles = StyleSheet.create({
  svgWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: -1,
  },
});

export default WaveBackground;
