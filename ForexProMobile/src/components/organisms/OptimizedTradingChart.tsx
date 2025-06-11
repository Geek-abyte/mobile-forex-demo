import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors } from '../../theme';

export interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface OptimizedTradingChartProps {
  data: CandlestickData[];
  symbol?: string;
  theme?: 'light' | 'dark';
  onCrosshairMove?: (data: any) => void;
  width?: number;
  height?: number;
  timeframe?: string;
  isFullscreen?: boolean;
  onFullscreenChange?: (fullscreen: boolean) => void;
}

const OptimizedTradingChart: React.FC<OptimizedTradingChartProps> = ({
  data = [],
  symbol = 'EURUSD',
  theme = 'dark',
  onCrosshairMove,
  width,
  height = 300,
  timeframe = '1h',
  isFullscreen = false,
  onFullscreenChange,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [chartReady, setChartReady] = useState(false);
  const [chartType, setChartType] = useState<'candlestick' | 'line' | 'area'>('candlestick');
  const screenWidth = width || Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  // Generate optimized chart HTML
  const generateChartHTML = () => {
    const chartData = JSON.stringify(data.filter(item => item && typeof item.time === 'number'));
    const chartWidth = isFullscreen ? screenWidth : screenWidth;
    const chartHeight = isFullscreen ? screenHeight : height;
    
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
            height: ${isFullscreen ? '100vh' : chartHeight + 'px'};
            position: relative;
            background: ${colors.background.primary};
            overflow: hidden;
        }
        
        /* Compact Header Bar - Only for non-fullscreen */
        ${!isFullscreen ? `
        .chart-header {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 44px;
            background: ${colors.background.secondary}F0;
            backdrop-filter: blur(12px);
            border-bottom: 1px solid ${colors.border.primary}40;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 12px;
        }
        
        .chart-info {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
            min-width: 0;
        }
        
        .symbol-price {
            font-size: 14px;
            font-weight: 600;
            color: ${colors.text.primary};
            white-space: nowrap;
        }
        
        .price-change {
            font-size: 12px;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 500;
        }
        
        .price-change.positive {
            color: ${colors.trading.profit};
            background: ${colors.trading.profit}20;
        }
        
        .price-change.negative {
            color: ${colors.trading.loss};
            background: ${colors.trading.loss}20;
        }
        
        .chart-controls {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .control-group {
            display: flex;
            background: ${colors.background.tertiary};
            border-radius: 6px;
            overflow: hidden;
            border: 1px solid ${colors.border.primary}40;
        }
        
        .control-btn {
            padding: 6px 10px;
            background: transparent;
            color: ${colors.text.secondary};
            border: none;
            font-size: 11px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            border-right: 1px solid ${colors.border.primary}40;
        }
        
        .control-btn:last-child {
            border-right: none;
        }
        
        .control-btn:hover,
        .control-btn.active {
            background: ${colors.primary[500]};
            color: ${colors.text.inverse};
        }
        
        .expand-btn {
            padding: 8px;
            background: ${colors.background.tertiary};
            color: ${colors.text.secondary};
            border: 1px solid ${colors.border.primary}40;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.2s ease;
        }
        
        .expand-btn:hover {
            background: ${colors.primary[500]};
            color: ${colors.text.inverse};
            border-color: ${colors.primary[500]};
        }
        ` : ''}
        
        /* Fullscreen Header - Better positioned */
        ${isFullscreen ? `
        .fullscreen-header {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 60px;
            background: ${colors.background.secondary}F5;
            backdrop-filter: blur(16px);
            border-bottom: 1px solid ${colors.border.primary}60;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 20px;
        }
        
        .fullscreen-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        
        .fullscreen-symbol {
            font-size: 18px;
            font-weight: 700;
            color: ${colors.text.primary};
        }
        
        .fullscreen-details {
            display: flex;
            align-items: center;
            gap: 16px;
            font-size: 13px;
        }
        
        .price-display {
            color: ${colors.text.primary};
            font-weight: 600;
        }
        
        .ohlc-display {
            color: ${colors.text.secondary};
            display: flex;
            gap: 12px;
        }
        
        .fullscreen-controls {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .chart-type-selector {
            display: flex;
            background: ${colors.background.tertiary};
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid ${colors.border.primary}40;
        }
        
        .type-btn {
            padding: 8px 14px;
            background: transparent;
            color: ${colors.text.secondary};
            border: none;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            border-right: 1px solid ${colors.border.primary}40;
        }
        
        .type-btn:last-child {
            border-right: none;
        }
        
        .type-btn:hover,
        .type-btn.active {
            background: ${colors.primary[500]};
            color: ${colors.text.inverse};
        }
        
        .fullscreen-actions {
            display: flex;
            gap: 8px;
        }
        
        .action-btn {
            padding: 10px;
            background: ${colors.background.tertiary};
            color: ${colors.text.secondary};
            border: 1px solid ${colors.border.primary}40;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.2s ease;
        }
        
        .action-btn:hover {
            background: ${colors.primary[500]};
            color: ${colors.text.inverse};
            border-color: ${colors.primary[500]};
        }
        ` : ''}
        
        /* Crosshair Info - Better positioned */
        .crosshair-info {
            position: absolute;
            ${isFullscreen ? 'top: 70px;' : 'top: 54px;'}
            left: 12px;
            background: ${colors.background.secondary}F0;
            backdrop-filter: blur(12px);
            border: 1px solid ${colors.border.primary}40;
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 11px;
            color: ${colors.text.primary};
            z-index: 999;
            display: none;
            max-width: 280px;
        }
        
        .crosshair-info.visible {
            display: block;
        }
        
        .crosshair-row {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 2px;
        }
        
        .crosshair-row:last-child {
            margin-bottom: 0;
        }
        
        .crosshair-label {
            color: ${colors.text.secondary};
            min-width: 20px;
        }
        
        .crosshair-value {
            color: ${colors.text.primary};
            font-weight: 500;
        }
        
        /* Loading State */
        .loading-overlay {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: ${colors.text.secondary};
            font-size: 14px;
            z-index: 998;
        }
        
        /* Chart area adjustment */
        .chart-area {
            position: absolute;
            ${isFullscreen ? 'top: 60px;' : 'top: 44px;'}
            left: 0;
            right: 0;
            bottom: 0;
        }
        
        /* Hide scrollbars */
        ::-webkit-scrollbar {
            display: none;
        }
        
        /* Responsive adjustments */
        @media (max-width: 480px) {
            .chart-controls {
                gap: 4px;
            }
            
            .control-btn {
                padding: 4px 6px;
                font-size: 10px;
            }
            
            .symbol-price {
                font-size: 12px;
            }
            
            ${isFullscreen ? `
            .fullscreen-details {
                flex-direction: column;
                align-items: flex-start;
                gap: 4px;
            }
            
            .ohlc-display {
                gap: 8px;
                font-size: 11px;
            }
            ` : ''}
        }
    </style>
</head>
<body>
    ${!isFullscreen ? `
    <div class="chart-header">
        <div class="chart-info">
            <div class="symbol-price" id="symbol-display">${symbol}</div>
            <div class="price-change positive" id="price-change">+0.00%</div>
        </div>
        
        <div class="chart-controls">
            <div class="control-group">
                <button class="control-btn active" onclick="setChartType('candlestick')" data-type="candlestick">Candles</button>
                <button class="control-btn" onclick="setChartType('line')" data-type="line">Line</button>
                <button class="control-btn" onclick="setChartType('area')" data-type="area">Area</button>
            </div>
            
            <button class="expand-btn" onclick="toggleFullscreen()" title="Fullscreen">⛶</button>
        </div>
    </div>
    ` : `
    <div class="fullscreen-header">
        <div class="fullscreen-info">
            <div class="fullscreen-symbol">${symbol}</div>
            <div class="fullscreen-details">
                <div class="price-display" id="current-price">Loading...</div>
                <div class="ohlc-display" id="ohlc-display">
                    <span>O: --</span>
                    <span>H: --</span>
                    <span>L: --</span>
                    <span>C: --</span>
                </div>
            </div>
        </div>
        
        <div class="fullscreen-controls">
            <div class="chart-type-selector">
                <button class="type-btn active" onclick="setChartType('candlestick')" data-type="candlestick">Candlesticks</button>
                <button class="type-btn" onclick="setChartType('line')" data-type="line">Line</button>
                <button class="type-btn" onclick="setChartType('area')" data-type="area">Area</button>
            </div>
            
            <div class="fullscreen-actions">
                <button class="action-btn" onclick="resetZoom()" title="Reset Zoom">🎯</button>
                <button class="action-btn" onclick="toggleFullscreen()" title="Exit Fullscreen">✕</button>
            </div>
        </div>
    </div>
    `}
    
    <div class="crosshair-info" id="crosshair-info">
        <div class="crosshair-row">
            <span class="crosshair-label">O:</span>
            <span class="crosshair-value" id="crosshair-open">--</span>
            <span class="crosshair-label">H:</span>
            <span class="crosshair-value" id="crosshair-high">--</span>
        </div>
        <div class="crosshair-row">
            <span class="crosshair-label">L:</span>
            <span class="crosshair-value" id="crosshair-low">--</span>
            <span class="crosshair-label">C:</span>
            <span class="crosshair-value" id="crosshair-close">--</span>
        </div>
        <div class="crosshair-row">
            <span class="crosshair-label">Time:</span>
            <span class="crosshair-value" id="crosshair-time">--</span>
        </div>
    </div>
    
    <div class="loading-overlay" id="loading" style="display: ${chartData && JSON.parse(chartData).length > 0 ? 'none' : 'block'};">
        Loading chart data...
    </div>
    
    <div class="chart-area">
        <div id="chart-container"></div>
    </div>

    <script>
        let chart, candlestickSeries, lineSeries, areaSeries;
        let currentChartType = 'candlestick';
        let chartData = ${chartData};
        let isFullscreen = ${isFullscreen};
        
        console.log('Chart initialization starting...', {
            dataLength: chartData ? chartData.length : 0,
            isFullscreen: isFullscreen
        });

        function initChart() {
            const container = document.getElementById('chart-container');
            if (!container) {
                console.error('Chart container not found');
                return;
            }

            // Chart configuration
            const chartOptions = {
                width: container.clientWidth,
                height: container.clientHeight,
                layout: {
                    background: {
                        type: 'solid',
                        color: '${colors.background.primary}',
                    },
                    textColor: '${colors.text.primary}',
                    fontSize: 11,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                },
                grid: {
                    vertLines: {
                        color: '${colors.border.primary}40',
                        style: 1,
                        visible: true,
                    },
                    horzLines: {
                        color: '${colors.border.primary}40',
                        style: 1,
                        visible: true,
                    },
                },
                crosshair: {
                    mode: LightweightCharts.CrosshairMode.Normal,
                    vertLine: {
                        color: '${colors.text.secondary}80',
                        width: 1,
                        style: 1,
                        visible: true,
                        labelVisible: true,
                    },
                    horzLine: {
                        color: '${colors.text.secondary}80',
                        width: 1,
                        style: 1,
                        visible: true,
                        labelVisible: true,
                    },
                },
                rightPriceScale: {
                    borderColor: '${colors.border.primary}60',
                    textColor: '${colors.text.secondary}',
                    scaleMargins: {
                        top: 0.05,
                        bottom: 0.05,
                    },
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
                    vertTouchDrag: true,
                },
                handleScale: {
                    axisPressedMouseMove: true,
                    mouseWheel: true,
                    pinch: true,
                },
            };

            try {
                chart = LightweightCharts.createChart(container, chartOptions);
                
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
                });

                lineSeries = chart.addLineSeries({
                    color: '${colors.primary[500]}',
                    lineWidth: 2,
                    visible: false,
                    priceFormat: {
                        type: 'price',
                        precision: 5,
                        minMove: 0.00001,
                    },
                });

                areaSeries = chart.addAreaSeries({
                    lineColor: '${colors.primary[500]}',
                    topColor: '${colors.primary[500]}40',
                    bottomColor: '${colors.primary[500]}10',
                    lineWidth: 2,
                    visible: false,
                    priceFormat: {
                        type: 'price',
                        precision: 5,
                        minMove: 0.00001,
                    },
                });

                // Set data if available
                if (chartData && chartData.length > 0) {
                    console.log('Setting chart data:', chartData.length, 'candles');
                    updateChartData();
                    hideLoading();
                    
                    // Fit content
                    setTimeout(() => {
                        chart.timeScale().fitContent();
                    }, 100);
                } else {
                    console.log('No chart data available');
                }

                // Add crosshair listener
                chart.subscribeCrosshairMove(handleCrosshairMove);

                // Handle resize
                const resizeObserver = new ResizeObserver(entries => {
                    const { width, height } = entries[0].contentRect;
                    chart.applyOptions({ width, height });
                });
                resizeObserver.observe(container);

                console.log('Chart initialization complete');
                
                // Notify React Native
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'chartReady',
                        success: true
                    }));
                }

            } catch (error) {
                console.error('Chart initialization failed:', error);
                showError('Failed to initialize chart');
            }
        }

        function updateChartData() {
            if (!chartData || chartData.length === 0) return;

            try {
                // Set data to all series
                candlestickSeries.setData(chartData);
                
                // Convert OHLC to close prices for line/area
                const closePrices = chartData.map(item => ({
                    time: item.time,
                    value: item.close
                }));
                
                lineSeries.setData(closePrices);
                areaSeries.setData(closePrices);

                // Update price display
                const lastCandle = chartData[chartData.length - 1];
                if (lastCandle) {
                    updatePriceDisplay(lastCandle);
                }

            } catch (error) {
                console.error('Error updating chart data:', error);
            }
        }

        function setChartType(type) {
            currentChartType = type;
            
            // Update button states
            document.querySelectorAll('[data-type]').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector(\`[data-type="\${type}"]\`).classList.add('active');

            // Show/hide series
            candlestickSeries.applyOptions({ visible: type === 'candlestick' });
            lineSeries.applyOptions({ visible: type === 'line' });
            areaSeries.applyOptions({ visible: type === 'area' });

            console.log('Chart type changed to:', type);
        }

        function handleCrosshairMove(param) {
            const crosshairInfo = document.getElementById('crosshair-info');
            
            if (param.time && param.seriesData.size > 0) {
                // Show crosshair info
                crosshairInfo.classList.add('visible');
                
                // Get data from active series
                let data = null;
                if (currentChartType === 'candlestick' && param.seriesData.has(candlestickSeries)) {
                    data = param.seriesData.get(candlestickSeries);
                } else if (currentChartType === 'line' && param.seriesData.has(lineSeries)) {
                    const lineData = param.seriesData.get(lineSeries);
                    data = { open: lineData.value, high: lineData.value, low: lineData.value, close: lineData.value };
                } else if (currentChartType === 'area' && param.seriesData.has(areaSeries)) {
                    const areaData = param.seriesData.get(areaSeries);
                    data = { open: areaData.value, high: areaData.value, low: areaData.value, close: areaData.value };
                }
                
                if (data) {
                    updateCrosshairInfo(data, param.time);
                }
            } else {
                // Hide crosshair info
                crosshairInfo.classList.remove('visible');
            }
        }

        function updateCrosshairInfo(data, time) {
            document.getElementById('crosshair-open').textContent = data.open?.toFixed(5) || '--';
            document.getElementById('crosshair-high').textContent = data.high?.toFixed(5) || '--';
            document.getElementById('crosshair-low').textContent = data.low?.toFixed(5) || '--';
            document.getElementById('crosshair-close').textContent = data.close?.toFixed(5) || '--';
            
            // Format time
            const date = new Date(time * 1000);
            document.getElementById('crosshair-time').textContent = date.toLocaleTimeString();
        }

        function updatePriceDisplay(candle) {
            if (isFullscreen) {
                const currentPrice = document.getElementById('current-price');
                const ohlcDisplay = document.getElementById('ohlc-display');
                
                if (currentPrice) {
                    currentPrice.textContent = candle.close.toFixed(5);
                }
                
                if (ohlcDisplay) {
                    ohlcDisplay.innerHTML = \`
                        <span>O: \${candle.open.toFixed(5)}</span>
                        <span>H: \${candle.high.toFixed(5)}</span>
                        <span>L: \${candle.low.toFixed(5)}</span>
                        <span>C: \${candle.close.toFixed(5)}</span>
                    \`;
                }
            } else {
                // Update compact price display
                const priceChange = document.getElementById('price-change');
                if (priceChange && chartData.length > 1) {
                    const prevCandle = chartData[chartData.length - 2];
                    const change = candle.close - prevCandle.close;
                    const changePercent = (change / prevCandle.close * 100);
                    
                    priceChange.textContent = \`\${changePercent >= 0 ? '+' : ''}\${changePercent.toFixed(2)}%\`;
                    priceChange.className = \`price-change \${changePercent >= 0 ? 'positive' : 'negative'}\`;
                }
            }
        }

        function resetZoom() {
            if (chart) {
                chart.timeScale().fitContent();
            }
        }

        function toggleFullscreen() {
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'toggleFullscreen'
                }));
            }
        }

        function hideLoading() {
            const loading = document.getElementById('loading');
            if (loading) {
                loading.style.display = 'none';
            }
        }

        function showError(message) {
            const loading = document.getElementById('loading');
            if (loading) {
                loading.textContent = message;
                loading.style.color = '${colors.status.error}';
                loading.style.display = 'block';
            }
        }

        // Initialize chart when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initChart);
        } else {
            initChart();
        }

        // Update data when new data is received
        window.updateChartData = function(newData) {
            if (newData && newData.length > 0) {
                chartData = newData;
                updateChartData();
                hideLoading();
            }
        };

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
          setChartReady(true);
          break;
          
        case 'toggleFullscreen':
          onFullscreenChange?.(!isFullscreen);
          break;
          
        case 'crosshairMove':
          onCrosshairMove?.(message.data);
          break;
          
        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  // Update chart data when props change
  useEffect(() => {
    if (chartReady && webViewRef.current && data.length > 0) {
      const jsCode = `
        if (typeof updateChartData === 'function') {
          updateChartData(${JSON.stringify(data)});
        }
      `;
      
      webViewRef.current.postMessage(jsCode);
    }
  }, [data, chartReady]);

  const chartHTML = generateChartHTML();

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        ref={webViewRef}
        source={{ html: chartHTML }}
        style={styles.webview}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        scalesPageToFit={false}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="always"
        allowsFullscreenVideo={false}
        bounces={false}
        overScrollMode="never"
        nestedScrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
});

export default OptimizedTradingChart;
