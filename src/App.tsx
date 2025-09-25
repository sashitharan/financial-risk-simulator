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
          // Professional Financial Dashboard Colors
          colorPrimary: isDark ? '#60a5fa' : '#2563eb',
          colorSuccess: isDark ? '#4ade80' : '#16a34a',
          colorWarning: isDark ? '#fbbf24' : '#d97706',
          colorError: isDark ? '#f87171' : '#dc2626',
          colorInfo: isDark ? '#38bdf8' : '#0284c7',
          
          // Layout & Background
          colorBgBase: isDark ? '#0a0a0a' : '#ffffff',
          colorBgContainer: isDark ? '#1f1f1f' : '#ffffff',
          colorBgElevated: isDark ? '#262626' : '#ffffff',
          colorBgLayout: 'transparent',
          
          // Text Colors
          colorText: isDark ? '#ffffff' : '#171717',
          colorTextSecondary: isDark ? '#a3a3a3' : '#525252',
          colorTextTertiary: isDark ? '#737373' : '#737373',
          colorTextQuaternary: isDark ? '#a3a3a3' : '#a3a3a3',
          
          // Border Colors
          colorBorder: isDark ? '#404040' : '#e5e5e5',
          colorBorderSecondary: isDark ? '#525252' : '#d4d4d4',
          
          // Component Specific
          borderRadius: 6,
          borderRadiusLG: 8,
          
          // Typography
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
          fontSize: 16,
          fontSizeLG: 18,
          fontSizeXL: 20,
          fontSizeHeading1: 30,
          fontSizeHeading2: 24,
          fontSizeHeading3: 20,
          fontSizeHeading4: 18,
          fontSizeHeading5: 16,
          
          // Spacing
          padding: 16,
          paddingLG: 24,
          paddingXL: 32,
          margin: 16,
          marginLG: 24,
          marginXL: 32,
          
          // Shadows
          boxShadow: isDark 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4)'
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
          boxShadowSecondary: isDark 
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4)'
            : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
          
          // Button Colors
          colorPrimaryBg: isDark ? '#1e40af' : '#eff6ff',
          colorPrimaryBgHover: isDark ? '#1d4ed8' : '#dbeafe',
          colorPrimaryBorder: isDark ? '#60a5fa' : '#2563eb',
          colorPrimaryBorderHover: isDark ? '#93c5fd' : '#1d4ed8',
          colorPrimaryText: '#ffffff',
          colorPrimaryTextHover: '#ffffff',
        },
      }}
    >
      <div className={`App ${isDark ? 'dark-theme' : 'light-theme'}`}>
        <div style={{ 
          position: 'fixed', 
          top: '20px', 
          right: '20px', 
          zIndex: 1000,
          background: isDark ? 'rgba(31, 31, 31, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '12px',
          border: isDark ? '1px solid #404040' : '1px solid #e5e5e5',
          boxShadow: isDark 
            ? '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)' 
            : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
        }}>
          <ThemeToggle />
        </div>
        <div style={{ 
          padding: '32px', 
          minHeight: '100vh',
        }}>
          <h1 style={{ 
            color: isDark ? '#ffffff' : '#ffffff', 
            textAlign: 'center', 
            marginBottom: '32px', 
            fontSize: '2.5rem', 
            fontWeight: '700',
            textShadow: isDark ? '0 2px 4px rgba(0, 0, 0, 0.5)' : '0 2px 4px rgba(0, 0, 0, 0.3)',
            letterSpacing: '-0.025em'
          }}>
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