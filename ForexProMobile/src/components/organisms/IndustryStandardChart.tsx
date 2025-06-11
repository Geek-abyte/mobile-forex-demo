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

interface IndustryStandardChartProps {
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

const IndustryStandardChart: React.FC<IndustryStandardChartProps> = ({
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
  const screenWidth = width || Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  // Generate professional chart HTML with full functionality
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
            height: ${isFullscreen ? 'calc(100vh - 40px)' : chartHeight + 'px'};
            position: relative;
            background: ${colors.background.primary};
            overflow: hidden;
        }
        
        /* Professional Top Toolbar */
        .top-toolbar {
            position: absolute;
            top: 8px;
            left: 8px;
            right: 8px;
            height: 44px;
            background: ${colors.background.secondary}F8;
            backdrop-filter: blur(20px);
            border: 1px solid ${colors.border.primary}30;
            border-radius: 10px;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        
        .toolbar-section {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .symbol-display {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .symbol-text {
            font-size: 15px;
            font-weight: 700;
            color: ${colors.text.primary};
        }
        
        .price-display {
            font-size: 12px;
            font-weight: 600;
            padding: 4px 8px;
            border-radius: 6px;
            background: ${colors.background.tertiary};
        }
        
        .price-positive {
            color: ${colors.trading.profit};
            background: ${colors.trading.profit}20;
        }
        
        .price-negative {
            color: ${colors.trading.loss};
            background: ${colors.trading.loss}20;
        }
        
        /* Chart Type Controls */
        .chart-controls {
            display: flex;
            background: ${colors.background.tertiary};
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid ${colors.border.primary}40;
        }
        
        .chart-btn {
            padding: 8px 14px;
            background: transparent;
            color: ${colors.text.secondary};
            border: none;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.25s ease;
            border-right: 1px solid ${colors.border.primary}30;
            min-width: 60px;
            text-align: center;
        }
        
        .chart-btn:last-child {
            border-right: none;
        }
        
        .chart-btn:hover {
            background: ${colors.primary[500]}40;
            color: ${colors.text.primary};
        }
        
        .chart-btn.active {
            background: ${colors.primary[500]};
            color: ${colors.text.inverse};
            font-weight: 700;
        }
        
        /* Professional Tools */
        .pro-tools {
            display: flex;
            gap: 8px;
        }
        
        .tool-btn {
            padding: 8px 12px;
            background: ${colors.background.tertiary};
            color: ${colors.text.secondary};
            border: 1px solid ${colors.border.primary}40;
            border-radius: 8px;
            cursor: pointer;
            font-size: 11px;
            font-weight: 600;
            transition: all 0.25s ease;
            min-width: 44px;
            text-align: center;
        }
        
        .tool-btn:hover {
            background: ${colors.primary[500]}40;
            color: ${colors.text.primary};
            border-color: ${colors.primary[500]}60;
        }
        
        .tool-btn.active {
            background: ${colors.primary[500]};
            color: ${colors.text.inverse};
            border-color: ${colors.primary[500]};
        }
        
        .expand-btn {
            padding: 10px;
            background: ${colors.background.tertiary};
            color: ${colors.text.secondary};
            border: 1px solid ${colors.border.primary}40;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.25s ease;
            font-size: 16px;
        }
        
        .expand-btn:hover {
            background: ${colors.primary[500]};
            color: ${colors.text.inverse};
            border-color: ${colors.primary[500]};
        }
        
        /* Professional Crosshair Info */
        .crosshair-panel {
            position: absolute;
            top: 62px;
            left: 8px;
            background: ${colors.background.secondary}FA;
            backdrop-filter: blur(24px);
            border: 1px solid ${colors.border.primary}40;
            border-radius: 10px;
            padding: 16px;
            font-size: 12px;
            color: ${colors.text.primary};
            z-index: 999;
            display: none;
            min-width: 240px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }
        
        .crosshair-panel.visible {
            display: block;
        }
        
        .crosshair-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid ${colors.border.primary}30;
        }
        
        .crosshair-time {
            font-size: 11px;
            color: ${colors.text.secondary};
            font-weight: 500;
        }
        
        .crosshair-volume {
            font-size: 10px;
            color: ${colors.text.secondary};
            background: ${colors.background.tertiary};
            padding: 2px 6px;
            border-radius: 4px;
        }
        
        .ohlc-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
        }
        
        .ohlc-group {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        
        .ohlc-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .ohlc-label {
            color: ${colors.text.secondary};
            font-size: 10px;
            font-weight: 500;
            min-width: 30px;
        }
        
        .ohlc-value {
            color: ${colors.text.primary};
            font-weight: 600;
            font-size: 11px;
            font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
        }
        
        /* Chart working area */
        .chart-area {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
        }
        
        /* Loading States */
        .loading-container {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${colors.background.secondary}F5;
            backdrop-filter: blur(16px);
            border: 1px solid ${colors.border.primary}40;
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            z-index: 998;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }
        
        .loading-message {
            color: ${colors.text.secondary};
            font-size: 14px;
            margin-bottom: 12px;
            font-weight: 500;
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
        
        /* Professional Responsiveness */
        @media (max-width: 480px) {
            .top-toolbar {
                height: 40px;
                padding: 0 12px;
            }
            
            .symbol-text {
                font-size: 13px;
            }
            
            .chart-btn {
                padding: 6px 10px;
                font-size: 11px;
                min-width: 50px;
            }
            
            .tool-btn {
                padding: 6px 8px;
                font-size: 10px;
                min-width: 36px;
            }
            
            .crosshair-panel {
                top: 52px;
                min-width: 200px;
                padding: 12px;
            }
        }
        
        /* Scrollbar hiding */
        ::-webkit-scrollbar {
            display: none;
        }
        
        /* Smooth animations */
        * {
            transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }
    </style>
</head>
<body>
    <!-- Professional Chart Toolbar -->
    <div class="top-toolbar">
        <div class="toolbar-section">
            <div class="symbol-display">
                <div class="symbol-text">${symbol}</div>
                <div class="price-display" id="live-price">Loading...</div>
            </div>
        </div>
        
        <div class="toolbar-section">
            <div class="chart-controls">
                <button class="chart-btn active" onclick="switchChartType('candlestick')" data-type="candlestick">
                    Candles
                </button>
                <button class="chart-btn" onclick="switchChartType('line')" data-type="line">
                    Line
                </button>
                <button class="chart-btn" onclick="switchChartType('area')" data-type="area">
                    Area
                </button>
            </div>
        </div>
        
        <div class="toolbar-section">
            <div class="pro-tools">
                <button class="tool-btn" onclick="toggleIndicators()" id="indicators-btn">
                    📊
                </button>
                <button class="tool-btn" onclick="resetZoom()">
                    🎯
                </button>
                ${!isFullscreen ? `
                <button class="expand-btn" onclick="goFullscreen()">
                    ⛶
                </button>
                ` : ''}
            </div>
        </div>
    </div>
    
    <!-- Professional Crosshair Information -->
    <div class="crosshair-panel" id="crosshair-panel">
        <div class="crosshair-header">
            <div class="crosshair-time" id="crosshair-timestamp">--</div>
            <div class="crosshair-volume" id="crosshair-vol">Vol: --</div>
        </div>
        <div class="ohlc-container">
            <div class="ohlc-group">
                <div class="ohlc-row">
                    <span class="ohlc-label">Open</span>
                    <span class="ohlc-value" id="crosshair-o">--</span>
                </div>
                <div class="ohlc-row">
                    <span class="ohlc-label">Low</span>
                    <span class="ohlc-value" id="crosshair-l">--</span>
                </div>
            </div>
            <div class="ohlc-group">
                <div class="ohlc-row">
                    <span class="ohlc-label">High</span>
                    <span class="ohlc-value" id="crosshair-h">--</span>
                </div>
                <div class="ohlc-row">
                    <span class="ohlc-label">Close</span>
                    <span class="ohlc-value" id="crosshair-c">--</span>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Loading State -->
    <div class="loading-container" id="loading-state" style="display: ${chartData && JSON.parse(chartData).length > 0 ? 'none' : 'flex'};">
        <div class="loading-message">Loading professional chart...</div>
        <div class="loading-spinner"></div>
    </div>
    
    <!-- Chart Canvas Area -->
    <div class="chart-area">
        <div id="chart-container"></div>
    </div>

    <script>
        // Professional Chart Variables
        let chart, candlestickSeries, lineSeries, areaSeries, volumeSeries;
        let currentChartType = 'candlestick';
        let indicatorsEnabled = false;
        let chartData = ${chartData};
        let isFullscreenMode = ${isFullscreen};
        
        // Technical Indicators Storage
        let technicalIndicators = {
            sma20: null,
            sma50: null,
            ema21: null,
            bollinger: { upper: null, middle: null, lower: null },
            rsi: null
        };
        
        console.log('Industry-standard chart initializing...', {
            dataPoints: chartData ? chartData.length : 0,
            fullscreen: isFullscreenMode
        });

        function initializeProfessionalChart() {
            const container = document.getElementById('chart-container');
            if (!container) {
                console.error('Chart container not found');
                showError('Chart container not available');
                return;
            }

            // Industry-standard chart configuration
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
                        color: '${colors.text.secondary}B0',
                        width: 1,
                        style: 2,
                        visible: true,
                        labelVisible: true,
                        labelBackgroundColor: '${colors.background.secondary}',
                    },
                    horzLine: {
                        color: '${colors.text.secondary}B0',
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
                // Create professional chart instance
                chart = LightweightCharts.createChart(container, chartConfig);
                
                // Create main price series
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
                    topColor: '${colors.primary[500]}80',
                    bottomColor: '${colors.primary[500]}15',
                    lineWidth: 2,
                    visible: false,
                    priceFormat: {
                        type: 'price',
                        precision: 5,
                        minMove: 0.00001,
                    },
                });

                // Load and display data
                if (chartData && chartData.length > 0) {
                    console.log('Loading', chartData.length, 'data points');
                    setChartData();
                    hideLoadingState();
                    
                    // Enable professional interactions
                    setTimeout(() => {
                        chart.timeScale().fitContent();
                        enableProfessionalInteractions();
                    }, 150);
                } else {
                    console.log('Waiting for chart data...');
                    showLoadingMessage('Waiting for market data...');
                }

                // Professional crosshair tracking
                chart.subscribeCrosshairMove(trackCrosshairMovement);

                // Handle responsive resizing
                const resizeObserver = new ResizeObserver(entries => {
                    const { width, height } = entries[0].contentRect;
                    chart.applyOptions({ width, height });
                });
                resizeObserver.observe(container);

                console.log('Professional chart initialization complete');
                
                // Notify React Native component
                notifyReactNative({
                    type: 'chartReady',
                    success: true,
                    features: ['candlestick', 'line', 'area', 'indicators', 'crosshair', 'zoom', 'pan']
                });

            } catch (error) {
                console.error('Professional chart initialization failed:', error);
                showError('Failed to initialize professional chart: ' + error.message);
            }
        }

        function setChartData() {
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

                // Update live price display
                const latestCandle = chartData[chartData.length - 1];
                if (latestCandle) {
                    updateLivePriceDisplay(latestCandle);
                }

                // Show indicators if enabled
                if (indicatorsEnabled) {
                    calculateAndDisplayIndicators();
                }

            } catch (error) {
                console.error('Error setting chart data:', error);
                showError('Error displaying chart data');
            }
        }

