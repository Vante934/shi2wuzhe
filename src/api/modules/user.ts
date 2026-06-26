/**
 * 用户模块接口
 */
import { request, PageResult } from '../request';
import type {
  UserPreferenceDTO,
  CookingRecordDTO,
  CookingRecordAddDTO,
} from '../types';

export const userApi = {
  getPreference() {
    return request.get<UserPreferenceDTO>('/api/user/preference');
  },

  updatePreference(data: Partial<UserPreferenceDTO>) {
    return request.put('/api/user/preference', data);
  },

  /** 更新个人资料：昵称/头像/签名 */
updateProfile(data: { nickName?: string; customAvatar?: string; bio?: string }) {
   return request.put('/api/user/update-profile', data); 
},

/** 获取当前用户的扩展信息（头像、签名） */
getMyExtend() {
  return request.get<{ customAvatar?: string; bio?: string }>('/api/user/extend');
},


  /**
   * 我的收藏列表
   * targetType: 1=菜谱  2=帖子
   */
  getCollects(params: { targetType?: 1 | 2; pageNum?: number; pageSize?: number } = {}) {
    return request.get<PageResult<any>>('/api/user/collects', {
      targetType: 1,
      pageNum: 1,
      pageSize: 100,
      ...params,
    });
  },

  getCookingRecords(params: { pageNum?: number; pageSize?: number } = {}) {
    return request.get<PageResult<CookingRecordDTO>>('/api/user/cooking-records', {
      pageNum: 1,
      pageSize: 50,
      ...params,
    });
  },

  addCookingRecord(data: CookingRecordAddDTO) {
    return request.post('/api/user/cooking-record/add', data);
  },

  updateCookingRecord(id: string | number, data: Partial<CookingRecordAddDTO>) {
    return request.put(`/api/user/cooking-record/${id}`, data);
  },

  deleteCookingRecord(id: string | number) {
    return request.delete(`/api/user/cooking-record/${id}`);
  },

    /** 本周营养统计 */
  getWeeklyNutrition() {
    return request.get<{
      weekData: Array<{ day: string; kcal: number; isToday: boolean; isOver: boolean }>;
      avgIntake: number;
      baselineKcal: number;
      diffPercent: number;
      dailyDiff: number;
      proteinRate: number;
      glIndex: number;
      carbsPct: number;
      proteinPct: number;
      fatPct: number;
      hasData: boolean;
    }>('/api/user/nutrition/weekly');
  },

    /** 个人主页统计 */
  getProfileStats() {
    return request.get<{
      cookingCount: number;
      likeAndCollectCount: number;
      followingCount: number;
      followerCount: number;
    }>('/api/user/profile-stats');
  },

  toggleFollow(followingId: number) {
    return request.post<{ followed: boolean }>('/api/user/follow', { followingId });
  },
};