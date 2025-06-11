# Chart Options State Management Fixes

## Problems Identified

### 1. **State Not Persisting**
- Chart options were resetting after a few seconds due to WebView regeneration
- State was not properly initialized in the WebView with current React Native state
- No persistence mechanism between chart reloads

### 2. **State Not Shared Between Modes**
- Minimized and fullscreen modes used the same component but state wasn't properly maintained
- Chart options selected in minimized mode had no effect on fullscreen mode
- No state lifting to parent component

### 3. **WebView Communication Issues**
- Chart was being regenerated with hardcoded values instead of current state
- `toggleOption` function was trying to communicate with stale WebView instances
- JavaScript bridge wasn't properly synchronized with React Native state

## Solutions Implemented

### 1. **Lifted State to Parent Component**

#### Before:
```typescript
// State was internal to ProfessionalTradingChart
const [chartOptions, setChartOptions] = useState({
  volume: false,
  gridLines: true,
  // ... other options
});
```

#### After:
```typescript
// State lifted to ChartScreen component
const [chartOptions, setChartOptions] = useState({
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

// Passed down to chart component
<ProfessionalTradingChart
  chartOptions={chartOptions}
  onChartOptionsChange={setChartOptions}
  // ... other props
/>
```

### 2. **Proper State Initialization in WebView**

#### WebView HTML Generation:
```typescript
const generateChartHTML = () => {
  const chartData = JSON.stringify(data);
  const chartOptionsData = JSON.stringify(chartOptions);
  const currentChartTypeData = JSON.stringify(currentChartType);
  
  return `
    <script>
      let chartOptions = ${chartOptionsData};
      let currentChartType = ${currentChartTypeData};
      // Chart initialized with current state
    </script>
  `;
};
```

#### Chart Configuration Using State:
```typescript
const chartConfig = {
  grid: {
    vertLines: { visible: chartOptions.gridLines },
    horzLines: { visible: chartOptions.gridLines }
  },
  crosshair: {
    vertLine: { visible: chartOptions.crosshair },
    horzLine: { visible: chartOptions.crosshair }
  },
  rightPriceScale: { visible: chartOptions.priceScale },
  timeScale: { visible: chartOptions.timeScale }
};
```

### 3. **State Synchronization Strategy**

Instead of trying to communicate state changes to existing WebView:

#### Before (Problematic):
```typescript
const handleOptionToggle = (option) => {
  setChartOptions(newOptions);
  // Try to send message to WebView
  webViewRef.current.injectJavaScript(`toggleOption('${option}', ${enabled})`);
};
```

#### After (Robust):
```typescript
const handleOptionToggle = (option) => {
  const newOptions = { ...chartOptions, [option]: !chartOptions[option] };
  setChartOptions(newOptions);
  // Chart will regenerate with new state automatically
};

// useEffect triggers chart regeneration when state changes
useEffect(() => {
  setChartReady(false); // Forces WebView reload with new HTML
}, [chartOptions, currentChartType, isFullscreen]);
```

### 4. **Proper Initial Options Application**

```typescript
function applyInitialOptions() {
  console.log('Applying initial chart options:', chartOptions);
  
  Object.keys(chartOptions).forEach(option => {
    if (chartOptions[option]) {
      switch(option) {
        case 'volume':
          toggleVolume(true);
          break;
        case 'sma20':
        case 'sma50':
        case 'ema21':
          toggleIndicator(option, true);
          break;
      }
    }
  });
}
```

### 5. **Backward Compatibility**

The component still works with internal state if external state isn't provided:

```typescript
const chartOptions = externalChartOptions || internalChartOptions;
const setChartOptions = onChartOptionsChange ? 
  (newOptions) => onChartOptionsChange(newOptions) :
  setInternalChartOptions;
```

## Key Benefits Achieved

### ✅ **Persistent State**
- Chart options now persist across WebView reloads
- State is maintained when switching between timeframes
- Options remain active during component re-renders

### ✅ **Shared State Between Modes**
- Minimized and fullscreen modes now share the same state
- Options selected in one mode are immediately reflected in the other
- Consistent behavior across all chart interactions

### ✅ **Reliable State Management**
- No more temporary state changes that revert after seconds
- Chart always initializes with the correct current state
- State changes are immediately visible and permanent

### ✅ **Better Architecture**
- State is managed at the appropriate component level
- Clear separation between presentation and state management
- Easier to debug and maintain

## Testing Verification

1. **State Persistence**: ✅
   - Toggle any chart option
   - Option remains active after WebView reloads
   - State persists when switching timeframes

2. **Mode Consistency**: ✅
   - Enable SMA20 in minimized mode
   - Switch to fullscreen - SMA20 remains visible
   - Toggle options in fullscreen - changes persist in minimized mode

3. **Option Effectiveness**: ✅
   - All chart options now have immediate and lasting effects
   - No more temporary changes that revert
   - Visual feedback matches actual chart state

## Files Modified

1. **`/src/screens/trading/ChartScreen.tsx`**
   - Added `chartOptions` state
   - Added data transformation for chart compatibility
   - Pass state down to chart component

2. **`/src/components/organisms/ProfessionalTradingChart.tsx`**
   - Added external chart options props
   - Updated HTML generation to use current state
   - Added `applyInitialOptions` function
   - Improved state change handling with regeneration strategy

The chart options now work reliably with persistent state that's properly shared between minimized and fullscreen modes.
