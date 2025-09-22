// components/VehiclePreviewCard.js
import React, { useContext } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import ImageSlider from './ImageSlider';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AuthContext } from '../context/AuthContext';
import InterestedPeopleCard from './InterestedPeopleCard';
import AppText from './AppText';
const VehiclePreviewCard = ({ images, title, subtitle, price, specs, interested, description = null, onPressEdit, isSold = false, isPadding = false }) => {
    const { theme } = useContext(AuthContext);
    console.log('isSold', isSold);

    return (
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <ImageSlider
                images={images}
                theme={theme}
                height={hp('20%')}
                // width={wp('94%')} // Custom image styling
                isPadding={true}
            />

            <View style={{ padding: wp('2%') }}>
                <AppText style={[styles.title, { color: theme.colors.text }]}>{title}</AppText>
                <AppText style={[styles.subtitle, { color: theme.colors.placeholder }]}>{subtitle}</AppText>
                <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                    <AppText style={[styles.price, { color: theme.colors.text }]}>₹{price}</AppText>
                    {/* {isSold === false && (
                        <TouchableOpacity onPress={onPressEdit} style={styles.iconButton}>
                        <FontAwesome5 name="edit" size={24} color={theme.colors.placeholder} />
                    </TouchableOpacity>
                    )} */}

                </View>
                {interested && (
                    <InterestedPeopleCard
                        count={interested}
                        onPress={() => console.log('Interested buyers card pressed')}
                    />
                )
                }

                {/* Rows */}
                {specs.map((row, index) => (
                    <React.Fragment key={index}>
                        <View style={styles.row}>
                            {row.map((item, idx) => (
                                <View style={styles.cell} key={idx}>
                                    <FontAwesome5 name={item.icon} size={20} color={theme.colors.primary} style={styles.icon} />
                                    <AppText style={[styles.detail, { color: theme.colors.text }]}>{item.label}</AppText>
                                </View>
                            ))}
                        </View>
                        <View style={[styles.hrLine, { backgroundColor: theme.colors.text || theme.colors.placeholder }]} />
                    </React.Fragment>
                ))}

                {description && (
                    <View>
                        <AppText style={[styles.detail, { color: theme.colors.placeholder, marginBottom: hp('1%') }]} >
                            Description
                        </AppText>
                        <AppText style={[styles.detail, { color: theme.colors.text, textAlign: 'justify' }]} numberOfLines={8} ellipsizeMode='tail'>
                            {description}
                        </AppText>
                    </View>
                )}

            </View>
        </View>
    );
};

export default VehiclePreviewCard;

const styles = StyleSheet.create({
    card: {
        borderRadius: wp('4%'),
        padding: wp('1%'),
        marginBottom: hp('2%'),
        paddingVertical: hp('1.5%'),

        // iOS Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 6,

        // Android Shadow
        elevation: 6,
    },
    title: {
        fontSize: wp('5%'),
        fontWeight: 'bold',
        marginBottom: hp('0.5%'),

    },
    subtitle: {
        fontSize: wp('4%'),
        marginBottom: hp('1%'),

    },
    price: {
        fontSize: wp('5.5%'),
        fontWeight: '700',
        marginBottom: hp('2%'),

    },
    row: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: hp('1.5%'),
        marginBottom: hp('0.5%'),
        gap: hp('3%'),
    },
    cell: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '48%',
    },
    icon: {
        marginRight: wp('2%'),
    },
    detail: {
        fontSize: wp('4.5%'),
        fontWeight: '500',

    },
    hrLine: {
        height: 1,
        opacity: 0.3,
        marginVertical: hp('1%'),
    },
});
