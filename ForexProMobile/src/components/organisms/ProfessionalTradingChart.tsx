import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';

export interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface ProfessionalTradingChartProps {
  data: CandlestickData[];
  symbol?: string;
  theme?: 'light' | 'dark';
  onCrosshairMove?: (data: any) => void;
  width?: number;
  height?: number;
  timeframe?: string;
  isFullscreen?: boolean;
  onFullscreenChange?: (fullscreen: boolean) => void;
  showControls?: boolean;
}

const ProfessionalTradingChart: React.FC<ProfessionalTradingChartProps> = ({
  data = [],
  symbol = 'EURUSD',
  theme = 'dark',
  onCrosshairMove,
  width,
  height = 320,
  timeframe = '1h',
  isFullscreen = false,
  onFullscreenChange,
  showControls = true,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [chartReady, setChartReady] = useState(false);
  const [currentChartType, setCurrentChartType] = useState<'candlestick' | 'line' | 'area'>('candlestick');
  const [indicatorsEnabled, setIndicatorsEnabled] = useState(false);
  const [crosshairData, setCrosshairData] = useState<any>(null);
  const screenWidth = width || Dimensions.get('window').width;

  const timeframes = [
    { value: '1m', label: '1M' },
    { value: '5m', label: '5M' },
    { value: '15m', label: '15M' },
    { value: '1h', label: '1H' },
    { value: '4h', label: '4H' },
    { value: '1d', label: '1D' },
  ];

  // Generate professional trading chart HTML
  const generateChartHTML = () => {
    const chartData = JSON.stringify(data.filter(item => item && typeof item.time === 'number'));
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
    <script src="https://unpkg.com/lightweight-charts@4.1.3/dist/lightweight-charts.standalone.production.js"></script>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        html, body {
            height: 100%;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: ${colors.background.primary};
            color: ${colors.text.primary};
            user-select: none;
            -webkit-user-select: none;
            touch-action: manipulation;
        }
        
        #chart-container {
            width: 100vw;
            height: 100vh;
            position: relative;
            background: ${colors.background.primary};
            overflow: hidden;
        }
        
        .crosshair-info {
            position: absolute;
            top: 8px;
            left: 8px;
            background: ${colors.background.secondary}F8;
            backdrop-filter: blur(20px);
            border: 1px solid ${colors.border.primary}30;
            border-radius: 8px;
            padding: 12px;
            font-size: 11px;
            color: ${colors.text.primary};
            z-index: 1000;
            display: none;
            min-width: 200px;
            font-family: 'Monaco', 'Menlo', monospace;
        }
        
        .crosshair-info.visible {
            display: block;
        }
        
        .crosshair-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
        }
        
        .crosshair-label {
            color: ${colors.text.secondary};
            font-weight: 500;
        }
        
        .crosshair-value {
            color: ${colors.text.primary};
            font-weight: 600;
        }
        
        .loading-state {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${colors.background.secondary};
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            z-index: 999;
        }
        
        .loading-text {
            color: ${colors.text.secondary};
            font-size: 14px;
            margin-bottom: 12px;
        }
        
        .loading-spinner {
            width: 24px;
            height: 24px;
            border: 3px solid ${colors.border.primary}40;
            border-top: 3px solid ${colors.primary[500]};
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="crosshair-info" id="crosshair-info">
        <div class="crosshair-row">
            <span class="crosshair-label">Time:</span>
            <span class="crosshair-value" id="crosshair-time">--</span>
        </div>
        <div class="crosshair-row">
            <span class="crosshair-label">O:</span>
            <span class="crosshair-value" id="crosshair-open">--</span>
        </div>
        <div class="crosshair-row">
            <span class="crosshair-label">H:</span>
            <span class="crosshair-value" id="crosshair-high">--</span>
        </div>
        <div class="crosshair-row">
            <span class="crosshair-label">L:</span>
            <span class="crosshair-value" id="crosshair-low">--</span>
        </div>
        <div class="crosshair-row">
            <span class="crosshair-label">C:</span>
            <span class="crosshair-value" id="crosshair-close">--</span>
        </div>
    </div>
    
    <div class="loading-state" id="loading-state" style="display: ${chartData && JSON.parse(chartData).length > 0 ? 'none' : 'block'};">
        <div class="loading-text">Loading chart...</div>
        <div class="loading-spinner"></div>
    </div>
    
    <div id="chart-container"></div>

    <script>
        let chart, candlestickSeries, lineSeries, areaSeries;
        let currentChartType = '${currentChartType}';
        let indicatorsEnabled = ${indicatorsEnabled};
        let chartData = ${chartData};
        let technicalIndicators = {
            sma20: null,
            sma50: null
        };
        
        console.log('Professional chart initializing with', chartData ? chartData.length : 0, 'data points');

        function initializeChart() {
            const container = document.getElementById('chart-container');
            if (!container) {
                console.error('Chart container not found');
                return;
            }

            const chartConfig = {
                width: container.clientWidth,
                height: container.clientHeight,
                layout: {
                    background: {
                        type: 'solid',
                        color: '${colors.background.primary}',
                    },
                    textColor: '${colors.text.primary}',
                    fontSize: 12,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                },
                grid: {
                    vertLines: {
                        color: '${colors.border.primary}25',
                        style: 1,
                        visible: true,
                    },
                    horzLines: {
                        color: '${colors.border.primary}25',
                        style: 1,
                        visible: true,
                    },
                },
                crosshair: {
                    mode: LightweightCharts.CrosshairMode.Normal,
                    vertLine: {
                        color: '${colors.text.secondary}90',
                        width: 1,
                        style: 2,
                        visible: true,
                        labelVisible: true,
                        labelBackgroundColor: '${colors.background.secondary}',
                    },
                    horzLine: {
                        color: '${colors.text.secondary}90',
                        width: 1,
                        style: 2,
                        visible: true,
                        labelVisible: true,
                        labelBackgroundColor: '${colors.background.secondary}',
                    },
                },
                rightPriceScale: {
                    borderColor: '${colors.border.primary}60',
                    textColor: '${colors.text.secondary}',
                    scaleMargins: {
                        top: 0.1,
                        bottom: 0.2,
                    },
                    visible: true,
                },
                timeScale: {
                    borderColor: '${colors.border.primary}60',
                    textColor: '${colors.text.secondary}',
                    timeVisible: true,
                    secondsVisible: false,
                },
                handleScroll: {
                    mouseWheel: true,
                    pressedMouseMove: true,
                    horzTouchDrag: true,
                    vertTouchDrag: false,
                },
                handleScale: {
                    axisPressedMouseMove: {
                        time: true,
                        price: true,
                    },
                    mouseWheel: true,
                    pinch: true,
                },
                kineticScroll: {
                    touch: true,
                    mouse: false,
                },
            };

            try {
                chart = LightweightCharts.createChart(container, chartConfig);
                
                // Create series
                candlestickSeries = chart.addCandlestickSeries({
                    upColor: '${colors.chart.bullish}',
                    downColor: '${colors.chart.bearish}',
                    borderVisible: false,
                    wickUpColor: '${colors.chart.bullish}',
                    wickDownColor: '${colors.chart.bearish}',
                    priceFormat: {
                        type: 'price',
                        precision: 5,
                        minMove: 0.00001,
                    },
                    visible: currentChartType === 'candlestick',
                });

                lineSeries = chart.addLineSeries({
                    color: '${colors.primary[500]}',
                    lineWidth: 2,
                    visible: currentChartType === 'line',
                    priceFormat: {
                        type: 'price',
                        precision: 5,
                        minMove: 0.00001,
                    },
                });

                areaSeries = chart.addAreaSeries({
                    lineColor: '${colors.primary[500]}',
                    topColor: '${colors.primary[500]}60',
                    bottomColor: '${colors.primary[500]}10',
                    lineWidth: 2,
                    visible: currentChartType === 'area',
                    priceFormat: {
                        type: 'price',
                        precision: 5,
                        minMove: 0.00001,
                    },
                });

                // Load data if available
                if (chartData && chartData.length > 0) {
                    loadChartData();
                }

                // Set up crosshair tracking
                chart.subscribeCrosshairMove(handleCrosshairMove);

                // Handle resizing
                const resizeObserver = new ResizeObserver(entries => {
                    const { width, height } = entries[0].contentRect;
                    chart.applyOptions({ width, height });
                });
                resizeObserver.observe(container);

                console.log('Professional chart initialized successfully');
                notifyReactNative({ type: 'chartReady', success: true });

            } catch (error) {
                console.error('Chart initialization failed:', error);
                showError('Chart initialization failed: ' + error.message);
            }
        }

        function loadChartData() {
            if (!chartData || chartData.length === 0) return;

            try {
                // Set candlestick data
                candlestickSeries.setData(chartData);
                
                // Convert to line/area data
                const priceData = chartData.map(item => ({
                    time: item.time,
                    value: item.close
                }));
                
                lineSeries.setData(priceData);
                areaSeries.setData(priceData);

                // Hide loading state
                const loadingState = document.getElementById('loading-state');
                if (loadingState) {
                    loadingState.style.display = 'none';
                }

                // Fit content and add indicators if enabled
                setTimeout(() => {
                    chart.timeScale().fitContent();
                    if (indicatorsEnabled) {
                        addTechnicalIndicators();
                    }
                }, 100);

                console.log('Chart data loaded:', chartData.length, 'candles');

            } catch (error) {
                console.error('Error loading chart data:', error);
                showError('Error loading chart data');
            }
        }

        function handleCrosshairMove(param) {
            const crosshairInfo = document.getElementById('crosshair-info');
            
            if (param.time && param.seriesData.size > 0) {
                crosshairInfo.classList.add('visible');
                
                let priceData = null;
                if (currentChartType === 'candlestick' && param.seriesData.has(candlestickSeries)) {
                    priceData = param.seriesData.get(candlestickSeries);
                } else if (currentChartType === 'line' && param.seriesData.has(lineSeries)) {
                    const lineData = param.seriesData.get(lineSeries);
                    priceData = { 
                        open: lineData.value, 
                        high: lineData.value, 
                        low: lineData.value, 
                        close: lineData.value 
                    };
                } else if (currentChartType === 'area' && param.seriesData.has(areaSeries)) {
                    const areaData = param.seriesData.get(areaSeries);
                    priceData = { 
                        open: areaData.value, 
                        high: areaData.value, 
                        low: areaData.value, 
                        close: areaData.value 
                    };
                }
                
                if (priceData) {
                    updateCrosshairDisplay(priceData, param.time);
                    notifyReactNative({ 
                        type: 'crosshairMove', 
                        data: { ...priceData, time: param.time } 
                    });
                }
            } else {
                crosshairInfo.classList.remove('visible');
            }
        }

        function updateCrosshairDisplay(data, time) {
            document.getElementById('crosshair-open').textContent = data.open?.toFixed(5) || '--';
            document.getElementById('crosshair-high').textContent = data.high?.toFixed(5) || '--';
            document.getElementById('crosshair-low').textContent = data.low?.toFixed(5) || '--';
            document.getElementById('crosshair-close').textContent = data.close?.toFixed(5) || '--';
            
            const date = new Date(time * 1000);
            document.getElementById('crosshair-time').textContent = 
                date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }

        function addTechnicalIndicators() {
            if (!chartData || chartData.length < 50) return;

            try {
                // Calculate and add SMA indicators
                const sma20Data = calculateSMA(chartData, 20);
                const sma50Data = calculateSMA(chartData, 50);

                if (!technicalIndicators.sma20) {
                    technicalIndicators.sma20 = chart.addLineSeries({
                        color: '${colors.secondary[500]}',
                        lineWidth: 1,
                        title: 'SMA 20',
                    });
                }
                
                if (!technicalIndicators.sma50) {
                    technicalIndicators.sma50 = chart.addLineSeries({
                        color: '${colors.trading.warning}',
                        lineWidth: 1,
                        title: 'SMA 50',
                    });
                }

                technicalIndicators.sma20.setData(sma20Data);
                technicalIndicators.sma50.setData(sma50Data);

            } catch (error) {
                console.error('Error adding indicators:', error);
            }
        }

        function removeTechnicalIndicators() {
            Object.values(technicalIndicators).forEach(indicator => {
                if (indicator) {
                    chart.removeSeries(indicator);
                }
            });
            
            technicalIndicators = {
                sma20: null,
                sma50: null
            };
        }

        function calculateSMA(data, period) {
            const smaData = [];
            for (let i = period - 1; i < data.length; i++) {
                let sum = 0;
                for (let j = 0; j < period; j++) {
                    sum += data[i - j].close;
                }
                smaData.push({
                    time: data[i].time,
                    value: sum / period
                });
            }
            return smaData;
        }

        function showError(message) {
            const loadingState = document.getElementById('loading-state');
            if (loadingState) {
                loadingState.innerHTML = \`
                    <div class="loading-text" style="color: ${colors.status.error};">\${message}</div>
                \`;
                loadingState.style.display = 'block';
            }
        }

        function notifyReactNative(message) {
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify(message));
            }
        }

        // Export functions for React Native communication
        window.updateChartData = function(newData) {
            if (newData && newData.length > 0) {
                chartData = newData;
                loadChartData();
            }
        };

        window.switchChartType = function(type) {
            currentChartType = type;
            candlestickSeries.applyOptions({ visible: type === 'candlestick' });
            lineSeries.applyOptions({ visible: type === 'line' });
            areaSeries.applyOptions({ visible: type === 'area' });
            notifyReactNative({ type: 'chartTypeChanged', chartType: type });
        };

        window.toggleIndicators = function(enabled) {
            indicatorsEnabled = enabled;
            if (enabled) {
                addTechnicalIndicators();
            } else {
                removeTechnicalIndicators();
            }
            notifyReactNative({ type: 'indicatorsToggled', enabled });
        };

        window.resetZoom = function() {
            if (chart) {
                chart.timeScale().fitContent();
            }
        };

        // Initialize chart when ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeChart);
        } else {
            initializeChart();
        }

    </script>
</body>
</html>
    `;
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      switch (message.type) {
        case 'chartReady':
          console.log('Professional chart ready');
          setChartReady(true);
          break;
          
        case 'crosshairMove':
          setCrosshairData(message.data);
          onCrosshairMove?.(message.data);
          break;
          
        case 'chartTypeChanged':
          console.log('Chart type changed to:', message.chartType);
          break;
          
        case 'indicatorsToggled':
          console.log('Indicators toggled:', message.enabled);
          break;
          
        default:
          console.log('Chart message:', message);
      }
    } catch (error) {
      console.error('Error parsing chart message:', error);
    }
  };

  // Update chart data when props change
  useEffect(() => {
    if (chartReady && webViewRef.current && data.length > 0) {
      const jsCode = `window.updateChartData && window.updateChartData(${JSON.stringify(data)});`;
      webViewRef.current.postMessage(jsCode);
    }
  }, [data, chartReady]);

  // Handle chart type changes
  const handleChartTypeChange = (type: 'candlestick' | 'line' | 'area') => {
    setCurrentChartType(type);
    if (chartReady && webViewRef.current) {
      const jsCode = `window.switchChartType && window.switchChartType('${type}');`;
      webViewRef.current.postMessage(jsCode);
    }
  };

  // Handle indicators toggle
  const handleIndicatorsToggle = () => {
    const newState = !indicatorsEnabled;
    setIndicatorsEnabled(newState);
    if (chartReady && webViewRef.current) {
      const jsCode = `window.toggleIndicators && window.toggleIndicators(${newState});`;
      webViewRef.current.postMessage(jsCode);
    }
  };

  // Handle zoom reset
  const handleResetZoom = () => {
    if (chartReady && webViewRef.current) {
      const jsCode = `window.resetZoom && window.resetZoom();`;
      webViewRef.current.postMessage(jsCode);
    }
  };

  const chartHTML = generateChartHTML();

  return (
    <View style={[styles.container, { height }]}>
      {/* Professional Chart Controls */}
      {showControls && (
        <View style={styles.chartHeader}>
          <View style={styles.symbolInfo}>
            <Text style={styles.symbolText}>{symbol}</Text>
            <Text style={styles.timeframeText}>{timeframe.toUpperCase()}</Text>
          </View>
          
          <View style={styles.chartTypeControls}>
            <TouchableOpacity
              style={[styles.chartTypeButton, currentChartType === 'candlestick' && styles.chartTypeButtonActive]}
              onPress={() => handleChartTypeChange('candlestick')}
            >
              <Text style={[styles.chartTypeText, currentChartType === 'candlestick' && styles.chartTypeTextActive]}>
                Candles
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.chartTypeButton, currentChartType === 'line' && styles.chartTypeButtonActive]}
              onPress={() => handleChartTypeChange('line')}
            >
              <Text style={[styles.chartTypeText, currentChartType === 'line' && styles.chartTypeTextActive]}>
                Line
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.chartTypeButton, currentChartType === 'area' && styles.chartTypeButtonActive]}
              onPress={() => handleChartTypeChange('area')}
            >
              <Text style={[styles.chartTypeText, currentChartType === 'area' && styles.chartTypeTextActive]}>
                Area
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.chartActions}>
            <TouchableOpacity
              style={[styles.actionButton, indicatorsEnabled && styles.actionButtonActive]}
              onPress={handleIndicatorsToggle}
            >
              <Ionicons 
                name="analytics" 
                size={16} 
                color={indicatorsEnabled ? colors.text.inverse : colors.text.secondary} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleResetZoom}
            >
              <Ionicons name="refresh" size={16} color={colors.text.secondary} />
            </TouchableOpacity>
            
            {onFullscreenChange && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onFullscreenChange(!isFullscreen)}
              >
                <Ionicons 
                  name={isFullscreen ? "contract" : "expand"} 
                  size={16} 
                  color={colors.text.secondary} 
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Chart WebView */}
      <View style={styles.chartContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: chartHTML }}
          style={styles.webview}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
          scalesPageToFit={false}
          scrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          mixedContentMode="always"
          allowsFullscreenVideo={false}
          bounces={false}
          overScrollMode="never"
          nestedScrollEnabled={true}
          onShouldStartLoadWithRequest={() => true}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    overflow: 'hidden',
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  symbolInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  symbolText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  timeframeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.secondary,
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  chartTypeControls: {
    flexDirection: 'row',
    backgroundColor: colors.background.tertiary,
    borderRadius: 8,
    overflow: 'hidden',
  },
  chartTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'transparent',
  },
  chartTypeButtonActive: {
    backgroundColor: colors.primary[500],
  },
  chartTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  chartTypeTextActive: {
    color: colors.text.inverse,
  },
  chartActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonActive: {
    backgroundColor: colors.primary[500],
  },
  chartContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  webview: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
});

