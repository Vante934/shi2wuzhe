/**
 * 我的收藏菜谱 Hook
 * 真实接口：GET /api/user/collects
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { userApi } from '../api/modules/user';
import { mapRecipeDTOToRecipe } from '../api/mappers';
import type { Recipe } from '../types';

export function useMyCollects() {
  const [collectedRecipes, setCollectedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const hasFetchedRef = useRef(false);

  const fetchCollects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userApi.getCollects({ pageNum: 1, pageSize: 100 });
      const records = (res.data?.records || []) as any[];
      const recipes = records.map(mapRecipeDTOToRecipe);
      setCollectedRecipes(recipes);
    } catch (err) {
      console.warn('[useMyCollects] 拉取失败', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchCollects();
  }, [fetchCollects]);

  return {
    collectedRecipes,
    setCollectedRecipes,
    refreshCollects: fetchCollects,
    loading,
  };
}