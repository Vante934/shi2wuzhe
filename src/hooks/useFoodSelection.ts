/**
 * 食材选择 / 烹饪流程 Hook（EatWell 模块核心）
 *
 * 阶段1.5 改动：
 *   - 拉取食材时把 isCommon 字段一并保留（虽然 Food 类型里没这字段）
 *   - 按 isCommon DESC, id ASC 排序，常用食材自动置顶
 *
 * 数据流：
 *   ingredientApi.getList → 后端 records[] →
 *   mapIngredientDTOToFood 转 Food[] → 按 isCommon 排序 →
 *   存入 serverFoods → useMemo 按 category 拆三类 →
 *   渲染到 FoodSelectorPage
 */
import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  ROSTER_VEGGIES,
  ROSTER_MEATS,
  ROSTER_STAPLES,
  RECIPES_DATABASE,
} from '../data';
import { getRecipeIngredients } from '../utils/recipeUtils';
import { ingredientApi } from '../api/modules/ingredient';
import { recipeApi } from '../api/modules/recipe';
import { mapIngredientDTOToFood, mapRecipeDTOToRecipe } from '../api/mappers';
import type { Food, Recipe } from '../types';

export interface FlyingItem {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  emoji: string;
}

interface UseFoodSelectionOptions {
  forbiddenFoodsSelected: string[];
  /** 厨艺等级 */
  cookingLevel?: 'junior' | 'senior';
  /** ⭐ 过敏原（一并加入忌口过滤） */
  allergens?: string[];
}

