import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '@expo/vector-icons/MaterialIcons';
import { colors, typography, spacing } from '../../theme';
import { useAuth } from '../../hooks/useAuth';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('demo@forexpro.com');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAuth();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Stagger animations for smooth entrance
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
      ]),
    ]).start();
  }, []);

  const handleLogin = async () => {
    try {
      await login({ email, password });
    } catch (err) {
      Alert.alert('Login Failed', 'Please check your credentials and try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LinearGradient
          colors={[colors.background.primary, colors.background.secondary, colors.background.primary]}
          style={styles.gradient}
        >
          <ScrollView 
            style={styles.scrollView} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Animated.View 
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim },
                    { scale: scaleAnim }
                  ]
                }
              ]}
            >
              {/* Brand Section */}
              <View style={styles.brandSection}>
                <View style={styles.logoContainer}>
                  <LinearGradient
                    colors={[colors.primary[500], colors.primary[400]]}
                    style={styles.logoGradient}
                  >
                    <Icon name="trending-up" size={48} color={colors.text.inverse} />
                  </LinearGradient>
                </View>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to your ForexPro account</Text>
              </View>

              {/* Login Form */}
              <View style={styles.form}>
                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <View style={styles.inputWrapper}>
                    <Icon name="email" size={20} color={colors.text.tertiary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, styles.inputWithIcon]}
                      placeholder="Enter your email"
                      placeholderTextColor={colors.input.placeholder}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.inputWrapper}>
                    <Icon name="lock" size={20} color={colors.text.tertiary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, styles.inputWithIcon]}
                      placeholder="Enter your password"
                      placeholderTextColor={colors.input.placeholder}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoComplete="password"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      <Icon
                        name={showPassword ? 'visibility' : 'visibility-off'}
                        size={20}
                        color={colors.text.tertiary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Error Message */}
                {error && (
                  <View style={styles.errorContainer}>
                    <Icon name="error-outline" size={20} color={colors.status.error} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                {/* Demo Notice */}
                <View style={styles.demoNotice}>
                  <Icon name="info-outline" size={16} color={colors.primary[400]} />
                  <Text style={styles.demoText}>
                    Demo credentials are pre-filled. Tap "Sign In" to continue.
                  </Text>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  style={[styles.loginButton, isLoading && styles.disabledButton]}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={isLoading ? [colors.text.tertiary, colors.text.tertiary] : [colors.primary[500], colors.primary[400]]}
                    style={styles.buttonGradient}
                  >
                    {isLoading ? (
                      <>
                        <ActivityIndicator color={colors.text.inverse} size="small" />
                        <Text style={styles.buttonText}>Signing In...</Text>
                      </>
                    ) : (
                      <>
                        <Text style={styles.buttonText}>Sign In</Text>
                        <Icon name="arrow-forward" size={20} color={colors.text.inverse} />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Forgot Password */}
                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
                </TouchableOpacity>

                {/* Register Link */}
                <View style={styles.registerContainer}>
                  <Text style={styles.registerText}>Don't have an account? </Text>
                  <TouchableOpacity>
                    <Text style={styles.registerLink}>Create Account</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardContainer: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: '100%',
  },
  content: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[8],
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: spacing[10],
  },
  logoContainer: {
    marginBottom: spacing[6],
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: typography.sizes['3xl'],
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.primary[500],
    marginBottom: spacing[3],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.regular,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  form: {
    gap: spacing[6],
  },
  inputContainer: {
    gap: spacing[2],
  },
  inputLabel: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    height: 56,
    backgroundColor: colors.input.background,
    borderRadius: 12,
    paddingHorizontal: spacing[4],
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.input.border,
  },
  inputWithIcon: {
    paddingLeft: 50,
  },
  inputIcon: {
    position: 'absolute',
    left: spacing[4],
    top: 18,
    zIndex: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: spacing[4],
    top: 18,
    zIndex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.status.error + '20',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.status.error,
  },
  errorText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.status.error,
  },
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.primary[500] + '20',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[400],
  },
  demoText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.primary[400],
    fontStyle: 'italic',
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: spacing[4],
  },
  buttonGradient: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  buttonText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.text.inverse,
  },
  disabledButton: {
    opacity: 0.6,
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: spacing[4],
  },
  forgotPasswordText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    color: colors.primary[400],
    fontWeight: typography.weights.medium,
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[6],
  },
  registerText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
  },
  registerLink: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.primary[500],
  },
});

export default LoginScreen;
