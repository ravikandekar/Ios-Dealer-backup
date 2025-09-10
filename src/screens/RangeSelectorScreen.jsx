
import React, { useState, useContext, useEffect } from 'react';
import {
    View,
    TextInput,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import AppText from '../components/AppText';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { AuthContext } from '../context/AuthContext';
import BackgroundWrapper from '../components/BackgroundWrapper';
import ActionButton from '../components/ActionButton';
import { DetailsHeader } from '../components/DetailsHeader';
import { useFormStore } from '../store/formStore';
import apiClient from '../utils/apiClient';
import { showToast } from '../utils/toastService';
import { color } from 'react-native-elements/dist/helpers';

// slider constants
const SLIDER_HEIGHT = hp('40%');
const SLIDER_STEP = 1000;

const BUTTON_COLORS = {
    PRIMARY: '#0D47A1',
};

const RangeSelectorScreen = ({ navigation }) => {
    const { theme, selectedCategory } = useContext(AuthContext);
    const { formData, updateForm } = useFormStore();

    const [price, setPrice] = useState(formData.price || '');
    const [kmsDriven, setKmsDriven] = useState(Number(formData.kmsDriven) || 100);
    const [maxKm, setMaxKm] = useState(800000);
    const [loading, setLoading] = useState(true);

    const isBike = selectedCategory?.toLowerCase() === 'bike';

    // fetch maximum KM from API
    const fetchMaxKilometer = async () => {
        setLoading(true);
        try {
            const endpoint = isBike
                ? '/api/product/bikekilometerRoute/getdata-by-buyer-dealer?page=1&limit=10'
                : '/api/product/carkilometerRoute/getdata-by-buyer-dealer?page=1&limit=10';

            const res = await apiClient.get(endpoint);

            if (res.data?.success && res.data?.data?.kilometers?.length > 0) {
                const sortedKms = res.data.data.kilometers
                    .map((k) => parseInt(k.kilometer))
                    .filter((k) => !isNaN(k))
                    .sort((a, b) => b - a);

                if (sortedKms.length > 0) {
                    const km = sortedKms[0];
                    setMaxKm(km);
                    if (kmsDriven > km) setKmsDriven(km);
                }
            }
        } catch (err) {
            console.log('KM fetch error:', err.message);
            showToast('error', '', 'Failed to fetch max kilometers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMaxKilometer();
    }, []);

    // handle next button
    const handleNext = () => {
        if (!price || price.trim() === '') {
            showToast('error', '', 'Please enter the price');
            return;
        }

        if (!kmsDriven) {
            showToast('error', '', 'Please select kilometers driven.');
            return;
        }

        updateForm('price', price);
        updateForm('kmsDriven', kmsDriven);
        navigation.navigate('CarPhotoUploadScreen');
    };

    if (loading) {
        return (
            <BackgroundWrapper>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            </BackgroundWrapper>
        );
    }
    const CustomMarker = ({ currentValue }) => (
        <View style={styles.markerContainer}>
            <View style={styles.handleCircle} />
            <View style={styles.bubbleContainer}>
                <View style={styles.pointer} />
                <View style={styles.bubblePill}>
                    <AppText style={styles.bubbleText}>{formatPriceFull(currentValue)}</AppText>
                </View>
            </View>
        </View>
    );
    return (
        <BackgroundWrapper>
            <DetailsHeader title="Car Details" stepText="5/6" rightType="steps" />
            <View
                contentContainerStyle={{ padding: hp('1%') }}
                showsVerticalScrollIndicator={false}
            >
                {/* Price Input */}
                <View style={styles.priceSection}>
                    <AppText
                        style={[styles.sectionHeader, { color: theme.colors.text }]}
                    >
                        Set Price of {isBike ? 'Bike' : 'Car'}
                    </AppText>
                    <AppText
                        style={[styles.priceLabel, { color: theme.colors.text }]}
                    >
                        Enter Price:
                    </AppText>
                    <TextInput
                        style={[
                            styles.inputBox,
                            {
                                borderColor: theme.colors.border,
                                color: theme.colors.text,
                                backgroundColor: theme.colors.inputBackground,
                            },
                        ]}
                        placeholder={`₹ Enter ${isBike ? 'bike' : 'car'} price`}
                        placeholderTextColor={theme.colors.placeholder}
                        keyboardType="number-pad"
                        returnKeyType="done"
                        value={price}
                        onChangeText={(text) => {
                            // allow only numbers
                            const numericValue = text.replace(/[^0-9]/g, '');

                            // limit max 100 crore (1,00,00,00,000)
                            if (numericValue === '' || parseInt(numericValue, 10) <= 1000000000) {
                                setPrice(numericValue);
                            }
                        }}
                    />
                </View>

                {/* KM Driven Slider */}
                <View style={styles.priceSection}>
                    <AppText
                        style={[styles.sectionHeader, { color: theme.colors.text }]}
                    >
                        Select kilometers driven by {isBike ? 'Bike' : 'Car'}
                    </AppText>

                    <View style={styles.sliderWrapper}>
                        {/* Top Label */}

                        <AppText style={[styles.kmLabel, { color: theme.colors.text }]}>
                            {maxKm.toLocaleString('en-IN')} km
                        </AppText>

                        <View style={styles.sliderColumn}>
                            {/* Dashes Overlay */}
                            <View style={styles.dashContainer}>
                                <View style={styles.dashTrack}>
                                    {Array.from({ length: 15 }).map((_, index) => (
                                        <View
                                            key={index}
                                            style={[
                                                styles.dash,
                                                { backgroundColor: theme.colors.border }
                                            ]}
                                        />
                                    ))}
                                </View>
                            </View>

                            {/* Slider */}
                            <View >
                                <MultiSlider
                                    values={[kmsDriven]}
                                    min={0}
                                    max={maxKm}
                                    step={SLIDER_STEP}
                                    sliderLength={SLIDER_HEIGHT}
                                    vertical
                                    onValuesChange={(values) => setKmsDriven(values[0])}
                                    selectedStyle={{
                                        backgroundColor: theme.colors.Highlighterwords,
                                        borderWidth: 1.5,
                                        borderColor: theme.colors.Highlighterwords,
                                    }}
                                    unselectedStyle={{
                                        backgroundColor: theme.colors.border,
                                        borderWidth: 1.5,
                                        borderColor: theme.colors.border,
                                    }}
                                    customMarker={() => (
                                        <View style={styles.markerContainer}>
                                            <View
                                                style={[
                                                    styles.handleCircle,
                                                    { borderColor: theme.colors.Highlighterwords },
                                                ]}
                                            />
                                            <View style={styles.bubbleContainer}>
                                                <View
                                                    style={[
                                                        styles.pointer,
                                                        { borderRightColor: theme.colors.primary },
                                                    ]}
                                                />
                                                <View
                                                    style={[
                                                        styles.bubblePill,
                                                        { backgroundColor: theme.colors.primary },
                                                    ]}
                                                >
                                                    <AppText style={styles.bubbleText}>
                                                        {kmsDriven.toLocaleString('en-IN')}
                                                    </AppText>
                                                </View>
                                            </View>
                                        </View>
                                    )}
                                />
                            </View>
                        </View>


                        {/* Bottom Label */}
                        <AppText style={[styles.kmLabel, { color: theme.colors.text }]}>
                            0 km
                        </AppText>
                    </View>
                </View>


                {/* Next Button */}
                <View style={styles.buttonContainer}>
                    <ActionButton label="Next" onPress={handleNext} style={{ backgroundColor: theme.colors.Highlighterwords }} />
                </View>
            </View>
        </BackgroundWrapper>
    );
};

const styles = StyleSheet.create({
    priceSection: { marginBottom: hp('4%') },
    sectionHeader: { fontSize: wp('5%'), fontWeight: '600', marginBottom: hp('1%') },
    priceLabel: { fontSize: wp('4%'), marginVertical: hp('1%'), fontWeight: '500' },
    inputBox: {
        borderWidth: 1,
        borderRadius: wp('2%'),
        paddingHorizontal: wp('4%'),
        paddingVertical: hp('1.8%'),
        fontSize: wp('4.5%'),
    },
    sliderColumn: {
        width: wp('14%'),
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        flexDirection: 'row',
    },

    buttonContainer: {
        paddingHorizontal: wp('4%'),
        alignItems: 'flex-end',
        marginTop: hp('2%'),
    },
    sliderWrapper: {
        alignItems: 'center',
        justifyContent: 'space-between',
        height: SLIDER_HEIGHT + hp('10%'),
        alignSelf: 'center',
    },
    kmLabel: {
        fontSize: wp('5%'),
        fontWeight: '500',
        marginVertical: hp('0.5%'),
        opacity: 0.5
    },
    dashTrack: {
        height: SLIDER_HEIGHT,
        justifyContent: 'space-between',

    },

    dash: {
        width: 12,
        height: 2,
        borderRadius: 1,
    },
    markerContainer: { justifyContent: 'center', alignItems: 'center' },
    handleCircle: {
        width: wp('4%'),
        height: wp('4%'),
        borderRadius: wp('2.5%'),
        backgroundColor: 'white',
        borderWidth: 2,
        zIndex: 2,
        // marginRight: wp('5%'),
        // alignItems: 'center',
    },
    bubbleContainer: {
        position: 'absolute', flexDirection: 'row', alignItems: 'center', top: wp('11'),
        transform: [{ rotate: '90deg' }],
    },
    pointer: {
        width: 0, height: 0, borderTopWidth: 6, borderBottomWidth: 6, borderRightWidth: 8,
        borderTopColor: 'transparent', borderBottomColor: 'transparent', borderRightColor: '#1561A8',
    },
    bubblePill: {
        minWidth: wp('20%'), paddingVertical: 6, backgroundColor: '#1561A8', borderRadius: 4,
        alignItems: 'center', justifyContent: 'center',
    },
    bubbleText: { color: 'white', fontSize: hp('1.5%'), fontWeight: '700' },
    dashContainer: {
        position: 'absolute',
        height: SLIDER_HEIGHT,
        justifyContent: 'space-between',
        alignItems: 'center',
        left: wp('1%'), // adjust horizontal position of dashes
    },


});

export default RangeSelectorScreen;
