import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing } from '../../theme';
import StandardHeader from '../../components/molecules/StandardHeader';

const TermsConditionsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const termsData = [
    {
      id: 'overview',
      title: 'Overview & Acceptance',
      content: `Welcome to ForexPro Mobile. By accessing or using our trading platform, you agree to be bound by these Terms and Conditions. These terms constitute a legally binding agreement between you and ForexPro Ltd.

If you do not agree with any part of these terms, you must not use our services. Your continued use of the platform signifies your acceptance of any changes to these terms.

ForexPro Mobile is a comprehensive trading platform offering access to forex, stocks, commodities, and cryptocurrency markets. We are committed to providing a secure, reliable, and user-friendly trading experience.`
    },
    {
      id: 'eligibility',
      title: 'Eligibility & Account Requirements',
      content: `To use ForexPro Mobile, you must:

• Be at least 18 years of age or the age of majority in your jurisdiction
• Have the legal capacity to enter into binding agreements
• Not be a resident of restricted jurisdictions (see our website for current list)
• Provide accurate, complete, and current information during registration
• Maintain the confidentiality of your account credentials

Account Registration:
- Each user may maintain only one account
- You are responsible for all activities under your account
- Account verification may be required for certain services
- We reserve the right to refuse or terminate accounts at our discretion`
    },
    {
      id: 'services',
      title: 'Trading Services & Instruments',
      content: `ForexPro Mobile provides access to various financial instruments:

Forex Trading:
- Major, minor, and exotic currency pairs
- Competitive spreads starting from 0.1 pips
- Leverage up to 1:500 (subject to regulation)

Stock Trading:
- Access to major global exchanges
- Commission-based pricing structure
- Real-time market data and analytics

Cryptocurrency:
- 24/7 trading availability
- Major cryptocurrencies and altcoins
- Secure digital asset custody

Commodities:
- Precious metals, energy, and agricultural products
- CFD trading with flexible lot sizes

All trading involves substantial risk of loss and may not be suitable for all investors.`
    },
    {
      id: 'risks',
      title: 'Risk Disclosure',
      content: `Trading financial instruments carries significant risk:

Market Risk:
- Prices can move against your position rapidly
- Past performance does not guarantee future results
- Markets can be volatile and unpredictable

Leverage Risk:
- Amplifies both profits and losses
- You can lose more than your initial investment
- Margin calls may require additional funds

Technology Risk:
- Platform interruptions may occur
- Internet connectivity issues can affect trading
- System maintenance may temporarily limit access

Currency Risk:
- Exchange rate fluctuations affect international trading
- Base currency conversions may impact returns

You should only trade with money you can afford to lose and ensure you understand the risks involved.`
    },
    {
      id: 'fees',
      title: 'Fees & Charges',
      content: `Our fee structure is transparent and competitive:

Trading Fees:
- Forex: Spread-based pricing from 0.1 pips
- Stocks: Commission from 0.1% per trade
- Crypto: 0.25% trading fee
- Commodities: Variable spreads

Account Fees:
- No account opening or maintenance fees
- Overnight financing charges may apply
- Currency conversion fees for multi-currency accounts

Deposit/Withdrawal Fees:
- Most deposits are free of charge
- Withdrawal fees vary by payment method
- Third-party fees may apply for some methods

Inactivity Fee:
- €10 monthly fee after 12 months of inactivity
- Waived for accounts with balance below €100

All fees are clearly displayed before transaction confirmation.`
    },
    {
      id: 'responsibilities',
      title: 'User Responsibilities',
      content: `As a ForexPro Mobile user, you agree to:

Account Security:
- Keep login credentials confidential
- Use strong, unique passwords
- Enable two-factor authentication
- Report unauthorized access immediately

Compliance:
- Comply with all applicable laws and regulations
- Not engage in market manipulation or abuse
- Provide accurate information and documentation
- Report changes to personal circumstances

Prohibited Activities:
- Money laundering or terrorist financing
- Trading on behalf of third parties without authorization
- Using automated trading systems without permission
- Attempting to manipulate prices or exploit system vulnerabilities

Information Accuracy:
- Ensure all provided information is current and correct
- Update personal details promptly when changes occur
- Verify transaction details before confirmation`
    },
    {
      id: 'privacy',
      title: 'Privacy & Data Protection',
      content: `We are committed to protecting your privacy:

Data Collection:
- Personal information for account verification
- Trading data to provide our services
- Technical data to improve platform performance
- Communication preferences and history

Data Usage:
- Service provision and account management
- Regulatory compliance and reporting
- Risk management and fraud prevention
- Customer support and communication

Data Sharing:
- With regulatory authorities as required
- With service providers under strict confidentiality
- With affiliates for legitimate business purposes
- Never sold to third parties for marketing

Your Rights:
- Access to your personal data
- Correction of inaccurate information
- Data portability where applicable
- Deletion requests subject to legal requirements

See our Privacy Policy for complete details.`
    },
    {
      id: 'termination',
      title: 'Account Termination',
      content: `Account termination may occur under various circumstances:

User-Initiated Termination:
- You may close your account at any time
- Outstanding positions must be closed first
- Withdrawal of remaining funds may take 5-10 business days
- Account history remains accessible for regulatory periods

Company-Initiated Termination:
- Violation of these terms or applicable laws
- Suspicious or fraudulent activity
- Extended period of inactivity
- Regulatory requirements

Termination Process:
- Written notice will be provided when possible
- Open positions may be closed at current market prices
- Funds will be returned to verified payment methods
- Account access will be suspended immediately

Post-Termination:
- Certain provisions survive termination
- Historical data may be retained for compliance
- Outstanding obligations remain enforceable`
    },
    {
      id: 'legal',
      title: 'Legal & Regulatory',
      content: `Important legal considerations:

Governing Law:
- These terms are governed by the laws of Cyprus
- Disputes subject to Cyprus court jurisdiction
- EU regulatory framework compliance
- MiFID II investor protection rules

Regulatory Authorization:
- ForexPro Ltd is authorized by CySEC (License #123456)
- Member of the Investor Compensation Fund
- Segregated client funds protection
- Regular regulatory audits and reporting

Dispute Resolution:
- Internal complaints procedure available
- External dispute resolution through Financial Ombudsman
- Class action waivers where legally permissible
- Arbitration clauses for certain disputes

Liability Limitations:
- Limited liability for platform interruptions
- No liability for market movements or third-party actions
- Maximum liability capped at account balance
- Force majeure event exclusions

These terms may be updated periodically with advance notice.`
    }
  ];

  const lastUpdated = 'December 15, 2024';
  const version = '3.2';

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const handleDownloadPDF = () => {
    Alert.alert(
      'Download Terms',
      'A PDF version of our Terms & Conditions will be emailed to your registered address.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send PDF', onPress: () => Alert.alert('PDF Sent', 'Check your email for the PDF document.') }
      ]
    );
  };

  const handlePrintTerms = () => {
    Alert.alert(
      'Print Terms',
      'Print functionality is not available in the mobile app. Please download the PDF version or visit our website.',
      [{ text: 'OK' }]
    );
  };

  const renderSection = (section: any) => (
    <TouchableOpacity
      key={section.id}
      style={styles.sectionContainer}
      onPress={() => toggleSection(section.id)}
    >
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <Ionicons 
          name={expandedSection === section.id ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color={colors.text.secondary} 
        />
      </View>
      {expandedSection === section.id && (
        <View style={styles.sectionContent}>
          <Text style={styles.sectionText}>{section.content}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StandardHeader 
        title="Terms & Conditions"
        showBackButton
        onBackPress={() => navigation.goBack()}
        rightActions={[
          <TouchableOpacity
            key="download"
            onPress={handleDownloadPDF}
            style={styles.headerButton}
          >
            <Ionicons name="download-outline" size={20} color={colors.primary[500]} />
          </TouchableOpacity>
        ]}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Terms & Conditions</Text>
          <View style={styles.versionInfo}>
            <Text style={styles.versionText}>Version {version}</Text>
            <Text style={styles.lastUpdated}>Last updated: {lastUpdated}</Text>
          </View>
        </View>

        <View style={styles.importantNotice}>
          <View style={styles.noticeHeader}>
            <Ionicons name="warning" size={24} color={colors.status.warning} />
            <Text style={styles.noticeTitle}>Important Notice</Text>
          </View>
          <Text style={styles.noticeText}>
            Please read these terms carefully before using ForexPro Mobile. 
            By creating an account or using our services, you agree to be bound by these terms.
            Trading involves substantial risk and may not be suitable for all investors.
          </Text>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={handleDownloadPDF}>
            <Ionicons name="download" size={20} color={colors.primary[500]} />
            <Text style={styles.quickActionText}>Download PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={handlePrintTerms}>
            <Ionicons name="print" size={20} color={colors.primary[500]} />
            <Text style={styles.quickActionText}>Print</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => Alert.alert('Contact Legal', 'For legal questions, please contact legal@forexpro.com')}
          >
            <Ionicons name="help-circle" size={20} color={colors.primary[500]} />
            <Text style={styles.quickActionText}>Legal Help</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionsContainer}>
          {termsData.map(renderSection)}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Need Help?</Text>
          <Text style={styles.footerText}>
            If you have questions about these terms, please contact our legal team at legal@forexpro.com
            or reach out to customer support.
          </Text>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => navigation.navigate('HelpSupport' as never)}
          >
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.acknowledgment}>
          <Text style={styles.acknowledgmentText}>
            By continuing to use ForexPro Mobile, you acknowledge that you have read, 
            understood, and agree to be bound by these Terms & Conditions.
          </Text>
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
  content: {
    flex: 1,
    padding: spacing[4],
  },
  headerButton: {
    padding: spacing[2],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  title: {
    fontSize: typography.sizes['2xl'],
    color: colors.text.primary,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  versionInfo: {
    alignItems: 'center',
  },
  versionText: {
    fontSize: typography.sizes.sm,
    color: colors.primary[500],
    fontWeight: typography.weights.semibold,
  },
  lastUpdated: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  importantNotice: {
    backgroundColor: colors.status.warning + '20',
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[6],
    borderWidth: 1,
    borderColor: colors.status.warning + '40',
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  noticeTitle: {
    fontSize: typography.sizes.base,
    color: colors.status.warning,
    fontWeight: typography.weights.bold,
    marginLeft: spacing[2],
  },
  noticeText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.background.tertiary,
    borderRadius: 12,
    paddingVertical: spacing[3],
    marginBottom: spacing[6],
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionText: {
    fontSize: typography.sizes.xs,
    color: colors.primary[500],
    fontWeight: typography.weights.semibold,
    marginTop: spacing[1],
  },
  sectionsContainer: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: spacing[6],
  },
  sectionContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
  },
  sectionTitle: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
    flex: 1,
    marginRight: spacing[2],
  },
  sectionContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
  },
  sectionText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  footer: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[4],
    alignItems: 'center',
  },
  footerTitle: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    fontWeight: typography.weights.bold,
    marginBottom: spacing[2],
  },
  footerText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing[4],
  },
  contactButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    borderRadius: 8,
  },
  contactButtonText: {
    color: colors.text.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  acknowledgment: {
    backgroundColor: colors.primary[500] + '20',
    borderRadius: 8,
    padding: spacing[4],
    marginBottom: spacing[6],
    borderWidth: 1,
    borderColor: colors.primary[300],
  },
  acknowledgmentText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
  },
});

export default TermsConditionsScreen;
