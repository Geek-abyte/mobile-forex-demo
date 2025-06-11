import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Svg, Path, Circle, Text as SvgText, Line, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { colors, typography, spacing } from '../../theme';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - spacing[6] * 2;
const CHART_HEIGHT = 200;
const PADDING = 20;

interface DataPoint {
  date: string;
  value: number;
  change?: number;
}

interface PerformanceChartProps {
  data: DataPoint[];
  timeframe: string;
  onTimeframeChange: (timeframe: string) => void;
  showControls?: boolean;
  title?: string;
  valueFormatter?: (value: number) => string;
  color?: string;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  timeframe,
  onTimeframeChange,
  showControls = true,
  title = "Performance",
  valueFormatter = (value) => `$${value.toLocaleString()}`,
  color = colors.primary[500],
}) => {
  const timeframes = ['1D', '1W', '1M', '3M', '1Y'];

  const { pathData, points, minValue, maxValue, currentValue, change } = useMemo(() => {
    if (!data || data.length === 0) {
      return { pathData: '', points: [], minValue: 0, maxValue: 100, currentValue: 0, change: 0 };
    }

    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    
    const points = data.map((point, index) => ({
      x: PADDING + (index / (data.length - 1)) * (CHART_WIDTH - PADDING * 2),
      y: CHART_HEIGHT - PADDING - ((point.value - min) / range) * (CHART_HEIGHT - PADDING * 2),
      value: point.value,
      date: point.date,
    }));

    const pathData = points.reduce((path, point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${path} ${command} ${point.x} ${point.y}`;
    }, '');

    const current = values[values.length - 1];
    const previous = values[values.length - 2] || current;
    const changeValue = current - previous;

    return {
      pathData,
      points,
      minValue: min,
      maxValue: max,
      currentValue: current,
      change: changeValue,
    };
  }, [data]);

  const formatTimeLabel = (date: string, index: number) => {
    const d = new Date(date);
    switch (timeframe) {
      case '1D':
        return d.getHours().toString().padStart(2, '0');
      case '1W':
        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
      case '1M':
        return d.getDate().toString();
      case '3M':
      case '1Y':
        return (d.getMonth() + 1).toString();
      default:
        return '';
    }
  };

  const renderGridLines = () => {
    const lines = [];
    const stepY = (CHART_HEIGHT - PADDING * 2) / 4;
    
    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = PADDING + stepY * i;
      lines.push(
        <Line
          key={`h-${i}`}
          x1={PADDING}
          y1={y}
          x2={CHART_WIDTH - PADDING}
          y2={y}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1"
        />
      );
    }

    // Vertical grid lines
    const stepX = (CHART_WIDTH - PADDING * 2) / Math.max(data.length - 1, 1);
    for (let i = 0; i < data.length; i += Math.ceil(data.length / 5)) {
      const x = PADDING + stepX * i;
      lines.push(
        <Line
          key={`v-${i}`}
          x1={x}
          y1={PADDING}
          x2={x}
          y2={CHART_HEIGHT - PADDING}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1"
        />
      );
    }

    return lines;
  };

  const renderYAxisLabels = () => {
    const labels = [];
    const stepY = (CHART_HEIGHT - PADDING * 2) / 4;
    const stepValue = (maxValue - minValue) / 4;

    for (let i = 0; i <= 4; i++) {
      const y = CHART_HEIGHT - PADDING - stepY * i;
      const value = minValue + stepValue * i;
      
      labels.push(
        <SvgText
          key={`y-${i}`}
          x={PADDING - 5}
          y={y + 4}
          fontSize="10"
          fill={colors.text.secondary}
          textAnchor="end"
        >
          {valueFormatter(value)}
        </SvgText>
      );
    }

    return labels;
  };

  const renderXAxisLabels = () => {
    const labels = [];
    const stepX = (CHART_WIDTH - PADDING * 2) / Math.max(data.length - 1, 1);

    for (let i = 0; i < data.length; i += Math.ceil(data.length / 5)) {
      const x = PADDING + stepX * i;
      const label = formatTimeLabel(data[i]?.date || '', i);
      
      labels.push(
        <SvgText
          key={`x-${i}`}
          x={x}
          y={CHART_HEIGHT - 5}
          fontSize="10"
          fill={colors.text.secondary}
          textAnchor="middle"
        >
          {label}
        </SvgText>
      );
    }

    return labels;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.currentValue}>{valueFormatter(currentValue)}</Text>
            <View style={[
              styles.changeContainer,
              { backgroundColor: change >= 0 ? colors.trading.profit + '20' : colors.trading.loss + '20' }
            ]}>
              <Text style={[
                styles.changeText,
                { color: change >= 0 ? colors.trading.profit : colors.trading.loss }
              ]}>
                {change >= 0 ? '+' : ''}{valueFormatter(change)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          <Defs>
            <SvgLinearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <Stop offset="100%" stopColor={color} stopOpacity="0.05" />
            </SvgLinearGradient>
          </Defs>

          {/* Grid */}
          {renderGridLines()}

          {/* Area under curve */}
          {pathData && (
            <Path
              d={`${pathData} L ${CHART_WIDTH - PADDING} ${CHART_HEIGHT - PADDING} L ${PADDING} ${CHART_HEIGHT - PADDING} Z`}
              fill="url(#gradient)"
            />
          )}

          {/* Line */}
          {pathData && (
            <Path
              d={pathData}
              stroke={color}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data points */}
          {points.map((point, index) => (
            <Circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill={color}
              stroke="white"
              strokeWidth="2"
            />
          ))}

          {/* Axis labels */}
          {renderYAxisLabels()}
          {renderXAxisLabels()}
        </Svg>
      </View>

      {/* Timeframe Controls */}
      {showControls && (
        <View style={styles.timeframeContainer}>
          {timeframes.map((tf) => (
            <TouchableOpacity
              key={tf}
              style={[
                styles.timeframeButton,
                timeframe === tf && styles.activeTimeframeButton
              ]}
              onPress={() => onTimeframeChange(tf)}
            >
              <Text style={[
                styles.timeframeText,
                timeframe === tf && styles.activeTimeframeText
              ]}>
                {tf}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
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
    alignItems: 'flex-start',
    marginBottom: spacing[4],
  },
  title: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  currentValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginRight: spacing[2],
  },
  changeContainer: {
    borderRadius: 8,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  changeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: spacing[3],
  },
  timeframeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing[4],
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: spacing[1],
  },
  timeframeButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  activeTimeframeButton: {
    backgroundColor: colors.primary[500],
  },
  timeframeText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  activeTimeframeText: {
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
  },
});

export default PerformanceChart;
