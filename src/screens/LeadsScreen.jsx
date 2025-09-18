import React, { useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Linking,
    Modal,
    SafeAreaView,
    Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AppText from '../components/AppText';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { AuthContext } from '../context/AuthContext';
import BackgroundWrapper from '../components/BackgroundWrapper';
import { DetailsHeader } from '../components/DetailsHeader';
import apiClient from '../utils/apiClient';
import { showToast } from '../utils/toastService';

const LeadsScreen = () => {
    const { theme, userID } = useContext(AuthContext);
    const [selectedInterestedIds, setSelectedInterestedIds] = useState({});
    const [leadsData, setLeadsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingIds, setLoadingIds] = useState({});

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMoreData, setHasMoreData] = useState(true);

    // Date filter states
    const [showDateSelectionModal, setShowDateSelectionModal] = useState(false);
    const [hasDateFilter, setHasDateFilter] = useState(false);
    const [datePickerVisible, setDatePickerVisible] = useState(false);
    const [datePickerType, setDatePickerType] = useState(null);
    const [tempSelectedDate, setTempSelectedDate] = useState(new Date());

    const today = new Date();
    const [fromDateString, setFromDateString] = useState(formatDate(today));
    const [toDateString, setToDateString] = useState(formatDate(today));

    const ITEMS_PER_PAGE = 12;
    const loadingMoreRef = useRef(false);

    // Date utility functions
    function formatDate(date) {
        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const y = date.getFullYear();
        return `${d}-${m}-${y}`;
    }

    const parseDisplayDate = (str) => {
        const [d, m, y] = str.split('-').map((s) => parseInt(s, 10));
        return new Date(y, m - 1, d);
    };

    const getFromDate = () => parseDisplayDate(fromDateString);
    const getToDate = () => parseDisplayDate(toDateString);

    // Date modal functions
    const openDateSelectionModal = () => setShowDateSelectionModal(true);
    const closeDateSelectionModal = () => {
        setShowDateSelectionModal(false);
        setDatePickerVisible(false);
        setDatePickerType(null);
    };

    const openPlatformPicker = (type) => {
        setDatePickerType(type);
        const initial = type === 'from' ? getFromDate() : getToDate();
        setTempSelectedDate(initial || today);
        setDatePickerVisible(true);
    };

    const onDateChange = (event, selected) => {
        if (Platform.OS === 'android') {
            setDatePickerVisible(false);
            setDatePickerType(null);
            if (selected) {
                const ds = formatDate(selected);
                if (datePickerType === 'from') setFromDateString(ds);
                else if (datePickerType === 'to') setToDateString(ds);
            }
        } else {
            if (selected) {
                // ✅ just update temp value while user scrolls
                setTempSelectedDate(selected);
            }
        }
    };



    const handleApplyDateFilter = async () => {
        const from = parseDisplayDate(fromDateString);
        const to = parseDisplayDate(toDateString);

        if (from > to) return showToast('info', '', 'From date cannot be after To date');

        setHasDateFilter(true);
        setCurrentPage(1);
        setLeadsData([]);
        setHasMoreData(true);
        loadingMoreRef.current = false;

        await fetchLeadData(false, 1, false, true);
        closeDateSelectionModal();
        showToast('success', '', 'Date filter applied successfully');
    };

    const handleClearDateFilter = async () => {
        setHasDateFilter(false);
        const t = new Date();
        setFromDateString(formatDate(t));
        setToDateString(formatDate(t));

        setCurrentPage(1);
        setLeadsData([]);
        setHasMoreData(true);
        loadingMoreRef.current = false;

        await fetchLeadData(false, 1, false, false);
        showToast('success', '', 'Date filter cleared');
        closeDateSelectionModal();
    };

    // ✅ Fetch leads with pagination and date filter
    const fetchLeadData = useCallback(
        async (isRefreshing = false, page = 1, append = false, withDateFilter = hasDateFilter) => {
            try {
                if (append && loadingMoreRef.current) return;

                if (append) {
                    loadingMoreRef.current = true;
                    setLoadingMore(true);
                } else if (!isRefreshing) {
                    setLoading(true);
                }

                const apiUrl = `/api/dealer/dealerleadRoute/getall_leads_bydelerid/${userID}`;
                const params = new URLSearchParams({
                    page: page.toString(),
                    limit: ITEMS_PER_PAGE.toString(),
                });

                // Add date filter params if enabled
                if (withDateFilter) {
                    const fromDate = getFromDate();
                    const toDate = getToDate();
                    params.append('fromDate', fromDate.toISOString().split('T')[0]);
                    params.append('toDate', toDate.toISOString().split('T')[0]);
                }

                const finalUrl = `${apiUrl}?${params.toString()}`;
                console.log('API Call:', finalUrl);

                const res = await apiClient.get(finalUrl);
                const responseData = res?.data?.data || {};
                const leads = responseData.leads || [];
                const pagination = res?.data?.pagination || {};

                setCurrentPage(pagination.currentPage || page);
                setTotalPages(pagination.totalPages || 1);
                setTotalItems(pagination.totalItems || 0);

                const hasMore = (pagination.currentPage || page) < (pagination.totalPages || 1);
                setHasMoreData(hasMore);

                if (append) {
                    setLeadsData(prevData => {
                        const combinedData = [...prevData, ...leads];
                        const newInterestMap = {};
                        leads.forEach((lead, i) => {
                            const globalIndex = prevData.length + i;
                            newInterestMap[globalIndex] = lead.interested;
                        });
                        setSelectedInterestedIds(prev => ({ ...prev, ...newInterestMap }));
                        return combinedData;
                    });
                } else {
                    setLeadsData(leads);
                    const initialInterestMap = {};
                    leads.forEach((lead, i) => {
                        initialInterestMap[i] = lead.interested;
                    });
                    setSelectedInterestedIds(initialInterestMap);
                }
            } catch (error) {
                console.error('Leads fetch error:', error);
                showToast('error', '', 'Failed to load leads. Please try again.');
                if (!append) setLeadsData([]);
            } finally {
                if (!isRefreshing && !append) setLoading(false);
                if (append) {
                    setLoadingMore(false);
                    loadingMoreRef.current = false;
                }
            }
        },
        [userID, hasDateFilter, fromDateString, toDateString],
    );

    // ✅ Refresh
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        setCurrentPage(1);
        setLeadsData([]);
        setHasMoreData(true);
        loadingMoreRef.current = false;
        await fetchLeadData(true, 1);
        setRefreshing(false);
    }, [fetchLeadData]);

    // ✅ Load more
    const loadMoreData = useCallback(() => {
        if (loadingMoreRef.current || !hasMoreData || loading || refreshing) return;
        const nextPage = currentPage + 1;
        fetchLeadData(false, nextPage, true);
    }, [hasMoreData, loading, refreshing, currentPage, fetchLeadData]);

    useEffect(() => {
        fetchLeadData(false, 1);
    }, []);

    // ✅ Call Buyer
    const handleCall = useCallback(
        async item => {
            const phoneNumber = item?.phone || '';
            if (!phoneNumber) {
                showToast('info', '', 'No phone number available');
                return;
            }

            try {
                const response = await apiClient.post('/api/dealer/deaeractivityogRoute/contact-buyer', {
                    dealerId: userID,
                    buyerId: item?.buyerId,
                });

                if (response?.data?.success) {
                    Linking.openURL(`tel:${phoneNumber}`);
                } else {
                    showToast('error', '', response.data.message || 'Failed to log contact');
                }
            } catch (error) {
                console.error('Contact log failed:', error?.message);
                showToast('error', '', error?.response?.data?.message || 'Something went wrong');
            }
        },
        [userID],
    );

    // ✅ Toggle Interest
    const handleToggleInterest = useCallback(
        async (item, index) => {
            const leadId = item?.leadId || item?._id;
            if (!leadId) return showToast('error', '', 'Invalid lead ID');

            const currentInterest = selectedInterestedIds[index] ?? item?.interested;
            const newInterest = !currentInterest;

            setLoadingIds(prev => ({ ...prev, [index]: true }));

            try {
                const response = await apiClient.patch(
                    `/api/dealer/dealerleadRoute/update-interest/${leadId}`,
                );
                if (response?.data?.success) {
                    setSelectedInterestedIds(prev => ({ ...prev, [index]: newInterest }));
                    showToast('success', '', newInterest ? 'Marked as Interested' : 'Unmarked');
                } else {
                    showToast('error', '', response?.data?.message || 'Failed to update interest');
                }
            } catch (error) {
                console.error('Interest toggle failed:', error);
                showToast('error', '', error?.response?.data?.message || 'Something went wrong');
            } finally {
                setLoadingIds(prev => ({ ...prev, [index]: false }));
            }
        },
        [selectedInterestedIds],
    );

    // ✅ Render Lead Card
    const renderItem = useCallback(
        ({ item, index }) => {
            const isInterested = selectedInterestedIds[index] ?? item?.interested;
            const isLoading = loadingIds[index];

            return (
                <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
                    <View style={styles.cardTop}>
                        <AppText style={[styles.index, { color: theme.colors.placeholder }]}>
                            {index + 1}
                        </AppText>
                        <AppText style={[styles.date, { color: theme.colors.text }]}>
                            {item?.date}
                        </AppText>
                    </View>

                    <AppText style={[styles.name, { color: theme.colors.text }]}>
                        {item?.buyerName || 'No Name'}
                    </AppText>

                    <AppText style={[styles.subText, { color: theme.colors.placeholder }]}>
                        For {item?.brandName || 'N/A'} {item?.modelName || ''}
                    </AppText>

                    <View style={styles.actionRow}>
                        <View style={styles.badges}>
                            <TouchableOpacity
                                onPress={() => handleToggleInterest(item, index)}
                                disabled={isLoading}
                                style={[
                                    styles.interestedBadge,
                                    {
                                        backgroundColor: isInterested ? '#A9FFA9' : null,
                                        borderColor: isInterested ? '#047D04' : theme.colors.themeIcon,
                                    },
                                ]}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#047D04" />
                                ) : (
                                    <>
                                        <AppText
                                            style={[
                                                styles.interestedText,
                                                { color: isInterested ? '#047D04' : theme.colors.themeIcon },
                                            ]}
                                        >
                                            {isInterested ? 'Interested' : 'Interested ?'}
                                        </AppText>
                                        <MaterialIcons
                                            name={isInterested ? 'check-circle' : 'thumb-up-off-alt'}
                                            size={wp('4.5%')}
                                            color={isInterested ? '#047D04' : theme.colors.themeIcon}
                                            style={{ transform: isInterested ? [] : [{ scaleX: -1 }] }}
                                        />
                                    </>
                                )}
                            </TouchableOpacity>

                            <View style={styles.secondaryBtn}>
                                <Icon
                                    name={
                                        {
                                            Call: 'phone',
                                            WhatsApp: 'whatsapp',
                                            Map: 'map-marker',
                                            Share: 'share-variant',
                                            Bookmark: 'bookmark',
                                        }[item?.interactionType] || 'phone'
                                    }
                                    size={wp('4.5%')}
                                    color="#333"
                                />
                                <AppText style={styles.secondaryBtnText}>
                                    {item?.interactionType || 'Call'}
                                </AppText>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.iconBtn, { borderColor: theme.colors.primary }]}
                            onPress={() => handleCall(item)}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color={theme.colors.primary} />
                            ) : (
                                <Icon name="phone" size={wp('8%')} color={theme.colors.primary} />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            );
        },
        [selectedInterestedIds, loadingIds, theme, handleCall, handleToggleInterest],
    );

    // ✅ Empty State
    const renderEmptyState = () => (
        <View style={styles.emptyStateContainer}>
            <Icon name="account-search-outline" size={hp('8%')} color={theme.colors.placeholder} />
            <AppText style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
                No Leads Found
            </AppText>
            <AppText style={[styles.emptyStateSubtitle, { color: theme.colors.placeholder }]}>
                {hasDateFilter
                    ? 'No leads found for the selected date range. Try adjusting your filter.'
                    : 'No leads available at the moment. Pull down to refresh or try again later.'
                }
            </AppText>
        </View>
    );

    // ✅ Header
    const renderHeader = () => (
        <>
            <LinearGradient
                colors={['#E6F1FF', '#C8E2FF']}
                start={{ x: 1, y: 1 }}
                end={{ x: 0, y: 1 }}
                style={[styles.containerCard, { borderColor: theme.colors.border }]}
            >
                <View style={styles.contentWrapper}>
                    <View>
                        <AppText style={styles.leftTextTop}>Connect with your</AppText>
                        <AppText style={[styles.leftTextBottom, { color: theme.colors.primary }]}>
                            Potential Buyers!
                        </AppText>
                    </View>
                    <Icon name="account-group" size={hp('7%')} color={theme.colors.primary} />
                </View>
            </LinearGradient>

            {/* Date Filter Button */}
            {hasDateFilter && (<View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[
                        styles.dateFilterBtn,
                        {
                            backgroundColor: hasDateFilter ? theme.colors.primary : theme.colors.card,
                            borderColor: theme.colors.primary
                        }
                    ]}
                    onPress={openDateSelectionModal}
                >
                    <Icon
                        name="calendar-range"
                        size={wp('5%')}
                        color={hasDateFilter ? '#fff' : theme.colors.primary}
                    />
                    <AppText style={[
                        styles.dateFilterText,
                        { color: hasDateFilter ? '#fff' : theme.colors.primary }
                    ]}>
                        {hasDateFilter ? `${fromDateString} - ${toDateString}` : 'Filter by Date'}
                    </AppText>
                    {hasDateFilter && (
                        <TouchableOpacity
                            onPress={() => handleClearDateFilter()}
                            style={styles.clearFilterBtn}
                        >
                            <Icon name="close-circle" size={wp('4%')} color="#fff" />
                        </TouchableOpacity>
                    )}
                </TouchableOpacity>
            </View>)}

        </>
    );

    // ✅ Footer Loader
    const renderFooter = () => {
        if (loadingMore) {
            return (
                <View style={styles.footerLoader}>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                    <AppText style={[styles.footerLoaderText, { color: theme.colors.placeholder }]}>
                        Loading more leads...
                    </AppText>
                </View>
            );
        }
        return <View style={{ height: hp('8%') }} />;
    };

    const keyExtractor = useCallback(
        (item, index) => `${item?.leadId || item?._id || index}-${index}`,
        [],
    );

    return (
        <BackgroundWrapper style={{ padding: wp('1%') }}>
            <DetailsHeader
                title="Leads"
                stepText={`${totalItems} leads (${leadsData.length} loaded)${hasDateFilter ? ' - Filtered' : ''}`}
                rightType="action"
                actionIcon="calendar-outline"
                onActionPress={openDateSelectionModal}
            />

            <FlatList
                data={leadsData}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmptyState}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.colors.primary}
                        colors={[theme.colors.primary]}
                    />
                }
                onEndReached={loadMoreData}
                onEndReachedThreshold={0.2}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={5}
                initialNumToRender={7}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={leadsData.length === 0 ? { flex: 1 } : {}}
            />

            {/* Date Selection Modal */}
            <Modal
                visible={showDateSelectionModal}
                transparent
                animationType="fade"
                onRequestClose={closeDateSelectionModal}
            >
                <SafeAreaView style={styles.modalOverlay}>
                    <LinearGradient
                        colors={['#00000099', '#00000099']}
                        style={styles.modalBackground}
                    >
                        <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
                            <AppText style={[styles.modalTitle, { color: theme.colors.text }]}>
                                Select Date Range
                            </AppText>

                            <View style={styles.modalRow}>
                                <TouchableOpacity
                                    style={[styles.datePickerBtn, { borderColor: theme.colors.primary }]}
                                    onPress={() => openPlatformPicker('from')}
                                >
                                    <Icon name="calendar" size={wp('4%')} color={theme.colors.primary} />
                                    <View>
                                        <AppText style={[styles.dateLabel, { color: theme.colors.placeholder }]}>
                                            From
                                        </AppText>
                                        <AppText style={[styles.dateValue, { color: theme.colors.text }]}>
                                            {fromDateString}
                                        </AppText>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.datePickerBtn, { borderColor: theme.colors.primary }]}
                                    onPress={() => openPlatformPicker('to')}
                                >
                                    <Icon name="calendar" size={wp('4%')} color={theme.colors.primary} />
                                    <View>
                                        <AppText style={[styles.dateLabel, { color: theme.colors.placeholder }]}>
                                            To
                                        </AppText>
                                        <AppText style={[styles.dateValue, { color: theme.colors.text }]}>
                                            {toDateString}
                                        </AppText>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.modalBtn, styles.clearBtn, { borderColor: theme.colors.border }]}
                                    onPress={handleClearDateFilter}
                                >
                                    <AppText style={[styles.modalBtnText, { color: theme.colors.text }]}>
                                        Clear
                                    </AppText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalBtn, styles.applyBtn, { backgroundColor: theme.colors.primary }]}
                                    onPress={handleApplyDateFilter}
                                >
                                    <AppText style={[styles.modalBtnText, { color: '#fff' }]}>
                                        Apply
                                    </AppText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </LinearGradient>

                    {datePickerVisible && (
                        <View
                            style={{
                                width: '100%', // full width
                                backgroundColor: theme.colors.card,
                                borderRadius: wp('2%'),
                                paddingHorizontal: wp('3%'),
                                marginBottom: hp('6%'),
                                alignItems: 'center'
                            }}
                        >
                            <DateTimePicker
                                value={tempSelectedDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                maximumDate={today}
                                onChange={onDateChange}
                                themeVariant="dark"
                                textColor={theme.colors.text}
                                style={{ width: '100%' }} // the picker takes parent width
                            />
                            {Platform.OS === 'ios' && (
                                <TouchableOpacity
                                    onPress={() => {
                                        const ds = formatDate(tempSelectedDate);
                                        if (datePickerType === 'from') setFromDateString(ds);
                                        else if (datePickerType === 'to') setToDateString(ds);

                                        setDatePickerVisible(false);
                                        setDatePickerType(null);
                                    }}
                                    style={{
                                        paddingVertical: hp('1%'),
                                        paddingHorizontal: wp('5%'),
                                        backgroundColor: theme.colors.primary,
                                        borderRadius: wp('2%'),
                                    }}
                                >
                                    <AppText style={{ color: '#fff', fontWeight: '600' }}>Done</AppText>
                                </TouchableOpacity>
                            )}

                        </View>
                    )}
                </SafeAreaView>
            </Modal>
        </BackgroundWrapper>
    );
};

