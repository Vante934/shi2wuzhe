/**
 * 灵感模块页（菜谱搜索 / 随机灵感 / 菜谱广场 三个子tab）
 *
 * 阶段2.2 改动：
 *   1. 每日推荐固定显示8道 + 右上角"换一批"按钮 + 30秒定时自动换
 *   2. 搜索结果区/推荐区都设置高度上限（约2行 = 8卡），超出滚动
 *   3. 菜谱广场拉取全部菜谱（pageSize=1000）+ 按 title 拼音首字母排序
 *   4. 快捷搜索使用"智能匹配"（后端搜不到时用本地 matchRecipeSearch 兜底）
 *   5. 随机灵感"交给食神"使用数据库真实随机（去重，下批AI接入后混合）
 *   6. 点击菜谱卡片不切 tab，详情通过 RecipeDetailPage 显示
 *      返回时仍正确回到 inspiration tab（依赖 recipeDetailSource 字段）
 *
 * 数据降级策略：
 *   后端接口失败 → 用 RECIPES_DATABASE Mock 兜底，console.warn 提示
 */
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Search, Star, RotateCw, Lightbulb, Undo2, RefreshCw } from 'lucide-react';
import { RECIPES_DATABASE } from '../../data';
import { matchRecipeSearch } from '../../utils/searchUtils';
import { recipeApi } from '../../api/modules/recipe';
import { mapRecipeDTOToRecipe, } from '../../api/mappers';
import type { Recipe } from '../../types';
import { toggleRecipeCollect } from '../../utils/collectHelper';
import { pinyin } from 'pinyin-pro';   //用于提取菜谱名拼音首字母
import { resolveRecipeImage } from '../../utils/recipeImageHelper';

interface InspirationPageProps {
  inspirationSubView: 'search' | 'square' | 'generator';
  setInspirationSubView: (v: 'search' | 'square' | 'generator') => void;
  inspirationSearchQuery: string;
  setInspirationSearchQuery: (v: string) => void;
  starredRecipes: string[];
  setStarredRecipes: (updater: (prev: string[]) => string[]) => void;
  inspirationCount: number;
  setInspirationCount: (n: number) => void;
  randomizedRecipes: Recipe[];
  isSpinning: boolean;
  isGenerated: boolean;
  setIsGenerated: (v: boolean) => void;
  setRandomizedRecipes: (r: Recipe[]) => void;
  aggregatedRandomNutrition: { protein: number; carb: number; fat: number; calories: number };
  forbiddenFoodsSelected: string[];
  /** ⭐ 厨艺等级（junior=厨房小白 / senior=厨房大佬） */
  cookingLevel?: 'junior' | 'senior';
  handleSpinInspiration: () => void;
  handleRefreshSingleInspiration: (idx: number) => void;
  checkQueryRestrictions: (q: string) => { type: string; message: string } | null;
  checkTastePreferenceRestrictions: (q: string) => string | null;
  setActiveRecipe: (r: Recipe) => void;
  setRecipeDetailSource: (s: any) => void;
  setSubStep: (n: number) => void;
  setActiveCookingStepIndex: (n: number) => void;
  setActiveTab: (t: any) => void;
  setFloatingHearts: (updater: (prev: any[]) => any[]) => void;
  showToast: (msg: string) => void;
}

// 显示的每日推荐数量
const DAILY_RECOMMEND_COUNT = 8;
// 自动换一批的间隔（毫秒）
const AUTO_REFRESH_INTERVAL = 30_000;

