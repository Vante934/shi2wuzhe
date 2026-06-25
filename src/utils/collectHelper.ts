/**
 * 收藏切换通用工具
 * 游客模式：拦截 + Toast
 */
import { recipeApi, storage } from '../api';

const isGuest = () => storage.isGuest() || !storage.getToken();

export async function toggleRecipeCollect(
  recipeId: string | number,
  setStarredRecipes: (updater: (prev: string[]) => string[]) => void,
  showToast: (msg: string) => void
): Promise<boolean | null> {
  // 游客拦截：只 Toast，不弹登录窗
  if (isGuest()) {
    showToast('收藏功能需要登录后使用，请先登录或注册');
    return null;
  }

  try {
    const res = await recipeApi.toggleCollect(recipeId);
    const collected = (res as any)?.data?.collected ?? (res as any)?.collected;
    const idStr = String(recipeId);

    setStarredRecipes((prev) => {
      if (collected) {
        return prev.includes(idStr) ? prev : [...prev, idStr];
      } else {
        return prev.filter((x) => x !== idStr);
      }
    });

    showToast(collected ? '已收藏到「我的食谱」' : '已取消收藏');
    return collected;
  } catch (err: any) {
    console.error('[collectHelper] 收藏失败', err);
    const msg = err?.response?.status === 401
      ? '请先登录后再收藏'
      : '收藏失败，请稍后重试';
    showToast(msg);
    return null;
  }
}