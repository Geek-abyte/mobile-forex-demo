import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing } from '../../theme';

const { width } = Dimensions.get('window');

interface OrderForm {
  type: 'buy' | 'sell';
  currency: string;
  fiatCurrency: string;
  totalAmount: string;
  price: string;
  minOrder: string;
  maxOrder: string;
  paymentMethods: string[];
  timeLimit: number;
  terms: string;
}

const CreateP2POrderScreen: React.FC = () => {
  const navigation = useNavigation();
  const [orderForm, setOrderForm] = useState<OrderForm>({
    type: 'sell',
    currency: 'USD',
    fiatCurrency: 'USD',
    totalAmount: '',
    price: '',
    minOrder: '',
    maxOrder: '',
    paymentMethods: [],
    timeLimit: 30,
    terms: '',
  });
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'];
  const paymentMethodOptions = [
    'Bank Transfer',
    'PayPal', 
    'Wise',
    'Revolut',
    'SEPA',
    'Zelle',
    'Venmo',
    'Cash App',
    'Western Union',
    'MoneyGram'
  ];
  const timeLimits = [15, 30, 45, 60, 90, 120];

  const handlePaymentMethodToggle = (method: string) => {
    setOrderForm(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter(m => m !== method)
        : [...prev.paymentMethods, method]
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!orderForm.totalAmount || parseFloat(orderForm.totalAmount) <= 0) {
      newErrors.totalAmount = 'Total amount is required and must be positive';
    }

    if (!orderForm.price || parseFloat(orderForm.price) <= 0) {
      newErrors.price = 'Price is required and must be positive';
    }

    if (!orderForm.minOrder || parseFloat(orderForm.minOrder) <= 0) {
      newErrors.minOrder = 'Minimum order is required and must be positive';
    }

    if (!orderForm.maxOrder || parseFloat(orderForm.maxOrder) <= 0) {
      newErrors.maxOrder = 'Maximum order is required and must be positive';
    }

    if (orderForm.minOrder && orderForm.maxOrder && 
        parseFloat(orderForm.minOrder) > parseFloat(orderForm.maxOrder)) {
      newErrors.maxOrder = 'Maximum order must be greater than minimum order';
    }

    if (orderForm.paymentMethods.length === 0) {
      newErrors.paymentMethods = 'At least one payment method is required';
    }

    if (!orderForm.terms.trim()) {
      newErrors.terms = 'Trading terms are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateOrder = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please check all required fields');
      return;
    }

    // Simulate order creation
    Alert.alert(
      'Order Created Successfully!',
      `Your ${orderForm.type} order for ${orderForm.totalAmount} ${orderForm.currency} has been created and is now live in the marketplace.`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const renderFormField = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    keyboardType: 'default' | 'numeric' | 'decimal-pad' = 'default',
    multiline: boolean = false,
    fieldKey?: string
  ) => (
    <View style={styles.formField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[
          styles.textInput,
          multiline && styles.textInputMultiline,
          fieldKey && errors[fieldKey] && styles.textInputError
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.secondary}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
      />
      {fieldKey && errors[fieldKey] && (
        <Text style={styles.errorText}>{errors[fieldKey]}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create P2P Order</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Order Type Toggle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Type</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                orderForm.type === 'buy' && styles.toggleButtonActive
              ]}
              onPress={() => setOrderForm(prev => ({ ...prev, type: 'buy' }))}
            >
              <Text style={[
                styles.toggleText,
                orderForm.type === 'buy' && styles.toggleTextActive
              ]}>
                Buy
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                orderForm.type === 'sell' && styles.toggleButtonActive
              ]}
              onPress={() => setOrderForm(prev => ({ ...prev, type: 'sell' }))}
            >
              <Text style={[
                styles.toggleText,
                orderForm.type === 'sell' && styles.toggleTextActive
              ]}>
                Sell
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Currency Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Currency Pair</Text>
          <View style={styles.currencyRow}>
            <View style={styles.currencyField}>
              <Text style={styles.fieldLabel}>Base Currency</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.currencyOptions}>
                  {currencies.map((currency) => (
                    <TouchableOpacity
                      key={currency}
                      style={[
                        styles.currencyOption,
                        orderForm.currency === currency && styles.currencyOptionActive
                      ]}
                      onPress={() => setOrderForm(prev => ({ ...prev, currency }))}
                    >
                      <Text style={[
                        styles.currencyText,
                        orderForm.currency === currency && styles.currencyTextActive
                      ]}>
                        {currency}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </View>

        {/* Amount and Price */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Details</Text>
          
          {renderFormField(
            'Total Amount',
            orderForm.totalAmount,
            (text) => setOrderForm(prev => ({ ...prev, totalAmount: text })),
            'Enter total amount',
            'decimal-pad',
            false,
            'totalAmount'
          )}

          {renderFormField(
            'Price per Unit',
            orderForm.price,
            (text) => setOrderForm(prev => ({ ...prev, price: text })),
            'Enter price',
            'decimal-pad',
            false,
            'price'
          )}

          <View style={styles.orderLimits}>
            <View style={styles.limitField}>
              {renderFormField(
                'Min Order',
                orderForm.minOrder,
                (text) => setOrderForm(prev => ({ ...prev, minOrder: text })),
                'Min',
                'decimal-pad',
                false,
                'minOrder'
              )}
            </View>
            <View style={styles.limitField}>
              {renderFormField(
                'Max Order',
                orderForm.maxOrder,
                (text) => setOrderForm(prev => ({ ...prev, maxOrder: text })),
                'Max',
                'decimal-pad',
                false,
                'maxOrder'
              )}
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          <TouchableOpacity
            style={styles.paymentMethodsButton}
            onPress={() => setShowPaymentMethods(true)}
          >
            <Text style={styles.paymentMethodsText}>
              {orderForm.paymentMethods.length > 0
                ? `${orderForm.paymentMethods.length} method(s) selected`
                : 'Select payment methods'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
          {errors.paymentMethods && (
            <Text style={styles.errorText}>{errors.paymentMethods}</Text>
          )}
        </View>

        {/* Time Limit */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Time Limit</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.timeLimitOptions}>
              {timeLimits.map((limit) => (
                <TouchableOpacity
                  key={limit}
                  style={[
                    styles.timeLimitOption,
                    orderForm.timeLimit === limit && styles.timeLimitOptionActive
                  ]}
                  onPress={() => setOrderForm(prev => ({ ...prev, timeLimit: limit }))}
                >
                  <Text style={[
                    styles.timeLimitText,
                    orderForm.timeLimit === limit && styles.timeLimitTextActive
                  ]}>
                    {limit}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Trading Terms */}
        <View style={styles.section}>
          {renderFormField(
            'Trading Terms & Conditions',
            orderForm.terms,
            (text) => setOrderForm(prev => ({ ...prev, terms: text })),
            'Enter your trading terms, requirements, and instructions...',
            'default',
            true,
            'terms'
          )}
        </View>

        {/* Create Order Button */}
        <TouchableOpacity style={styles.createButton} onPress={handleCreateOrder}>
          <LinearGradient
            colors={[colors.primary[500], colors.primary[400]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.createButtonGradient}
          >
            <Text style={styles.createButtonText}>Create Order</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Payment Methods Modal */}
      <Modal
        visible={showPaymentMethods}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentMethods(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Payment Methods</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowPaymentMethods(false)}
              >
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              {paymentMethodOptions.map((method) => (
                <TouchableOpacity
                  key={method}
                  style={styles.paymentMethodItem}
                  onPress={() => handlePaymentMethodToggle(method)}
                >
                  <Text style={styles.paymentMethodName}>{method}</Text>
                  <View style={[
                    styles.checkbox,
                    orderForm.paymentMethods.includes(method) && styles.checkboxActive
                  ]}>
                    {orderForm.paymentMethods.includes(method) && (
                      <Ionicons name="checkmark" size={16} color={colors.background.primary} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalConfirmButton}
              onPress={() => setShowPaymentMethods(false)}
            >
              <Text style={styles.modalConfirmText}>
                Done ({orderForm.paymentMethods.length} selected)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  backButton: {
    padding: spacing[2],
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  sectionTitle: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    borderRadius: spacing[2],
    padding: spacing[1],
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing[3],
    alignItems: 'center',
    borderRadius: spacing[2] - 2,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary[500],
  },
  toggleText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  toggleTextActive: {
    color: colors.background.primary,
  },
  currencyRow: {
    flexDirection: 'row',
  },
  currencyField: {
    flex: 1,
  },
  fieldLabel: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  currencyOptions: {
    flexDirection: 'row',
  },
  currencyOption: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    marginRight: spacing[2],
    backgroundColor: colors.background.secondary,
    borderRadius: spacing[2],
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  currencyOptionActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  currencyText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  currencyTextActive: {
    color: colors.background.primary,
  },
  formField: {
    marginBottom: spacing[4],
  },
  textInput: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: spacing[2],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  textInputMultiline: {
    height: 100,
    textAlignVertical: 'top',
  },
  textInputError: {
    borderColor: colors.status.error,
  },
  errorText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xs,
    color: colors.status.error,
    marginTop: spacing[1],
  },
  orderLimits: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  limitField: {
    flex: 0.48,
  },
  paymentMethodsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: spacing[2],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
  },
  paymentMethodsText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  timeLimitOptions: {
    flexDirection: 'row',
  },
  timeLimitOption: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    marginRight: spacing[2],
    backgroundColor: colors.background.secondary,
    borderRadius: spacing[2],
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  timeLimitOptionActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  timeLimitText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  timeLimitTextActive: {
    color: colors.background.primary,
  },
  createButton: {
    margin: spacing[4],
    borderRadius: spacing[2],
    overflow: 'hidden',
  },
  createButtonGradient: {
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
  createButtonText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.background.primary,
  },
  bottomSpacer: {
    height: spacing[6],
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: spacing[4],
    borderTopRightRadius: spacing[4],
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  modalTitle: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  modalCloseButton: {
    padding: spacing[2],
  },
  modalScrollView: {
    padding: spacing[4],
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  paymentMethodName: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  modalConfirmButton: {
    margin: spacing[4],
    backgroundColor: colors.primary[500],
    borderRadius: spacing[2],
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
  modalConfirmText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.background.primary,
  },
});

export default CreateP2POrderScreen;
