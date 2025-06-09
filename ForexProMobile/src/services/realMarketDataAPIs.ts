// Real market data integration options for production use

interface MarketDataAPI {
  connect(): Promise<void>;
  subscribe(symbol: string, callback: (data: any) => void): () => void;
  getHistoricalData(symbol: string, timeframe: string, count: number): Promise<any[]>;
  disconnect(): void;
}

// Option 1: Alpha Vantage (Free tier available)
class AlphaVantageAPI implements MarketDataAPI {
  private apiKey: string;
  private baseUrl = 'https://www.alphavantage.co/query';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async connect(): Promise<void> {
    // Alpha Vantage doesn't require connection setup
    console.log('Connected to Alpha Vantage API');
  }

  subscribe(symbol: string, callback: (data: any) => void): () => void {
    // Alpha Vantage doesn't support real-time streaming
    // Would need to poll their API
    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `${this.baseUrl}?function=CURRENCY_EXCHANGE_RATE&from_currency=${symbol.split('/')[0]}&to_currency=${symbol.split('/')[1]}&apikey=${this.apiKey}`
        );
        const data = await response.json();
        callback(data);
      } catch (error) {
        console.error('Error fetching real-time data:', error);
      }
    }, 60000); // 1 minute intervals (API limit)

    return () => clearInterval(interval);
  }

  async getHistoricalData(symbol: string, timeframe: string, count: number): Promise<any[]> {
    const [from, to] = symbol.split('/');
    const response = await fetch(
      `${this.baseUrl}?function=FX_DAILY&from_symbol=${from}&to_symbol=${to}&apikey=${this.apiKey}`
    );
    
    const data = await response.json();
    // Process and return historical data
    return this.processAlphaVantageData(data);
  }

  private processAlphaVantageData(data: any): any[] {
    // Convert Alpha Vantage format to your CandleData format
    const timeSeries = data['Time Series (Daily)'];
    if (!timeSeries) return [];

    return Object.entries(timeSeries).map(([timestamp, values]: [string, any]) => ({
      timestamp: new Date(timestamp).getTime(),
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      volume: 0 // Alpha Vantage doesn't provide volume for forex
    }));
  }

  async disconnect(): Promise<void> {
    console.log('Disconnected from Alpha Vantage API');
  }
}

// Option 2: Finnhub (Free tier available)
class FinnhubAPI implements MarketDataAPI {
  private apiKey: string;
  private baseUrl = 'https://finnhub.io/api/v1';
  private websocket: WebSocket | null = null;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.websocket = new WebSocket(`wss://ws.finnhub.io?token=${this.apiKey}`);
      
      this.websocket.onopen = () => {
        console.log('Connected to Finnhub WebSocket');
        resolve();
      };
      
      this.websocket.onerror = (error) => {
        console.error('Finnhub WebSocket error:', error);
        reject(error);
      };
    });
  }

  subscribe(symbol: string, callback: (data: any) => void): () => void {
    if (!this.websocket) {
      throw new Error('WebSocket not connected');
    }

    const finnhubSymbol = `OANDA:${symbol.replace('/', '_')}`; // Convert to Finnhub format
    
    this.websocket.send(JSON.stringify({
      type: 'subscribe',
      symbol: finnhubSymbol
    }));

    const messageHandler = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.type === 'trade') {
        callback(data);
      }
    };

    this.websocket.addEventListener('message', messageHandler);

    return () => {
      if (this.websocket) {
        this.websocket.send(JSON.stringify({
          type: 'unsubscribe',
          symbol: finnhubSymbol
        }));
        this.websocket.removeEventListener('message', messageHandler);
      }
    };
  }

  async getHistoricalData(symbol: string, timeframe: string, count: number): Promise<any[]> {
    const resolution = this.convertTimeframe(timeframe);
    const to = Math.floor(Date.now() / 1000);
    const from = to - (count * this.getSecondsForTimeframe(timeframe));
    
    const finnhubSymbol = `OANDA:${symbol.replace('/', '_')}`;
    
    const response = await fetch(
      `${this.baseUrl}/forex/candle?symbol=${finnhubSymbol}&resolution=${resolution}&from=${from}&to=${to}&token=${this.apiKey}`
    );
    
    const data = await response.json();
    return this.processFinnhubCandles(data);
  }

  private convertTimeframe(timeframe: string): string {
    const mapping: { [key: string]: string } = {
      '1m': '1',
      '5m': '5',
      '15m': '15',
      '1h': '60',
      '4h': '240',
      '1d': 'D'
    };
    return mapping[timeframe] || '60';
  }

  private getSecondsForTimeframe(timeframe: string): number {
    const mapping: { [key: string]: number } = {
      '1m': 60,
      '5m': 300,
      '15m': 900,
      '1h': 3600,
      '4h': 14400,
      '1d': 86400
    };
    return mapping[timeframe] || 3600;
  }

  private processFinnhubCandles(data: any): any[] {
    if (!data.c || !data.o || !data.h || !data.l || !data.t) return [];

    return data.t.map((timestamp: number, index: number) => ({
      timestamp: timestamp * 1000, // Convert to milliseconds
      open: data.o[index],
      high: data.h[index],
      low: data.l[index],
      close: data.c[index],
      volume: data.v?.[index] || 0
    }));
  }

  async disconnect(): Promise<void> {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    console.log('Disconnected from Finnhub API');
  }
}

// Option 3: IEX Cloud (Paid, but very reliable)
class IEXCloudAPI implements MarketDataAPI {
  private apiKey: string;
  private baseUrl = 'https://cloud.iexapis.com/stable';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async connect(): Promise<void> {
    console.log('Connected to IEX Cloud API');
  }

  subscribe(symbol: string, callback: (data: any) => void): () => void {
    // IEX Cloud requires polling for forex data
    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `${this.baseUrl}/fx/latest?symbols=${symbol}&token=${this.apiKey}`
        );
        const data = await response.json();
        callback(data);
      } catch (error) {
        console.error('Error fetching IEX data:', error);
      }
    }, 5000); // 5 second intervals

    return () => clearInterval(interval);
  }

  async getHistoricalData(symbol: string, timeframe: string, count: number): Promise<any[]> {
    const response = await fetch(
      `${this.baseUrl}/fx/historical?symbols=${symbol}&last=${count}&token=${this.apiKey}`
    );
    
    const data = await response.json();
    return this.processIEXData(data, symbol);
  }

  private processIEXData(data: any, symbol: string): any[] {
    const symbolData = data[0]?.[symbol];
    if (!symbolData) return [];

    return symbolData.map((item: any) => ({
      timestamp: new Date(item.date).getTime(),
      open: item.rate,
      high: item.rate * 1.001, // Approximate since IEX doesn't provide OHLC for forex
      low: item.rate * 0.999,
      close: item.rate,
      volume: 0
    }));
  }

  async disconnect(): Promise<void> {
    console.log('Disconnected from IEX Cloud API');
  }
}

// Configuration factory
export class MarketDataFactory {
  static createAPI(provider: 'alphavantage' | 'finnhub' | 'iexcloud', apiKey: string): MarketDataAPI {
    switch (provider) {
      case 'alphavantage':
        return new AlphaVantageAPI(apiKey);
      case 'finnhub':
        return new FinnhubAPI(apiKey);
      case 'iexcloud':
        return new IEXCloudAPI(apiKey);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}

// Usage example:
// const api = MarketDataFactory.createAPI('finnhub', 'your-api-key');
// await api.connect();
// const unsubscribe = api.subscribe('EUR/USD', (data) => console.log(data));

export type { MarketDataAPI };
