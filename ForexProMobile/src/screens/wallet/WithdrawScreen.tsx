import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';
import StandardHeader from '../../components/molecules/StandardHeader';

const WithdrawScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('bank');
  const [isLoading, setIsLoading] = useState(false);

  const currencies = [
    { code: 'USD', name: 'US Dollar', balance: 12450.67 },
    { code: 'EUR', name: 'Euro', balance: 8930.42 },
    { code: 'GBP', name: 'British Pound', balance: 5420.18 },
    { code: 'JPY', name: 'Japanese Yen', balance: 890420 },
  ];

  const withdrawMethods = [
    { id: 'bank', name: 'Bank Transfer', icon: 'business', fee: '0.1%' },
    { id: 'card', name: 'Debit Card', icon: 'card', fee: '0.5%' },
    { id: 'crypto', name: 'Cryptocurrency', icon: 'logo-bitcoin', fee: '0.05%' },
  ];

  const selectedCurrencyData = currencies.find(c => c.code === selectedCurrency);

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (selectedCurrencyData && parseFloat(amount) > selectedCurrencyData.balance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    setIsLoading(true);
    
    // Simulate withdrawal process
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Withdrawal Initiated',
        `Your withdrawal of ${amount} ${selectedCurrency} has been initiated. It will be processed within 1-3 business days.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StandardHeader title="Withdraw Funds" showBackButton={true} />

      <ScrollView style={styles.content}>
        {/* Currency Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Currency</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {currencies.map((currency) => (
              <TouchableOpacity
                key={currency.code}
                style={[
                  styles.currencyCard,
                  selectedCurrency === currency.code && styles.selectedCurrencyCard,
                ]}
                onPress={() => setSelectedCurrency(currency.code)}
              >
                <Text style={[
                  styles.currencyCode,
                  selectedCurrency === currency.code && styles.selectedCurrencyCode,
                ]}>
                  {currency.code}
                </Text>
                <Text style={[
                  styles.currencyBalance,
                  selectedCurrency === currency.code && styles.selectedCurrencyBalance,
                ]}>
                  {currency.balance.toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Withdrawal Amount</Text>
          <View style={styles.amountContainer}>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="numeric"
              placeholderTextColor={colors.text.secondary}
            />
            <Text style={styles.currencyLabel}>{selectedCurrency}</Text>
          </View>
          {selectedCurrencyData && (
            <Text style={styles.balanceText}>
              Available: {selectedCurrencyData.balance.toLocaleString()} {selectedCurrency}
            </Text>
          )}
        </View>

        {/* Withdrawal Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Withdrawal Method</Text>
          {withdrawMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                selectedMethod === method.id && styles.selectedMethodCard,
              ]}
              onPress={() => setSelectedMethod(method.id)}
            >
              <View style={styles.methodInfo}>
                <Ionicons
                  name={method.icon as any}
                  size={24}
                  color={selectedMethod === method.id ? colors.primary[500] : colors.text.secondary}
                />
                <View style={styles.methodDetails}>
                  <Text style={[
                    styles.methodName,
                    selectedMethod === method.id && styles.selectedMethodName,
                  ]}>
                    {method.name}
                  </Text>
                  <Text style={styles.methodFee}>Fee: {method.fee}</Text>
                </View>
              </View>
              <Ionicons
                name={selectedMethod === method.id ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={selectedMethod === method.id ? colors.primary[500] : colors.text.secondary}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Withdrawal Summary */}
        {amount && parseFloat(amount) > 0 && (
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Withdrawal Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Amount</Text>
                <Text style={styles.summaryValue}>{amount} {selectedCurrency}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Fee</Text>
                <Text style={styles.summaryValue}>
                  {(parseFloat(amount) * 0.001).toFixed(2)} {selectedCurrency}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Deducted</Text>
                <Text style={styles.totalValue}>
                  {(parseFloat(amount) * 1.001).toFixed(2)} {selectedCurrency}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Withdraw Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.withdrawButton,
            (!amount || parseFloat(amount) <= 0 || isLoading) && styles.disabledButton,
          ]}
          onPress={handleWithdraw}
          disabled={!amount || parseFloat(amount) <= 0 || isLoading}
        >
          <Text style={styles.withdrawButtonText}>
            {isLoading ? 'Processing...' : 'Withdraw Funds'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
    fontFamily: 'System',
  },
  currencyCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 100,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  selectedCurrencyCard: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
    fontFamily: 'System',
  },
  selectedCurrencyCode: {
    color: colors.text.inverse,
  },
  currencyBalance: {
    fontSize: 12,
    color: colors.text.secondary,
    fontFamily: 'System',
  },
  selectedCurrencyBalance: {
    color: colors.text.inverse,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    paddingVertical: 16,
    fontFamily: 'System',
  },
  currencyLabel: {
    fontSize: 16,
    color: colors.text.secondary,
    marginLeft: 12,
    fontFamily: 'System',
  },
  balanceText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 8,
    fontFamily: 'System',
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  selectedMethodCard: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[100],
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodDetails: {
    marginLeft: 12,
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 4,
    fontFamily: 'System',
  },
  selectedMethodName: {
    color: colors.primary[500],
  },
  methodFee: {
    fontSize: 12,
    color: colors.text.secondary,
    fontFamily: 'System',
  },
  summarySection: {
    marginVertical: 20,
  },
  summaryCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: colors.text.secondary,
    fontFamily: 'System',
  },
  summaryValue: {
    fontSize: 16,
    color: colors.text.primary,
    fontFamily: 'System',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    marginTop: 12,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    fontFamily: 'System',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.status.success,
    fontFamily: 'System',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  withdrawButton: {
    backgroundColor: colors.primary[500],
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: colors.text.tertiary,
  },
  withdrawButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.inverse,
    fontFamily: 'System',
  },
});

export default WithdrawScreen;
