import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing } from '../../theme';
import StandardHeader from '../../components/molecules/StandardHeader';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const HelpSupportScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const supportOptions = [
    {
      icon: 'chatbubbles-outline',
      title: 'Live Chat',
      subtitle: 'Chat with our support team',
      action: () => Alert.alert('Live Chat', 'Live chat is currently unavailable. Please try again later or contact us via email.'),
      availability: 'Available 24/7',
      bgColor: colors.primary[500],
    },
    {
      icon: 'mail-outline',
      title: 'Email Support',
      subtitle: 'Get help via email',
      action: () => setContactModalVisible(true),
      availability: 'Response within 24 hours',
      bgColor: colors.secondary[500],
    },
    {
      icon: 'call-outline',
      title: 'Phone Support',
      subtitle: '+1 (555) 123-FOREX',
      action: () => Linking.openURL('tel:+15551234567'),
      availability: 'Mon-Fri 9AM-6PM EST',
      bgColor: colors.status.success,
    },
    {
      icon: 'globe-outline',
      title: 'Help Center',
      subtitle: 'Browse our knowledge base',
      action: () => Linking.openURL('https://help.forexpro.com'),
      availability: 'Always available',
      bgColor: colors.status.info,
    },
    {
      icon: 'logo-youtube',
      title: 'Video Tutorials',
      subtitle: 'Learn through videos',
      action: () => Linking.openURL('https://youtube.com/forexpro'),
      availability: 'New content weekly',
      bgColor: colors.status.error,
    },
    {
      icon: 'people-outline',
      title: 'Community Forum',
      subtitle: 'Connect with other traders',
      action: () => Linking.openURL('https://community.forexpro.com'),
      availability: 'Active community',
      bgColor: colors.status.warning,
    },
  ];

  const faqData: FAQItem[] = [
    {
      id: '1',
      question: 'How do I deposit funds into my account?',
      answer: 'You can deposit funds by going to Wallet > Deposit. We support bank transfers, credit cards, and various e-wallets. The minimum deposit is $10.',
      category: 'Account'
    },
    {
      id: '2',
      question: 'What are the trading fees?',
      answer: 'Our trading fees vary by instrument. Forex spreads start from 0.1 pips, stocks have a 0.1% commission, and crypto trading has a 0.25% fee.',
      category: 'Trading'
    },
    {
      id: '3',
      question: 'How long do withdrawals take?',
      answer: 'Withdrawal processing times depend on the method: Bank transfers take 3-5 business days, e-wallets take 1-2 business days, and crypto withdrawals are usually processed within 1 hour.',
      category: 'Account'
    },
    {
      id: '4',
      question: 'Is my money safe with ForexPro?',
      answer: 'Yes, we are regulated by major financial authorities and use segregated accounts to keep client funds separate from company funds. We also use bank-level encryption for all transactions.',
      category: 'Security'
    },
    {
      id: '5',
      question: 'Can I trade on weekends?',
      answer: 'Forex markets are closed on weekends, but you can trade cryptocurrencies 24/7. Stock markets follow their respective exchange hours.',
      category: 'Trading'
    },
    {
      id: '6',
      question: 'How do I enable two-factor authentication?',
      answer: 'Go to Profile > Security & Privacy > Two-Factor Authentication. You can use apps like Google Authenticator or Authy to set up 2FA.',
      category: 'Security'
    },
    {
      id: '7',
      question: 'What is leverage and how does it work?',
      answer: 'Leverage allows you to trade with more money than you have in your account. For example, 1:100 leverage means you can trade $10,000 with just $100. However, this increases both potential profits and losses.',
      category: 'Trading'
    },
    {
      id: '8',
      question: 'How do I reset my password?',
      answer: 'On the login screen, tap "Forgot Password" and enter your email. You\'ll receive a reset link within a few minutes.',
      category: 'Account'
    },
  ];

  const categories = ['All', 'Account', 'Trading', 'Security'];

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === '' || selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmitTicket = () => {
    if (!contactSubject.trim() || !contactMessage.trim()) {
      Alert.alert('Error', 'Please fill in both subject and message fields.');
      return;
    }

    Alert.alert(
      'Support Ticket Submitted',
      'Your support ticket has been submitted successfully. You will receive a confirmation email shortly.',
      [{ 
        text: 'OK', 
        onPress: () => {
          setContactModalVisible(false);
          setContactSubject('');
          setContactMessage('');
        }
      }]
    );
  };

  const renderSupportOption = (option: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.supportOption}
      onPress={option.action}
    >
      <View style={[styles.supportIcon, { backgroundColor: option.bgColor }]}>
        <Ionicons name={option.icon} size={24} color={colors.text.primary} />
      </View>
      <View style={styles.supportInfo}>
        <Text style={styles.supportTitle}>{option.title}</Text>
        <Text style={styles.supportSubtitle}>{option.subtitle}</Text>
        <Text style={styles.supportAvailability}>{option.availability}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
    </TouchableOpacity>
  );

  const renderFAQItem = (faq: FAQItem) => (
    <TouchableOpacity
      key={faq.id}
      style={styles.faqItem}
      onPress={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{faq.question}</Text>
        <Ionicons 
          name={expandedFAQ === faq.id ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color={colors.text.secondary} 
        />
      </View>
      {expandedFAQ === faq.id && (
        <Text style={styles.faqAnswer}>{faq.answer}</Text>
      )}
    </TouchableOpacity>
  );

  const renderContactModal = () => (
    <Modal
      visible={contactModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setContactModalVisible(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setContactModalVisible(false)}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Contact Support</Text>
          <TouchableOpacity onPress={handleSubmitTicket}>
            <Text style={styles.modalSend}>Send</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Subject</Text>
            <TextInput
              style={styles.textInput}
              value={contactSubject}
              onChangeText={setContactSubject}
              placeholder="Briefly describe your issue"
              placeholderTextColor={colors.text.secondary}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {categories.slice(1).map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category && styles.categoryChipSelected
                  ]}
                  onPress={() => setSelectedCategory(selectedCategory === category ? '' : category)}
                >
                  <Text style={[
                    styles.categoryChipText,
                    selectedCategory === category && styles.categoryChipTextSelected
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Message</Text>
            <TextInput
              style={[styles.textInput, styles.messageInput]}
              value={contactMessage}
              onChangeText={setContactMessage}
              placeholder="Describe your issue in detail..."
              placeholderTextColor={colors.text.secondary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
          
          <View style={styles.contactInfo}>
            <Text style={styles.contactInfoTitle}>Alternative Contact Methods:</Text>
            <Text style={styles.contactInfoText}>📧 support@forexpro.com</Text>
            <Text style={styles.contactInfoText}>📞 +1 (555) 123-FOREX</Text>
            <Text style={styles.contactInfoText}>💬 Live chat on our website</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StandardHeader 
        title="Help & Support"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          <View style={styles.supportGrid}>
            {supportOptions.map(renderSupportOption)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search FAQs..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.text.secondary}
            />
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterChip,
                  (selectedCategory === category || (selectedCategory === '' && category === 'All')) && styles.filterChipSelected
                ]}
                onPress={() => setSelectedCategory(category === 'All' ? '' : category)}
              >
                <Text style={[
                  styles.filterChipText,
                  (selectedCategory === category || (selectedCategory === '' && category === 'All')) && styles.filterChipTextSelected
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={styles.faqContainer}>
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map(renderFAQItem)
            ) : (
              <View style={styles.noResults}>
                <Ionicons name="search" size={48} color={colors.text.secondary} />
                <Text style={styles.noResultsText}>No FAQs found</Text>
                <Text style={styles.noResultsSubtext}>Try different search terms</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.emergencySection}>
          <View style={styles.emergencyHeader}>
            <Ionicons name="warning" size={24} color={colors.status.error} />
            <Text style={styles.emergencyTitle}>Emergency Support</Text>
          </View>
          <Text style={styles.emergencyText}>
            If you're experiencing urgent issues with your trades or account security, please contact our emergency hotline immediately.
          </Text>
          <TouchableOpacity 
            style={styles.emergencyButton}
            onPress={() => Linking.openURL('tel:+15551234911')}
          >
            <Text style={styles.emergencyButtonText}>📞 Emergency: +1 (555) 123-4911</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {renderContactModal()}
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
    padding: spacing[4],
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
    fontWeight: typography.weights.bold,
    marginBottom: spacing[4],
  },
  supportGrid: {
    gap: spacing[3],
  },
  supportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    padding: spacing[4],
    borderRadius: 12,
  },
  supportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  supportInfo: {
    flex: 1,
  },
  supportTitle: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
  },
  supportSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  supportAvailability: {
    fontSize: typography.sizes.xs,
    color: colors.primary[500],
    marginTop: 4,
    fontWeight: typography.weights.medium,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 8,
    marginBottom: spacing[3],
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing[2],
    fontSize: typography.sizes.base,
    color: colors.text.primary,
  },
  categoryFilter: {
    marginBottom: spacing[4],
  },
  filterChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.background.tertiary,
    borderRadius: 20,
    marginRight: spacing[2],
  },
  filterChipSelected: {
    backgroundColor: colors.primary[500],
  },
  filterChipText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  filterChipTextSelected: {
    color: colors.text.primary,
  },
  faqContainer: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 12,
    overflow: 'hidden',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
  },
  faqQuestion: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
    marginRight: spacing[2],
  },
  faqAnswer: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  noResults: {
    alignItems: 'center',
    padding: spacing[6],
  },
  noResultsText: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
    marginTop: spacing[2],
  },
  noResultsSubtext: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  emergencySection: {
    backgroundColor: colors.status.error + '20',
    borderRadius: 12,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.status.error + '40',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  emergencyTitle: {
    fontSize: typography.sizes.base,
    color: colors.status.error,
    fontWeight: typography.weights.bold,
    marginLeft: spacing[2],
  },
  emergencyText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing[3],
  },
  emergencyButton: {
    backgroundColor: colors.status.error,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: 8,
    alignItems: 'center',
  },
  emergencyButtonText: {
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
    fontWeight: typography.weights.bold,
  },
  modalCancel: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
  },
  modalSend: {
    fontSize: typography.sizes.base,
    color: colors.primary[500],
    fontWeight: typography.weights.semibold,
  },
  modalContent: {
    flex: 1,
    padding: spacing[4],
  },
  inputGroup: {
    marginBottom: spacing[4],
  },
  inputLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing[2],
  },
  textInput: {
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    padding: spacing[3],
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.background.secondary,
  },
  messageInput: {
    height: 120,
  },
  categoryScroll: {
    marginTop: spacing[2],
  },
  categoryChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.background.secondary,
    borderRadius: 20,
    marginRight: spacing[2],
  },
  categoryChipSelected: {
    backgroundColor: colors.primary[500],
  },
  categoryChipText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  categoryChipTextSelected: {
    color: colors.text.primary,
  },
  contactInfo: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 8,
    padding: spacing[4],
    marginTop: spacing[4],
  },
  contactInfoTitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing[2],
  },
  contactInfoText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
});

export default HelpSupportScreen;
