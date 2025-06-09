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

interface BasicTradingChartProps {
  data: CandlestickData[];
  symbol?: string;
  height?: number;
}

const BasicTradingChart: React.FC<BasicTradingChartProps> = ({
  data,
  symbol = 'EURUSD',
  height = 400,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [chartReady, setChartReady] = useState(false);
  const screenWidth = Dimensions.get('window').width;

  // Simple HTML with inline chart implementation
  const generateChartHTML = () => {
    // Ensure data is properly formatted and sorted
    const sortedData = [...data]
      .filter(item => item && typeof item.time === 'number' && 
                     typeof item.open === 'number' && 
                     typeof item.high === 'number' && 
                     typeof item.low === 'number' && 
                     typeof item.close === 'number')
      .sort((a, b) => a.time - b.time);

    console.log('BasicChart: Generating HTML with sorted data:', {
      originalLength: data.length,
      sortedLength: sortedData.length,
      firstItem: sortedData[0],
      lastItem: sortedData[sortedData.length - 1]
    });

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <script src="https://unpkg.com/lightweight-charts@4.1.1/dist/lightweight-charts.standalone.production.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: ${colors.background.primary};
            overflow: hidden;
            width: 100vw;
            height: 100vh;
        }
        #container {
            width: 100%;
            height: 100%;
            position: relative;
        }
        .status {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 8px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
        }
    </style>
</head>
<body>
    <div id="container">
        <div class="status" id="status">Initializing...</div>
    </div>

    <script>
        console.log('Chart script starting...');
        
        let chart;
        let candlestickSeries;
        const chartData = ${JSON.stringify(sortedData)};
        
        function updateStatus(message) {
            console.log('Status:', message);
            const statusEl = document.getElementById('status');
            if (statusEl) {
                statusEl.textContent = message;
            }
        }

        function initializeChart() {
            try {
                updateStatus('Creating chart...');
                console.log('Initializing chart with data points:', chartData.length);
                
                if (!window.LightweightCharts) {
                    console.error('LightweightCharts not loaded!');
                    updateStatus('Error: Chart library not loaded');
                    return;
                }

                if (!chartData || chartData.length === 0) {
                    console.error('No chart data available');
                    updateStatus('Error: No data');
                    return;
                }

                // Validate data format
                const firstItem = chartData[0];
                console.log('First data item:', firstItem);
                console.log('Data validation:', {
                    hasTime: typeof firstItem.time === 'number',
                    hasOHLC: typeof firstItem.open === 'number' && 
                             typeof firstItem.high === 'number' && 
                             typeof firstItem.low === 'number' && 
                             typeof firstItem.close === 'number'
                });

                const container = document.getElementById('container');
                if (!container) {
                    console.error('Container not found');
                    updateStatus('Error: Container not found');
                    return;
                }

                // Chart options
                const chartOptions = {
                    width: ${screenWidth},
                    height: ${height},
                    layout: {
                        background: { 
                            type: 'solid', 
                            color: '${colors.background.primary}' 
                        },
                        textColor: '${colors.text.primary}',
                    },
                    grid: {
                        vertLines: { color: '${colors.chart?.grid || '#2A2E39'}' },
                        horzLines: { color: '${colors.chart?.grid || '#2A2E39'}' },
                    },
                    crosshair: {
                        mode: LightweightCharts.CrosshairMode.Normal,
                    },
                    rightPriceScale: {
                        borderColor: '${colors.chart?.axis || '#2A2E39'}',
                        textColor: '${colors.text.secondary}',
                    },
                    timeScale: {
                        borderColor: '${colors.chart?.axis || '#2A2E39'}',
                        textColor: '${colors.text.secondary}',
                        timeVisible: true,
                        secondsVisible: false,
                    },
                };

                console.log('Creating chart with options:', chartOptions);
                chart = LightweightCharts.createChart(container, chartOptions);
                
                if (!chart) {
                    console.error('Failed to create chart');
                    updateStatus('Error: Chart creation failed');
                    return;
                }

                updateStatus('Adding candlestick series...');
                
                // Add candlestick series
                candlestickSeries = chart.addCandlestickSeries({
                    upColor: '#00D4AA',
                    downColor: '#FF4757',
                    borderVisible: false,
                    wickUpColor: '#00D4AA',
                    wickDownColor: '#FF4757',
                });

                if (!candlestickSeries) {
                    console.error('Failed to create candlestick series');
                    updateStatus('Error: Series creation failed');
                    return;
                }

                updateStatus('Setting data...');
                console.log('Setting data for series, first 3 items:', chartData.slice(0, 3));
                
                candlestickSeries.setData(chartData);
                
                updateStatus('Fitting content...');
                chart.timeScale().fitContent();
                
                updateStatus(\`Chart ready (\${chartData.length} points)\`);
                console.log('Chart initialization completed successfully');

                // Send ready message to React Native
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'chartReady',
                        dataPoints: chartData.length
                    }));
                }

            } catch (error) {
                console.error('Chart initialization error:', error);
                updateStatus(\`Error: \${error.message || 'Unknown error'}\`);
                
                // Send error message to React Native
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'chartError',
                        error: error.message || 'Unknown error'
                    }));
                }
            }
        }

        // Wait for everything to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeChart);
        } else {
            // DOM already loaded
            initializeChart();
        }

        // Also try after window load as fallback
        window.addEventListener('load', function() {
            if (!chart) {
                console.log('Retrying chart initialization after window load...');
                setTimeout(initializeChart, 100);
            }
        });

        console.log('Chart script setup complete');
    </script>
</body>
</html>`;
  };

  const handleMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('BasicChart received message:', message);
      
      if (message.type === 'chartReady') {
        console.log('Basic chart is ready with', message.dataPoints, 'data points');
      } else if (message.type === 'chartError') {
        console.error('Chart error:', message.error);
      }
    } catch (error) {
      console.warn('Chart message parse error:', error);
    }
  };

  const updateChartData = (newData: CandlestickData[]) => {
    console.log('BasicChart: updateChartData called with:', newData.length, 'points');
    
    if (webViewRef.current && chartReady) {
      // For now, just reload the WebView with new data
      webViewRef.current.reload();
    }
  };

  useEffect(() => {
    console.log('BasicChart: Data prop changed, length:', data.length);
    if (data.length > 0) {
      console.log('BasicChart: First item:', data[0]);
      console.log('BasicChart: Last item:', data[data.length - 1]);
    }
  }, [data]);

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        ref={webViewRef}
        source={{ html: generateChartHTML() }}
        style={styles.webview}
        onMessage={handleMessage}
        onLoadEnd={() => {
          console.log('BasicChart: WebView loaded successfully');
          setChartReady(true);
        }}
        onError={(syntheticEvent) => {
          console.error('BasicChart: WebView error:', syntheticEvent.nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          console.error('BasicChart: WebView HTTP error:', syntheticEvent.nativeEvent);
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        mixedContentMode="compatibility"
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        startInLoadingState={false}
        bounces={false}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
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

export default BasicTradingChart;
