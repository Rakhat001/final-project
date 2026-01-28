import type { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
  token: {
    fontSize: 16,
    colorPrimary: '#4f46e5', 
    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
  },
  components: {
    Button: {
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      borderRadius: 6,
    },
    Input: {
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      borderRadius: 6,
    },
    Card: {
      borderRadiusLG: 12,
    },
  },
};

export default theme;