export default function InspirationPage({
  inspirationSubView, setInspirationSubView, inspirationSearchQuery, setInspirationSearchQuery, starredRecipes,
  setStarredRecipes, inspirationCount, setInspirationCount, randomizedRecipes, isSpinning,
  isGenerated, setIsGenerated, setRandomizedRecipes, aggregatedRandomNutrition, forbiddenFoodsSelected,
  handleSpinInspiration, handleRefreshSingleInspiration, checkQueryRestrictions, checkTastePreferenceRestrictions, setActiveRecipe,
  setRecipeDetailSource, setSubStep, setActiveCookingStepIndex, setActiveTab, setFloatingHearts, showToast,
  cookingLevel = 'junior',
}: InspirationPageProps) {

  // ⭐ 根据厨艺等级返回允许的难度数组
  // junior（厨房小白）→ [1,2,3]（入门/比较容易/中等）
  // senior（厨房大佬）→ undefined（不传，后端不过滤，全部返回）
  const getDifficultiesByLevel = useCallback((): number[] | undefined => {
    if (cookingLevel === 'senior') return undefined;
    return [1, 2, 3];
  }, [cookingLevel]);

  // ==========================================================================
  // 后端菜谱池
  // ==========================================================================
  // allRecipes：菜谱广场用，全量数据（pageSize=1000）+ 按title拼音排序
  // dailyRecommendPool：每日推荐用，从 allRecipes 随机抽取 8 道
  // searchResults：搜索结果（接口直接返回）
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [dailyRecommendPool, setDailyRecommendPool] = useState<Recipe[]>([]);
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // 自动刷新定时器
  const autoRefreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * 拉取菜谱完整列表
   * 一次拉满（pageSize 1000），后续推荐/广场都用这个池子
   * 失败兜底 RECIPES_DATABASE
   */
  const loadAllRecipes = useCallback(async () => {
    setRecipesLoading(true);
    try {
      // title 排序需要后端支持；如果后端只支持 create_time，前端再排一次
      const res = await recipeApi.getList({
        pageNum: 1,
        pageSize: 1000,
        orderBy: 'create_time',
      });
      const records: any[] =
        (res.data as any)?.records ||
        (res as any).rows ||
        (res as any).records ||
        [];
      if (records.length === 0) throw new Error('返回空');

      const mapped = records.map(mapRecipeDTOToRecipe);

      // 前端按拼音/名称 升序排序（菜谱广场用）
      // 用 Intl.Collator 中文拼音排序，A-Z 顺序
      const collator = new Intl.Collator('zh-Hans-CN', { sensitivity: 'variant' });
      const sorted = [...mapped].sort((a, b) => collator.compare(a.name, b.name));

      setAllRecipes(sorted);

      // 初始化每日推荐池
      pickRandomDailyRecommend(mapped);
    } catch (err) {
      console.warn('[InspirationPage] 菜谱列表接口失败，使用本地Mock', err);
      setAllRecipes(RECIPES_DATABASE);
      setDailyRecommendPool(RECIPES_DATABASE.slice(0, DAILY_RECOMMEND_COUNT));
    } finally {
      setRecipesLoading(false);
    }
  }, []);

  /**
   * 从菜谱池随机抽 DAILY_RECOMMEND_COUNT 道作为"每日推荐"
   * ⭐ 按厨艺等级过滤：junior 只推 difficulty 1/2/3
   * 注：用 Fisher-Yates 洗牌算法，保证均匀随机
   */
  const pickRandomDailyRecommend = useCallback((pool: Recipe[]) => {
    if (pool.length === 0) return;

    // ⭐ 按厨艺等级过滤
    const allowedDiffs = getDifficultiesByLevel();
    let filteredPool = pool;
    if (allowedDiffs) {
      // 前端用中文难度，要转回数字比对（和 mapper 里的映射对齐）
      // 1=入门 2=比较容易 3=中等 4=较高
      const difficultyToNum: Record<string, number> = {
        '入门': 1,
        '比较容易': 2,
        '中等': 2,        // mapper 里 2/3 都映射成"中等"，所以"中等"放行
        '较高': 4,
      };
      filteredPool = pool.filter((r) => {
        const num = difficultyToNum[r.difficulty] ?? 2;
        return allowedDiffs.includes(num);
      });
    }

    if (filteredPool.length === 0) {
      // 万一过滤后空，回退到全池
      filteredPool = pool;
    }

    const shuffled = [...filteredPool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setDailyRecommendPool(shuffled.slice(0, DAILY_RECOMMEND_COUNT));
  }, [getDifficultiesByLevel]);

  /** 手动"换一批" */
  const handleRefreshDailyRecommend = useCallback(() => {
    const pool = allRecipes.length > 0 ? allRecipes : RECIPES_DATABASE;
    pickRandomDailyRecommend(pool);
  }, [allRecipes, pickRandomDailyRecommend]);

  // 首次挂载拉数据
  useEffect(() => {
    loadAllRecipes();
  }, [loadAllRecipes]);

  /**
   * 自动 30秒 换一批每日推荐
   * 仅在 search 或 generator tab 的"每日推荐"区可见时启用
   */
  useEffect(() => {
    // 只有在搜索页（且没搜索词时）和灵感页（且未生成时）才需要定时
    const shouldAutoRefresh =
      (inspirationSubView === 'search' && !inspirationSearchQuery.trim()) ||
      (inspirationSubView === 'generator' && !isGenerated);

    if (!shouldAutoRefresh || allRecipes.length === 0) {
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
        autoRefreshTimerRef.current = null;
      }
      return;
    }

    autoRefreshTimerRef.current = setInterval(() => {
      pickRandomDailyRecommend(allRecipes);
    }, AUTO_REFRESH_INTERVAL);

    return () => {
      if (autoRefreshTimerRef.current) clearInterval(autoRefreshTimerRef.current);
    };
  }, [inspirationSubView, inspirationSearchQuery, isGenerated, allRecipes, pickRandomDailyRecommend]);

  /**
   * 搜索（带防抖）
   * 阶段2.2：智能匹配
   *   1. 优先调后端 /api/recipe/search
   *   2. 后端返回为空 → 用本地 matchRecipeSearch 在 allRecipes 内匹配
   *   3. 还是空 → 显示空态
   *
   * 这样像"高卡"、"低脂"这种关键词后端搜不到（不在title里），
   * 但本地匹配能命中（按能量值判断），保证用户体验
   */
  useEffect(() => {
    if (inspirationSubView !== 'search') return;
    const keyword = inspirationSearchQuery.trim();
    if (!keyword) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        // ⭐ 搜索带厨艺等级过滤
        const res = await recipeApi.search(keyword, {
          pageNum: 1,
          pageSize: 50,
          difficulties: getDifficultiesByLevel(),
        });
        const records: any[] =
          (res.data as any)?.records ||
          (res as any).rows ||
          (res as any).records ||
          [];
        let mapped = records.map(mapRecipeDTOToRecipe);

        // 智能匹配兜底：后端没找到 → 用本地匹配在 allRecipes 内过滤
        if (mapped.length === 0) {
          const pool = allRecipes.length > 0 ? allRecipes : RECIPES_DATABASE;
          mapped = pool.filter((r) => matchRecipeSearch(r, keyword));
          if (mapped.length > 0) {
            console.info(`[InspirationPage] "${keyword}" 后端无结果，本地智能匹配找到 ${mapped.length} 条`);
          }
        }
        setSearchResults(mapped);
      } catch (err) {
        console.warn('[InspirationPage] 搜索接口失败，本地兜底', err);
        const pool = allRecipes.length > 0 ? allRecipes : RECIPES_DATABASE;
        setSearchResults(pool.filter((r) => matchRecipeSearch(r, keyword)));
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [inspirationSearchQuery, inspirationSubView, allRecipes, getDifficultiesByLevel]);

  /**
   * "交给食神" 按钮：随机生成 N 道菜
   * 阶段2.2：使用数据库真实数据随机抽取
   * （后续 AI 接口就绪后，混合 N/2 道AI + N/2 道数据库随机）
   */
  const handleSpinFromServer = useCallback(() => {
    const pool = allRecipes.length > 0 ? allRecipes : RECIPES_DATABASE;
    if (pool.length === 0) {
      showToast('菜谱池为空，请检查网络');
      return;
    }

    // ⭐ 先按厨艺等级过滤
    const allowedDiffs = getDifficultiesByLevel();
    let levelFiltered = pool;
    if (allowedDiffs) {
      const difficultyToNum: Record<string, number> = {
        '入门': 1, '比较容易': 2, '中等': 2, '较高': 4,
      };
      levelFiltered = pool.filter((r) => {
        const num = difficultyToNum[r.difficulty] ?? 2;
        return allowedDiffs.includes(num);
      });
      if (levelFiltered.length === 0) levelFiltered = pool;
    }

    // 再过滤忌口
    const filtered = levelFiltered.filter((r) => {
      return !forbiddenFoodsSelected.some((forbidden) =>
        r.name.includes(forbidden)
      );
    });
    // Fisher-Yates 洗牌 + 去重抽取
    const shuffled = [...filtered];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    // 去重（按id）+ 取 N 道
    const seen = new Set<string>();
    const picked: Recipe[] = [];
    for (const r of shuffled) {
      if (!seen.has(r.id)) {
        seen.add(r.id);
        picked.push(r);
        if (picked.length >= inspirationCount) break;
      }
    }

    setRandomizedRecipes(picked);
    setIsGenerated(true);
    showToast(`已为您生成 ${picked.length} 道随机灵感`);
  }, [allRecipes, forbiddenFoodsSelected, inspirationCount, setRandomizedRecipes, setIsGenerated, showToast, getDifficultiesByLevel]);

  // ==========================================================================
  // 点击菜谱卡片：拉详情 + 跳详情页
  // 阶段2.2 改造：
  //   - 详情通过后端 getDetail(id) 拉真实数据（包含完整 steps）
  //   - 记录 source 字段，详情页"返回"按钮可正确返回
  //   - 注意：当前架构是 RecipeDetailPage 渲染在 eatwell tab 下（subStep=6）
  //     所以会切到 eatwell tab。返回时 RecipeDetailPage 的返回按钮会
  //     根据 source 切回 inspiration tab + 对应子view
  // ==========================================================================
  const openRecipeDetail = async (recipe: Recipe, source: 'random_inspiration' | 'recipe_square' | 'inspiration_recommend') => {
    // 立即跳转，先用列表数据展示，详情数据回来后再覆盖
    setActiveRecipe(recipe);
    setRecipeDetailSource(source);
    setSubStep(6);
    setActiveCookingStepIndex(0);
    setActiveTab('eatwell');

    // 异步拉详情，拉到后覆盖
    try {
      const res = await recipeApi.getDetail(recipe.id);
      const detailData = (res as any).data || res;
      if (detailData && detailData.id) {
        const detailed = mapRecipeDTOToRecipe(detailData);
        setActiveRecipe(detailed);
      }
    } catch (err) {
      console.warn('[InspirationPage] 获取菜谱详情失败，使用列表数据展示', err);
    }
  };

    // ============================================================================
  // ⭐ Step 3：菜谱广场 A-Z 字母索引
  // ============================================================================

  // 字母条配置（A-Z + #）
  const ALPHABET_LETTERS = useMemo(
    () => [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ', '#'] as string[],
    []
  );

  /** 提取菜谱名首字母（中文→拼音首字母大写；非中文非字母→#） */
  const getFirstLetter = useCallback((name: string): string => {
    if (!name) return '#';
    const first = name.trim().charAt(0);
    // 英文/数字字母
    if (/[a-zA-Z]/.test(first)) return first.toUpperCase();
    if (/[0-9]/.test(first)) return '#';
    // 中文：取拼音首字母
    try {
      const py = pinyin(first, { pattern: 'first', toneType: 'none' });
      const letter = (py || '').trim().toUpperCase();
      return /^[A-Z]$/.test(letter) ? letter : '#';
    } catch {
      return '#';
    }
  }, []);

  /** 哪些字母在当前菜谱列表中有数据（用于灰显） */
  const availableLetters = useMemo(() => {
    const set = new Set<string>();
    allRecipes.forEach((r) => set.add(getFirstLetter(r.name)));
    return set;
  }, [allRecipes, getFirstLetter]);

  /** 菜谱广场 滚动容器 Ref（用于 scrollTo） */
  const squareScrollRef = useRef<HTMLDivElement | null>(null);
  /** 每个菜谱卡片 Ref（key=recipe.id） */
  const recipeItemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  /** 点击字母 → 滚动到首个该首字母的菜谱 */
  const handleClickLetter = useCallback(
    (letter: string) => {
      if (!availableLetters.has(letter)) return; // 该字母无菜谱
      const target = allRecipes.find((r) => getFirstLetter(r.name) === letter);
      if (!target) return;
      const el = recipeItemRefs.current[target.id];
      const container = squareScrollRef.current;
      if (!el || !container) return;

      // 用 offsetTop 算偏移，比 scrollIntoView 更稳（不会带动外层滚动）
      const offset = el.offsetTop - container.offsetTop;
      container.scrollTo({ top: offset - 8, behavior: 'smooth' });
    },
    [allRecipes, availableLetters, getFirstLetter]
  );

  // 搜索/推荐 view 展示的菜谱列表
  const searchViewRecipes = useMemo(() => {
    if (inspirationSearchQuery.trim()) return searchResults;
    return dailyRecommendPool;
  }, [inspirationSearchQuery, searchResults, dailyRecommendPool]);

  return (
    <div className="flex flex-col h-full w-full animate-fade-in text-left overflow-hidden">

      {/* ==================== 顶部 Sub-tabs ==================== */}
      <div className="flex bg-[#cbd8c5]/30 p-1.5 rounded-2xl select-none max-w-7xl mx-auto mb-4 w-full shadow-xs shrink-0">
        <button
          type="button"
          onClick={() => {
            setInspirationSubView('search');
            setInspirationSearchQuery('');
          }}
          className={`flex-1 py-2.5 text-center text-[18px] font-black rounded-xl transition-all cursor-pointer ${
            inspirationSubView === 'search' ? 'bg-[#8ca779] text-white shadow-xs' : 'text-stone-600 hover:bg-white/40'
          }`}
        >
          菜谱搜索
        </button>
        <button
          type="button"
          onClick={() => setInspirationSubView('generator')}
          className={`flex-1 py-2.5 text-center text-[18px] font-black rounded-xl transition-all cursor-pointer ${
            inspirationSubView === 'generator' ? 'bg-[#8ca779] text-white shadow-xs' : 'text-stone-600 hover:bg-white/40'
          }`}
        >
          随机灵感
        </button>
        <button
          type="button"
          onClick={() => setInspirationSubView('square')}
          className={`flex-1 py-2.5 text-center text-[18px] font-black rounded-xl transition-all cursor-pointer ${
            inspirationSubView === 'square' ? 'bg-[#8ca779] text-white shadow-xs' : 'text-stone-600 hover:bg-white/40'
          }`}
        >
          菜谱广场
        </button>
      </div>

      <div className="flex-1 min-h-0 flex flex-col w-full">

        {/* ==================== SEARCH 菜谱搜索 ==================== */}
        {inspirationSubView === 'search' && (
          <div className="flex flex-col flex-1 min-h-0 w-full animate-fade-in">

            {/* 搜索框 + 快捷标签 */}
            <div className="shrink-0 flex flex-col gap-4 pb-4">
              <div className="relative w-full max-w-[900px] mx-auto mt-4 mb-6">
                <Search className="w-5 h-5 text-[#8ca779] absolute left-5 top-4 animate-pulse" />
                <input
                  type="text"
                  placeholder="搜索感兴趣的菜谱..."
                  value={inspirationSearchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setInspirationSearchQuery(val);
                    if (val.trim()) {
                      const check = checkQueryRestrictions(val);
                      if (check) { showToast(check.message); return; }
                      const tasteCheck = checkTastePreferenceRestrictions(val);
                      if (tasteCheck) showToast(tasteCheck);
                    }
                  }}
                  className="w-full bg-white border border-[#c1d9b3]/60 focus:border-[#8ca779] focus:ring-1 focus:ring-[#8ca779]/30 rounded-full pl-13 pr-14 py-3.5 text-base outline-none transition-all font-bold placeholder-stone-400 text-stone-850 shadow-xs"
                />
                {inspirationSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setInspirationSearchQuery('')}
                    className="absolute right-5 top-3 px-3 text-xs bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-700 font-extrabold rounded py-1.5 transition-colors"
                  >
                    清除
                  </button>
                )}
              </div>

              {/* 快捷标签（智能匹配） */}
              <div className="flex flex-wrap items-center gap-2 justify-center w-full px-4 select-none">
                <span className="text-[16px] text-stone-400 font-bold shrink-0">快捷搜索：</span>
                {[
                  { label: '低脂轻食 🥦', query: '低脂' },
                  { label: '高卡增肌 🥩', query: '高卡' },
                  { label: '清淡少油 🥬', query: '清淡' },
                  { label: '麻辣香辛 🌶️', query: '麻辣' },
                  { label: '糖醋甜味 🍯', query: '甜' },
                  { label: '家常咸鲜 🧂', query: '咸' },
                  { label: '火热爆炒 🔥', query: '炒' },
                  { label: '营养煲煮 🍲', query: '煮' },
                  { label: '精选蔬菜 🥕', query: '蔬菜' },
                  { label: '丰盛肉食 🍗', query: '肉' },
                  { label: '滋补汤羹 🍵', query: '汤' },
                  { label: '创意素食 🌱', query: '素' },
                ].map((tag) => (
                  <button
                    key={tag.label}
                    type="button"
                    onClick={() => {
                      setInspirationSearchQuery(tag.query);
                      showToast(`已智能匹配「${tag.label}」`);
                    }}
                    className={`text-[14px] font-bold px-3 py-1.5 rounded-full transition-all border cursor-pointer ${
                      inspirationSearchQuery === tag.query
                        ? 'bg-[#8ca779] text-white border-[#8ca779] shadow-xs'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-[#eff7e8]/50 hover:text-[#5d7350] hover:border-[#8ca779]/40'
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 分隔线 + 推荐/结果区 */}
            <div className="flex-1 min-h-0 flex flex-col border-t border-stone-600 pt-3 mt-6 w-full px-2">
              <div className="flex justify-between items-center mb-3 px-1.5 shrink-0">
                <h4 className="text-s font-black text-stone-500 uppercase tracking-wider">
                  {inspirationSearchQuery
                    ? `搜索结果（${searchResults.length}）`
                    : '每日推荐'}
                  {searching && <span className="ml-2 text-stone-400 normal-case">加载中...</span>}
                </h4>
                {/* 阶段2.2 新增：换一批按钮（仅"每日推荐"显示） */}
                {!inspirationSearchQuery && (
                  <button
                    type="button"
                    onClick={handleRefreshDailyRecommend}
                    className="flex items-center gap-1.5 text-xs font-extrabold text-[#5d7350] bg-[#eff7e8]/80 hover:bg-[#eff7e8] border border-[#a2c28f]/40 rounded-full px-3 py-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    title="手动刷新推荐，每30秒也会自动换"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>换一批</span>
                  </button>
                )}
              </div>

              {/* ⭐ Step 2 改造：搜索结果固定高度 = 桌面端 4 列 × 2 行 = 8 道菜
                  - 写死 340px：卡片高度约 155px × 2 + gap 16px ≈ 326px，留 14px 余量
                  - overflow-y-auto：超出 8 道则容器内部纵向滚动，滚动条正常显示
                  - 注意：scrollbar-gutter 让滚动条占位，避免出现/消失时卡片抖动 */}
              <div
                className="overflow-y-auto custom-scroll"
                style={{
                  height: '340px',
                  scrollbarGutter: 'stable',
                }}
                >
                {recipesLoading && searchViewRecipes.length === 0 ? (
                  <div className="py-16 text-center text-stone-400 font-bold">加载菜谱中...</div>
                ) : searchViewRecipes.length === 0 ? (
                  <div className="py-16 text-center flex flex-col items-center justify-center gap-2.5 bg-stone-50/50 border border-stone-100 rounded-3xl">
                    <p className="text-sm text-stone-400 font-bold px-6 leading-relaxed">
                      {inspirationSearchQuery
                        ? '没有找到您搜索的菜谱，请尝试其他关键词'
                        : '菜谱池为空'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-2">
                    {searchViewRecipes.map((recipe) => (
                      <div
                        key={`search-res-${recipe.id}`}
                        onClick={() => openRecipeDetail(recipe, 'inspiration_recommend')}
                        className="bg-white hover:bg-[#eff7e8]/30 border border-stone-200 hover:border-[#8ca779]/45 p-4 rounded-3xl cursor-pointer transition-all duration-200 flex flex-col gap-3 shadow-xs hover:shadow-md hover:-translate-y-0.5"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border bg-stone-50">
                            <img
                              src={resolveRecipeImage(recipe)}
                              alt={recipe.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80';
                              }}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h5 className="font-extrabold text-sm text-stone-850 leading-snug line-clamp-2">{recipe.name}</h5>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-xs text-stone-400 font-bold">{recipe.time} min</span>
                              <span className="text-xs text-amber-600 font-extrabold font-mono">{recipe.calories}kcal</span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openRecipeDetail(recipe, 'inspiration_recommend');
                          }}
                          className="w-full py-2 rounded-xl bg-[#eff7e8] hover:bg-brand-green text-brand-green-dark hover:text-white text-xs font-bold transition-all border border-brand-green/30 cursor-pointer"
                        >
                          开始烹饪
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== SQUARE 菜谱广场 ==================== */}
        {inspirationSubView === 'square' && (
          <div className="flex flex-col w-full animate-fade-in text-left relative" style={{ maxHeight: 'calc(100vh - 250px)' }}>

            <div className="border-b pb-3 mb-3 px-2 shrink-0 flex justify-between items-end">
              <div>
                <h4 className="font-extrabold text-lg text-stone-800">
                  菜谱广场
                  <span className="ml-2 text-sm text-stone-400 normal-case font-normal">
                    共 {allRecipes.length} 道（按拼音排序）
                  </span>
                </h4>
                <p className="text-xs text-stone-400 mt-1">点击收藏，收藏后将在【个人中心-我的食谱】中显示</p>
              </div>
              {recipesLoading && <span className="text-stone-400 text-sm">加载中...</span>}
            </div>

            <div
              ref={squareScrollRef}
              className="flex-1 overflow-y-auto custom-scroll space-y-3 pb-2 pr-12"
            >
              {allRecipes.map((recipe) => {
                const isStarred = starredRecipes.includes(recipe.id);
                return (
                  <div
                    key={`row-square-${recipe.id}`}
                    ref={(el) => {
                      recipeItemRefs.current[recipe.id] = el;
                    }}
                    onClick={() => openRecipeDetail(recipe, 'recipe_square')}
                    className="bg-white border border-stone-200 hover:border-[#8ca779]/45 p-4 rounded-2xl flex items-center justify-between gap-4 cursor-pointer hover:shadow-md transition-all shadow-sm group w-full"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#eff7e8]/50 relative border flex items-center justify-center">
                        <span className="text-4xl select-none relative z-10">{recipe.coverEmoji}</span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-black text-base text-stone-850 group-hover:text-brand-green-dark transition-colors truncate">
                            {recipe.name}
                          </h4>
                          <span className="text-xs bg-[#eff7e8] text-brand-green-dark px-2 py-0.5 rounded-full font-black">
                            {recipe.difficulty}
                          </span>
                        </div>

                        <p className="text-xs text-stone-400 mt-1 line-clamp-1">
                          步骤：{recipe.steps[0]}
                        </p>

                        <div className="flex items-center gap-4 mt-1.5 text-xs font-mono text-stone-550 font-bold">
                          <span>用时: <strong className="text-stone-700">{recipe.time} 分钟</strong></span>
                          <span>能量: <strong className="text-stone-700">{recipe.calories} kcal</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 select-none">
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        await toggleRecipeCollect(recipe.id, setStarredRecipes, showToast);
                      }}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isStarred
                          ? 'bg-amber-50 border-amber-200 text-amber-500 scale-102 font-black animate-star-bounce'
                          : 'bg-stone-50 border-stone-200 text-stone-400 hover:text-amber-500 hover:bg-amber-50/25'
                      }`}
                      title="收藏这款菜谱到个人中心"
                    >
                      <Star className={`w-5 h-5 ${isStarred ? 'fill-current' : ''}`} />
                    </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openRecipeDetail(recipe, 'recipe_square');
                        }}
                        className="bg-[#8ca779] text-white hover:bg-[#728f60] font-black text-sm px-5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                      >
                        开始做
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

            {/* ⭐ Step 3 字母索引条（仅菜谱广场可见 + 不挡顶部分割线） */}
            {inspirationSubView === 'square' && (
              <div
                className="absolute right-1 flex flex-col items-center gap-0.5 select-none z-10 bg-white/80 backdrop-blur-sm border border-stone-200/60 rounded-full py-2 px-1 shadow-xs"
                style={{ top: '190px', maxHeight: 'calc(100% - 100px)' }}
              >
                {ALPHABET_LETTERS.map((letter) => {
                  const enabled = availableLetters.has(letter);
                  return (
                    <button
                      key={`letter-${letter}`}
                      type="button"
                      disabled={!enabled}
                      onClick={() => handleClickLetter(letter)}
                      className={`text-[11px] font-extrabold leading-none w-5 h-5 flex items-center justify-center rounded-full transition-all duration-150 ${
                        enabled
                          ? 'text-stone-600 hover:text-white hover:bg-[#8ca779] hover:scale-125 cursor-pointer'
                          : 'text-stone-300 cursor-not-allowed'
                      }`}
                      title={enabled ? `跳转到 ${letter}` : `暂无 ${letter} 开头的菜谱`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            )}

          </div>

        {/* ==================== GENERATOR 随机灵感 ==================== */}
        {inspirationSubView === 'generator' && (
          <div className="flex flex-col flex-1 min-h-0 w-full animate-fade-in text-center relative">

            {isGenerated && randomizedRecipes.length > 0 ? (
              // 已生成态
              <div className="flex-1 min-h-0 flex flex-col w-full">
                <div className="shrink-0 space-y-3 mb-3">
                  <h3 className="font-black text-stone-850 text-[28px] tracking-tight flex items-center justify-center gap-1.5">
                    随机灵感推荐
                  </h3>
                  <div className="bg-gradient-to-r from-stone-50 to-white border border-stone-200/60 rounded-2xl p-3 max-w-[420px] w-full mx-auto shadow-xs flex items-center justify-center gap-6">
                    <span className="text-[25px] font-black text-stone-600 font-sans tracking-wide shrink-0">选择</span>
                    <button type="button" onClick={() => setInspirationCount(Math.max(1, inspirationCount - 1))} className="bg-[#8ca779] hover:bg-[#728f60] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg shadow-sm transition-transform active:scale-90 cursor-pointer">-</button>
                    <div className="w-20 text-center">
                      <span className="text-5xl font-mono font-black text-stone-850 block leading-none">{inspirationCount}</span>
                      <span className="text-[25px] text-[#5d7350] font-black font-sans uppercase tracking-[0.1em] mt-1 block">道美食</span>
                    </div>
                    <button type="button" onClick={() => {
                      if (inspirationCount >= 8) showToast('最多支持 8 道灵感菜谱推荐哦');
                      else setInspirationCount(inspirationCount + 1);
                    }} className="bg-[#8ca779] hover:bg-[#728f60] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg shadow-sm transition-transform active:scale-90 cursor-pointer">+</button>
                  </div>
                  <div className="bg-[#eff7e8]/60 border border-[#a2c28f]/30 rounded-2xl p-3 w-full shadow-xs text-left grid grid-cols-4 gap-4 animate-fade-in">
                    <div><span className="text-[15px] text-[#526047] block font-black leading-none">总能量</span><span className="text-base font-mono font-black text-stone-800 mt-1 block">{aggregatedRandomNutrition.calories} kcal</span></div>
                    <div><span className="text-[15px] text-[#526047] block font-black leading-none">蛋白质含量</span><span className="text-base font-mono font-black text-stone-800 mt-1 block">{aggregatedRandomNutrition.protein} g</span></div>
                    <div><span className="text-[15px] text-[#526047] block font-black leading-none">碳水化合物</span><span className="text-base font-mono font-black text-stone-800 mt-1 block">{aggregatedRandomNutrition.carb} g</span></div>
                    {(() => {
                      const gl = Math.round(aggregatedRandomNutrition.carb * 0.55 / 10 * 10) / 10;
                      const label = gl < 10 ? '低GI' : gl < 20 ? '中GI' : '高GI';
                      const color = gl < 10 ? 'text-[#5d7350]' : gl < 20 ? 'text-amber-600' : 'text-red-500';
                      return (
                        <span className={`text-base font-mono font-black mt-1 block`}>
                          GL {gl} ({label})
                        </span>
                      );
                    })()}
                  </div>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto custom-scroll w-full">
                  <div className={`grid gap-4 text-left ${inspirationCount === 1 ? 'grid-cols-1 max-w-xl mx-auto' : inspirationCount === 2 ? 'grid-cols-1 sm:grid-cols-2' : inspirationCount === 3 ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
                    {randomizedRecipes.slice(0, Math.min(inspirationCount, randomizedRecipes.length)).map((recipe, index) => {
                      if (!recipe) return null;
                      return (
                        <div key={recipe.id} onClick={() => openRecipeDetail(recipe, 'random_inspiration')} className="bg-white border border-stone-200/85 rounded-3xl relative shadow-xs hover:shadow-md hover:border-[#8ca779]/50 transition-all duration-300 cursor-pointer text-left group flex flex-col justify-between p-5 min-h-[180px]">
                          <button type="button" onClick={(e) => { e.stopPropagation(); handleRefreshSingleInspiration(index); }} className="absolute top-3.5 right-3.5 p-1.5 bg-stone-50 hover:bg-[#eff7e8] border border-stone-200 rounded-full text-stone-400 hover:text-brand-green shadow-xs transition-colors z-10 cursor-pointer active:rotate-180 duration-300" title="换一个"><RotateCw className="w-3.5 h-3.5" /></button>
                          <div className="space-y-3">
                            <div className="flex items-center"><span className="bg-[#eff7e8]/80 text-brand-green-dark text-[10px] font-black px-2 py-0.5 rounded-full font-sans tracking-wider">第 {index + 1} 道灵感</span></div>
                            <div className="flex items-center gap-3">
                              <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border bg-stone-50 group-hover:shadow-md transition-shadow">
                                <img
                                  src={resolveRecipeImage(recipe)}
                                  alt={recipe.name}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80';
                                  }}
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-extrabold text-sm text-stone-850 group-hover:text-[#5d7350] transition-colors leading-snug line-clamp-2">{recipe.name}</h4>
                                <p className="text-xs text-[#8ca779] font-black mt-0.5">难度: <strong className="text-stone-700 font-bold">{recipe.difficulty}</strong></p>
                              </div>
                            </div>
                            <div className="text-xs text-stone-500 font-sans leading-relaxed flex items-center justify-between border-t pt-2 border-stone-100">
                              <span className="font-bold">预计: <strong className="text-stone-800 font-extrabold">{recipe.time}分钟</strong></span>
                              <span className="text-orange-950 font-black bg-brand-yellow/55 px-2 py-0.5 rounded">{recipe.calories} kcal</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex justify-center gap-3 mt-3 border-t pt-3 w-full shrink-0">
                  <button type="button" onClick={() => { setIsGenerated(false); }} className="bg-white hover:bg-stone-50 text-stone-600 font-extrabold text-sm py-2 px-5 rounded-full border border-stone-300 shadow-xs flex items-center gap-1.5 cursor-pointer transition-all hover:scale-102"><Undo2 className="w-4 h-4" /><span>重置初始</span></button>
                  <button type="button" onClick={handleSpinFromServer} className="bg-[#2c3523] hover:bg-[#3b472f] text-white font-extrabold text-sm py-2 px-5 rounded-full shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"><RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} /><span>再来一批</span></button>
                  <button type="button" onClick={async () => {
                    const currentGenerated = randomizedRecipes.slice(0, Math.min(inspirationCount, randomizedRecipes.length));
                    
                    // 并发收藏，过滤已收藏的
                    const toCollect = currentGenerated.filter(r => !starredRecipes.includes(r.id));
                    if (toCollect.length === 0) {
                      showToast('这些灵感菜谱都已收藏过啦');
                      return;
                    }
                    
                    let successCount = 0;
                    await Promise.all(
                      toCollect.map(async (r) => {
                        const result = await toggleRecipeCollect(r.id, setStarredRecipes, () => {});
                        if (result === true) successCount++;
                      })
                    );

                    for (let i = 0; i < 6; i++) {
                      setTimeout(() => { 
                        setFloatingHearts((hearts) => [...hearts, { id: Date.now() + i + Math.random(), left: 30 + Math.random() * 40 }]); 
                      }, i * 120);
                    }
                    showToast(`已收藏 ${successCount} 道灵感到「我的食谱」`);
                  }} className="bg-brand-yellow hover:bg-[#e6d363] text-stone-850 font-extrabold text-sm py-2 px-5 rounded-full border border-stone-300 shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95">
                    <Star className="w-4 h-4 fill-current text-amber-600" />
                    <span>一键收藏全部 ({Math.min(inspirationCount, randomizedRecipes.length)})</span>
                  </button>
                  </div>
              </div>
            ) : (
              // 未生成态
              <div className="flex flex-col flex-1 min-h-0 w-full">
                <div className="shrink-0 space-y-2 mb-3">
                  <h3 className="font-black text-stone-850 text-[28px] tracking-tight mb-8 mt-3">「 随机灵感推荐 」</h3>
                  <div className="bg-gradient-to-r from-stone-50 to-white border border-stone-200/60 rounded-2xl p-3 max-w-[600px] w-full mx-auto shadow-xs flex items-center justify-center gap-4">
                    <span className="text-[25px] font-black text-stone-600 font-sans tracking-wide shrink-0">选择生成</span>
                    <button type="button" onClick={() => setInspirationCount(Math.max(1, inspirationCount - 1))} className="bg-[#8ca779] hover:bg-[#728f60] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg shadow-sm transition-transform active:scale-90 cursor-pointer">-</button>
                    <div className="w-20 text-center"><span className="text-5xl font-mono font-black text-stone-850 leading-none">{inspirationCount}</span></div>
                    <button type="button" onClick={() => {
                      if (inspirationCount >= 8) showToast('最多支持 8 道灵感菜谱推荐哦');
                      else setInspirationCount(inspirationCount + 1);
                    }} className="bg-[#8ca779] hover:bg-[#728f60] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg shadow-sm transition-transform active:scale-90 cursor-pointer">+</button>
                    <span className="text-[25px] font-black text-stone-600 font-sans whitespace-nowrap shrink-0">道美食</span>
                  </div>
                  <button type="button" onClick={handleSpinFromServer}
                    className={`group relative inline-flex items-center gap-3 bg-[#2c3523] hover:bg-[#3d4a31] text-white font-black text-lg py-2.5 px-10 mt-6 rounded-full shadow-lg hover:shadow-[#8caf77]/20 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer overflow-hidden ${isSpinning ? 'animate-pulse' : ''}`}>
                    <Lightbulb className={`w-5 h-5 text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)] ${isSpinning ? 'animate-spin' : 'group-hover:animate-pulse'}`} />
                    <span className="tracking-wide">交给食神</span>
                  </button>
                </div>

                {/* 每日推荐区（同步带"换一批"按钮+定时刷新） */}
                <div className="flex-1 min-h-0 flex flex-col w-full border-t border-stone-600 pt-3 mt-6 text-left">
                  <div className="flex justify-between items-center mb-2 shrink-0">
                    <span className="text-[18px] font-black text-stone-400 font-sans block uppercase tracking-wider">
                      每日推荐
                    </span>
                    <button
                      type="button"
                      onClick={handleRefreshDailyRecommend}
                      className="flex items-center gap-1.5 text-xs font-extrabold text-[#5d7350] bg-[#eff7e8]/80 hover:bg-[#eff7e8] border border-[#a2c28f]/40 rounded-full px-3 py-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      title="手动刷新推荐，每30秒也会自动换"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>换一批</span>
                    </button>
                  </div>
                  <div
                    className="flex-1 min-h-0 overflow-y-auto custom-scroll"
                    style={{ maxHeight: 'calc(100vh - 480px)' }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-2">
                      {dailyRecommendPool.map((recipe) => (
                        <div
                          key={`recommended-${recipe.id}`}
                          onClick={() => openRecipeDetail(recipe, 'inspiration_recommend')}
                          className="bg-white border border-stone-200/80 hover:border-[#8ca779]/50 hover:shadow-md rounded-2xl p-4 cursor-pointer text-left transition-all duration-200 flex flex-col justify-between group shadow-xs hover:-translate-y-0.5"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-stone-100 shadow-xs bg-stone-50">
                              <img
                                src={resolveRecipeImage(recipe)}
                                alt={recipe.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80';
                                }}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h5 className="font-extrabold text-sm text-stone-850 group-hover:text-[#5d7350] transition-colors leading-snug line-clamp-2">{recipe.name}</h5>
                              <p className="text-xs text-[#8ca779] font-bold mt-0.5">热量: {recipe.calories} kcal</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-stone-400 font-mono mt-3 pt-2 border-t border-stone-50">
                            <span>难度: <strong className="text-stone-600 font-bold">{recipe.difficulty}</strong></span>
                            <span>{recipe.time}分钟</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
  );
}