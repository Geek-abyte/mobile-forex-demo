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
  onTimeframeChange?: (timeframe: string) => void;
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
  onTimeframeChange,
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
            height: ${isFullscreen ? 'calc(100vh - 40px)' : chartHeight + 'px'};
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
        
        /* Advanced Controls Dropdown */
        .advanced-controls {
            position: relative;
            display: inline-block;
        }
        
        .tools-dropdown-btn {
            padding: 8px 12px;
            background: ${colors.background.tertiary};
            color: ${colors.text.secondary};
            border: 1px solid ${colors.border.primary}40;
            border-radius: 6px;
            cursor: pointer;
            font-size: 11px;
            font-weight: 500;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        
        .tools-dropdown-btn:hover,
        .tools-dropdown-btn.active {
            background: ${colors.primary[500]};
            color: ${colors.text.inverse};
            border-color: ${colors.primary[500]};
        }
        
        /* Dropdown Backdrop */
        .dropdown-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.3);
            z-index: 1000;
            display: none;
        }
        
        .dropdown-backdrop.visible {
            display: block;
        }
        
        .tools-dropdown {
            position: fixed;
            top: 50px;
            right: 8px;
            background: ${colors.background.secondary};
            border: 1px solid ${colors.border.primary};
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 1001;
            width: 280px;
            max-width: calc(100vw - 16px);
            max-height: calc(100vh - 100px);
            overflow-y: auto;
            display: none;
            backdrop-filter: blur(20px);
        }
        
        .tools-dropdown.visible {
            display: block;
        }
        
        .dropdown-section {
            padding: 8px 0;
            border-bottom: 1px solid ${colors.border.primary}40;
        }
        
        .dropdown-section:last-child {
            border-bottom: none;
        }
        
        .dropdown-header {
            padding: 6px 12px;
            font-size: 10px;
            font-weight: 600;
            color: ${colors.text.secondary};
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .dropdown-item {
            padding: 8px 12px;
            cursor: pointer;
            font-size: 12px;
            color: ${colors.text.primary};
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .dropdown-item:hover {
            background: ${colors.background.tertiary};
        }
        
        .dropdown-item.active {
            background: ${colors.primary[500]}20;
            color: ${colors.primary[500]};
        }
        
        .dropdown-toggle {
            width: 14px;
            height: 14px;
            border: 1px solid ${colors.border.primary};
            border-radius: 3px;
            position: relative;
        }
        
        .dropdown-toggle.active {
            background: ${colors.primary[500]};
            border-color: ${colors.primary[500]};
        }
        
        .dropdown-toggle.active::after {
            content: '✓';
            position: absolute;
            top: -2px;
            left: 1px;
            color: white;
            font-size: 10px;
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
        
        /* Fullscreen Tools Menu */
        .fullscreen-tools-menu {
            position: relative;
        }
        
        .fullscreen-tools-dropdown {
            position: fixed;
            top: 70px;
            right: 8px;
            background: ${colors.background.secondary};
            border: 1px solid ${colors.border.primary};
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            z-index: 1002;
            width: 320px;
            max-width: calc(100vw - 16px);
            max-height: calc(100vh - 140px);
            overflow-y: auto;
            display: none;
            backdrop-filter: blur(20px);
        }
        
        .fullscreen-tools-dropdown.visible {
            display: block;
        }
        
        .fullscreen-dropdown-header {
            padding: 16px;
            border-bottom: 1px solid ${colors.border.primary}40;
            font-size: 14px;
            font-weight: 600;
            color: ${colors.text.primary};
            text-align: center;
        }
        
        .fullscreen-dropdown-section {
            padding: 12px 0;
            border-bottom: 1px solid ${colors.border.primary}40;
        }
        
        .fullscreen-dropdown-section:last-child {
            border-bottom: none;
        }
        
        .fullscreen-section-title {
            padding: 8px 16px;
            font-size: 11px;
            font-weight: 600;
            color: ${colors.text.secondary};
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .fullscreen-dropdown-item {
            padding: 12px 16px;
            cursor: pointer;
            font-size: 13px;
            color: ${colors.text.primary};
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .fullscreen-dropdown-item:hover {
            background: ${colors.background.tertiary}60;
        }
        
        .fullscreen-dropdown-item.active {
            background: ${colors.primary[500]}20;
            color: ${colors.primary[500]};
        }
        
        .fullscreen-toggle {
            width: 16px;
            height: 16px;
            border: 2px solid ${colors.border.primary};
            border-radius: 4px;
            position: relative;
            transition: all 0.2s ease;
        }
        
        .fullscreen-toggle.active {
            background: ${colors.primary[500]};
            border-color: ${colors.primary[500]};
        }
        
        .fullscreen-toggle.active::after {
            content: '✓';
            position: absolute;
            top: -3px;
            left: 1px;
            color: white;
            font-size: 11px;
            font-weight: bold;
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
            ${isFullscreen ? 'bottom: 40px;' : 'bottom: 0;'}
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
            
            .tools-dropdown {
                width: calc(100vw - 16px);
                right: 8px;
                left: 8px;
            }
            
            .fullscreen-tools-dropdown {
                width: calc(100vw - 16px);
                right: 8px;
                left: 8px;
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
        
        /* Extra small screens */
        @media (max-width: 360px) {
            .tools-dropdown-btn {
                padding: 6px 8px;
                font-size: 10px;
            }
            
            .dropdown-item {
                padding: 6px 10px;
                font-size: 11px;
            }
            
            .fullscreen-dropdown-item {
                padding: 10px 12px;
                font-size: 12px;
            }
        }
    </style>
</head>
<body>
    ${!isFullscreen ? `
    <div class="dropdown-backdrop" id="dropdown-backdrop" onclick="closeAllDropdowns()"></div>
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
            
            <div class="advanced-controls">
                <button class="tools-dropdown-btn" onclick="toggleToolsMenu()" id="tools-btn">
                    Tools ▼
                </button>
                <div class="tools-dropdown" id="tools-dropdown">
                    <div class="dropdown-section">
                        <div class="dropdown-header">Timeframe</div>
                        <div class="dropdown-item" onclick="changeTimeframe('1m')">
                            <span>1 Minute</span>
                            <span id="tf-1m-check" style="display: ${timeframe === '1m' ? 'inline' : 'none'};">✓</span>
                        </div>
                        <div class="dropdown-item" onclick="changeTimeframe('5m')">
                            <span>5 Minutes</span>
                            <span id="tf-5m-check" style="display: ${timeframe === '5m' ? 'inline' : 'none'};">✓</span>
                        </div>
                        <div class="dropdown-item" onclick="changeTimeframe('15m')">
                            <span>15 Minutes</span>
                            <span id="tf-15m-check" style="display: ${timeframe === '15m' ? 'inline' : 'none'};">✓</span>
                        </div>
                        <div class="dropdown-item" onclick="changeTimeframe('1h')">
                            <span>1 Hour</span>
                            <span id="tf-1h-check" style="display: ${timeframe === '1h' ? 'inline' : 'none'};">✓</span>
                        </div>
                        <div class="dropdown-item" onclick="changeTimeframe('4h')">
                            <span>4 Hours</span>
                            <span id="tf-4h-check" style="display: ${timeframe === '4h' ? 'inline' : 'none'};">✓</span>
                        </div>
                        <div class="dropdown-item" onclick="changeTimeframe('1d')">
                            <span>1 Day</span>
                            <span id="tf-1d-check" style="display: ${timeframe === '1d' ? 'inline' : 'none'};">✓</span>
                        </div>
                    </div>
                    <div class="dropdown-section">
                        <div class="dropdown-header">Technical Indicators</div>
                        <div class="dropdown-item" onclick="toggleIndicator('sma20')">
                            <span>SMA 20</span>
                            <div class="dropdown-toggle" id="sma20-toggle"></div>
                        </div>
                        <div class="dropdown-item" onclick="toggleIndicator('sma50')">
                            <span>SMA 50</span>
                            <div class="dropdown-toggle" id="sma50-toggle"></div>
                        </div>
                        <div class="dropdown-item" onclick="toggleIndicator('ema21')">
                            <span>EMA 21</span>
                            <div class="dropdown-toggle" id="ema21-toggle"></div>
                        </div>
                        <div class="dropdown-item" onclick="toggleIndicator('bollinger')">
                            <span>Bollinger Bands</span>
                            <div class="dropdown-toggle" id="bollinger-toggle"></div>
                        </div>
                        <div class="dropdown-item" onclick="toggleIndicator('rsi')">
                            <span>RSI (14)</span>
                            <div class="dropdown-toggle" id="rsi-toggle"></div>
                        </div>
                        <div class="dropdown-item" onclick="toggleIndicator('macd')">
                            <span>MACD</span>
                            <div class="dropdown-toggle" id="macd-toggle"></div>
                        </div>
                    </div>
                    <div class="dropdown-section">
                        <div class="dropdown-header">Chart Display</div>
                        <div class="dropdown-item" onclick="toggleVolume()">
                            <span>Volume</span>
                            <div class="dropdown-toggle" id="volume-toggle"></div>
                        </div>
                        <div class="dropdown-item" onclick="toggleGridLines()">
                            <span>Grid Lines</span>
                            <div class="dropdown-toggle active" id="grid-toggle"></div>
                        </div>
                        <div class="dropdown-item" onclick="toggleCrosshair()">
                            <span>Crosshair</span>
                            <div class="dropdown-toggle active" id="crosshair-toggle"></div>
                        </div>
                        <div class="dropdown-item" onclick="toggleTimeScale()">
                            <span>Time Scale</span>
                            <div class="dropdown-toggle active" id="timescale-toggle"></div>
                        </div>
                        <div class="dropdown-item" onclick="togglePriceScale()">
                            <span>Price Scale</span>
                            <div class="dropdown-toggle active" id="pricescale-toggle"></div>
                        </div>
                    </div>
                    <div class="dropdown-section">
                        <div class="dropdown-header">Actions</div>
                        <div class="dropdown-item" onclick="resetZoom()">
                            <span>Reset Zoom</span>
                            <span>🎯</span>
                        </div>
                        <div class="dropdown-item" onclick="fitContent()">
                            <span>Fit Content</span>
                            <span>📏</span>
                        </div>
                        <div class="dropdown-item" onclick="autoScale()">
                            <span>Auto Scale</span>
                            <span>📐</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <button class="expand-btn" onclick="toggleFullscreen()" title="Fullscreen">⛶</button>
        </div>
    </div>
    ` : `
    <div class="dropdown-backdrop" id="dropdown-backdrop" onclick="closeAllDropdowns()"></div>
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
                <div class="fullscreen-tools-menu">
                    <button class="action-btn" onclick="toggleFullscreenToolsMenu()" id="fullscreen-tools-btn" title="Chart Tools">
                        🛠️
                    </button>
                    <div class="fullscreen-tools-dropdown" id="fullscreen-tools-dropdown">
                        <div class="fullscreen-dropdown-header">Chart Tools & Indicators</div>
                        
                        <div class="fullscreen-dropdown-section">
                            <div class="fullscreen-section-title">Timeframe</div>
                            <div class="fullscreen-dropdown-item" onclick="changeTimeframe('1m')">
                                <span>1 Minute</span>
                                <span id="fs-tf-1m-check" style="display: ${timeframe === '1m' ? 'inline' : 'none'};">✓</span>
                            </div>
                            <div class="fullscreen-dropdown-item" onclick="changeTimeframe('5m')">
                                <span>5 Minutes</span>
                                <span id="fs-tf-5m-check" style="display: ${timeframe === '5m' ? 'inline' : 'none'};">✓</span>
                            </div>
                            <div class="fullscreen-dropdown-item" onclick="changeTimeframe('15m')">
                                <span>15 Minutes</span>
                                <span id="fs-tf-15m-check" style="display: ${timeframe === '15m' ? 'inline' : 'none'};">✓</span>
                            </div>
                            <div class="fullscreen-dropdown-item" onclick="changeTimeframe('1h')">
                                <span>1 Hour</span>
                                <span id="fs-tf-1h-check" style="display: ${timeframe === '1h' ? 'inline' : 'none'};">✓</span>
                            </div>
                            <div class="fullscreen-dropdown-item" onclick="changeTimeframe('4h')">
                                <span>4 Hours</span>
                                <span id="fs-tf-4h-check" style="display: ${timeframe === '4h' ? 'inline' : 'none'};">✓</span>
                            </div>
                            <div class="fullscreen-dropdown-item" onclick="changeTimeframe('1d')">
                                <span>1 Day</span>
                                <span id="fs-tf-1d-check" style="display: ${timeframe === '1d' ? 'inline' : 'none'};">✓</span>
                            </div>
                        </div>
                        
                        <div class="fullscreen-dropdown-section">
                            <div class="fullscreen-section-title">Technical Indicators</div>
                            <div class="fullscreen-dropdown-item" onclick="toggleIndicator('sma20')">
                                <span>Simple Moving Average (20)</span>
                                <div class="fullscreen-toggle" id="fs-sma20-toggle"></div>
                            </div>
                            <div class="fullscreen-dropdown-item" onclick="toggleIndicator('sma50')">
                                <span>Simple Moving Average (50)</span>
                                <div class="fullscreen-toggle" id="fs-sma50-toggle"></div>
                            </div>
                            <div class="fullscreen-dropdown-item" onclick="toggleIndicator('ema21')">
                                <span>Exponential Moving Average (21)</span>
                                <div class="fullscreen-toggle" id="fs-ema21-toggle"></div>
                            </div>
                            <div class="fullscreen-dropdown-item" onclick="toggleIndicator('bollinger')">
                                <span>Bollinger Bands</span>
                                <div class="fullscreen-toggle" id="fs-bollinger-toggle"></div>
                            </div>
                            <div class="fullscreen-dropdown-item" onclick="toggleIndicator('rsi')">
                                <span>RSI (14)</span>
                                <div class="fullscreen-toggle" id="fs-rsi-toggle"></div>
                            </div>
                            <div class="fullscreen-dropdown-item" onclick="toggleIndicator('macd')">
                                <span>MACD</span>
                                <div class="fullscreen-toggle" id="fs-macd-toggle"></div>
                            </div>
                        </div>
                        
                        <div class="fullscreen-dropdown-section">
                            <div class="fullscreen-section-title">Chart Display</div>
                            <div class="fullscreen-dropdown-item" onclick="toggleVolume()">
                                <span>Volume Bars</span>
                                <div class="fullscreen-toggle" id="fs-volume-toggle"></div>
                            </div>
                            <div class="fullscreen-dropdown-item" onclick="toggleGridLines()">
                                <span>Grid Lines</span>
                                <div class="fullscreen-toggle active" id="fs-grid-toggle"></div>
                            </div>
                            <div class="fullscreen-dropdown-item" onclick="toggleCrosshair()">
                                <span>Crosshair</span>
                                <div class="fullscreen-toggle active" id="fs-crosshair-toggle"></div>
                            </div>
                            <div class="fullscreen-dropdown-item" onclick="toggleTimeScale()">
                                <span>Time Scale</span>
                                <div class="fullscreen-toggle active" id="fs-timescale-toggle"></div>
                            </div>
                            <div class="fullscreen-dropdown-item" onclick="togglePriceScale()">
                                <span>Price Scale</span>
                                <div class="fullscreen-toggle active" id="fs-pricescale-toggle"></div>
                            </div>
                        </div>
                        
                        <div class="fullscreen-dropdown-section">
                            <div class="fullscreen-section-title">Chart Actions</div>
                            <div class="fullscreen-dropdown-item" onclick="resetZoom()">
                                <span>Reset Zoom</span>
                                <span>🎯</span>
                            </div>
                            <div class="fullscreen-dropdown-item" onclick="fitContent()">
                                <span>Fit Content</span>
                                <span>📏</span>
                            </div>
                            <div class="fullscreen-dropdown-item" onclick="autoScale()">
                                <span>Auto Scale</span>
                                <span>📐</span>
                            </div>
                        </div>
                    </div>
                </div>
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

        // Tools dropdown functions
        function closeAllDropdowns() {
            const dropdown = document.getElementById('tools-dropdown');
            const fullscreenDropdown = document.getElementById('fullscreen-tools-dropdown');
            const btn = document.getElementById('tools-btn');
            const fullscreenBtn = document.getElementById('fullscreen-tools-btn');
            const backdrop = document.getElementById('dropdown-backdrop');
            
            if (dropdown) {
                dropdown.classList.remove('visible');
            }
            if (fullscreenDropdown) {
                fullscreenDropdown.classList.remove('visible');
            }
            if (btn) {
                btn.classList.remove('active');
            }
            if (fullscreenBtn) {
                fullscreenBtn.classList.remove('active');
            }
            if (backdrop) {
                backdrop.classList.remove('visible');
            }
        }
        
        function toggleToolsMenu() {
            const dropdown = document.getElementById('tools-dropdown');
            const btn = document.getElementById('tools-btn');
            const backdrop = document.getElementById('dropdown-backdrop');
            
            if (dropdown && btn && backdrop) {
                const isVisible = dropdown.classList.contains('visible');
                if (isVisible) {
                    dropdown.classList.remove('visible');
                    btn.classList.remove('active');
                    backdrop.classList.remove('visible');
                } else {
                    // Close other dropdowns first
                    closeAllDropdowns();
                    dropdown.classList.add('visible');
                    btn.classList.add('active');
                    backdrop.classList.add('visible');
                }
            }
        }

        function toggleFullscreenToolsMenu() {
            const dropdown = document.getElementById('fullscreen-tools-dropdown');
            const btn = document.getElementById('fullscreen-tools-btn');
            const backdrop = document.getElementById('dropdown-backdrop');
            
            if (dropdown && btn && backdrop) {
                const isVisible = dropdown.classList.contains('visible');
                if (isVisible) {
                    dropdown.classList.remove('visible');
                    btn.classList.remove('active');
                    backdrop.classList.remove('visible');
                } else {
                    // Close other dropdowns first
                    closeAllDropdowns();
                    dropdown.classList.add('visible');
                    btn.classList.add('active');
                    backdrop.classList.add('visible');
                }
            }
        }

        // Technical indicator functions
        let indicators = {
            sma20: null,
            sma50: null,
            ema21: null,
            bollinger: null,
            rsi: null,
            macd: null
        };

        function toggleIndicator(type) {
            const toggle = document.getElementById(type + '-toggle');
            const fsToggle = document.getElementById('fs-' + type + '-toggle');
            
            const isActive = toggle?.classList.contains('active') || fsToggle?.classList.contains('active');
            
            if (isActive) {
                // Remove indicator
                if (indicators[type]) {
                    chart.removeSeries(indicators[type]);
                    indicators[type] = null;
                }
                toggle?.classList.remove('active');
                fsToggle?.classList.remove('active');
            } else {
                // Add indicator
                addIndicator(type);
                toggle?.classList.add('active');
                fsToggle?.classList.add('active');
            }
        }

        function addIndicator(type) {
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
                        
                    case 'bollinger':
                        const bands = calculateBollingerBands(chartData, 20, 2);
                        indicators.bollinger = {
                            upper: chart.addLineSeries({
                                color: '#ffa726',
                                lineWidth: 1,
                                lineStyle: 2, // dashed
                                title: 'BB Upper'
                            }),
                            middle: chart.addLineSeries({
                                color: '#ffa726',
                                lineWidth: 1,
                                title: 'BB Middle'
                            }),
                            lower: chart.addLineSeries({
                                color: '#ffa726',
                                lineWidth: 1,
                                lineStyle: 2, // dashed
                                title: 'BB Lower'
                            })
                        };
                        indicators.bollinger.upper.setData(bands.upper);
                        indicators.bollinger.middle.setData(bands.middle);
                        indicators.bollinger.lower.setData(bands.lower);
                        break;
                        
                    case 'rsi':
                        indicators.rsi = chart.addLineSeries({
                            color: '#ab47bc',
                            lineWidth: 1,
                            title: 'RSI',
                            priceScaleId: 'rsi',
                        });
                        chart.priceScale('rsi').applyOptions({
                            scaleMargins: { top: 0.8, bottom: 0 },
                            borderVisible: false,
                        });
                        indicators.rsi.setData(calculateRSI(chartData, 14));
                        break;
                        
                    case 'macd':
                        const macd = calculateMACD(chartData);
                        indicators.macd = {
                            macd: chart.addLineSeries({
                                color: '#2196f3',
                                lineWidth: 1,
                                title: 'MACD',
                                priceScaleId: 'macd',
                            }),
                            signal: chart.addLineSeries({
                                color: '#f44336',
                                lineWidth: 1,
                                title: 'Signal',
                                priceScaleId: 'macd',
                            })
                        };
                        chart.priceScale('macd').applyOptions({
                            scaleMargins: { top: 0.8, bottom: 0 },
                            borderVisible: false,
                        });
                        indicators.macd.macd.setData(macd.macd);
                        indicators.macd.signal.setData(macd.signal);
                        break;
                }
            } catch (error) {
                console.error('Error adding indicator:', type, error);
            }
        }

        // Chart display functions
        let volumeSeries = null;
        let chartOptions = {
            volume: false,
            gridLines: true,
            crosshair: true,
            timeScale: true,
            priceScale: true
        };

        function toggleVolume() {
            const toggle = document.getElementById('volume-toggle');
            const fsToggle = document.getElementById('fs-volume-toggle');
            
            chartOptions.volume = !chartOptions.volume;
            
            if (chartOptions.volume) {
                if (!volumeSeries && chartData) {
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
                        color: item.close >= item.open ? '#26a69a40' : '#ef5350 40'
                    }));
                    volumeSeries.setData(volumeData);
                }
                toggle?.classList.add('active');
                fsToggle?.classList.add('active');
            } else {
                if (volumeSeries) {
                    chart.removeSeries(volumeSeries);
                    volumeSeries = null;
                }
                toggle?.classList.remove('active');
                fsToggle?.classList.remove('active');
            }
        }

        function toggleGridLines() {
            chartOptions.gridLines = !chartOptions.gridLines;
            
            chart.applyOptions({
                grid: {
                    vertLines: { visible: chartOptions.gridLines },
                    horzLines: { visible: chartOptions.gridLines }
                }
            });
            
            const toggle = document.getElementById('grid-toggle');
            const fsToggle = document.getElementById('fs-grid-toggle');
            
            if (chartOptions.gridLines) {
                toggle?.classList.add('active');
                fsToggle?.classList.add('active');
            } else {
                toggle?.classList.remove('active');
                fsToggle?.classList.remove('active');
            }
        }

        function toggleCrosshair() {
            chartOptions.crosshair = !chartOptions.crosshair;
            
            chart.applyOptions({
                crosshair: {
                    vertLine: { visible: chartOptions.crosshair },
                    horzLine: { visible: chartOptions.crosshair }
                }
            });
            
            const toggle = document.getElementById('crosshair-toggle');
            const fsToggle = document.getElementById('fs-crosshair-toggle');
            
            if (chartOptions.crosshair) {
                toggle?.classList.add('active');
                fsToggle?.classList.add('active');
            } else {
                toggle?.classList.remove('active');
                fsToggle?.classList.remove('active');
            }
        }

        function toggleTimeScale() {
            chartOptions.timeScale = !chartOptions.timeScale;
            
            chart.applyOptions({
                timeScale: { visible: chartOptions.timeScale }
            });
            
            const toggle = document.getElementById('timescale-toggle');
            const fsToggle = document.getElementById('fs-timescale-toggle');
            
            if (chartOptions.timeScale) {
                toggle?.classList.add('active');
                fsToggle?.classList.add('active');
            } else {
                toggle?.classList.remove('active');
                fsToggle?.classList.remove('active');
            }
        }

        function togglePriceScale() {
            chartOptions.priceScale = !chartOptions.priceScale;
            
            chart.applyOptions({
                rightPriceScale: { visible: chartOptions.priceScale }
            });
            
            const toggle = document.getElementById('pricescale-toggle');
            const fsToggle = document.getElementById('fs-pricescale-toggle');
            
            if (chartOptions.priceScale) {
                toggle?.classList.add('active');
                fsToggle?.classList.add('active');
            } else {
                toggle?.classList.remove('active');
                fsToggle?.classList.remove('active');
            }
        }

        function fitContent() {
            if (chart) {
                chart.timeScale().fitContent();
            }
        }

        function autoScale() {
            if (chart) {
                chart.timeScale().resetTimeScale();
            }
        }

        // Indicator calculation helpers
        function calculateSMA(data, period) {
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

        function calculateBollingerBands(data, period, stdDev) {
            const sma = calculateSMA(data, period);
            const upper = [];
            const middle = [];
            const lower = [];
            
            for (let i = 0; i < sma.length; i++) {
                const dataIndex = i + period - 1;
                let sumSquares = 0;
                
                for (let j = 0; j < period; j++) {
                    const diff = data[dataIndex - j].close - sma[i].value;
                    sumSquares += diff * diff;
                }
                
                const variance = sumSquares / period;
                const standardDeviation = Math.sqrt(variance);
                
                middle.push({ time: sma[i].time, value: sma[i].value });
                upper.push({ time: sma[i].time, value: sma[i].value + (standardDeviation * stdDev) });
                lower.push({ time: sma[i].time, value: sma[i].value - (standardDeviation * stdDev) });
            }
            
            return { upper, middle, lower };
        }

        function calculateRSI(data, period) {
            const result = [];
            let gains = 0;
            let losses = 0;
            
            // Calculate initial average gain and loss
            for (let i = 1; i <= period; i++) {
                const change = data[i].close - data[i - 1].close;
                if (change >= 0) {
                    gains += change;
                } else {
                    losses -= change;
                }
            }
            
            gains /= period;
            losses /= period;
            
            for (let i = period; i < data.length; i++) {
                const change = data[i].close - data[i - 1].close;
                
                if (change >= 0) {
                    gains = ((gains * (period - 1)) + change) / period;
                    losses = (losses * (period - 1)) / period;
                } else {
                    gains = (gains * (period - 1)) / period;
                    losses = ((losses * (period - 1)) - change) / period;
                }
                
                const rs = gains / losses;
                const rsi = 100 - (100 / (1 + rs));
                
                result.push({ time: data[i].time, value: rsi });
            }
            
            return result;
        }

        function calculateMACD(data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
            const fastEMA = calculateEMA(data, fastPeriod);
            const slowEMA = calculateEMA(data, slowPeriod);
            
            const macdLine = [];
            const startIndex = slowPeriod - fastPeriod;
            
            for (let i = startIndex; i < fastEMA.length; i++) {
                const slowIndex = i - startIndex;
                macdLine.push({
                    time: fastEMA[i].time,
                    value: fastEMA[i].value - slowEMA[slowIndex].value
                });
            }
            
            const signalLine = calculateEMA(macdLine.map(item => ({
                time: item.time,
                close: item.value
            })), signalPeriod);
            
            return {
                macd: macdLine,
                signal: signalLine
            };
        }

        // Close dropdowns when clicking outside
        document.addEventListener('click', function(event) {
            const toolsDropdown = document.getElementById('tools-dropdown');
            const toolsBtn = document.getElementById('tools-btn');
            const fsToolsDropdown = document.getElementById('fullscreen-tools-dropdown');
            const fsToolsBtn = document.getElementById('fullscreen-tools-btn');
            
            // Close regular tools dropdown
            if (toolsDropdown && toolsBtn && 
                !toolsBtn.contains(event.target) && 
                !toolsDropdown.contains(event.target)) {
                toolsDropdown.classList.remove('visible');
                toolsBtn.classList.remove('active');
            }
            
            // Close fullscreen tools dropdown
            if (fsToolsDropdown && fsToolsBtn && 
                !fsToolsBtn.contains(event.target) && 
                !fsToolsDropdown.contains(event.target)) {
                fsToolsDropdown.classList.remove('visible');
                fsToolsBtn.classList.remove('active');
            }
        });

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
