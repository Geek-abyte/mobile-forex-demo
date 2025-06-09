import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';

const { width, height } = Dimensions.get('window');

export interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface TradingViewChartProps {
  symbol: string;
  data: CandleData[];
  currentPrice: number;
  onTimeframeChange: (timeframe: string) => void;
  selectedTimeframe: string;
  isFullscreen?: boolean;
  onFullscreenToggle?: () => void;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol,
  data,
  currentPrice,
  onTimeframeChange,
  selectedTimeframe,
  isFullscreen = false,
  onFullscreenToggle,
}) => {
  const webviewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartReady, setChartReady] = useState(false);

  const timeframes = [
    { label: '1m', value: '1' },
    { label: '5m', value: '5' },
    { label: '15m', value: '15' },
    { label: '1h', value: '60' },
    { label: '4h', value: '240' },
    { label: '1d', value: '1D' },
  ];

  // Convert our data format to TradingView format
  const formatDataForTradingView = (data: CandleData[]) => {
    return data.map(candle => ({
      time: Math.floor(candle.timestamp / 1000), // TradingView expects seconds
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      volume: candle.volume || 0,
    }));
  };

  // TradingView chart HTML with professional forex configuration
  const chartHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <script type="text/javascript" src="https://unpkg.com/lightweight-charts/dist/lightweight-charts.standalone.production.js"></script>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #1a1a1a;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        #container {
            width: 100vw;
            height: 100vh;
            position: relative;
        }
        #chart {
            width: 100%;
            height: 100%;
        }
        .chart-controls {
            position: absolute;
            top: 10px;
            left: 10px;
            z-index: 100;
            display: flex;
            gap: 5px;
        }
        .control-btn {
            background: rgba(0, 0, 0, 0.7);
            color: white;
            border: 1px solid #333;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
        }
        .control-btn.active {
            background: #2962FF;
        }
        .price-line {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 14px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div id="container">
        <div class="chart-controls">
            <button class="control-btn" onclick="toggleChartType()">Candles</button>
            <button class="control-btn" onclick="addIndicator('SMA')">SMA</button>
            <button class="control-btn" onclick="addIndicator('EMA')">EMA</button>
            <button class="control-btn" onclick="addIndicator('RSI')">RSI</button>
            <button class="control-btn" onclick="addIndicator('MACD')">MACD</button>
        </div>
        <div class="price-line" id="priceDisplay">
            ${symbol}: ${currentPrice.toFixed(5)}
        </div>
        <div id="chart"></div>
    </div>

    <script>
        let chart;
        let candlestickSeries;
        let lineSeries;
        let currentChartType = 'candlestick';
        let indicators = {};
        
        // Professional forex chart configuration
        const chartOptions = {
            width: window.innerWidth,
            height: window.innerHeight,
            layout: {
                background: { 
                    type: 'solid', 
                    color: '#1a1a1a' 
                },
                textColor: '#d9d9d9',
            },
            grid: {
                vertLines: { 
                    color: '#2B2B43',
                    style: 1,
                    visible: true,
                },
                horzLines: { 
                    color: '#2B2B43',
                    style: 1,
                    visible: true,
                },
            },
            crosshair: {
                mode: 0, // Normal crosshair
                vertLine: {
                    width: 1,
                    color: '#758696',
                    style: 0,
                },
                horzLine: {
                    width: 1,
                    color: '#758696',
                    style: 0,
                },
            },
            priceScale: {
                borderColor: '#485c7b',
                autoScale: true,
                invertScale: false,
                alignLabels: true,
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.1,
                },
            },
            timeScale: {
                borderColor: '#485c7b',
                timeVisible: true,
                secondsVisible: false,
                rightOffset: 12,
                barSpacing: 8,
                minBarSpacing: 3,
            },
            rightPriceScale: {
                visible: true,
                borderColor: '#485c7b',
            },
            leftPriceScale: {
                visible: false,
            },
            handleScroll: {
                mouseWheel: true,
                pressedMouseMove: true,
                horzTouchDrag: true,
                vertTouchDrag: true,
            },
            handleScale: {
                axisPressedMouseMove: true,
                mouseWheel: true,
                pinch: true,
                axisDoubleClickReset: true,
            },
        };

        // Initialize chart
        function initChart() {
            chart = LightweightCharts.createChart(document.getElementById('chart'), chartOptions);
            
            // Create candlestick series (default)
            candlestickSeries = chart.addCandlestickSeries({
                upColor: '#26a69a',
                downColor: '#ef5350',
                borderVisible: false,
                wickUpColor: '#26a69a',
                wickDownColor: '#ef5350',
                priceFormat: {
                    type: 'price',
                    precision: 5,
                    minMove: 0.00001,
                },
            });

            // Handle resize
            window.addEventListener('resize', () => {
                chart.applyOptions({
                    width: window.innerWidth,
                    height: window.innerHeight,
                });
            });

            // Price line tracking
            chart.subscribeCrosshairMove((param) => {
                if (param.time) {
                    const data = param.seriesData.get(candlestickSeries || lineSeries);
                    if (data) {
                        const price = data.close || data.value || ${currentPrice};
                        document.getElementById('priceDisplay').textContent = 
                            '${symbol}: ' + price.toFixed(5);
                    }
                }
            });

            // Load initial data
            updateChartData();
            
            window.ReactNativeWebView?.postMessage(JSON.stringify({
                type: 'chartReady'
            }));
        }

        function updateChartData() {
            const chartData = ${JSON.stringify(formatDataForTradingView(data))};
            
            if (currentChartType === 'candlestick' && candlestickSeries) {
                candlestickSeries.setData(chartData);
            } else if (currentChartType === 'line' && lineSeries) {
                const lineData = chartData.map(d => ({
                    time: d.time,
                    value: d.close
                }));
                lineSeries.setData(lineData);
            }

            // Auto-scale to fit data
            chart.timeScale().fitContent();
        }

        function toggleChartType() {
            if (currentChartType === 'candlestick') {
                // Switch to line chart
                if (candlestickSeries) {
                    chart.removeSeries(candlestickSeries);
                    candlestickSeries = null;
                }
                
                lineSeries = chart.addLineSeries({
                    color: '#2962FF',
                    lineWidth: 2,
                    priceFormat: {
                        type: 'price',
                        precision: 5,
                        minMove: 0.00001,
                    },
                });
                
                currentChartType = 'line';
                document.querySelector('.chart-controls .control-btn').textContent = 'Line';
            } else {
                // Switch to candlestick chart
                if (lineSeries) {
                    chart.removeSeries(lineSeries);
                    lineSeries = null;
                }
                
                candlestickSeries = chart.addCandlestickSeries({
                    upColor: '#26a69a',
                    downColor: '#ef5350',
                    borderVisible: false,
                    wickUpColor: '#26a69a',
                    wickDownColor: '#ef5350',
                    priceFormat: {
                        type: 'price',
                        precision: 5,
                        minMove: 0.00001,
                    },
                });
                
                currentChartType = 'candlestick';
                document.querySelector('.chart-controls .control-btn').textContent = 'Candles';
            }
            
            updateChartData();
        }

        function addIndicator(type) {
            const chartData = ${JSON.stringify(formatDataForTradingView(data))};
            
            switch(type) {
                case 'SMA':
                    if (!indicators.sma) {
                        indicators.sma = chart.addLineSeries({
                            color: '#FF6B6B',
                            lineWidth: 1,
                            priceFormat: {
                                type: 'price',
                                precision: 5,
                                minMove: 0.00001,
                            },
                        });
                        
                        const smaData = calculateSMA(chartData, 20);
                        indicators.sma.setData(smaData);
                    } else {
                        chart.removeSeries(indicators.sma);
                        indicators.sma = null;
                    }
                    break;
                    
                case 'EMA':
                    if (!indicators.ema) {
                        indicators.ema = chart.addLineSeries({
                            color: '#4ECDC4',
                            lineWidth: 1,
                            priceFormat: {
                                type: 'price',
                                precision: 5,
                                minMove: 0.00001,
                            },
                        });
                        
                        const emaData = calculateEMA(chartData, 20);
                        indicators.ema.setData(emaData);
                    } else {
                        chart.removeSeries(indicators.ema);
                        indicators.ema = null;
                    }
                    break;

                case 'RSI':
                    if (!indicators.rsi) {
                        // RSI would go in a separate pane - simplified for now
                        window.ReactNativeWebView?.postMessage(JSON.stringify({
                            type: 'indicator',
                            name: 'RSI',
                            action: 'add'
                        }));
                    }
                    break;

                case 'MACD':
                    if (!indicators.macd) {
                        // MACD would go in a separate pane - simplified for now
                        window.ReactNativeWebView?.postMessage(JSON.stringify({
                            type: 'indicator',
                            name: 'MACD',
                            action: 'add'
                        }));
                    }
                    break;
            }
        }

        function calculateSMA(data, period) {
            const smaData = [];
            for (let i = period - 1; i < data.length; i++) {
                let sum = 0;
                for (let j = i - period + 1; j <= i; j++) {
                    sum += data[j].close;
                }
                smaData.push({
                    time: data[i].time,
                    value: sum / period
                });
            }
            return smaData;
        }

        function calculateEMA(data, period) {
            const emaData = [];
            const multiplier = 2 / (period + 1);
            let ema = data[0].close;
            
            emaData.push({
                time: data[0].time,
                value: ema
            });
            
            for (let i = 1; i < data.length; i++) {
                ema = (data[i].close * multiplier) + (ema * (1 - multiplier));
                emaData.push({
                    time: data[i].time,
                    value: ema
                });
            }
            return emaData;
        }

        // Update price in real-time
        function updateCurrentPrice(price) {
            document.getElementById('priceDisplay').textContent = 
                '${symbol}: ' + price.toFixed(5);
        }

        // Message handler for React Native
        window.addEventListener('message', function(event) {
            const data = JSON.parse(event.data);
            
            switch(data.type) {
                case 'updatePrice':
                    updateCurrentPrice(data.price);
                    break;
                case 'updateData':
                    updateChartData();
                    break;
                case 'changeTimeframe':
                    // Handle timeframe change
                    break;
            }
        });

        // Initialize when page loads
        document.addEventListener('DOMContentLoaded', initChart);
        
        // Fallback initialization
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initChart);
        } else {
            initChart();
        }
    </script>
