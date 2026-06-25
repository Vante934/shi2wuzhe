/**
 * 灵感模块 Hook（Random Generator）
 * 接管：随机生成、单格换一道、营养汇总、子视图切换
 *
 * ⚠️ 当前使用前端 mock：RECIPES_DATABASE
 * ⚠️ 后续接入后端：
 *    - 随机生成：recipeApi.random()
 *    - 灵感搜索：recipeApi.search(keyword)
 *    - 字段映射：mapRecipeDTOToRecipe (mappers.ts)
 */
import { useState, useMemo, useCallback } from 'react';
import { RECIPES_DATABASE } from '../data';
import type { Recipe } from '../types';

interface UseInspirationOptions {
  /** 用户偏好里的忌口食材（由 App 注入） */
  forbiddenFoodsSelected: string[];
  /** ⭐ 厨艺等级（junior=厨房小白 / senior=厨房大佬） */
  cookingLevel?: 'junior' | 'senior';
}

export function useInspiration(options: UseInspirationOptions) {
  const { forbiddenFoodsSelected, cookingLevel = 'junior' } = options;

  // ============ 子视图切换 ============
  const [inspirationSubView, setInspirationSubView] = useState<'search' | 'square' | 'generator'>('generator');
  const [inspirationSearchQuery, setInspirationSearchQuery] = useState('');

  // ============ 随机生成 ============
  const [inspirationCount, setInspirationCount] = useState(6);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [isBulbGlow, setIsBulbGlow] = useState(false);
  const [randomizedRecipes, setRandomizedRecipes] = useState<Recipe[]>(RECIPES_DATABASE.slice(0, 6));

  // ============ 营养汇总 ============
  const aggregatedRandomNutrition = useMemo(() => {
    let protein = 0;
    let carb = 0;
    let fat = 0;
    let calories = 0;

    randomizedRecipes.forEach((r) => {
      protein += r.protein;
      carb += r.carbohydrates;
      fat += r.fat;
      calories += r.calories;
    });

    return { protein, carb, fat, calories };
  }, [randomizedRecipes]);

  // ============ Actions ============

  /** 摇一摇生成菜谱 */
  const handleSpinInspiration = useCallback(() => {
    if (isSpinning) return;
    setIsSpinning(true);
    setIsBulbGlow(true);

    let cyclesCount = 0;
    const interval = setInterval(() => {
      const tempPool = [...RECIPES_DATABASE];
      const randomized: Recipe[] = [];
      const trackingIds = new Set<string>();

      while (randomized.length < Math.min(inspirationCount, tempPool.length)) {
        const randomIndex = Math.floor(Math.random() * tempPool.length);
        const item = tempPool[randomIndex];
        const containsForbidden = item.steps.some((step) =>
          forbiddenFoodsSelected.some((forbidden) => step.includes(forbidden))
        );
        if (!trackingIds.has(item.id) && !containsForbidden) {
          randomized.push(item);
          trackingIds.add(item.id);
        }
      }
      setRandomizedRecipes(randomized);
      cyclesCount++;
      if (cyclesCount > 8) {
        clearInterval(interval);
        setIsSpinning(false);
        setIsGenerated(true);
      }
    }, 90);
  }, [isSpinning, inspirationCount, forbiddenFoodsSelected]);

  /** 单格换一道 */
  const handleRefreshSingleInspiration = useCallback(
    (idxToReplace: number) => {
      const currentList = [...randomizedRecipes];
      const excludedIds = currentList.map((r) => r.id);
      const availablePool = RECIPES_DATABASE.filter(
        (r) =>
          !excludedIds.includes(r.id) &&
          !r.steps.some((step) => forbiddenFoodsSelected.some((f) => step.includes(f)))
      );

      if (availablePool.length > 0) {
        const freshChoice = availablePool[Math.floor(Math.random() * availablePool.length)];
        currentList[idxToReplace] = freshChoice;
        setRandomizedRecipes(currentList);
      }
    },
    [randomizedRecipes, forbiddenFoodsSelected]
  );

  return {
    // ⭐ 厨艺等级透传，给 InspirationPage 拉数据用
    cookingLevel,

    // 子视图
    inspirationSubView,
    setInspirationSubView,
    inspirationSearchQuery,
    setInspirationSearchQuery,

    // 生成
    inspirationCount,
    setInspirationCount,
    isSpinning,
    setIsSpinning,
    isGenerated,
    setIsGenerated,
    isBulbGlow,
    setIsBulbGlow,
    randomizedRecipes,
    setRandomizedRecipes,

    // 衍生
    aggregatedRandomNutrition,

    // Actions
    handleSpinInspiration,
    handleRefreshSingleInspiration,
  };
}