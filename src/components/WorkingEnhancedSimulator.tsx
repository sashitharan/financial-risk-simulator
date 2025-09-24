import { useState } from "react";
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
  Alert
} from "antd";
import { 
  PlusOutlined, 
  DollarOutlined, 
  RiseOutlined, 
  FallOutlined,
  BarChartOutlined,
  LineChartOutlined,
  ThunderboltOutlined,
  ExperimentOutlined
} from "@ant-design/icons";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const { TabPane } = Tabs;

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
  riskMetrics: {
    delta: number;
    gamma: number;
    duration: number;
    convexity: number;
    vega: number;
    theta: number;
  };
};

export default function WorkingEnhancedSimulator() {
  const [positions, setPositions] = useState<Position[]>([
    {
      key: "1",
      asset: "AAPL",
      quantity: 100000,
      price: 200,
      instrumentType: "equity",
      riskFactors: {
        delta: 1.0,
        gamma: 0.0,
        duration: 0.0,
        convexity: 0.0,
        vega: 0.0,
        theta: 0.0
      }
    },
    {
      key: "2", 
      asset: "TSLA",
      quantity: 50000,
      price: 250,
      instrumentType: "equity",
      riskFactors: {
        delta: 1.0,
        gamma: 0.0,
        duration: 0.0,
        convexity: 0.0,
        vega: 0.0,
        theta: 0.0
      }
    },
    {
      key: "3",
      asset: "USD_10Y_BOND",
      quantity: 1000000,
      price: 100,
      instrumentType: "bond",
      riskFactors: {
        delta: 0.0,
        gamma: 0.0,
        duration: 4.0,
        convexity: 20.0,
        vega: 0.0,
        theta: 0.0
      }
    },
    {
      key: "4",
      asset: "SPX_OPTION",
      quantity: 1000,
      price: 15,
      instrumentType: "option",
      riskFactors: {
        delta: 0.5,
        gamma: 0.1,
        duration: 0.0,
        convexity: 0.0,
        vega: 10.0,
        theta: -0.02
      }
    }
  ]);

  const [selectedScenario, setSelectedScenario] = useState(ALL_SCENARIOS[0]);
  const [customShock, setCustomShock] = useState<number>(0);
  const [results, setResults] = useState<Result[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const runSimulation = () => {
    console.log('Running enhanced simulation with scenario:', selectedScenario.name);
    
    const shock = selectedScenario.name === "Custom" ? customShock / 100 : selectedScenario.shock;
    
    // Enhanced calculation with OpenGamma Strata-inspired risk factor modeling
    const calc = positions.map((pos) => {
      let shockedPrice = pos.price;
      let shockValue = shock;
      let riskMetrics = { ...pos.riskFactors };
      
      // Apply different shock logic based on scenario category and instrument type
      switch (selectedScenario.category) {
        case 'equity':
          // Equity price shocks with delta and gamma effects
          const equityShock = shock;
          const deltaEffect = (pos.riskFactors.delta || 0) * equityShock;
          const gammaEffect = 0.5 * (pos.riskFactors.gamma || 0) * equityShock * equityShock;
          shockedPrice = pos.price * (1 + deltaEffect + gammaEffect);
          break;
          
        case 'fx':
          // FX shocks affect price directly
          shockedPrice = pos.price * (1 + shock);
          break;
          
        case 'rates':
          // Interest rate shocks with duration and convexity effects
          const rateShock = shock;
          const durationEffect = -(pos.riskFactors.duration || 0) * rateShock;
          const convexityEffect = 0.5 * (pos.riskFactors.convexity || 0) * rateShock * rateShock;
          shockedPrice = pos.price * (1 + durationEffect + convexityEffect);
          break;
          
        case 'volatility':
          // Volatility shocks with vega effects
          const volShock = shock;
          const vegaEffect = (pos.riskFactors.vega || 0) * volShock * 0.01; // 1% vol change
          shockedPrice = pos.price * (1 + vegaEffect);
          break;
          
        case 'credit':
          // Credit shocks affect bond-like instruments
          const creditShock = shock;
          const creditDuration = pos.riskFactors.duration || 2.0; // Default credit duration
          shockedPrice = pos.price * (1 - creditDuration * creditShock);
          break;
          
        case 'stress-test':
          // Stress test scenarios with multiple risk factor effects
          const stressShock = shock;
          const stressDelta = (pos.riskFactors.delta || 1.0) * stressShock;
          const stressDuration = -(pos.riskFactors.duration || 0) * stressShock * 0.1; // 10% of equity shock
          const stressVega = (pos.riskFactors.vega || 0) * Math.abs(stressShock) * 0.05; // Vol increase
          shockedPrice = pos.price * (1 + stressDelta + stressDuration + stressVega);
          break;
          
        case 'monte-carlo':
          // Monte Carlo scenarios - simplified for demo
          const mcShock = shock + (Math.random() - 0.5) * 0.02; // Add randomness
          shockedPrice = pos.price * (1 + mcShock);
          break;
          
        default:
          shockedPrice = pos.price * (1 + shock);
      }
      
      // Add time decay for options
      if (pos.instrumentType === 'option') {
        const thetaDecay = (pos.riskFactors.theta || 0) * 0.01; // Daily decay
        shockedPrice = shockedPrice + thetaDecay;
      }
      
      const impact = (shockedPrice - pos.price) * pos.quantity;
      
      return {
        asset: pos.asset,
        quantity: pos.quantity,
        shock: shockValue,
        impact,
        originalValue: pos.price * pos.quantity,
        shockedValue: shockedPrice * pos.quantity,
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
    
    console.log('Enhanced simulation results:', calc);
    setResults(calc);
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

  const deletePosition = (key: string) => {
    setPositions(positions.filter(pos => pos.key !== key));
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
      render: (text: string) => <strong>{text}</strong>
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
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: Position) => (
        <Button 
          type="link" 
          danger 
          onClick={() => deletePosition(record.key)}
          size="small"
        >
          Delete
        </Button>
      ),
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
          color: value >= 0 ? '#52c41a' : '#ff4d4f',
          fontWeight: 'bold'
        }}>
          {value >= 0 ? '+' : ''}{value.toLocaleString()}
        </span>
      )
    }
  ];

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>

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
              valueStyle={{ color: totalImpact >= 0 ? '#52c41a' : '#ff4d4f' }}
              formatter={(value) => `$${Number(value).toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="VaR (95%)"
              value={var95}
              valueStyle={{ color: '#ff4d4f' }}
              formatter={(value) => `$${Number(value).toLocaleString()}`}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Tabs defaultActiveKey="scenarios" size="large">
        <TabPane tab="📈 Scenarios" key="scenarios">
          {/* Scenario Configuration */}
          <Card title="Enhanced Scenario Configuration" style={{ marginBottom: "24px" }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={12}>
                <Select
                  value={selectedScenario.id}
                  style={{ width: "100%" }}
                  onChange={(value) => {
                    const scenario = ALL_SCENARIOS.find(s => s.id === value);
                    if (scenario) setSelectedScenario(scenario);
                  }}
                  size="large"
                  placeholder="Select Enhanced Scenario"
                >
                  <Select.OptGroup label="📈 Standard Scenarios - Quick Market Shock Analysis">
                    {STANDARD_SCENARIOS.map((scenario) => (
                      <Select.Option key={scenario.id} value={scenario.id}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {scenario.icon}
                          <strong>{scenario.name}</strong>
                          <Tag color={getCategoryColor(scenario.category)}>{scenario.category.toUpperCase()}</Tag>
                        </div>
                        <div style={{ fontSize: "12px", color: "#666" }}>{scenario.description}</div>
                      </Select.Option>
                    ))}
                  </Select.OptGroup>
                  
                  <Select.OptGroup label="⚡ Stress Tests - Historical Crisis Simulation">
                    {STRESS_TEST_SCENARIOS.map((scenario) => (
                      <Select.Option key={scenario.id} value={scenario.id}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {scenario.icon}
                          <strong>{scenario.name}</strong>
                          <Tag color={scenario.severity === 'extreme' ? 'red' : 
                                      scenario.severity === 'severe' ? 'orange' : 
                                      scenario.severity === 'moderate' ? 'yellow' : 'green'}>
                            {scenario.severity?.toUpperCase()}
                          </Tag>
                        </div>
                        <div style={{ fontSize: "12px", color: "#666" }}>{scenario.description}</div>
                        {scenario.historicalBasis && (
                          <div style={{ fontSize: "10px", color: "#999" }}>Based on: {scenario.historicalBasis}</div>
                        )}
                      </Select.Option>
                    ))}
                  </Select.OptGroup>
                  
                  <Select.OptGroup label="🎲 Monte Carlo - Statistical Risk Modeling">
                    {MONTE_CARLO_SCENARIOS.map((scenario) => (
                      <Select.Option key={scenario.id} value={scenario.id}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {scenario.icon}
                          <strong>{scenario.name}</strong>
                          <Tag color="purple">MC</Tag>
                        </div>
                        <div style={{ fontSize: "12px", color: "#666" }}>{scenario.description}</div>
                        <div style={{ fontSize: "10px", color: "#999" }}>
                          {scenario.numSimulations?.toLocaleString()} simulations | {scenario.distributionType} | {((scenario.confidenceLevel || 0) * 100)}% confidence
                        </div>
                      </Select.Option>
                    ))}
                  </Select.OptGroup>
                  
                  <Select.Option value="custom">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ExperimentOutlined />
                      <strong>Custom Scenario</strong>
                      <Tag color="gray">CUSTOM</Tag>
                    </div>
                    <div style={{ fontSize: "12px", color: "#666" }}>Define your own shock parameters</div>
                  </Select.Option>
                </Select>
              </Col>
              
              <Col xs={24} md={8}>
                <div style={{ 
                  padding: "8px 16px", 
                  background: "var(--scenario-bg, #f5f5f5)", 
                  borderRadius: "6px",
                  border: "1px solid var(--scenario-border, #e8e8e8)"
                }}>
                  <strong style={{ color: "var(--scenario-text, #1f2937)" }}>{selectedScenario.name}</strong>
                  <br />
                  <small style={{ color: "var(--scenario-desc, #666)" }}>{selectedScenario.description}</small>
                </div>
              </Col>
              
              <Col xs={24} md={4}>
                <Button 
                  type="primary" 
                  onClick={runSimulation} 
                  size="large" 
                  icon={<RiseOutlined />}
                  block
                  style={{
                    background: '#1890ff',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: '600'
                  }}
                >
                  Run Simulation
                </Button>
              </Col>
            </Row>

            {selectedScenario.name === "Custom" && (
              <div style={{ marginTop: "16px" }}>
                <InputNumber
                  value={customShock}
                  onChange={(v) => setCustomShock(v || 0)}
                  placeholder="Custom Shock %"
                  size="large"
                  style={{ width: 200 }}
                  addonAfter="%"
                />
              </div>
            )}
          </Card>

          {/* Results */}
          {results.length > 0 && (
            <Card title={`Enhanced Results - ${selectedScenario.name}`} style={{ marginBottom: "24px" }}>
              {/* Risk Metrics Summary */}
              <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
                <Col xs={24} sm={6}>
                  <Card size="small">
                    <Statistic
                      title="Total Impact"
                      value={totalImpact}
                      prefix={totalImpact >= 0 ? <RiseOutlined /> : <FallOutlined />}
                      valueStyle={{ color: totalImpact >= 0 ? '#52c41a' : '#ff4d4f' }}
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
                      valueStyle={{ color: impactPercentage >= 0 ? '#52c41a' : '#ff4d4f' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={6}>
                  <Card size="small">
                    <Statistic
                      title="VaR (95%)"
                      value={var95}
                      formatter={(value) => `$${Number(value).toLocaleString()}`}
                      valueStyle={{ color: '#ff4d4f' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={6}>
                  <Card size="small">
                    <Statistic
                      title="Max Loss"
                      value={maxLoss}
                      formatter={(value) => `$${Number(value).toLocaleString()}`}
                      valueStyle={{ color: '#ff4d4f' }}
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
                      <Tooltip 
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Impact']}
                      />
                      <Bar dataKey="impact" fill="#1890ff" />
                    </BarChart>
                  </ResponsiveContainer>
                </Col>
              </Row>
              
              <div style={{ textAlign: "center", marginTop: "16px", padding: "16px", background: "#f5f5f5", borderRadius: "8px" }}>
                <div style={{ 
                  fontSize: "1.8rem", 
                  fontWeight: "bold",
                  color: totalImpact >= 0 ? '#52c41a' : '#ff4d4f',
                  marginBottom: "8px"
                }}>
                  Total Portfolio Impact: {totalImpact >= 0 ? '+' : ''}${totalImpact.toLocaleString()}
                </div>
                <div style={{ fontSize: "1.1rem", color: "#666" }}>
                  Impact as % of Portfolio: {impactPercentage.toFixed(2)}%
                </div>
                <div style={{ fontSize: "0.9rem", color: "#999", marginTop: "4px" }}>
                  Scenario Category: <strong>{selectedScenario.category.toUpperCase()}</strong> | 
                  Shock Value: <strong>{(selectedScenario.shock * 100).toFixed(1)}%</strong>
                </div>
              </div>
            </Card>
          )}
        </TabPane>

        <TabPane tab="💼 Portfolio" key="portfolio">
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
            />
          </Card>
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
                      valueStyle={{ color: '#ff4d4f' }}
                    />
                    <Statistic
                      title="Expected Shortfall (ES) 95%"
                      value={var95 * 1.2} // Simplified ES calculation
                      formatter={(value) => `$${Number(value).toLocaleString()}`}
                      valueStyle={{ color: '#ff7875' }}
                    />
                    <Statistic
                      title="Maximum Drawdown"
                      value={maxLoss}
                      formatter={(value) => `$${Number(value).toLocaleString()}`}
                      valueStyle={{ color: '#ff4d4f' }}
                    />
                    <Statistic
                      title="Portfolio PnL"
                      value={totalImpact}
                      formatter={(value) => `$${Number(value).toLocaleString()}`}
                      valueStyle={{ 
                        color: totalImpact >= 0 ? '#52c41a' : '#ff4d4f' 
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
                      <Tooltip 
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
              <div style={{ padding: "16px", background: "#f5f5f5", borderRadius: "6px", marginTop: "30px" }}>
                <strong>Risk Factors (Greeks)</strong>
                <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
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
    </div>
  );
}
