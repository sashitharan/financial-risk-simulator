import { ConfigProvider, theme } from 'antd';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import WorkingEnhancedSimulator from './components/WorkingEnhancedSimulator';
import ThemeToggle from './components/ThemeToggle';
import './App.css';

const AppContent = () => {
  const { isDark } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
          colorBgBase: isDark ? '#141414' : '#ffffff',
          colorBgContainer: isDark ? '#1f1f1f' : '#ffffff',
          colorText: isDark ? '#ffffff' : '#000000',
          colorTextSecondary: isDark ? '#a6a6a6' : '#666666',
          colorBorder: isDark ? '#303030' : '#d9d9d9',
          colorBgElevated: isDark ? '#262626' : '#ffffff',
          // Force button colors
          colorPrimaryBg: '#1890ff',
          colorPrimaryBgHover: '#096dd9',
          colorPrimaryBorder: '#1890ff',
          colorPrimaryBorderHover: '#096dd9',
          colorPrimaryText: '#ffffff',
          colorPrimaryTextHover: '#ffffff',
        },
      }}
    >
      <div className="App">
        <div style={{ 
          position: 'fixed', 
          top: '20px', 
          right: '20px', 
          zIndex: 1000,
          background: isDark ? 'rgba(31, 31, 31, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '8px',
          border: isDark ? '1px solid #303030' : '1px solid #e8e8e8',
          boxShadow: isDark 
            ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
            : '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}>
          <ThemeToggle />
        </div>
        <div style={{ 
          padding: '20px', 
          color: isDark ? 'white' : 'black',
          minHeight: '100vh',
          background: isDark 
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <h1 style={{ color: 'white', textAlign: 'center', marginBottom: '20px', fontSize: '2.5rem', fontWeight: '700' }}>
            Financial Risk Simulation & Portfolio Analysis
          </h1>
          <WorkingEnhancedSimulator />
        </div>
      </div>
    </ConfigProvider>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;