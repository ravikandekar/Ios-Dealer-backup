import React, { useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
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
import DatePickerComponent from '../components/DatePickerComponent';
import apiClient from '../utils/apiClient';
import { showToast } from '../utils/toastService';
import Loader from '../components/Loader';

const formatDate = date =>
    `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${date.getFullYear()}`;

const formatDateForAPI = date =>
    `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

const parseDate = dateString => {
    const [d, m, y] = dateString.split('-');
    return new Date(y, m - 1, d);
};

const LeadsScreen = () => {
    const { theme, userID } = useContext(AuthContext);
    const [selectedInterestedIds, setSelectedInterestedIds] = useState({});
    const [showDateSelectionModal, setShowDateSelectionModal] = useState(false);
    const [fromDateString, setFromDateString] = useState(formatDate(new Date()));
    const [toDateString, setToDateString] = useState(formatDate(new Date()));
    const [leadsData, setLeadsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingIds, setLoadingIds] = useState({});
    const [applyingDateFilter, setApplyingDateFilter] = useState(false);
    const [hasDateFilter, setHasDateFilter] = useState(false);
    const [clearingFilter, setClearingFilter] = useState(false);

    // Simplified pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMoreData, setHasMoreData] = useState(true);

    const ITEMS_PER_PAGE = 12;
    const loadingMoreRef = useRef(false);

    const getFromDate = () => parseDate(fromDateString);
    const getToDate = () => parseDate(toDateString);

    const openDateSelectionModal = () => setShowDateSelectionModal(true);
    const closeDateSelectionModal = () => setShowDateSelectionModal(false);

    const handleApplyDateFilter = async (fromDate, toDate) => {
        setApplyingDateFilter(true);
        try {
            // Update the date strings
            setFromDateString(fromDate);
            setToDateString(toDate);

            setCurrentPage(1);
            setLeadsData([]);
            setHasMoreData(true);
            loadingMoreRef.current = false;

            // Call API with date filter explicitly enabled
            const tempFromDate = parseDate(fromDate);
            const tempToDate = parseDate(toDate);

            await fetchLeadDataWithDates(false, true, 1, false, tempFromDate, tempToDate);
            setHasDateFilter(true);
            setShowDateSelectionModal(false);
            showToast('success', '', 'Date filter applied successfully');
        } catch (error) {
            showToast('error', '', 'Failed to apply date filter');
        } finally {
            setApplyingDateFilter(false);
        }
    };

    // Helper function to fetch data with specific dates
    const fetchLeadDataWithDates = useCallback(async (isRefreshing = false, isFiltered = false, page = 1, append = false, fromDate = null, toDate = null) => {
        try {
            // Prevent duplicate requests for load more
            if (append && loadingMoreRef.current) {
                return;
            }

            if (append) {
                loadingMoreRef.current = true;
                setLoadingMore(true);
            } else if (!isRefreshing && !clearingFilter) {
                setLoading(true);
            }

            // Base API URL with pagination
            let apiUrl = `/api/dealer/dealerleadRoute/getall_leads_bydelerid/${userID}`;
            const params = new URLSearchParams({
                page: page.toString(),
                limit: ITEMS_PER_PAGE.toString()
            });

            // Only add date filters when explicitly filtered or hasDateFilter is true
            if (isFiltered || hasDateFilter) {
                const fromDateToUse = fromDate || getFromDate();
                const toDateToUse = toDate || getToDate();
                const fromDateAPI = formatDateForAPI(fromDateToUse);
                const toDateAPI = formatDateForAPI(toDateToUse);

                params.append('fromDate', fromDateAPI);
                params.append('toDate', toDateAPI);
            }

            const finalUrl = `${apiUrl}?${params.toString()}`;
            console.log('API Call:', finalUrl); // For debugging

            const res = await apiClient.get(finalUrl);
            const responseData = res?.data?.data || {};
            const leads = responseData.leads || [];
            const pagination = res?.data?.pagination || {};

            // Update pagination info
            setCurrentPage(pagination.currentPage || page);
            setTotalPages(pagination.totalPages || 1);
            setTotalItems(pagination.totalItems || 0);

            // Check if more data is available
            const hasMore = (pagination.currentPage || page) < (pagination.totalPages || 1);
            setHasMoreData(hasMore);

            if (append) {
                // Append new data
                setLeadsData(prevData => {
                    const combinedData = [...prevData, ...leads];

                    // Update interest map for new items
                    const newInterestMap = {};
                    leads.forEach((lead, i) => {
                        const globalIndex = prevData.length + i;
                        newInterestMap[globalIndex] = lead.interested;
                    });
                    setSelectedInterestedIds(prev => ({ ...prev, ...newInterestMap }));

                    return combinedData;
                });
            } else {
                // Replace data
                setLeadsData(leads);

                // Initialize interest map
                const initialInterestMap = {};
                leads.forEach((lead, i) => {
                    initialInterestMap[i] = lead.interested;
                });
                setSelectedInterestedIds(initialInterestMap);
            }

        } catch (error) {
            console.error('Leads fetch error:', error);
            showToast('error', '', 'Failed to load leads. Please try again.');
            if (!append) {
                setLeadsData([]);
            }
        } finally {
            if (!isRefreshing && !clearingFilter && !append) {
                setLoading(false);
            }
            if (append) {
                setLoadingMore(false);
                loadingMoreRef.current = false;
            }
        }
    }, [userID, fromDateString, toDateString, hasDateFilter, clearingFilter]);

    // Regular fetch function for non-date filter calls
    const fetchLeadData = useCallback(async (isRefreshing = false, isFiltered = false, page = 1, append = false) => {
        return fetchLeadDataWithDates(isRefreshing, isFiltered, page, append);
    }, [fetchLeadDataWithDates]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        setCurrentPage(1);
        setLeadsData([]);
        setHasMoreData(true);
        loadingMoreRef.current = false;
        await fetchLeadData(true, hasDateFilter, 1);
        setRefreshing(false);
    }, [fetchLeadData, clearingFilter]);

    // Simplified load more function
    const loadMoreData = useCallback(() => {
        if (loadingMoreRef.current || !hasMoreData || loading || refreshing) {
            return;
        }

        const nextPage = currentPage + 1;
        fetchLeadData(false, hasDateFilter, nextPage, true);
    }, [hasMoreData, loading, refreshing, currentPage, fetchLeadData, hasDateFilter]);

    // Handle end reached
    const handleEndReached = useCallback(() => {
        loadMoreData();
    }, [loadMoreData]);

    // Initial data fetch
    useEffect(() => {
        fetchLeadData(false, false, 1);
    }, []);

    const handleCall = useCallback(async (item) => {
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
    }, [userID]);

    const handleToggleInterest = useCallback(async (item, index) => {
        const leadId = item?.leadId || item?._id;
        if (!leadId) return showToast('error', '', 'Invalid lead ID');

        const currentInterest = selectedInterestedIds[index] ?? item?.interested;
        const newInterest = !currentInterest;

        setLoadingIds(prev => ({ ...prev, [index]: true }));

        try {
            const response = await apiClient.patch(`/api/dealer/dealerleadRoute/update-interest/${leadId}`);
            if (response?.data?.success) {
                setSelectedInterestedIds(prev => ({ ...prev, [index]: newInterest }));
                showToast('success', '', newInterest ? 'Marked as Interested' : 'Unmarked as Interested');
            } else {
                showToast('error', '', response?.data?.message || 'Failed to update interest');
            }
        } catch (error) {
            console.error('Interest toggle failed:', error);
            showToast('error', '', error?.response?.data?.message || 'Something went wrong');
        } finally {
            setLoadingIds(prev => ({ ...prev, [index]: false }));
        }
    }, [selectedInterestedIds]);

    const handleClearDateFilter = async () => {
        setClearingFilter(true);
        setHasDateFilter(false); // ensure filter state is OFF
        setCurrentPage(1);
        setLeadsData([]);
        setHasMoreData(true);
        loadingMoreRef.current = false;

        try {
            // Reset dates to today (optional)
            const today = new Date();
            setFromDateString(formatDate(today));
            setToDateString(formatDate(today));

            // 🚀 Call normal API like initial load
            await fetchLeadData(false, false, 1);

            showToast('success', '', 'Date filter cleared');
        } catch (error) {
            console.error('Clear filter error:', error);
            showToast('error', '', 'Failed to clear filter');
            setHasDateFilter(true); // rollback if failed
        } finally {
            setClearingFilter(false);
        }
    };


    const renderItem = useCallback(({ item, index }) => {
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
    }, [selectedInterestedIds, loadingIds, theme, handleCall, handleToggleInterest]);

    const renderEmptyState = () => (
        <View style={styles.emptyStateContainer}>
            <Icon
                name="account-search-outline"
                size={hp('8%')}
                color={theme.colors.placeholder}
            />
            <AppText style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
                No Leads Found
            </AppText>
            <AppText style={[styles.emptyStateSubtitle, { color: theme.colors.placeholder }]}>
                {hasDateFilter
                    ? "No leads available for the selected date range. Try selecting a different date range or clear the filter."
                    : "No leads available at the moment. Pull down to refresh or try again later."
                }
            </AppText>
            <View style={styles.emptyStateActions}>
                {hasDateFilter && (
                    <TouchableOpacity
                        style={[styles.clearFilterButton, { borderColor: theme.colors.primary }]}
                        onPress={handleClearDateFilter}
                        disabled={clearingFilter}
                    >
                        {clearingFilter ? (
                            <ActivityIndicator size="small" color={theme.colors.primary} />
                        ) : (
                            <Icon name="filter-remove" size={wp('5%')} color={theme.colors.primary} />
                        )}
                        <AppText style={[styles.clearFilterButtonText, { color: theme.colors.primary }]}>
                            {clearingFilter ? 'Clearing...' : 'Clear Filter'}
                        </AppText>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    const renderHeader = () => (
        <View>
            <LinearGradient
                colors={['#E6F1FF', '#C8E2FF']}
                start={{ x: 1, y: 1 }}
                end={{ x: 0, y: 1 }}
                style={[styles.containerCard, { borderColor: theme.colors.border }]}
            >
                <View style={styles.contentWrapper}>
                    <View>
                        <AppText style={[styles.leftTextTop]}>
                            Connect with your
                        </AppText>
                        <AppText style={[styles.leftTextBottom, { color: theme.colors.primary }]}>Potential Buyers!</AppText>
                    </View>
                    <Icon
                        name="account-group"
                        size={hp('7%')}
                        color={theme.colors.primary}
                    />
                </View>
            </LinearGradient>

            {hasDateFilter && (
                <View style={[styles.currentDateRangeContainer, { backgroundColor: theme.colors.card }]}>
                    <View style={styles.dateRangeRow}>
                        <Icon name="calendar-range" size={wp('5%')} color={theme.colors.primary} />
                        <AppText style={[styles.dateRangeText, { color: theme.colors.text }]}>
                            {fromDateString} - {toDateString}
                        </AppText>
                        <TouchableOpacity
                            onPress={handleClearDateFilter}
                            style={styles.clearFilterIcon}
                            disabled={clearingFilter}
                        >
                            {clearingFilter ? (
                                <ActivityIndicator size="small" color={theme.colors.placeholder} />
                            ) : (
                                <Icon name="close-circle" size={wp('5%')} color={theme.colors.placeholder} />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );

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

    const keyExtractor = useCallback((item, index) => `${item?.leadId || item?._id || index}-${index}`, []);

    if (loading) {
        return (
            <BackgroundWrapper style={{ padding: wp('2%') }}>
                <DetailsHeader
                    title="Leads"
                    stepText="Loading..."
                    rightType="none"
                    actionIcon="calendar-outline"
                    onActionPress={openDateSelectionModal}
                   
                />
                <Loader visible />
            </BackgroundWrapper>
        );
    }

    return (
        <BackgroundWrapper style={{ padding: wp('2%') }}>
            <DetailsHeader
                title="Leads"
                stepText={hasDateFilter
                    ? `${totalItems} filtered leads (${leadsData.length} loaded)`
                    : `${totalItems} leads (${leadsData.length} loaded)`
                }
                rightType="none"
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
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.2}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={5}
                initialNumToRender={7}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={leadsData.length === 0 ? { flex: 1 } : {}}
            />

            {/* Date Picker Component */}
            <DatePickerComponent
                visible={showDateSelectionModal}
                onClose={closeDateSelectionModal}
                fromDateString={fromDateString}
                toDateString={toDateString}
                onApplyFilter={handleApplyDateFilter}
                applyingDateFilter={applyingDateFilter}
            />
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
        marginBottom: hp('2%'),
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
    // Current Date Range Display
    currentDateRangeContainer: {
        marginHorizontal: wp('2%'),
        marginBottom: hp('2%'),
        padding: wp('4%'),
        borderRadius: wp('2%'),
        shadowColor: '#000',
        shadowOpacity: 0.1,
        elevation: 2,
    },
    dateRangeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateRangeText: {
        fontSize: wp('4%'),
        fontWeight: '600',
        marginLeft: wp('2%'),
        flex: 1,
        textAlign: 'center',
    },
    clearFilterIcon: {
        marginLeft: wp('2%'),
    },
    // Footer Loader Styles
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
    // Empty State Styles
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
    emptyStateActions: {
        flexDirection: 'row',
        gap: wp('3%'),
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    clearFilterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp('6%'),
        paddingVertical: hp('1.5%'),
        borderRadius: wp('8%'),
        borderWidth: 1,
        gap: wp('2%'),
    },
    clearFilterButtonText: {
        fontSize: wp('4%'),
        fontWeight: '600',
    },
});

export default LeadsScreen;