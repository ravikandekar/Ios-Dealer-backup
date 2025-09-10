import React, { useEffect, useState } from 'react';
import {
  View,
  Modal,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import Geocoder from 'react-native-geocoding';
import { GOOGLE_MAP_APIKEY } from '../constants/GoogleMapKeyStore';
import AppText from './AppText';

Geocoder.init(GOOGLE_MAP_APIKEY);

const DEFAULT_COORDS = {
  latitude: 20.5937,
  longitude: 78.9629,
};

const LocationPicker = ({
  visible,
  onClose,
  onLocationPicked,
  initialCoords,
}) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [pickedCoords, setPickedCoords] = useState(initialCoords || null);
  const [pickedAddress, setPickedAddress] = useState('');
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (visible) {
      if (initialCoords) {
        setPickedCoords(initialCoords);
        handleCoordinateChange(initialCoords);
      } else {
        Geolocation.getCurrentPosition(
          position => {
            const coords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            setCurrentLocation(coords);
            setPickedCoords(coords);
            handleCoordinateChange(coords);
          },
          error => console.warn(error.message),
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      }
    }
  }, [visible]);

  const handleCoordinateChange = async coordinate => {
    if (!coordinate) return;
    setPickedCoords(coordinate);
    try {
      const res = await Geocoder.from(coordinate.latitude, coordinate.longitude);
      if (res.results.length > 0) {
        setPickedAddress(res.results[0].formatted_address);
      } else {
        setPickedAddress('Address not found');
      }
    } catch (e) {
      console.warn('Geocoding failed:', e);
      setPickedAddress('Error fetching address');
    }
  };

  const handleSave = () => {
    if (!pickedCoords || !pickedAddress) {
      alert('Please select a valid location on the map.');
      return;
    }
    onLocationPicked?.({ coordinate: pickedCoords, address: pickedAddress });
    onClose();
  };

  const mapRegion = {
    latitude: pickedCoords?.latitude || currentLocation?.latitude || DEFAULT_COORDS.latitude,
    longitude: pickedCoords?.longitude || currentLocation?.longitude || DEFAULT_COORDS.longitude,
    latitudeDelta: 0.001,
    longitudeDelta: 0.001,
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        {!isMapReady && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <AppText style={styles.loaderText}>Loading Map...</AppText>
          </View>
        )}

        <MapView
          style={styles.map}
          region={mapRegion}
          mapType="hybrid"
          onPress={e => handleCoordinateChange(e.nativeEvent.coordinate)}
          onMapReady={() => setIsMapReady(true)}
        >
          {pickedCoords && (
            <Marker
              coordinate={pickedCoords}
              draggable
              pinColor="red"
              title="Selected Location"
              onDragEnd={e =>
                handleCoordinateChange(e.nativeEvent.coordinate)
              }
            />
          )}

          {!initialCoords && currentLocation && (
            <Marker
              coordinate={currentLocation}
              pinColor="blue"
              title="Current Location"
            />
          )}
        </MapView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#999' }]}
            onPress={onClose}
          >
            <AppText style={styles.buttonText}>Cancel</AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#007AFF' }]}
            onPress={handleSave}
          >
            <AppText style={styles.buttonText}>Save Location</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    zIndex: 1,
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default LocationPicker;