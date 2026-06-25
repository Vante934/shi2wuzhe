import { useState, useEffect } from 'react';

// ⭐ 全局单例：所有 useToast() 调用共享同一个状态
let globalSetMessage: ((msg: string | null) => void) | null = null;
let globalCurrent: string | null = null;
const listeners = new Set<(msg: string | null) => void>();

function broadcast(msg: string | null) {
  globalCurrent = msg;
  listeners.forEach((fn) => fn(msg));
}

export function useToast() {
  const [toastMessage, setToastMessage] = useState<string | null>(globalCurrent);

  useEffect(() => {
    listeners.add(setToastMessage);
    return () => {
      listeners.delete(setToastMessage);
    };
  }, []);

  const showToast = (msg: string) => {
    broadcast(msg);
    setTimeout(() => {
      // 只有当前还是这条消息时才清，避免覆盖后来的
      if (globalCurrent === msg) {
        broadcast(null);
      }
    }, 2800);
  };

  return {
    toastMessage,
    showToast,
  };
}