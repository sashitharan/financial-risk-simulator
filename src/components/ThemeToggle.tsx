import React from 'react';
import { Button, Tooltip } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <Tooltip title={`Switch to ${isDark ? 'light' : 'dark'} theme`}>
      <Button
        type="text"
        icon={isDark ? <SunOutlined /> : <MoonOutlined />}
        onClick={toggleTheme}
        style={{
          fontSize: '18px',
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          color: isDark ? '#fbbf24' : '#2563eb',
          background: isDark ? 'rgba(251, 191, 36, 0.1)' : 'rgba(37, 99, 235, 0.1)',
          border: isDark ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(37, 99, 235, 0.2)',
          boxShadow: isDark 
            ? '0 2px 4px rgba(251, 191, 36, 0.1)' 
            : '0 2px 4px rgba(37, 99, 235, 0.1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = isDark 
            ? '0 4px 12px rgba(251, 191, 36, 0.2)' 
            : '0 4px 12px rgba(37, 99, 235, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = isDark 
            ? '0 2px 4px rgba(251, 191, 36, 0.1)' 
            : '0 2px 4px rgba(37, 99, 235, 0.1)';
        }}
      />
    </Tooltip>
  );
};

export default ThemeToggle;