        function switchChartType(type) {
            console.log('Switching to chart type:', type);
            currentChartType = type;
            
            // Update UI button states
            document.querySelectorAll('[data-type]').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector(\`[data-type="\${type}"]\`).classList.add('active');

            // Show/hide appropriate series
            candlestickSeries.applyOptions({ visible: type === 'candlestick' });
            lineSeries.applyOptions({ visible: type === 'line' });
            areaSeries.applyOptions({ visible: type === 'area' });

            // Notify React Native
            notifyReactNative({
                type: 'chartTypeChanged',
                chartType: type
            });
        }

        function toggleIndicators() {
            indicatorsEnabled = !indicatorsEnabled;
            const btn = document.getElementById('indicators-btn');
            
            if (indicatorsEnabled) {
                btn.classList.add('active');
                calculateAndDisplayIndicators();
            } else {
                btn.classList.remove('active');
                removeAllIndicators();
            }
            
            console.log('Technical indicators:', indicatorsEnabled ? 'enabled' : 'disabled');
        }

        function calculateAndDisplayIndicators() {
            if (!chartData || chartData.length < 50) return;

            try {
                // Calculate SMA 20
                const sma20Data = calculateSMA(chartData, 20);
                const sma50Data = calculateSMA(chartData, 50);

                // Add SMA series
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

                console.log('Technical indicators calculated and displayed');
            } catch (error) {
                console.error('Error calculating indicators:', error);
            }
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

        function removeAllIndicators() {
            Object.values(technicalIndicators).forEach(indicator => {
                if (indicator && typeof indicator.applyOptions === 'function') {
                    chart.removeSeries(indicator);
                }
            });
            
            // Reset indicators object
            technicalIndicators = {
                sma20: null,
                sma50: null,
                ema21: null,
                bollinger: { upper: null, middle: null, lower: null },
                rsi: null
            };
        }

        function trackCrosshairMovement(param) {
            const crosshairPanel = document.getElementById('crosshair-panel');
            
            if (param.time && param.seriesData.size > 0) {
                // Show crosshair information
                crosshairPanel.classList.add('visible');
                
                // Get data from active series
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
                }
            } else {
                // Hide crosshair information
                crosshairPanel.classList.remove('visible');
            }
        }

        function updateCrosshairDisplay(data, time) {
            document.getElementById('crosshair-o').textContent = data.open?.toFixed(5) || '--';
            document.getElementById('crosshair-h').textContent = data.high?.toFixed(5) || '--';
            document.getElementById('crosshair-l').textContent = data.low?.toFixed(5) || '--';
            document.getElementById('crosshair-c').textContent = data.close?.toFixed(5) || '--';
            
            // Format timestamp
            const date = new Date(time * 1000);
            document.getElementById('crosshair-timestamp').textContent = 
                date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                
            // Volume (simulated for demo)
            document.getElementById('crosshair-vol').textContent = 'Vol: ' + (Math.floor(Math.random() * 1000000)).toLocaleString();
        }

        function updateLivePriceDisplay(candle) {
            const priceElement = document.getElementById('live-price');
            if (priceElement && chartData.length > 1) {
                const previousCandle = chartData[chartData.length - 2];
                const change = candle.close - previousCandle.close;
                const changePercent = (change / previousCandle.close * 100);
                
                priceElement.textContent = \`\${candle.close.toFixed(5)} (\${changePercent >= 0 ? '+' : ''}\${changePercent.toFixed(2)}%)\`;
                priceElement.className = 'price-display ' + (changePercent >= 0 ? 'price-positive' : 'price-negative');
            }
        }

        function resetZoom() {
            if (chart) {
                chart.timeScale().fitContent();
                console.log('Chart zoom reset');
            }
        }

        function goFullscreen() {
            notifyReactNative({ type: 'toggleFullscreen' });
        }

        function enableProfessionalInteractions() {
            console.log('Professional chart interactions enabled');
            // Chart is already configured for professional interactions
            // This includes: pan, zoom, crosshair, touch gestures
        }

        function hideLoadingState() {
            const loading = document.getElementById('loading-state');
            if (loading) {
                loading.style.display = 'none';
            }
        }

        function showLoadingMessage(message) {
            const loading = document.getElementById('loading-state');
            if (loading) {
                loading.querySelector('.loading-message').textContent = message;
                loading.style.display = 'flex';
            }
        }

        function showError(message) {
            const loading = document.getElementById('loading-state');
            if (loading) {
                loading.innerHTML = \`
                    <div class="loading-message" style="color: ${colors.status.error};">\${message}</div>
                \`;
                loading.style.display = 'flex';
            }
        }

        function notifyReactNative(message) {
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify(message));
            }
        }

        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeProfessionalChart);
        } else {
            initializeProfessionalChart();
        }

        // Export data update function
        window.updateChartData = function(newData) {
            if (newData && newData.length > 0) {
                chartData = newData;
                setChartData();
                hideLoadingState();
                console.log('Chart data updated with', newData.length, 'points');
            }
        };

        // Export control functions
        window.switchChartType = switchChartType;
        window.toggleIndicators = toggleIndicators;
        window.resetZoom = resetZoom;
        window.goFullscreen = goFullscreen;

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
          console.log('Industry-standard chart ready with features:', message.features);
          setChartReady(true);
          break;
          
        case 'toggleFullscreen':
          onFullscreenChange?.(!isFullscreen);
          break;
          
        case 'crosshairMove':
          onCrosshairMove?.(message.data);
          break;
          
        case 'chartTypeChanged':
          console.log('Chart type changed to:', message.chartType);
          break;
          
        default:
          console.log('Chart message:', message.type);
      }
    } catch (error) {
      console.error('Error parsing chart message:', error);
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
        onShouldStartLoadWithRequest={() => true}
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

export default IndustryStandardChart;
