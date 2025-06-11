import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  Alert,
  Modal,
  ScrollView,
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
  onTimeframeChange?: (timeframe: string) => void;
  showControls?: boolean;
  chartOptions?: {
    volume: boolean;
    gridLines: boolean;
    crosshair: boolean;
    timeScale: boolean;
    priceScale: boolean;
    sma20: boolean;
    sma50: boolean;
    ema21: boolean;
    bollinger: boolean;
    rsi: boolean;
    macd: boolean;
  };
  onChartOptionsChange?: (options: any) => void;
  safeAreaInsets?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
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
  onTimeframeChange,
  showControls = true,
  chartOptions: externalChartOptions,
  onChartOptionsChange,
  safeAreaInsets = { top: 0, bottom: 0, left: 0, right: 0 },
}) => {
  const webViewRef = useRef<WebView>(null);
  const [chartReady, setChartReady] = useState(false);
  const [currentChartType, setCurrentChartType] = useState<'candlestick' | 'line' | 'area'>('candlestick');
  const [indicatorsEnabled, setIndicatorsEnabled] = useState(false);
  const [crosshairData, setCrosshairData] = useState<any>(null);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  
  // Use external chart options if provided, otherwise use internal state
  const [internalChartOptions, setInternalChartOptions] = useState({
    volume: false,
    gridLines: true,
    crosshair: true,
    timeScale: true,
    priceScale: true,
    sma20: false,
    sma50: false,
    ema21: false,
    bollinger: false,
    rsi: false,
    macd: false,
  });
  
  const chartOptions = externalChartOptions || internalChartOptions;
  const setChartOptions = onChartOptionsChange ? 
    (newOptions: any) => onChartOptionsChange(newOptions) :
    setInternalChartOptions;
    
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
    const chartOptionsData = JSON.stringify(chartOptions);
    const currentChartTypeData = JSON.stringify(currentChartType);
    
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
            height: calc(100vh - 40px);
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
        let currentChartType = ${currentChartTypeData};
        let indicatorsEnabled = ${indicatorsEnabled};
        let chartData = ${chartData};
        let chartOptions = ${chartOptionsData};
        let technicalIndicators = {
            sma20: null,
            sma50: null,
            ema21: null,
            bollinger: null,
            rsi: null,
            macd: null
        };
        
        console.log('Professional chart initializing with', chartData ? chartData.length : 0, 'data points');
        console.log('Chart options:', chartOptions);

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
                        visible: chartOptions.gridLines,
                    },
                    horzLines: {
                        color: '${colors.border.primary}25',
                        style: 1,
                        visible: chartOptions.gridLines,
                    },
                },
                crosshair: {
                    mode: LightweightCharts.CrosshairMode.Normal,
                    vertLine: {
                        color: '${colors.text.secondary}90',
                        width: 1,
                        style: 2,
                        visible: chartOptions.crosshair,
                        labelVisible: chartOptions.crosshair,
                        labelBackgroundColor: '${colors.background.secondary}',
                    },
                    horzLine: {
                        color: '${colors.text.secondary}90',
                        width: 1,
                        style: 2,
                        visible: chartOptions.crosshair,
                        labelVisible: chartOptions.crosshair,
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
                    visible: chartOptions.priceScale,
                },
                timeScale: {
                    borderColor: '${colors.border.primary}60',
                    textColor: '${colors.text.secondary}',
                    timeVisible: chartOptions.timeScale,
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
                
                // Apply initial chart options
                applyInitialOptions();

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
        
        function applyInitialOptions() {
            console.log('Applying initial chart options:', chartOptions);
            
            // Apply each option that is enabled
            Object.keys(chartOptions).forEach(option => {
                if (chartOptions[option]) {
                    console.log('Initializing option:', option, 'as enabled');
                    switch(option) {
                        case 'volume':
                            toggleVolume(true);
                            break;
                        case 'sma20':
                        case 'sma50':
                        case 'ema21':
                        case 'bollinger':
                        case 'rsi':
                        case 'macd':
                            toggleIndicator(option, true);
                            break;
                        // gridLines, crosshair, timeScale, priceScale are already set in chartConfig
                    }
                }
            });
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

        window.fitContent = function() {
            if (chart) {
                chart.timeScale().fitContent();
            }
        };

        window.autoScale = function() {
            if (chart) {
                chart.timeScale().resetTimeScale();
            }
        };

        // Advanced chart options
        let indicators = {
            sma20: null,
            sma50: null,
            ema21: null,
            bollinger: null,
            rsi: null,
            macd: null
        };

        let volumeSeries = null;

        window.toggleOption = function(option, enabled) {
            console.log('toggleOption called:', option, enabled);
            
            switch(option) {
                case 'volume':
                    toggleVolume(enabled);
                    break;
                case 'gridLines':
                    toggleGridLines(enabled);
                    break;
                case 'crosshair':
                    toggleCrosshair(enabled);
                    break;
                case 'timeScale':
                    toggleTimeScale(enabled);
                    break;
                case 'priceScale':
                    togglePriceScale(enabled);
                    break;
                case 'sma20':
                case 'sma50':
                case 'ema21':
                case 'bollinger':
                case 'rsi':
                case 'macd':
                    toggleIndicator(option, enabled);
                    break;
                default:
                    console.log('Unknown option:', option);
            }
            
            notifyReactNative({ 
                type: 'optionToggled', 
                option: option, 
                enabled: enabled 
            });
        };

        function toggleVolume(enabled) {
            console.log('toggleVolume called:', enabled);
            try {
                if (enabled && !volumeSeries && chartData) {
                    volumeSeries = chart.addHistogramSeries({
                        color: '#26a69a40',
                        priceScaleId: 'volume',
                    });
                    chart.priceScale('volume').applyOptions({
                        scaleMargins: { top: 0.8, bottom: 0 },
                        borderVisible: false,
                    });
                    
                    const volumeData = chartData.map(item => ({
                        time: item.time,
                        value: item.volume || Math.random() * 1000000,
                        color: item.close >= item.open ? '#26a69a40' : '#ef535040'
                    }));
                    volumeSeries.setData(volumeData);
                    console.log('Volume series added');
                } else if (!enabled && volumeSeries) {
                    chart.removeSeries(volumeSeries);
                    volumeSeries = null;
                    console.log('Volume series removed');
                }
            } catch (error) {
                console.error('Error toggling volume:', error);
            }
        }

        function toggleGridLines(enabled) {
            console.log('toggleGridLines called:', enabled);
            try {
                chart.applyOptions({
                    grid: {
                        vertLines: { visible: enabled },
                        horzLines: { visible: enabled }
                    }
                });
                console.log('Grid lines toggled to:', enabled);
            } catch (error) {
                console.error('Error toggling grid lines:', error);
            }
        }

        function toggleCrosshair(enabled) {
            console.log('toggleCrosshair called:', enabled);
            try {
                chart.applyOptions({
                    crosshair: {
                        vertLine: { visible: enabled },
                        horzLine: { visible: enabled }
                    }
                });
                console.log('Crosshair toggled to:', enabled);
            } catch (error) {
                console.error('Error toggling crosshair:', error);
            }
        }

        function toggleTimeScale(enabled) {
            console.log('toggleTimeScale called:', enabled);
            try {
                chart.applyOptions({
                    timeScale: { visible: enabled }
                });
                console.log('Time scale toggled to:', enabled);
            } catch (error) {
                console.error('Error toggling time scale:', error);
            }
        }

        function togglePriceScale(enabled) {
            console.log('togglePriceScale called:', enabled);
            try {
                chart.applyOptions({
                    rightPriceScale: { visible: enabled }
                });
                console.log('Price scale toggled to:', enabled);
            } catch (error) {
                console.error('Error toggling price scale:', error);
            }
        }

        function toggleIndicator(type, enabled) {
            if (enabled) {
                addSpecificIndicator(type);
            } else {
                removeSpecificIndicator(type);
            }
        }

        function addSpecificIndicator(type) {
            if (!chartData || chartData.length === 0) return;

            try {
                switch (type) {
                    case 'sma20':
                        indicators.sma20 = chart.addLineSeries({
                            color: '#ff6b6b',
                            lineWidth: 1,
                            title: 'SMA 20'
                        });
                        indicators.sma20.setData(calculateSMA(chartData, 20));
                        break;
                        
                    case 'sma50':
                        indicators.sma50 = chart.addLineSeries({
                            color: '#4ecdc4',
                            lineWidth: 1,
                            title: 'SMA 50'
                        });
                        indicators.sma50.setData(calculateSMA(chartData, 50));
                        break;
                        
                    case 'ema21':
                        indicators.ema21 = chart.addLineSeries({
                            color: '#45b7d1',
                            lineWidth: 1,
                            title: 'EMA 21'
                        });
                        indicators.ema21.setData(calculateEMA(chartData, 21));
                        break;
                        
                    // Add more indicators as needed
                }
            } catch (error) {
                console.error('Error adding indicator:', type, error);
            }
        }

        function removeSpecificIndicator(type) {
            if (indicators[type]) {
                chart.removeSeries(indicators[type]);
                indicators[type] = null;
            }
        }

        function calculateEMA(data, period) {
            const result = [];
            const multiplier = 2 / (period + 1);
            let ema = data[0].close;
            
            result.push({ time: data[0].time, value: ema });
            
            for (let i = 1; i < data.length; i++) {
                ema = (data[i].close * multiplier) + (ema * (1 - multiplier));
                result.push({ time: data[i].time, value: ema });
            }
            return result;
        }

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
      console.log('Received WebView message:', message);
      
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
          
        case 'optionToggled':
          console.log('Option toggled:', message.option, 'enabled:', message.enabled);
          break;
          
        default:
          console.log('Chart message:', message);
      }
    } catch (error) {
      console.error('Error parsing chart message:', error);
      console.log('Raw message data:', event.nativeEvent.data);
    }
  };

  // Update chart data when props change
  useEffect(() => {
    if (chartReady && webViewRef.current && data.length > 0) {
      const jsCode = `window.updateChartData && window.updateChartData(${JSON.stringify(data)});`;
      webViewRef.current.injectJavaScript(jsCode);
    }
  }, [data, chartReady]);

  // Regenerate chart when options change (to ensure state persistence)
  useEffect(() => {
    console.log('Chart options changed, chart will regenerate on next render');
    setChartReady(false); // This will trigger a re-render with new HTML
  }, [chartOptions, currentChartType, isFullscreen]);

  // Handle chart type changes
  const handleChartTypeChange = (type: 'candlestick' | 'line' | 'area') => {
    setCurrentChartType(type);
    if (chartReady && webViewRef.current) {
      const jsCode = `window.switchChartType && window.switchChartType('${type}');`;
      webViewRef.current.injectJavaScript(jsCode);
    }
  };

  // Handle indicators toggle
  const handleIndicatorsToggle = () => {
    const newState = !indicatorsEnabled;
    setIndicatorsEnabled(newState);
    if (chartReady && webViewRef.current) {
      const jsCode = `window.toggleIndicators && window.toggleIndicators(${newState});`;
      webViewRef.current.injectJavaScript(jsCode);
    }
  };

  // Handle zoom reset
  const handleResetZoom = () => {
    if (chartReady && webViewRef.current) {
      const jsCode = `window.resetZoom && window.resetZoom();`;
      webViewRef.current.injectJavaScript(jsCode);
    }
  };

  // Handle fit content
  const handleFitContent = () => {
    if (chartReady && webViewRef.current) {
      const jsCode = `window.fitContent && window.fitContent();`;
      webViewRef.current.injectJavaScript(jsCode);
    }
  };

  // Handle auto scale
  const handleAutoScale = () => {
    if (chartReady && webViewRef.current) {
      const jsCode = `window.autoScale && window.autoScale();`;
      webViewRef.current.injectJavaScript(jsCode);
    }
  };

  // Handle option toggle
  const handleOptionToggle = (option: keyof typeof chartOptions) => {
    const newOptions = { ...chartOptions, [option]: !chartOptions[option] };
    setChartOptions(newOptions);
    
    console.log('Chart option toggled:', option, '-> enabled:', newOptions[option]);
    
    // Instead of trying to communicate with WebView, we'll let the useEffect handle the regeneration
    // The chart will be regenerated with the new state when chartOptions changes
  };

  // Generate chart HTML on each render to ensure current state is used
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
              style={[styles.actionButton, showToolsMenu && styles.actionButtonActive]}
              onPress={() => setShowToolsMenu(!showToolsMenu)}
            >
              <Ionicons 
                name="options" 
                size={16} 
                color={showToolsMenu ? colors.text.inverse : colors.text.secondary} 
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

      {/* Tools Menu Modal */}
      <Modal
        visible={showToolsMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowToolsMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowToolsMenu(false)}
        >
          <View style={styles.toolsMenu}>
            <View style={styles.toolsMenuHeader}>
              <Text style={styles.toolsMenuTitle}>Chart Tools & Indicators</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowToolsMenu(false)}
              >
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.toolsScrollView}>
              {/* Timeframe Selection */}
              <View style={styles.toolsSection}>
                <Text style={styles.toolsSectionTitle}>Timeframe</Text>
                <View style={styles.timeframeGrid}>
                  {timeframes.map((tf) => (
                    <TouchableOpacity
                      key={tf.value}
                      style={[
                        styles.timeframeGridButton,
                        timeframe === tf.value && styles.timeframeGridButtonActive
                      ]}
                      onPress={() => {
                        onTimeframeChange?.(tf.value);
                        setShowToolsMenu(false);
                      }}
                    >
                      <Text style={[
                        styles.timeframeGridButtonText,
                        timeframe === tf.value && styles.timeframeGridButtonTextActive
                      ]}>
                        {tf.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Technical Indicators Section */}
              <View style={styles.toolsSection}>
                <Text style={styles.toolsSectionTitle}>Technical Indicators</Text>
                
                <TouchableOpacity 
                  style={styles.toolsItem}
                  onPress={() => handleOptionToggle('sma20')}
                >
                  <Text style={styles.toolsItemText}>Simple Moving Average (20)</Text>
                  <View style={[styles.toolsToggle, chartOptions.sma20 && styles.toolsToggleActive]}>
                    {chartOptions.sma20 && <Ionicons name="checkmark" size={12} color={colors.text.inverse} />}
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.toolsItem}
                  onPress={() => handleOptionToggle('sma50')}
                >
                  <Text style={styles.toolsItemText}>Simple Moving Average (50)</Text>
                  <View style={[styles.toolsToggle, chartOptions.sma50 && styles.toolsToggleActive]}>
                    {chartOptions.sma50 && <Ionicons name="checkmark" size={12} color={colors.text.inverse} />}
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.toolsItem}
                  onPress={() => handleOptionToggle('ema21')}
                >
                  <Text style={styles.toolsItemText}>Exponential Moving Average (21)</Text>
                  <View style={[styles.toolsToggle, chartOptions.ema21 && styles.toolsToggleActive]}>
                    {chartOptions.ema21 && <Ionicons name="checkmark" size={12} color={colors.text.inverse} />}
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.toolsItem}
                  onPress={() => handleOptionToggle('bollinger')}
                >
                  <Text style={styles.toolsItemText}>Bollinger Bands</Text>
                  <View style={[styles.toolsToggle, chartOptions.bollinger && styles.toolsToggleActive]}>
                    {chartOptions.bollinger && <Ionicons name="checkmark" size={12} color={colors.text.inverse} />}
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.toolsItem}
                  onPress={() => handleOptionToggle('rsi')}
                >
                  <Text style={styles.toolsItemText}>RSI (14)</Text>
                  <View style={[styles.toolsToggle, chartOptions.rsi && styles.toolsToggleActive]}>
                    {chartOptions.rsi && <Ionicons name="checkmark" size={12} color={colors.text.inverse} />}
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.toolsItem}
                  onPress={() => handleOptionToggle('macd')}
                >
                  <Text style={styles.toolsItemText}>MACD</Text>
                  <View style={[styles.toolsToggle, chartOptions.macd && styles.toolsToggleActive]}>
                    {chartOptions.macd && <Ionicons name="checkmark" size={12} color={colors.text.inverse} />}
                  </View>
                </TouchableOpacity>
              </View>

              {/* Chart Display Section */}
              <View style={styles.toolsSection}>
                <Text style={styles.toolsSectionTitle}>Chart Display</Text>
                
                <TouchableOpacity 
                  style={styles.toolsItem}
                  onPress={() => handleOptionToggle('volume')}
                >
                  <Text style={styles.toolsItemText}>Volume Bars</Text>
                  <View style={[styles.toolsToggle, chartOptions.volume && styles.toolsToggleActive]}>
                    {chartOptions.volume && <Ionicons name="checkmark" size={12} color={colors.text.inverse} />}
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.toolsItem}
                  onPress={() => handleOptionToggle('gridLines')}
                >
                  <Text style={styles.toolsItemText}>Grid Lines</Text>
                  <View style={[styles.toolsToggle, chartOptions.gridLines && styles.toolsToggleActive]}>
                    {chartOptions.gridLines && <Ionicons name="checkmark" size={12} color={colors.text.inverse} />}
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.toolsItem}
                  onPress={() => handleOptionToggle('crosshair')}
                >
                  <Text style={styles.toolsItemText}>Crosshair</Text>
                  <View style={[styles.toolsToggle, chartOptions.crosshair && styles.toolsToggleActive]}>
                    {chartOptions.crosshair && <Ionicons name="checkmark" size={12} color={colors.text.inverse} />}
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.toolsItem}
                  onPress={() => handleOptionToggle('timeScale')}
                >
                  <Text style={styles.toolsItemText}>Time Scale</Text>
                  <View style={[styles.toolsToggle, chartOptions.timeScale && styles.toolsToggleActive]}>
                    {chartOptions.timeScale && <Ionicons name="checkmark" size={12} color={colors.text.inverse} />}
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.toolsItem}
                  onPress={() => handleOptionToggle('priceScale')}
                >
                  <Text style={styles.toolsItemText}>Price Scale</Text>
                  <View style={[styles.toolsToggle, chartOptions.priceScale && styles.toolsToggleActive]}>
                    {chartOptions.priceScale && <Ionicons name="checkmark" size={12} color={colors.text.inverse} />}
                  </View>
                </TouchableOpacity>
              </View>

              {/* Chart Actions Section */}
              <View style={styles.toolsSection}>
                <Text style={styles.toolsSectionTitle}>Chart Actions</Text>
                
                <TouchableOpacity 
                  style={styles.toolsItem}
                  onPress={() => {
                    handleResetZoom();
                    setShowToolsMenu(false);
                  }}
                >
                  <Text style={styles.toolsItemText}>Reset Zoom</Text>
                  <Ionicons name="refresh" size={16} color={colors.text.secondary} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.toolsItem}
                  onPress={() => {
                    handleFitContent();
                    setShowToolsMenu(false);
                  }}
                >
                  <Text style={styles.toolsItemText}>Fit Content</Text>
                  <Ionicons name="resize" size={16} color={colors.text.secondary} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.toolsItem}
                  onPress={() => {
                    handleAutoScale();
                    setShowToolsMenu(false);
                  }}
                >
                  <Text style={styles.toolsItemText}>Auto Scale</Text>
                  <Ionicons name="expand" size={16} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  symbolInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  timeframeControls: {
    flexDirection: 'row',
    backgroundColor: colors.background.tertiary,
    borderRadius: 6,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  timeframeButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: 'transparent',
  },
  timeframeButtonActive: {
    backgroundColor: colors.primary[500],
  },
  timeframeButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  timeframeButtonTextActive: {
    color: colors.text.inverse,
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
    gap: 8,
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
  // Tools Menu Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  toolsMenu: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    maxWidth: 400,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  toolsMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  toolsMenuTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  toolsScrollView: {
    maxHeight: 500,
  },
  toolsSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  toolsSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  toolsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  toolsItemText: {
    fontSize: 14,
    color: colors.text.primary,
    flex: 1,
  },
  toolsToggle: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolsToggleActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  // Timeframe Grid Styles (for modal)
  timeframeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 8,
  },
  timeframeGridButton: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.background.tertiary,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  timeframeGridButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  timeframeGridButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  timeframeGridButtonTextActive: {
    color: colors.text.inverse,
  },
});

export default ProfessionalTradingChart;
