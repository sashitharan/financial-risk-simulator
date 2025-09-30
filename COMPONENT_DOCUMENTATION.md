# Financial Risk Simulation Application - Component Documentation

## Overview
The **WorkingEnhancedSimulator** is a comprehensive React-based financial risk simulation application that provides portfolio management, scenario analysis, and risk assessment capabilities. Built with TypeScript, Ant Design, and modern React patterns, it offers a sophisticated interface for financial risk professionals.

## Architecture & Technology Stack

### Core Technologies
- **React 18** with TypeScript for type safety
- **Ant Design (AntD)** for UI components and styling
- **Recharts** for data visualization
- **Session Storage** for data persistence
- **CSS Variables** for theming support

### Key Dependencies
```typescript
import { useState, useEffect } from "react";
import { Table, Button, InputNumber, Select, Space, Modal, Form, Input, Card, Row, Col, Statistic, Tabs, Tag, Alert, Collapse, Descriptions, Badge, Progress, Empty, Tooltip, Radio } from "antd";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
```

## Component Structure

### 1. Data Models & Types

#### Scenario Definitions
```typescript
// Standard Scenarios (Equity, Rates, FX, Volatility, Credit)
const STANDARD_SCENARIOS = [
  { id: "equity-down-5", name: "Equity -5%", shock: -0.05, category: "equity" },
  { id: "equity-up-5", name: "Equity +5%", shock: 0.05, category: "equity" },
  // ... more scenarios
];

// Stress Test Scenarios
const STRESS_TEST_SCENARIOS = [
  { id: "lehman-2008", name: "Lehman Brothers 2008", shock: -0.50, severity: "extreme" },
  { id: "covid-march-2020", name: "COVID-19 March 2020", shock: -0.30, severity: "severe" },
  // ... more stress tests
];

// Monte Carlo Scenarios
const MONTE_CARLO_SCENARIOS = [
  { id: "daily-var-95", name: "Daily VaR 95%", numSimulations: 10000, confidenceLevel: 0.95 },
  { id: "monthly-var-99", name: "Monthly VaR 99%", numSimulations: 50000, confidenceLevel: 0.99 },
  // ... more Monte Carlo scenarios
];
```

#### Type Definitions
```typescript
interface Result {
  asset: string;
  quantity: number;
  shock: number | string;
  impact: number;
  originalPrice?: number;
  newPrice?: number;
  originalValue: number;
  shockedValue: number;
  isEditedData?: boolean;
  editedPrice?: number;
  riskMetrics: {
    delta: number;
    gamma: number;
    duration: number;
    convexity: number;
    vega: number;
    theta: number;
  };
}

interface ScenarioRecord {
  id: string;
  timestamp: string;
  scenarioName: string;
  scenarioType: 'standard' | 'stress-test' | 'monte-carlo' | 'backtesting' | 'manual-edit';
  scenarioScope: 'portfolio' | 'single';
  shockValue: number | string;
  totalImpact: number;
  assetsAnalyzed: number;
  results: Result[];
}
```

### 2. State Management

#### Core State Variables
```typescript
const [positions, setPositions] = useState<Position[]>([]);
const [results, setResults] = useState<Result[]>([]);
const [scenarioHistory, setScenarioHistory] = useState<ScenarioRecord[]>([]);
const [selectedAsset, setSelectedAsset] = useState<Position | null>(null);
const [selectedAssetData, setSelectedAssetData] = useState<any>(null);
const [isDataModalOpen, setIsDataModalOpen] = useState(false);
const [isMarketDataModalEditable, setIsMarketDataModalEditable] = useState(false);
const [scenarioName, setScenarioName] = useState("");
const [isEditMode, setIsEditMode] = useState(false);
const [hasMarketDataChanges, setHasMarketDataChanges] = useState(false);
const [scenarioScope, setScenarioScope] = useState<'portfolio' | 'single'>('portfolio');
```

#### Data Persistence
- **Session Storage**: Edited market data is persisted using `sessionStorage` for cross-navigation persistence
- **State Synchronization**: Real-time updates between modal edits and scenario calculations

### 3. Main Application Tabs

#### 3.1 Portfolio Tab 💼
**Purpose**: Portfolio management and market data editing interface

**Key Features**:
- **Portfolio Positions Table**: Displays all portfolio positions with risk factors
- **Asset Selection**: Click any asset ticker to open market data viewer
- **Scenario Scope Selection**: Radio buttons for portfolio-wide vs single asset analysis
- **Navigation to Scenarios**: Direct navigation to scenarios page with edited data

