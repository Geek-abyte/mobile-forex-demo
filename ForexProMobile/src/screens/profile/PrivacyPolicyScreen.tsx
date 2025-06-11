import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing } from '../../theme';
import StandardHeader from '../../components/molecules/StandardHeader';

const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  // Privacy preferences state
  const [dataProcessing, setDataProcessing] = useState(true);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(true);
  const [thirdPartySharing, setThirdPartySharing] = useState(false);

  const privacyData = [
    {
      id: 'overview',
      title: 'Privacy Overview',
      content: `ForexPro Mobile is committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, store, and protect your data when you use our trading platform.

We are committed to transparency and giving you control over your personal information. This policy complies with GDPR, CCPA, and other applicable data protection regulations.

Key Principles:
• We only collect data necessary for our services
• Your data is never sold to third parties
• You have control over your privacy settings
• We use industry-standard security measures
• We are transparent about our data practices

Your privacy matters to us, and we work continuously to protect your personal information while providing you with the best trading experience.`
    },
    {
      id: 'collection',
      title: 'Information We Collect',
      content: `We collect different types of information to provide and improve our services:

Personal Information:
• Name, email address, phone number
• Date of birth and nationality
• Address and identity verification documents
• Financial information and trading experience
• Employment and income details

Technical Information:
• Device information (model, OS version, unique identifiers)
• IP address and geolocation data
• Browser type and version
• App usage patterns and preferences
• Log files and crash reports

Trading Data:
• Account balance and transaction history
• Trading positions and order history
• Risk management settings
• Market data access patterns
• Communication records

Third-Party Data:
• Information from identity verification services
• Credit and background checks (where required)
• Social media information (if you choose to connect)
• Referral and affiliate tracking data`
    },
    {
      id: 'usage',
      title: 'How We Use Your Information',
      content: `We use your information for legitimate business purposes:

Service Provision:
• Account creation and management
• Processing trades and transactions
• Providing customer support
• Sending service-related communications
• Risk management and fraud prevention

Legal and Regulatory Compliance:
• Know Your Customer (KYC) verification
• Anti-Money Laundering (AML) checks
• Regulatory reporting requirements
• Tax reporting obligations
• Legal process compliance

Platform Improvement:
• Analyzing usage patterns to improve features
• Personalizing your trading experience
• Developing new services and tools
• Performance optimization
• Security enhancements

Marketing (with consent):
• Promotional emails about new features
• Educational content and market insights
• Special offers and bonuses
• Newsletter subscriptions
• Event invitations

We never use your data for automated decision-making that significantly affects you without human oversight.`
    },
    {
      id: 'sharing',
      title: 'Information Sharing',
      content: `We may share your information in limited circumstances:

Service Providers:
• Payment processors for deposits and withdrawals
• Identity verification services
• Cloud hosting and data storage providers
• Customer support platforms
• Analytics and monitoring services

Regulatory Authorities:
• Financial regulators (CySEC, FCA, etc.)
• Tax authorities as required by law
• Law enforcement agencies when legally required
• Court orders and legal proceedings

Business Transfers:
• Mergers, acquisitions, or asset sales
• Bankruptcy or insolvency proceedings
• Corporate restructuring

With Your Consent:
• Third-party integrations you authorize
• Referral programs you participate in
• Social media sharing features

We NEVER:
• Sell your personal data to third parties
• Share data with unauthorized entities
• Use your data for purposes you haven't consented to
• Transfer data without appropriate safeguards`
    },
    {
      id: 'retention',
      title: 'Data Retention',
      content: `We retain your data for specific periods based on legal and business requirements:

Account Data:
• Active accounts: Retained while account is active
• Closed accounts: 7 years after closure (regulatory requirement)
• Identity documents: 5 years after relationship ends
• Transaction records: 7 years minimum

Communication Records:
• Customer support: 3 years
• Marketing communications: Until you unsubscribe
• Legal notices: Permanently for legal protection

Technical Data:
• Log files: 12 months
• Analytics data: 24 months
• Security logs: 6 months
• App usage data: 18 months

Special Circumstances:
• Legal holds: Extended as required
• Ongoing investigations: Until resolution
• Regulatory requests: As mandated
• Your specific requests: Accommodated where possible

Data Minimization:
We regularly review and delete data that is no longer necessary, ensuring we only retain what's needed for legitimate purposes.`
    },
    {
      id: 'security',
      title: 'Data Security',
      content: `We implement comprehensive security measures to protect your data:

Technical Safeguards:
• End-to-end encryption for data transmission
• AES-256 encryption for data at rest
• Secure data centers with physical access controls
• Regular security audits and penetration testing
• Multi-factor authentication requirements

Access Controls:
• Role-based access to personal data
• Regular access reviews and updates
• Employee background checks
• Confidentiality agreements for all staff
• Need-to-know data access principles

Monitoring and Response:
• 24/7 security monitoring
• Automated threat detection systems
• Incident response procedures
• Regular security training for employees
• Vulnerability management programs

Data Backup and Recovery:
• Encrypted backups in multiple locations
• Regular backup testing and validation
• Disaster recovery procedures
• Business continuity planning

Despite our security measures, no system is 100% secure. We recommend you also take precautions like using strong passwords and keeping your devices secure.`
    },
    {
      id: 'rights',
      title: 'Your Privacy Rights',
      content: `You have important rights regarding your personal data:

Access Rights:
• Request a copy of your personal data
• Understand how your data is being used
• Receive data in a machine-readable format
• Regular access to your account information

Correction and Update:
• Correct inaccurate personal information
• Update outdated information
• Complete incomplete data records
• Request verification of data accuracy

Deletion Rights:
• Request deletion of personal data (right to be forgotten)
• Subject to legal and regulatory retention requirements
• Automatic deletion after retention periods
• Secure deletion methods used

Control and Restriction:
• Object to specific data processing activities
• Restrict processing in certain circumstances
• Withdraw consent for optional data processing
• Opt-out of marketing communications

Data Portability:
• Receive your data in a structured format
• Transfer data to another service provider
• Automated data export tools available

How to Exercise Your Rights:
• Contact our Data Protection Officer
• Use in-app privacy controls
• Email privacy@forexpro.com
• Written requests to our registered address`
    },
    {
      id: 'cookies',
      title: 'Cookies & Tracking',
      content: `We use cookies and similar technologies to enhance your experience:

Essential Cookies:
• Authentication and security
• Session management
• Error reporting and debugging
• Core platform functionality
• Required for service operation

Performance Cookies:
• App performance monitoring
• Error tracking and diagnosis
• Load time optimization
• Feature usage analytics
• Server performance metrics

Functionality Cookies:
• User preference storage
• Language and regional settings
• Customization features
• Recently viewed instruments
• Notification preferences

Marketing Cookies (with consent):
• Advertising effectiveness measurement
• Personalized content delivery
• Campaign performance tracking
• Cross-platform user recognition
• Retargeting capabilities

Third-Party Cookies:
• Analytics providers (Google Analytics)
• Customer support platforms
• Payment processors
• Social media integrations
• CDN providers

Cookie Management:
You can control cookies through your device settings, but some features may not work properly if you disable essential cookies.`
    },
    {
      id: 'international',
      title: 'International Transfers',
      content: `Your data may be transferred internationally for processing:

Transfer Locations:
• European Union (primary data centers)
• United States (cloud services)
• United Kingdom (regulatory compliance)
• Other jurisdictions as needed for service provision

Legal Basis for Transfers:
• Adequacy decisions by European Commission
• Standard Contractual Clauses (SCCs)
• Binding Corporate Rules
• Your explicit consent where required
• Necessity for contract performance

Safeguards in Place:
• EU-approved transfer mechanisms
• Contractual protection requirements
• Regular compliance monitoring
• Data localization where required by law
• Vendor due diligence processes

Your Rights for International Transfers:
• Information about transfer destinations
• Copies of safeguard measures
• Objection rights where applicable
• Complaint procedures through supervisory authorities

We ensure all international data transfers maintain the same level of protection as required in your home jurisdiction.`
    },
    {
      id: 'updates',
      title: 'Policy Updates',
      content: `We may update this Privacy Policy periodically:

When We Update:
• Changes in legal requirements
• New service features or functionality
• Feedback from users and stakeholders
• Industry best practice evolution
• Regulatory guidance updates

How We Notify You:
• Email notification to registered address
• In-app notifications and alerts
• Website banner announcements
• Push notifications for significant changes
• Account message center updates

Your Options:
• Review changes and ask questions
• Update your privacy preferences
• Object to new processing activities
• Close your account if you disagree
• Contact us for clarification

Previous Versions:
• Archived versions available on request
• Change history documentation
• Implementation dates for updates
• Grandfathering provisions where applicable

Effective Date:
This Privacy Policy was last updated on December 15, 2024, and becomes effective immediately upon posting.`
    }
  ];

  const lastUpdated = 'December 15, 2024';
  const version = '2.8';

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const handlePrivacyPreferences = () => {
    Alert.alert(
      'Privacy Preferences Updated',
      'Your privacy preferences have been saved. Some changes may require app restart to take effect.',
      [{ text: 'OK' }]
    );
  };

  const handleDataRequest = () => {
    Alert.alert(
      'Data Request',
      'Choose the type of data request you want to make:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Download My Data', onPress: () => Alert.alert('Data Export', 'Your data export will be emailed within 48 hours.') },
        { text: 'Delete My Data', style: 'destructive', onPress: () => Alert.alert('Data Deletion', 'Please contact support to initiate data deletion.') }
      ]
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
        title="Privacy Policy"
        showBackButton
        onBackPress={() => navigation.goBack()}
        rightActions={[
          <TouchableOpacity
            key="preferences"
            onPress={handleDataRequest}
            style={styles.headerButton}
          >
            <Ionicons name="settings-outline" size={20} color={colors.primary[500]} />
          </TouchableOpacity>
        ]}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Privacy Policy</Text>
          <View style={styles.versionInfo}>
            <Text style={styles.versionText}>Version {version}</Text>
            <Text style={styles.lastUpdated}>Last updated: {lastUpdated}</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Ionicons name="shield-checkmark" size={24} color={colors.primary[500]} />
            <Text style={styles.summaryTitle}>Privacy Summary</Text>
          </View>
          <Text style={styles.summaryText}>
            We collect minimal data necessary to provide our trading services, never sell your information, 
            and give you full control over your privacy settings. Your data is protected with bank-level security.
          </Text>
        </View>

        <View style={styles.preferencesCard}>
          <Text style={styles.preferencesTitle}>Your Privacy Preferences</Text>
          
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceLabel}>Data Processing</Text>
              <Text style={styles.preferenceDescription}>Essential for account operation</Text>
            </View>
            <Switch
              value={dataProcessing}
              onValueChange={setDataProcessing}
              disabled={true}
              trackColor={{ false: colors.background.secondary, true: colors.primary[300] }}
              thumbColor={dataProcessing ? colors.primary[500] : colors.text.secondary}
            />
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceLabel}>Marketing Communications</Text>
              <Text style={styles.preferenceDescription}>Promotional emails and offers</Text>
            </View>
            <Switch
              value={marketingConsent}
              onValueChange={setMarketingConsent}
              trackColor={{ false: colors.background.secondary, true: colors.primary[300] }}
              thumbColor={marketingConsent ? colors.primary[500] : colors.text.secondary}
            />
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceLabel}>Analytics & Performance</Text>
              <Text style={styles.preferenceDescription}>Help improve our services</Text>
            </View>
            <Switch
              value={analyticsConsent}
              onValueChange={setAnalyticsConsent}
              trackColor={{ false: colors.background.secondary, true: colors.primary[300] }}
              thumbColor={analyticsConsent ? colors.primary[500] : colors.text.secondary}
            />
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceLabel}>Third-Party Data Sharing</Text>
              <Text style={styles.preferenceDescription}>Share with approved partners</Text>
            </View>
            <Switch
              value={thirdPartySharing}
              onValueChange={setThirdPartySharing}
              trackColor={{ false: colors.background.secondary, true: colors.primary[300] }}
              thumbColor={thirdPartySharing ? colors.primary[500] : colors.text.secondary}
            />
          </View>

          <TouchableOpacity style={styles.savePreferencesButton} onPress={handlePrivacyPreferences}>
            <Text style={styles.savePreferencesText}>Save Preferences</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dataRightsCard}>
          <Text style={styles.dataRightsTitle}>Your Data Rights</Text>
          <TouchableOpacity style={styles.dataRightItem} onPress={handleDataRequest}>
            <Ionicons name="download-outline" size={20} color={colors.primary[500]} />
            <Text style={styles.dataRightText}>Download My Data</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.dataRightItem} 
            onPress={() => Alert.alert('Correction Request', 'Please contact support to request data corrections.')}
          >
            <Ionicons name="create-outline" size={20} color={colors.primary[500]} />
            <Text style={styles.dataRightText}>Correct My Data</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.dataRightItem} 
            onPress={() => Alert.alert('Data Deletion', 'Contact support to request data deletion. This may result in account closure.')}
          >
            <Ionicons name="trash-outline" size={20} color={colors.status.error} />
            <Text style={[styles.dataRightText, { color: colors.status.error }]}>Delete My Data</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionsContainer}>
          {privacyData.map(renderSection)}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Questions About Privacy?</Text>
          <Text style={styles.footerText}>
            Contact our Data Protection Officer at privacy@forexpro.com or reach out to customer support.
          </Text>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => Alert.alert('Contact DPO', 'Email: privacy@forexpro.com\nPhone: +1 (555) 123-4567')}
          >
            <Text style={styles.contactButtonText}>Contact Privacy Team</Text>
          </TouchableOpacity>
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
  summaryCard: {
    backgroundColor: colors.primary[500] + '20',
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[6],
    borderWidth: 1,
    borderColor: colors.primary[300],
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  summaryTitle: {
    fontSize: typography.sizes.base,
    color: colors.primary[500],
    fontWeight: typography.weights.bold,
    marginLeft: spacing[2],
  },
  summaryText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  preferencesCard: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[6],
  },
  preferencesTitle: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    fontWeight: typography.weights.bold,
    marginBottom: spacing[4],
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary,
  },
  preferenceInfo: {
    flex: 1,
    marginRight: spacing[3],
  },
  preferenceLabel: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
  },
  preferenceDescription: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  savePreferencesButton: {
    backgroundColor: colors.primary[500],
    borderRadius: 8,
    paddingVertical: spacing[3],
    alignItems: 'center',
    marginTop: spacing[4],
  },
  savePreferencesText: {
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
  dataRightsCard: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[6],
  },
  dataRightsTitle: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    fontWeight: typography.weights.bold,
    marginBottom: spacing[4],
  },
  dataRightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary,
  },
  dataRightText: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
    flex: 1,
    marginLeft: spacing[3],
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
    marginBottom: spacing[6],
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
});

export default PrivacyPolicyScreen;
