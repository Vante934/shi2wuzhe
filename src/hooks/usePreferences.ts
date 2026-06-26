/**
 * 用户偏好设置 hook
 * 自动从后端加载，提供保存方法
 * 接口失败时降级到本地缓存
 */
import { useState, useEffect, useCallback } from 'react';
import { userApi } from '../api/modules/user';
import { storage } from '../api';
import {
  mapPreferenceDTOToViewModel,
  mapPreferenceViewModelToDTO,
  type PreferenceViewModel,
} from '../api/mappers';

const DEFAULT_PREFERENCES: PreferenceViewModel = {
  cookingLevel: 'senior',        // ⭐ 大佬
  tasteTendency: '不挑（默认）',
  avoidIngredients: [],          // ⭐ 无
  allergens: [],                 // ⭐ 无
  commonTools: [],
  mealReminder: false,           // ⭐ 关
  reminderTime: '12:00',
};

export function usePreferences() {
  const [preferences, setPreferences] = useState<PreferenceViewModel>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 加载偏好（先缓存后接口）
  useEffect(() => {
    const cached = storage.getPreferenceCache();
    if (cached) {
      setPreferences(cached);
    }

    // 兜底：提醒功能本地优先
    const reminderCache = storage.getReminderCache();

    setLoading(true);
    userApi.getPreference()
      .then((res) => {
        if (res.data) {
          const vm = mapPreferenceDTOToViewModel(res.data);
          // 如果后端没返回 meal_reminder/reminder_time，用本地缓存兜底
          if (reminderCache && (res.data.mealReminder === undefined || res.data.mealReminder === null)) {
            vm.mealReminder = reminderCache.mealReminder;
            vm.reminderTime = reminderCache.reminderTime;
          }
          setPreferences(vm);
          storage.setPreferenceCache(vm);
        }
      })
        .catch((err) => {
          console.info('[usePreferences] 后端偏好接口未就绪，使用本地缓存');
          // 已经在 try 之前从 storage 读了 cached，这里不用做事
          // 但确保提醒缓存正确加载
          if (reminderCache) {
            setPreferences((prev) => ({
              ...prev,
              mealReminder: reminderCache.mealReminder,
              reminderTime: reminderCache.reminderTime,
            }));
          }
        })
      .finally(() => setLoading(false));
  }, []);

  // 本地更新（即时反馈，不调接口）
  const updateLocal = useCallback((patch: Partial<PreferenceViewModel>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...patch };
      // 同步缓存
      storage.setPreferenceCache(next);
      // 提醒兜底缓存
      if (patch.mealReminder !== undefined || patch.reminderTime !== undefined) {
        storage.setReminderCache({
          mealReminder: next.mealReminder,
          reminderTime: next.reminderTime,
        });
      }
      return next;
    });
  }, []);

  // 保存到后端
  const saveToServer = useCallback(async (override?: PreferenceViewModel) => {
    const target = override || preferences;
    setSaving(true);
    try {
      const dto = mapPreferenceViewModelToDTO(target);
      await userApi.updatePreference(dto);
      storage.setPreferenceCache(target);
      return true;
    } catch (err) {
      console.error('[usePreferences] 保存失败', err);
      return false;
    } finally {
      setSaving(false);
    }
  }, [preferences]);

  return {
    preferences,
    loading,
    saving,
    updateLocal,
    saveToServer,
  };
}