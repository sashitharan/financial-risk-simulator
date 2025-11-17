import { useState, useMemo } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  InputNumber, 
  Form, 
  Select, 
  Space, 
  Typography, 
  Divider,
  Tooltip,
  Statistic,
  Button,
  Modal,
  Table,
  Tag
} from 'antd';
import { 
  BarChartOutlined,
  DollarOutlined,
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';

const { Title, Text } = Typography;

export interface Position {
  id: string;
  asset: string;
  spot: number; // Current spot price
  vol: number; // Current volatility (as percentage, e.g., 40 = 40%)
  quantity: number; // Position size
  delta: number; // Delta Greek
  gamma: number; // Gamma Greek
  vega: number; // Vega Greek (per 1% vol change)
  theta?: number; // Theta (optional)
  instrumentType: 'call' | 'put' | 'stock' | 'structure';
  strike?: number; // For options
  expiry?: number; // Days to expiry
}

interface MatrixCell {
  priceShock: number; // Percentage change in price
  volShock: number; // Volatility change in percentage points
  pnl: number; // P&L impact
  newPrice: number; // New price after shocks
  newVol: number; // New volatility after shocks
}

interface RiskMatrixProps {
  positions?: Position[];
  onUpdate?: (matrix: MatrixCell[][]) => void;
}

// Default price shock levels (percentage)
const DEFAULT_PRICE_SHOCKS = [-10, -5, 0, 5, 10];

// Default volatility shock levels (percentage points)
const DEFAULT_VOL_SHOCKS = [-10, -5, 0, 5, 10];

// Calculate P&L using Greeks approximation
// P&L ≈ Δ × ΔS + 0.5 × Γ × (ΔS)² + ν × Δσ
const calculatePnL = (
  position: Position,
  priceShock: number, // as percentage (e.g., -10 for -10%)
  volShock: number // as percentage points (e.g., -10 for -10pts)
): number => {
  const deltaS = position.spot * (priceShock / 100); // Price change in dollars
  const deltaVol = volShock; // Volatility change in percentage points
  
  // Linear approximation using Greeks
  const deltaPnL = position.delta * deltaS * position.quantity;
  const gammaPnL = 0.5 * position.gamma * deltaS * deltaS * position.quantity;
  const vegaPnL = position.vega * deltaVol * position.quantity;
  
  // Total P&L
  const totalPnL = deltaPnL + gammaPnL + vegaPnL;
  
  return totalPnL;
};

// Get color for P&L value (heatmap)
const getPnLColor = (pnl: number, isDark: boolean): string => {
  if (pnl > 0) {
    // Green for gains - darker green for larger gains
    const intensity = Math.min(Math.abs(pnl) / 100000, 1);
    if (isDark) {
      return `rgba(34, 197, 94, ${0.3 + intensity * 0.5})`;
    }
    return `rgba(34, 197, 94, ${0.2 + intensity * 0.4})`;
  } else if (pnl < 0) {
    // Red for losses - darker red for larger losses
    const intensity = Math.min(Math.abs(pnl) / 100000, 1);
    if (isDark) {
      return `rgba(239, 68, 68, ${0.3 + intensity * 0.5})`;
    }
    return `rgba(220, 38, 38, ${0.2 + intensity * 0.4})`;
  } else {
    // Neutral/yellow for zero
    if (isDark) {
      return 'rgba(251, 191, 36, 0.2)';
    }
    return 'rgba(245, 158, 11, 0.15)';
  }
};

// Get text color for P&L
const getPnLTextColor = (pnl: number, isDark: boolean): string => {
  if (pnl > 0) {
    return isDark ? '#4ade80' : '#16a34a';
  } else if (pnl < 0) {
    return isDark ? '#f87171' : '#dc2626';
  }
  return isDark ? '#a3a3a3' : '#525252';
};

export default function RiskMatrix({ positions: externalPositions, onUpdate }: RiskMatrixProps) {
  const { isDark } = useTheme();
  const [form] = Form.useForm();
  const [positions, setPositions] = useState<Position[]>(
    externalPositions || [
      {
        id: '1',
        asset: 'AAPL',
        spot: 100,
        vol: 40,
        quantity: 1,
        delta: 0.55,
        gamma: 0.04,
        vega: 0.3,
        instrumentType: 'call',
        strike: 100,
        expiry: 30
      }
    ]
  );
  const [priceShocks, setPriceShocks] = useState<number[]>(DEFAULT_PRICE_SHOCKS);
  const [volShocks, setVolShocks] = useState<number[]>(DEFAULT_VOL_SHOCKS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ priceShock: number; volShock: number } | null>(null);

  // Calculate matrix for all positions combined
  const matrix = useMemo(() => {
    const matrixData: MatrixCell[][] = [];

    volShocks.forEach((volShock) => {
      const row: MatrixCell[] = [];
      priceShocks.forEach((priceShock) => {
        // Sum P&L across all positions
        let totalPnL = 0;
        let totalNewPrice = 0;
        let totalNewVol = 0;

        positions.forEach((position) => {
          const pnl = calculatePnL(position, priceShock, volShock);
          totalPnL += pnl;
          totalNewPrice += position.spot * (1 + priceShock / 100);
          totalNewVol += position.vol + volShock;
        });

        row.push({
          priceShock,
          volShock,
          pnl: totalPnL,
          newPrice: totalNewPrice / positions.length, // Average
          newVol: totalNewVol / positions.length // Average
        });
      });
      matrixData.push(row);
    });

    // Notify parent if callback provided
    if (onUpdate) {
      onUpdate(matrixData);
    }

    return matrixData;
  }, [positions, priceShocks, volShocks, onUpdate]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const allPnLs = matrix.flat().map(cell => cell.pnl);
    const maxGain = Math.max(...allPnLs, 0);
    const maxLoss = Math.min(...allPnLs, 0);
    const totalExposure = positions.reduce((sum, pos) => sum + (pos.spot * pos.quantity), 0);
    
    return {
      maxGain,
      maxLoss,
      totalExposure,
      numPositions: positions.length
    };
  }, [matrix, positions]);

  const addPosition = () => {
    form.validateFields().then((values) => {
      const newPosition: Position = {
        id: String(Date.now()),
        asset: values.asset,
        spot: values.spot,
        vol: values.vol,
        quantity: values.quantity,
        delta: values.delta,
        gamma: values.gamma,
        vega: values.vega,
        theta: values.theta,
        instrumentType: values.instrumentType,
        strike: values.strike,
        expiry: values.expiry
      };
      setPositions([...positions, newPosition]);
      setIsAddModalOpen(false);
      form.resetFields();
    });
  };

  const deletePosition = (id: string) => {
    setPositions(positions.filter(p => p.id !== id));
  };

  const positionColumns = [
    {
      title: 'Asset',
      dataIndex: 'asset',
      key: 'asset',
      render: (text: string) => <strong>{text}</strong>
    },
    {
      title: 'Spot',
      dataIndex: 'spot',
      key: 'spot',
      render: (value: number) => `$${value.toFixed(2)}`
    },
    {
      title: 'Vol',
      dataIndex: 'vol',
      key: 'vol',
      render: (value: number) => `${value.toFixed(1)}%`
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: 'Δ',
      dataIndex: 'delta',
      key: 'delta',
      render: (value: number) => value.toFixed(3)
    },
    {
      title: 'Γ',
      dataIndex: 'gamma',
      key: 'gamma',
      render: (value: number) => value.toFixed(4)
    },
    {
      title: 'ν',
      dataIndex: 'vega',
      key: 'vega',
      render: (value: number) => value.toFixed(3)
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Position) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => deletePosition(record.id)}
          size="small"
        >
          Delete
        </Button>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1800px', margin: '0 auto' }}>
      <Card
        style={{
          marginBottom: '24px',
          background: isDark ? '#1f1f1f' : '#ffffff',
          border: `1px solid ${isDark ? '#404040' : '#e5e5e5'}`
        }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Title level={4} style={{ margin: 0, color: isDark ? '#ffffff' : '#171717' }}>
              <BarChartOutlined /> Risk Matrix (Price vs Volatility)
            </Title>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              P&L Impact from Combined Price & Vol Shocks
            </Text>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsAddModalOpen(true)}
              size="large"
              block
            >
              Add Position
            </Button>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setPriceShocks([...DEFAULT_PRICE_SHOCKS]);
                setVolShocks([...DEFAULT_VOL_SHOCKS]);
              }}
              size="large"
              block
            >
              Reset Shocks
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Summary Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Max Gain"
              value={summaryStats.maxGain}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#16a34a' }}
              formatter={(value) => `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Max Loss"
              value={summaryStats.maxLoss}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#dc2626' }}
              formatter={(value) => `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Exposure"
              value={summaryStats.totalExposure}
              prefix={<DollarOutlined />}
              valueStyle={{ color: isDark ? '#60a5fa' : '#2563eb' }}
              formatter={(value) => `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Positions"
              value={summaryStats.numPositions}
              valueStyle={{ color: isDark ? '#60a5fa' : '#2563eb' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Positions Table */}
      <Card
        title="Current Positions"
        style={{
          marginBottom: '24px',
          background: isDark ? '#1f1f1f' : '#ffffff',
          border: `1px solid ${isDark ? '#404040' : '#e5e5e5'}`
        }}
      >
        <Table
          dataSource={positions.map(p => ({ ...p, key: p.id }))}
          columns={positionColumns}
          pagination={false}
          size="small"
          bordered
        />
      </Card>

      {/* Risk Matrix */}
      <Card
        title={
          <Space>
            <BarChartOutlined />
            <span>Risk Matrix: P&L Impact (Price Shocks × Volatility Shocks)</span>
          </Space>
        }
        style={{
          background: isDark ? '#1f1f1f' : '#ffffff',
          border: `1px solid ${isDark ? '#404040' : '#e5e5e5'}`
        }}
      >
        <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: '4px',
              minWidth: '600px'
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    padding: '12px',
                    textAlign: 'center',
                    background: isDark ? '#262626' : '#f5f5f5',
                    border: `1px solid ${isDark ? '#404040' : '#e5e5e5'}`,
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    color: isDark ? '#ffffff' : '#171717',
                    minWidth: '120px'
                  }}
                >
                  Vol \ Price
                </th>
                {priceShocks.map((shock) => (
                  <th
                    key={shock}
                    style={{
                      padding: '12px',
                      textAlign: 'center',
                      background: isDark ? '#262626' : '#f5f5f5',
                      border: `1px solid ${isDark ? '#404040' : '#e5e5e5'}`,
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      color: isDark ? '#ffffff' : '#171717',
                      minWidth: '120px'
                    }}
                  >
                    {shock > 0 ? '+' : ''}{shock}%
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td
                    style={{
                      padding: '12px',
                      textAlign: 'center',
                      background: isDark ? '#262626' : '#f5f5f5',
                      border: `1px solid ${isDark ? '#404040' : '#e5e5e5'}`,
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      color: isDark ? '#ffffff' : '#171717'
                    }}
                  >
                    {volShocks[rowIndex] > 0 ? '+' : ''}{volShocks[rowIndex]}pts
                  </td>
                  {row.map((cell, colIndex) => {
                    const bgColor = getPnLColor(cell.pnl, isDark);
                    const textColor = getPnLTextColor(cell.pnl, isDark);

                    return (
                      <td
                        key={colIndex}
                        onClick={() => setSelectedCell({ priceShock: cell.priceShock, volShock: cell.volShock })}
                        style={{
                          padding: '16px',
                          textAlign: 'center',
                          background: bgColor,
                          border: `2px solid ${textColor}`,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          minHeight: '80px',
                          verticalAlign: 'middle'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = isDark
                            ? '0 4px 12px rgba(0, 0, 0, 0.5)'
                            : '0 4px 12px rgba(0, 0, 0, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <Tooltip
                          title={
                            <div>
                              <div><strong>Price Shock:</strong> {cell.priceShock > 0 ? '+' : ''}{cell.priceShock}%</div>
                              <div><strong>Vol Shock:</strong> {cell.volShock > 0 ? '+' : ''}{cell.volShock}pts</div>
                              <div><strong>P&L Impact:</strong> ${cell.pnl.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                              <div><strong>New Price:</strong> ${cell.newPrice.toFixed(2)}</div>
                              <div><strong>New Vol:</strong> {cell.newVol.toFixed(1)}%</div>
                            </div>
                          }
                        >
                          <div>
                            <div
                              style={{
                                fontSize: '16px',
                                fontWeight: 'bold',
                                color: textColor,
                                marginBottom: '4px'
                              }}
                            >
                              {cell.pnl >= 0 ? '+' : ''}${(cell.pnl / 1000).toFixed(1)}K
                            </div>
                            <div
                              style={{
                                fontSize: '11px',
                                color: isDark ? '#a3a3a3' : '#525252',
                                marginTop: '4px'
                              }}
                            >
                              {cell.priceShock > 0 ? '+' : ''}{cell.priceShock}% / {cell.volShock > 0 ? '+' : ''}{cell.volShock}pts
                            </div>
                          </div>
                        </Tooltip>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <Divider />
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Space wrap>
              <Text strong style={{ color: isDark ? '#ffffff' : '#171717' }}>
                P&L Legend:
              </Text>
              <Tag color="success" style={{ fontWeight: 'bold' }}>
                🟩 Gains (Green)
              </Tag>
              <Tag color="error" style={{ fontWeight: 'bold' }}>
                🟥 Losses (Red)
              </Tag>
              <Tag color="warning" style={{ fontWeight: 'bold' }}>
                🟨 Neutral (Yellow)
              </Tag>
            </Space>
          </Col>
          <Col span={24} style={{ marginTop: '8px' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <InfoCircleOutlined /> P&L calculated using: Δ × ΔS + 0.5 × Γ × (ΔS)² + ν × Δσ
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Add Position Modal */}
      <Modal
        title="Add New Position"
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          form.resetFields();
        }}
        onOk={addPosition}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="asset"
                label="Asset Symbol"
                rules={[{ required: true, message: 'Please enter asset symbol' }]}
              >
                <Select placeholder="Select or type asset">
                  <Select.Option value="AAPL">AAPL</Select.Option>
                  <Select.Option value="TSLA">TSLA</Select.Option>
                  <Select.Option value="MSFT">MSFT</Select.Option>
                  <Select.Option value="GOOGL">GOOGL</Select.Option>
                  <Select.Option value="NVDA">NVDA</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="instrumentType"
                label="Instrument Type"
                rules={[{ required: true }]}
                initialValue="call"
              >
                <Select>
                  <Select.Option value="call">Call Option</Select.Option>
                  <Select.Option value="put">Put Option</Select.Option>
                  <Select.Option value="stock">Stock</Select.Option>
                  <Select.Option value="structure">Structure</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="spot"
                label="Current Spot Price ($)"
                rules={[{ required: true, message: 'Please enter spot price' }]}
                initialValue={100}
              >
                <InputNumber min={0.01} step={0.01} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="vol"
                label="Current Volatility (%)"
                rules={[{ required: true, message: 'Please enter volatility' }]}
                initialValue={40}
              >
                <InputNumber min={0} max={200} step={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="quantity"
                label="Quantity"
                rules={[{ required: true, message: 'Please enter quantity' }]}
                initialValue={1}
              >
                <InputNumber min={0.01} step={0.01} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="strike"
                label="Strike Price ($)"
              >
                <InputNumber min={0.01} step={0.01} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="delta"
                label="Delta (Δ)"
                rules={[{ required: true, message: 'Please enter delta' }]}
                initialValue={0.5}
              >
                <InputNumber min={-1} max={1} step={0.01} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="gamma"
                label="Gamma (Γ)"
                rules={[{ required: true, message: 'Please enter gamma' }]}
                initialValue={0.04}
              >
                <InputNumber min={0} step={0.001} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="vega"
                label="Vega (ν)"
                rules={[{ required: true, message: 'Please enter vega' }]}
                initialValue={0.3}
              >
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="theta"
                label="Theta (Θ) - Optional"
              >
                <InputNumber step={0.01} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expiry"
                label="Days to Expiry"
              >
                <InputNumber min={0} step={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Cell Detail Modal */}
      {selectedCell && (
        <Modal
          title="Cell Details"
          open={!!selectedCell}
          onCancel={() => setSelectedCell(null)}
          footer={null}
        >
          <div>
            <p><strong>Price Shock:</strong> {selectedCell.priceShock > 0 ? '+' : ''}{selectedCell.priceShock}%</p>
            <p><strong>Volatility Shock:</strong> {selectedCell.volShock > 0 ? '+' : ''}{selectedCell.volShock}pts</p>
            <Divider />
            <p>Breakdown by position:</p>
            <Table
              dataSource={positions.map((pos, idx) => {
                const pnl = calculatePnL(pos, selectedCell.priceShock, selectedCell.volShock);
                return {
                  key: idx,
                  asset: pos.asset,
                  pnl,
                  delta: pos.delta,
                  gamma: pos.gamma,
                  vega: pos.vega
                };
              })}
              columns={[
                { title: 'Asset', dataIndex: 'asset', key: 'asset' },
                { 
                  title: 'P&L', 
                  dataIndex: 'pnl', 
                  key: 'pnl',
                  render: (value: number) => (
                    <Text style={{ color: value >= 0 ? '#16a34a' : '#dc2626' }}>
                      ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </Text>
                  )
                },
                { title: 'Δ', dataIndex: 'delta', key: 'delta', render: (v: number) => v.toFixed(3) },
                { title: 'Γ', dataIndex: 'gamma', key: 'gamma', render: (v: number) => v.toFixed(4) },
                { title: 'ν', dataIndex: 'vega', key: 'vega', render: (v: number) => v.toFixed(3) }
              ]}
              pagination={false}
              size="small"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
