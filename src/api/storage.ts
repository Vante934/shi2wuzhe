/**
 * 本地存储封装
 * 统一管理 Token、用户信息等本地缓存
 */

const TOKEN_KEY = 'shi2wuzhe_token';
const USER_INFO_KEY = 'shi2wuzhe_user_info';
const PREFERENCE_CACHE_KEY = 'shi2wuzhe_pref_cache';
// 用餐提醒（前端兜底，后端也会保存）
const REMINDER_CACHE_KEY = 'shi2wuzhe_reminder_cache';

export const storage = {
  // ============ Token ============
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },
  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  // ============ 用户信息 ============
  getUserInfo(): any | null {
    const raw = localStorage.getItem(USER_INFO_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setUserInfo(info: any): void {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(info));
  },
  removeUserInfo(): void {
    localStorage.removeItem(USER_INFO_KEY);
  },

  // ============ 偏好缓存（防止网络抖动） ============
  getPreferenceCache(): any | null {
    const raw = localStorage.getItem(PREFERENCE_CACHE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setPreferenceCache(pref: any): void {
    localStorage.setItem(PREFERENCE_CACHE_KEY, JSON.stringify(pref));
  },

  // ============ 提醒兜底缓存 ============
  getReminderCache(): { mealReminder: boolean; reminderTime: string } | null {
    const raw = localStorage.getItem(REMINDER_CACHE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setReminderCache(data: { mealReminder: boolean; reminderTime: string }): void {
    localStorage.setItem(REMINDER_CACHE_KEY, JSON.stringify(data));
  },

  // ============ 一键清空（退出登录用） ============
  clearAll(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
    localStorage.removeItem(PREFERENCE_CACHE_KEY);
    localStorage.removeItem('shi2wuzhe_guest_mode'); 

    // 不清提醒缓存，因为提醒是设备级偏好
  },
    // ============ 游客模式 ============
  GUEST_KEY: 'shi2wuzhe_guest_mode',
  
  isGuest(): boolean {
    return localStorage.getItem('shi2wuzhe_guest_mode') === '1';
  },
  setGuestMode(): void {
    localStorage.setItem('shi2wuzhe_guest_mode', '1');
  },
  clearGuestMode(): void {
    localStorage.removeItem('shi2wuzhe_guest_mode');
  },
  
  /** 是否已选择身份（登录 or 游客）*/
  hasChosenIdentity(): boolean {
    return !!this.getToken() || this.isGuest();
  },
};