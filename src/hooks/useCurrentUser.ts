/**
 * 当前登录用户信息 hook
 * - 未登录时不调 getInfo，避免 401
 * - 增加 isGuest 字段，供组件判断游客态
 * - ⭐ 拆分 username → account（账号，只读）+ nickname（昵称，可改）
 */
import { useState, useEffect } from 'react';
import { storage } from '../api';
import { authApi } from '../api/modules/auth';

export interface CurrentUserVM {
  userId: number | null;
  account: string;     // ⭐ 新增：账号（userName，注册时定，只读）
  nickname: string;    // ⭐ 改名：昵称（nickName，可改）
  avatar: string;
  bio: string;
  region: string;
  gender: string;
  constellation: string;
  isLogged: boolean;
  isGuest: boolean;
}

const DEFAULT_USER: CurrentUserVM = {
  userId: null,
  account: 'guest',
  nickname: '游客',
  avatar: '🧑‍🍳',
  bio: '游客身份浏览中,登录解锁全部功能',
  region: '未知',
  gender: '♀',
  constellation: '未知',
  isLogged: false,
  isGuest: true,
};

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUserVM>(DEFAULT_USER);
  const [loading, setLoading] = useState(false);

  const mapUser = (u: any): CurrentUserVM => {
    if (!u) return DEFAULT_USER;
    return {
      userId: u.userId ?? null,
      account: u.userName || 'unknown',                           // ⭐ 账号 = userName
      nickname: u.nickName || u.userName || '识食物者',            // ⭐ 昵称 = nickName
      avatar: u.customAvatar || u.avatar || '🎒',
      bio: u.bio || '识食物者为俊杰,今天也有好好吃饭！',
      region: u.region || '吉林',
      gender: u.sex === '0' ? '♂' : u.sex === '1' ? '♀' : '♀',
      constellation: u.constellation || '天秤座',
      isLogged: true,
      isGuest: false,
    };
  };

  useEffect(() => {
    const token = storage.getToken();
    
    if (!token) {
      setUser({ ...DEFAULT_USER, isGuest: storage.isGuest() });
      return;
    }

    const cached = storage.getUserInfo();
    if (cached?.user) {
      setUser(mapUser(cached.user));
    }

    setLoading(true);
    authApi.getInfo()
      .then((info) => setUser(mapUser(info.user)))
      .catch((err) => {
        console.warn('[useCurrentUser] 获取用户信息失败', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const updateLocal = (patch: Partial<CurrentUserVM>) => {
    setUser((prev) => ({ ...prev, ...patch }));
  };

  return {
    user,
    loading,
    updateLocal,
  };
}