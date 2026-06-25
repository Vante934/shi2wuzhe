import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { setupRequestHandlers, storage } from './api';
import './index.css';

function Root() {
  useEffect(() => {
    setupRequestHandlers({
      onError: (msg) => {
        if (msg.includes('Invalid bound statement')) {
          console.info('[后端Mapper未实现]', msg);
          return;
        }
        console.error('[API错误]', msg);
      },
      onUnauthorized: () => {
        // ⭐ 游客模式不要踢出
        if (storage.isGuest()) {
          console.info('[游客模式] 接口需要登录，已忽略');
          return;
        }
        // 正式用户 token 过期 → 清登录态 + 刷新到登录页
        storage.clearAll();
        window.location.reload();
      },
    });
  }, []);

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);