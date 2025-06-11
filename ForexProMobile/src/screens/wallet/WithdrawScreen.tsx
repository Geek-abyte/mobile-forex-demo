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
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, typography, spacing } from '../../theme';

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
    { id: 'bank', name: 'Bank Transfer', icon: 'account-balance', fee: '0.1%' },
    { id: 'card', name: 'Debit Card', icon: 'credit-card', fee: '0.5%' },
    { id: 'crypto', name: 'Cryptocurrency', icon: 'currency-bitcoin', fee: '0.05%' },
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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdraw Funds</Text>
        <View style={styles.headerRight} />
      </View>

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
                <Icon
                  name={method.icon}
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
              <Icon
                name={selectedMethod === method.id ? 'radio-button-checked' : 'radio-button-unchecked'}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.semantic.containerPadding,
    paddingVertical: spacing.semantic.inputVerticalPadding,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.styles.h3,
    color: colors.text.primary,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.semantic.containerPadding,
  },
  section: {
    marginVertical: spacing.semantic.formSectionSpacing,
  },
  sectionTitle: {
    ...typography.styles.h4,
    color: colors.text.primary,
    marginBottom: spacing.semantic.formFieldSpacing,
  },
  currencyCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.semantic.cardPadding,
    marginRight: spacing.semantic.cardGap,
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
    ...typography.styles.h4,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  selectedCurrencyCode: {
    color: colors.text.inverse,
  },
  currencyBalance: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
  },
  selectedCurrencyBalance: {
    color: colors.text.inverse,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    paddingHorizontal: spacing.semantic.inputPadding,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  amountInput: {
    flex: 1,
    ...typography.styles.h3,
    color: colors.text.primary,
    paddingVertical: spacing.semantic.inputVerticalPadding,
  },
  currencyLabel: {
    ...typography.styles.h4,
    color: colors.text.secondary,
    marginLeft: spacing.semantic.inputGap,
  },
  balanceText: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing[2],
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.semantic.cardPadding,
    marginBottom: spacing.semantic.cardGap,
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
    marginLeft: spacing.semantic.buttonGap,
    flex: 1,
  },
  methodName: {
    ...typography.styles.body,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  selectedMethodName: {
    color: colors.primary[500],
  },
  methodFee: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
  },
  summarySection: {
    marginVertical: spacing.semantic.formSectionSpacing,
  },
  summaryCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.semantic.cardPadding,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  summaryLabel: {
    ...typography.styles.body,
    color: colors.text.secondary,
  },
  summaryValue: {
    ...typography.styles.body,
    color: colors.text.primary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    marginTop: spacing.semantic.cardGap,
    paddingTop: spacing.semantic.cardGap,
  },
  totalLabel: {
    ...typography.styles.h4,
    color: colors.text.primary,
  },
  totalValue: {
    ...typography.styles.h4,
    color: colors.status.success,
  },
  footer: {
    padding: spacing.semantic.containerPadding,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  withdrawButton: {
    backgroundColor: colors.primary[500],
    borderRadius: 12,
    paddingVertical: spacing.semantic.buttonPadding,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: colors.text.tertiary,
  },
  withdrawButtonText: {
    ...typography.styles.h4,
    color: colors.text.inverse,
  },
});

export default WithdrawScreen;
