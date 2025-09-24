import { useState } from "react";
import { Table, Button, InputNumber, Select, Space, Modal, Form, Input, Card, Row, Col, Statistic } from "antd";
import { PlusOutlined, DollarOutlined, RiseOutlined, FallOutlined } from "@ant-design/icons";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

type Position = {
  key: string;
  asset: string;
  quantity: number;
  price: number;
};

type Result = {
  asset: string;
  quantity: number;
  shock: number;
  impact: number;
};

const SCENARIOS = [
  { name: "Equity -5%", shock: -0.05, description: "Market downturn scenario", category: "equity" },
  { name: "Equity +5%", shock: 0.05, description: "Market upturn scenario", category: "equity" },
  { name: "FX +2%", shock: 0.02, description: "Currency appreciation", category: "fx" },
  { name: "Rates +50bps", shock: 0.005, description: "Interest rate increase", category: "rates" },
  { name: "Volatility Spike", shock: 0.30, description: "30% increase in market volatility", category: "volatility" },
  { name: "Credit Crisis", shock: 0.02, description: "Credit spreads widen by 200bps", category: "credit" },
  { name: "2008 Crisis", shock: -0.40, description: "Financial crisis scenario", category: "stress-test" },
  { name: "Custom", shock: 0, description: "Define your own shock", category: "custom" }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ScenarioSimulator() {
  const [positions, setPositions] = useState<Position[]>([
    { key: "1", asset: "AAPL", quantity: 100000, price: 200 },
    { key: "2", asset: "TSLA", quantity: 50000, price: 250 },
    { key: "3", asset: "MSFT", quantity: 75000, price: 350 }
  ]);

  const [scenario, setScenario] = useState(SCENARIOS[0]);
  const [customShock, setCustomShock] = useState<number>(0);
  const [results, setResults] = useState<Result[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const runSimulation = () => {
    const shock = scenario.name === "Custom" ? customShock / 100 : scenario.shock;
    
    // Enhanced calculation with different shock types based on scenario category
    const calc = positions.map((pos) => {
      let shockedPrice = pos.price;
      let shockValue = shock;
      
      // Apply different shock logic based on scenario category
      switch (scenario.category) {
        case 'equity':
          shockedPrice = pos.price * (1 + shock);
          break;
        case 'fx':
          // FX shocks affect price directly
          shockedPrice = pos.price * (1 + shock);
          break;
        case 'rates':
          // Interest rate shocks have duration effect
          const duration = 4.0; // Simplified duration
          shockedPrice = pos.price * (1 - duration * shock);
          break;
        case 'volatility':
          // Volatility shocks affect option-like instruments
          shockedPrice = pos.price * (1 + shock * 0.1); // Simplified vega effect
          break;
        case 'credit':
          // Credit shocks affect bond-like instruments
          shockedPrice = pos.price * (1 - shock * 2); // Simplified credit sensitivity
          break;
        case 'stress-test':
          // Stress test scenarios can have multiple effects
          shockedPrice = pos.price * (1 + shock);
          break;
        default:
          shockedPrice = pos.price * (1 + shock);
      }
      
      const impact = (shockedPrice - pos.price) * pos.quantity;
      return {
        asset: pos.asset,
        quantity: pos.quantity,
        shock: shockValue,
        impact
      };
    });
    
    setResults(calc);
  };

  const addPosition = () => {
    form.validateFields().then((values) => {
      const newPos: Position = {
        key: String(Date.now()),
        asset: values.asset,
        quantity: values.quantity,
        price: values.price
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

  const columns = [
    { 
      title: "Asset", 
      dataIndex: "asset", 
      key: "asset",
      render: (text: string) => <strong>{text}</strong>
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
      title: "Quantity", 
      dataIndex: "quantity", 
      key: "quantity",
      render: (value: number) => value.toLocaleString()
    },
    {
      title: "Shock",
      key: "shock",
      render: (_: any, r: Result) => (
        <span style={{ 
          color: r.shock >= 0 ? '#52c41a' : '#ff4d4f',
          fontWeight: 'bold'
        }}>
          {r.shock >= 0 ? '+' : ''}{(r.shock * 100).toFixed(2)}%
        </span>
      )
    },
    {
      title: "Impact ($)",
      key: "impact",
      render: (_: any, r: Result) => (
        <span style={{ 
          color: r.impact >= 0 ? '#52c41a' : '#ff4d4f',
          fontWeight: 'bold'
        }}>
          {r.impact >= 0 ? '+' : ''}{r.impact.toLocaleString()}
        </span>
      )
    }
  ];

  const pieData = positions.map((pos, index) => ({
    name: pos.asset,
    value: pos.price * pos.quantity,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h1 style={{ fontSize: "2.5rem", margin: "0", color: "#1890ff" }}>
          📊 Financial Scenario Management
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#666", margin: "8px 0 0 0" }}>
          Analyze portfolio performance under different market scenarios
        </p>
      </div>

      {/* Portfolio Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Portfolio Value"
              value={totalValue}
              prefix={<DollarOutlined />}
              formatter={(value) => `$${Number(value).toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Number of Positions"
              value={positions.length}
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
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
      </Row>

      {/* Scenario Selector */}
      <Card title="Scenario Configuration" style={{ marginBottom: "24px" }}>
        <Space wrap>
        <Select
          value={scenario.name}
          style={{ width: 300 }}
          onChange={(val) => {
            const s = SCENARIOS.find((s) => s.name === val)!;
            setScenario(s);
          }}
          size="large"
        >
          {SCENARIOS.map((s) => (
            <Select.Option key={s.name} value={s.name}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong>{s.name}</strong>
                  <span style={{ 
                    fontSize: '10px', 
                    padding: '2px 6px', 
                    borderRadius: '4px',
                    background: s.category === 'equity' ? '#e6f7ff' : 
                               s.category === 'rates' ? '#f6ffed' :
                               s.category === 'fx' ? '#fff7e6' :
                               s.category === 'volatility' ? '#f9f0ff' :
                               s.category === 'credit' ? '#fff1f0' :
                               s.category === 'stress-test' ? '#ff4d4f' : '#f5f5f5',
                    color: s.category === 'stress-test' ? 'white' : '#666'
                  }}>
                    {s.category.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "#666" }}>{s.description}</div>
              </div>
            </Select.Option>
          ))}
        </Select>
          {scenario.name === "Custom" && (
            <InputNumber
              value={customShock}
              onChange={(v) => setCustomShock(v || 0)}
              placeholder="Custom Shock %"
              size="large"
              style={{ width: 150 }}
              addonAfter="%"
            />
          )}
          <Button type="primary" onClick={runSimulation} size="large" icon={<RiseOutlined />}>
            Run Simulation
          </Button>
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        {/* Positions Table */}
        <Col xs={24} lg={16}>
          <Card 
            title="Portfolio Positions" 
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
              columns={columns}
              pagination={false}
              bordered
              size="middle"
            />
          </Card>
        </Col>

        {/* Portfolio Distribution */}
        <Col xs={24} lg={8}>
          <Card title="Portfolio Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Value']} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Add Position Modal */}
      <Modal
        title="Add New Position"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={addPosition}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item 
            name="asset" 
            label="Asset Symbol" 
            rules={[{ required: true, message: 'Please enter asset symbol' }]}
          >
            <Input placeholder="e.g. AAPL, TSLA, MSFT" style={{ textTransform: 'uppercase' }} />
          </Form.Item>
          <Form.Item 
            name="quantity" 
            label="Quantity" 
            rules={[{ required: true, message: 'Please enter quantity' }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} placeholder="Number of shares/units" />
          </Form.Item>
          <Form.Item 
            name="price" 
            label="Current Price ($)" 
            rules={[{ required: true, message: 'Please enter current price' }]}
          >
            <InputNumber min={0.01} step={0.01} style={{ width: "100%" }} placeholder="Price per share/unit" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Results */}
      {results.length > 0 && (
        <Card title={`Simulation Results - ${scenario.name}`} style={{ marginTop: "24px" }}>
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
            <Col xs={24} sm={12}>
              <Table
                dataSource={results.map((r) => ({ ...r, key: r.asset }))}
                columns={resultColumns}
                pagination={false}
                bordered
                size="middle"
                title={() => "Position Results"}
              />
            </Col>
            <Col xs={24} sm={12}>
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
              Scenario Category: <strong>{scenario.category.toUpperCase()}</strong> | 
              Shock Value: <strong>{(scenario.shock * 100).toFixed(1)}%</strong>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}