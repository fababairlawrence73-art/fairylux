import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { Header } from '../components/Header';
import { FairyLuxIcon } from '../components/FairyLuxIcon';
import {
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from '../services/api';

export function AddressesScreen({ navigation }) {
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [recipientName, setRecipientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [apartmentSuite, setApartmentSuite] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [barangay, setBarangay] = useState('');
  const [city, setCity] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const loadAddresses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAddresses();
      setAddresses(data);
      return data;
    } catch (err) {
      console.warn('Could not load addresses:', err);
      Alert.alert('Delivery Addresses', err.message || 'Unable to retrieve saved addresses.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAddresses();
    }, [loadAddresses])
  );

  const resetForm = useCallback(() => {
    setRecipientName('');
    setPhoneNumber('');
    setApartmentSuite('');
    setStreetAddress('');
    setBarangay('');
    setCity('');
    setStateProvince('');
    setPostalCode('');
    setLandmark('');
    setIsDefault(false);
    setEditingId(null);
  }, []);

  const handleOpenAddModal = useCallback(() => {
    resetForm();
    if (addresses.length === 0) {
      setIsDefault(true);
    }
    setModalVisible(true);
  }, [addresses.length, resetForm]);

  // Auto-open modal if requested by caller (e.g. from Cart Checkout modal)
  useEffect(() => {
    if (route.params?.autoOpenAdd) {
      handleOpenAddModal();
    }
  }, [route.params?.autoOpenAdd, handleOpenAddModal]);

  const handleOpenEditModal = (item) => {
    setEditingId(item.id);
    setRecipientName(item.recipient_name || '');
    setPhoneNumber(item.phone_number || '');
    setApartmentSuite(item.apartment_suite || '');
    setStreetAddress(item.street_address || '');
    setBarangay(item.barangay || '');
    setCity(item.city || '');
    setStateProvince(item.state_province || '');
    setPostalCode(item.postal_code || '');
    setLandmark(item.landmark || '');
    setIsDefault(Boolean(item.is_default));
    setModalVisible(true);
  };

  const handleSaveAddress = async () => {
    if (!recipientName.trim()) {
      Alert.alert('Required Field', 'Please enter the recipient full name.');
      return;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('Required Field', 'Please enter the contact phone number.');
      return;
    }
    if (!streetAddress.trim()) {
      Alert.alert('Required Field', 'Please enter the street name / avenue.');
      return;
    }
    if (!city.trim()) {
      Alert.alert('Required Field', 'Please enter the municipality or city.');
      return;
    }
    if (!stateProvince.trim()) {
      Alert.alert('Required Field', 'Please enter the province or state.');
      return;
    }
    if (!postalCode.trim()) {
      Alert.alert('Required Field', 'Please enter the postal code.');
      return;
    }

    const payload = {
      recipient_name: recipientName.trim(),
      phone_number: phoneNumber.trim(),
      apartment_suite: apartmentSuite.trim() || null,
      street_address: streetAddress.trim(),
      barangay: barangay.trim() || null,
      city: city.trim(),
      state_province: stateProvince.trim(),
      postal_code: postalCode.trim(),
      country: 'Philippines',
      landmark: landmark.trim() || null,
      is_default: isDefault,
    };

    try {
      setSaving(true);
      let savedAddress = null;
      if (editingId) {
        savedAddress = await updateAddress(editingId, payload);
      } else {
        savedAddress = await createAddress(payload);
      }
      setModalVisible(false);
      resetForm();
      const updatedList = await loadAddresses();

      const isFromCheckout = Boolean(
        route.params?.fromCheckout ||
        route.params?.returnToCheckout ||
        route.params?.returnToCart
      );

      // If user came from Cart / Checkout requirement, provide clear options to continue to Checkout
      if (isFromCheckout) {
        const targetAddress =
          savedAddress ||
          (updatedList && updatedList.find((a) => a.is_default)) ||
          (updatedList && updatedList[0]) ||
          payload;

        Alert.alert(
          'Address Saved',
          'Your delivery address is now saved. You can proceed to checkout.',
          [
            { text: 'Stay Here', style: 'cancel' },
            {
              text: 'Continue to Checkout',
              onPress: () => {
                navigation.navigate('Checkout', {
                  cartData: route.params?.cartData,
                  selectedAddress: targetAddress,
                });
              },
            },
          ]
        );
      }
    } catch (err) {
      Alert.alert('Save Address Failed', err.message || 'Could not save address.');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (item) => {
    try {
      await updateAddress(item.id, { is_default: true });
      await loadAddresses();
    } catch (err) {
      Alert.alert('Update Failed', err.message || 'Could not set as default address.');
    }
  };

  const handleDeleteAddress = (item) => {
    Alert.alert(
      'Delete Address',
      `Are you sure you want to remove the address for "${item.recipient_name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAddress(item.id);
              await loadAddresses();
            } catch (err) {
              Alert.alert('Delete Failed', err.message || 'Could not delete address.');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const formattedAddress = [
      item.apartment_suite,
      item.street_address,
      item.barangay,
      item.city,
      item.state_province,
      item.postal_code,
      item.country || 'Philippines',
    ]
      .filter(Boolean)
      .join(', ');

    return (
      <View style={[styles.card, item.is_default && styles.cardDefault]}>
        <View style={styles.cardHeader}>
          <View style={styles.recipientRow}>
            <Text style={styles.name}>{item.recipient_name}</Text>
            {item.is_default ? (
              <View style={styles.defaultPill}>
                <Text style={styles.defaultPillText}>DEFAULT</Text>
              </View>
            ) : null}
          </View>
          {!item.is_default && (
            <TouchableOpacity
              onPress={() => handleSetDefault(item)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.setDefaultText}>Set as default</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.addressMetaRow}>
          <FairyLuxIcon name="phone" size={13} color={colors.textSecondary} style={{ marginRight: 6 }} />
          <Text style={styles.phone}>{item.phone_number}</Text>
        </View>
        <Text style={styles.addressText}>{formattedAddress}</Text>
        {item.landmark ? (
          <View style={styles.addressMetaRow}>
            <FairyLuxIcon name="pin" size={13} color={colors.gold} style={{ marginRight: 6 }} />
            <Text style={styles.landmarkText}>Note: {item.landmark}</Text>
          </View>
        ) : null}

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleOpenEditModal(item)}
          >
            <Text style={styles.actionBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => handleDeleteAddress(item)}
          >
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header
        title="My Delivery Addresses"
        navigation={navigation}
        onBack={
          (route.params?.fromCheckout || route.params?.returnToCheckout || route.params?.returnToCart) &&
          navigation.canGoBack()
            ? () => navigation.goBack()
            : undefined
        }
      />

      {loading && addresses.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.loadingText}>Retrieving delivery addresses...</Text>
        </View>
      ) : addresses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FairyLuxIcon name="pin" size={50} color={colors.gold} style={{ marginBottom: 12, opacity: 0.6 }} />
          <Text style={styles.emptyTitle}>No Addresses Saved</Text>
          <Text style={styles.emptySubtitle}>
            Save a delivery address to ensure seamless delivery and checkout for your FairyLux orders.
          </Text>
          <TouchableOpacity style={styles.addNewBtnLarge} onPress={handleOpenAddModal}>
            <Text style={styles.addNewBtnLargeText}>+ Add Delivery Address</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={
            <TouchableOpacity style={styles.addNewBtn} onPress={handleOpenAddModal}>
              <Text style={styles.addNewBtnText}>+ Add New Address</Text>
            </TouchableOpacity>
          }
        />
      )}

      {/* Address Form Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 20 }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? 'Edit Delivery Address' : 'New Delivery Address'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <FairyLuxIcon name="close" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.formContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Recipient Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Recipient / Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Maria Santos"
                  placeholderTextColor="#64748b"
                  value={recipientName}
                  onChangeText={setRecipientName}
                  autoCapitalize="words"
                />
              </View>

              {/* Phone Number */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contact Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. +63 917 123 4567"
                  placeholderTextColor="#64748b"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
              </View>

              {/* House / Unit / Building */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>House / Unit / Building / Floor</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Unit 1804, Tower 2, Grand Residences"
                  placeholderTextColor="#64748b"
                  value={apartmentSuite}
                  onChangeText={setApartmentSuite}
                />
              </View>

              {/* Street */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Street / Avenue *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 5th Avenue cor. 28th Street"
                  placeholderTextColor="#64748b"
                  value={streetAddress}
                  onChangeText={setStreetAddress}
                />
              </View>

              {/* Barangay & City Row */}
              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Barangay</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Fort Bonifacio"
                    placeholderTextColor="#64748b"
                    value={barangay}
                    onChangeText={setBarangay}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>City / Municipality *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Taguig City"
                    placeholderTextColor="#64748b"
                    value={city}
                    onChangeText={setCity}
                  />
                </View>
              </View>

              {/* Province & Postal Code Row */}
              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Province / State *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Metro Manila"
                    placeholderTextColor="#64748b"
                    value={stateProvince}
                    onChangeText={setStateProvince}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Postal Code *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 1634"
                    placeholderTextColor="#64748b"
                    value={postalCode}
                    onChangeText={setPostalCode}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              {/* Landmark / Notes */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Landmark / Delivery Notes (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="e.g. Near mall lobby, front desk, or main entrance"
                  placeholderTextColor="#64748b"
                  value={landmark}
                  onChangeText={setLandmark}
                  multiline={true}
                  numberOfLines={2}
                />
              </View>

              {/* Set as Default Switch */}
              <TouchableOpacity
                style={styles.defaultToggle}
                onPress={() => setIsDefault(!isDefault)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, isDefault && styles.checkboxActive]}>
                  {isDefault && <FairyLuxIcon name="check" size={12} color="#ffffff" />}
                </View>
                <Text style={styles.defaultToggleText}>
                  Set as primary delivery address
                </Text>
              </TouchableOpacity>

              {/* Save CTA Button */}
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleSaveAddress}
                disabled={saving}
                activeOpacity={0.88}
              >
                {saving ? (
                  <ActivityIndicator color={colors.primaryDark} />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {editingId ? 'Update Delivery Address' : 'Save Delivery Address'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.gold,
    fontSize: 13,
    marginTop: 12,
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardDefault: {
    borderColor: colors.gold,
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  defaultPill: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  defaultPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.gold,
    letterSpacing: 0.5,
  },
  setDefaultText: {
    fontSize: 12,
    color: colors.gold,
    fontWeight: '600',
  },
  addressMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  phone: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  addressText: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 19,
    marginBottom: 4,
  },
  landmarkText: {
    fontSize: 12,
    color: colors.gold,
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  deleteBtn: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
  addNewBtn: {
    backgroundColor: colors.brandLight,
    borderWidth: 1.5,
    borderColor: colors.brand,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  addNewBtnLarge: {
    backgroundColor: colors.brand,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    marginTop: 16,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 3,
  },
  addNewBtnLargeText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: fonts.semiBold,
    letterSpacing: 0.3,
  },
  addNewBtnText: {
    color: colors.brand,
    fontSize: 14,
    fontFamily: fonts.semiBold,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  emptyIcon: {
    fontSize: 54,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
  },
  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  closeModalText: {
    fontSize: 18,
    color: colors.textMuted,
    fontWeight: '600',
  },
  formContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 14,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 50,
    textAlignVertical: 'top',
  },
  defaultToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  checkboxActive: {
    borderColor: colors.brand,
    backgroundColor: colors.brand,
  },
  defaultToggleText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
  },
  saveBtn: {
    backgroundColor: colors.brand,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 3,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: fonts.semiBold,
    letterSpacing: 0.3,
  },
});
