/**
 * 食材模块接口
 */
import { request, PageResult } from '../request';
import type { IngredientDTO, IngredientCategoryDTO } from '../types';

export const ingredientApi = {
  /** 食材分类列表 */
  getCategoryList() {
    return request.get<IngredientCategoryDTO[]>('/api/ingredient/category/list');
  },

  /** 食材列表（分页） */
  getList(params: { categoryId?: number; pageNum?: number; pageSize?: number } = {}) {
    return request.get<PageResult<IngredientDTO>>('/api/ingredient/list', {
      pageNum: 1,
      pageSize: 20,
      ...params,
    });
  },

  /** 食材搜索 */
  search(keyword: string) {
    return request.get<IngredientDTO[]>('/api/ingredient/search', { keyword });
  },

  /** 食材详情 */
  getDetail(id: number) {
    return request.get<IngredientDTO>(`/api/ingredient/${id}`);
  },
};