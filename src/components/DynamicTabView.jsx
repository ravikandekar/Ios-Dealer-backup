import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import AppText from './AppText';
const DynamicTabView = ({
    tabs = [],
    activeTab,
    setActiveTab,
    theme
}) => {
    return (
        <View style={[styles.tabContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border || '#ccc' }]}>
            {tabs.map((tab, index) => (
                <React.Fragment key={tab.key}>
                    <TouchableOpacity
                        style={[
                            styles.tab,
                            activeTab === tab.key && {
                                backgroundColor: theme.colors.primary + '20', // light background
                                borderBottomColor: theme.colors.primary,
                                // borderBottomWidth: 2,
                            }
                        ]}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        <AppText
                            style={[
                                styles.tabText,
                                {
                                    color: activeTab === tab.key ? theme.colors.primary : theme.colors.text
                                }
                            ]}
                        >
                            {tab.label}
                        </AppText>
                    </TouchableOpacity>

                    {/* Add vertical divider between tabs */}
                    {index < tabs.length - 1 && (
                        <View style={[styles.tabDivider, { backgroundColor: theme.colors.text || '#ccc' }]} />
                    )}
                </React.Fragment>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        alignItems: 'center',
    },
    tab: {
        flex: 1,
        // paddingVertical: hp('1.5%'),
        alignItems: 'center',
        justifyContent: 'center',
        height:hp('6.5%')
        // borderRadius: wp('2%'),
    },
    tabText: {
        fontSize: wp('4.6%'),
        fontWeight: '500',
        textAlign:'center'
    },
    tabDivider: {
        width: 1,
        height: '100%',
        // marginHorizontal: wp('1.5%'),
    },
});

export default DynamicTabView;
