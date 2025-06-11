import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing } from '../../theme';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

interface ErrorFallbackProps {
  error?: Error;
  errorInfo?: React.ErrorInfo;
  onRetry: () => void;
  onReport: () => void;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });
    
    // Log error to crash reporting service
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error: Error, errorInfo: React.ErrorInfo) => {
    // In production, you would send this to a crash reporting service
    console.error('Error caught by boundary:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReport = () => {
    // In production, this would open a bug report or send feedback
    console.log('Error reported by user');
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
          onReport={this.handleReport}
        />
      );
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  onRetry,
  onReport,
}) => {
  const isDevelopment = __DEV__;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary]}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="warning-outline" size={64} color={colors.trading.loss} />
          </View>
          
          <Text style={styles.title}>Oops! Something went wrong</Text>
          <Text style={styles.subtitle}>
            We're sorry for the inconvenience. The app encountered an unexpected error.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={onRetry}>
              <LinearGradient
                colors={[colors.primary[500], colors.secondary[500]]}
                style={styles.buttonGradient}
              >
                <Ionicons name="refresh-outline" size={20} color={colors.text.primary} />
                <Text style={styles.primaryButtonText}>Try Again</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={onReport}>
              <Text style={styles.secondaryButtonText}>
                <Ionicons name="bug-outline" size={16} color={colors.text.secondary} />
                {' '}Report Issue
              </Text>
            </TouchableOpacity>
          </View>

          {isDevelopment && error && (
            <View style={styles.debugInfo}>
              <Text style={styles.debugTitle}>Debug Information</Text>
              <View style={styles.debugContainer}>
                <Text style={styles.debugLabel}>Error:</Text>
                <Text style={styles.debugText}>{error.message}</Text>
                
                {error.stack && (
                  <>
                    <Text style={styles.debugLabel}>Stack Trace:</Text>
                    <ScrollView style={styles.stackTrace} horizontal>
                      <Text style={styles.debugText}>{error.stack}</Text>
                    </ScrollView>
                  </>
                )}
                
                {errorInfo && errorInfo.componentStack && (
                  <>
                    <Text style={styles.debugLabel}>Component Stack:</Text>
                    <ScrollView style={styles.stackTrace} horizontal>
                      <Text style={styles.debugText}>{errorInfo.componentStack}</Text>
                    </ScrollView>
                  </>
                )}
              </View>
            </View>
          )}

          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Troubleshooting Tips:</Text>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color={colors.primary[500]} />
              <Text style={styles.tipText}>Check your internet connection</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color={colors.primary[500]} />
              <Text style={styles.tipText}>Close and restart the app</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color={colors.primary[500]} />
              <Text style={styles.tipText}>Update to the latest version</Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

// Network Error Component
export const NetworkErrorFallback: React.FC<{
  onRetry: () => void;
  message?: string;
}> = ({ onRetry, message = "Network connection failed" }) => (
  <View style={styles.networkErrorContainer}>
    <Ionicons name="wifi-outline" size={48} color={colors.text.secondary} />
    <Text style={styles.networkErrorTitle}>Connection Problem</Text>
    <Text style={styles.networkErrorMessage}>{message}</Text>
    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
      <Text style={styles.retryButtonText}>Retry</Text>
    </TouchableOpacity>
  </View>
);

// Loading Error Component
export const LoadingErrorFallback: React.FC<{
  onRetry: () => void;
  message?: string;
}> = ({ onRetry, message = "Failed to load data" }) => (
  <View style={styles.loadingErrorContainer}>
    <Ionicons name="reload-outline" size={48} color={colors.text.secondary} />
    <Text style={styles.loadingErrorTitle}>Loading Failed</Text>
    <Text style={styles.loadingErrorMessage}>{message}</Text>
    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
      <Text style={styles.retryButtonText}>Try Again</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  iconContainer: {
    marginBottom: spacing[6],
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[3],
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing[8],
  },
  buttonContainer: {
    width: '100%',
    gap: spacing[4],
    marginBottom: spacing[8],
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[6],
  },
  primaryButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginLeft: spacing[2],
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  secondaryButtonText: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
  },
  debugInfo: {
    width: '100%',
    marginTop: spacing[6],
  },
  debugTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.trading.warning,
    marginBottom: spacing[4],
  },
  debugContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: spacing[4],
  },
  debugLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginTop: spacing[3],
    marginBottom: spacing[1],
  },
  debugText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontFamily: 'monospace',
  },
  stackTrace: {
    maxHeight: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 4,
    padding: spacing[2],
  },
  tipsContainer: {
    width: '100%',
    marginTop: spacing[6],
  },
  tipsTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  tipText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginLeft: spacing[2],
  },
  networkErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  networkErrorTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  networkErrorMessage: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  loadingErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  loadingErrorTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  loadingErrorMessage: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  retryButton: {
    backgroundColor: colors.primary[500],
    borderRadius: 8,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
  },
  retryButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
});

export default ErrorBoundary;