const styles = StyleSheet.create({
    card: {
        marginHorizontal: wp('2%'),
        marginBottom: hp('2%'),
        padding: wp('2%'),
        borderRadius: wp('3%'),
        shadowColor: '#000',
        shadowOpacity: 0.1,
        elevation: 3,
    },
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: hp('1%'),
    },
    index: {
        fontSize: wp('3.8%'),
        fontWeight: '600',
    },
    date: {
        fontSize: wp('3.4%'),
    },
    name: {
        fontSize: wp('4.2%'),
        fontWeight: '500',
        marginBottom: wp('1%'),
    },
    subText: {
        fontSize: wp('3.6%'),
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: hp('0.5%'),
    },
    badges: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    interestedBadge: {
        flexDirection: 'row',
        paddingHorizontal: wp('3%'),
        paddingVertical: hp('0.6%'),
        borderRadius: wp('2%'),
        alignItems: 'center',
        gap: wp('1.2%'),
        marginRight: wp('2%'),
        borderWidth: 1,
    },
    interestedText: {
        fontWeight: '500',
        fontSize: wp('3.9%'),
    },
    secondaryBtn: {
        flexDirection: 'row',
        backgroundColor: '#DFDFDF',
        paddingHorizontal: wp('3%'),
        paddingVertical: hp('0.6%'),
        borderRadius: wp('2%'),
        alignItems: 'center',
        gap: wp('1%'),
    },
    secondaryBtnText: {
        fontSize: wp('3.8%'),
        color: '#333',
    },
    iconBtn: {
        padding: wp('2%'),
        borderRadius: wp('2.5%'),
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        right: wp('2%'),
        top: -hp('4%'),
    },
    containerCard: {
        borderRadius: wp('2.5%'),
        paddingHorizontal: wp('2%'),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 4,
        width: '100%',
        marginBottom: hp('1%'),
        alignSelf: 'center',
    },
    contentWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: hp('1.6%'),
        paddingHorizontal: wp('4%'),
        right: wp('2%'),
    },
    leftTextTop: {
        fontSize: hp('2.5%'),
        fontWeight: '500',
        marginBottom: hp('0.3%'),
    },
    leftTextBottom: {
        fontSize: hp('2.3%'),
        fontWeight: '700',
        opacity: 0.7,
    },
    filterContainer: {
        paddingHorizontal: wp('2%'),
        marginBottom: hp('2%'),
    },
    dateFilterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp('4%'),
        paddingVertical: hp('1.2%'),
        borderRadius: wp('2.5%'),
        borderWidth: 1,
        gap: wp('2%'),
    },
    dateFilterText: {
        fontSize: wp('3.8%'),
        fontWeight: '500',
        flex: 1,
    },
    clearFilterBtn: {
        padding: wp('1%'),
    },
    footerLoader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: hp('3%'),
        gap: wp('2%'),
    },
    footerLoaderText: {
        fontSize: wp('3.5%'),
        fontWeight: '500',
    },
    emptyStateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: hp('10%'),
        paddingHorizontal: wp('8%'),
        flex: 1,
    },
    emptyStateTitle: {
        fontSize: wp('5%'),
        fontWeight: '600',
        marginTop: hp('2%'),
        marginBottom: hp('1%'),
        textAlign: 'center',
    },
    emptyStateSubtitle: {
        fontSize: wp('3.8%'),
        textAlign: 'center',
        lineHeight: wp('5.5%'),
        marginBottom: hp('3%'),
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    modalContent: {
        width: wp('90%'),
        borderRadius: wp('3%'),
        padding: wp('5%'),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: wp('5%'),
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: hp('3%'),
    },
    modalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: hp('3%'),
        gap: wp('3%'),
    },
    datePickerBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: wp('3%'),
        borderRadius: wp('2%'),
        borderWidth: 1,
        gap: wp('2%'),
    },
    dateLabel: {
        fontSize: wp('3.2%'),
        fontWeight: '400',
    },
    dateValue: {
        fontSize: wp('3.8%'),
        fontWeight: '600',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: wp('3%'),
    },
    modalBtn: {
        flex: 1,
        paddingVertical: hp('1.5%'),
        borderRadius: wp('2%'),
        alignItems: 'center',
        justifyContent: 'center',
    },
    clearBtn: {
        backgroundColor: 'transparent',
        borderWidth: 1,
    },
    applyBtn: {
        // backgroundColor set dynamically
    },
    modalBtnText: {
        fontSize: wp('4%'),
        fontWeight: '600',
    },
});
export default LeadsScreen;
