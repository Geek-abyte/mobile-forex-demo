import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';

interface PortfolioItem {
  currency: string;
  allocation: number;
  value: number;
  change24h: number;
  change24hPercent: number;
  icon?: string;
}

interface PortfolioBreakdownProps {
  data: PortfolioItem[];
  totalValue: number;
}

const PortfolioBreakdown: React.FC<PortfolioBreakdownProps> = ({ data, totalValue }) => {
  const getCurrencyIcon = (currency: string): string => {
    const icons: Record<string, string> = {
      'USD': 'logo-usd',
      'EUR': 'card-outline',
      'GBP': 'card-outline',
      'JPY': 'card-outline',
      'AUD': 'card-outline',
      'CAD': 'card-outline',
      'CHF': 'card-outline',
      'NZD': 'card-outline',
    };
    return icons[currency] || 'card-outline';
  };

  const getAllocationColor = (allocation: number) => {
    if (allocation >= 30) return colors.primary[500];
    if (allocation >= 20) return colors.secondary[500];
    if (allocation >= 10) return colors.trading.warning;
    return colors.text.secondary;
  };

  const renderPortfolioItem = ({ item }: { item: PortfolioItem }) => (
    <TouchableOpacity style={styles.portfolioItem}>
      <View style={styles.itemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: getAllocationColor(item.allocation) + '20' }]}>
          <Ionicons 
            name={getCurrencyIcon(item.currency) as any} 
            size={24} 
            color={getAllocationColor(item.allocation)} 
          />
        </View>
        <View style={styles.currencyInfo}>
          <Text style={styles.currencyCode}>{item.currency}</Text>
          <Text style={styles.allocationText}>{item.allocation.toFixed(1)}% allocation</Text>
        </View>
      </View>

      <View style={styles.itemRight}>
        <Text style={styles.valueText}>${item.value.toLocaleString()}</Text>
        <View style={styles.changeContainer}>
          <Ionicons 
            name={item.change24hPercent >= 0 ? 'trending-up' : 'trending-down'} 
            size={14} 
            color={item.change24hPercent >= 0 ? colors.trading.profit : colors.trading.loss} 
          />
          <Text style={[
            styles.changeText,
            { color: item.change24hPercent >= 0 ? colors.trading.profit : colors.trading.loss }
          ]}>
            {item.change24hPercent >= 0 ? '+' : ''}{item.change24hPercent.toFixed(2)}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderAllocationBar = () => {
    let cumulativeWidth = 0;
    return (
      <View style={styles.allocationBarContainer}>
        <Text style={styles.allocationTitle}>Portfolio Allocation</Text>
        <View style={styles.allocationBar}>
          {data.map((item, index) => {
            const width = (item.allocation / 100) * 100;
            const segment = (
              <View
                key={item.currency}
                style={[
                  styles.allocationSegment,
                  {
                    width: `${width}%`,
                    backgroundColor: getAllocationColor(item.allocation),
                    borderTopLeftRadius: index === 0 ? 4 : 0,
                    borderBottomLeftRadius: index === 0 ? 4 : 0,
                    borderTopRightRadius: index === data.length - 1 ? 4 : 0,
                    borderBottomRightRadius: index === data.length - 1 ? 4 : 0,
                  }
                ]}
              />
            );
            cumulativeWidth += width;
            return segment;
          })}
        </View>
        <View style={styles.allocationLegend}>
          {data.slice(0, 4).map((item) => (
            <View key={item.currency} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: getAllocationColor(item.allocation) }]} />
              <Text style={styles.legendText}>{item.currency}</Text>
            </View>
          ))}
          {data.length > 4 && (
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.text.secondary }]} />
              <Text style={styles.legendText}>Others</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Portfolio Breakdown</Text>
        <Text style={styles.totalValue}>${totalValue.toLocaleString()}</Text>
      </View>

      {renderAllocationBar()}

      <FlatList
        data={data}
        renderItem={renderPortfolioItem}
        keyExtractor={(item) => item.currency}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: spacing[4],
    marginVertical: spacing[3],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary[500],
  },
  allocationBarContainer: {
    marginBottom: spacing[4],
  },
  allocationTitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  allocationBar: {
    flexDirection: 'row',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing[3],
  },
  allocationSegment: {
    height: '100%',
  },
  allocationLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing[1],
  },
  legendText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  list: {
    maxHeight: 200,
  },
  portfolioItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  allocationText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  valueText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[1],
  },
  changeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginLeft: spacing[1],
  },
});

export default PortfolioBreakdown;
