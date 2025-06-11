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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';

const { width } = Dimensions.get('window');

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  processingTime: string;
  minAmount: number;
  maxAmount: number;
  fee: string;
  isAvailable: boolean;
}

interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
  rate: number; // Exchange rate to USD
}

const DepositScreen: React.FC = () => {
  const [selectedMethod, setSelectedMethod] = useState<string>('bank_transfer');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      icon: 'card-outline',
      processingTime: '1-3 business days',
      minAmount: 100,
      maxAmount: 50000,
      fee: 'Free',
      isAvailable: true,
    },
    {
      id: 'credit_card',
      name: 'Credit/Debit Card',
      icon: 'card',
      processingTime: 'Instant',
      minAmount: 50,
      maxAmount: 10000,
      fee: '2.5%',
      isAvailable: true,
    },
    {
      id: 'crypto',
      name: 'Cryptocurrency',
      icon: 'logo-bitcoin',
      processingTime: '10-60 minutes',
      minAmount: 10,
      maxAmount: 100000,
      fee: 'Network fee only',
      isAvailable: true,
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: 'logo-paypal',
      processingTime: 'Instant',
      minAmount: 25,
      maxAmount: 5000,
      fee: '3.5%',
      isAvailable: false,
    },
  ];

  const currencies: CurrencyOption[] = [
    { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.0 },
    { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.85 },
    { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.73 },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 110.0 },
    { code: 'BTC', name: 'Bitcoin', symbol: '₿', rate: 0.000025 },
    { code: 'ETH', name: 'Ethereum', symbol: 'Ξ', rate: 0.0004 },
  ];

  const selectedPaymentMethod = paymentMethods.find(method => method.id === selectedMethod);
  const selectedCurrencyData = currencies.find(curr => curr.code === selectedCurrency);

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!selectedPaymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    const depositAmount = parseFloat(amount);
    const minAmount = selectedPaymentMethod.minAmount;
    const maxAmount = selectedPaymentMethod.maxAmount;

    if (depositAmount < minAmount) {
      Alert.alert('Error', `Minimum deposit amount is ${selectedCurrencyData?.symbol}${minAmount}`);
      return;
    }

    if (depositAmount > maxAmount) {
      Alert.alert('Error', `Maximum deposit amount is ${selectedCurrencyData?.symbol}${maxAmount}`);
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Deposit Initiated',
        `Your deposit of ${selectedCurrencyData?.symbol}${amount} via ${selectedPaymentMethod.name} has been initiated. Processing time: ${selectedPaymentMethod.processingTime}`,
        [{ text: 'OK', onPress: () => setAmount('') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to process deposit. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateFee = () => {
    if (!amount || !selectedPaymentMethod) return '0.00';
    
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount)) return '0.00';

    if (selectedPaymentMethod.fee === 'Free') return '0.00';
    if (selectedPaymentMethod.fee === 'Network fee only') return 'Variable';
    
    const feePercent = parseFloat(selectedPaymentMethod.fee.replace('%', ''));
    return (depositAmount * feePercent / 100).toFixed(2);
  };

  const formatCurrency = (value: string, currency: CurrencyOption) => {
    if (!value) return '';
    return `${currency.symbol}${value}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Deposit Funds</Text>
          <Text style={styles.headerSubtitle}>Add money to your trading account</Text>
        </View>

        {/* Currency Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Currency</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.currencySelector}>
            {currencies.map((currency) => (
              <TouchableOpacity
                key={currency.code}
                style={[
                  styles.currencyButton,
                  selectedCurrency === currency.code && styles.currencyButtonActive
                ]}
                onPress={() => setSelectedCurrency(currency.code)}
              >
                <Text style={[
                  styles.currencyCode,
                  selectedCurrency === currency.code && styles.currencyCodeActive
                ]}>
                  {currency.code}
                </Text>
                <Text style={[
                  styles.currencyName,
                  selectedCurrency === currency.code && styles.currencyNameActive
                ]}>
                  {currency.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amount to Deposit</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>{selectedCurrencyData?.symbol}</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={colors.text.tertiary}
              keyboardType="numeric"
            />
          </View>
          
          {/* Quick Amount Buttons */}
          <View style={styles.quickAmounts}>
            {[100, 500, 1000, 5000].map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                style={styles.quickAmountButton}
                onPress={() => setAmount(quickAmount.toString())}
              >
                <Text style={styles.quickAmountText}>
                  {selectedCurrencyData?.symbol}{quickAmount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethod,
                selectedMethod === method.id && styles.paymentMethodActive,
                !method.isAvailable && styles.paymentMethodDisabled
              ]}
              onPress={() => method.isAvailable && setSelectedMethod(method.id)}
              disabled={!method.isAvailable}
            >
              <View style={styles.paymentMethodLeft}>
                <View style={[
                  styles.paymentMethodIcon,
                  selectedMethod === method.id && styles.paymentMethodIconActive
                ]}>
                  <Ionicons 
                    name={method.icon as any} 
                    size={24} 
                    color={selectedMethod === method.id ? colors.background.primary : colors.primary[500]} 
                  />
                </View>
                <View style={styles.paymentMethodInfo}>
                  <Text style={[
                    styles.paymentMethodName,
                    !method.isAvailable && styles.paymentMethodNameDisabled
                  ]}>
                    {method.name}
                  </Text>
                  <Text style={styles.paymentMethodDetails}>
                    Fee: {method.fee} • {method.processingTime}
                  </Text>
                </View>
              </View>
              <View style={styles.paymentMethodRight}>
                {!method.isAvailable && (
                  <Text style={styles.unavailableText}>Coming Soon</Text>
                )}
                <Ionicons
                  name={selectedMethod === method.id ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={selectedMethod === method.id ? colors.primary[500] : colors.text.tertiary}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transaction Summary */}
        {amount && selectedPaymentMethod && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transaction Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Deposit Amount</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(amount, selectedCurrencyData!)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Processing Fee</Text>
                <Text style={styles.summaryValue}>
                  {calculateFee() === 'Variable' ? 'Variable' : 
                   selectedCurrencyData?.symbol + calculateFee()}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryRowTotal]}>
                <Text style={styles.summaryLabelTotal}>You Will Pay</Text>
                <Text style={styles.summaryValueTotal}>
                  {calculateFee() === 'Variable' ? 
                    formatCurrency(amount, selectedCurrencyData!) + ' + fees' :
                    selectedCurrencyData?.symbol + (parseFloat(amount) + parseFloat(calculateFee())).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Deposit Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.depositButton,
              (!amount || isLoading || !selectedPaymentMethod?.isAvailable) && styles.depositButtonDisabled
            ]}
            onPress={handleDeposit}
            disabled={!amount || isLoading || !selectedPaymentMethod?.isAvailable}
          >
            <Text style={styles.depositButtonText}>
              {isLoading ? 'Processing...' : 'Proceed with Deposit'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Important Information */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={20} color={colors.status.info} />
              <Text style={styles.infoTitle}>Important Information</Text>
            </View>
            <Text style={styles.infoText}>
              • Deposits are processed according to the selected payment method timeline{'\n'}
              • Minimum and maximum amounts apply per payment method{'\n'}
              • Your account will be credited once the deposit is confirmed{'\n'}
              • For cryptocurrency deposits, network confirmations are required{'\n'}
              • Contact support if you need assistance with your deposit
            </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  headerTitle: {
    fontSize: typography.sizes['2xl'],
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  headerSubtitle: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
  },
  section: {
    marginHorizontal: spacing[4],
    marginVertical: spacing[4],
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  currencySelector: {
    marginBottom: spacing[2],
  },
  currencyButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    marginRight: spacing[3],
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.primary,
    minWidth: 100,
    alignItems: 'center',
  },
  currencyButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  currencyCode: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  currencyCodeActive: {
    color: colors.background.primary,
  },
  currencyName: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  currencyNameActive: {
    color: colors.background.primary,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.primary,
    paddingHorizontal: spacing[4],
    marginBottom: spacing[4],
  },
  currencySymbol: {
    fontSize: typography.sizes['2xl'],
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.primary[500],
    marginRight: spacing[2],
  },
  amountInput: {
    flex: 1,
    fontSize: typography.sizes['2xl'],
    fontFamily: typography.fonts.monospace,
    color: colors.text.primary,
    paddingVertical: spacing[4],
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  quickAmountButton: {
    flex: 1,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[2],
    marginHorizontal: spacing[1],
    backgroundColor: colors.background.tertiary,
    borderRadius: 6,
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  paymentMethodActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.background.tertiary,
  },
  paymentMethodDisabled: {
    opacity: 0.6,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  paymentMethodIconActive: {
    backgroundColor: colors.primary[500],
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  paymentMethodNameDisabled: {
    color: colors.text.tertiary,
  },
  paymentMethodDetails: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
  },
  paymentMethodRight: {
    alignItems: 'flex-end',
  },
  unavailableText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    color: colors.trading.warning,
    marginBottom: spacing[1],
  },
  summaryCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  summaryRowTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    paddingTop: spacing[3],
    marginBottom: 0,
  },
  summaryLabel: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.monospace,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  summaryLabelTotal: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  summaryValueTotal: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.monospace,
    fontWeight: typography.weights.bold,
    color: colors.primary[500],
  },
  depositButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing[4],
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  depositButtonDisabled: {
    backgroundColor: colors.button.disabled,
    opacity: 0.6,
  },
  depositButtonText: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.background.primary,
  },
  infoCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing[4],
    borderLeftWidth: 4,
    borderLeftColor: colors.status.info,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  infoTitle: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginLeft: spacing[2],
  },
  infoText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
    lineHeight: typography.lineHeights.relaxed * typography.sizes.sm,
  },
});

export default DepositScreen;