</body>
</html>`;

  const handleMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      switch (message.type) {
        case 'chartReady':
          setIsLoading(false);
          setChartReady(true);
          break;
        case 'indicator':
          console.log(`${message.action} ${message.name} indicator`);
          break;
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  // Update chart when data changes
  useEffect(() => {
    if (chartReady && webviewRef.current) {
      webviewRef.current.postMessage(JSON.stringify({
        type: 'updateData',
        data: formatDataForTradingView(data)
      }));
    }
  }, [data, chartReady]);

  // Update current price
  useEffect(() => {
    if (chartReady && webviewRef.current) {
      webviewRef.current.postMessage(JSON.stringify({
        type: 'updatePrice',
        price: currentPrice
      }));
    }
  }, [currentPrice, chartReady]);

  const chartHeight = isFullscreen ? height : 300;

  return (
    <View style={[styles.container, { height: chartHeight }]}>
      {/* Timeframe Selector */}
      <View style={styles.timeframeContainer}>
        {timeframes.map((tf) => (
          <TouchableOpacity
            key={tf.label}
            style={[
              styles.timeframeButton,
              selectedTimeframe === tf.label && styles.timeframeButtonActive,
            ]}
            onPress={() => onTimeframeChange(tf.label)}
          >
            <Text
              style={[
                styles.timeframeText,
                selectedTimeframe === tf.label && styles.timeframeTextActive,
              ]}
            >
              {tf.label}
            </Text>
          </TouchableOpacity>
        ))}
        
        {/* Fullscreen Toggle */}
        {onFullscreenToggle && (
          <TouchableOpacity
            style={styles.fullscreenButton}
            onPress={onFullscreenToggle}
          >
            <Ionicons
              name={isFullscreen ? "contract" : "expand"}
              size={16}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Chart Container */}
      <View style={styles.chartContainer}>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
            <Text style={styles.loadingText}>Loading Chart...</Text>
          </View>
        )}
        
        <WebView
          ref={webviewRef}
          source={{ html: chartHTML }}
          style={styles.webview}
          onMessage={handleMessage}
          onLoadEnd={() => setIsLoading(false)}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error: ', nativeEvent);
            setIsLoading(false);
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mixedContentMode="compatibility"
          originWhitelist={['*']}
          scalesPageToFit={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
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
  timeframeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  timeframeButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    marginRight: spacing[2],
    borderRadius: 6,
    backgroundColor: colors.background.tertiary,
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
    fontWeight: typography.weights.semibold,
  },
  fullscreenButton: {
    marginLeft: 'auto',
    padding: spacing[2],
  },
  chartContainer: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    zIndex: 10,
  },
  loadingText: {
    marginTop: spacing[3],
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    color: colors.text.secondary,
  },
});

export default TradingViewChart;