export default ProfessionalTradingChart;
  const [activeIndicators, setActiveIndicators] = useState<string[]>(['SMA20']);
  const [showOrderLines, setShowOrderLines] = useState(true);
  const [crosshairData, setCrosshairData] = useState<any>(null);

  const chartOpacity = useSharedValue(1);
  const indicatorPanelHeight = useSharedValue(showIndicators ? 100 : 0);

  const timeframes = [
    { label: '1m', value: '1m' },
    { label: '5m', value: '5m' },
    { label: '15m', value: '15m' },
    { label: '1h', value: '1h' },
    { label: '4h', value: '4h' },
    { label: '1d', value: '1d' },
  ];

  const indicatorOptions = [
    { key: 'SMA20', label: 'SMA 20', color: colors.chart.bullish },
    { key: 'SMA50', label: 'SMA 50', color: colors.primary[400] },
    { key: 'EMA20', label: 'EMA 20', color: colors.secondary[500] },
    { key: 'EMA50', label: 'EMA 50', color: colors.secondary[300] },
    { key: 'BB', label: 'Bollinger Bands', color: colors.text.tertiary },
    { key: 'RSI', label: 'RSI', color: colors.status.warning },
    { key: 'MACD', label: 'MACD', color: colors.status.info },
  ];

  // Convert data for wagmi charts format
  const formattedData = useMemo(() => {
    return data.map(candle => ({
      timestamp: candle.timestamp,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));
  }, [data]);

  // Calculate Simple Moving Average
  const calculateSMA = (period: number): TechnicalIndicator => {
    if (data.length < period) return { name: `SMA${period}`, values: [], color: colors.chart.bullish, visible: true };
    
    const smaValues = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, candle) => acc + candle.close, 0);
      smaValues.push({
        timestamp: data[i].timestamp,
        value: sum / period,
      });
    }
    
    return {
      name: `SMA${period}`,
      values: smaValues,
      color: period === 20 ? colors.chart.bullish : colors.primary[400],
      visible: activeIndicators.includes(`SMA${period}`),
    };
  };

  // Calculate Exponential Moving Average
  const calculateEMA = (period: number): TechnicalIndicator => {
    if (data.length < period) return { name: `EMA${period}`, values: [], color: colors.secondary[500], visible: true };
    
    const emaValues = [];
    const multiplier = 2 / (period + 1);
    let ema = data.slice(0, period).reduce((acc, candle) => acc + candle.close, 0) / period;
    
    emaValues.push({ timestamp: data[period - 1].timestamp, value: ema });
    
    for (let i = period; i < data.length; i++) {
      ema = (data[i].close - ema) * multiplier + ema;
      emaValues.push({
        timestamp: data[i].timestamp,
        value: ema,
      });
    }
    
    return {
      name: `EMA${period}`,
      values: emaValues,
      color: period === 20 ? colors.secondary[500] : colors.secondary[300],
      visible: activeIndicators.includes(`EMA${period}`),
    };
  };

  // Calculate RSI
  const calculateRSI = (period: number = 14): TechnicalIndicator => {
    if (data.length < period + 1) return { name: 'RSI', values: [], color: colors.status.warning, visible: true };
    
    const rsiValues = [];
    let gains = 0;
    let losses = 0;

    // Initial calculation
    for (let i = 1; i <= period; i++) {
      const change = data[i].close - data[i - 1].close;
      if (change > 0) gains += change;
      else losses -= change;
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    for (let i = period; i < data.length; i++) {
      const change = data[i].close - data[i - 1].close;
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? -change : 0;

      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;

      const rs = avgGain / (avgLoss || 0.00001);
      const rsi = 100 - (100 / (1 + rs));

      rsiValues.push({
        timestamp: data[i].timestamp,
        value: rsi,
      });
    }

    return {
      name: 'RSI',
      values: rsiValues,
      color: colors.status.warning,
      visible: activeIndicators.includes('RSI'),
    };
  };

  // Get current technical indicators
  const technicalIndicators = useMemo(() => {
    const indicators: TechnicalIndicator[] = [];
    
    if (activeIndicators.includes('SMA20')) indicators.push(calculateSMA(20));
    if (activeIndicators.includes('SMA50')) indicators.push(calculateSMA(50));
    if (activeIndicators.includes('EMA20')) indicators.push(calculateEMA(20));
    if (activeIndicators.includes('EMA50')) indicators.push(calculateEMA(50));
    if (activeIndicators.includes('RSI')) indicators.push(calculateRSI());
    
    return indicators;
  }, [data, activeIndicators]);

  const toggleIndicator = (indicatorKey: string) => {
    setActiveIndicators(prev => {
      if (prev.includes(indicatorKey)) {
        return prev.filter(key => key !== indicatorKey);
      } else {
        return [...prev, indicatorKey];
      }
    });
  };

  const animatedChartStyle = useAnimatedStyle(() => ({
    opacity: chartOpacity.value,
  }));

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    height: withTiming(indicatorPanelHeight.value),
  }));

  const formatPrice = (price: number) => price.toFixed(5);
  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
    return volume.toFixed(0);
  };

  const chartHeight = isFullscreen ? Dimensions.get('window').height - 100 : 300;

  return (
    <View style={[styles.container, { height: chartHeight + 150 }]}>
      {/* Chart Header */}
      <View style={styles.header}>
        <View style={styles.symbolContainer}>
          <Text style={styles.symbolText}>{symbol}</Text>
          <View style={styles.priceContainer}>
            <Text style={[
              styles.currentPrice,
              { color: data.length > 1 && currentPrice > data[data.length - 2]?.close ? colors.chart.bullish : colors.chart.bearish }
            ]}>
              {formatPrice(currentPrice)}
            </Text>
            {data.length > 1 && (
              <Text style={[
                styles.priceChange,
                { color: currentPrice > data[data.length - 2]?.close ? colors.chart.bullish : colors.chart.bearish }
              ]}>
                {currentPrice > data[data.length - 2]?.close ? '↗' : '↘'} 
                {Math.abs(((currentPrice - data[data.length - 2]?.close) / data[data.length - 2]?.close) * 100).toFixed(2)}%
              </Text>
            )}
          </View>
        </View>

        {onFullscreenToggle && (
          <TouchableOpacity onPress={onFullscreenToggle} style={styles.fullscreenButton}>
            <Ionicons
              name={isFullscreen ? "contract" : "expand"}
              size={20}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Chart Type & Timeframe Controls */}
      <View style={styles.controlsContainer}>
        {/* Chart Type Toggle */}
        <View style={styles.chartTypeContainer}>
          <TouchableOpacity
            style={[styles.chartTypeButton, chartType === 'candle' && styles.chartTypeButtonActive]}
            onPress={() => setChartType('candle')}
          >
            <Ionicons name="stats-chart" size={16} color={chartType === 'candle' ? colors.background.primary : colors.text.secondary} />
            <Text style={[styles.chartTypeText, chartType === 'candle' && styles.chartTypeTextActive]}>
              Candles
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chartTypeButton, chartType === 'line' && styles.chartTypeButtonActive]}
            onPress={() => setChartType('line')}
          >
            <Ionicons name="trending-up" size={16} color={chartType === 'line' ? colors.background.primary : colors.text.secondary} />
            <Text style={[styles.chartTypeText, chartType === 'line' && styles.chartTypeTextActive]}>
              Line
            </Text>
          </TouchableOpacity>
        </View>

        {/* Timeframe Selector */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.timeframeScrollView}
          contentContainerStyle={styles.timeframeContainer}
        >
          {timeframes.map((timeframe) => (
            <TouchableOpacity
              key={timeframe.value}
              style={[
                styles.timeframeButton,
                selectedTimeframe === timeframe.value && styles.timeframeButtonActive,
              ]}
              onPress={() => onTimeframeChange(timeframe.value)}
            >
              <Text
                style={[
                  styles.timeframeText,
                  selectedTimeframe === timeframe.value && styles.timeframeTextActive,
                ]}
              >
                {timeframe.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Professional Chart */}
      <Animated.View style={[styles.chartWrapper, animatedChartStyle]}>
        {chartType === 'candle' ? (
          <CandlestickChart.Provider data={formattedData}>
            <CandlestickChart height={chartHeight - 50}>
              <CandlestickChart.Candles 
                positiveColor={colors.chart.bullish}
                negativeColor={colors.chart.bearish}
              />
              
              <CandlestickChart.Crosshair
                color={colors.text.tertiary}
              >
                <CandlestickChart.Tooltip />
              </CandlestickChart.Crosshair>
            </CandlestickChart>
          </CandlestickChart.Provider>
        ) : (
          <LineChart.Provider 
            data={formattedData.map(d => ({ timestamp: d.timestamp, value: d.close }))}
          >
            <LineChart height={chartHeight - 50}>
              <LineChart.Path color={colors.primary[500]} />
              <LineChart.CursorCrosshair 
                color={colors.text.tertiary}
              >
                <LineChart.Tooltip />
              </LineChart.CursorCrosshair>
            </LineChart>
          </LineChart.Provider>
        )}
      </Animated.View>

      {/* Technical Indicators Panel */}
      {showIndicators && (
        <Animated.View style={[styles.indicatorsPanel, animatedIndicatorStyle]}>
          <Text style={styles.indicatorsPanelTitle}>Technical Indicators</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.indicatorsContainer}
          >
            {indicatorOptions.map((indicator) => (
              <TouchableOpacity
                key={indicator.key}
                style={[
                  styles.indicatorButton,
                  activeIndicators.includes(indicator.key) && styles.indicatorButtonActive,
                  { borderColor: indicator.color }
                ]}
                onPress={() => toggleIndicator(indicator.key)}
              >
                <Text
                  style={[
                    styles.indicatorText,
                    activeIndicators.includes(indicator.key) && { color: indicator.color },
                  ]}
                >
                  {indicator.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* Crosshair Info Display */}
      {crosshairData && (
        <View style={styles.crosshairInfo}>
          <Text style={styles.crosshairText}>
            {chartType === 'candle' 
              ? `O: ${formatPrice(crosshairData.open)} H: ${formatPrice(crosshairData.high)} L: ${formatPrice(crosshairData.low)} C: ${formatPrice(crosshairData.close)}`
              : `Price: ${formatPrice(crosshairData.value)}`
            }
          </Text>
          <Text style={styles.crosshairText}>
            {new Date(crosshairData.timestamp).toLocaleString()}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    marginHorizontal: spacing[4],
    marginVertical: spacing[2],
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  symbolContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  symbolText: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  currentPrice: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.monospace,
    fontWeight: typography.weights.bold,
  },
  priceChange: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.monospace,
    fontWeight: typography.weights.medium,
  },
  fullscreenButton: {
    padding: spacing[2],
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.background.secondary,
  },
  chartTypeContainer: {
    flexDirection: 'row',
    borderRadius: 6,
    backgroundColor: colors.background.tertiary,
    padding: 2,
  },
  chartTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 4,
    gap: spacing[1],
  },
  chartTypeButtonActive: {
    backgroundColor: colors.primary[500],
  },
  chartTypeText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
  },
  chartTypeTextActive: {
    color: colors.background.primary,
    fontWeight: typography.weights.semibold,
  },
  timeframeScrollView: {
    flexGrow: 0,
  },
  timeframeContainer: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  timeframeButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 6,
    backgroundColor: colors.background.tertiary,
    minWidth: 40,
    alignItems: 'center',
  },
  timeframeButtonActive: {
    backgroundColor: colors.primary[500],
  },
  timeframeText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  timeframeTextActive: {
    color: colors.background.primary,
    fontWeight: typography.weights.bold,
  },
  chartWrapper: {
    flex: 1,
    paddingHorizontal: spacing[2],
  },
  indicatorsPanel: {
    backgroundColor: colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    overflow: 'hidden',
  },
  indicatorsPanelTitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
    paddingBottom: spacing[1],
  },
  indicatorsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
    gap: spacing[2],
  },
  indicatorButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border.primary,
    backgroundColor: colors.background.tertiary,
  },
  indicatorButtonActive: {
    backgroundColor: colors.background.primary,
  },
  indicatorText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.primary,
    color: colors.text.tertiary,
    fontWeight: typography.weights.medium,
  },
  crosshairInfo: {
    position: 'absolute',
    top: 80,
    left: spacing[4],
    backgroundColor: colors.overlay.card,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 6,
    minWidth: 200,
  },
  crosshairText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.monospace,
    color: colors.text.primary,
    lineHeight: 16,
  },
});

export default ProfessionalTradingChart;
