import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, typography, spacing } from '../../theme';
import { p2pService, P2PTrade, P2PMessage } from '../../services/p2pService';

const { width } = Dimensions.get('window');

const P2PTradeChat: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { tradeId } = route.params as { tradeId: string };
  
  const [trade, setTrade] = useState<P2PTrade | null>(null);
  const [messages, setMessages] = useState<P2PMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const currentUser = p2pService.getCurrentUser();

  useEffect(() => {
    loadTradeData();
    const interval = setInterval(loadTradeData, 3000); // Refresh every 3 seconds
    return () => clearInterval(interval);
  }, [tradeId]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const loadTradeData = async () => {
    try {
      const tradeData = await p2pService.getTradeById(tradeId);
      if (tradeData) {
        setTrade(tradeData);
        setMessages(tradeData.messages);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load trade data:', error);
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !trade) return;

    try {
      await p2pService.sendMessage(tradeId, newMessage.trim());
      setNewMessage('');
      await loadTradeData();
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const confirmPayment = async () => {
    if (!trade) return;

    Alert.alert(
      'Confirm Payment',
      'Have you sent the payment to the seller? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'default',
          onPress: async () => {
            try {
              await p2pService.confirmPayment(tradeId);
              await loadTradeData();
            } catch (error) {
              Alert.alert('Error', 'Failed to confirm payment');
            }
          },
        },
      ]
    );
  };

  const confirmReceipt = async () => {
    if (!trade) return;

    Alert.alert(
      'Confirm Receipt',
      'Have you received the payment? This will release the funds from escrow.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'default',
          onPress: async () => {
            try {
              await p2pService.confirmReceipt(tradeId);
              await loadTradeData();
              Alert.alert('Success', 'Trade completed successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to confirm receipt');
            }
          },
        },
      ]
    );
  };

  const cancelTrade = async () => {
    if (!trade) return;

    Alert.prompt(
      'Cancel Trade',
      'Please provide a reason for cancelling this trade:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: async (reason) => {
            try {
              await p2pService.cancelTrade(tradeId, reason || 'No reason provided');
              await loadTradeData();
              Alert.alert('Trade Cancelled', 'The trade has been cancelled successfully.');
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel trade');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return colors.status.warning;
      case 'payment_sent': return colors.status.info;
      case 'payment_confirmed': return colors.status.success;
      case 'completed': return colors.status.success;
      case 'cancelled': return colors.status.error;
      case 'disputed': return colors.status.error;
      default: return colors.text.secondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Waiting for Payment';
      case 'payment_sent': return 'Payment Sent';
      case 'payment_confirmed': return 'Payment Confirmed';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'disputed': return 'Disputed';
      default: return status;
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const formatTimeLeft = (expiresAt: Date) => {
    const now = new Date();
    const timeLeft = new Date(expiresAt).getTime() - now.getTime();
    
    if (timeLeft <= 0) return 'Expired';
    
    const minutes = Math.floor(timeLeft / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m left`;
    }
    return `${minutes}m left`;
  };

  const MessageBubble: React.FC<{ message: P2PMessage }> = ({ message }) => {
    const isCurrentUser = message.senderId === currentUser.id;
    const isSystem = message.type === 'system';

    if (isSystem) {
      return (
        <View style={styles.systemMessage}>
          <Text style={styles.systemMessageText}>{message.message}</Text>
          <Text style={styles.messageTime}>{formatTime(message.timestamp)}</Text>
        </View>
      );
    }

    return (
      <View style={[
        styles.messageBubble,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
      ]}>
        {!isCurrentUser && (
          <Text style={styles.senderName}>{message.senderUsername}</Text>
        )}
        <Text style={[
          styles.messageText,
          { color: isCurrentUser ? 'white' : colors.text.primary }
        ]}>
          {message.message}
        </Text>
        <Text style={[
          styles.messageTime,
          { color: isCurrentUser ? 'rgba(255,255,255,0.7)' : colors.text.tertiary }
        ]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    );
  };

  if (loading || !trade) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading trade...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isBuyer = trade.buyerId === currentUser.id;
  const canConfirmPayment = isBuyer && trade.status === 'pending';
  const canConfirmReceipt = !isBuyer && trade.status === 'payment_sent';
  const canCancel = ['pending', 'payment_sent'].includes(trade.status);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Trade #{trade.id.slice(-6)}</Text>
            <Text style={styles.headerSubtitle}>
              {trade.amount} {trade.currency} @ {trade.price.toFixed(4)}
            </Text>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-vertical" size={20} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Trade Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(trade.status) }]} />
            <Text style={styles.statusText}>{getStatusText(trade.status)}</Text>
            {trade.status !== 'completed' && trade.status !== 'cancelled' && (
              <Text style={styles.timeLeft}>{formatTimeLeft(trade.expiresAt)}</Text>
            )}
          </View>
          
          <View style={styles.tradeDetails}>
            <View style={styles.tradeDetailRow}>
              <Text style={styles.tradeDetailLabel}>Amount:</Text>
              <Text style={styles.tradeDetailValue}>{trade.amount} {trade.currency}</Text>
            </View>
            <View style={styles.tradeDetailRow}>
              <Text style={styles.tradeDetailLabel}>Total:</Text>
              <Text style={styles.tradeDetailValue}>${trade.totalValue.toFixed(2)}</Text>
            </View>
            <View style={styles.tradeDetailRow}>
              <Text style={styles.tradeDetailLabel}>Payment:</Text>
              <Text style={styles.tradeDetailValue}>{trade.paymentMethod}</Text>
            </View>
            <View style={styles.tradeDetailRow}>
              <Text style={styles.tradeDetailLabel}>Trading with:</Text>
              <Text style={styles.tradeDetailValue}>
                {isBuyer ? trade.sellerUsername : trade.buyerUsername}
              </Text>
            </View>
          </View>
        </View>

        {/* Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </ScrollView>

        {/* Action Buttons */}
        {trade.status !== 'completed' && trade.status !== 'cancelled' && (
          <View style={styles.actionButtons}>
            {canConfirmPayment && (
              <TouchableOpacity style={styles.confirmButton} onPress={confirmPayment}>
                <Text style={styles.confirmButtonText}>I've Sent Payment</Text>
              </TouchableOpacity>
            )}
            
            {canConfirmReceipt && (
              <TouchableOpacity style={styles.confirmButton} onPress={confirmReceipt}>
                <Text style={styles.confirmButtonText}>Confirm Receipt</Text>
              </TouchableOpacity>
            )}
            
            {canCancel && (
              <TouchableOpacity style={styles.cancelButton} onPress={cancelTrade}>
                <Text style={styles.cancelButtonText}>Cancel Trade</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Message Input */}
        {trade.status !== 'completed' && trade.status !== 'cancelled' && (
          <View style={styles.messageInput}>
            <TextInput
              style={styles.textInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              placeholderTextColor={colors.text.tertiary}
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={[styles.sendButton, { opacity: newMessage.trim() ? 1 : 0.5 }]}
              onPress={sendMessage}
              disabled={!newMessage.trim()}
            >
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.secondary,
  },
  backButton: {
    padding: spacing[2],
  },
  headerInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  moreButton: {
    padding: spacing[2],
  },
  statusCard: {
    backgroundColor: colors.background.secondary,
    marginHorizontal: spacing[4],
    marginVertical: spacing[3],
    borderRadius: 12,
    padding: spacing[4],
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing[2],
  },
  statusText: {
    flex: 1,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  timeLeft: {
    fontSize: typography.sizes.sm,
    color: colors.status.warning,
    fontWeight: typography.weights.medium,
  },
  tradeDetails: {
    gap: spacing[2],
  },
  tradeDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tradeDetailLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  tradeDetailValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: spacing[4],
  },
  messageBubble: {
    marginVertical: spacing[2],
    padding: spacing[3],
    borderRadius: 12,
    maxWidth: '80%',
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary[500],
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background.secondary,
  },
  systemMessage: {
    alignSelf: 'center',
    backgroundColor: colors.background.tertiary,
    marginVertical: spacing[2],
    padding: spacing[2],
    borderRadius: 8,
    maxWidth: '90%',
  },
  systemMessageText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  senderName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  messageText: {
    fontSize: typography.sizes.sm,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: typography.sizes.xs,
    marginTop: spacing[1],
  },
  actionButtons: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: spacing[2],
  },
  confirmButton: {
    backgroundColor: colors.status.success,
    paddingVertical: spacing[3],
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
  cancelButton: {
    backgroundColor: colors.status.error,
    paddingVertical: spacing[3],
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
  messageInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.secondary,
    gap: spacing[2],
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border.secondary,
    borderRadius: 8,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.primary[500],
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default P2PTradeChat;