**Components**:
```typescript
// Portfolio Positions Table
<Table
  dataSource={positions}
  columns={[
    { title: 'Asset', dataIndex: 'asset', key: 'asset' },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Price', dataIndex: 'price', key: 'price' },
    { title: 'Value', dataIndex: 'value', key: 'value' },
    // ... risk factor columns
  ]}
  onRow={(record) => ({
    onClick: () => openMarketDataModal(record)
  })}
/>

// Scenario Analysis Options
<Radio.Group value={scenarioScope} onChange={(e) => setScenarioScope(e.target.value)}>
  <Radio value="portfolio">Portfolio-wide Analysis</Radio>
  <Radio value="single">Single Asset Analysis</Radio>
</Radio.Group>
```

#### 3.2 Scenarios Tab 📈
**Purpose**: Scenario execution and analysis interface

**Key Features**:
- **Scenario Categories**: Standard, Stress Test, Monte Carlo scenarios
- **Real-time Execution**: Immediate scenario calculation and results display
- **Interactive Scenario Cards**: Click to execute scenarios with visual feedback
- **Results Visualization**: Charts and tables showing scenario impact

**Components**:
```typescript
// Scenario Execution Cards
{ALL_SCENARIOS.map((scenario) => (
  <Card
    key={scenario.id}
    hoverable
    onClick={() => runSimulation(scenario)}
    className="scenario-card"
  >
    <Space direction="vertical" style={{ width: '100%' }}>
      {scenario.icon}
      <div>{scenario.name}</div>
      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
        {scenario.description}
      </div>
    </Space>
  </Card>
))}

// Results Visualization
{results.length > 0 && (
  <Row gutter={[16, 16]}>
    <Col xs={24} lg={12}>
      <Card title="Portfolio Impact Summary">
        <Statistic
          title="Total Impact"
          value={results.reduce((sum, r) => sum + r.impact, 0)}
          prefix="$"
          precision={2}
        />
      </Card>
    </Col>
    <Col xs={24} lg={12}>
      <Card title="Impact Distribution">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={results}>
            <XAxis dataKey="asset" />
            <YAxis />
            <RechartsTooltip />
            <Bar dataKey="impact" fill="var(--primary)" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </Col>
  </Row>
)}
```

#### 3.3 Risk Metrics Tab 📊
**Purpose**: Detailed risk analytics and metrics

**Key Features**:
- **Greeks Calculation**: Delta, Gamma, Vega, Theta, Rho calculations
- **Duration & Convexity**: Interest rate sensitivity metrics
- **Risk Decomposition**: Asset-level and portfolio-level risk breakdown
- **Interactive Charts**: Visual representation of risk metrics

**Components**:
```typescript
// Risk Metrics Summary
<Row gutter={[16, 16]}>
  <Col xs={24} sm={12} md={8}>
    <Statistic title="Portfolio Delta" value={totalDelta} prefix="$" />
  </Col>
  <Col xs={24} sm={12} md={8}>
    <Statistic title="Portfolio Gamma" value={totalGamma} prefix="$" />
  </Col>
  <Col xs={24} sm={12} md={8}>
    <Statistic title="Portfolio Vega" value={totalVega} prefix="$" />
  </Col>
</Row>

// Risk Metrics Table
<Table
  dataSource={results}
  columns={[
    { title: 'Asset', dataIndex: 'asset', key: 'asset' },
    { title: 'Delta', dataIndex: ['riskMetrics', 'delta'], key: 'delta' },
    { title: 'Gamma', dataIndex: ['riskMetrics', 'gamma'], key: 'gamma' },
    { title: 'Vega', dataIndex: ['riskMetrics', 'vega'], key: 'vega' },
    // ... more risk metrics
  ]}
/>
```

#### 3.4 Backtesting Tab 🔄
**Purpose**: Historical scenario validation and backtesting

**Key Features**:
- **Historical Data Integration**: Real market data from backtesting-data.json
- **Scenario Validation**: Compare simulated vs actual historical outcomes
- **Performance Metrics**: Accuracy, correlation, and error analysis
- **Time Series Visualization**: Historical performance charts

**Components**:
```typescript
// Backtesting Execution
const runBacktesting = async () => {
  const backtestingResults = [];
  
  for (const scenario of backtestingData.scenarios) {
    const simulatedResult = runSimulation(scenario);
    const actualResult = scenario.actualOutcome;
    
    backtestingResults.push({
      scenario: scenario.name,
      simulated: simulatedResult.totalImpact,
      actual: actualResult,
      accuracy: calculateAccuracy(simulatedResult, actualResult)
    });
  }
  
  setBacktestingResults(backtestingResults);
};
```

