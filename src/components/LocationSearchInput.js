import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import axios from 'axios';
import { GOOGLE_MAP_APIKEY } from '../constants/GoogleMapKeyStore';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { AuthContext } from '../context/AuthContext';
import Icon from "react-native-vector-icons/MaterialIcons";
const LocationSearchInput = ({ onLocationSelected }) => {
  const { theme } = useContext(AuthContext);
  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(false);
  const abortRef = useRef(null);

  const fetchPlaces = async (inputText) => {
    if (!inputText || selected) return;

    setLoading(true);
    try {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      const res = await axios.get(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json`,
        {
          params: {
            input: inputText,
            key: GOOGLE_MAP_APIKEY,
            language: 'en',
            components: 'country:in',
          },
          signal: abortRef.current.signal,
        }
      );

      setPlaces(res.data.predictions);
    } catch (error) {
      if (error.code !== 'ERR_CANCELED') {
        console.error('Places API error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaceDetails = async (placeId, description) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json`,
        {
          params: {
            place_id: placeId,
            key: GOOGLE_MAP_APIKEY,
            language: 'en',
          },
        }
      );

      const location = res.data.result.geometry.location;
      const address = res.data.result.formatted_address;

      onLocationSelected({
        coordinate: { latitude: location.lat, longitude: location.lng },
        address,
      });

      setQuery(description);
      setPlaces([]);
      setSelected(true);
      Keyboard.dismiss();
    } catch (error) {
      console.error('Details API error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (!selected && query.trim()) {
        fetchPlaces(query);
      } else {
        setPlaces([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const clearInput = () => {
    setQuery('');
    setSelected(false);
    setPlaces([]);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.inputWrapper}>
          {/* Left icon */}
          <Icon
            name="location-on"
            size={22}
            color={theme.colors.placeholder}
            style={styles.leftIcon}
          />

          <TextInput
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              setSelected(false);
            }}
            placeholder="Full address for location verification"
            placeholderTextColor={theme.colors.placeholder}
            style={[
              styles.textInput,
              {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.inputBackground,
                color: theme.colors.text,
                paddingLeft: wp('10%'), // ⬅️ extra padding so text doesn’t overlap icon
              },
            ]}
          />

          {selected && query.length > 0 && (
            <TouchableOpacity onPress={clearInput} style={styles.clearButton}>
              <Text style={{ color: theme.colors.primary, fontSize: hp('2.5%') }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading && (
          <ActivityIndicator
            size="small"
            color={theme.colors.primary}
            style={{ marginTop: hp('1%') }}
          />
        )}

        {!loading && places.length > 0 && !selected && (
          <View
            style={[
              styles.dropdownWrapper,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <FlatList
              data={places}
              keyExtractor={(item) => item.place_id}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: hp('1%') }}
              style={{ maxHeight: hp('45%') }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() =>
                    fetchPlaceDetails(item.place_id, item.description)
                  }
                >
                  <Text style={{ color: theme.colors.text, fontSize: hp('1.8%') }}>
                    {item.description}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: wp('90%'),
    alignSelf: 'center',
    marginBottom: hp('2%'),
    zIndex: 100,
  },
  container: {
    position: 'relative',
  },
  inputWrapper: {
    position: 'relative',
  },
  textInput: {
    height: hp('5.4%'),
    borderRadius: wp('2%'),
    borderWidth: 1,
    paddingHorizontal: wp('3%'),
    paddingRight: wp('10%'),
    fontSize: hp('2%'),
  },
  clearButton: {
    position: 'absolute',
    right: wp('3%'),
    top: hp('1.2%'),
    zIndex: 10,
  },
  dropdownWrapper: {
    position: 'absolute',
    top: hp('6%'),
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: wp('2%'),
    zIndex: 99,
  },
  item: {
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('3%'),
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  leftIcon: {
    position: "absolute",
    left: wp("3%"),
    top: hp("1.4%"),
    zIndex: 10,
  },
});

export default LocationSearchInput;
