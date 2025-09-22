// Web 配置：確保 react-native-paper 使用正確的圖標
import { Platform } from 'react-native';

// 為 Web 平台配置圖標
if (Platform.OS === 'web') {
  // 確保 react-native-paper 可以找到圖標
  const configurePaperWeb = () => {
    try {
      // 這將幫助 react-native-paper 在 web 上正確渲染圖標
      if (typeof document !== 'undefined') {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
        document.head.appendChild(link);
      }
    } catch (error) {
      console.warn('Could not load Material Icons for web:', error);
    }
  };
  
  configurePaperWeb();
}

export {};