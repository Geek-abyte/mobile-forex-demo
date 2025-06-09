import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, typography } from '../theme';

// Import main screens (will create them next)
import DashboardScreen from '../screens/main/DashboardScreen';
import TradingScreen from '../screens/main/TradingScreen';
import WalletScreen from '../screens/main/WalletScreen';
import P2PScreen from '../screens/main/P2PScreen';
import MarketScreen from '../screens/main/MarketScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Import modal screens
import OrderScreen from '../screens/trading/OrderScreen';
import ChartScreen from '../screens/trading/ChartScreen';
import OrderHistoryScreen from '../screens/trading/OrderHistoryScreen';
import DepositScreen from '../screens/wallet/DepositScreen';
import WithdrawScreen from '../screens/wallet/WithdrawScreen';
import TransactionHistoryScreen from '../screens/wallet/TransactionHistoryScreen';

export type MainTabParamList = {
  Dashboard: undefined;
  Trading: undefined;
  Wallet: undefined;
  P2P: undefined;
  Market: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  Order: { symbol?: string; type?: 'buy' | 'sell' };
  Chart: { symbol: string };
  OrderHistory: undefined;
  Deposit: { currency?: string };
  Withdraw: { currency?: string };
  TransactionHistory: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<MainStackParamList>();

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Trading':
              iconName = 'trending-up';
              break;
            case 'Wallet':
              iconName = 'account-balance-wallet';
              break;
            case 'P2P':
              iconName = 'swap-horiz';
              break;
            case 'Market':
              iconName = 'show-chart';
              break;
            default:
              iconName = 'home';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          backgroundColor: colors.background.secondary,
          borderTopWidth: 1,
          borderTopColor: colors.border.primary,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontFamily: typography.fonts.primary,
          fontSize: 12,
          marginTop: 4,
        },
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Trading"
        component={TradingScreen}
        options={{
          tabBarLabel: 'Trade',
        }}
      />
      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          tabBarLabel: 'Wallet',
        }}
      />
      <Tab.Screen
        name="P2P"
        component={P2PScreen}
        options={{
          tabBarLabel: 'P2P',
        }}
      />
      <Tab.Screen
        name="Market"
        component={MarketScreen}
        options={{
          tabBarLabel: 'Markets',
        }}
      />
    </Tab.Navigator>
  );
};

const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background.primary },
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{
          gestureEnabled: false,
        }}
      />
      
      {/* Modal Screens */}
      <Stack.Screen
        name="Order"
        component={OrderScreen}
        options={{
          presentation: 'modal',
          gestureEnabled: true,
          gestureDirection: 'vertical',
        }}
      />
      <Stack.Screen
        name="Chart"
        component={ChartScreen}
        options={{
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="OrderHistory"
        component={OrderHistoryScreen}
        options={{
          title: 'Order History',
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="Deposit"
        component={DepositScreen}
        options={{
          presentation: 'modal',
          gestureEnabled: true,
          gestureDirection: 'vertical',
        }}
      />
      <Stack.Screen
        name="Withdraw"
        component={WithdrawScreen}
        options={{
          presentation: 'modal',
          gestureEnabled: true,
          gestureDirection: 'vertical',
        }}
      />
      <Stack.Screen
        name="TransactionHistory"
        component={TransactionHistoryScreen}
        options={{
          title: 'Transaction History',
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;
