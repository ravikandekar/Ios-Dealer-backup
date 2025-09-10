import React, { useContext, useRef, useState, useEffect } from 'react';
import {
    View,
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AuthContext } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AppText from '../components/AppText';
import apiClient from '../utils/apiClient';
import { showToast } from '../utils/toastService';
import { DetailsHeader } from '../components/DetailsHeader';

const { width } = Dimensions.get('window');

const TutorialScreen = ({ navigation }) => {
    const flatListRef = useRef();
    const dotListRef = useRef();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const { theme } = useContext(AuthContext);
    const [tutorials, setTutorials] = useState([]);

    useEffect(() => {
        const fetchTutorials = async () => {
            setIsLoading(true);
            try {
                const response = await apiClient.get('/api/admin/dealer_tutorialRoute/getdata-by-buyer-dealer');
                const apiTutorials = response?.data?.data?.tutorials || [];

                if (apiTutorials.length === 0) {
                    showToast('info', '', 'No tutorials found.');
                }

                const formatted = apiTutorials.map((item, index) => ({
                    id: item._id || index.toString(),
                    image: { uri: item.isFullImage ? item.full_image : item.thumbnail_image },
                    isFullImage: item.isFullImage || false,
                    title: item.title || '',
                    subtitle: item.sub_title || '',
                    description: item.description || '',
                }));
                setIsLoading(false);
                setTutorials(formatted);
            } catch (error) {
                console.error('Tutorial fetch error:', error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTutorials();
    }, []);

    const handleNext = () => {
        const nextIndex = currentIndex + 1;
        if (nextIndex < tutorials.length) {
            flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
            dotListRef.current?.scrollToIndex({
                index: nextIndex,
                animated: true,
                viewPosition: 0.5,
            });
            setCurrentIndex(nextIndex);
        } else {
            navigation.reset({
                index: 0,
                routes: [{ name: 'BottomTabNavigator' }],
            });
            // Navigate to HomeScreen when done
        }
    };

    const renderItem = ({ item }) => {
        const hasDescription = item.description && item.description.trim() !== '';

        return (
            <View style={[styles.slide, { backgroundColor: theme.colors.background }]}>
                <Image
                    source={item.image}
                    style={[
                        styles.image,
                        { height: item.isFullImage ? hp('85%') : hasDescription ? hp('52%') : hp('70%') },
                    ]}
                    resizeMode="contain"
                />
                {!item.isFullImage && (
                    <View style={styles.textContainer}>
                        <AppText style={[styles.title, { color: theme.colors.primary }]}>{item.title}</AppText>
                        {hasDescription && (
                            <View>
                                <AppText style={[styles.subtitle, { color: theme.colors.placeholder }]}>{item.subtitle}</AppText>
                                <AppText style={[styles.description, { color: theme.colors.text }]}>{item.description}</AppText>
                            </View>
                        )}
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <DetailsHeader divider={false}/>
            <FlatList
                ref={flatListRef}
                data={tutorials}
                horizontal
                pagingEnabled
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                    const index = Math.round(
                        e.nativeEvent.contentOffset.x / width
                    );
                    setCurrentIndex(index);
                    dotListRef.current?.scrollToIndex({
                        index,
                        animated: true,
                        viewPosition: 0.5,
                    });
                }}
                ListEmptyComponent={() =>
                    !isLoading && (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: hp('80%') }}>
                            <AppText style={{ color: theme.colors.text, fontSize: wp('4%') }}>
                                No tutorials available.
                            </AppText>
                        </View>
                    )
                }
            />

            {/* Footer */}
            <View style={styles.absoluteFooter}>
                <View style={styles.paginationRow}>
                    <View style={{ flex: 1, marginVertical: hp('1%') }}>
                        <FlatList
                            ref={dotListRef}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={tutorials}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={{ width: wp('100%'), paddingVertical: hp('1%') }}
                            renderItem={({ index }) => (
                                <View
                                    style={[
                                        styles.dot,
                                        {
                                            backgroundColor:
                                                currentIndex === index
                                                    ? theme.colors.Highlighterwords
                                                    : theme.colors.card,
                                        },
                                    ]}
                                />
                            )}
                            style={{ width: wp('50%') }}
                        />
                    </View>

                    {currentIndex === tutorials.length - 1 ? (
                        <TouchableOpacity onPress={handleNext} style={{
                            padding: wp('2%'),
                            backgroundColor: theme.colors.primary,
                            borderRadius: wp('1%'),
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>

                            <AppText style={[styles.getStartedText, { color: '#ffff' }]}>
                                GET STARTED
                            </AppText>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            onPress={handleNext}
                            style={{
                                padding: wp('2%'),
                                backgroundColor: theme.colors.Highlighterwords,
                                borderRadius: wp('5%'),
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Icon name="arrow-forward-ios" size={wp('6')} color={'#fff'} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    slide: {
        width: wp('100%'),
        alignItems: 'center',
        justifyContent: 'center',
        padding: wp('5%'),
    },
    image: {
        width: wp('80%'),
        marginBottom: hp('3%'),
    },
    textContainer: {
        alignItems: 'flex-start',
        paddingHorizontal: wp('6%'),
    },
    title: {
        fontSize: wp('6%'),
        fontWeight: '700',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: wp('4%'),
        marginTop: hp('0.5%'),
    },
    description: {
        fontSize: wp('3.8%'),
        marginTop: hp('1%'),
        textAlign: 'justify',
        lineHeight: hp('2.3%'),
    },
    absoluteFooter: {
        position: 'absolute',
        bottom: hp('1%'),
        left: 0,
        right: 0,
        paddingHorizontal: wp('3%'),
    },
    paginationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dot: {
        width: wp('3%'),
        height: wp('3%'),
        borderRadius: wp('1.5%'),
        marginHorizontal: wp('1%'),
    },
    getStartedText: {
        fontSize: wp('4%'),
        fontWeight: '700',
    },
});

export default TutorialScreen;