#### 3.5 Assumptions Tab 📋
**Purpose**: Simulation methodology and assumptions documentation

**Key Features**:
- **Methodology Documentation**: Detailed explanation of calculation methods
- **Assumption Parameters**: Configurable simulation parameters
- **Model Validation**: Model accuracy and validation metrics
- **Risk Factor Definitions**: Comprehensive risk factor explanations

**Components**:
```typescript
// Assumptions Documentation
<Collapse defaultActiveKey={['methodology', 'parameters', 'validation']}>
  <Collapse.Panel header="📊 Simulation Methodology" key="methodology">
    <Descriptions column={1}>
      <Descriptions.Item label="Equity Shocks">
        Linear price impact: P_new = P_original × (1 + shock)
      </Descriptions.Item>
      <Descriptions.Item label="Interest Rate Shocks">
        Duration-based impact: ΔP = -D × P × Δr
      </Descriptions.Item>
      <Descriptions.Item label="Volatility Shocks">
        Vega-based impact: ΔP = V × Δσ
      </Descriptions.Item>
    </Descriptions>
  </Collapse.Panel>
</Collapse>
```

#### 3.6 History Tab 📜
**Purpose**: Scenario execution history and detailed analysis

**Key Features**:
- **Scenario History Table**: Chronological list of all executed scenarios
- **Detailed Scenario View**: Expandable rows with comprehensive scenario details
- **Export Capabilities**: Download scenario results and history
- **Search and Filter**: Advanced filtering and search capabilities

**Components**:
```typescript
// Scenario History Table
<Table
  dataSource={scenarioHistory}
  expandable={{
    expandedRowRender: (record) => (
      <div>
        <h4>Scenario Details</h4>
        <Descriptions column={2}>
          <Descriptions.Item label="Scenario Type">{record.scenarioType}</Descriptions.Item>
          <Descriptions.Item label="Scope">{record.scenarioScope}</Descriptions.Item>
          <Descriptions.Item label="Assets Analyzed">{record.assetsAnalyzed}</Descriptions.Item>
          <Descriptions.Item label="Total Impact">${record.totalImpact.toFixed(2)}</Descriptions.Item>
        </Descriptions>
        
        <Table
          dataSource={record.results}
          columns={[
            { title: 'Asset', dataIndex: 'asset', key: 'asset' },
            { title: 'Original Price', dataIndex: 'originalPrice', key: 'originalPrice' },
            { title: 'New Price', dataIndex: 'newPrice', key: 'newPrice' },
            { title: 'Impact', dataIndex: 'impact', key: 'impact' },
            // ... more columns
          ]}
        />
      </div>
    )
  }}
  columns={[
    { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp' },
    { title: 'Scenario', dataIndex: 'scenarioName', key: 'scenarioName' },
    { title: 'Type', dataIndex: 'scenarioType', key: 'scenarioType' },
    { title: 'Impact', dataIndex: 'totalImpact', key: 'totalImpact' },
    { title: 'Actions', key: 'actions', render: (_, record) => (
      <Button onClick={() => viewScenarioDetails(record)}>View Details</Button>
    )}
  ]}
/>
```

### 4. Market Data Modal System

#### 4.1 Modal Structure
**Purpose**: Comprehensive market data viewing and editing interface

**Key Features**:
- **Multi-tab Interface**: Equity, Volatility, Interest Rates, Correlation, Monte Carlo, FX
- **Edit Mode Toggle**: Seamless switching between view and edit modes
- **Real-time Validation**: Input validation and error handling
- **Data Persistence**: Session storage integration for edited data

**Modal Tabs**:
1. **📈 Equity Tab**: Spot prices, dividends, corporate actions
2. **📊 Volatility Tab**: Volatility surface matrix editing
3. **📈 Interest Rates Tab**: Yield curve editing
4. **🔗 Correlation Tab**: Asset correlation matrix
5. **🎲 Monte Carlo Tab**: Simulation parameters
6. **💱 FX Tab**: Foreign exchange rates

