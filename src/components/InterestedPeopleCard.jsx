import React, { useContext } from 'react';
import { View,  StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AuthContext } from '../context/AuthContext';
import AppText from './AppText';
const InterestedPeopleCard = ({ count = 33, onPress }) => {
    const { theme } = useContext(AuthContext);

    return (
        <TouchableOpacity onPress={onPress} style={{ flex: 1 }}>
            <LinearGradient
                colors={['#E6F1FF', '#C8E2FF']}
                start={{ x: 1, y: 1 }}
                end={{ x: 0, y: 1 }}
                style={[styles.container, { borderColor: theme.colors.border }]}
            >
                <View style={styles.contentWrapper}>
                    {/* Left Section */}
                    <View style={styles.left}>
                        <AppText style={styles.leftTextTop}>Interested buyers</AppText>
                        <AppText style={styles.leftTextBottom}>spotted →</AppText>
                    </View>

                    {/* Right Section */}
                    <View style={styles.right}>
                        <AppText style={[styles.count, { color: theme.colors.text }]}>{count}</AppText>
                        <View style={styles.iconRow}>
                            <Icon name="account-group" size={hp('3%')} color={theme.colors.text} />
                            <AppText style={[styles.label, { color: theme.colors.text }]}>Leads</AppText>
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

export default InterestedPeopleCard;

const styles = StyleSheet.create({
    container: {
        borderRadius: wp('2.5%'),
        // borderWidth: 0.5,

        // iOS Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,

        // Android
        elevation: 4,
        flex: 1,
        width: '100%',
        marginBottom: hp('2%'),
    },
    contentWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: hp('1.6%'),
        paddingHorizontal: wp('4%'),
    },
    left: {
        flex: 1,
    },
    leftTextTop: {
        fontSize: hp('2.5%'),
        fontWeight: '500',
        color: '#055597',
       
        marginBottom: hp('0.3%'),
    },
    leftTextBottom: {
        fontSize: hp('2.3%'),
        fontWeight: '500',
        color: '#055597',
       
    },
    right: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    count: {
        fontSize: hp('2.6%'),
        fontWeight: '600',
       
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: hp('0%'),
    },
    label: {
        fontSize: hp('2%'),
        fontWeight: '500',
       
        marginLeft: wp('1%'),
    },
});
