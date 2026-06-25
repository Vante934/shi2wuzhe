/**
 * 我的食谱页面 4 个 tab 的数据 hook
 * 游客模式下：不调任何接口，返回空数组
 */
import { useState, useCallback, useEffect } from 'react';
import { userApi, communityApi, storage } from '../api';
import {
  mapCommunityPostDTOToSocialPost,
  mapRecipeDTOToRecipe,
} from '../api/mappers';
import type { SocialPost, Recipe } from '../types';

export type MyRecipeTab = 'published' | 'savedPosts' | 'drafts' | 'savedRecipes';

export function useMyRecipesData() {
  const [publishedPosts, setPublishedPosts] = useState<SocialPost[]>([]);
  const [savedPosts, setSavedPosts]         = useState<SocialPost[]>([]);
  const [drafts, setDrafts]                 = useState<SocialPost[]>([]);
  const [savedRecipes, setSavedRecipes]     = useState<Recipe[]>([]);
  const [loading, setLoading]               = useState<MyRecipeTab | null>(null);

  /** 游客判断 */
  const isGuest = () => storage.isGuest() || !storage.getToken();

  const fetchPublished = useCallback(async () => {
    if (isGuest()) { setPublishedPosts([]); return; }
    setLoading('published');
    try {
      const res = await communityApi.getMyPosts({ status: 1, pageNum: 1, pageSize: 50 });
      const records = (res.data?.records || []) as any[];
      setPublishedPosts(records.map(mapCommunityPostDTOToSocialPost));
    } catch (err) {
      console.warn('[useMyRecipesData] 拉取原创发布失败', err);
    } finally { setLoading(null); }
  }, []);

  const fetchSavedPosts = useCallback(async () => {
    if (isGuest()) { setSavedPosts([]); return; }
    setLoading('savedPosts');
    try {
      const res = await userApi.getCollects({ targetType: 2, pageNum: 1, pageSize: 50 });
      const records = (res.data?.records || []) as any[];
      setSavedPosts(records.map(mapCommunityPostDTOToSocialPost));
    } catch (err) {
      console.warn('[useMyRecipesData] 拉取社区收藏失败', err);
    } finally { setLoading(null); }
  }, []);

  const fetchDrafts = useCallback(async () => {
    if (isGuest()) { setDrafts([]); return; }
    setLoading('drafts');
    try {
      const res = await communityApi.getMyPosts({ status: 3, pageNum: 1, pageSize: 50 });
      const records = (res.data?.records || []) as any[];
      setDrafts(records.map(mapCommunityPostDTOToSocialPost));
    } catch (err) {
      console.warn('[useMyRecipesData] 拉取草稿失败', err);
    } finally { setLoading(null); }
  }, []);

  const fetchSavedRecipes = useCallback(async () => {
    if (isGuest()) { setSavedRecipes([]); return; }
    setLoading('savedRecipes');
    try {
      const res = await userApi.getCollects({ targetType: 1, pageNum: 1, pageSize: 50 });
      const records = (res.data?.records || []) as any[];
      setSavedRecipes(records.map(mapRecipeDTOToRecipe));
    } catch (err) {
      console.warn('[useMyRecipesData] 拉取食谱收藏失败', err);
    } finally { setLoading(null); }
  }, []);

  useEffect(() => {
    fetchPublished();
    fetchSavedPosts();
    fetchDrafts();
    fetchSavedRecipes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    publishedPosts, setPublishedPosts,
    savedPosts,     setSavedPosts,
    drafts,         setDrafts,
    savedRecipes,   setSavedRecipes,
    loading,
    refresh: {
      published:    fetchPublished,
      savedPosts:   fetchSavedPosts,
      drafts:       fetchDrafts,
      savedRecipes: fetchSavedRecipes,
      all: () => {
        fetchPublished();
        fetchSavedPosts();
        fetchDrafts();
        fetchSavedRecipes();
      },
    },
  };
}