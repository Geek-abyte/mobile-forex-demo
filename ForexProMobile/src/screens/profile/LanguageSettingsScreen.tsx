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

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isRTL?: boolean;
}

const LanguageSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');

  const languages: Language[] = [
    { code: 'en-US', name: 'English (US)', nativeName: 'English', flag: '🇺🇸' },
    { code: 'en-GB', name: 'English (UK)', nativeName: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', flag: '🇧🇷' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
    { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
    { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', isRTL: true },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
    { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
    { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
    { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
    { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮' },
    { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
    { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿' },
    { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', flag: '🇸🇰' },
    { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺' },
    { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴' },
    { code: 'bg', name: 'Bulgarian', nativeName: 'Български', flag: '🇧🇬' },
    { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', flag: '🇭🇷' },
    { code: 'sr', name: 'Serbian', nativeName: 'Српски', flag: '🇷🇸' },
    { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
    { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', isRTL: true },
    { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷', isRTL: true },
  ];

  const popularLanguages = languages.filter(lang => 
    ['en-US', 'es', 'fr', 'de', 'zh-CN', 'ja', 'ar', 'hi'].includes(lang.code)
  );

  const otherLanguages = languages.filter(lang => 
    !['en-US', 'es', 'fr', 'de', 'zh-CN', 'ja', 'ar', 'hi'].includes(lang.code)
  );

  const handleLanguageSelect = (languageCode: string) => {
    Alert.alert(
      'Change Language',
      `Are you sure you want to change the language? The app will restart to apply the changes.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Change', 
          onPress: () => {
            setSelectedLanguage(languageCode);
            Alert.alert(
              'Language Changed',
              'The language has been changed successfully. Please restart the app to see the changes.',
              [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
          }
        }
      ]
    );
  };

  const renderLanguageItem = (language: Language) => (
    <TouchableOpacity
      key={language.code}
      style={styles.languageItem}
      onPress={() => handleLanguageSelect(language.code)}
    >
      <View style={styles.languageLeft}>
        <Text style={styles.flag}>{language.flag}</Text>
        <View style={styles.languageInfo}>
          <Text style={styles.languageName}>{language.name}</Text>
          <Text style={[
            styles.nativeName,
            language.isRTL && styles.rtlText
          ]}>
            {language.nativeName}
          </Text>
        </View>
      </View>
      
      <View style={styles.languageRight}>
        {selectedLanguage === language.code && (
          <Ionicons name="checkmark-circle" size={24} color={colors.primary[500]} />
        )}
        {language.isRTL && (
          <View style={styles.rtlBadge}>
            <Text style={styles.rtlBadgeText}>RTL</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderLanguageSection = (title: string, languages: Language[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {languages.map(renderLanguageItem)}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StandardHeader 
        title="Language"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.currentLanguageCard}>
          <Text style={styles.currentLanguageTitle}>Current Language</Text>
          {(() => {
            const current = languages.find(lang => lang.code === selectedLanguage);
            return current ? (
              <View style={styles.currentLanguageInfo}>
                <Text style={styles.currentFlag}>{current.flag}</Text>
                <View>
                  <Text style={styles.currentLanguageName}>{current.name}</Text>
                  <Text style={[
                    styles.currentNativeName,
                    current.isRTL && styles.rtlText
                  ]}>
                    {current.nativeName}
                  </Text>
                </View>
              </View>
            ) : null;
          })()}
        </View>

        {renderLanguageSection('Popular Languages', popularLanguages)}
        {renderLanguageSection('Other Languages', otherLanguages)}

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle-outline" size={24} color={colors.primary[500]} />
            <Text style={styles.infoTitle}>Language Information</Text>
          </View>
          <Text style={styles.infoText}>
            • Changing the language will restart the application
          </Text>
          <Text style={styles.infoText}>
            • RTL languages will change the app layout direction
          </Text>
          <Text style={styles.infoText}>
            • Not all languages may be fully translated
          </Text>
          <Text style={styles.infoText}>
            • Regional formats (dates, numbers) will also change
          </Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.feedbackButton}
            onPress={() => Alert.alert(
              'Translation Feedback',
              'Thank you for your interest in improving our translations! Please contact support@forexpro.com with your feedback.'
            )}
          >
            <Ionicons name="chatbubble-outline" size={20} color={colors.primary[500]} />
            <Text style={styles.feedbackText}>Help Improve Translations</Text>
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
  currentLanguageCard: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[6],
    borderWidth: 2,
    borderColor: colors.primary[300],
  },
  currentLanguageTitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing[3],
  },
  currentLanguageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentFlag: {
    fontSize: 32,
    marginRight: spacing[3],
  },
  currentLanguageName: {
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
    fontWeight: typography.weights.bold,
  },
  currentNativeName: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    marginTop: 2,
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
    fontWeight: typography.weights.bold,
    marginBottom: spacing[3],
  },
  sectionContent: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 12,
    overflow: 'hidden',
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary,
  },
  languageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flag: {
    fontSize: 24,
    marginRight: spacing[3],
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
  },
  nativeName: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  rtlText: {
    textAlign: 'right',
  },
  languageRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  rtlBadge: {
    backgroundColor: colors.status.warning,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 4,
  },
  rtlBadgeText: {
    fontSize: typography.sizes.xs,
    color: colors.text.primary,
    fontWeight: typography.weights.bold,
  },
  infoCard: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[6],
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  infoTitle: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
    marginLeft: spacing[2],
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing[2],
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: spacing[6],
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary[300],
  },
  feedbackText: {
    fontSize: typography.sizes.sm,
    color: colors.primary[500],
    fontWeight: typography.weights.semibold,
    marginLeft: spacing[2],
  },
});

export default LanguageSettingsScreen;
