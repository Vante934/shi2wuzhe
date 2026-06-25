/**
 * 游客守卫 Hook
 * 用法：
 *   const guard = useGuestGuard();
 *   if (guard.block('登录后才能收藏')) return;
 *   ...继续写操作
 *
 * 或包装：
 *   <button onClick={guard.wrap(handleSave, '登录后才能保存')}>...</button>
 */
import { useCallback } from 'react';
import { storage } from '../api';
import { useToast } from './useToast';

export function useGuestGuard() {
  const { showToast } = useToast();

  const isGuest = useCallback((): boolean => {
    return storage.isGuest() || !storage.getToken();
  }, []);

  const block = useCallback(
    (message = '该功能需要登录后使用，请先登录或注册'): boolean => {
      if (isGuest()) {
        showToast(message);
        return true;
      }
      return false;
    },
    [isGuest, showToast]
  );

  const wrap = useCallback(
    <T extends (...args: any[]) => any>(
      fn: T,
      message = '该功能需要登录后使用，请先登录或注册'
    ) => {
      return ((...args: Parameters<T>) => {
        if (isGuest()) {
          showToast(message);
          return;
        }
        return fn(...args);
      }) as T;
    },
    [isGuest, showToast]
  );

  return { isGuest, block, wrap };
}