#### 4.2 Edit Mode Workflow
```typescript
// Edit Mode Entry
const enterEditMode = () => {
  setIsEditMode(true);
  setIsMarketDataModalEditable(true);
  setScenarioName(""); // Reset scenario name
};

// Data Updates
const updateEquityMarketData = (field: string, value: number) => {
  setSelectedAssetData(prev => ({
    ...prev,
    marketData: {
      ...prev.marketData,
      [field]: value
    }
  }));
  setHasMarketDataChanges(true);
  
  // Save to session storage
  const editedData = {
    asset: selectedAsset?.asset,
    marketData: {
      ...selectedAssetData.marketData,
      [field]: value
    }
  };
  sessionStorage.setItem('editedMarketData', JSON.stringify(editedData));
};
```

### 5. Core Calculation Engine

#### 5.1 Simulation Logic
```typescript
const runSimulation = (selectedScenario: any) => {
  // Get edited market data from session storage
  const editedData = getEditedMarketData();
  
  // Filter assets based on scenario scope
  const assetsToAnalyze = scenarioScope === 'portfolio' 
    ? positions 
    : positions.filter(p => p.asset === selectedAsset?.asset);
  
  // Calculate scenario impact
  const results = assetsToAnalyze.map((pos) => {
    let shock = selectedScenario.shock;
    let shockedPrice = pos.price * (1 + shock);
    let usingEditedData = false;
    let editedPrice = null;
    
    // Apply edited data if available
    if (editedData && editedData.asset === pos.asset) {
      if (editedData.marketData && editedData.marketData.spot) {
        editedPrice = editedData.marketData.spot;
        shockedPrice = pos.price * (1 + shock); // Apply shock to original price
        usingEditedData = true;
      }
      // ... handle other edited data types
    }
    
    // Calculate risk metrics
    const riskMetrics = calculateRiskMetrics(pos, shockedPrice);
    
    return {
      asset: pos.asset,
      quantity: pos.quantity,
      shock: shock,
      impact: (shockedPrice - pos.price) * pos.quantity,
      originalPrice: usingEditedData && editedPrice ? editedPrice : pos.price,
      newPrice: shockedPrice,
      isEditedData: usingEditedData,
      editedPrice: editedPrice,
      riskMetrics: riskMetrics
    };
  });
  
  // Record scenario in history
  const scenarioRecord: ScenarioRecord = {
    id: generateScenarioId(),
    timestamp: new Date().toISOString(),
    scenarioName: selectedScenario.name,
    scenarioType: selectedScenario.type,
    scenarioScope: scenarioScope,
    shockValue: shock,
    totalImpact: results.reduce((sum, r) => sum + r.impact, 0),
    assetsAnalyzed: results.length,
    results: results
  };
  
  setScenarioHistory(prev => [scenarioRecord, ...prev]);
  setResults(results);
};
```

#### 5.2 Risk Metrics Calculation
```typescript
const calculateRiskMetrics = (position: Position, newPrice: number) => {
  const priceChange = newPrice - position.price;
  const priceChangePercent = priceChange / position.price;
  
  return {
    delta: position.quantity * priceChangePercent, // Price sensitivity
    gamma: position.quantity * Math.pow(priceChangePercent, 2) / 2, // Convexity
    duration: position.quantity * 5.0, // Interest rate sensitivity (assumed 5-year duration)
    convexity: position.quantity * 25.0, // Duration convexity (assumed 25)
    vega: position.quantity * priceChangePercent * 0.1, // Volatility sensitivity
    theta: -position.quantity * priceChangePercent * 0.01 // Time decay
  };
};
```

### 6. Data Integration

#### 6.1 Market Data Sources
```typescript
// Market data from external JSON files
import marketData from "../data/market-data.json";
import backtestingData from "../data/backtesting-data.json";
import murexPayload from "../data/murex-payload.json";

// Data structure examples
const marketDataStructure = {
  equity: {
    symbol: "AAPL",
    spot: 150.00,
    dividend: 0.23,
    currency: "USD"
  },
  volatility: {
    volMatrix: [[0.20, 0.22], [0.25, 0.28]],
    strikes: [140, 150, 160],
    expiries: [0.25, 0.5]
  },
  interestRates: {
    currency: "USD",
    curve: [
      { tenor: "1M", rate: 0.05 },
      { tenor: "3M", rate: 0.06 },
      { tenor: "6M", rate: 0.07 }
    ]
  }
};
```

#### 6.2 Session Storage Integration
```typescript
// Save edited data
const saveEditedData = (asset: string, data: any) => {
  const editedData = {
    asset: asset,
    timestamp: new Date().toISOString(),
    ...data
  };
  sessionStorage.setItem('editedMarketData', JSON.stringify(editedData));
};

// Load edited data
const getEditedMarketData = () => {
  try {
    const stored = sessionStorage.getItem('editedMarketData');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading edited market data:', error);
  }
  return null;
};
```