export function useFoodSelection(options: UseFoodSelectionOptions) {
  const { forbiddenFoodsSelected, cookingLevel = 'junior', allergens = [] } = options;

  // ==========================================================================
  // 流程步骤
  // ==========================================================================
  const [subStep, setSubStep] = useState(0);

  // ==========================================================================
  // 已选食材
  // ==========================================================================
  const [selectedVeggies, setSelectedVeggies] = useState<string[]>([]);
  const [selectedMeats, setSelectedMeats] = useState<string[]>([]);
  const [selectedStaples, setSelectedStaples] = useState<string[]>([]);
  const [selectionOrder, setSelectionOrder] = useState<string[]>([]);

  // ==========================================================================
  // 配置
  // ==========================================================================
  const [activePot, setActivePot] = useState('全能能炒能煮大锅');
  const [potScale, setPotScale] = useState(3);
  const [matchingMode, setMatchingMode] = useState<'strict' | 'fuzzy' | 'survival'>('strict');
  const [hasSelectedSideCookware, setHasSelectedSideCookware] = useState(false);

  // ==========================================================================
  // 购物车UI
  // ==========================================================================
  const [isBasketOpen, setIsBasketOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [cartBadgePop, setCartBadgePop] = useState(false);

  // ==========================================================================
  // 菜谱列表（⭐ 阶段10A：改为存放后端 match 接口返回的真实菜谱）
  // ==========================================================================
  const [shownRecipeIds, setShownRecipeIds] = useState<string[]>(['1', '2', '3', '4', '5', '6', '7', '8']);
  const [selectedResultsRecipeId, setSelectedResultsRecipeId] = useState<string | null>(null);
  const [showMatchWarning, setShowMatchWarning] = useState(false);

  // ⭐ 新增：后端 match 接口返回的菜谱完整数据（VM 已转好）
  const [matchedRecipes, setMatchedRecipes] = useState<Recipe[]>([]);
  // ⭐ 新增：接口是否降级（strict 无果 → fuzzy / fuzzy 无果 → survival）
  const [matchDegraded, setMatchDegraded] = useState(false);
  // ⭐ 新增：是否正在加载
  const [matchingLoading, setMatchingLoading] = useState(false);

  // ==========================================================================
  // 菜谱详情
  // ==========================================================================
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  const [activeCookingStepIndex, setActiveCookingStepIndex] = useState(0);
  const [recipeDetailSource, setRecipeDetailSource] = useState<
    'eatwell_recommend' | 'random_inspiration' | 'recipe_square' | 'profile_starred'
  >('eatwell_recommend');

  // ==========================================================================
  // 弹窗
  // ==========================================================================
  const [showNoIngredientsPopup, setShowNoIngredientsPopup] = useState(false);
  const [showCongratsSuccess, setShowCongratsSuccess] = useState(false);
  const [showRecipeSharePopup, setShowRecipeSharePopup] = useState(false);
  const [showWXQRCode, setShowWXQRCode] = useState(false);

  // ==========================================================================
  // 飞入动画
  // ==========================================================================
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);

  // ==========================================================================
  // 后端食材池（阶段1.5：增加 isCommon 排序）
  // ==========================================================================
  const [serverFoods, setServerFoods] = useState<Food[]>([]);
  const [foodsLoading, setFoodsLoading] = useState(false);
  const [foodsError, setFoodsError] = useState<string | null>(null);
  const [usingMock, setUsingMock] = useState(false);

  /**
   * 拉取后端食材列表
   *
   * 排序策略（阶段1.6 升级）：
   *   1. is_common=1 的常用食材绝对优先（无论emoji是否独特）
   *   2. 同常用度内：emoji 独特的（非分类默认值）排在前面，视觉上更丰富
   *   3. 同上两条件相同：按数据库 id 升序
   *
   * 设计理由：
   *   后端 791 条食材，很多生僻食材会用分类默认 emoji
   *   把"emoji独特"的食材置顶，能让用户第一眼看到的食材视觉差异最大
   */
  const fetchIngredients = useCallback(async () => {
    setFoodsLoading(true);
    setFoodsError(null);
    try {
      const res = await ingredientApi.getList({ pageNum: 1, pageSize: 1000 });
      const records: any[] =
        (res.data as any)?.records ||
        (res as any).rows ||
        (res as any).records ||
        [];

      if (records.length === 0) {
        throw new Error('后端返回食材列表为空');
      }

      // ⭐ 阶段1.7：完全信任后端排序
      // 后端 IngredientServiceImpl 已按 sort_order ASC → is_common DESC → id ASC 排序
      // 想调整某个食材位置 → 改数据库 ingredient.sort_order 字段（越小越靠前）
      // 前端不再二次排序，保留后端原顺序
      const foods = records.map(mapIngredientDTOToFood);
      setServerFoods(foods);
      setUsingMock(false);
    } catch (err: any) {
      console.warn('[useFoodSelection] 食材接口失败，降级到本地Mock', err);
      setFoodsError(err?.message || '加载失败');
      setUsingMock(true);
      setServerFoods([...ROSTER_VEGGIES, ...ROSTER_MEATS, ...ROSTER_STAPLES]);
    } finally {
      setFoodsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  // ==========================================================================
  // 按 category 拆分（保持排序）
  // ==========================================================================
  const allVeggies = useMemo(
    () => serverFoods.filter((f) => f.category === 'veggie'),
    [serverFoods]
  );
  const allMeats = useMemo(
    () => serverFoods.filter((f) => f.category === 'meat'),
    [serverFoods]
  );
  const allStaples = useMemo(
    () => serverFoods.filter((f) => f.category === 'staple'),
    [serverFoods]
  );

  // ==========================================================================
  // 衍生值
  // ==========================================================================
  const basketCount = useMemo(() => {
    return selectedVeggies.length + selectedMeats.length + selectedStaples.length;
  }, [selectedVeggies, selectedMeats, selectedStaples]);

  const selectedListWithDetails = useMemo(() => {
    const combined: Food[] = [];
    selectionOrder.forEach((name) => {
      const match = serverFoods.find((x) => x.name === name);
      if (match) combined.push(match);
    });
    return combined;
  }, [selectionOrder, serverFoods]);

  const selectedBasketCaloriesTotal = useMemo(() => {
    return selectedListWithDetails.reduce((sum, item) => sum + (item.calories || 0), 0);
  }, [selectedListWithDetails]);

  const isExactIngredientsMatch = useMemo(() => {
    if (selectedListWithDetails.length === 0) return false;
    const basketNames = selectedListWithDetails.map((x) => x.name);
    return shownRecipeIds.some((id) => {
      const recipe = RECIPES_DATABASE.find((r) => r.id === id);
      if (!recipe) return false;
      const reqIngs = getRecipeIngredients(recipe.name);
      return reqIngs.every((ing) => basketNames.includes(ing));
    });
  }, [selectedListWithDetails, shownRecipeIds]);

  const availableVeggiesFiltered = useMemo(() => {
    return allVeggies.filter((v) => !forbiddenFoodsSelected.includes(v.name));
  }, [allVeggies, forbiddenFoodsSelected]);

  const availableMeatsFiltered = useMemo(() => {
    return allMeats.filter((m) => !forbiddenFoodsSelected.includes(m.name));
  }, [allMeats, forbiddenFoodsSelected]);

  const availableStaplesFiltered = useMemo(() => {
    return allStaples.filter((s) => !forbiddenFoodsSelected.includes(s.name));
  }, [allStaples, forbiddenFoodsSelected]);

  // ==========================================================================
  // 副作用
  // ==========================================================================
  useEffect(() => {
    if (subStep === 5) {
      if (isExactIngredientsMatch) {
        setShowMatchWarning(false);
      } else {
        setShowMatchWarning(true);
        const timer = setTimeout(() => {
          setShowMatchWarning(false);
        }, 5500);
        return () => clearTimeout(timer);
      }
    }
  }, [subStep, isExactIngredientsMatch]);

    // ==========================================================================
  // ⭐ 阶段10A：调后端 match 接口
  // ==========================================================================
  /**
   * 根据当前购物车 + 厨艺等级 + 匹配模式调后端，拉真实菜谱推荐
   * 在进入 subStep=5 之前调用，或者用户手动"重新匹配"时调用
   */
  const fetchMatchedRecipes = useCallback(async () => {
    const allSelected = [
      ...selectedVeggies,
      ...selectedMeats,
      ...selectedStaples,
    ];

    setMatchingLoading(true);
    try {
      const difficulties = cookingLevel === 'senior' ? undefined : [1, 2, 3];

      // ⭐ 忌口 = 偏好里的忌口食材 + 过敏原
      const avoidList = Array.from(new Set([
        ...forbiddenFoodsSelected,
        ...allergens,
      ]));

      const res = await recipeApi.match({
        ingredients: allSelected,
        difficulties,
        matchMode: matchingMode,
        avoidIngredients: avoidList,
        pot: activePot,
      });
      const raw: any = (res as any).data || res;
      const list: any[] = raw?.list || [];
      const mapped = list.map(mapRecipeDTOToRecipe);

      setMatchedRecipes(mapped);
      setMatchDegraded(Boolean(raw?.degraded));

      // 兼容旧逻辑：把 ID 也同步到 shownRecipeIds（虽然不再用，但避免别处报错）
      setShownRecipeIds(mapped.map((r) => r.id));

      console.info(
        `[useFoodSelection] match 成功，模式=${raw?.actualMode}，命中=${mapped.length} 道`
      );
    } catch (err) {
      console.warn('[useFoodSelection] match 接口失败，降级到本地 mock', err);
      setMatchDegraded(true);
      // 不动 matchedRecipes，让 RecipeResultPage 用本地 mock 兜底
    } finally {
      setMatchingLoading(false);
    }
  }, [selectedVeggies, selectedMeats, selectedStaples, cookingLevel, matchingMode, activePot, forbiddenFoodsSelected, allergens]);
  // ⭐ 进入 subStep=5 时自动拉一次
  useEffect(() => {
    if (subStep === 5) {
      fetchMatchedRecipes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subStep]);

  // ==========================================================================
  // 操作方法
  // ==========================================================================
  const handleToggleIngredient = useCallback(
    (name: string, category: 'veggie' | 'meat' | 'staple', e?: React.MouseEvent) => {
      const isSelecting =
        category === 'veggie'
          ? !selectedVeggies.includes(name)
          : category === 'meat'
          ? !selectedMeats.includes(name)
          : !selectedStaples.includes(name);

      if (isSelecting && e) {
        const findEmoji = (ingName: string): string => {
          const found = serverFoods.find((x) => x.name === ingName);
          return found ? found.emoji : '🥦';
        };
        const emo = findEmoji(name);

        const cartEl = document.getElementById('shopping-cart-btn');
        let targetX = window.innerWidth / 2;
        let targetY = window.innerHeight - 80;
        if (cartEl) {
          const rect = cartEl.getBoundingClientRect();
          targetX = rect.left + rect.width / 2;
          targetY = rect.top + rect.height / 2;
        }

        const flyId = Date.now() + Math.random();
        setFlyingItems((prev) => [
          ...prev,
          { id: flyId, x: e.clientX, y: e.clientY, targetX, targetY, emoji: emo },
        ]);

        setCartBadgePop(true);
        setTimeout(() => setCartBadgePop(false), 300);

        setTimeout(() => {
          setFlyingItems((prev) => prev.filter((x) => x.id !== flyId));
        }, 900);
      }

      if (category === 'veggie') {
        setSelectedVeggies((prev) => {
          const has = prev.includes(name);
          if (has) {
            setSelectionOrder((order) => order.filter((x) => x !== name));
            return prev.filter((x) => x !== name);
          } else {
            setSelectionOrder((order) => [...order.filter((x) => x !== name), name]);
            return [...prev, name];
          }
        });
      } else if (category === 'meat') {
        setSelectedMeats((prev) => {
          const has = prev.includes(name);
          if (has) {
            setSelectionOrder((order) => order.filter((x) => x !== name));
            return prev.filter((x) => x !== name);
          } else {
            setSelectionOrder((order) => [...order.filter((x) => x !== name), name]);
            return [...prev, name];
          }
        });
      } else {
        setSelectedStaples((prev) => {
          const has = prev.includes(name);
          if (has) {
            setSelectionOrder((order) => order.filter((x) => x !== name));
            return prev.filter((x) => x !== name);
          } else {
            setSelectionOrder((order) => [...order.filter((x) => x !== name), name]);
            return [...prev, name];
          }
        });
      }
    },
    [selectedVeggies, selectedMeats, selectedStaples, serverFoods]
  );

  const handleCycleReplaceRecipe = useCallback(
    (recipeIdToReplace: string) => {
      const currentListIds = shownRecipeIds;
      const remainingPool = RECIPES_DATABASE.filter((r) => !currentListIds.includes(r.id));

      if (remainingPool.length > 0) {
        const randomAlternative = remainingPool[Math.floor(Math.random() * remainingPool.length)];
        setShownRecipeIds((prev) =>
          prev.map((id) => (id === recipeIdToReplace ? randomAlternative.id : id))
        );
      } else {
        const resetPool = RECIPES_DATABASE.filter((r) => r.id !== recipeIdToReplace);
        const choice = resetPool[Math.floor(Math.random() * resetPool.length)];
        setShownRecipeIds((prev) =>
          prev.map((id) => (id === recipeIdToReplace ? choice.id : id))
        );
      }
    },
    [shownRecipeIds]
  );

  return {
    subStep, setSubStep,
    selectedVeggies, setSelectedVeggies,
    selectedMeats, setSelectedMeats,
    selectedStaples, setSelectedStaples,
    selectionOrder, setSelectionOrder,
    activePot, setActivePot,
    potScale, setPotScale,
    matchingMode, setMatchingMode,
    hasSelectedSideCookware, setHasSelectedSideCookware,
    isBasketOpen, setIsBasketOpen,
    showClearConfirm, setShowClearConfirm,
    cartBadgePop,
    shownRecipeIds, setShownRecipeIds,
    selectedResultsRecipeId, setSelectedResultsRecipeId,
    showMatchWarning,
    activeRecipe, setActiveRecipe,
    activeCookingStepIndex, setActiveCookingStepIndex,
    recipeDetailSource, setRecipeDetailSource,
    showNoIngredientsPopup, setShowNoIngredientsPopup,
    showCongratsSuccess, setShowCongratsSuccess,
    showRecipeSharePopup, setShowRecipeSharePopup,
    showWXQRCode, setShowWXQRCode,
    flyingItems, setFlyingItems,
    basketCount,
    selectedListWithDetails,
    selectedBasketCaloriesTotal,
    isExactIngredientsMatch,
    availableVeggiesFiltered,
    availableMeatsFiltered,
    availableStaplesFiltered,
    foodsLoading, foodsError, usingMock,
    refetchIngredients: fetchIngredients,
    handleToggleIngredient,
    handleCycleReplaceRecipe,
    // ⭐ 阶段10A 新增
    matchedRecipes,
    matchDegraded,
    matchingLoading,
    refetchMatchedRecipes: fetchMatchedRecipes,
  };
}