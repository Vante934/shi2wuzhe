/**
 * 菜谱图片兜底工具
 *
 * 优先级：
 *   1. 菜谱的 coverImage 字段（数据库真实图片）
 *   2. recipeUtils 里的本地映射图（getRecipeImageUrl）
 *   3. 默认美食兜底图
 */
import { getRecipeImageUrl } from './recipeUtils';
import type { Recipe } from '../types';

/** 默认美食兜底图（unsplash 公开图） */
export const DEFAULT_RECIPE_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';

/**
 * 获取菜谱最终展示图片 URL
 * @param recipe 菜谱对象
 * @returns 一定有值（最差返回默认兜底图）
 */
export function resolveRecipeImage(recipe: Partial<Recipe> & { coverImage?: string; name?: string }): string {
  if (!recipe) return DEFAULT_RECIPE_IMAGE;
  // 1. 数据库 coverImage
  const dbImage = (recipe as any).coverImage;
  if (dbImage && typeof dbImage === 'string' && dbImage.trim()) {
    return dbImage;
  }
  // 2. 本地映射（如果有）
  const localImage = getRecipeImageUrl(recipe.name || '');
  if (localImage) return localImage;
  // 3. 兜底
  return DEFAULT_RECIPE_IMAGE;
}