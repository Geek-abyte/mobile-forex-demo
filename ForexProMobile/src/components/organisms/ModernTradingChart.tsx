import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
  Text,
  Modal,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../../theme';

export interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface ModernTradingChartProps {
  data: CandlestickData[];
  symbol?: string;
  theme?: 'light' | 'dark';
  onCrosshairMove?: (data: any) => void;
  width?: number;
  height?: number;
  timeframe?: string;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

const ModernTradingChart: React.FC<ModernTradingChartProps> = ({
  data = [],
  symbol = 'EURUSD',
  theme = 'dark',
  onCrosshairMove,
  width,
  height = 300,
  timeframe = '1h',
  onFullscreenChange,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [chartReady, setChartReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const screenWidth = width || Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  // Generate the HTML content for the enhanced chart
  const generateChartHTML = () => {
    const chartData = JSON.stringify(data.filter(item => item && typeof item.time === 'number'));
    const chartWidth = isFullscreen ? screenWidth : screenWidth;
    const chartHeight = isFullscreen ? screenHeight - 120 : height;
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <script src="https://unpkg.com/lightweight-charts@4.1.3/dist/lightweight-charts.standalone.production.js"></script>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: ${colors.background.primary};
            overflow: hidden;
            touch-action: none;
            user-select: none;
        }
        
        #chart-container {
            width: 100%;
            height: ${chartHeight}px;
            position: relative;
            background: ${colors.background.primary};
        }
        
        .chart-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            z-index: 1000;
        }
        
        .chart-toolbar {
            position: absolute;
            top: 12px;
            left: 12px;
            z-index: 1001;
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            max-width: 280px;
            pointer-events: auto;
        }
        
        .chart-controls {
            position: absolute;
            top: 12px;
            right: 12px;
            z-index: 1001;
            display: flex;
            gap: 8px;
            pointer-events: auto;
        }
        
        .toolbar-btn {
            padding: 8px 12px;
            background: ${colors.background.secondary}E6;
            color: ${colors.text.primary};
            border: 1px solid ${colors.border.primary}80;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            min-width: 44px;
            text-align: center;
        }
        
        .toolbar-btn:hover {
            background: ${colors.background.elevated}E6;
            border-color: ${colors.primary[500]}80;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .toolbar-btn.active {
            background: ${colors.primary[500]};
            color: ${colors.text.inverse};
            border-color: ${colors.primary[500]};
            box-shadow: 0 2px 8px ${colors.primary[500]}40;
        }
        
        .control-btn {
            padding: 10px;
            background: ${colors.background.secondary}E6;
            color: ${colors.text.primary};
            border: 1px solid ${colors.border.primary}80;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
        }
        
        .control-btn:hover {
            background: ${colors.background.elevated}E6;
            border-color: ${colors.primary[500]}80;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .price-info {
            position: absolute;
            top: 12px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1001;
            background: ${colors.background.secondary}F0;
            color: ${colors.text.primary};
            padding: 12px 16px;
            border-radius: 12px;
            font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
            font-size: 13px;
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid ${colors.border.primary}60;
            box-shadow: 0 4px 16px rgba(0,0,0,0.1);
            pointer-events: auto;
            min-width: 200px;
            text-align: center;
        }
        
        .price-main {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 4px;
        }
        
        .price-details {
            font-size: 11px;
            opacity: 0.8;
            display: flex;
            gap: 12px;
            justify-content: center;
        }
        
        .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: ${colors.text.secondary};
            font-size: 14px;
            z-index: 1001;
        }
        
        .chart-type-group {
            display: flex;
            background: ${colors.background.tertiary}E6;
            border-radius: 8px;
            padding: 2px;
            gap: 2px;
        }
        
        .chart-type-group .toolbar-btn {
            background: transparent;
            border: none;
            margin: 0;
            border-radius: 6px;
            min-width: 50px;
        }
        
        .chart-type-group .toolbar-btn.active {
            background: ${colors.primary[500]};
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
    </style>
</head>
<body>
    <div class="chart-overlay">
        <div class="chart-toolbar">
            <div class="chart-type-group">
                <button class="toolbar-btn active" onclick="setChartType('candlestick')" id="candle-btn">
                    📊
                </button>
                <button class="toolbar-btn" onclick="setChartType('line')" id="line-btn">
                    📈
                </button>
                <button class="toolbar-btn" onclick="setChartType('area')" id="area-btn">
                    🏔️
                </button>
            </div>
            
            <button class="toolbar-btn" onclick="toggleIndicator('sma')" id="sma-btn">
                SMA
            </button>
            <button class="toolbar-btn" onclick="toggleIndicator('ema')" id="ema-btn">
                EMA
            </button>
            <button class="toolbar-btn" onclick="toggleIndicator('bollinger')" id="bb-btn">
                BB
            </button>
            <button class="toolbar-btn" onclick="toggleVolume()" id="volume-btn">
                VOL
            </button>
        </div>
        
        <div class="chart-controls">
            <button class="control-btn" onclick="resetZoom()" title="Reset Zoom">
                🎯
            </button>
            <button class="control-btn" onclick="toggleFullscreen()" title="Fullscreen">
                ⛶
            </button>
        </div>
        
        <div class="price-info" id="price-info">
            <div class="loading">Loading chart...</div>
        </div>
    </div>
    
    <div id="chart-container"></div>

    <script>
        let chart, candlestickSeries, lineSeries, areaSeries, volumeSeries;
        let indicators = {
            sma: null,
            ema: null,
            bollinger: { upper: null, middle: null, lower: null }
        };
        let currentChartType = 'candlestick';
        let chartData = ${chartData};
        let isFullscreen = ${isFullscreen};

        console.log('Chart data received:', chartData.length, 'candles');

        // Technical Analysis Functions
        function calculateSMA(data, period) {
            if (!data || data.length < period) return [];
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

        function calculateEMA(data, period) {
            if (!data || data.length === 0) return [];
            const result = [];
            const multiplier = 2 / (period + 1);
            let ema = data[0].close;
            
            for (let i = 0; i < data.length; i++) {
                if (i === 0) {
                    ema = data[i].close;
                } else {
                    ema = (data[i].close - ema) * multiplier + ema;
                }
                result.push({
                    time: data[i].time,
                    value: ema
                });
            }
            return result;
        }

        function calculateBollingerBands(data, period, stdDev) {
            if (!data || data.length < period) return { upper: [], middle: [], lower: [] };
            
            const sma = calculateSMA(data, period);
            const result = { upper: [], middle: [], lower: [] };
            
            for (let i = period - 1; i < data.length; i++) {
                let sum = 0;
                for (let j = 0; j < period; j++) {
                    sum += Math.pow(data[i - j].close - sma[i - period + 1].value, 2);
                }
                const variance = sum / period;
                const standardDeviation = Math.sqrt(variance);
                
                const middle = sma[i - period + 1].value;
                const upper = middle + (standardDeviation * stdDev);
                const lower = middle - (standardDeviation * stdDev);
                
                result.upper.push({ time: data[i].time, value: upper });
                result.middle.push({ time: data[i].time, value: middle });
                result.lower.push({ time: data[i].time, value: lower });
            }
            return result;
        }

        // Chart initialization
        function initChart() {
            console.log('Initializing chart...');
            
            if (typeof LightweightCharts === 'undefined') {
                console.error('LightweightCharts library not loaded');
                setTimeout(initChart, 1000);
                return;
            }
            
            const chartOptions = {
                width: ${chartWidth},
                height: ${chartHeight},
                layout: {
                    background: { color: '${colors.background.primary}' },
                    textColor: '${colors.text.primary}',
                    fontSize: 12,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                },
                grid: {
                    vertLines: { 
                        color: '${colors.chart.grid}',
                        style: LightweightCharts.LineStyle.Dotted,
                        visible: true,
                    },
                    horzLines: { 
                        color: '${colors.chart.grid}',
                        style: LightweightCharts.LineStyle.Dotted,
                        visible: true,
                    },
                },
                crosshair: {
                    mode: LightweightCharts.CrosshairMode.Normal,
                    vertLine: {
                        color: '${colors.primary[500]}',
                        width: 1,
                        style: LightweightCharts.LineStyle.Solid,
                        labelBackgroundColor: '${colors.primary[500]}',
                    },
                    horzLine: {
                        color: '${colors.primary[500]}',
                        width: 1,
                        style: LightweightCharts.LineStyle.Solid,
                        labelBackgroundColor: '${colors.primary[500]}',
                    },
                },
                rightPriceScale: {
                    borderColor: '${colors.border.primary}',
                    textColor: '${colors.text.secondary}',
                    entireTextOnly: false,
                    scaleMargins: {
                        top: 0.1,
                        bottom: 0.1,
                    },
                },
                timeScale: {
                    borderColor: '${colors.border.primary}',
                    textColor: '${colors.text.secondary}',
                    timeVisible: true,
                    secondsVisible: false,
                    rightOffset: 12,
                    barSpacing: 6,
                    minBarSpacing: 0.5,
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
                localization: {
                    priceFormatter: (price) => {
                        return price.toFixed(5);
                    },
                },
            };

            try {
                chart = LightweightCharts.createChart(document.getElementById('chart-container'), chartOptions);
                
                // Create main candlestick series
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

                // Set data if available
                if (chartData && chartData.length > 0) {
                    console.log('Setting chart data:', chartData.length, 'candles');
                    candlestickSeries.setData(chartData);
                    updatePriceInfo(chartData[chartData.length - 1]);
                    
                    // Fit content with some padding
                    setTimeout(() => {
                        chart.timeScale().fitContent();
                    }, 100);
                } else {
                    console.log('No chart data available - waiting for data');
                    // Show loading state without default candles
                    updatePriceInfo(null);
                    document.getElementById('price-info').innerHTML = 
                        '<div style="color: ${colors.text.secondary}; font-size: 14px; text-align: center; padding: 20px;">Loading chart data...</div>';
                }

                // Add crosshair move listener
                chart.subscribeCrosshairMove(function(param) {
                    if (param.time && param.seriesData.has(candlestickSeries)) {
                        const data = param.seriesData.get(candlestickSeries);
                        updatePriceInfo(data);
                        
                        window.ReactNativeWebView?.postMessage(JSON.stringify({
                            type: 'crosshairMove',
                            data: data,
                            time: param.time
                        }));
                    } else if (chartData && chartData.length > 0) {
                        updatePriceInfo(chartData[chartData.length - 1]);
                    }
                });

                console.log('Chart initialization complete');
                
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

        function updatePriceInfo(candle) {
            const priceInfo = document.getElementById('price-info');
            
            if (!candle) {
                priceInfo.innerHTML = '<div class="loading">No data available</div>';
                return;
            }
            
            const change = candle.close - candle.open;
            const changePercent = ((change / candle.open) * 100).toFixed(2);
            const color = change >= 0 ? '${colors.chart.bullish}' : '${colors.chart.bearish}';
            
            priceInfo.innerHTML = \`
                <div class="price-main">
                    <span style="font-weight: 600;">${symbol}</span>
                    <span style="color: \${color}; margin-left: 8px;">\${candle.close.toFixed(5)}</span>
                    <span style="color: \${color}; font-size: 12px; margin-left: 6px;">
                        \${change >= 0 ? '+' : ''}\${change.toFixed(5)} (\${changePercent}%)
                    </span>
                </div>
                <div class="price-details">
                    <span>O: \${candle.open.toFixed(5)}</span>
                    <span>H: \${candle.high.toFixed(5)}</span>
                    <span>L: \${candle.low.toFixed(5)}</span>
                    \${candle.volume ? \`<span>V: \${(candle.volume / 1000).toFixed(0)}K</span>\` : ''}
                </div>
            \`;
        }

        function setChartType(type) {
            // Update button states
            document.querySelectorAll('#candle-btn, #line-btn, #area-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.getElementById(type === 'candlestick' ? 'candle-btn' : type + '-btn').classList.add('active');

            if (type === currentChartType) return;
            
            // Remove current series
            if (currentChartType === 'candlestick' && candlestickSeries) {
                chart.removeSeries(candlestickSeries);
                candlestickSeries = null;
            } else if (currentChartType === 'line' && lineSeries) {
                chart.removeSeries(lineSeries);
                lineSeries = null;
            } else if (currentChartType === 'area' && areaSeries) {
                chart.removeSeries(areaSeries);
                areaSeries = null;
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
                    priceFormat: {
                        type: 'price',
                        precision: 5,
                        minMove: 0.00001,
                    },
                });
                if (chartData && chartData.length > 0) {
                    candlestickSeries.setData(chartData);
                }
            } else if (type === 'line') {
                lineSeries = chart.addLineSeries({
                    color: '${colors.primary[500]}',
                    lineWidth: 2,
                    priceFormat: {
                        type: 'price',
                        precision: 5,
                        minMove: 0.00001,
                    },
                });
                if (chartData && chartData.length > 0) {
                    const lineData = chartData.map(d => ({ time: d.time, value: d.close }));
                    lineSeries.setData(lineData);
                }
            } else if (type === 'area') {
                areaSeries = chart.addAreaSeries({
                    topColor: '${colors.primary[500]}40',
                    bottomColor: '${colors.primary[500]}10',
                    lineColor: '${colors.primary[500]}',
                    lineWidth: 2,
                    priceFormat: {
                        type: 'price',
                        precision: 5,
                        minMove: 0.00001,
                    },
                });
                if (chartData && chartData.length > 0) {
                    const areaData = chartData.map(d => ({ time: d.time, value: d.close }));
                    areaSeries.setData(areaData);
                }
            }
        }

        function toggleIndicator(type) {
            const btn = document.getElementById(type + '-btn');
            const isActive = btn.classList.contains('active');
            
            if (isActive) {
                // Remove indicator
                btn.classList.remove('active');
                if (indicators[type]) {
                    if (type === 'bollinger') {
                        chart.removeSeries(indicators[type].upper);
                        chart.removeSeries(indicators[type].middle);
                        chart.removeSeries(indicators[type].lower);
                        indicators[type] = { upper: null, middle: null, lower: null };
                    } else {
                        chart.removeSeries(indicators[type]);
                        indicators[type] = null;
                    }
                }
            } else {
                // Add indicator
                btn.classList.add('active');
                
                if (type === 'sma') {
                    indicators.sma = chart.addLineSeries({
                        color: '${colors.secondary[400]}',
                        lineWidth: 2,
                        title: 'SMA(20)',
                    });
                    const smaData = calculateSMA(chartData, 20);
                    indicators.sma.setData(smaData);
                } else if (type === 'ema') {
                    indicators.ema = chart.addLineSeries({
                        color: '${colors.secondary[500]}',
                        lineWidth: 2,
                        title: 'EMA(20)',
                    });
                    const emaData = calculateEMA(chartData, 20);
                    indicators.ema.setData(emaData);
                } else if (type === 'bollinger') {
                    const bbData = calculateBollingerBands(chartData, 20, 2);
                    
                    indicators.bollinger.upper = chart.addLineSeries({
                        color: '${colors.trading.warning}',
                        lineWidth: 1,
                        title: 'BB Upper',
                    });
                    indicators.bollinger.middle = chart.addLineSeries({
                        color: '${colors.primary[500]}',
                        lineWidth: 1,
                        title: 'BB Middle',
                    });
                    indicators.bollinger.lower = chart.addLineSeries({
                        color: '${colors.trading.warning}',
                        lineWidth: 1,
                        title: 'BB Lower',
                    });
                    
                    indicators.bollinger.upper.setData(bbData.upper);
                    indicators.bollinger.middle.setData(bbData.middle);
                    indicators.bollinger.lower.setData(bbData.lower);
                }
            }
        }

        function toggleVolume() {
            const btn = document.getElementById('volume-btn');
            const isActive = btn.classList.contains('active');
            
            if (isActive) {
                btn.classList.remove('active');
                if (volumeSeries) {
                    chart.removeSeries(volumeSeries);
                    volumeSeries = null;
                }
            } else {
                btn.classList.add('active');
                if (chartData && chartData[0]?.volume) {
                    volumeSeries = chart.addHistogramSeries({
                        color: '${colors.chart.volume}80',
                        priceFormat: {
                            type: 'volume',
                        },
                        priceScaleId: 'volume',
                    });
                    
                    chart.priceScale('volume').applyOptions({
                        scaleMargins: {
                            top: 0.7,
                            bottom: 0,
                        },
                        borderVisible: false,
                    });
                    
                    const volumeData = chartData.map(d => ({ 
                        time: d.time, 
                        value: d.volume || 0,
                        color: d.close >= d.open ? '${colors.chart.bullish}60' : '${colors.chart.bearish}60'
                    }));
                    volumeSeries.setData(volumeData);
                }
            }
        }

        function resetZoom() {
            if (chart) {
                chart.timeScale().fitContent();
            }
        }

        function toggleFullscreen() {
            window.ReactNativeWebView?.postMessage(JSON.stringify({
                type: 'toggleFullscreen'
            }));
        }

        function updateData(newData) {
            if (!newData || newData.length === 0) return;
            
            chartData = newData.filter(item => item && typeof item.time === 'number');
            console.log('Updating chart with', chartData.length, 'candles');
            
            if (currentChartType === 'candlestick' && candlestickSeries) {
                candlestickSeries.setData(chartData);
            } else if (currentChartType === 'line' && lineSeries) {
                const lineData = chartData.map(d => ({ time: d.time, value: d.close }));
                lineSeries.setData(lineData);
            } else if (currentChartType === 'area' && areaSeries) {
                const areaData = chartData.map(d => ({ time: d.time, value: d.close }));
                areaSeries.setData(areaData);
            }
            
            // Update indicators
            if (indicators.sma) {
                const smaData = calculateSMA(chartData, 20);
                indicators.sma.setData(smaData);
            }
            if (indicators.ema) {
                const emaData = calculateEMA(chartData, 20);
                indicators.ema.setData(emaData);
            }
            if (indicators.bollinger.upper) {
                const bbData = calculateBollingerBands(chartData, 20, 2);
                indicators.bollinger.upper.setData(bbData.upper);
                indicators.bollinger.middle.setData(bbData.middle);
                indicators.bollinger.lower.setData(bbData.lower);
            }
            if (volumeSeries && chartData[0]?.volume) {
                const volumeData = chartData.map(d => ({ 
                    time: d.time, 
                    value: d.volume || 0,
                    color: d.close >= d.open ? '${colors.chart.bullish}60' : '${colors.chart.bearish}60'
                }));
                volumeSeries.setData(volumeData);
            }
            
            if (chartData.length > 0) {
                updatePriceInfo(chartData[chartData.length - 1]);
            }
        }

        // Initialize chart when page loads
        function startInitialization() {
            console.log('Starting chart initialization...');
            if (typeof LightweightCharts !== 'undefined') {
                initChart();
            } else {
                console.log('LightweightCharts not ready, retrying...');
                setTimeout(startInitialization, 500);
            }
        }

        // Try multiple initialization methods
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', startInitialization);
        } else {
            startInitialization();
        }
        
        setTimeout(startInitialization, 200);

        // Handle messages from React Native
        window.addEventListener('message', function(event) {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'updateData') {
                    updateData(data.data);
                } else if (data.type === 'resize') {
                    if (chart) {
                        chart.applyOptions({
                            width: data.width,
                            height: data.height
                        });
                    }
                }
            } catch (error) {
                console.error('Error handling message:', error);
            }
        });
    </script>
</body>
</html>`;
  };

  const handleMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      if (message.type === 'crosshairMove' && onCrosshairMove) {
        onCrosshairMove(message);
      } else if (message.type === 'chartReady') {
        setChartReady(true);
      } else if (message.type === 'chartError') {
        console.error('Chart error:', message.error);
      } else if (message.type === 'toggleFullscreen') {
        toggleFullscreen();
      }
    } catch (error) {
      console.warn('Chart message parse error:', error);
    }
  };

  const toggleFullscreen = () => {
    const newFullscreenState = !isFullscreen;
    setIsFullscreen(newFullscreenState);
    onFullscreenChange?.(newFullscreenState);
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

  useEffect(() => {
    if (webViewRef.current && chartReady) {
      const message = JSON.stringify({
        type: 'resize',
        width: isFullscreen ? screenWidth : screenWidth,
        height: isFullscreen ? screenHeight - 120 : height,
      });
      webViewRef.current.postMessage(message);
    }
  }, [isFullscreen, chartReady]);

  const ChartComponent = (
    <View style={[
      styles.container, 
      { 
        height: isFullscreen ? screenHeight - 120 : height,
        width: isFullscreen ? screenWidth : screenWidth,
      }
    ]}>
      {isFullscreen && (
        <View style={styles.fullscreenHeader}>
          <Text style={styles.fullscreenTitle}>{symbol} - {timeframe}</Text>
          <TouchableOpacity onPress={toggleFullscreen} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      )}
      
      <WebView
        ref={webViewRef}
        source={{ html: generateChartHTML() }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        originWhitelist={['*']}
        mixedContentMode="compatibility"
        bounces={false}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        nestedScrollEnabled={false}
        startInLoadingState={false}
        onError={(error) => console.error('WebView error:', error)}
        onHttpError={(error) => console.error('WebView HTTP error:', error)}
      />
    </View>
  );

  if (isFullscreen) {
    return (
      <Modal
        visible={isFullscreen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={toggleFullscreen}
      >
        <StatusBar hidden />
        <SafeAreaView style={styles.fullscreenContainer}>
          {ChartComponent}
        </SafeAreaView>
      </Modal>
    );
  }

  return ChartComponent;
};

const styles = StyleSheet.create({
  container: {
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
  fullscreenContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  fullscreenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  fullscreenTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing[2],
  },
});

export default ModernTradingChart;
