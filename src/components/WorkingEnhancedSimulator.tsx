import { useState, useEffect } from "react";
import { 
  Table, 
  Button, 
  InputNumber, 
  Select, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Card, 
  Row, 
  Col, 
  Statistic,
  Tabs,
  Tag,
  Alert,
  Collapse,
  Descriptions,
  Badge,
  Progress,
  Empty,
  Tooltip
} from "antd";
import { 
  PlusOutlined, 
  DollarOutlined, 
  RiseOutlined, 
  FallOutlined,
  BarChartOutlined,
  LineChartOutlined,
  ThunderboltOutlined,
  ExperimentOutlined,
  InfoCircleOutlined,
  HistoryOutlined,
  SearchOutlined,
  DownloadOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  CalendarOutlined,
  EyeOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Tooltip as RechartsTooltip } from "recharts";
import marketData from "../data/market-data.json";
import backtestingData from "../data/backtesting-data.json";
import murexPayload from "../data/murex-payload.json";

const { TabPane } = Tabs;
const { Option } = Select;

// Helper functions for scenario history
const getScenarioTypeColor = (type: string) => {
  const colors: { [key: string]: string } = {
    'equity': 'blue',
    'rates': 'green',
    'fx': 'orange',
    'volatility': 'purple',
    'credit': 'red',
    'stress-test': 'volcano',
    'monte-carlo': 'cyan',
    'custom': 'geekblue',
    'backtesting': 'magenta'
  };
  return colors[type] || 'default';
};

// Enhanced scenario definitions - OpenGamma Strata Inspired
const STANDARD_SCENARIOS = [
  { 
    id: "equity-down-5", 
    name: "Equity -5%", 
    shock: -0.05, 
    description: "Market downturn scenario", 
    category: "equity",
    icon: <BarChartOutlined />,
    type: "standard"
  },
  { 
    id: "equity-up-5", 
    name: "Equity +5%", 
    shock: 0.05, 
    description: "Market upturn scenario", 
    category: "equity",
    icon: <BarChartOutlined />,
    type: "standard"
  },
  { 
    id: "dividend-yield-up", 
    name: "Dividend Yield +50bps", 
    shock: 0.005, 
    description: "Dividend yield increase scenario", 
    category: "equity",
    icon: <BarChartOutlined />,
    type: "standard"
  },
  { 
    id: "rates-up-50bps", 
    name: "Rates +50bps", 
    shock: 0.005, 
    description: "Parallel yield curve shift", 
    category: "rates",
    icon: <LineChartOutlined />,
    type: "standard"
  },
  { 
    id: "curve-twist", 
    name: "Curve Twist", 
    shock: 0.01, 
    description: "Yield curve twist scenario", 
    category: "rates",
    icon: <LineChartOutlined />,
    type: "standard"
  },
  { 
    id: "fx-up-2", 
    name: "FX +2%", 
    shock: 0.02, 
    description: "Currency appreciation", 
    category: "fx",
    icon: <LineChartOutlined />,
    type: "standard"
  },
  { 
    id: "fx-vol-spike", 
    name: "FX Volatility Spike", 
    shock: 0.30, 
    description: "FX volatility increase", 
    category: "fx",
    icon: <ThunderboltOutlined />,
    type: "standard"
  },
  { 
    id: "credit-ig-widen", 
    name: "IG Credit +100bps", 
    shock: 0.01, 
    description: "Investment grade spread widening", 
    category: "credit",
    icon: <ThunderboltOutlined />,
    type: "standard"
  },
  { 
    id: "credit-hy-widen", 
    name: "HY Credit +200bps", 
    shock: 0.02, 
    description: "High yield spread widening", 
    category: "credit",
    icon: <ThunderboltOutlined />,
    type: "standard"
  }
];

const STRESS_TEST_SCENARIOS = [
  { 
    id: "2008-financial-crisis", 
    name: "2008 Financial Crisis", 
    shock: -0.40, 
    description: "Historical replication with 40% equity decline", 
    category: "stress-test",
    icon: <ThunderboltOutlined />,
    type: "stress-test",
    severity: "extreme",
    historicalBasis: "2008-09-15"
  },
  { 
    id: "covid-march-2020", 
    name: "COVID-19 March 2020", 
    shock: -0.30, 
    description: "Pandemic market shock simulation", 
    category: "stress-test",
    icon: <ThunderboltOutlined />,
    type: "stress-test",
    severity: "severe",
    historicalBasis: "2020-03-16"
  },
  { 
    id: "mild-recession", 
    name: "Mild Recession", 
    shock: -0.15, 
    description: "Mild economic downturn", 
    category: "stress-test",
    icon: <ThunderboltOutlined />,
    type: "stress-test",
    severity: "mild"
  },
  { 
    id: "moderate-crisis", 
    name: "Moderate Crisis", 
    shock: -0.25, 
    description: "Moderate market stress", 
    category: "stress-test",
    icon: <ThunderboltOutlined />,
    type: "stress-test",
    severity: "moderate"
  }
];

const MONTE_CARLO_SCENARIOS = [
  { 
    id: "daily-var-95", 
    name: "Daily VaR 95%", 
    shock: 0, 
    description: "10,000 simulations with normal distribution", 
    category: "monte-carlo",
    icon: <ExperimentOutlined />,
    type: "monte-carlo",
    numSimulations: 10000,
    confidenceLevel: 0.95,
    timeHorizon: 1,
    distributionType: "normal"
  },
  { 
    id: "monthly-var-99", 
    name: "Monthly VaR 99%", 
    shock: 0, 
    description: "50,000 simulations with t-distribution", 
    category: "monte-carlo",
    icon: <ExperimentOutlined />,
    type: "monte-carlo",
    numSimulations: 50000,
    confidenceLevel: 0.99,
    timeHorizon: 21,
    distributionType: "t-distribution"
  },
  { 
    id: "custom-mc", 
    name: "Custom Monte Carlo", 
    shock: 0, 
    description: "Customizable parameters and distributions", 
    category: "monte-carlo",
    icon: <ExperimentOutlined />,
    type: "monte-carlo",
    numSimulations: 25000,
    confidenceLevel: 0.95,
    timeHorizon: 5,
    distributionType: "historical"
  }
];

const ALL_SCENARIOS = [...STANDARD_SCENARIOS, ...STRESS_TEST_SCENARIOS, ...MONTE_CARLO_SCENARIOS, {
  id: "custom", 
  name: "Custom", 
  shock: 0, 
  description: "Define your own shock", 
  category: "custom",
  icon: <ExperimentOutlined />,
  type: "custom"
}];

type Position = {
  key: string;
  asset: string;
  quantity: number;
  price: number;
  instrumentType: string;
  riskFactors: {
    delta?: number;
    gamma?: number;
    duration?: number;
    convexity?: number;
    vega?: number;
    theta?: number;
  };
};

type Result = {
  asset: string;
  quantity: number;
  shock: number;
  impact: number;
  originalValue: number;
  shockedValue: number;
  originalPrice?: number;
  newPrice?: number;
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
};

// Clean market data structure from market-data.json
const getMarketData = () => {
  const baba = marketData.equity[0];
  const hk700 = marketData.equity[1];
  const usdRates = marketData.interestRates[0];
  const hkdRates = marketData.interestRates[1];
  const babaVol = marketData.volatilitySurfaces[0];
  const hk700Vol = marketData.volatilitySurfaces[1];

  return {
    // Legacy structure for backward compatibility
    baba: baba,
    hk700: hk700,
    rates: usdRates,
    hkdRates: hkdRates,
    volatility: {
      baba: babaVol,
      hk700: hk700Vol
    },
    monteCarlo: marketData.monteCarlo,
    
    // Clean new structure
    equity: marketData.equity,
    interestRates: marketData.interestRates,
    volatilitySurfaces: marketData.volatilitySurfaces,
    correlations: marketData.correlations
  };
};

const MARKET_DATA = getMarketData();

