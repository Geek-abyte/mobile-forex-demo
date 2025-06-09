import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
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

interface SimpleTradingChartProps {
  data: CandlestickData[];
  symbol?: string;
  height?: number;
}

const SimpleTradingChart: React.FC<SimpleTradingChartProps> = ({
  data,
  symbol = 'EURUSD',
  height = 400,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [chartReady, setChartReady] = useState(false);
  const screenWidth = Dimensions.get('window').width;

  console.log('SimpleTradingChart render:', { dataLength: data.length, symbol, height });

  const generateSimpleHTML = () => {
    const chartData = JSON.stringify(data);
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://unpkg.com/lightweight-charts/dist/lightweight-charts.standalone.production.js"></script>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: ${colors.background.primary};
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }
        #container {
            width: 100%;
            height: ${height}px;
        }
        .info {
            position: absolute;
            top: 10px;
            left: 10px;
            color: ${colors.text.primary};
            font-size: 14px;
            z-index: 1000;
        }
    </style>
</head>
<body>
    <div class="info">Loading ${symbol}...</div>
    <div id="container"></div>
    
    <script>
        console.log('Script started');
        console.log('Data received:', ${chartData});
        
        try {
            const chart = LightweightCharts.createChart(document.getElementById('container'), {
                width: ${screenWidth},
                height: ${height},
                layout: {
                    background: { color: '${colors.background.primary}' },
                    textColor: '${colors.text.secondary}',
                },
                grid: {
                    vertLines: { color: '${colors.border.primary}' },
                    horzLines: { color: '${colors.border.primary}' },
                },
                crosshair: {
                    mode: LightweightCharts.CrosshairMode.Normal,
                },
                rightPriceScale: {
                    borderColor: '${colors.border.secondary}',
                },
                timeScale: {
                    borderColor: '${colors.border.secondary}',
                    timeVisible: true,
                    secondsVisible: false,
                },
            });

            const candlestickSeries = chart.addCandlestickSeries({
                upColor: '${colors.trading.profit}',
                downColor: '${colors.trading.loss}',
                borderVisible: false,
                wickUpColor: '${colors.trading.profit}',
                wickDownColor: '${colors.trading.loss}',
            });

            const data = ${chartData};
            console.log('About to set data:', data);
            
            if (data && data.length > 0) {
                candlestickSeries.setData(data);
                chart.timeScale().fitContent();
                console.log('Chart data set successfully');
                
                // Update info
                document.querySelector('.info').textContent = '${symbol} - ' + data.length + ' candles';
            } else {
                console.log('No data to display');
                document.querySelector('.info').textContent = 'No data available';
            }
            
            // Notify React Native that chart is ready
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'chartReady',
                    dataPoints: data.length
                }));
            }
            
        } catch (error) {
            console.error('Chart initialization error:', error);
            document.querySelector('.info').textContent = 'Error: ' + error.message;
        }
    </script>
</body>
</html>`;
  };

  const handleMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('Received WebView message:', message);
      
      if (message.type === 'chartReady') {
        setChartReady(true);
        console.log('Chart ready with', message.dataPoints, 'data points');
      }
    } catch (error) {
      console.warn('Message parse error:', error);
    }
  };

  useEffect(() => {
    console.log('SimpleTradingChart data updated:', { 
      length: data.length, 
      first: data[0], 
      last: data[data.length - 1] 
    });
  }, [data]);

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        ref={webViewRef}
        source={{ html: generateSimpleHTML() }}
        style={styles.webview}
        onMessage={handleMessage}
        onLoadEnd={() => {
          console.log('Simple chart WebView loaded');
        }}
        onError={(error) => {
          console.error('Simple chart WebView error:', error);
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        mixedContentMode="compatibility"
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default SimpleTradingChart;
