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

interface ProfessionalTradingChartProps {
  data: CandlestickData[];
  symbol?: string;
  theme?: 'light' | 'dark';
  onCrosshairMove?: (data: any) => void;
  width?: number;
  height?: number;
}

const ProfessionalTradingChart: React.FC<ProfessionalTradingChartProps> = ({
  data,
  symbol = 'EURUSD',
  theme = 'dark',
  onCrosshairMove,
  width,
  height = 400,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [chartReady, setChartReady] = useState(false);
  const screenWidth = width || Dimensions.get('window').width;

  // Generate the HTML content for the chart
  const generateChartHTML = () => {
    // Add fallback test data if no data is provided
    const testData = data.length === 0 ? [
      { time: Math.floor(Date.now() / 1000) - 3600, open: 1.0845, high: 1.0865, low: 1.0835, close: 1.0855, volume: 100000 },
      { time: Math.floor(Date.now() / 1000) - 1800, open: 1.0855, high: 1.0875, low: 1.0845, close: 1.0865, volume: 120000 },
      { time: Math.floor(Date.now() / 1000), open: 1.0865, high: 1.0885, low: 1.0855, close: 1.0875, volume: 110000 },
    ] : data;
    
    const chartData = JSON.stringify(testData);
    const isDark = theme === 'dark';
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <script>
        window.console = window.console || { log: function() {}, error: function() {}, warn: function() {} };
        
        // Flag to track library loading
        window.lightweightChartsReady = false;
        
        // Callback for when library loads successfully
        window.onLightweightChartsLoad = function() {
            console.log('LightweightCharts library loaded successfully');
            window.lightweightChartsReady = true;
        };
        
        // Simple chart implementation using Canvas API as fallback
        function createSimpleChart() {
            console.log('Creating simple canvas chart');
            const container = document.getElementById('chart-container');
            if (!container) {
                console.error('Chart container not found');
                return;
            }
            
            // Clear container
            container.innerHTML = '';
            
            const canvas = document.createElement('canvas');
            canvas.width = ${screenWidth};
            canvas.height = ${height};
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            container.appendChild(canvas);
            
            const ctx = canvas.getContext('2d');
            
            // Draw background
            ctx.fillStyle = '${colors.background.primary}';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw grid
            ctx.strokeStyle = '${colors.chart.grid}';
            ctx.lineWidth = 1;
            for (let i = 0; i < canvas.width; i += 50) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, canvas.height);
                ctx.stroke();
            }
            for (let i = 0; i < canvas.height; i += 30) {
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(canvas.width, i);
                ctx.stroke();
            }
            
            // Draw candlesticks
            if (chartData && chartData.length > 0) {
                const padding = 60;
                const bottomPadding = 80; // Extra padding for bottom elements
                const candleWidth = Math.max(3, (canvas.width - 2 * padding) / chartData.length);
                
                // Find price range
                let minPrice = Math.min(...chartData.map(d => d.low));
                let maxPrice = Math.max(...chartData.map(d => d.high));
                const priceRange = maxPrice - minPrice;
                
                // Add 5% padding to price range
                const pricePadding = priceRange * 0.05;
                minPrice -= pricePadding;
                maxPrice += pricePadding;
                const adjustedRange = maxPrice - minPrice;
                
                chartData.forEach((candle, index) => {
                    const x = padding + index * candleWidth;
                    const high = padding + (maxPrice - candle.high) / adjustedRange * (canvas.height - padding - bottomPadding);
                    const low = padding + (maxPrice - candle.low) / adjustedRange * (canvas.height - padding - bottomPadding);
                    const open = padding + (maxPrice - candle.open) / adjustedRange * (canvas.height - padding - bottomPadding);
                    const close = padding + (maxPrice - candle.close) / adjustedRange * (canvas.height - padding - bottomPadding);
                    
                    // Determine color
                    const isBullish = candle.close >= candle.open;
                    const color = isBullish ? '${colors.chart.bullish}' : '${colors.chart.bearish}';
                    
                    // Draw wick (high-low line)
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(x + candleWidth/2, high);
                    ctx.lineTo(x + candleWidth/2, low);
                    ctx.stroke();
                    
                    // Draw body (open-close rectangle)
                    ctx.fillStyle = color;
                    const bodyHeight = Math.abs(close - open) || 1;
                    const bodyTop = Math.min(open, close);
                    const bodyWidth = Math.max(2, candleWidth - 2);
                    ctx.fillRect(x + 1, bodyTop, bodyWidth, bodyHeight);
                    
                    // Draw border for hollow candles if needed
                    if (!isBullish) {
                        ctx.strokeStyle = color;
                        ctx.lineWidth = 1;
                        ctx.strokeRect(x + 1, bodyTop, bodyWidth, bodyHeight);
                    }
                });
                
                // Draw title and symbol
                ctx.fillStyle = '${colors.text.primary}';
                ctx.font = 'bold 18px Arial';
                ctx.fillText('${symbol}', 15, 35);
                
                // Draw current price
                const latestCandle = chartData[chartData.length - 1];
                const priceColor = latestCandle.close >= latestCandle.open ? '${colors.chart.bullish}' : '${colors.chart.bearish}';
                ctx.fillStyle = priceColor;
                ctx.font = 'bold 16px Arial';
                ctx.fillText(latestCandle.close.toFixed(5), 15, 60);
                
                // Draw price labels on right side
                ctx.fillStyle = '${colors.text.secondary}';
                ctx.font = '12px Arial';
                ctx.textAlign = 'left';
                const priceSteps = 5;
                for (let i = 0; i <= priceSteps; i++) {
                    const priceLevel = minPrice + (adjustedRange * i / priceSteps);
                    const y = padding + (maxPrice - priceLevel) / adjustedRange * (canvas.height - padding - bottomPadding);
                    ctx.fillText(priceLevel.toFixed(4), canvas.width - 55, y + 4);
                    
                    // Draw horizontal price lines
                    ctx.strokeStyle = '${colors.chart.grid}';
                    ctx.lineWidth = 0.5;
                    ctx.setLineDash([2, 2]);
                    ctx.beginPath();
                    ctx.moveTo(padding, y);
                    ctx.lineTo(canvas.width - 60, y);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
                
                // Draw volume bars if available
                if (chartData[0]?.volume) {
                    const maxVolume = Math.max(...chartData.map(d => d.volume || 0));
                    const volumeHeight = 50; // Reduced height to fit better
                    const volumeY = canvas.height - bottomPadding + 10; // Position within bottom padding area
                    
                    chartData.forEach((candle, index) => {
                        if (candle.volume) {
                            const x = padding + index * candleWidth;
                            const barHeight = (candle.volume / maxVolume) * volumeHeight;
                            const isBullish = candle.close >= candle.open;
                            
                            ctx.fillStyle = isBullish ? '${colors.chart.bullish}40' : '${colors.chart.bearish}40';
                            ctx.fillRect(x + 1, volumeY + volumeHeight - barHeight, Math.max(2, candleWidth - 2), barHeight);
                        }
                    });
                    
                    // Volume label
                    ctx.fillStyle = '${colors.text.secondary}';
                    ctx.font = '10px Arial';
                    ctx.fillText('Volume', 15, volumeY - 5);
                }
                
            } else {
                // Draw "No Data" message
                ctx.fillStyle = '${colors.text.secondary}';
                ctx.font = '18px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('No chart data available', canvas.width / 2, canvas.height / 2);
                ctx.fillText('Loading...', canvas.width / 2, canvas.height / 2 + 30);
            }
            
            window.ReactNativeWebView?.postMessage(JSON.stringify({
                type: 'chartReady',
                success: true,
                chartType: 'simple'
            }));
        }
    </script>
    <script src="https://cdn.jsdelivr.net/npm/lightweight-charts@4.1.3/dist/lightweight-charts.standalone.production.js" 
            onload="console.log('LightweightCharts CDN loaded'); window.onLightweightChartsLoad();" 
            onerror="console.error('Failed to load LightweightCharts from CDN'); setTimeout(() => createSimpleChart(), 1000);"></script>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: ${colors.background.primary};
            overflow: hidden;
        }
        #chart-container {
            width: 100%;
            height: ${height}px;
        }
        .chart-toolbar {
            position: absolute;
            top: 10px;
            left: 10px;
            z-index: 1000;
            display: flex;
            gap: 8px;
        }
        .toolbar-button {
            padding: 6px 12px;
            background: ${colors.background.tertiary};
            color: ${colors.text.primary};
            border: 1px solid ${colors.border.primary};
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .toolbar-button:hover {
            background: ${colors.background.elevated};
            border-color: ${colors.border.accent};
        }
        .toolbar-button.active {
            background: ${colors.primary[500]};
            color: ${colors.text.inverse};
            border-color: ${colors.primary[500]};
        }
    </style>
</head>
<body>
    <div class="chart-toolbar">
        <button class="toolbar-button active" onclick="setChartType('candlestick')">Candles</button>
        <button class="toolbar-button" onclick="setChartType('line')">Line</button>
        <button class="toolbar-button" onclick="setChartType('area')">Area</button>
        <button class="toolbar-button" onclick="toggleMA()">MA</button>
        <button class="toolbar-button" onclick="toggleVolume()">Volume</button>
    </div>
    <div id="chart-container"></div>

    <script>
        let chart, candlestickSeries, lineSeries, areaSeries, volumeSeries, maSeries;
        let currentChartType = 'candlestick';
        let showMA = false;
        let showVolume = false;
        let chartData = ${chartData};

        // Initialize chart
        function initChart() {
            console.log('Initializing chart with data:', chartData.length, 'candles');
            console.log('LightweightCharts object:', typeof LightweightCharts, LightweightCharts);
            
            // Check if LightweightCharts is available
            if (typeof LightweightCharts === 'undefined') {
                console.error('LightweightCharts library not loaded');
                window.ReactNativeWebView?.postMessage(JSON.stringify({
                    type: 'chartError',
                    error: 'LightweightCharts library not loaded'
                }));
                return;
            }
            
            const chartOptions = {
                width: ${screenWidth},
                height: ${height},
                layout: {
                    background: { color: '${colors.background.primary}' },
                    textColor: '${colors.text.primary}',
                },
                grid: {
                    vertLines: { color: '${colors.chart.grid}' },
                    horzLines: { color: '${colors.chart.grid}' },
                },
                crosshair: {
                    mode: LightweightCharts.CrosshairMode.Normal,
                },
                rightPriceScale: {
                    borderColor: '${colors.border.primary}',
                },
                timeScale: {
                    borderColor: '${colors.border.primary}',
                    timeVisible: true,
                    secondsVisible: false,
                },
                watermark: {
                    visible: true,
                    fontSize: 24,
                    horzAlign: 'center',
                    vertAlign: 'center',
                    color: '${colors.overlay.blur}',
                    text: '${symbol}',
                },
            };

            try {
                chart = LightweightCharts.createChart(document.getElementById('chart-container'), chartOptions);
                console.log('Chart created successfully', chart);
                console.log('Chart methods:', Object.getOwnPropertyNames(chart));
                
                // Create candlestick series with app theme colors
                candlestickSeries = chart.addCandlestickSeries({
                    upColor: '${colors.chart.bullish}',
                    downColor: '${colors.chart.bearish}',
                    borderVisible: false,
                    wickUpColor: '${colors.chart.bullish}',
                    wickDownColor: '${colors.chart.bearish}',
                });
                console.log('Candlestick series created');

                // Set data
                if (chartData && chartData.length > 0) {
                    console.log('Setting chart data:', chartData);
                    candlestickSeries.setData(chartData);
                    console.log('Chart data set successfully');
                } else {
                    console.warn('No chart data available');
                }

                // Add crosshair move listener
                chart.subscribeCrosshairMove(function(param) {
                    if (param.time) {
                        const data = param.seriesData.get(candlestickSeries);
                        if (data) {
                            window.ReactNativeWebView?.postMessage(JSON.stringify({
                                type: 'crosshairMove',
                                data: data,
                                time: param.time
                            }));
                        }
                    }
                });

                // Fit content
                chart.timeScale().fitContent();
                console.log('Chart initialization complete');
                
                // Send ready message to React Native
                window.ReactNativeWebView?.postMessage(JSON.stringify({
                    type: 'chartReady',
                    success: true
                }));
                
            } catch (error) {
                console.error('Chart initialization error:', error);
                window.ReactNativeWebView?.postMessage(JSON.stringify({
                    type: 'chartError',
                    error: error.message
                }));
            }
        }

        function setChartType(type) {
            // Update toolbar buttons
            document.querySelectorAll('.toolbar-button').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');

            if (type === currentChartType) return;
            
            // Remove current series
            if (currentChartType === 'candlestick' && candlestickSeries) {
                chart.removeSeries(candlestickSeries);
            } else if (currentChartType === 'line' && lineSeries) {
                chart.removeSeries(lineSeries);
            } else if (currentChartType === 'area' && areaSeries) {
                chart.removeSeries(areaSeries);
            }

            currentChartType = type;

            // Add new series
            if (type === 'candlestick') {
                candlestickSeries = chart.addCandlestickSeries({
                    upColor: '${colors.chart.bullish}',
                    downColor: '${colors.chart.bearish}',
                    borderVisible: false,
                    wickUpColor: '${colors.chart.bullish}',
                    wickDownColor: '${colors.chart.bearish}',
                });
                candlestickSeries.setData(chartData);
            } else if (type === 'line') {
                lineSeries = chart.addLineSeries({
                    color: '${colors.primary[500]}',
                    lineWidth: 2,
                });
                const lineData = chartData.map(d => ({ time: d.time, value: d.close }));
                lineSeries.setData(lineData);
            } else if (type === 'area') {
                areaSeries = chart.addAreaSeries({
                    topColor: '${colors.primary[500]}40',
                    bottomColor: '${colors.primary[500]}00',
                    lineColor: '${colors.primary[500]}',
                    lineWidth: 2,
                });
                const areaData = chartData.map(d => ({ time: d.time, value: d.close }));
                areaSeries.setData(areaData);
            }
        }

        function toggleMA() {
            if (!showMA) {
                // Add moving average
                maSeries = chart.addLineSeries({
                    color: '${colors.secondary[500]}',
                    lineWidth: 1,
                });
                const maData = calculateMA(chartData, 20);
                maSeries.setData(maData);
                showMA = true;
                event.target.classList.add('active');
            } else {
                // Remove moving average
                if (maSeries) {
                    chart.removeSeries(maSeries);
                    maSeries = null;
                }
                showMA = false;
                event.target.classList.remove('active');
            }
        }

        function toggleVolume() {
            if (!showVolume && chartData[0]?.volume) {
                // Add volume series
                volumeSeries = chart.addHistogramSeries({
                    color: '${colors.chart.volume}80',
                    priceFormat: {
                        type: 'volume',
                    },
                    priceScaleId: '',
                });
                chart.priceScale('').applyOptions({
                    scaleMargins: {
                        top: 0.8,
                        bottom: 0,
                    },
                });
                const volumeData = chartData.map(d => ({ 
                    time: d.time, 
                    value: d.volume || 0,
                    color: d.close >= d.open ? '${colors.chart.bullish}80' : '${colors.chart.bearish}80'
                }));
                volumeSeries.setData(volumeData);
                showVolume = true;
                event.target.classList.add('active');
            } else {
                // Remove volume series
                if (volumeSeries) {
                    chart.removeSeries(volumeSeries);
                    volumeSeries = null;
                }
                showVolume = false;
                event.target.classList.remove('active');
            }
        }

        function calculateMA(data, period) {
            const result = [];
            for (let i = period - 1; i < data.length; i++) {
                let sum = 0;
                for (let j = 0; j < period; j++) {
                    sum += data[i - j].close;
                }
                result.push({
                    time: data[i].time,
                    value: sum / period
                });
            }
            return result;
        }

        function updateData(newData) {
            chartData = newData;
            if (currentChartType === 'candlestick' && candlestickSeries) {
                candlestickSeries.setData(newData);
            } else if (currentChartType === 'line' && lineSeries) {
                const lineData = newData.map(d => ({ time: d.time, value: d.close }));
                lineSeries.setData(lineData);
            } else if (currentChartType === 'area' && areaSeries) {
                const areaData = newData.map(d => ({ time: d.time, value: d.close }));
                areaSeries.setData(areaData);
            }
            
            if (showMA && maSeries) {
                const maData = calculateMA(newData, 20);
                maSeries.setData(maData);
            }
            
            if (showVolume && volumeSeries && newData[0]?.volume) {
                const volumeData = newData.map(d => ({ 
                    time: d.time, 
                    value: d.volume || 0,
                    color: d.close >= d.open ? '${colors.chart.bullish}80' : '${colors.chart.bearish}80'
                }));
                volumeSeries.setData(volumeData);
            }
        }

        // Initialize chart when page loads
        function initChartWhenReady() {
            console.log('Initializing chart - WebView environment detected');
            console.log('Available data:', chartData.length, 'candles');
            
            // For WebView compatibility, use simple canvas chart by default
            // WebView environments often have issues with external CDN loading
            console.log('Using simple canvas chart for WebView compatibility');
            createSimpleChart();
            
            // Uncomment below to attempt LightweightCharts loading
            /*
            console.log('LightweightCharts type:', typeof LightweightCharts);
            if (typeof LightweightCharts !== 'undefined' && LightweightCharts.createChart) {
                console.log('LightweightCharts is available, using professional chart');
                initChart();
            } else {
                console.log('LightweightCharts not available, trying again in 500ms...');
                let retries = 0;
                const maxRetries = 3;
                const tryAgain = () => {
                    retries++;
                    console.log('Retry', retries, '- LightweightCharts type:', typeof LightweightCharts);
                    if (typeof LightweightCharts !== 'undefined' && LightweightCharts.createChart) {
                        console.log('LightweightCharts loaded after', retries, 'retries');
                        initChart();
                    } else if (retries < maxRetries) {
                        setTimeout(tryAgain, 1000);
                    } else {
                        console.log('LightweightCharts failed to load, falling back to simple chart');
                        createSimpleChart();
                    }
                };
                setTimeout(tryAgain, 500);
            }
            */
        }
        
        window.addEventListener('load', initChartWhenReady);
        
        // Also try to initialize after a delay in case the load event already fired
        setTimeout(initChartWhenReady, 500);

        // Handle messages from React Native
        window.addEventListener('message', function(event) {
            const data = JSON.parse(event.data);
            if (data.type === 'updateData') {
                updateData(data.data);
            }
        });
    </script>
</body>
</html>`;
  };

  const handleMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('Chart message received:', message);
      
      if (message.type === 'crosshairMove' && onCrosshairMove) {
        onCrosshairMove(message);
      } else if (message.type === 'chartReady') {
        console.log('Chart is ready');
        setChartReady(true);
      } else if (message.type === 'chartError') {
        console.error('Chart error:', message.error);
      }
    } catch (error) {
      console.warn('Chart message parse error:', error);
    }
  };

  const updateChartData = (newData: CandlestickData[]) => {
    if (webViewRef.current && chartReady) {
      const message = JSON.stringify({
        type: 'updateData',
        data: newData,
      });
      webViewRef.current.postMessage(message);
    }
  };

  useEffect(() => {
    if (chartReady && data.length > 0) {
      updateChartData(data);
    }
  }, [data, chartReady]);

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        ref={webViewRef}
        source={{ html: generateChartHTML() }}
        style={styles.webview}
        onMessage={handleMessage}
        onLoadEnd={() => {
          console.log('WebView loaded');
          // Don't set chartReady here, wait for the chart initialization message
        }}
        onError={(error) => {
          console.error('WebView error:', error);
        }}
        onHttpError={(error) => {
          console.error('WebView HTTP error:', error);
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        originWhitelist={['*']}
        mixedContentMode="compatibility"
        allowsFullscreenVideo={false}
        allowsLinkPreview={false}
        allowsBackForwardNavigationGestures={false}
        bounces={false}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
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
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default ProfessionalTradingChart;