### 7. UI/UX Features

#### 7.1 Dark Mode Support
```typescript
// CSS Variables for theming
const darkModeStyles = {
  '--bg-primary': '#1f1f1f',
  '--text-primary': '#ffffff',
  '--text-secondary': '#a0a0a0',
  '--border-primary': '#303030',
  '--modal-bg': '#2a2a2a',
  '--primary': '#1890ff'
};

// Modal styling for dark mode
<Modal
  className="dark-theme-modal"
  style={{
    backgroundColor: 'var(--modal-bg)',
    color: 'var(--text-primary)'
  }}
  bodyStyle={{
    backgroundColor: 'var(--modal-bg)',
    color: 'var(--text-primary)'
  }}
/>
```

#### 7.2 Responsive Design
```typescript
// Responsive grid system
<Row gutter={[16, 16]}>
  <Col xs={24} sm={12} md={8} lg={6}>
    <Card>Content</Card>
  </Col>
</Row>

// Responsive charts
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data}>
    {/* Chart components */}
  </BarChart>
</ResponsiveContainer>
```

#### 7.3 Interactive Elements
```typescript
// Hover effects and animations
<Card
  hoverable
  className="scenario-card"
  style={{
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  }}
  onClick={handleScenarioClick}
>
  {/* Card content */}
</Card>

// Loading states
{loading ? (
  <Spin size="large" />
) : (
  <Table dataSource={data} />
)}
```

### 8. Error Handling & Validation

#### 8.1 Input Validation
```typescript
const validateMarketData = (data: any) => {
  const errors = [];
  
  if (!data.spot || data.spot <= 0) {
    errors.push('Spot price must be positive');
  }
  
  if (data.volatility && (data.volatility < 0 || data.volatility > 5)) {
    errors.push('Volatility must be between 0 and 500%');
  }
  
  return errors;
};
```

#### 8.2 Error Boundaries
```typescript
// Error handling in calculations
try {
  const result = runSimulation(scenario);
  setResults(result);
} catch (error) {
  console.error('Simulation error:', error);
  message.error('Error running simulation. Please check your data.');
}
```

### 9. Performance Optimizations

#### 9.1 Memoization
```typescript
// Memoized calculations
const memoizedResults = useMemo(() => {
  return calculatePortfolioMetrics(positions);
}, [positions]);

// Memoized components
const ScenarioCard = React.memo(({ scenario, onClick }) => (
  <Card onClick={onClick}>
    {/* Card content */}
  </Card>
));
```

#### 9.2 Lazy Loading
```typescript
// Lazy loading for large datasets
const LazyScenarioHistory = React.lazy(() => import('./ScenarioHistory'));

// Conditional rendering
{scenarioHistory.length > 100 && (
  <Suspense fallback={<Spin />}>
    <LazyScenarioHistory />
  </Suspense>
)}
```

## Key Features Summary

### ✅ Implemented Features
1. **Portfolio Management**: Complete portfolio positions management with risk factors
2. **Market Data Editing**: Comprehensive market data editing with persistence
3. **Scenario Analysis**: Standard, stress test, and Monte Carlo scenarios
4. **Risk Metrics**: Greeks, duration, convexity calculations
5. **Historical Backtesting**: Historical scenario validation
6. **Scenario History**: Complete scenario execution history
7. **Dark Mode Support**: Full dark mode theming
8. **Responsive Design**: Mobile-friendly responsive layout
9. **Data Persistence**: Session storage for edited data
10. **Interactive UI**: Hover effects, animations, and smooth transitions

### 🔧 Technical Highlights
- **TypeScript**: Full type safety throughout the application
- **Ant Design**: Professional UI components and styling
- **Session Storage**: Client-side data persistence
- **Modular Architecture**: Well-organized component structure
- **Error Handling**: Comprehensive error handling and validation
- **Performance**: Optimized with memoization and lazy loading

### 📊 Data Flow
1. **Portfolio Data** → Market Data Modal → Edit Mode → Session Storage
2. **Scenario Selection** → Calculation Engine → Results Display → History Recording
3. **Edited Data** → Scenario Calculations → Results with "Edited" Labels
4. **Historical Data** → Backtesting Engine → Validation Results

This comprehensive documentation provides a complete overview of the Financial Risk Simulation Application, covering all major components, features, and technical implementations.
