/**
 * 菜谱模块接口
 *
 * 阶段2.1 修复：
 *   - 移除所有 url 中的 /api 前缀（因为 request.ts 的 baseURL 已是 ''，
 *     vite代理 /api 直接转发到后端 /api/xxx）
 *   - 新增 orderBy 参数支持按拼音/创建时间排序
 */
import { request, PageResult } from '../request';
import type { RecipeDTO } from '../types';

export interface RecipeListParams {
  cuisineType?: string;
  difficulty?: number;
  /** ⭐ 多值难度过滤（厨艺等级用），如 [1,2,3] 表示只要入门/比较容易/中等 */
  difficulties?: number[];
  maxCookTime?: number;
  orderBy?: 'create_time' | 'view_count' | 'like_count' | 'title';
  pageNum?: number;
  pageSize?: number;
}

export const recipeApi = {
  /** 菜谱列表 */
  getList(params: RecipeListParams = {}) {
    // ⭐ difficulties 数组转逗号字符串，给后端
    const { difficulties, ...rest } = params;
    const finalParams: any = { pageNum: 1, pageSize: 10, ...rest };
    if (difficulties && difficulties.length > 0) {
      finalParams.difficulties = difficulties.join(',');
    }
    return request.get<PageResult<RecipeDTO>>('/api/recipe/list', finalParams);
  },

  /** 菜谱搜索 */
  search(keyword: string, params: { pageNum?: number; pageSize?: number; difficulties?: number[] } = {}) {
    const { difficulties, ...rest } = params;
    const finalParams: any = {
      keyword,
      pageNum: 1,
      pageSize: 30,
      ...rest,
    };
    if (difficulties && difficulties.length > 0) {
      finalParams.difficulties = difficulties.join(',');
    }
    return request.get<PageResult<RecipeDTO>>('/api/recipe/search', finalParams);
  },
  
  /** 菜谱详情 */
  getDetail(id: string | number) {
    return request.get<RecipeDTO>(`/api/recipe/${id}`);
  },

  /** 发布菜谱 */
  publish(data: Partial<RecipeDTO>) {
    return request.post('/api/recipe/publish', data);
  },

  /** 收藏 / 取消收藏 */
  toggleCollect(recipeId: string | number) {
    return request.post<{ collected: boolean }>('/api/recipe/collect', {
      recipeId: Number(recipeId),
    });
  },

  /** 点赞 / 取消点赞 */
  toggleLike(recipeId: string | number) {
    return request.post<{ liked: boolean }>('/api/recipe/like', {
      recipeId: Number(recipeId),
    });
  },

    /**
   * ⭐ 按食材匹配菜谱（EatWell 流程用）
   * @param ingredients 用户购物车的食材名数组
   * @param difficulties 厨艺等级允许的难度
   * @param matchMode strict / fuzzy / survival
   * @returns { list, degraded, actualMode, total }
   */
  match(data: {
    ingredients: string[];
    difficulties?: number[];
    matchMode?: 'strict' | 'fuzzy' | 'survival';
    avoidIngredients?: string[];
    pot?: string;
  }) {
    return request.post<{
      list: RecipeDTO[];
      degraded: boolean;
      actualMode: 'strict' | 'fuzzy' | 'survival';
      total: number;
    }>('/api/recipe/match', {
      ingredients: data.ingredients || [],
      difficulties: data.difficulties || [],
      matchMode: data.matchMode || 'fuzzy',
      avoidIngredients: data.avoidIngredients || [],
      pot: data.pot || '',
    });
  },
  /** AI 生成菜谱（后端未就绪，暂留接口） */
  generate(data: {
    ingredients: string[];
    cookingLevel?: string;
    preferences?: string;
  }) {
    return request.post<RecipeDTO>('/api/recipe/generate', data);
  },

  /** 随机推荐（后端未就绪，暂留接口） */
  random() {
    return request.post<RecipeDTO>('/api/recipe/random');
  },
}
