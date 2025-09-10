// // components/Icon.js
// import React from 'react';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
// import Feather from 'react-native-vector-icons/Feather'
// import AntDesign from 'react-native-vector-icons/AntDesign';
// import { Car, Home, Heart } from 'lucide-react-native';

// const Icon = ({ type, name, size = 24, color = 'black', style }) => {
//   if (type === 'materialCI') {
//     return <MaterialCommunityIcons name={name} size={size} color={color} style={style}/>;
//   }

//   if (type === 'material') {
//     return <MaterialIcons name={name} size={size} color={color} />;
//   }

//   if (type === 'feather') {
//     return <Feather name={name} size={size} color={color} />;
//   }

//   if (type === 'antdesign') {
//     return <AntDesign name={name} size={size} color={color} />;
//   }

//   if (type === 'lucide') {
//     const LucideIcons = {
//       car: Car,
//       home: Home,
//       heart: Heart,
//     };

//     const LucideIcon = LucideIcons[name];
//     return LucideIcon ? <LucideIcon size={size} color={color} /> : null;
//   }

//   return null;
// };

// export default Icon;

// components/Icon.js
import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { Car, Home, Heart } from 'lucide-react-native';

const CustomIcon = ({
  type,
  iconType,
  name,
  iconName,
  size = 24,
  color = 'black',
  style,
}) => {
  const resolvedType = type || iconType;
  const resolvedName = name || iconName;

  if (resolvedType === 'materialCI') {
    return (
      <MaterialCommunityIcons
        name={resolvedName}
        size={size}
        color={color}
        style={style}
      />
    );
  }

  if (resolvedType === 'fontA5') {
    return (
      <FontAwesome5
        name={resolvedName}
        size={size}
        color={color}
        style={style}
      />
    );
  }

  if (resolvedType === 'material') {
    return (
      <MaterialIcons
        name={resolvedName}
        size={size}
        color={color}
        style={style}
      />
    );
  }

  if (resolvedType === 'feather') {
    return (
      <Feather
        name={resolvedName}
        size={size}
        color={color}
        style={style}
      />
    );
  }

  if (resolvedType === 'antdesign') {
    return (
      <AntDesign
        name={resolvedName}
        size={size}
        color={color}
        style={style}
      />
    );
  }

  if (resolvedType === 'lucide') {
    const LucideIcons = {
      car: Car,
      home: Home,
      heart: Heart,
    };
    const LucideIcon = LucideIcons[resolvedName?.toLowerCase()];
    return LucideIcon ? (
      <LucideIcon size={size} color={color} style={style} />
    ) : null;
  }

  return null;
};

export default CustomIcon;