export default function WorkingEnhancedSimulator() {
  // State for editing functionality
  
  // Market data editing state
  const [hasMarketDataChanges, setHasMarketDataChanges] = useState(false);

  // Initialize portfolio STRICTLY from market-data.json assets only
  const [positions, setPositions] = useState<Position[]>(() => {
    const initialPositions: Position[] = [];
    
    // Only BABA UN from market data
    const babaData = MARKET_DATA.baba;
    initialPositions.push({
      key: "1",
      asset: babaData.symbol,
      quantity: Math.round(babaData.notional / babaData.spot),
      price: babaData.spot,
      instrumentType: "equity",
      riskFactors: {
        delta: 1.0,
        gamma: 0.0,
        duration: 0.0,
        convexity: 0.0,
        vega: 0.0,
        theta: 0.0
      }
    });
    
    // Only 700 HK from market data
    const hk700Data = MARKET_DATA.hk700;
    initialPositions.push({
      key: "2",
      asset: hk700Data.symbol,
      quantity: Math.round(hk700Data.notional / hk700Data.spot),
      price: hk700Data.spot,
      instrumentType: "equity",
      riskFactors: {
        delta: 1.0,
        gamma: 0.0,
        duration: 0.0,
        convexity: 0.0,
        vega: 0.0,
        theta: 0.0
      }
    });
    
    // USD 3Y Bond based on yield curve data
    const usd3YRate = MARKET_DATA.rates.curve.find(point => point.tenor === "3Y");
    if (usd3YRate) {
      initialPositions.push({
        key: "3",
        asset: "USD 3Y Bond",
        quantity: 1000000,
        price: 100,
        instrumentType: "bond",
        riskFactors: {
          delta: 0.0,
          gamma: 0.0,
          duration: 2.8,
          convexity: 12.0,
          vega: 0.0,
          theta: 0.0
        }
      });
    }
    
    // HKD 2Y Bond based on yield curve data
    const hkd2YRate = MARKET_DATA.hkdRates.curve.find(point => point.tenor === "2Y");
    if (hkd2YRate) {
      initialPositions.push({
        key: "4",
        asset: "HKD 2Y Bond",
        quantity: 500000,
        price: 100,
        instrumentType: "bond",
        riskFactors: {
          delta: 0.0,
          gamma: 0.0,
          duration: 1.8,
          convexity: 8.0,
          vega: 0.0,
          theta: 0.0
        }
      });
    }
    
    return initialPositions;
  });

  const [selectedScenario, setSelectedScenario] = useState(ALL_SCENARIOS[0]);
  const [customShock, setCustomShock] = useState<number>(0);
  const [customScenarioName, setCustomScenarioName] = useState<string>("");
  const [scenarioScope, setScenarioScope] = useState<'portfolio' | 'single'>('portfolio');
  const [results, setResults] = useState<Result[]>([]);
  
  // Scenario History & Audit Trail
  const [scenarioHistory, setScenarioHistory] = useState<any[]>([]);
  const [historyFilters, setHistoryFilters] = useState({
    dateRange: null,
    scenarioType: null,
    assetFilter: null,
    searchTerm: ""
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [selectedAssetData, setSelectedAssetData] = useState<any>(null);
  const [selectedAsset, setSelectedAsset] = useState<Position | null>(null);

  
  // Backtesting state
  const [selectedBacktestScenario, setSelectedBacktestScenario] = useState<any>(null);
  const [backtestResults, setBacktestResults] = useState<any[]>([]);
  const [isBacktestRunning, setIsBacktestRunning] = useState(false);
  const [backtestProgress, setBacktestProgress] = useState(0);
  
  // Custom market conditions state
  const [useCustomScenario, setUseCustomScenario] = useState(false);
  const [customMarketConditions, setCustomMarketConditions] = useState({
    equityDecline: -15,
    volatilitySpike: 80,
    rateCuts: -50,
    creditWidening: 100
  });
  const [customStartDate, setCustomStartDate] = useState("2023-01-01");
  const [customEndDate, setCustomEndDate] = useState("2023-12-31");
  
  // Deal selection for dynamic lifecycle data
  const [selectedDealIndex, setSelectedDealIndex] = useState(0);
  const [availableDeals, setAvailableDeals] = useState<any[]>([]);

  // Manual scenario editing state
  // const [isEditingMarketData, setIsEditingMarketData] = useState(false); // Removed - using new editing system
  const [isMarketDataModalEditable, setIsMarketDataModalEditable] = useState(false);
  const [scenarioName, setScenarioName] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [form] = Form.useForm();

  // Initialize market data when modal opens
  useEffect(() => {
    if (isDataModalOpen && selectedAssetData) {
      console.log('Modal opened, initializing market data with:', selectedAssetData);
      initializeMarketData(selectedAssetData);
    }
  }, [isDataModalOpen, selectedAssetData]);

  // Also initialize when selectedAssetData changes
  useEffect(() => {
    if (selectedAssetData && selectedAssetData.marketData) {
      console.log('Asset data changed, reinitializing market data');
      initializeMarketData(selectedAssetData);
    }
  }, [selectedAssetData]);

  // Load available deals from Murex payload
  useEffect(() => {
    if (murexPayload.Chunk?.Jobs) {
      const deals = murexPayload.Chunk.Jobs.map((job: any, index: number) => {
        // Try multiple paths to get product name
        const productName = job.commonData?.productName || 
                           job.commonData?.productTemplate || 
                           job.commonData?.dealData?.instrument?.product ||
                           job.commonData?.instrument?.product ||
                           job.commonData?.addInfo?.productTemplate?.name || 
                           'Unknown Product';
        
        // Debug logging
        console.log(`Deal ${index + 1}:`, {
          productName: job.commonData?.productName,
          productTemplate: job.commonData?.productTemplate,
          dealDataInstrumentProduct: job.commonData?.dealData?.instrument?.product,
          instrumentProduct: job.commonData?.instrument?.product,
          nestedProductTemplate: job.commonData?.addInfo?.productTemplate?.name,
          finalProductName: productName
        });
        
        return {
          index,
          id: job.murexJobID || index,
          name: `Deal ${index + 1} - ${productName}`,
          description: `Job ID: ${job.murexJobID}, Product: ${productName}`,
          status: job.commonData?.status || 'Unknown',
          fixingDate: job.commonData?.fixing?.lastFixingDate || 'Unknown'
        };
      });
      setAvailableDeals(deals);
    }
  }, []);

  // Load scenario history from localStorage on component mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('scenarioHistory');
      if (savedHistory) {
        setScenarioHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Error loading scenario history:', error);
    }
  }, []);

  // Save scenario history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('scenarioHistory', JSON.stringify(scenarioHistory));
    } catch (error) {
      console.error('Error saving scenario history:', error);
    }
  }, [scenarioHistory]);

  // Helper functions for scenario history
  const filteredHistory = scenarioHistory.filter(record => {
    const matchesSearch = !historyFilters.searchTerm || 
      record.scenarioName.toLowerCase().includes(historyFilters.searchTerm.toLowerCase()) ||
      record.selectedAsset?.toLowerCase().includes(historyFilters.searchTerm.toLowerCase());
    
    const matchesType = !historyFilters.scenarioType || record.scenarioType === historyFilters.scenarioType;
    const matchesScope = !historyFilters.assetFilter || record.scenarioScope === historyFilters.assetFilter;
    
    return matchesSearch && matchesType && matchesScope;
  });

  const getWeeklyExecutions = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return scenarioHistory.filter(record => new Date(record.timestamp) > oneWeekAgo).length;
  };

  const getMostUsedScenarioType = () => {
    const typeCounts: { [key: string]: number } = {};
    scenarioHistory.forEach(record => {
      typeCounts[record.scenarioType] = (typeCounts[record.scenarioType] || 0) + 1;
    });
    const mostUsed = Object.keys(typeCounts).reduce((a, b) => 
      typeCounts[a] > typeCounts[b] ? a : b, 'None');
    return mostUsed.charAt(0).toUpperCase() + mostUsed.slice(1);
  };

  const getAverageImpact = () => {
    if (scenarioHistory.length === 0) return 0;
    const total = scenarioHistory.reduce((sum, record) => sum + Math.abs(record.totalImpact), 0);
    return Math.round(total / scenarioHistory.length);
  };

  const exportScenarioHistory = () => {
    const csvContent = [
      ['Timestamp', 'Scenario Name', 'Type', 'Scope', 'Asset', 'Shock %', 'Total Impact', 'Max Loss', 'Assets Analyzed', 'Start Date', 'End Date', 'Custom Scenario'].join(','),
      ...filteredHistory.map(record => [
        record.timestamp,
        `"${record.scenarioName}"`,
        record.scenarioType,
        record.scenarioScope,
        record.selectedAsset || 'All',
        record.shockValue && typeof record.shockValue === 'number' 
          ? (record.shockValue * 100).toFixed(2) 
          : record.shockValue || 'N/A',
        record.totalImpact,
        record.maxLoss,
        record.assetsAnalyzed,
        record.backtestMetadata?.startDate || 'N/A',
        record.backtestMetadata?.endDate || 'N/A',
        record.backtestMetadata?.isCustomScenario ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `scenario-history-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearScenarioHistory = () => {
    Modal.confirm({
      title: 'Clear Scenario History',
      content: 'Are you sure you want to clear all scenario history? This action cannot be undone.',
      okText: 'Yes, Clear All',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        setScenarioHistory([]);
      },
    });
  };

  const viewScenarioDetails = (record: any) => {
    console.log('View Details clicked for record:', record);
    
    if (!record) {
      console.error('No record provided to viewScenarioDetails');
      Modal.error({
        title: 'Error',
        content: 'No scenario data available to display.',
        className: 'dark-theme-modal',
        style: {
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)'
        },
        bodyStyle: {
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)'
        }
      });
      return;
    }
    
    const isBacktesting = record.scenarioType === 'backtesting';
    
    try {
      Modal.info({
      title: (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          color: 'var(--text-primary)'
        }}>
          <EyeOutlined style={{ color: 'var(--primary)' }} />
          <span>Scenario Details: {record.scenarioName || 'Unknown'}</span>
        </div>
      ),
      width: 900,
      style: {
        backgroundColor: 'var(--modal-bg)',
        color: 'var(--text-primary)'
      },
      content: (
        <div style={{ 
          color: 'var(--text-primary)',
          backgroundColor: 'var(--modal-bg)'
        }}>
          <Descriptions 
            bordered 
            column={2} 
            size="small"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)'
            }}
          >
            <Descriptions.Item label="Scenario ID" style={{ color: 'var(--text-primary)' }}>
              <Tag color="blue">{record.id || 'N/A'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Execution Time" style={{ color: 'var(--text-primary)' }}>
              {record.timestamp ? new Date(record.timestamp).toLocaleString() : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Scenario Type" style={{ color: 'var(--text-primary)' }}>
              <Tag color={record.scenarioType === 'backtesting' ? 'magenta' : 'green'}>
                {record.scenarioType || 'N/A'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Scope" style={{ color: 'var(--text-primary)' }}>
              <Tag color="orange">{record.scenarioScope || 'N/A'}</Tag>
            </Descriptions.Item>
            {!isBacktesting && record.shockValue !== null && record.shockValue !== undefined && (
              <Descriptions.Item label="Shock Value" style={{ color: 'var(--text-primary)' }}>
                <Tag color={typeof record.shockValue === 'number' && Number(record.shockValue) >= 0 ? 'red' : 'green'}>
                  {typeof record.shockValue === 'number' 
                    ? (Number(record.shockValue) * 100).toFixed(2) + '%'
                    : record.shockValue
                  }
                </Tag>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Assets Analyzed" style={{ color: 'var(--text-primary)' }}>
              <Tag color="blue">{record.assetsAnalyzed || 'N/A'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Total Impact" style={{ color: 'var(--text-primary)' }}>
              <span style={{ 
                color: record.totalImpact >= 0 ? 'var(--success)' : 'var(--error)',
                fontWeight: 'bold'
              }}>
                {record.totalImpact ? `$${Number(record.totalImpact).toLocaleString()}` : 'N/A'}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Max Loss" style={{ color: 'var(--text-primary)' }}>
              <span style={{ 
                color: 'var(--error)',
                fontWeight: 'bold'
              }}>
                {record.maxLoss ? `$${Number(record.maxLoss).toLocaleString()}` : 'N/A'}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Session ID" span={2} style={{ color: 'var(--text-primary)' }}>
              <code style={{ 
                backgroundColor: 'var(--bg-tertiary)',
                padding: '2px 6px',
                borderRadius: '4px',
                color: 'var(--text-secondary)'
              }}>
                {record.sessionId || 'N/A'}
              </code>
            </Descriptions.Item>
          </Descriptions>
          
          {isBacktesting && record.backtestMetadata && (
            <div style={{ marginTop: '16px' }}>
              <h4 style={{ 
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📊 Backtesting Parameters
              </h4>
              <Descriptions 
                bordered 
                column={2} 
                size="small"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-primary)'
                }}
              >
                <Descriptions.Item label="Start Date" style={{ color: 'var(--text-primary)' }}>
                  <Tag color="blue">{record.backtestMetadata.startDate}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="End Date" style={{ color: 'var(--text-primary)' }}>
                  <Tag color="blue">{record.backtestMetadata.endDate}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Period" style={{ color: 'var(--text-primary)' }}>
                  <Tag color="green">{record.backtestMetadata.period}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Custom Scenario" style={{ color: 'var(--text-primary)' }}>
                  <Tag color={record.backtestMetadata.isCustomScenario ? 'orange' : 'default'}>
                    {record.backtestMetadata.isCustomScenario ? 'Yes' : 'No'}
                  </Tag>
                </Descriptions.Item>
                {record.backtestMetadata.selectedDeal && (
                  <Descriptions.Item label="Selected Deal" style={{ color: 'var(--text-primary)' }}>
                    <Tag color="purple">{record.backtestMetadata.selectedDeal}</Tag>
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Market Conditions" span={2} style={{ color: 'var(--text-primary)' }}>
                  {record.backtestMetadata.customConditions ? (
                    <div style={{ 
                      backgroundColor: 'var(--bg-tertiary)',
                      padding: '12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-primary)'
                    }}>
                      <div style={{ marginBottom: '4px' }}>
                        <Tag color="red">Equity: {record.backtestMetadata.customConditions.equityDecline}%</Tag>
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <Tag color="orange">Volatility: +{record.backtestMetadata.customConditions.volatilitySpike}%</Tag>
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <Tag color="blue">Rates: {record.backtestMetadata.customConditions.rateCuts}bps</Tag>
                      </div>
                      <div>
                        <Tag color="purple">Credit: +{record.backtestMetadata.customConditions.creditWidening}bps</Tag>
                      </div>
                    </div>
                  ) : (
                    <Tag color="default">Standard historical scenario conditions</Tag>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
          
          <div style={{ marginTop: '16px' }}>
            <h4 style={{ 
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📋 Detailed Results
            </h4>
            {record.results && record.results.length > 0 ? (
              <Table
                size="small"
                dataSource={record.results}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} results`,
                  pageSizeOptions: ['5', '10', '20', '50'],
                  size: 'small'
                }}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-primary)'
                }}
                className="dark-theme-table"
              columns={isBacktesting ? [
                { 
                  title: 'Date', 
                  dataIndex: 'date', 
                  key: 'date',
                  render: (value) => (
                    <span style={{ color: 'var(--text-primary)' }}>
                      {value || 'N/A'}
                    </span>
                  )
                },
                { 
                  title: 'P&L', 
                  dataIndex: 'pnl', 
                  key: 'pnl', 
                  render: (value) => (
                    <span style={{ 
                      color: value >= 0 ? 'var(--success)' : 'var(--error)',
                      fontWeight: 'bold'
                    }}>
                      {value ? `$${Number(value).toLocaleString()}` : 'N/A'}
                    </span>
                  )
                },
                { 
                  title: 'Cumulative P&L', 
                  dataIndex: 'cumulativePnl', 
                  key: 'cumulativePnl', 
                  render: (value) => (
                    <span style={{ 
                      color: value >= 0 ? 'var(--success)' : 'var(--error)',
                      fontWeight: 'bold'
                    }}>
                      {value ? `$${Number(value).toLocaleString()}` : 'N/A'}
                    </span>
                  )
                },
                { 
                  title: 'Market Condition', 
                  dataIndex: 'marketCondition', 
                  key: 'marketCondition',
                  render: (value) => (
                    <Tag 
                      color={value && value !== 'N/A' ? 'blue' : 'default'} 
                      style={{ 
                        color: value && value !== 'N/A' ? 'white' : 'var(--text-primary)',
                        backgroundColor: value && value !== 'N/A' ? 'var(--primary)' : 'var(--bg-tertiary)',
                        borderColor: 'var(--border-primary)'
                      }}
                    >
                      {value || 'N/A'}
                    </Tag>
                  )
                }
              ] : [
                { 
                  title: 'Asset', 
                  dataIndex: 'asset', 
                  key: 'asset',
                  render: (value) => (
                    <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>
                      {value || 'N/A'}
                    </span>
                  )
                },
                { 
                  title: 'Quantity', 
                  dataIndex: 'quantity', 
                  key: 'quantity',
                  render: (value) => (
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {value ? Number(value).toLocaleString() : 'N/A'}
                    </span>
                  )
                },
                { 
                  title: 'Original Price', 
                  dataIndex: 'originalPrice', 
                  key: 'originalPrice', 
                  render: (value, record: any) => {
                    // If this record uses edited data, show the edited price as original
                    const isEditedData = record?.isEditedData;
                    const editedPrice = record?.editedPrice;
                    const displayPrice = isEditedData && editedPrice ? editedPrice : value;
                    
                    return (
                      <span style={{ color: 'var(--text-primary)' }}>
                        {displayPrice ? `$${Number(displayPrice).toFixed(2)}` : 'N/A'}
                        {isEditedData && editedPrice && (
                          <Tag color="blue" style={{ marginLeft: 8 }}>
                            Edited
                          </Tag>
                        )}
                      </span>
                    );
                  }
                },
                { 
                  title: 'New Price', 
                  dataIndex: 'newPrice', 
                  key: 'newPrice', 
                  render: (value) => (
                    <span style={{ color: 'var(--text-primary)' }}>
                      {value ? `$${Number(value).toFixed(2)}` : 'N/A'}
                    </span>
                  )
                },
                { 
                  title: 'Shock', 
                  dataIndex: 'shock', 
                  key: 'shock', 
                  render: (value) => (
                    <Tag color={value >= 0 ? 'red' : 'green'}>
                      {value ? `${(Number(value) * 100).toFixed(2)}%` : 'N/A'}
                    </Tag>
                  )
                },
                { 
                  title: 'Impact', 
                  dataIndex: 'impact', 
                  key: 'impact', 
                  render: (value) => (
                    <span style={{ 
                      color: value >= 0 ? 'var(--success)' : 'var(--error)',
                      fontWeight: 'bold'
                    }}>
                      {value ? `$${Number(value).toLocaleString()}` : 'N/A'}
                    </span>
                  )
                }
              ]}
            />
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                No detailed results available for this scenario.
              </div>
            )}
          </div>
        </div>
      ),
    });
    } catch (error) {
      console.error('Error opening scenario details modal:', error);
      Modal.error({
        title: 'Error',
        content: 'Failed to open scenario details. Please try again.',
        className: 'dark-theme-modal',
        style: {
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)'
        },
        bodyStyle: {
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)'
        }
      });
    }
  };

  const rerunScenario = (record: any) => {
    if (record.scenarioType === 'backtesting') {
      // Handle backtesting scenario re-run
      if (record.backtestMetadata) {
        setUseCustomScenario(record.backtestMetadata.isCustomScenario);
        setCustomScenarioName(record.scenarioName);
        setCustomStartDate(record.backtestMetadata.startDate);
        setCustomEndDate(record.backtestMetadata.endDate);
        
        if (record.backtestMetadata.isCustomScenario && record.backtestMetadata.customConditions) {
          setCustomMarketConditions(record.backtestMetadata.customConditions);
        }
        
        // Switch to backtesting tab
        const backtestingTab = document.querySelector('[data-node-key="backtesting"]') as HTMLElement;
        if (backtestingTab) backtestingTab.click();
        
        Modal.success({
          title: 'Backtesting Scenario Loaded',
          content: `Backtesting scenario "${record.scenarioName}" has been loaded with all parameters. You can now run it again.`,
        });
      }
    } else {
      // Handle regular scenario re-run
      const scenario = ALL_SCENARIOS.find(s => s.name === record.scenarioName);
      if (scenario) {
        setSelectedScenario(scenario);
      } else if (record.scenarioType === 'custom') {
        setSelectedScenario({ 
          id: 'custom', 
          name: 'Custom', 
          category: 'custom', 
          shock: record.shockValue, 
          description: 'Custom scenario',
          icon: <ExperimentOutlined />,
          type: 'custom'
        });
        setCustomScenarioName(record.scenarioName);
        setCustomShock(typeof record.shockValue === 'number' ? record.shockValue * 100 : 0);
      }
      
      setScenarioScope(record.scenarioScope);
      
      // Switch to scenarios tab
      const scenariosTab = document.querySelector('[data-node-key="scenarios"]') as HTMLElement;
      if (scenariosTab) scenariosTab.click();
      
      Modal.success({
        title: 'Scenario Loaded',
        content: `Scenario "${record.scenarioName}" has been loaded. You can now run it again with the same parameters.`,
      });
    }
  };

  const runSimulation = () => {
    console.log('runSimulation called with:', {
      scenarioScope,
      selectedAsset: selectedAsset?.asset,
      selectedScenario: selectedScenario.name,
      customScenarioName,
      positions: positions.length
    });
    
    // Check if single asset mode requires asset selection
    if (scenarioScope === 'single' && !selectedAsset) {
      console.error('No asset selected for single asset simulation');
      Modal.warning({
        title: 'No Asset Selected',
        content: 'Please select an asset for single asset simulation.',
        okText: 'OK',
        className: 'dark-theme-modal',
        style: {
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)'
        },
        bodyStyle: {
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)'
        }
      });
      return;
    }
    
    // Check if custom scenario has a name when using custom
    if (selectedScenario.name === "Custom" && !customScenarioName.trim()) {
      console.error('Please provide a custom scenario name');
      Modal.warning({
        title: 'Scenario Name Required',
        content: 'Please enter a name for your custom scenario.',
        okText: 'OK',
        className: 'dark-theme-modal',
        style: {
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)'
        },
        bodyStyle: {
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)'
        }
      });
      return;
    }
    
    console.log('Running enhanced simulation with scenario:', selectedScenario.name);
    console.log('Scenario scope:', scenarioScope);
    console.log('Selected asset:', selectedAsset?.asset || 'Portfolio-wide');
    console.log('Using market data:', MARKET_DATA);
    
  // Check for edited market data in session storage
  const getEditedMarketData = () => {
    try {
      const stored = sessionStorage.getItem('editedMarketData');
      if (stored) {
        const editedData = JSON.parse(stored);
        console.log('Found edited market data in session storage:', editedData);
        return editedData;
      }
    } catch (error) {
      console.error('Error loading edited market data from session storage:', error);
    }
    return null;
  };

  const editedData = getEditedMarketData();
  if (editedData) {
    console.log('Using edited market data for simulation:', editedData);
  }
    
    const shock = selectedScenario.name === "Custom" ? customShock / 100 : selectedScenario.shock;
    
    // Determine which assets to analyze
    const assetsToAnalyze = scenarioScope === 'portfolio' ? positions : [selectedAsset];
    console.log('Assets to analyze:', assetsToAnalyze.map(a => a?.asset));
    
    // Enhanced calculation with real Murex market data integration
    const calc = assetsToAnalyze.filter(pos => pos !== null).map((pos) => {
      console.log(`Processing asset: ${pos.asset}`);
      let shockedPrice = pos.price;
      let shockValue = shock;
      let riskMetrics = { ...pos.riskFactors };
      
      // Check if this asset has edited market data in session storage
      let usingEditedData = false;
      if (editedData && editedData.asset === pos.asset) {
        console.log(`Using edited market data for ${pos.asset}:`, editedData);
        
        // Handle different types of edited data
        if (editedData.marketData && editedData.marketData.spot) {
          // Equity market data (spot, bid, ask)
          const editedPrice = editedData.marketData.spot;
          shockedPrice = editedPrice * (1 + shock);
          usingEditedData = true;
          console.log(`Edited equity data calculation: ${editedPrice} * (1 + ${shock}) = ${shockedPrice}`);
        } else if (editedData.volatility) {
          // Volatility data - use volatility impact on price
          const volImpact = editedData.volatility.volMatrix[0][0] || 0; // Use first vol point as example
          shockedPrice = pos.price * (1 + shock + (volImpact - 0.2) * 0.1); // Vol impact
          usingEditedData = true;
          console.log(`Edited volatility data calculation: ${pos.price} * (1 + ${shock} + vol_impact) = ${shockedPrice}`);
        } else if (editedData.interestRates) {
          // Interest rate data - use rate impact on price
          const rateImpact = editedData.interestRates[0]?.curve[0]?.rate || 0;
          shockedPrice = pos.price * (1 + shock + (rateImpact - 0.05) * 0.1); // Rate impact
          usingEditedData = true;
          console.log(`Edited interest rate data calculation: ${pos.price} * (1 + ${shock} + rate_impact) = ${shockedPrice}`);
        }
      }
      
      // Apply different shock logic based on scenario category and instrument type
      // Skip this if we're using edited data (already calculated above)
      if (!usingEditedData) {
        switch (selectedScenario.category) {
        case 'equity':
          // Use TSM UN specific data for equity scenarios
          if (pos.asset.includes('TSM UN')) {
            // Apply shock to TSM UN spot price from Murex data
            const basePrice = pos.price; // Use actual position price
            const equityShock = shock;
            const deltaEffect = (pos.riskFactors.delta || 0) * equityShock;
            const gammaEffect = 0.5 * (pos.riskFactors.gamma || 0) * equityShock * equityShock;
            shockedPrice = basePrice * (1 + deltaEffect + gammaEffect);
          } else {
            // Standard equity calculation for other assets
            const equityShock = shock;
            const deltaEffect = (pos.riskFactors.delta || 0) * equityShock;
            const gammaEffect = 0.5 * (pos.riskFactors.gamma || 0) * equityShock * equityShock;
            shockedPrice = pos.price * (1 + deltaEffect + gammaEffect);
          }
          break;
          
        case 'fx':
          // FX shocks affect price directly
          shockedPrice = pos.price * (1 + shock);
          break;
          
        case 'rates':
          // Use real yield curve data for rate scenarios
          const rateShock = shock;
          let durationEffect = -(pos.riskFactors.duration || 0) * rateShock;
          let convexityEffect = 0.5 * (pos.riskFactors.convexity || 0) * rateShock * rateShock;
          
          // Apply curve-specific adjustments based on Murex rates
          if (pos.asset.includes('3Y')) {
            // Use 3Y rate from curve (0.032856)
            const baseRate = MARKET_DATA.rates.curve[7].rate; // 3Y rate
            durationEffect = -(pos.riskFactors.duration || 0) * rateShock * baseRate;
          } else if (pos.asset.includes('5Y')) {
            // Use 5Y rate from curve (0.033201)
            const baseRate = MARKET_DATA.rates.curve[8].rate; // 5Y rate
            durationEffect = -(pos.riskFactors.duration || 0) * rateShock * baseRate;
          }
          
          shockedPrice = pos.price * (1 + durationEffect + convexityEffect);
          break;
          
        case 'volatility':
          // Use real volatility surface data for vol scenarios
          const volShock = shock;
          let vegaEffect = (pos.riskFactors.vega || 0) * volShock * 0.01; // 1% vol change
          
          if (pos.asset.includes('TSM UN')) {
            // Use ATM volatility from Murex vol surface
            const atmVol = 41.13; // ATM vol approximation
            vegaEffect = (pos.riskFactors.vega || 0) * volShock * (atmVol / 100);
          }
          
          shockedPrice = pos.price * (1 + vegaEffect);
          break;
          
        case 'credit':
          // Credit shocks affect bond-like instruments using curve data
          const creditShock = shock;
          const creditDuration = pos.riskFactors.duration || 2.0;
          // Apply credit spread using discount curve as proxy
          const creditSpread = creditShock * MARKET_DATA.rates.curve[6].rate; // Use 1Y rate as base
          shockedPrice = pos.price * (1 - creditDuration * creditSpread);
          break;
          
        case 'stress-test':
          // Multi-factor stress test using Murex data
          const stressShock = shock;
          let stressDelta = (pos.riskFactors.delta || 1.0) * stressShock;
          let stressDuration = -(pos.riskFactors.duration || 0) * stressShock * 0.1;
          let stressVega = (pos.riskFactors.vega || 0) * Math.abs(stressShock) * 0.05;
          
          // TSM UN specific stress test
          if (pos.asset.includes('TSM UN')) {
            const basePrice = pos.price; // Use actual position price
            stressDelta = (pos.riskFactors.delta || 1.0) * stressShock;
            // Add vol surface impact
            const stressVolImpact = (pos.riskFactors.vega || 0) * Math.abs(stressShock) * 0.3; // 30% vol increase
            shockedPrice = basePrice * (1 + stressDelta + stressVolImpact);
          } else {
            shockedPrice = pos.price * (1 + stressDelta + stressDuration + stressVega);
          }
          break;
          
        case 'monte-carlo':
          // Monte Carlo using Murex parameters
          const mcShock = shock + (Math.random() - 0.5) * 0.02;
          // Use Murex numPaths for simulation quality
          const mcQuality = Math.log(MARKET_DATA.monteCarlo.numPaths) / Math.log(1000); // Normalize
          const adjustedShock = mcShock * mcQuality;
          shockedPrice = pos.price * (1 + adjustedShock);
          break;
          
        default:
          shockedPrice = pos.price * (1 + shock);
        }
      }
      
      // Add time decay for options
      if (pos.instrumentType === 'option') {
        const thetaDecay = (pos.riskFactors.theta || 0) * 0.01; // Daily decay
        shockedPrice = shockedPrice + thetaDecay;
      }
      
      const impact = (shockedPrice - pos.price) * pos.quantity;
      
      // Determine the original price (edited price if available, otherwise position price)
      const originalPrice = (editedData && editedData.asset === pos.asset && editedData.marketData) 
        ? editedData.marketData.spot || pos.price 
        : pos.price;

      return {
        asset: pos.asset,
        quantity: pos.quantity,
        shock: shockValue,
        impact,
        originalPrice: originalPrice,
        newPrice: shockedPrice,
        originalValue: originalPrice * pos.quantity,
        shockedValue: shockedPrice * pos.quantity,
        isEditedData: !!(editedData && editedData.asset === pos.asset && editedData.marketData),
        editedPrice: (editedData && editedData.asset === pos.asset && editedData.marketData) ? editedData.marketData.spot : null,
        riskMetrics: {
          delta: riskMetrics.delta || 0,
          gamma: riskMetrics.gamma || 0,
          duration: riskMetrics.duration || 0,
          convexity: riskMetrics.convexity || 0,
          vega: riskMetrics.vega || 0,
          theta: riskMetrics.theta || 0
        }
      };
    });
    
    console.log('Enhanced simulation results with Murex data:', calc);
    setResults(calc);
    
    // Record scenario execution in history
    let scenarioName = selectedScenario.name === "Custom" ? customScenarioName : selectedScenario.name;
    
    // If we have edited data, combine manual scenario name with the scenario performed
    if (editedData && editedData.scenarioName) {
      const scenarioType = selectedScenario.category || 'equity';
      const shockPercent = selectedScenario.name === "Custom" ? customShock : (selectedScenario.shock * 100);
      const shockSign = shockPercent >= 0 ? '+' : '';
      scenarioName = `${editedData.scenarioName}_${scenarioType}_${shockSign}${shockPercent}%`;
    }
    
    const shockValue = selectedScenario.name === "Custom" ? customShock / 100 : selectedScenario.shock;
    
    const scenarioRecord = {
      id: `scenario-${Date.now()}`,
      timestamp: new Date().toISOString(),
      scenarioName: scenarioName || 'Unnamed Scenario',
      scenarioType: selectedScenario.category || 'custom',
      scenarioScope: scenarioScope,
      shockValue: shockValue,
      assetsAnalyzed: scenarioScope === 'portfolio' ? positions.length : 1,
      selectedAsset: scenarioScope === 'single' ? selectedAsset?.asset : null,
      results: calc,
      totalImpact: calc.reduce((sum, result) => sum + result.impact, 0),
      maxLoss: Math.min(...calc.map(result => result.impact)),
      userAgent: navigator.userAgent,
      sessionId: `session-${Date.now()}`,
      metadata: {
        usesEditedData: !!editedData,
        editedDataAsset: editedData?.asset,
        editedDataTimestamp: editedData?.timestamp,
        editedDataScenarioName: editedData?.scenarioName,
        editedPrice: editedData?.marketData?.spot,
        originalScenarioName: selectedScenario.name,
        combinedScenarioName: scenarioName
      }
    };
    
    setScenarioHistory(prev => [scenarioRecord, ...prev.slice(0, 99)]); // Keep last 100 records
    
    // Switch to risk metrics tab
    const riskTab = document.querySelector('[data-node-key="risk"]') as HTMLElement;
    if (riskTab) riskTab.click();
  };

  const addPosition = () => {
    form.validateFields().then((values) => {
      // Create risk factors based on instrument type
      let riskFactors = {};
      switch (values.instrumentType) {
        case 'equity':
          riskFactors = { delta: 1.0, gamma: 0.0, duration: 0.0, convexity: 0.0, vega: 0.0, theta: 0.0 };
          break;
        case 'bond':
          riskFactors = { delta: 0.0, gamma: 0.0, duration: values.duration || 4.0, convexity: values.convexity || 20.0, vega: 0.0, theta: 0.0 };
          break;
        case 'option':
          riskFactors = { 
            delta: values.delta || 0.5, 
            gamma: values.gamma || 0.1, 
            duration: 0.0, 
            convexity: 0.0, 
            vega: values.vega || 10.0, 
            theta: values.theta || -0.02 
          };
          break;
        case 'swap':
          riskFactors = { delta: 0.0, gamma: 0.0, duration: values.duration || 3.0, convexity: values.convexity || 15.0, vega: 0.0, theta: 0.0 };
          break;
        case 'fx-forward':
          riskFactors = { delta: 1.0, gamma: 0.0, duration: values.duration || 0.5, convexity: 0.0, vega: 0.0, theta: 0.0 };
          break;
        default:
          riskFactors = { delta: 1.0, gamma: 0.0, duration: 0.0, convexity: 0.0, vega: 0.0, theta: 0.0 };
      }

      const newPos: Position = {
        key: String(Date.now()),
        asset: values.asset,
        quantity: values.quantity,
        price: values.price,
        instrumentType: values.instrumentType || 'equity',
        riskFactors
      };
      setPositions([...positions, newPos]);
      setIsModalOpen(false);
      form.resetFields();
    });
  };


  // Manual scenario editing functions


  const updateVolatilityData = (strikeIndex: number, maturityIndex: number, value: number) => {
    if (!selectedAssetData) return;
    
    // Update the selectedAssetData directly for real-time editing
    const updatedAssetData = { ...selectedAssetData };
    updatedAssetData.volatility.volMatrix[maturityIndex][strikeIndex] = value;
    setSelectedAssetData(updatedAssetData);
    
    // Set market data changes to enable "Go to Scenarios" button
    setHasMarketDataChanges(true);
    console.log('Volatility data updated, hasMarketDataChanges set to true');
    
    // Save edited volatility data to session storage
    const editedData = {
      asset: selectedAsset?.asset,
      marketData: updatedAssetData.marketData,
      volatility: updatedAssetData.volatility,
      timestamp: new Date().toISOString(),
      scenarioName: scenarioName
    };
    
    sessionStorage.setItem('editedMarketData', JSON.stringify(editedData));
    console.log('Edited volatility data saved to session storage:', editedData);
  };

  const updateInterestRateData = (currency: string, rateIndex: number, value: number) => {
    if (!selectedAssetData) return;
    
    const updatedAssetData = { ...selectedAssetData };
    const rateData = updatedAssetData.interestRates.find((r: any) => r.currency === currency);
    if (rateData) {
      rateData.curve[rateIndex].rate = value;
      setSelectedAssetData(updatedAssetData);
      
      // Set market data changes to enable "Go to Scenarios" button
      setHasMarketDataChanges(true);
      console.log('Interest rate data updated, hasMarketDataChanges set to true');
      
      // Save edited interest rate data to session storage
      const editedData = {
        asset: selectedAsset?.asset,
        marketData: updatedAssetData.marketData,
        interestRates: updatedAssetData.interestRates,
        timestamp: new Date().toISOString(),
        scenarioName: scenarioName
      };
      
      sessionStorage.setItem('editedMarketData', JSON.stringify(editedData));
      console.log('Edited interest rate data saved to session storage:', editedData);
    }
  };

  const updateCorrelationDataInModal = (pairIndex: number, value: number) => {
    if (!selectedAssetData) return;
    
    const updatedAssetData = { ...selectedAssetData };
    if (updatedAssetData.correlation && updatedAssetData.correlation[pairIndex]) {
      updatedAssetData.correlation[pairIndex].correlation = value;
      setSelectedAssetData(updatedAssetData);
    }
  };




  const getAssetMarketData = (asset: string, position: Position) => {
    const baseData = {
      asset,
      instrumentName: getInstrumentName(asset),
      position,
      timestamp: new Date().toISOString(),
      source: "Murex Payload Integration"
    };

    // Helper function to get instrument name based on asset
    function getInstrumentName(asset: string): string {
      if (asset.includes('TSM UN')) {
        return 'Taiwan Semiconductor Manufacturing Company Ltd';
      } else if (asset.includes('AAPL UW')) {
        return 'Apple Inc';
      } else if (asset.includes('BABA UN')) {
        return 'Alibaba Group Holding Limited';
      } else if (asset.includes('Bond')) {
        return 'USD Treasury Bond';
      } else if (asset.includes('Swap')) {
        return 'USD Interest Rate Swap';
      } else if (asset.includes('Option')) {
        return 'Equity Call Option';
      }
      return 'Unknown Instrument';
    }

    if (asset.includes('BABA') && !asset.includes('Options')) {
      const volData = MARKET_DATA.volatility.baba;
      return {
        ...baseData,
        type: "Equity",
        marketData: {
          symbol: MARKET_DATA.baba.symbol,
          spot: MARKET_DATA.baba.spot,
          bid: MARKET_DATA.baba.bid,
          ask: MARKET_DATA.baba.ask,
          dealSpot: MARKET_DATA.baba.dealSpot,
          currency: MARKET_DATA.baba.currency,
          notional: MARKET_DATA.baba.notional,
          spread: (MARKET_DATA.baba.ask - MARKET_DATA.baba.bid).toFixed(4)
        },
        volatility: volData ? {
          strikes: volData.strikes, // Show all strikes
          maturities: volData.maturities,
          atmVol: "$" + volData.volMatrix[2][10].toFixed(2), // ATM vol in dollars
          surfaceSize: `${volData.strikes.length} strikes × ${volData.maturities.length} maturities`,
          volMatrix: volData.volMatrix
        } : null,
        correlation: {
          symbol: MARKET_DATA.baba.symbol,
          correlation: 1.0 // Self-correlation
        },
        interestRates: MARKET_DATA.rates,
        fx: [],
        monteCarlo: MARKET_DATA.monteCarlo
      };
    } else if (asset.includes('700 HK') && !asset.includes('Options')) {
      const volData = MARKET_DATA.volatility.hk700;
      return {
        ...baseData,
        type: "Equity",
        marketData: {
          symbol: MARKET_DATA.hk700.symbol,
          spot: MARKET_DATA.hk700.spot,
          bid: MARKET_DATA.hk700.bid,
          ask: MARKET_DATA.hk700.ask,
          dealSpot: MARKET_DATA.hk700.dealSpot,
          currency: MARKET_DATA.hk700.currency,
          notional: MARKET_DATA.hk700.notional,
          spread: (MARKET_DATA.hk700.ask - MARKET_DATA.hk700.bid).toFixed(4)
        },
        volatility: volData ? {
          strikes: volData.strikes, // Show all strikes
          maturities: volData.maturities,
          atmVol: "$" + volData.volMatrix[2][10].toFixed(2), // ATM vol in dollars
          surfaceSize: `${volData.strikes.length} strikes × ${volData.maturities.length} maturities`,
          volMatrix: volData.volMatrix
        } : null,
        correlation: {
          symbol: MARKET_DATA.hk700.symbol,
          correlation: 1.0 // Self-correlation
        },
        interestRates: MARKET_DATA.hkdRates,
        fx: [],
        monteCarlo: MARKET_DATA.monteCarlo
      };
    } else if (asset.includes('Bond') || asset.includes('Swap')) {
      const isHKD = asset.includes('HKD');
      const is3Y = asset.includes('3Y');
      const is2Y = asset.includes('2Y');
      
      const curve = isHKD ? MARKET_DATA.hkdRates : MARKET_DATA.rates;
      const curvePoint = is3Y ? 
        curve.curve.find(p => p.tenor === "3Y") : 
        is2Y ? curve.curve.find(p => p.tenor === "2Y") : 
        curve.curve[0];
      
      return {
        ...baseData,
        type: "Bond",
        marketData: {
          tenor: is3Y ? "3Y" : is2Y ? "2Y" : "1Y",
          rate: curvePoint ? (curvePoint.rate * 100).toFixed(3) + "%" : "N/A",
          date: curvePoint ? curvePoint.date : "N/A",
          currency: curve.currency,
          duration: position.riskFactors.duration,
          convexity: position.riskFactors.convexity
        },
        interestRates: curve,
        yieldCurve: {
          points: curve.curve.length,
          range: `${(curve.curve[0].rate * 100).toFixed(2)}% - ${(curve.curve[curve.curve.length-1].rate * 100).toFixed(2)}%`,
          currency: curve.currency
        },
        volatility: {
          strikes: [],
          maturities: [],
          volMatrix: [],
          atmVol: "N/A",
          surfaceSize: "N/A"
        },
        correlation: {
          symbol: `${curve.currency} Rates`,
          correlation: 1.0
        },
        fx: [],
        monteCarlo: MARKET_DATA.monteCarlo
      };
    } else if (asset.includes('Option')) {
      // Determine which vol surface to use based on underlying
      let volData: any, underlyingData: any;
      if (asset.includes('BABA')) {
        volData = MARKET_DATA.volatility.baba;
        underlyingData = MARKET_DATA.baba;
      } else if (asset.includes('700 HK')) {
        volData = MARKET_DATA.volatility.hk700;
        underlyingData = MARKET_DATA.hk700;
      } else {
        // Default fallback for unknown assets
        volData = null;
        underlyingData = { symbol: "Unknown", spot: 100 };
      }
      
      return {
        ...baseData,
        type: "Option",
        marketData: {
          underlying: underlyingData.symbol,
          underlyingPrice: underlyingData.spot,
          optionType: "Call",
          strike: "ATM",
          delta: position.riskFactors.delta,
          gamma: position.riskFactors.gamma,
          vega: position.riskFactors.vega,
          theta: position.riskFactors.theta
        },
        volatility: {
          strikes: volData.strikes, // Show all strikes
          maturities: volData.maturities,
          atmVol: "$" + volData.volMatrix[2][10].toFixed(2),
          surfaceSize: `${volData.strikes.length} strikes × ${volData.maturities.length} maturities`,
          volMatrix: volData.volMatrix
        },
        correlation: {
          symbol: underlyingData.symbol,
          correlation: 1.0
        },
        interestRates: MARKET_DATA.rates,
        fx: [],
        monteCarlo: MARKET_DATA.monteCarlo
      };
    }

    return {
      ...baseData,
      type: "Generic",
      marketData: {
        note: "Standard market data not available for this asset type"
      }
    };
  };

  const handleAssetClick = (position: Position) => {
    const marketData = getAssetMarketData(position.asset, position);
    setSelectedAssetData(marketData);
    initializeMarketData(marketData);
    setIsDataModalOpen(true);
  };

  // Double-click editing functions


  // Mode switching functions
  const enterEditMode = () => {
    setIsEditMode(true);
    setIsMarketDataModalEditable(true);
  };

  const exitEditMode = () => {
    setIsEditMode(false);
    setIsMarketDataModalEditable(false);
    setScenarioName("");
    setHasMarketDataChanges(false);
    
    // Clear edited data from session storage
    sessionStorage.removeItem('editedMarketData');
    console.log('Cleared edited market data from session storage');
    
    // Reset to original data if needed
    if (selectedAsset) {
      setSelectedAssetData(getAssetMarketData(selectedAsset.asset, selectedAsset));
    }
  };

  // Market data editing function
  const updateEquityMarketData = (field: string, value: any) => {
    if (!selectedAssetData) return;
    
    console.log('updateEquityMarketData called:', { field, value, hasMarketDataChanges });
    
    const updatedAssetData = { ...selectedAssetData };
    if (updatedAssetData.marketData) {
      updatedAssetData.marketData[field] = value;
      
      // Auto-calculate spread when bid or ask is updated
      if (field === 'bid' || field === 'ask') {
        const bid = field === 'bid' ? value : updatedAssetData.marketData.bid;
        const ask = field === 'ask' ? value : updatedAssetData.marketData.ask;
        if (bid && ask) {
          updatedAssetData.marketData.spread = ask - bid;
        }
      }
      
      setSelectedAssetData(updatedAssetData);
      setHasMarketDataChanges(true);
      
      // Save edited market data to session storage
      const editedData = {
        asset: selectedAsset?.asset,
        marketData: updatedAssetData.marketData,
        timestamp: new Date().toISOString(),
        scenarioName: scenarioName
      };
      
      sessionStorage.setItem('editedMarketData', JSON.stringify(editedData));
      console.log('Edited market data saved to session storage:', editedData);
    }
  };




  // Initialize market data when modal opens
  const initializeMarketData = (assetData: any) => {
    if (!assetData) {
      console.log('No asset data provided to initializeMarketData');
      return;
    }

    console.log('Initializing market data for:', assetData);
    console.log('Market data structure:', assetData.marketData);
    console.log('Position data:', assetData.position);

    // Initialize equity data with proper fallbacks
    const equityData = [
      { 
        key: 'spot', 
        field: 'Spot Price', 
        value: assetData.marketData?.spot || assetData.position?.price || 0, 
        prefix: '$', 
        editable: true 
      },
      { 
        key: 'bid', 
        field: 'Bid', 
        value: assetData.marketData?.bid || (assetData.marketData?.spot ? assetData.marketData.spot * 0.999 : 0), 
        prefix: '$', 
        editable: true 
      },
      { 
        key: 'ask', 
        field: 'Ask', 
        value: assetData.marketData?.ask || (assetData.marketData?.spot ? assetData.marketData.spot * 1.001 : 0), 
        prefix: '$', 
        editable: true 
      },
      { 
        key: 'spread', 
        field: 'Spread', 
        value: assetData.marketData?.spread || 0, 
        prefix: '$', 
        editable: false 
      },
      { 
        key: 'dealSpot', 
        field: 'Deal Spot', 
        value: assetData.marketData?.dealSpot || assetData.marketData?.spot || assetData.position?.price || 0, 
        prefix: '$', 
        editable: true 
      },
      { 
        key: 'notional', 
        field: 'Notional', 
        value: assetData.marketData?.notional || (assetData.position?.quantity * assetData.position?.price) || 0, 
        prefix: '$', 
        editable: true, 
        format: 'number' 
      }
    ];
    
    console.log('Equity data initialized:', equityData);
  };

  // Extract lifecycle data from Murex payload
  const extractLifecycleData = (dealIndex: number = 0) => {
    try {
      const job = murexPayload.Chunk.Jobs[dealIndex];
    
      if (!job || !job.commonData) {
        return null;
      }

      const dealData: any = job.commonData;
    
    // Extract fixing information
    const fixingInfo = {
      lifeCycleDate: dealData.fixing?.lifeCycleDate || "2025-01-20",
      lastFixingDate: dealData.fixing?.lastFixingDate || "2025-01-15",
      nextFixingDate: dealData.fixing?.nextFixingDate || "2025-01-25"
    };

    // Extract KO/KI information
    const knockOutLifecycle = {
      endDate: dealData.RGACCLKO?.endDate || ["2025-02-20", "2025-05-20", "2025-08-20", "2025-11-20"],
      paymentDate: dealData.RGACCLKO?.paymentDate || ["2025-02-25", "2025-05-25", "2025-08-25", "2025-11-25"],
      locBarPrice: dealData.RGACCLKO?.locBarPrice || [0.9, 0.85, 0.8, 0.75],
      locKOCpn: dealData.RGACCLKO?.locKOCpn || [2.5, 2.5, 2.5, 2.5],
      KO_Prob: dealData.RGACCLKO?.KO_Prob || [0.15, 0.25, 0.35, 0.45],
      globalKOStar: dealData.RGACCLKO?.globalKOStar || false
    };

    const knockInLifecycle = {
      KIBarrier: dealData.knockInStar?.lowCallStrik || 0.6,
      strikeKI1: dealData.knockInStar?.strikeKI1 || 0.65,
      strikeKI2: dealData.knockInStar?.strikeKI2 || 0.55,
      paymentDate: dealData.RGACCLKI?.paymentDate || ["2025-12-20"],
      knockIn: dealData.RGACCLKI?.knockIn || [false, false, false, false]
    };

    // Extract accrual information
    const accrualSchedule = {
      accruRate: dealData.RGACCLKO?.accruRate || [0.025, 0.025, 0.025, 0.025],
      fixCoupon: dealData.RGACCLKO?.fixCoupon || [2.5, 2.5, 2.5, 2.5],
      paymentDate: dealData.RGACCLKO?.paymentDate || ["2025-02-25", "2025-05-25", "2025-08-25", "2025-11-25"],
      fixingDone: dealData.RGACCLKO?.fixingDone || [false, false, false, false]
    };

    // Extract instrument state
    const instrumentState = {
      status: dealData.status || "LIVE",
      alreadyKnockIn: dealData.alreadyKnockIn || false,
      notional: dealData.notional || 1000000,
      paymentCurrency: dealData.paymentCurrency || "USD"
    };

    // Extract underlying instrument info
    const underlyingInstrument = {
      underlyings: dealData.addInfo?.underlyings || ["BABA UN", "700 HK"],
      referencePrice: dealData.addInfo?.referencePrice || [162.94, 637.25],
      market: dealData.addInfo?.market || "HKEX",
      calendar: dealData.addInfo?.calendar || "HK",
      currency: dealData.addInfo?.currency || "USD"
    };

      return {
        fixingInfo,
        knockOutLifecycle,
        knockInLifecycle,
        accrualSchedule,
        instrumentState,
        underlyingInstrument
      };
    } catch (error) {
      console.error('Error extracting lifecycle data:', error);
      return null;
    }
  };

  // Backtesting functions
  const runBacktest = async () => {
    const scenario = useCustomScenario ? {
      id: 'custom-scenario',
      name: customScenarioName,
      startDate: customStartDate,
      endDate: customEndDate,
      period: 'Daily',
      marketConditions: customMarketConditions
    } : selectedBacktestScenario;
    
    if (!scenario) {
      console.error('No backtest scenario selected');
      return;
    }

    setIsBacktestRunning(true);
    setBacktestProgress(0);
    
    try {
      // Simulate backtesting process with progress updates
      
      // Simulate fetching historical data
      setBacktestProgress(20);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate aligning lifecycle state
      setBacktestProgress(40);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate revaluing portfolio for each date
      setBacktestProgress(60);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate computing metrics
      setBacktestProgress(80);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate mock backtest results
      const mockResults = generateMockBacktestResults(scenario);
      setBacktestResults(mockResults);
      
      // Record backtesting scenario execution in history
      const backtestRecord = {
        id: `backtest-${Date.now()}`,
        timestamp: new Date().toISOString(),
        scenarioName: scenario.name,
        scenarioType: 'backtesting',
        scenarioScope: 'portfolio',
        shockValue: null, // Backtesting doesn't use shock values
        assetsAnalyzed: positions.length,
        selectedAsset: null,
        results: mockResults,
        totalImpact: mockResults.reduce((sum, result) => sum + (result.pnl || 0), 0),
        maxLoss: Math.min(...mockResults.map(result => result.pnl || 0)),
        userAgent: navigator.userAgent,
        sessionId: `session-${Date.now()}`,
        // Backtesting-specific metadata
        backtestMetadata: {
          startDate: scenario.startDate,
          endDate: scenario.endDate,
          period: scenario.period || 'Daily',
          marketConditions: scenario.marketConditions,
          isCustomScenario: useCustomScenario,
          customConditions: useCustomScenario ? customMarketConditions : null,
          selectedDeal: availableDeals[selectedDealIndex]?.name || null,
          lifecycleData: availableDeals[selectedDealIndex] ? extractLifecycleData(availableDeals[selectedDealIndex].data) : null
        }
      };
      
      setScenarioHistory(prev => [backtestRecord, ...prev.slice(0, 99)]); // Keep last 100 records
      
      setBacktestProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error('Backtest failed:', error);
    } finally {
      setIsBacktestRunning(false);
      setBacktestProgress(0);
    }
  };

  const generateMockBacktestResults = (scenario: any) => {
    const { startDate, endDate, marketConditions } = scenario;
    const results: any[] = [];
    
    // Generate daily results for the backtest period
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i <= daysDiff; i++) {
      const currentDate = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      const progress = i / daysDiff;
      
      // Simulate market conditions impact
      const equityImpact = marketConditions.equityDecline * progress;
      const volImpact = marketConditions.volatilitySpike * progress;
      
      // Simulate portfolio PnL
      const basePnL = -100000; // Starting loss
      const dailyPnL = basePnL + (equityImpact * 1000) + (Math.random() - 0.5) * 50000;
      
      // Simulate lifecycle events
      const koTriggered = progress > 0.3 && Math.random() < 0.1;
      const kiTriggered = progress > 0.5 && Math.random() < 0.05;
      
      results.push({
        date: currentDate.toISOString().split('T')[0],
        portfolioValue: 1000000 + dailyPnL,
        dailyPnL: dailyPnL,
        cumulativePnL: results.reduce((sum, r) => sum + r.dailyPnL, dailyPnL),
        koTriggered,
        kiTriggered,
        marketConditions: {
          equityDecline: equityImpact,
          volatilitySpike: volImpact,
          rateCuts: marketConditions.rateCuts * progress,
          creditWidening: marketConditions.creditWidening * progress
        }
      });
    }
    
    return results;
  };

  const getBacktestSummary = () => {
    if (backtestResults.length === 0) return null;
    
    const totalPnL = backtestResults[backtestResults.length - 1]?.cumulativePnL || 0;
    const maxLoss = Math.min(...backtestResults.map(r => r.cumulativePnL));
    const maxGain = Math.max(...backtestResults.map(r => r.cumulativePnL));
    const koEvents = backtestResults.filter(r => r.koTriggered).length;
    const kiEvents = backtestResults.filter(r => r.kiTriggered).length;
    
    return {
      totalPnL,
      maxLoss,
      maxGain,
      koEvents,
      kiEvents,
      totalDays: backtestResults.length
    };
  };

  const totalImpact = results.reduce((sum, r) => sum + r.impact, 0);
  const totalValue = positions.reduce((sum, pos) => sum + (pos.price * pos.quantity), 0);
  
  // Calculate risk metrics
  const impactPercentage = totalValue > 0 ? (totalImpact / totalValue) * 100 : 0;
  const maxLoss = Math.min(...results.map(r => r.impact), 0);
  
  // Calculate VaR (simplified - 95% confidence)
  const sortedImpacts = results.map(r => r.impact).sort((a, b) => a - b);
  const var95 = sortedImpacts[Math.floor(sortedImpacts.length * 0.05)] || 0;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'equity': return '#1890ff';
      case 'rates': return '#52c41a';
      case 'fx': return '#faad14';
      case 'volatility': return '#722ed1';
      case 'credit': return '#f5222d';
      case 'stress-test': return '#ff4d4f';
      default: return '#666';
    }
  };

  // Table columns
  const positionColumns = [
    { 
      title: "Asset", 
      dataIndex: "asset", 
      key: "asset",
      render: (text: string, record: Position) => (
        <Button 
          type="link" 
          style={{ 
            padding: 0, 
            height: 'auto', 
            fontWeight: 'bold',
            color: 'var(--primary)'
          }}
          onClick={() => handleAssetClick(record)}
        >
          {text} 🔍
        </Button>
      )
    },
    { 
      title: "Type", 
      dataIndex: "instrumentType", 
      key: "type",
      render: (type: string) => <Tag color="blue">{type.toUpperCase()}</Tag>
    },
    { 
      title: "Quantity", 
      dataIndex: "quantity", 
      key: "quantity",
      render: (value: number) => value.toLocaleString()
    },
    { 
      title: "Price ($)", 
      dataIndex: "price", 
      key: "price",
      render: (value: number) => `$${value.toFixed(2)}`
    },
    { 
      title: "Value ($)", 
      key: "value",
      render: (_: any, record: Position) => `$${(record.price * record.quantity).toLocaleString()}`
    }
  ];

  const resultColumns = [
    { 
      title: "Asset", 
      dataIndex: "asset", 
      key: "asset",
      render: (text: string) => <strong>{text}</strong>
    },
    { 
      title: "Original Value", 
      dataIndex: "originalValue", 
      key: "originalValue",
      render: (value: number) => `$${value.toLocaleString()}`
    },
    {
      title: "Shocked Value",
      dataIndex: "shockedValue", 
      key: "shockedValue",
      render: (value: number) => `$${value.toLocaleString()}`
    },
    {
      title: "PnL ($)",
      dataIndex: "impact",
      key: "impact",
      render: (value: number) => (
        <span style={{ 
          color: value >= 0 ? 'var(--success)' : 'var(--error)',
          fontWeight: 'bold'
        }}>
          {value >= 0 ? '+' : ''}{value.toLocaleString()}
        </span>
      )
    }
  ];

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>

      {/* Murex Data Integration Info
        <Alert
          message="📊 Market Data Portfolio Report"
          description={
            <div>
              <strong>Portfolio Assets:</strong> BABA UN | 700 HK | USD 3Y Bond | HKD 2Y Bond | 
              <strong> Market Data:</strong> Spot: ${MARKET_DATA.baba.spot} / {MARKET_DATA.hk700.spot} | 
              <strong> Yield Curves:</strong> USD ({MARKET_DATA.rates.curve.length} tenors) | HKD ({MARKET_DATA.hkdRates.curve.length} tenors) | 
              <strong> Vol Surfaces:</strong> BABA ({MARKET_DATA.volatility.baba.strikes.length}×{MARKET_DATA.volatility.baba.maturities.length}) | 700 HK ({MARKET_DATA.volatility.hk700.strikes.length}×{MARKET_DATA.volatility.hk700.maturities.length}) | 
              <strong> MC Paths:</strong> {MARKET_DATA.monteCarlo.numPaths.toLocaleString()}
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: "24px" }}
        /> */}


      {/* Portfolio Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Portfolio Value"
              value={totalValue}
              prefix={<DollarOutlined />}
              formatter={(value) => `$${Number(value).toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Number of Positions"
              value={positions.length}
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Impact"
              value={totalImpact}
              prefix={totalImpact >= 0 ? <RiseOutlined /> : <FallOutlined />}
              valueStyle={{ color: totalImpact >= 0 ? 'var(--success)' : 'var(--error)' }}
              formatter={(value) => `$${Number(value).toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="VaR (95%)"
              value={var95}
              valueStyle={{ color: 'var(--error)' }}
              formatter={(value) => `$${Number(value).toLocaleString()}`}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Tabs defaultActiveKey="portfolio" size="large">
        <TabPane 
          tab={
            <Space>
              <span>💼 Portfolio</span>
              {selectedAsset && (
                <Badge 
                  count="1" 
                  style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                  title={`Selected: ${selectedAsset.asset}`}
                />
              )}
            </Space>
          } 
          key="portfolio"
        >
          <Card 
            title="Portfolio Positions with Risk Factors" 
            extra={
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => setIsModalOpen(true)}
              >
                Add Position
              </Button>
            }
          >
            
            <Table
              dataSource={positions}
              columns={positionColumns}
              pagination={false}
              bordered
              size="middle"
              rowSelection={{
                type: 'radio',
                selectedRowKeys: selectedAsset ? [selectedAsset.key] : [],
                onChange: (_, selectedRows) => {
                  if (selectedRows.length > 0) {
                    setSelectedAsset(selectedRows[0]);
                  } else {
                    setSelectedAsset(null);
                  }
                },
                onSelect: (record) => {
                  setSelectedAsset(record);
                }
              }}
              rowKey="key"
            />
            
            {selectedAsset && (
              <Alert
                message={`Selected Asset: ${selectedAsset.asset}`}
                description={
                  <div>
                    <strong>Type:</strong> {selectedAsset.instrumentType.toUpperCase()} | 
                    <strong> Quantity:</strong> {selectedAsset.quantity.toLocaleString()} | 
                    <strong> Price:</strong> ${selectedAsset.price.toFixed(2)} | 
                    <strong> Value:</strong> ${(selectedAsset.price * selectedAsset.quantity).toLocaleString()}
                    <br />
                    <Tag color="darkgreen" style={{ marginTop: '8px' }}>
                      ✅ Ready for scenario analysis - Go to Scenarios tab to run simulations
                    </Tag>
                  </div>
                }
                type="info"
                showIcon
                style={{ marginTop: "16px" }}
                action={
                  <Space>
                    <Button 
                      type="primary"
                      size="small" 
                      icon={<BarChartOutlined />}
                      onClick={() => {
                        // Switch to scenarios tab
                        const scenariosTab = document.querySelector('[data-node-key="scenarios"]') as HTMLElement;
                        if (scenariosTab) scenariosTab.click();
                      }}
                    >
                      Go to Scenarios
                    </Button>
                    <Button 
                      size="small" 
                      onClick={() => setSelectedAsset(null)}
                    >
                      Clear Selection
                    </Button>
                  </Space>
                }
              />
            )}
          </Card>
        </TabPane>

        <TabPane 
          tab={
            <Space>
              <span>📈 Scenarios</span>
              {selectedAsset && (
                <Badge 
                  count="✓" 
                  style={{ backgroundColor: 'var(--success)', color: 'white' }}
                  title={`Selected: ${selectedAsset.asset}`}
                />
              )}
            </Space>
          } 
          key="scenarios"
        >
          {selectedAsset ? (
            <>
              {/* Selected Asset Information */}
              <Card 
                title={
                  <Space>
                    <span>📊 Scenario Analysis for</span>
                    <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                      {selectedAsset.asset}
                    </Tag>
                  </Space>
                }
                style={{ marginBottom: "24px" }}
                extra={
                  <Space>
                    <Button 
                      type="text" 
                      onClick={() => setSelectedAsset(null)}
                      icon={<FallOutlined />}
                    >
                      Change Asset
                    </Button>
                  </Space>
                }
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={6}>
                    <Statistic
                      title="Asset Type"
                      value={selectedAsset.instrumentType.toUpperCase()}
                      valueStyle={{ color: 'var(--primary)' }}
                    />
                  </Col>
                  <Col xs={24} sm={6}>
                    <Statistic
                      title="Position Size"
                      value={selectedAsset.quantity}
                      formatter={(value) => value.toLocaleString()}
                    />
                  </Col>
                  <Col xs={24} sm={6}>
                    <Statistic
                      title="Current Price"
                      value={selectedAsset.price}
                      formatter={(value) => `$${Number(value).toFixed(2)}`}
                    />
                  </Col>
                  <Col xs={24} sm={6}>
                    <Statistic
                      title="Total Value"
                      value={selectedAsset.price * selectedAsset.quantity}
                      formatter={(value) => `$${value.toLocaleString()}`}
                      valueStyle={{ color: 'var(--success)' }}
                    />
                  </Col>
                </Row>
              </Card>

              {/* Scenario Configuration */}
              <Card title="Enhanced Scenario Configuration" style={{ marginBottom: "24px" }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={12}>
                <Select
                  value={selectedScenario.id}
                  style={{ 
                    width: "100%",
                    minHeight: "auto"
                  }}
                  onChange={(value) => {
                    const scenario = ALL_SCENARIOS.find(s => s.id === value);
                    if (scenario) setSelectedScenario(scenario);
                  }}
                  size="large"
                  placeholder="Select Enhanced Scenario"
                  dropdownStyle={{
                    maxHeight: "400px",
                    overflowY: "auto"
                  }}
                  optionLabelProp="label"
                >
                  <Select.OptGroup label="📈 Standard Scenarios - Quick Market Shock Analysis">
                    {STANDARD_SCENARIOS.map((scenario) => (
                      <Select.Option 
                        key={scenario.id} 
                        value={scenario.id}
                        label={
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            flexWrap: 'wrap',
                            minWidth: 0,
                            width: '100%'
                          }}>
                            {scenario.icon}
                            <strong style={{ flex: '1 1 auto', minWidth: 0 }}>{scenario.name}</strong>
                            <Tag color={getCategoryColor(scenario.category)} style={{ flex: '0 0 auto' }}>{scenario.category.toUpperCase()}</Tag>
                          </div>
                        }
                      >
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          flexWrap: 'wrap',
                          minWidth: 0,
                          width: '100%'
                        }}>
                          {scenario.icon}
                          <strong style={{ flex: '1 1 auto', minWidth: 0 }}>{scenario.name}</strong>
                          <Tag color={getCategoryColor(scenario.category)} style={{ flex: '0 0 auto' }}>{scenario.category.toUpperCase()}</Tag>
                        </div>
                        <div style={{ 
                          fontSize: "12px", 
                          color: "var(--text-secondary)",
                          marginTop: '4px',
                          wordBreak: 'break-word',
                          lineHeight: '1.3'
                        }}>{scenario.description}</div>
                      </Select.Option>
                    ))}
                  </Select.OptGroup>
                  
                  <Select.OptGroup label="⚡ Stress Tests - Historical Crisis Simulation">
                    {STRESS_TEST_SCENARIOS.map((scenario) => (
                      <Select.Option 
                        key={scenario.id} 
                        value={scenario.id}
                        label={
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            flexWrap: 'wrap',
                            minWidth: 0,
                            width: '100%'
                          }}>
                            {scenario.icon}
                            <strong style={{ flex: '1 1 auto', minWidth: 0 }}>{scenario.name}</strong>
                            <Tag color={scenario.severity === 'extreme' ? 'red' : 
                                        scenario.severity === 'severe' ? 'orange' : 
                                        scenario.severity === 'moderate' ? 'yellow' : 'green'}
                                 style={{ flex: '0 0 auto' }}>
                              {scenario.severity?.toUpperCase()}
                            </Tag>
                          </div>
                        }
                      >
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          flexWrap: 'wrap',
                          minWidth: 0,
                          width: '100%'
                        }}>
                          {scenario.icon}
                          <strong style={{ flex: '1 1 auto', minWidth: 0 }}>{scenario.name}</strong>
                          <Tag color={scenario.severity === 'extreme' ? 'red' : 
                                      scenario.severity === 'severe' ? 'orange' : 
                                      scenario.severity === 'moderate' ? 'yellow' : 'green'}
                               style={{ flex: '0 0 auto' }}>
                            {scenario.severity?.toUpperCase()}
                          </Tag>
                        </div>
                        <div style={{ 
                          fontSize: "12px", 
                          color: "var(--text-secondary)",
                          marginTop: '4px',
                          wordBreak: 'break-word',
                          lineHeight: '1.3'
                        }}>{scenario.description}</div>
                        {scenario.historicalBasis && (
                          <div style={{ 
                            fontSize: "10px", 
                            color: "var(--text-tertiary)",
                            marginTop: '2px',
                            wordBreak: 'break-word',
                            lineHeight: '1.2'
                          }}>Based on: {scenario.historicalBasis}</div>
                        )}
                      </Select.Option>
                    ))}
                  </Select.OptGroup>
                  
                  <Select.OptGroup label="🎲 Monte Carlo - Statistical Risk Modeling">
                    {MONTE_CARLO_SCENARIOS.map((scenario) => (
                      <Select.Option 
                        key={scenario.id} 
                        value={scenario.id}
                        label={
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            flexWrap: 'wrap',
                            minWidth: 0,
                            width: '100%'
                          }}>
                            {scenario.icon}
                            <strong style={{ flex: '1 1 auto', minWidth: 0 }}>{scenario.name}</strong>
                            <Tag color="purple" style={{ flex: '0 0 auto' }}>MC</Tag>
                          </div>
                        }
                      >
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          flexWrap: 'wrap',
                          minWidth: 0,
                          width: '100%'
                        }}>
                          {scenario.icon}
                          <strong style={{ flex: '1 1 auto', minWidth: 0 }}>{scenario.name}</strong>
                          <Tag color="purple" style={{ flex: '0 0 auto' }}>MC</Tag>
                        </div>
                        <div style={{ 
                          fontSize: "12px", 
                          color: "var(--text-secondary)",
                          marginTop: '4px',
                          wordBreak: 'break-word',
                          lineHeight: '1.3'
                        }}>{scenario.description}</div>
                        <div style={{ 
                          fontSize: "10px", 
                          color: "var(--text-tertiary)",
                          marginTop: '2px',
                          wordBreak: 'break-word',
                          lineHeight: '1.2'
                        }}>
                          {scenario.numSimulations?.toLocaleString()} simulations | {scenario.distributionType} | {((scenario.confidenceLevel || 0) * 100)}% confidence
                        </div>
                      </Select.Option>
                    ))}
                  </Select.OptGroup>
                  
                  <Select.Option 
                    value="custom"
                    label={
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        flexWrap: 'wrap',
                        minWidth: 0,
                        width: '100%'
                      }}>
                        <ExperimentOutlined />
                        <strong style={{ flex: '1 1 auto', minWidth: 0 }}>Custom Scenario</strong>
                        <Tag color="gray" style={{ flex: '0 0 auto' }}>CUSTOM</Tag>
                      </div>
                    }
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      flexWrap: 'wrap',
                      minWidth: 0,
                      width: '100%'
                    }}>
                      <ExperimentOutlined />
                      <strong style={{ flex: '1 1 auto', minWidth: 0 }}>Custom Scenario</strong>
                      <Tag color="gray" style={{ flex: '0 0 auto' }}>CUSTOM</Tag>
                    </div>
                    <div style={{ 
                      fontSize: "12px", 
                      color: "var(--text-secondary)",
                      marginTop: '4px',
                      wordBreak: 'break-word',
                      lineHeight: '1.3'
                    }}>Define your own shock parameters</div>
                  </Select.Option>
                </Select>
              </Col>
              
              <Col xs={24} md={8}>
                <div style={{ 
                  padding: "8px 16px", 
                  background: "var(--bg-secondary)", 
                  borderRadius: "6px",
                  border: "1px solid var(--border-primary)"
                }}>
                  <strong style={{ color: "var(--text-primary)" }}>{selectedScenario.name}</strong>
                  <br />
                  <small style={{ color: "var(--text-secondary)" }}>{selectedScenario.description}</small>
                </div>
              </Col>
              
              <Col xs={24} md={4}>
                <Button 
                  type="primary" 
                  onClick={runSimulation} 
                  size="large" 
                  icon={<RiseOutlined />}
                  block
                  disabled={
                    (scenarioScope === 'single' && !selectedAsset) ||
                    (selectedScenario.name === "Custom" && !customScenarioName.trim())
                  }
                  style={{
                    background: '#1890ff',
                    border: 'none',
                    color: 'var(--text-inverse)',
                    fontWeight: '600'
                  }}
                >
                  {scenarioScope === 'portfolio' ? 'Run Portfolio Analysis' : 'Run Asset Analysis'}
                </Button>
                {(scenarioScope === 'single' && !selectedAsset) && (
                  <div style={{ fontSize: "12px", color: "var(--error)", marginTop: "8px", textAlign: "center" }}>
                    Select an asset from Portfolio tab first
                  </div>
                )}
                {(selectedScenario.name === "Custom" && !customScenarioName.trim()) && (
                  <div style={{ fontSize: "12px", color: "var(--error)", marginTop: "8px", textAlign: "center" }}>
                    Enter a custom scenario name
                  </div>
                )}
              </Col>
            </Row>

            {/* Scenario Scope Selection */}
            <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
              <Col xs={24} md={12}>
                <Card size="small" title="Scenario Scope">
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div>
                      <strong>Analysis Scope:</strong>
                    </div>
                    <Space>
                      <Button
                        type={scenarioScope === 'portfolio' ? 'primary' : 'default'}
                        onClick={() => setScenarioScope('portfolio')}
                        icon={<BarChartOutlined />}
                      >
                        Portfolio-wide
                      </Button>
                      <Button
                        type={scenarioScope === 'single' ? 'primary' : 'default'}
                        onClick={() => setScenarioScope('single')}
                        icon={<DollarOutlined />}
                        disabled={!selectedAsset}
                      >
                        Single Asset
                      </Button>
                    </Space>
                    {scenarioScope === 'single' && !selectedAsset && (
                      <div style={{ fontSize: "12px", color: "var(--error)" }}>
                        Please select an asset from the Portfolio tab first
                      </div>
                    )}
                    {scenarioScope === 'single' && selectedAsset && (
                      <div style={{ fontSize: "12px", color: "var(--success)" }}>
                        Selected: {selectedAsset.asset}
                      </div>
                    )}
                  </Space>
                </Card>
              </Col>
            </Row>

            {selectedScenario.name === "Custom" && (
              <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
                <Col xs={24} md={12}>
                  <Card size="small" title="Custom Scenario Configuration">
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <div>
                        <strong>Scenario Name:</strong>
                        <Input
                          value={customScenarioName}
                          onChange={(e) => setCustomScenarioName(e.target.value)}
                          placeholder="Enter custom scenario name (e.g., 'Market Crash Test')"
                          style={{ marginTop: "8px" }}
                        />
                      </div>
                      <div>
                        <strong>Shock Percentage:</strong>
                        <InputNumber
                          value={customShock}
                          onChange={(v) => setCustomShock(v || 0)}
                          placeholder="Custom Shock %"
                          style={{ marginTop: "8px", width: "200px" }}
                          addonAfter="%"
                          size="large"
                        />
                      </div>
                    </Space>
                  </Card>
                </Col>
              </Row>
            )}
          </Card>

          {/* Results */}
          {results.length > 0 && (
            <Card title={`Enhanced Results - ${selectedScenario.name === "Custom" ? customScenarioName : selectedScenario.name}`} style={{ marginBottom: "24px" }}>
              {/* Risk Metrics Summary */}
              <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
                <Col xs={24} sm={6}>
                  <Card size="small">
                    <Statistic
                      title="Total Impact"
                      value={totalImpact}
                      prefix={totalImpact >= 0 ? <RiseOutlined /> : <FallOutlined />}
                      valueStyle={{ color: totalImpact >= 0 ? 'var(--success)' : 'var(--error)' }}
                      formatter={(value) => `$${Number(value).toLocaleString()}`}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={6}>
                  <Card size="small">
                    <Statistic
                      title="Impact %"
                      value={impactPercentage}
                      suffix="%"
                      precision={2}
                      valueStyle={{ color: impactPercentage >= 0 ? 'var(--success)' : 'var(--error)' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={6}>
                  <Card size="small">
                    <Statistic
                      title="VaR (95%)"
                      value={var95}
                      formatter={(value) => `$${Number(value).toLocaleString()}`}
                      valueStyle={{ color: 'var(--error)' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={6}>
                  <Card size="small">
                    <Statistic
                      title="Max Loss"
                      value={maxLoss}
                      formatter={(value) => `$${Number(value).toLocaleString()}`}
                      valueStyle={{ color: 'var(--error)' }}
                    />
                  </Card>
                </Col>
              </Row>

              <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
                <Col xs={24} lg={12}>
                  <Table
                    dataSource={results.map((r) => ({ ...r, key: r.asset }))}
                    columns={resultColumns}
                    pagination={false}
                    bordered
                    size="middle"
                    title={() => "Position Results"}
                  />
                </Col>
                <Col xs={24} lg={12}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={results}>
                      <XAxis dataKey="asset" />
                      <YAxis />
                      <RechartsTooltip 
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Impact']}
                      />
                      <Bar dataKey="impact" fill="#1890ff" />
                    </BarChart>
                  </ResponsiveContainer>
                </Col>
              </Row>
              
              <div style={{ textAlign: "center", marginTop: "16px", padding: "16px", background: "var(--bg-secondary)", borderRadius: "8px" }}>
                <div style={{ 
                  fontSize: "1.8rem", 
                  fontWeight: "bold",
                  color: totalImpact >= 0 ? 'var(--success)' : 'var(--error)',
                  marginBottom: "8px"
                }}>
                  Total Portfolio Impact: {totalImpact >= 0 ? '+' : ''}${totalImpact.toLocaleString()}
                </div>
                <div style={{ fontSize: "1.1rem", color: "var(--text-secondary)" }}>
                  Impact as % of Portfolio: {impactPercentage.toFixed(2)}%
                </div>
                <div style={{ fontSize: "0.9rem", color: "var(--text-tertiary)", marginTop: "4px" }}>
                  Scenario Category: <strong>{selectedScenario.category.toUpperCase()}</strong> | 
                  Shock Value: <strong>{(selectedScenario.shock * 100).toFixed(1)}%</strong>
                </div>
              </div>
            </Card>
          )}
            </>
          ) : (
            <Card 
              title="🎯 Select an Asset to Begin Scenario Analysis"
              style={{ marginBottom: "24px" }}
            >
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>
                  No Asset Selected
                </h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '16px' }}>
                  Please select an asset from the Portfolio tab to run scenario analysis and risk simulations.
                </p>
                <Button 
                  type="primary" 
                  size="large"
                  icon={<BarChartOutlined />}
                  onClick={() => {
                    // Switch to portfolio tab
                    const portfolioTab = document.querySelector('[data-node-key="portfolio"]') as HTMLElement;
                    if (portfolioTab) portfolioTab.click();
                  }}
                >
                  Go to Portfolio Tab
                </Button>
              </div>
            </Card>
          )}
        </TabPane>


        <TabPane tab="📊 Risk Metrics" key="risk">
          {results.length > 0 ? (
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title="Advanced Risk Analytics" size="small">
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Statistic
                      title="Value at Risk (VaR) 95%"
                      value={var95}
                      formatter={(value) => `$${Number(value).toLocaleString()}`}
                      valueStyle={{ color: 'var(--error)' }}
                    />
                    <Statistic
                      title="Expected Shortfall (ES) 95%"
                      value={var95 * 1.2} // Simplified ES calculation
                      formatter={(value) => `$${Number(value).toLocaleString()}`}
                      valueStyle={{ color: 'var(--error-light)' }}
                    />
                    <Statistic
                      title="Maximum Drawdown"
                      value={maxLoss}
                      formatter={(value) => `$${Number(value).toLocaleString()}`}
                      valueStyle={{ color: 'var(--error)' }}
                    />
                    <Statistic
                      title="Portfolio PnL"
                      value={totalImpact}
                      formatter={(value) => `$${Number(value).toLocaleString()}`}
                      valueStyle={{ 
                        color: totalImpact >= 0 ? 'var(--success)' : 'var(--error)' 
                      }}
                    />
                  </Space>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Risk Attribution Analysis" size="small">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={results}>
                      <XAxis dataKey="asset" />
                      <YAxis />
                      <RechartsTooltip 
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'PnL Impact']}
                      />
                      <Bar dataKey="impact" fill="#1890ff" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              
              <Col xs={24}>
                <Card title="Risk Factor Breakdown" size="small">
                  <Table
                    dataSource={results.map((r) => ({ 
                      ...r, 
                      key: r.asset,
                      delta: r.riskMetrics.delta,
                      gamma: r.riskMetrics.gamma,
                      duration: r.riskMetrics.duration,
                      convexity: r.riskMetrics.convexity,
                      vega: r.riskMetrics.vega,
                      theta: r.riskMetrics.theta
                    }))}
                    columns={[
                      { title: "Asset", dataIndex: "asset", key: "asset" },
                      { title: "Delta", dataIndex: "delta", key: "delta", render: (v) => v?.toFixed(3) || "0.000" },
                      { title: "Gamma", dataIndex: "gamma", key: "gamma", render: (v) => v?.toFixed(3) || "0.000" },
                      { title: "Duration", dataIndex: "duration", key: "duration", render: (v) => v?.toFixed(2) || "0.00" },
                      { title: "Convexity", dataIndex: "convexity", key: "convexity", render: (v) => v?.toFixed(2) || "0.00" },
                      { title: "Vega", dataIndex: "vega", key: "vega", render: (v) => v?.toFixed(2) || "0.00" },
                      { title: "Theta", dataIndex: "theta", key: "theta", render: (v) => v?.toFixed(4) || "0.0000" }
                    ]}
                    pagination={false}
                    bordered
                    size="small"
                  />
                </Card>
              </Col>
            </Row>
          ) : (
            <Alert
              message="No Risk Analysis Available"
              description="Run a scenario simulation to view comprehensive risk metrics and analytics."
              type="info"
              showIcon
              style={{ margin: "24px 0" }}
            />
          )}
        </TabPane>

        <TabPane tab="🔄 Backtesting" key="backtesting">
          <Card title="Historical Scenario Backtesting" style={{ marginBottom: "24px" }}>
            <Alert
              message="🔄 Backtesting Workflow"
              description={
                <div>
                  <strong>Core Backtesting Process:</strong>
                  <ol style={{ marginTop: "8px", paddingLeft: "20px" }}>
                    <li><strong>Select Backtest Scenario</strong> - Choose historical market period</li>
                    <li><strong>Fetch Historical Market Data</strong> - Spot, vols, curves per date</li>
                    <li><strong>Align Lifecycle State</strong> - KO/KI schedules, accrual status</li>
                    <li><strong>Revalue Portfolio</strong> - Update instrument state and barriers</li>
                    <li><strong>Compute Metrics</strong> - PnL time series, VaR vs realized losses</li>
                    <li><strong>Compare Predicted vs Actual</strong> - Model risk assessment</li>
                  </ol>
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: "24px" }}
            />
            
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <Space>
                    <span>Select Backtest Scenario</span>
                    <Tag color={useCustomScenario ? "blue" : "default"}>
                      {useCustomScenario ? "Custom Mode" : "Preset Mode"}
                    </Tag>
                  </Space>
                } 
                size="small"
              >
                <Space style={{ marginBottom: "16px", width: "100%" }}>
                  <Button 
                    type={useCustomScenario ? "default" : "primary"}
                    size="small"
                    onClick={() => setUseCustomScenario(false)}
                  >
                    📚 Preset Scenarios
                  </Button>
                  <Button 
                    type={useCustomScenario ? "primary" : "default"}
                    size="small"
                    onClick={() => setUseCustomScenario(true)}
                  >
                    ⚙️ Custom Scenario
                  </Button>
                </Space>

                {!useCustomScenario ? (
                  <>
                  <Select
                    placeholder="Choose historical scenario"
                    style={{ 
                      width: "100%", 
                      marginBottom: "16px"
                    }}
                    value={selectedBacktestScenario?.id}
                    onChange={(value) => {
                      const scenario = backtestingData.backtestingScenarios.find(s => s.id === value);
                      setSelectedBacktestScenario(scenario);
                    }}
                  >
                    {backtestingData.backtestingScenarios.map(scenario => (
                      <Select.Option key={scenario.id} value={scenario.id}>
                        {scenario.name}
                      </Select.Option>
                    ))}
                  </Select>
                  
                  {selectedBacktestScenario && (
                    <div style={{ 
                      padding: "12px", 
                      backgroundColor: "var(--bg-secondary)", 
                      borderRadius: "6px",
                      marginBottom: "16px",
                      border: "1px solid var(--border-primary)"
                    }}>
                      <h4 style={{ margin: "0 0 8px 0", color: "var(--text-primary)" }}>
                        {selectedBacktestScenario.name}
                      </h4>
                      <p style={{ margin: "0 0 8px 0", color: "var(--text-secondary)" }}>
                        {selectedBacktestScenario.description}
                      </p>
                      <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                        <strong>Period:</strong> {selectedBacktestScenario.startDate} to {selectedBacktestScenario.endDate}
                        <br />
                        <strong>Frequency:</strong> {selectedBacktestScenario.period}
                        <br />
                        <strong>Market Conditions:</strong> 
                        <Tag color="red">Equity: {selectedBacktestScenario.marketConditions.equityDecline}%</Tag>
                        <Tag color="orange">Vol: +{selectedBacktestScenario.marketConditions.volatilitySpike}%</Tag>
                        <Tag color="blue">Rates: {selectedBacktestScenario.marketConditions.rateCuts}bps</Tag>
                        <Tag color="purple">Credit: +{selectedBacktestScenario.marketConditions.creditWidening}bps</Tag>
                      </div>
                    </div>
                  )}
                  </>
                ) : (
                  <div>
                    <Form layout="vertical" size="small">
                      <Form.Item label="Scenario Name">
                        <Input 
                          value={customScenarioName}
                          onChange={(e) => setCustomScenarioName(e.target.value)}
                          placeholder="Enter custom scenario name"
                        />
                      </Form.Item>
                      
                      <Row gutter={8}>
                        <Col span={12}>
                          <Form.Item label="Start Date">
                            <Input 
                              type="date"
                              value={customStartDate}
                              onChange={(e) => setCustomStartDate(e.target.value)}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item label="End Date">
                            <Input 
                              type="date"
                              value={customEndDate}
                              onChange={(e) => setCustomEndDate(e.target.value)}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      
                      <div style={{ 
                        padding: "12px", 
                        backgroundColor: "var(--bg-secondary)", 
                        borderRadius: "6px",
                        marginBottom: "16px",
                        border: "1px solid var(--border-primary)"
                      }}>
                        <h4 style={{ margin: "0 0 12px 0", color: "var(--text-primary)" }}>
                          📊 Market Conditions
                        </h4>
                        
                        <Row gutter={[8, 8]}>
                          <Col span={12}>
                            <Form.Item label="Equity Decline (%)">
                              <InputNumber
                                value={customMarketConditions.equityDecline}
                                onChange={(value) => setCustomMarketConditions(prev => ({...prev, equityDecline: value || 0}))}
                                style={{ width: "100%" }}
                                min={-100}
                                max={0}
                                step={1}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item label="Volatility Spike (%)">
                              <InputNumber
                                value={customMarketConditions.volatilitySpike}
                                onChange={(value) => setCustomMarketConditions(prev => ({...prev, volatilitySpike: value || 0}))}
                                style={{ width: "100%" }}
                                min={0}
                                max={500}
                                step={5}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item label="Rate Cuts (bps)">
                              <InputNumber
                                value={customMarketConditions.rateCuts}
                                onChange={(value) => setCustomMarketConditions(prev => ({...prev, rateCuts: value || 0}))}
                                style={{ width: "100%" }}
                                min={-500}
                                max={0}
                                step={10}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item label="Credit Widening (bps)">
                              <InputNumber
                                value={customMarketConditions.creditWidening}
                                onChange={(value) => setCustomMarketConditions(prev => ({...prev, creditWidening: value || 0}))}
                                style={{ width: "100%" }}
                                min={0}
                                max={1000}
                                step={10}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                        
                        <div style={{ marginTop: "12px", fontSize: "12px", color: "var(--text-tertiary)" }}>
                          <strong>Preview:</strong> 
                          <Tag color="red" style={{ marginLeft: "4px" }}>Equity: {customMarketConditions.equityDecline}%</Tag>
                          <Tag color="orange">Vol: +{customMarketConditions.volatilitySpike}%</Tag>
                          <Tag color="blue">Rates: {customMarketConditions.rateCuts}bps</Tag>
                          <Tag color="purple">Credit: +{customMarketConditions.creditWidening}bps</Tag>
                        </div>
                      </div>
                    </Form>
                  </div>
                )}
                
                <Button
                  type="primary"
                  size="large"
                  icon={<ExperimentOutlined />}
                  onClick={runBacktest}
                  loading={isBacktestRunning}
                  disabled={!useCustomScenario && !selectedBacktestScenario}
                  style={{ width: "100%" }}
                >
                  {isBacktestRunning ? `Running Backtest... ${backtestProgress}%` : "Run Backtest"}
                </Button>
                
                {isBacktestRunning && (
                  <Progress 
                    percent={backtestProgress} 
                    status="active" 
                    style={{ marginTop: "16px" }}
                  />
                )}
              </Card>
              </Col>
              
              <Col xs={24} lg={12}>
                <Card 
                  title={
                    <Space>
                      <span>Lifecycle Elements</span>
                      <Tag color="blue">Dynamic from Payload</Tag>
                    </Space>
                  } 
                  size="small"
                >
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ fontWeight: "bold", marginBottom: "8px", display: "block" }}>
                      Select Deal for Lifecycle Data:
                    </label>
                    <Select
                      value={selectedDealIndex}
                      onChange={setSelectedDealIndex}
                      style={{ width: "100%" }}
                      placeholder="Choose deal from Murex payload"
                    >
                      {availableDeals.map(deal => (
                        <Select.Option key={deal.index} value={deal.index}>
                          {deal.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                  
                  {(() => {
                    const lifecycleData = extractLifecycleData(selectedDealIndex);
                    if (!lifecycleData) {
                      return <div>No lifecycle data available for selected deal</div>;
                    }
                    
                    return (
                      <Collapse size="small" defaultActiveKey={['fixing', 'ko', 'ki']}>
                        <Collapse.Panel 
                          header={
                            <Space>
                              <Tag color="blue">Fixing Info</Tag>
                              <span>Last fixing: {lifecycleData.fixingInfo.lastFixingDate}</span>
                            </Space>
                          } 
                          key="fixing"
                        >
                          <Descriptions size="small" column={1}>
                            <Descriptions.Item label="Lifecycle Date">
                              {lifecycleData.fixingInfo.lifeCycleDate}
                            </Descriptions.Item>
                            <Descriptions.Item label="Last Fixing">
                              {lifecycleData.fixingInfo.lastFixingDate}
                            </Descriptions.Item>
                            <Descriptions.Item label="Next Fixing">
                              {lifecycleData.fixingInfo.nextFixingDate}
                            </Descriptions.Item>
                          </Descriptions>
                        </Collapse.Panel>
                    
                        <Collapse.Panel 
                          header={
                            <Space>
                              <Tag color="green">Knock-Out (KO)</Tag>
                              <span>{lifecycleData.knockOutLifecycle.endDate.length} observation dates</span>
                            </Space>
                          } 
                          key="ko"
                        >
                          <Table
                            size="small"
                            dataSource={lifecycleData.knockOutLifecycle.endDate.map((date: any, index: number) => ({
                              key: index,
                              date,
                              barrier: lifecycleData.knockOutLifecycle.locBarPrice[index],
                              coupon: lifecycleData.knockOutLifecycle.locKOCpn[index],
                              probability: lifecycleData.knockOutLifecycle.KO_Prob[index]
                            }))}
                            columns={[
                              { title: 'Date', dataIndex: 'date', key: 'date' },
                              { title: 'Barrier', dataIndex: 'barrier', key: 'barrier', render: (val: any) => `${(val * 100).toFixed(0)}%` },
                              { title: 'Coupon', dataIndex: 'coupon', key: 'coupon', render: (val: any) => `${val}%` },
                              { title: 'KO Prob', dataIndex: 'probability', key: 'probability', render: (val: any) => `${(val * 100).toFixed(1)}%` }
                            ]}
                            pagination={false}
                          />
                        </Collapse.Panel>
                    
                        <Collapse.Panel 
                          header={
                            <Space>
                              <Tag color="red">Knock-In (KI)</Tag>
                              <span>Barrier: {(lifecycleData.knockInLifecycle.KIBarrier * 100).toFixed(0)}%</span>
                            </Space>
                          } 
                          key="ki"
                        >
                          <Descriptions size="small" column={1}>
                            <Descriptions.Item label="KI Barrier">
                              {(lifecycleData.knockInLifecycle.KIBarrier * 100).toFixed(0)}%
                            </Descriptions.Item>
                            <Descriptions.Item label="Strike KI1">
                              {(lifecycleData.knockInLifecycle.strikeKI1 * 100).toFixed(0)}%
                            </Descriptions.Item>
                            <Descriptions.Item label="Strike KI2">
                              {(lifecycleData.knockInLifecycle.strikeKI2 * 100).toFixed(0)}%
                            </Descriptions.Item>
                            <Descriptions.Item label="Already KI">
                              {lifecycleData.instrumentState.alreadyKnockIn ? "Yes" : "No"}
                            </Descriptions.Item>
                          </Descriptions>
                        </Collapse.Panel>
                      </Collapse>
                    );
                  })()}
                </Card>
              </Col>
            </Row>
          </Card>
          
        {backtestResults.length > 0 && (
          <Card title={`Backtest Results - ${useCustomScenario ? customScenarioName : selectedBacktestScenario?.name}`} style={{ marginBottom: "24px" }}>
              {(() => {
                const summary = getBacktestSummary();
                return summary && (
                  <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
                    <Col xs={24} sm={6}>
                      <Statistic
                        title="Total P&L"
                        value={summary.totalPnL}
                        formatter={(value) => `$${Number(value).toLocaleString()}`}
                        valueStyle={{ color: summary.totalPnL >= 0 ? '#52c41a' : '#ff4d4f' }}
                      />
                    </Col>
                    <Col xs={24} sm={6}>
                      <Statistic
                        title="Max Loss"
                        value={summary.maxLoss}
                        formatter={(value) => `$${Number(value).toLocaleString()}`}
                        valueStyle={{ color: 'var(--error)' }}
                      />
                    </Col>
                    <Col xs={24} sm={6}>
                      <Statistic
                        title="KO Events"
                        value={summary.koEvents}
                        suffix={`/${summary.totalDays} days`}
                        valueStyle={{ color: 'var(--primary)' }}
                      />
                    </Col>
                    <Col xs={24} sm={6}>
                      <Statistic
                        title="KI Events"
                        value={summary.kiEvents}
                        suffix={`/${summary.totalDays} days`}
                        valueStyle={{ color: 'var(--warning)' }}
                      />
                    </Col>
                  </Row>
                );
              })()}
              
              <Table
                dataSource={backtestResults.slice(-10)} // Show last 10 days
                columns={[
                  { title: 'Date', dataIndex: 'date', key: 'date', width: 120 },
                  { title: 'Portfolio Value', dataIndex: 'portfolioValue', key: 'portfolioValue', render: (val) => `$${Number(val).toLocaleString()}` },
                  { title: 'Daily P&L', dataIndex: 'dailyPnL', key: 'dailyPnL', render: (val) => (
                      <span style={{ color: val >= 0 ? '#52c41a' : '#ff4d4f' }}>
                        ${Number(val).toLocaleString()}
                      </span>
                    )
                  },
                  { title: 'Cumulative P&L', dataIndex: 'cumulativePnL', key: 'cumulativePnL', render: (val) => (
                      <span style={{ color: val >= 0 ? '#52c41a' : '#ff4d4f' }}>
                        ${Number(val).toLocaleString()}
                      </span>
                    )
                  },
                  { title: 'KO', dataIndex: 'koTriggered', key: 'koTriggered', render: (val) => val ? <Tag color="green">Yes</Tag> : <Tag color="default">No</Tag> },
                  { title: 'KI', dataIndex: 'kiTriggered', key: 'kiTriggered', render: (val) => val ? <Tag color="red">Yes</Tag> : <Tag color="default">No</Tag> }
                ]}
                pagination={false}
                size="small"
              />
            </Card>
          )}
        </TabPane>

        <TabPane tab="📋 Assumptions" key="assumptions">
          <Card 
            title={
              <Space>
                <InfoCircleOutlined style={{ color: 'var(--primary)' }} />
                <span>Simulation Assumptions & Methodology</span>
                <Badge count="8" style={{ backgroundColor: 'var(--success)', color: 'white' }} />
              </Space>
            }
            style={{ marginBottom: "24px" }}
          >
            <Collapse 
              defaultActiveKey={['market-data', 'risk-factors', 'scenario-history', 'manual-scenarios', 'backtesting-config']}
              size="small"
              items={[
                {
                  key: 'market-data',
                  label: (
                    <Space>
                      <Tag color="blue">Market Data</Tag>
                      <span>Real-time pricing and volatility surfaces</span>
                    </Space>
                  ),
                  children: (
                    <Descriptions size="small" column={2} bordered>
                      <Descriptions.Item label="Data Source" span={2}>
                        <Tag color="green">Murex Payload</Tag> Marketdata from report.
                      </Descriptions.Item>
                      <Descriptions.Item label="Equity Assets">
                        BABA UN (${MARKET_DATA.baba.spot}) | 700 HK ({MARKET_DATA.hk700.spot} HKD)
                      </Descriptions.Item>
                      <Descriptions.Item label="Volatility Surfaces">
                        BABA: {MARKET_DATA.volatility.baba.strikes.length} strikes × {MARKET_DATA.volatility.baba.maturities.length} maturities
                      </Descriptions.Item>
                      <Descriptions.Item label="Yield Curves">
                        USD: {MARKET_DATA.rates.curve.length} tenors | HKD: {MARKET_DATA.hkdRates.curve.length} tenors
                      </Descriptions.Item>
                      <Descriptions.Item label="Monte Carlo Paths">
                        {MARKET_DATA.monteCarlo.numPaths.toLocaleString()} simulations
                      </Descriptions.Item>
                    </Descriptions>
                  )
                },
                {
                  key: 'risk-factors',
                  label: (
                    <Space>
                      <Tag color="orange">Risk Factors</Tag>
                      <span>Greeks and sensitivity assumptions</span>
                    </Space>
                  ),
                  children: (
                    <Descriptions size="small" column={2} bordered>
                      <Descriptions.Item label="Equity Delta" span={1}>
                        <Tag color="blue">1.0</Tag> Linear price sensitivity
                      </Descriptions.Item>
                      <Descriptions.Item label="Equity Gamma" span={1}>
                        <Tag color="blue">0.0</Tag> No convexity for stocks
                      </Descriptions.Item>
                      <Descriptions.Item label="Bond Duration" span={1}>
                        <Tag color="purple">2.8-4.2</Tag> Based on yield curve maturity
                      </Descriptions.Item>
                      <Descriptions.Item label="Bond Convexity" span={1}>
                        <Tag color="purple">8.0-15.0</Tag> Estimated from duration
                      </Descriptions.Item>
                      <Descriptions.Item label="Option Greeks" span={2}>
                        <Tag color="green">Delta: 0.5</Tag> <Tag color="green">Gamma: 0.02</Tag> <Tag color="green">Vega: 0.15-0.18</Tag> <Tag color="green">Theta: -0.02 to -0.06</Tag>
                      </Descriptions.Item>
                    </Descriptions>
                  )
                },
                {
                  key: 'scenario-methodology',
                  label: (
                    <Space>
                      <Tag color="red">Scenario Methodology</Tag>
                      <span>Shock application and calculation logic</span>
                    </Space>
                  ),
                  children: (
                    <div>
                      <Row gutter={[16, 16]}>
                        <Col xs={24} md={8}>
                          <Card size="small" title={<Tag color="blue">Standard Scenarios</Tag>}>
                            <ul style={{ margin: 0, paddingLeft: '16px' }}>
                              <li><strong>Equity:</strong> Direct price shock (±5%)</li>
                              <li><strong>Rates:</strong> Parallel curve shift (50bps)</li>
                              <li><strong>FX:</strong> Currency appreciation (2%)</li>
                              <li><strong>Credit:</strong> Spread widening (100-200bps)</li>
                              <li><strong>Volatility:</strong> Surface scaling (30%)</li>
                            </ul>
                          </Card>
                        </Col>
                        <Col xs={24} md={8}>
                          <Card size="small" title={<Tag color="red">Stress Tests</Tag>}>
                            <ul style={{ margin: 0, paddingLeft: '16px' }}>
                              <li><strong>2008 Crisis:</strong> -40% equity shock</li>
                              <li><strong>COVID-19:</strong> -30% market decline</li>
                              <li><strong>Mild Recession:</strong> -15% downturn</li>
                              <li><strong>Multi-factor:</strong> Combined shocks</li>
                              <li><strong>Vol Impact:</strong> +30% volatility</li>
                            </ul>
                          </Card>
                        </Col>
                        <Col xs={24} md={8}>
                          <Card size="small" title={<Tag color="green">Monte Carlo</Tag>}>
                            <ul style={{ margin: 0, paddingLeft: '16px' }}>
                              <li><strong>Daily VaR:</strong> 10,000 paths, Normal dist.</li>
                              <li><strong>Monthly VaR:</strong> 50,000 paths, t-dist.</li>
                              <li><strong>Custom MC:</strong> 25,000 paths, Historical</li>
                              <li><strong>Quality Factor:</strong> Based on Murex paths</li>
                              <li><strong>Random Shock:</strong> ±1% variation</li>
                            </ul>
                          </Card>
                        </Col>
                      </Row>
                    </div>
                  )
                },
                {
                  key: 'scenario-history',
                  label: (
                    <Space>
                      <Tag color="magenta">Scenario History & Audit</Tag>
                      <span>Comprehensive execution tracking and audit trail</span>
                    </Space>
                  ),
                  children: (
                    <div>
                      <Row gutter={[16, 16]}>
                        <Col xs={24} md={12}>
                          <Card size="small" title={<Tag color="blue">History Management</Tag>}>
                            <Descriptions size="small" column={1} bordered>
                              <Descriptions.Item label="Storage">
                                <Tag color="green">localStorage</Tag> Persistent browser storage
                              </Descriptions.Item>
                              <Descriptions.Item label="Retention">
                                <Tag color="orange">Last 100</Tag> scenario executions
                              </Descriptions.Item>
                              <Descriptions.Item label="Auto-Save">
                                <Tag color="green">Enabled</Tag> Automatic after each execution
                              </Descriptions.Item>
                              <Descriptions.Item label="Export Format">
                                <Tag color="blue">CSV</Tag> Compliance-ready audit reports
                              </Descriptions.Item>
                              <Descriptions.Item label="Session Tracking">
                                <Tag color="purple">Session ID</Tag> + User Agent for traceability
                              </Descriptions.Item>
                            </Descriptions>
                          </Card>
                        </Col>
                        <Col xs={24} md={12}>
                          <Card size="small" title={<Tag color="green">Audit Capabilities</Tag>}>
                            <ul style={{ margin: 0, paddingLeft: '16px' }}>
                              <li><strong>Complete Parameters:</strong> All scenario inputs captured</li>
                              <li><strong>Execution Timestamps:</strong> Precise date/time tracking</li>
                              <li><strong>Results Archive:</strong> Full calculation results stored</li>
                              <li><strong>Re-run Functionality:</strong> One-click scenario replay</li>
                              <li><strong>Advanced Filtering:</strong> Search by type, scope, asset</li>
                              <li><strong>Expandable Details:</strong> Complete parameter inspection</li>
                            </ul>
                          </Card>
                        </Col>
                      </Row>
                      
                      <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
                        <Col xs={24} md={8}>
                          <Card size="small" title={<Tag color="purple">Scenario Types Tracked</Tag>}>
                            <ul style={{ margin: 0, paddingLeft: '16px' }}>
                              <li><strong>Regular Scenarios:</strong> Equity, Rates, FX, Vol, Credit</li>
                              <li><strong>Stress Tests:</strong> 2008, COVID, Mild Crisis</li>
                              <li><strong>Monte Carlo:</strong> VaR calculations</li>
                              <li><strong>Custom Scenarios:</strong> User-defined parameters</li>
                              <li><strong>Backtesting:</strong> Historical scenario analysis</li>
                              <li><strong>Manual Scenarios:</strong> Editable market data</li>
                            </ul>
                          </Card>
                        </Col>
                        <Col xs={24} md={8}>
                          <Card size="small" title={<Tag color="orange">Scope Analysis</Tag>}>
                            <ul style={{ margin: 0, paddingLeft: '16px' }}>
                              <li><strong>Portfolio-wide:</strong> All assets analyzed</li>
                              <li><strong>Single Asset:</strong> Individual asset focus</li>
                              <li><strong>Asset Selection:</strong> User-chosen specific assets</li>
                              <li><strong>Dynamic Filtering:</strong> Real-time search</li>
                              <li><strong>Type Filtering:</strong> Scenario category filtering</li>
                              <li><strong>Date Sorting:</strong> Chronological ordering</li>
                            </ul>
                          </Card>
                        </Col>
                        <Col xs={24} md={8}>
                          <Card size="small" title={<Tag color="cyan">Compliance Features</Tag>}>
                            <ul style={{ margin: 0, paddingLeft: '16px' }}>
                              <li><strong>Regulatory Audit:</strong> Complete execution trail</li>
                              <li><strong>CSV Export:</strong> Standard compliance format</li>
                              <li><strong>Parameter Verification:</strong> Full input validation</li>
                              <li><strong>Result Traceability:</strong> End-to-end tracking</li>
                              <li><strong>Session Management:</strong> User session tracking</li>
                              <li><strong>Data Integrity:</strong> Immutable execution records</li>
                            </ul>
                          </Card>
                        </Col>
                      </Row>
                    </div>
                  )
                },
                {
                  key: 'manual-scenarios',
                  label: (
                    <Space>
                      <Tag color="geekblue">Manual Scenario Editing</Tag>
                      <span>Interactive market data modification and custom scenarios</span>
                    </Space>
                  ),
                  children: (
                    <div>
                      <Row gutter={[16, 16]}>
                        <Col xs={24} md={12}>
                          <Card size="small" title={<Tag color="blue">Market Data Editing</Tag>}>
                            <Descriptions size="small" column={1} bordered>
                              <Descriptions.Item label="Editable Tables">
                                <Tag color="green">Volatility Surface</Tag> Strike × Maturity matrix
                              </Descriptions.Item>
                              <Descriptions.Item label="Interest Rates">
                                <Tag color="green">Yield Curves</Tag> Tenor-based rate editing
                              </Descriptions.Item>
                              <Descriptions.Item label="Equity Data">
                                <Tag color="green">Spot, Bid, Ask</Tag> Real-time price updates
                              </Descriptions.Item>
                              <Descriptions.Item label="Correlations">
                                <Tag color="green">Asset Pairs</Tag> Correlation coefficient editing
                              </Descriptions.Item>
                              <Descriptions.Item label="Auto-Calculation">
                                <Tag color="orange">Spread = Ask - Bid</Tag> Derived values
                              </Descriptions.Item>
                            </Descriptions>
                          </Card>
                        </Col>
                        <Col xs={24} md={12}>
                          <Card size="small" title={<Tag color="green">Workflow Integration</Tag>}>
                            <ul style={{ margin: 0, paddingLeft: '16px' }}>
                              <li><strong>Portfolio Integration:</strong> Edit from portfolio view</li>
                              <li><strong>Modal Interface:</strong> In-place data editing</li>
                              <li><strong>Real-time Updates:</strong> Live parameter changes</li>
                              <li><strong>Scenario Naming:</strong> Custom scenario identification</li>
                              <li><strong>Immediate Execution:</strong> Run scenarios with edited data</li>
                              <li><strong>History Integration:</strong> Manual scenarios tracked</li>
                            </ul>
                          </Card>
                        </Col>
                      </Row>
                      
                      <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
                        <Col xs={24} md={8}>
                          <Card size="small" title={<Tag color="purple">Data Types Supported</Tag>}>
                            <ul style={{ margin: 0, paddingLeft: '16px' }}>
                              <li><strong>Equity Prices:</strong> Spot, bid, ask prices</li>
                              <li><strong>Volatility Surface:</strong> Strike × Maturity matrix</li>
                              <li><strong>Interest Rates:</strong> Yield curve tenors</li>
                              <li><strong>Correlations:</strong> Asset pair relationships</li>
                              <li><strong>Dividends:</strong> Dividend yield adjustments</li>
                              <li><strong>FX Rates:</strong> Currency conversions</li>
                            </ul>
                          </Card>
                        </Col>
                        <Col xs={24} md={8}>
                          <Card size="small" title={<Tag color="orange">Validation & Safety</Tag>}>
                            <ul style={{ margin: 0, paddingLeft: '16px' }}>
                              <li><strong>Input Validation:</strong> Numeric range checking</li>
                              <li><strong>Data Integrity:</strong> Consistent market data</li>
                              <li><strong>Error Handling:</strong> Graceful failure recovery</li>
                              <li><strong>Undo Capability:</strong> Cancel editing mode</li>
                              <li><strong>Auto-Save:</strong> Preserve edited values</li>
                              <li><strong>Audit Trail:</strong> Track all manual changes</li>
                            </ul>
                          </Card>
                        </Col>
                        <Col xs={24} md={8}>
                          <Card size="small" title={<Tag color="cyan">User Experience</Tag>}>
                            <ul style={{ margin: 0, paddingLeft: '16px' }}>
                              <li><strong>Intuitive Interface:</strong> Click-to-edit tables</li>
                              <li><strong>Visual Feedback:</strong> Editing mode indicators</li>
                              <li><strong>Responsive Design:</strong> Mobile-friendly editing</li>
                              <li><strong>Keyboard Navigation:</strong> Tab-based editing</li>
                              <li><strong>Batch Operations:</strong> Multi-cell editing</li>
                              <li><strong>Context Help:</strong> Inline guidance</li>
                            </ul>
                          </Card>
                        </Col>
                      </Row>
                    </div>
                  )
                },
                {
                  key: 'calculation-formulas',
                  label: (
                    <Space>
                      <Tag color="purple">Calculation Formulas</Tag>
                      <span>Mathematical models and equations</span>
                    </Space>
                  ),
                  children: (
                    <Descriptions size="small" column={1} bordered>
                      <Descriptions.Item label="Price Impact">
                        <code>New Price = Original Price × (1 + Shock)</code>
                      </Descriptions.Item>
                      <Descriptions.Item label="Duration Impact">
                        <code>Bond Impact = -Duration × Rate Shock × Price</code>
                      </Descriptions.Item>
                      <Descriptions.Item label="Convexity Adjustment">
                        <code>Convexity = 0.5 × Convexity × (Rate Shock)² × Price</code>
                      </Descriptions.Item>
                      <Descriptions.Item label="Option Time Decay">
                        <code>Theta Decay = Theta × 0.01 (daily)</code>
                      </Descriptions.Item>
                      <Descriptions.Item label="Monte Carlo Quality">
                        <code>Quality = log(MurexPaths) / log(1000)</code>
                      </Descriptions.Item>
                      <Descriptions.Item label="Portfolio Impact">
                        <code>Total Impact = Σ(Price Change × Quantity)</code>
                      </Descriptions.Item>
                    </Descriptions>
                  )
                },
                {
                  key: 'backtesting-config',
                  label: (
                    <Space>
                      <Tag color="cyan">Backtesting Configuration</Tag>
                      <span>Historical scenario replay and lifecycle elements</span>
                    </Space>
                  ),
                  children: (
                    <div>
                      <Row gutter={[16, 16]}>
                        <Col xs={24} md={12}>
                          <Card size="small" title={<Tag color="blue">Scenario Configuration</Tag>}>
                            <Descriptions size="small" column={1} bordered>
                              <Descriptions.Item label="Historical Scenarios">
                                <ul style={{ margin: 0, paddingLeft: '16px' }}>
                                  <li><strong>COVID-19 Crash:</strong> Feb-Apr 2020, -30% equity, +150% vol</li>
                                  <li><strong>2008 Crisis:</strong> Sep-Dec 2008, -40% equity, +200% vol</li>
                                  <li><strong>Mild Recession:</strong> 2022, -15% equity, +80% vol</li>
                                  <li><strong>Custom Scenarios:</strong> User-defined market conditions</li>
                                </ul>
                              </Descriptions.Item>
                              <Descriptions.Item label="Market Data Frequency">
                                <Tag color="green">Daily</Tag> for crisis scenarios, <Tag color="blue">Monthly</Tag> for mild scenarios
                              </Descriptions.Item>
                              <Descriptions.Item label="Backtesting Periods">
                                <Tag color="red">COVID:</Tag> 89 days | <Tag color="orange">2008:</Tag> 122 days | <Tag color="blue">2022:</Tag> 365 days
                              </Descriptions.Item>
                            </Descriptions>
                          </Card>
                        </Col>
                        <Col xs={24} md={12}>
                          <Card size="small" title={<Tag color="green">Lifecycle Elements</Tag>}>
                            <Descriptions size="small" column={1} bordered>
                              <Descriptions.Item label="Fixing Schedule">
                                <Tag color="blue">Last Fixing:</Tag> {backtestingData.lifecycleElements.fixingInfo.lifeCycleDate} | 
                                <Tag color="green">Next:</Tag> {backtestingData.lifecycleElements.fixingInfo.nextFixingDate}
                              </Descriptions.Item>
                              <Descriptions.Item label="KO Observation Dates">
                                <Tag color="green">{backtestingData.lifecycleElements.knockOutLifecycle.endDate.length} dates</Tag> 
                                (Jan, Apr, Jul, Oct 2024)
                              </Descriptions.Item>
                              <Descriptions.Item label="KO Barrier Levels">
                                <Tag color="red">90%</Tag> → <Tag color="orange">85%</Tag> → <Tag color="yellow">80%</Tag> → <Tag color="purple">75%</Tag>
                              </Descriptions.Item>
                              <Descriptions.Item label="KI Barrier">
                                <Tag color="red">60%</Tag> of initial reference price
                              </Descriptions.Item>
                            </Descriptions>
                          </Card>
                        </Col>
                      </Row>
                      
                      <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
                        <Col xs={24} md={8}>
                          <Card size="small" title={<Tag color="purple">Accrual Schedule</Tag>}>
                            <ul style={{ margin: 0, paddingLeft: '16px' }}>
                              <li><strong>Accrual Rate:</strong> 2.5% per quarter</li>
                              <li><strong>Payment Dates:</strong> Jan, Apr, Jul, Oct</li>
                              <li><strong>KO Coupon:</strong> 2.5% upon redemption</li>
                              <li><strong>Fixing Status:</strong> All pending</li>
                            </ul>
                          </Card>
                        </Col>
                        <Col xs={24} md={8}>
                          <Card size="small" title={<Tag color="orange">Instrument State</Tag>}>
                            <ul style={{ margin: 0, paddingLeft: '16px' }}>
                              <li><strong>Status:</strong> <Tag color="green">LIVE</Tag></li>
                              <li><strong>Already KI:</strong> <Tag color="red">No</Tag></li>
                              <li><strong>Notional:</strong> $1,000,000</li>
                              <li><strong>Currency:</strong> USD</li>
                            </ul>
                          </Card>
                        </Col>
                        <Col xs={24} md={8}>
                          <Card size="small" title={<Tag color="cyan">Backtesting Process</Tag>}>
                            <ol style={{ margin: 0, paddingLeft: '16px' }}>
                              <li><strong>Fetch Historical Data</strong> - Spot, vols, curves</li>
                              <li><strong>Align Lifecycle State</strong> - KO/KI schedules</li>
                              <li><strong>Revalue Portfolio</strong> - Update barriers</li>
                              <li><strong>Compute Metrics</strong> - PnL time series</li>
                              <li><strong>Compare Results</strong> - Predicted vs actual</li>
                            </ol>
                          </Card>
                        </Col>
                      </Row>
                      
                      <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
                        <Col xs={24} md={8}>
                          <Card size="small" title={<Tag color="magenta">Enhanced Features</Tag>}>
                            <ul style={{ margin: 0, paddingLeft: '16px' }}>
                              <li><strong>Custom Market Conditions:</strong> User-defined scenarios</li>
                              <li><strong>Dynamic Deal Selection:</strong> Murex payload integration</li>
                              <li><strong>Lifecycle Data:</strong> Real-time KO/KI schedules</li>
                              <li><strong>History Integration:</strong> Backtesting audit trail</li>
                              <li><strong>Re-run Capability:</strong> Replay historical backtests</li>
                              <li><strong>Progress Tracking:</strong> Real-time execution status</li>
                            </ul>
                          </Card>
                        </Col>
                        <Col xs={24} md={8}>
                          <Card size="small" title={<Tag color="green">Custom Scenarios</Tag>}>
                            <ul style={{ margin: 0, paddingLeft: '16px' }}>
                              <li><strong>Equity Decline:</strong> -15% (customizable)</li>
                              <li><strong>Volatility Spike:</strong> +80% (adjustable)</li>
                              <li><strong>Rate Cuts:</strong> -50bps (user-defined)</li>
                              <li><strong>Credit Widening:</strong> +100bps (configurable)</li>
                              <li><strong>Date Range:</strong> Flexible start/end dates</li>
                              <li><strong>Frequency:</strong> Daily/Monthly selection</li>
                            </ul>
                          </Card>
                        </Col>
                        <Col xs={24} md={8}>
                          <Card size="small" title={<Tag color="cyan">Data Integration</Tag>}>
                            <ul style={{ margin: 0, paddingLeft: '16px' }}>
                              <li><strong>Murex Payload:</strong> Real deal data integration</li>
                              <li><strong>Dynamic Extraction:</strong> Live lifecycle data</li>
                              <li><strong>Deal Selection:</strong> Multiple deal support</li>
                              <li><strong>Product Identification:</strong> Automatic naming</li>
                              <li><strong>Fixing Schedules:</strong> Real-time date updates</li>
                              <li><strong>Barrier Tracking:</strong> KO/KI monitoring</li>
                            </ul>
                          </Card>
                        </Col>
                      </Row>
                    </div>
                  )
                }
              ]}
            />
            
            {/* <Alert
              message="📋 Comprehensive System Assumptions"
              // description="This enhanced scenario management system includes: Real-time market data integration, comprehensive audit trails, manual scenario editing, backtesting with lifecycle data, and responsive design. All assumptions are based on Murex payload data and industry best practices for testing purposes. Actual market conditions may vary significantly from these assumptions."
              type="info"
              showIcon
              style={{ marginTop: "16px" }}
            /> */}
          </Card>
        </TabPane>

        {/* Scenario History & Audit Trail Tab */}
        <TabPane 
          tab={
            <Space>
              <HistoryOutlined />
              <span>📊 Scenario History</span>
              {scenarioHistory.length > 0 && (
                <Badge 
                  count={scenarioHistory.length} 
                  style={{ backgroundColor: 'var(--success)', color: 'white' }}
                  title={`${scenarioHistory.length} executed scenarios`}
                />
              )}
            </Space>
          } 
          key="history"
        >
          <Card title="📊 Scenario Execution History & Audit Trail" style={{ marginBottom: "24px" }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={6}>
                <Card size="small" title="🔍 Filters">
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div>
                      <strong>Search:</strong>
                      <Input
                        placeholder="Search scenarios..."
                        value={historyFilters.searchTerm}
                        onChange={(e) => setHistoryFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                        allowClear
                        prefix={<SearchOutlined />}
                      />
                    </div>
                    <div>
                      <strong>Scenario Type:</strong>
                      <Select
                        style={{ width: "100%" }}
                        placeholder="All Types"
                        value={historyFilters.scenarioType}
                        onChange={(value) => setHistoryFilters(prev => ({ ...prev, scenarioType: value }))}
                        allowClear
                      >
                        <Option value="equity">Equity</Option>
                        <Option value="rates">Interest Rates</Option>
                        <Option value="fx">FX</Option>
                        <Option value="volatility">Volatility</Option>
                        <Option value="credit">Credit</Option>
                        <Option value="stress-test">Stress Test</Option>
                        <Option value="monte-carlo">Monte Carlo</Option>
                        <Option value="custom">Custom</Option>
                        <Option value="backtesting">Backtesting</Option>
                      </Select>
                    </div>
                    <div>
                      <strong>Scope:</strong>
                      <Select
                        style={{ width: "100%" }}
                        placeholder="All Scopes"
                        value={historyFilters.assetFilter}
                        onChange={(value) => setHistoryFilters(prev => ({ ...prev, assetFilter: value }))}
                        allowClear
                      >
                        <Option value="portfolio">Portfolio-wide</Option>
                        <Option value="single">Single Asset</Option>
                      </Select>
                    </div>
                    <Button 
                      type="primary" 
                      icon={<DownloadOutlined />}
                      onClick={() => exportScenarioHistory()}
                      disabled={scenarioHistory.length === 0}
                    >
                      Export History
                    </Button>
                    <Button 
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => clearScenarioHistory()}
                      disabled={scenarioHistory.length === 0}
                    >
                      Clear History
                    </Button>
                  </Space>
                </Card>
              </Col>
              
              <Col xs={24} lg={18}>
                <Card size="small" title={`📈 Execution Summary (${filteredHistory.length} scenarios)`}>
                  <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
                    <Col span={6}>
                      <Statistic
                        title="Total Executions"
                        value={scenarioHistory.length}
                        prefix={<PlayCircleOutlined />}
                        valueStyle={{ color: 'var(--primary)' }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="This Week"
                        value={getWeeklyExecutions()}
                        prefix={<CalendarOutlined />}
                        valueStyle={{ color: 'var(--success)' }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="Most Used Type"
                        value={getMostUsedScenarioType()}
                        valueStyle={{ color: '#faad14' }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="Avg Impact"
                        value={`$${getAverageImpact().toLocaleString()}`}
                        prefix={<DollarOutlined />}
                        valueStyle={{ color: '#f5222d' }}
                      />
                    </Col>
                  </Row>
                </Card>
                
                <div style={{ maxHeight: "600px", overflow: "auto" }}>
                  {filteredHistory.length === 0 ? (
                    <Card style={{ textAlign: 'center', padding: '40px' }}>
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                          <span>
                            {scenarioHistory.length === 0 
                              ? "No scenarios executed yet. Run your first scenario to see it here!"
                              : "No scenarios match your current filters."
                            }
                          </span>
                        }
                      />
                    </Card>
                  ) : (
                    <Table
                      size="small"
                      dataSource={filteredHistory}
                      pagination={{ pageSize: 10, showSizeChanger: true }}
                      rowKey="id"
                      expandable={{
                        expandedRowRender: (record) => {
                          const isBacktesting = record.scenarioType === 'backtesting';
                          const isManualEdit = record.scenarioType === 'manual-edit';
                          
                          return (
                            <Card size="small" title="📋 Detailed Scenario Parameters">
                              <Row gutter={[16, 8]}>
                                <Col span={12}>
                                  <strong>Scenario ID:</strong> {record.id}
                                </Col>
                                <Col span={12}>
                                  <strong>Timestamp:</strong> {new Date(record.timestamp).toLocaleString()}
                                </Col>
                                {!isBacktesting && !isManualEdit && (
                                  <Col span={12}>
                                    <strong>Shock Value:</strong> {
                                      record.shockValue && typeof record.shockValue === 'number' 
                                        ? `${(record.shockValue * 100).toFixed(2)}%` 
                                        : record.shockValue || 'N/A'
                                    }
                                  </Col>
                                )}
                                {isManualEdit && (
                                  <Col span={12}>
                                    <strong>Edit Type:</strong> {record.shockValue || 'Manual Edit'}
                                  </Col>
                                )}
                                <Col span={12}>
                                  <strong>Assets Analyzed:</strong> {record.assetsAnalyzed || record.results?.length || 0}
                                </Col>
                                <Col span={12}>
                                  <strong>Total Impact:</strong> ${record.totalImpact?.toLocaleString() || '0'}
                                </Col>
                                <Col span={12}>
                                  <strong>Scope:</strong> {record.scope || record.scenarioScope || 'N/A'}
                                </Col>
                                {record.selectedAsset && (
                                  <Col span={12}>
                                    <strong>Selected Asset:</strong> {record.selectedAsset}
                                  </Col>
                                )}
                                
                                {isManualEdit && record.metadata && (
                                  <>
                                    <Col span={12}>
                                      <strong>Edited Asset:</strong> {record.metadata.editedAsset || 'N/A'}
                                    </Col>
                                    <Col span={12}>
                                      <strong>Original Price:</strong> ${record.metadata.usesEditedData ? record.metadata.editedPrice?.toFixed(2) : record.metadata.originalPrice?.toFixed(2) || 'N/A'}
                                      {record.metadata.usesEditedData && (
                                        <Tag color="blue" style={{ marginLeft: 8 }}>
                                          Edited
                                        </Tag>
                                      )}
                                    </Col>
                                    <Col span={12}>
                                      <strong>New Price:</strong> ${record.metadata.newPrice?.toFixed(2) || 'N/A'}
                                    </Col>
                                    <Col span={24}>
                                      <strong>Edited Fields:</strong> {record.metadata.editedFields?.join(', ') || 'N/A'}
                                    </Col>
                                    {record.metadata.combinedScenarioName && (
                                      <Col span={24}>
                                        <strong>Combined Scenario:</strong> {record.metadata.combinedScenarioName}
                                      </Col>
                                    )}
                                  </>
                                )}
                                
                                {isBacktesting && record.backtestMetadata && (
                                  <>
                                    <Col span={12}>
                                      <strong>Start Date:</strong> {record.backtestMetadata.startDate}
                                    </Col>
                                    <Col span={12}>
                                      <strong>End Date:</strong> {record.backtestMetadata.endDate}
                                    </Col>
                                    <Col span={12}>
                                      <strong>Period:</strong> {record.backtestMetadata.period}
                                    </Col>
                                    <Col span={12}>
                                      <strong>Custom Scenario:</strong> {record.backtestMetadata.isCustomScenario ? 'Yes' : 'No'}
                                    </Col>
                                    {record.backtestMetadata.selectedDeal && (
                                      <Col span={12}>
                                        <strong>Selected Deal:</strong> {record.backtestMetadata.selectedDeal}
                                      </Col>
                                    )}
                                    {record.backtestMetadata.customConditions && (
                                      <Col span={24}>
                                        <strong>Custom Market Conditions:</strong>
                                        <div style={{ marginTop: '4px', padding: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px' }}>
                                          <div>Equity: {record.backtestMetadata.customConditions.equityDecline}%</div>
                                          <div>Volatility: +{record.backtestMetadata.customConditions.volatilitySpike}%</div>
                                          <div>Rates: {record.backtestMetadata.customConditions.rateCuts}bps</div>
                                          <div>Credit: +{record.backtestMetadata.customConditions.creditWidening}bps</div>
                                        </div>
                                      </Col>
                                    )}
                                  </>
                                )}
                                
                                <Col span={24}>
                                  <strong>Results Summary:</strong>
                                  {record.results && record.results.length > 0 ? (
                                    <Table
                                      size="small"
                                      dataSource={record.results}
                                      pagination={{
                                        pageSize: 5,
                                        showSizeChanger: true,
                                        showQuickJumper: true,
                                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} results`,
                                        pageSizeOptions: ['3', '5', '10', '20'],
                                        size: 'small'
                                      }}
                                      style={{
                                        backgroundColor: 'var(--bg-secondary)',
                                        borderColor: 'var(--border-primary)'
                                      }}
                                      className="dark-theme-table"
                                      columns={isBacktesting ? [
                                        { 
                                          title: 'Date', 
                                          dataIndex: 'date', 
                                          key: 'date',
                                          render: (value) => (
                                            <span style={{ color: 'var(--text-primary)' }}>
                                              {value || 'N/A'}
                                            </span>
                                          )
                                        },
                                        { 
                                          title: 'P&L', 
                                          dataIndex: 'pnl', 
                                          key: 'pnl', 
                                          render: (value) => (
                                            <span style={{ 
                                              color: value >= 0 ? 'var(--success)' : 'var(--error)',
                                              fontWeight: 'bold'
                                            }}>
                                              ${value ? Number(value).toLocaleString() : '0'}
                                            </span>
                                          )
                                        },
                                        { 
                                          title: 'Cumulative P&L', 
                                          dataIndex: 'cumulativePnl', 
                                          key: 'cumulativePnl', 
                                          render: (value) => (
                                            <span style={{ 
                                              color: value >= 0 ? 'var(--success)' : 'var(--error)',
                                              fontWeight: 'bold'
                                            }}>
                                              ${value ? Number(value).toLocaleString() : '0'}
                                            </span>
                                          )
                                        },
                                        { 
                                          title: 'Market Condition', 
                                          dataIndex: 'marketCondition', 
                                          key: 'marketCondition',
                                          render: (value) => (
                                            <Tag 
                                              color={value && value !== 'N/A' ? 'blue' : 'default'} 
                                              style={{ 
                                                color: value && value !== 'N/A' ? 'white' : 'var(--text-primary)',
                                                backgroundColor: value && value !== 'N/A' ? 'var(--primary)' : 'var(--bg-tertiary)',
                                                borderColor: 'var(--border-primary)'
                                              }}
                                            >
                                              {value || 'N/A'}
                                            </Tag>
                                          )
                                        }
                                      ] : [
                                        { 
                                          title: 'Asset', 
                                          dataIndex: 'asset', 
                                          key: 'asset',
                                          render: (value) => (
                                            <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>
                                              {value || 'N/A'}
                                            </span>
                                          )
                                        },
                                        { 
                                          title: 'Impact', 
                                          dataIndex: 'impact', 
                                          key: 'impact', 
                                          render: (value) => (
                                            <span style={{ 
                                              color: value >= 0 ? 'var(--success)' : 'var(--error)',
                                              fontWeight: 'bold'
                                            }}>
                                              ${value ? Number(value).toLocaleString() : '0'}
                                            </span>
                                          )
                                        },
                                        { 
                                          title: 'Shock', 
                                          dataIndex: 'shock', 
                                          key: 'shock', 
                                          render: (value) => (
                                            <Tag color={value >= 0 ? 'red' : 'green'}>
                                              {value ? `${(Number(value) * 100).toFixed(2)}%` : 'N/A'}
                                            </Tag>
                                          )
                                        }
                                      ]}
                                    />
                                  ) : (
                                    <div style={{ 
                                      padding: '16px', 
                                      textAlign: 'center', 
                                      color: 'var(--text-secondary)',
                                      backgroundColor: 'var(--bg-secondary)',
                                      borderRadius: '6px',
                                      border: '1px solid var(--border-primary)'
                                    }}>
                                      No results data available
                                    </div>
                                  )}
                                </Col>
                              </Row>
                            </Card>
                          );
                        },
                        rowExpandable: () => true,
                      }}
                      columns={[
                        {
                          title: 'Timestamp',
                          dataIndex: 'timestamp',
                          key: 'timestamp',
                          width: 180,
                          render: (timestamp) => (
                            <div>
                              <div>{new Date(timestamp).toLocaleDateString()}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                                {new Date(timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                          ),
                          sorter: (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
                          defaultSortOrder: 'descend' as const,
                        },
                        {
                          title: 'Scenario',
                          dataIndex: 'scenarioName',
                          key: 'scenarioName',
                          width: 200,
                          render: (name, record) => (
                            <div>
                              <div style={{ fontWeight: 'bold' }}>{name}</div>
                              <Tag color={getScenarioTypeColor(record.scenarioType)}>
                                {record.scenarioType.toUpperCase()}
                              </Tag>
                            </div>
                          ),
                        },
                        {
                          title: 'Scope',
                          dataIndex: 'scenarioScope',
                          key: 'scenarioScope',
                          width: 100,
                          render: (scope) => (
                            <Tag color={scope === 'portfolio' ? 'blue' : 'green'}>
                              {scope === 'portfolio' ? 'Portfolio' : 'Single'}
                            </Tag>
                          ),
                        },
                        {
                          title: 'Asset',
                          dataIndex: 'selectedAsset',
                          key: 'selectedAsset',
                          width: 150,
                          render: (asset) => asset || 'All Assets',
                        },
                        {
                          title: 'Shock',
                          dataIndex: 'shockValue',
                          key: 'shockValue',
                          width: 80,
                          render: (value, record) => {
                            if (record.scenarioType === 'backtesting') {
                              return <Tag color="magenta">Backtest</Tag>;
                            }
                            return value ? `${(value * 100).toFixed(1)}%` : 'N/A';
                          },
                          sorter: (a, b) => {
                            if (a.scenarioType === 'backtesting' || b.scenarioType === 'backtesting') return 0;
                            return (a.shockValue || 0) - (b.shockValue || 0);
                          },
                        },
                        {
                          title: 'Total Impact',
                          dataIndex: 'totalImpact',
                          key: 'totalImpact',
                          width: 120,
                          render: (value) => (
                            <span style={{ color: value < 0 ? '#f5222d' : '#52c41a' }}>
                              ${value.toLocaleString()}
                            </span>
                          ),
                          sorter: (a, b) => a.totalImpact - b.totalImpact,
                        },
                        {
                          title: 'Actions',
                          key: 'actions',
                          width: 100,
                          render: (_, record) => (
                            <Space>
                              <Tooltip title="View Details">
                                <Button 
                                  type="link" 
                                  icon={<EyeOutlined />}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('Button clicked for record:', record?.id);
                                    viewScenarioDetails(record);
                                  }}
                                  style={{ 
                                    color: 'var(--text-primary)',
                                    border: 'none',
                                    background: 'transparent'
                                  }}
                                />
                              </Tooltip>
                              <Tooltip title="Re-run Scenario">
                                <Button 
                                  type="link" 
                                  icon={<ReloadOutlined />}
                                  onClick={() => rerunScenario(record)}
                                />
                              </Tooltip>
                            </Space>
                          ),
                        },
                      ]}
                    />
                  )}
                </div>
              </Col>
            </Row>
          </Card>
        </TabPane>
      </Tabs>

      {/* Add Position Modal */}
      <Modal
        title="Add New Position with Risk Factors"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={addPosition}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item 
                name="asset" 
                label="Asset Symbol" 
                rules={[{ required: true, message: 'Please enter asset symbol' }]}
              >
                <Input placeholder="e.g. AAPL, TSLA, MSFT" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="instrumentType" 
                label="Instrument Type" 
                rules={[{ required: true, message: 'Please select instrument type' }]}
                initialValue="equity"
              >
                <Select>
                  <Select.Option value="equity">Equity</Select.Option>
                  <Select.Option value="bond">Bond</Select.Option>
                  <Select.Option value="option">Option</Select.Option>
                  <Select.Option value="swap">Swap</Select.Option>
                  <Select.Option value="fx-forward">FX Forward</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="quantity" 
                label="Quantity" 
                rules={[{ required: true, message: 'Please enter quantity' }]}
              >
                <InputNumber min={1} style={{ width: "100%" }} placeholder="Number of shares/units" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="price" 
                label="Current Price ($)" 
                rules={[{ required: true, message: 'Please enter current price' }]}
              >
                <InputNumber min={0.01} step={0.01} style={{ width: "100%" }} placeholder="Price per share/unit" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <div style={{ padding: "16px", background: "var(--bg-secondary)", borderRadius: "6px", marginTop: "30px" }}>
                <strong>Risk Factors (Greeks)</strong>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  These will be auto-calculated based on instrument type, or you can override them
                </div>
              </div>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item 
                name="delta" 
                label="Delta (Price Sensitivity)"
              >
                <InputNumber step={0.1} style={{ width: "100%" }} placeholder="Auto-calculated" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item 
                name="gamma" 
                label="Gamma (Delta Sensitivity)"
              >
                <InputNumber step={0.01} style={{ width: "100%" }} placeholder="Auto-calculated" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item 
                name="duration" 
                label="Duration (Rate Sensitivity)"
              >
                <InputNumber step={0.1} style={{ width: "100%" }} placeholder="Auto-calculated" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item 
                name="convexity" 
                label="Convexity"
              >
                <InputNumber step={1} style={{ width: "100%" }} placeholder="Auto-calculated" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item 
                name="vega" 
                label="Vega (Vol Sensitivity)"
              >
                <InputNumber step={0.1} style={{ width: "100%" }} placeholder="Auto-calculated" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item 
                name="theta" 
                label="Theta (Time Decay)"
              >
                <InputNumber step={0.001} style={{ width: "100%" }} placeholder="Auto-calculated" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Alert
                message="Risk Factor Guidelines"
                description={
                  <ul style={{ margin: 0, paddingLeft: "16px" }}>
                    <li><strong>Equity:</strong> Delta=1.0, others=0</li>
                    <li><strong>Bond:</strong> Duration=3-5, Convexity=15-25</li>
                    <li><strong>Option:</strong> Delta=0.3-0.7, Gamma=0.05-0.2, Vega=5-15, Theta=-0.01 to -0.05</li>
                  </ul>
                }
                type="info"
              />
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Enhanced Market Data Modal with Tabs */}
      <Modal
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div>
              <strong>📊 Market Data - {selectedAssetData?.asset || 'Asset'}</strong>
              <div style={{ fontSize: '14px', fontWeight: 'normal', marginTop: '4px', color: 'var(--text-secondary)' }}>
                {selectedAssetData?.instrumentName || 'Instrument Name'}
              </div>
            </div>
            {!isEditMode && (
              <Button 
                type="primary" 
                icon={<ExperimentOutlined />}
                onClick={enterEditMode}
                style={{ marginLeft: '16px' }}
              >
                Edit Mode
              </Button>
            )}
            {isEditMode && (
              <Tag color="orange" style={{ marginLeft: '16px' }}>✏️ Edit Mode Active</Tag>
            )}
          </div>
        }
        open={isDataModalOpen}
        onCancel={() => {
          setIsDataModalOpen(false);
          setIsEditMode(false);
          setIsMarketDataModalEditable(false);
          setScenarioName("");
          setHasMarketDataChanges(false);
        }}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsDataModalOpen(false)}>
                Close
              </Button>
              {!isEditMode && (
                <Button 
                  type="default" 
                  icon={<ExperimentOutlined />}
                  onClick={() => {
                    // Always capture current market data for scenarios
                    if (selectedAsset && selectedAssetData) {
                      const currentData = {
                        scenarioName: `Manual_${selectedAsset.asset}_${new Date().toISOString().slice(0, 10)}`,
                        asset: selectedAsset.asset,
                        marketData: selectedAssetData,
                        timestamp: new Date().toISOString(),
                        isManualEdit: true
                      };
                      
                      // Save to session storage for scenario analysis
                      sessionStorage.setItem('editedMarketData', JSON.stringify(currentData));
                      console.log('Captured market data for scenarios:', currentData);
                    }
                    
                    // Close the modal and navigate to scenarios tab
                    setIsDataModalOpen(false);
                    
                    // Switch to scenarios tab
                    const scenariosTab = document.querySelector('[data-node-key="scenarios"]') as HTMLElement;
                    if (scenariosTab) scenariosTab.click();
                    
                    // Show message about data being available for scenarios
                    Modal.info({
                      title: 'Navigate to Scenarios',
                      content: `Market data for ${selectedAsset?.asset} has been captured and is ready for scenario analysis. You can now run simulations with this data.`,
                      okText: 'Go to Scenarios',
                      className: 'dark-theme-modal',
                      style: {
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)'
                      },
                      bodyStyle: {
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)'
                      }
                    });
                  }}
                >
                  Go to Scenarios
                </Button>
              )}
              {isEditMode && (
                <Button onClick={exitEditMode}>
                  Cancel Edit
                </Button>
              )}
              {isEditMode && (
                <Button 
                  type="default" 
                  icon={<ExperimentOutlined />}
                  onClick={() => {
                    // Always capture current market data for scenarios
                    if (selectedAsset && selectedAssetData) {
                      const currentData = {
                        scenarioName: scenarioName || `Manual_${selectedAsset.asset}_${new Date().toISOString().slice(0, 10)}`,
                        asset: selectedAsset.asset,
                        marketData: selectedAssetData,
                        timestamp: new Date().toISOString(),
                        isManualEdit: true
                      };
                      
                      // Save to session storage for scenario analysis
                      sessionStorage.setItem('editedMarketData', JSON.stringify(currentData));
                      console.log('Captured market data for scenarios:', currentData);
                    }
                    
                    // Close the modal and navigate to scenarios tab
                    setIsDataModalOpen(false);
                    setIsEditMode(false);
                    setIsMarketDataModalEditable(false);
                    
                    // Switch to scenarios tab
                    const scenariosTab = document.querySelector('[data-node-key="scenarios"]') as HTMLElement;
                    if (scenariosTab) scenariosTab.click();
                    
                    // Show message about data being available for scenarios
                    Modal.info({
                      title: 'Navigate to Scenarios',
                      content: `Market data for ${selectedAsset?.asset} has been captured and is ready for scenario analysis. You can now run simulations with this data.`,
                      okText: 'Go to Scenarios',
                      className: 'dark-theme-modal',
                      style: {
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)'
                      },
                      bodyStyle: {
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)'
                      }
                    });
                  }}
                >
                  Go to Scenarios
                </Button>
              )}
            </Space>
          </div>
        }
        width={1200}
      >
        {selectedAssetData && (
          <div>
            {/* Scenario Name Input - Only visible in edit mode */}
            {isEditMode && (
              <Card size="small" style={{ marginBottom: "16px" }}>
                <Form layout="inline">
                  <Form.Item label="Scenario Name" required>
                    <Input
                      placeholder="Enter scenario name (e.g., 'Market Crash Test')"
                      value={scenarioName}
                      onChange={(e) => setScenarioName(e.target.value)}
                      style={{ width: "300px" }}
                    />
                  </Form.Item>
                  <Form.Item>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                      Enter a name for your scenario
                    </span>
                  </Form.Item>
                </Form>
              </Card>
            )}

            {/* Market Data Changes Alert - Only show in edit mode */}
            {isEditMode && hasMarketDataChanges && (
              <div style={{ 
                marginBottom: '16px', 
                padding: '12px', 
                backgroundColor: 'var(--success-light)', 
                borderRadius: '6px',
                border: '1px solid var(--success)',
                color: 'var(--text-primary)'
              }}>
                <Space>
                  <Tag 
                    color="success" 
                    icon={<ExperimentOutlined />}
                    style={{
                      backgroundColor: 'var(--success)',
                      color: 'white',
                      border: 'none'
                    }}
                  >
                    Changes Detected - Ready to Run Scenario
                  </Tag>
                  {/* <Button
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      setHasMarketDataChanges(false);
                      if (selectedAsset) {
                        setSelectedAssetData(getAssetMarketData(selectedAsset.asset, selectedAsset));
                      }
                    }}
                    style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
                  >
                    Reset Changes
                  </Button> */}
                </Space>
              </div>
            )}

            {/* Header Info */}
            <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
              <Col span={8}>
                <Card size="small" title="Asset Information">
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div><strong>Symbol:</strong> {selectedAssetData.asset}</div>
                    <div><strong>Type:</strong> <Tag color="blue">{selectedAssetData.type}</Tag></div>
                    <div><strong>Source:</strong> {selectedAssetData.source}</div>
                    <div><strong>Timestamp:</strong> {new Date(selectedAssetData.timestamp).toLocaleString()}</div>
                  </Space>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" title="Position Details">
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div><strong>Quantity:</strong> {selectedAssetData.position.quantity.toLocaleString()}</div>
                    <div><strong>Price:</strong> ${selectedAssetData.position.price.toFixed(2)}</div>
                    <div><strong>Value:</strong> ${(selectedAssetData.position.price * selectedAssetData.position.quantity).toLocaleString()}</div>
                    <div><strong>Instrument:</strong> {selectedAssetData.position.instrumentType}</div>
                  </Space>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" title="Risk Factors">
                  <Row gutter={[8, 8]}>
                    <Col span={12}>
                      <div><strong>Delta:</strong> {selectedAssetData.position.riskFactors.delta?.toFixed(2) || '0.00'}</div>
                      <div><strong>Gamma:</strong> {selectedAssetData.position.riskFactors.gamma?.toFixed(2) || '0.00'}</div>
                    </Col>
                    <Col span={12}>
                      <div><strong>Duration:</strong> {selectedAssetData.position.riskFactors.duration?.toFixed(2) || '0.00'}</div>
                      <div><strong>Vega:</strong> {selectedAssetData.position.riskFactors.vega?.toFixed(2) || '0.00'}</div>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>

            {/* Tabbed Market Data Interface */}
            <Tabs defaultActiveKey="equity" size="small">
              {/* Equity Tab */}
              <TabPane tab="📈 Equity" key="equity">
                <Card title="Equity Market Data" size="small">
                  <div style={{ marginBottom: "16px" }}>
                    <strong>Asset:</strong> {selectedAssetData.marketData.symbol || 'N/A'} | 
                    <strong> Currency:</strong> {selectedAssetData.marketData.currency || 'N/A'}
                  </div>
                  <div style={{ maxHeight: "400px", overflow: "auto", border: "1px solid var(--border-primary)", borderRadius: "6px" }}>
                    <Table
                      size="small"
                      pagination={false}
                      className="dark-theme-table"
                      dataSource={[
                        { key: 'spot', field: 'Spot Price', value: selectedAssetData.marketData.spot, prefix: '$', editable: true },
                        { key: 'bid', field: 'Bid', value: selectedAssetData.marketData.bid, prefix: '$', editable: true },
                        { key: 'ask', field: 'Ask', value: selectedAssetData.marketData.ask, prefix: '$', editable: true },
                        { key: 'spread', field: 'Spread', value: selectedAssetData.marketData.spread, prefix: '$', editable: false },
                        { key: 'dealSpot', field: 'Deal Spot', value: selectedAssetData.marketData.dealSpot, prefix: '$', editable: true },
                        { key: 'notional', field: 'Notional', value: selectedAssetData.marketData.notional, prefix: '$', editable: true, format: 'number' },
                        ...(selectedAssetData.marketData.dealSpot1 ? [{ key: 'dealSpot1', field: 'Deal Spot 2', value: selectedAssetData.marketData.dealSpot1, prefix: '$', editable: true }] : [])
                      ]}
                      columns={[
                        { 
                          title: 'Field', 
                          dataIndex: 'field', 
                          key: 'field', 
                          width: 150,
                          render: (text: string) => <strong>{text}</strong>
                        },
                        { 
                          title: 'Value', 
                          dataIndex: 'value', 
                          key: 'value', 
                          width: 200,
                          render: (value: any, record: any) => {
                            if (!isMarketDataModalEditable || !record.editable) {
                              // Display mode
                              if (record.format === 'number' && value) {
                                return <span>{record.prefix}{value.toLocaleString()}</span>;
                              }
                              return <span>{record.prefix}{value || 'N/A'}</span>;
                            }
                            
                            // Edit mode
                            if (record.format === 'number') {
                              return (
                                <InputNumber
                                  size="small"
                                  value={value}
                                  onChange={(val) => updateEquityMarketData(record.key, val)}
                                  style={{ width: '150px' }}
                                  precision={2}
                                  prefix={record.prefix}
                                  min={0}
                                />
                              );
                            }
                            
                            return (
                              <InputNumber
                                size="small"
                                value={value}
                                onChange={(val) => updateEquityMarketData(record.key, val)}
                                style={{ width: '150px' }}
                                precision={2}
                                prefix={record.prefix}
                              />
                            );
                          }
                        }
                      ]}
                    />
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "8px" }}>
                    <strong>Note:</strong> {isEditMode ? 
                      'Values are editable. Enter a scenario name, make changes, and click "Run Manual Scenario" to execute.' : 
                      'Click "Edit Mode" to start editing values.'
                    }
                  </div>
                </Card>
              </TabPane>

              {/* Volatility Surface Tab */}
              <TabPane tab="📊 Volatility" key="volatility">
                {selectedAssetData.volatility && selectedAssetData.volatility.volMatrix.length > 0 ? (
                  <Card title="Volatility Surface Matrix" size="small">
                    <div style={{ marginBottom: "16px" }}>
                      <strong>ATM Volatility:</strong> {selectedAssetData.volatility.atmVol} | 
                      <strong> Surface Size:</strong> {selectedAssetData.volatility.surfaceSize}
                      <Button 
                        type="text" 
                        size="small" 
                        icon={<InfoCircleOutlined />}
                        style={{ marginLeft: "8px" }}
                        onClick={() => {
                          Modal.info({
                            title: 'Volatility Color Coding',
                            content: (
                              <div>
                                <p><strong>Color Coding for Volatility Values:</strong></p>
                                <ul>
                                  <li><span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>🔴 Red:</span> High volatility ({'>'}$50)</li>
                                  <li><span style={{ color: '#faad14', fontWeight: 'bold' }}>🟡 Yellow:</span> Medium volatility ($40-$50)</li>
                                  <li><span style={{ color: 'var(--success)', fontWeight: 'bold' }}>🟢 Green:</span> Low volatility ({'<'}$40)</li>
                                </ul>
                                <p><em>Values shown are in USD amounts from the Murex payload.</em></p>
                              </div>
                            ),
                            width: 400,
                            className: 'dark-theme-modal',
                            style: {
                              backgroundColor: 'var(--bg-primary)',
                              color: 'var(--text-primary)'
                            },
                            bodyStyle: {
                              backgroundColor: 'var(--bg-primary)',
                              color: 'var(--text-primary)'
                            }
                          });
                        }}
                      />
                    </div>
                    <div style={{ maxHeight: "500px", overflow: "auto", border: "1px solid var(--border-primary)", borderRadius: "6px" }}>
                      <Table
                        size="small"
                        pagination={false}
                        scroll={{ x: 800, y: 400 }}
                        className="dark-theme-table"
                        dataSource={selectedAssetData.volatility.strikes.map((strike: number, strikeIndex: number) => {
                          const rowData: any = { key: strikeIndex, strike: `$${strike.toFixed(2)}` };
                          selectedAssetData.volatility.maturities.forEach((_: any, maturityIndex: number) => {
                            rowData[`maturity_${maturityIndex}`] = "$" + selectedAssetData.volatility.volMatrix[maturityIndex][strikeIndex].toFixed(2);
                          });
                          return rowData;
                        })}
                        columns={[
                          {
                            title: 'Strike',
                            dataIndex: 'strike',
                            key: 'strike',
                            width: 100,
                            fixed: 'left',
                            render: (text: string) => <strong>{text}</strong>
                          },
                          ...selectedAssetData.volatility.maturities.map((maturity: number, index: number) => {
                            const excelDate = maturity;
                            const date = new Date((excelDate - 25569) * 86400 * 1000);
                            const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                            
                            return {
                              title: dateStr,
                              dataIndex: `maturity_${index}`,
                              key: `maturity_${index}`,
                              width: 90,
                              align: 'center' as const,
                              render: (value: string, _record: any, rowIndex: number) => {
                                const numericValue = parseFloat(value.replace('$', ''));
                                
                                if (isMarketDataModalEditable) {
                                  return (
                                    <InputNumber
                                      size="small"
                                      value={numericValue}
                                      onChange={(val) => updateVolatilityData(rowIndex, index, val || 0)}
                                      style={{ width: '80px' }}
                                      precision={2}
                                      prefix="$"
                                      min={0}
                                      max={1000}
                                    />
                                  );
                                }
                                
                                return (
                                  <span style={{ 
                                    fontSize: "11px",
                                    color: numericValue > 50 ? '#ff4d4f' : numericValue > 40 ? '#faad14' : '#52c41a'
                                  }}>
                                    {value}
                                  </span>
                                );
                              }
                            };
                          })
                        ]}
                      />
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "8px" }}>
                      Showing all {selectedAssetData.volatility.strikes.length} strikes × {selectedAssetData.volatility.maturities.length} maturities
                    </div>
                  </Card>
                ) : (
                  <Card title="Volatility Surface" size="small">
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-tertiary)' }}>
                      No volatility surface data available for this asset
                    </div>
                  </Card>
                )}
              </TabPane>

              {/* Interest Rates Tab */}
              <TabPane tab="📈 Interest Rates" key="rates">
                <Card title="USD Yield Curve" size="small">
                  <div style={{ marginBottom: "16px" }}>
                    <strong>Currency:</strong> {selectedAssetData.interestRates?.currency || 'USD'} | 
                    <strong> Curve Points:</strong> {selectedAssetData.interestRates?.curve?.length || 0}
                  </div>
                  <div style={{ maxHeight: "400px", overflow: "auto", border: "1px solid var(--border-primary)", borderRadius: "6px" }}>
                    <Table
                      size="small"
                      pagination={false}
                      className="dark-theme-table"
                      dataSource={selectedAssetData.interestRates?.curve?.map((ratePoint: any, index: number) => {
                        const excelDate = ratePoint.date;
                        const date = new Date((excelDate - 25569) * 86400 * 1000);
                        const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                        
                        const now = new Date();
                        const diffTime = date.getTime() - now.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        return {
                          key: index,
                          date: dateStr,
                          excelDate: ratePoint.date,
                          rate: (ratePoint.rate * 100).toFixed(4) + '%',
                          tenor: (() => {
                            if (diffDays <= 30) return '1M';
                            if (diffDays <= 90) return '3M';
                            if (diffDays <= 180) return '6M';
                            if (diffDays <= 365) return '1Y';
                            if (diffDays <= 1095) return '3Y';
                            if (diffDays <= 1825) return '5Y';
                            return `${Math.round(diffDays/365)}Y`;
                          })()
                        };
                      }) || []}
                      columns={[
                        { title: 'Date', dataIndex: 'date', key: 'date', width: 120 },
                        { title: 'Tenor', dataIndex: 'tenor', key: 'tenor', width: 80 },
                        { 
                          title: 'Rate', 
                          dataIndex: 'rate', 
                          key: 'rate', 
                          width: 100, 
                          align: 'right',
                          render: (value: string, record: any) => {
                            const numericValue = parseFloat(value.replace('%', ''));
                            
                            if (isMarketDataModalEditable) {
                              return (
                                <InputNumber
                                  size="small"
                                  value={numericValue}
                                  onChange={(val) => updateInterestRateData('USD', record.key, (val || 0) / 100)}
                                  style={{ width: '80px' }}
                                  precision={4}
                                  suffix="%"
                                  min={0}
                                  max={50}
                                />
                              );
                            }
                            
                            return <span>{value}</span>;
                          }
                        },
                        { title: 'Excel Date', dataIndex: 'excelDate', key: 'excelDate', width: 100 }
                      ]}
                    />
                  </div>
                </Card>
              </TabPane>

              {/* Correlation Tab */}
              <TabPane tab="🔗 Correlation" key="correlation">
                <Card title="Asset Correlation Matrix" size="small">
                  <div style={{ marginBottom: "16px" }}>
                    <strong>Asset:</strong> {selectedAssetData.correlation?.symbol || 'N/A'} | 
                    <strong> Self-Correlation:</strong> {selectedAssetData.correlation?.correlation || '1.00'}
                  </div>
                  <div style={{ maxHeight: "400px", overflow: "auto", border: "1px solid var(--border-primary)", borderRadius: "6px" }}>
                    <Table
                      size="small"
                      pagination={false}
                      className="dark-theme-table"
                      dataSource={(() => {
                        const currentAsset = selectedAssetData?.correlation?.symbol || 'TSM UN';
                        
                        return [
                          { key: '1', corrPair: `${currentAsset} - ${currentAsset}`, correlation: '1.000' },
                          { key: '2', corrPair: `${currentAsset} - TSM UN`, correlation: '0.680' },
                          { key: '3', corrPair: `${currentAsset} - AAPL UW`, correlation: '0.750' },
                          { key: '4', corrPair: `${currentAsset} - BABA UN`, correlation: '0.720' },
                          { key: '5', corrPair: `${currentAsset} - USD Rates`, correlation: '-0.320' },
                          { key: '6', corrPair: `${currentAsset} - VIX Index`, correlation: '-0.450' },
                          { key: '7', corrPair: `${currentAsset} - SPX Index`, correlation: '0.820' },
                          { key: '8', corrPair: `${currentAsset} - Gold`, correlation: '0.150' },
                          { key: '9', corrPair: `${currentAsset} - Oil`, correlation: '0.380' }
                        ];
                      })()}
                      columns={[
                        { title: 'CorrPair', dataIndex: 'corrPair', key: 'corrPair', width: 200 },
                        { 
                          title: 'Correlation', 
                          dataIndex: 'correlation', 
                          key: 'correlation', 
                          width: 120,
                          align: 'center' as const,
                          render: (value: string, record: any) => {
                            const numValue = parseFloat(value);
                            
                            if (isMarketDataModalEditable) {
                              return (
                                <InputNumber
                                  size="small"
                                  value={numValue}
                                  onChange={(val) => updateCorrelationDataInModal(parseInt(record.key) - 1, val || 0)}
                                  style={{ width: '80px' }}
                                  precision={3}
                                  min={-1}
                                  max={1}
                                  step={0.01}
                                />
                              );
                            }
                            
                            const color = numValue > 0.7 ? '#52c41a' : numValue > 0.3 ? '#faad14' : numValue > -0.3 ? '#1890ff' : '#ff4d4f';
                            return (
                              <span style={{ color, fontWeight: 'bold' }}>
                                {value}
                              </span>
                            );
                          }
                        }
                      ]}
                    />
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "8px" }}>
                    <strong>Color Coding:</strong> 
                    <span style={{ color: 'var(--success)', fontWeight: 'bold' }}> Green ({'>'}0.7)</span> | 
                    <span style={{ color: '#faad14', fontWeight: 'bold' }}> Yellow (0.3-0.7)</span> | 
                    <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}> Blue (-0.3-0.3)</span> | 
                    <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}> Red ({'<'}-0.3)</span>
                  </div>
                </Card>
              </TabPane>

              {/* Monte Carlo Tab */}
              <TabPane tab="🎲 Monte Carlo" key="monteCarlo">
                <Card title="Monte Carlo Parameters" size="small">
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <div><strong>Number of Paths:</strong> {selectedAssetData.monteCarlo?.numPaths?.toLocaleString() || 'N/A'}</div>
                    </Col>
                    <Col span={8}>
                      <div><strong>Regression Order:</strong> {selectedAssetData.monteCarlo?.regressionOrder || 'N/A'}</div>
                    </Col>
                    <Col span={8}>
                      <div><strong>Evaluation Date:</strong> {selectedAssetData.monteCarlo?.evaluationDate || 'N/A'}</div>
                    </Col>
                  </Row>
                </Card>
              </TabPane>

              {/* FX Tab */}
              <TabPane tab="💱 FX" key="fx">
                <Card title="Foreign Exchange Data" size="small">
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-tertiary)' }}>
                    <div>💱 FX rate data would be displayed here</div>
                    <div style={{ fontSize: '12px', marginTop: '8px' }}>
                      Currency pair rates from Murex payload
                    </div>
                  </div>
                </Card>
              </TabPane>
            </Tabs>

          </div>
        )}
      </Modal>
    </div>
  );
}


