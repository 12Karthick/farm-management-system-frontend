import { RouterProvider } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import router from './router';

const { darkAlgorithm } = theme;

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: darkAlgorithm,
        token: {
          colorPrimary: '#33597f',
          colorBgContainer: '#161d2b',
          colorBgElevated: '#1a2235',
          colorBgLayout: '#0d1117',
          colorBorder: 'rgba(255,255,255,0.07)',
          colorText: '#e2e8f0',
          colorTextSecondary: '#94a3b8',
          colorTextPlaceholder: '#64748b',
          borderRadius: 10,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}

export default App;
