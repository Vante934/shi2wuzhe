import { Star, RotateCw } from 'lucide-react';
import { RECIPES_DATABASE } from '../../data';
import { getRecipeImageUrl } from '../../utils/recipeUtils';
import type { Recipe } from '../../types';
import { toggleRecipeCollect } from '../../utils/collectHelper';
import { recipeApi } from '../../api/modules/recipe';
import { mapRecipeDTOToRecipe } from '../../api/mappers';

interface RecipeResultPageProps {
  shownRecipeIds: string[];
  // ⭐ 阶段10A 新增
  matchedRecipes: Recipe[];
  matchDegraded: boolean;
  matchingLoading: boolean;
  refetchMatchedRecipes: () => void;

  starredRecipes: string[];
  animatingStarId: string | null;
  selectedResultsRecipeId: string | null;
  showMatchWarning: boolean;
  potScale: number;
  basketCount: number;

  setSelectedResultsRecipeId: (id: string | null) => void;
  setStarredRecipes: (updater: (prev: string[]) => string[]) => void;
  setAnimatingStarId: (id: string | null) => void;
  handleCycleReplaceRecipe: (id: string) => void;
  setActiveRecipe: (r: Recipe) => void;
  setRecipeDetailSource: (s: any) => void;
  setShowNoIngredientsPopup: (v: boolean) => void;
  setSubStep: (n: number) => void;
  setActiveCookingStepIndex: (n: number) => void;
  showToast: (msg: string) => void;
}

export default function RecipeResultPage({
  shownRecipeIds,  matchedRecipes, matchDegraded, matchingLoading, refetchMatchedRecipes,
  starredRecipes,  animatingStarId,  selectedResultsRecipeId,  showMatchWarning,  potScale,
  basketCount,  setSelectedResultsRecipeId,  setStarredRecipes,  setAnimatingStarId,  handleCycleReplaceRecipe,  setActiveRecipe,
  setRecipeDetailSource,  setShowNoIngredientsPopup,  setSubStep,  setActiveCookingStepIndex,  showToast,}: RecipeResultPageProps) {

    const displayRecipes: Recipe[] =
      matchedRecipes.length > 0
        ? matchedRecipes
        : (shownRecipeIds
            .map((id) => RECIPES_DATABASE.find((r) => r.id === id))
            .filter(Boolean) as Recipe[]);
  return (
    <div className="flex flex-col flex-1 max-w-[2000px] mx-auto w-full justify-between">
      <div>
        <div className="text-center mb-0 mt-5">
          <h3 className="font-extrabold text-stone-800 text-[35px]">今日菜谱推荐</h3>
          <p className="text-[15px] text-[#65705e]">根据您选择的食材和就餐人数 推荐以下健康餐食</p>
        </div>

        {/* ⭐ 阶段10A：警告卡逻辑改为接口降级时显示 */}
        <div className={`w-full bg-amber-50/80 border border-amber-200/50 rounded-2xl p-4 text-left shadow-2xs relative overflow-hidden flex items-start gap-3 select-none transition-all duration-500 origin-top ${
          matchDegraded ? 'opacity-100 mb-4 scale-100 max-h-[200px]' : 'opacity-0 max-h-0 p-0 mb-0 scale-95 pointer-events-none'
        }`}>
          <span className="text-xl mt-0.5 shrink-0">🧂</span>
          <div className="space-y-1 text-[16px] text-amber-955"> 
            <p className="leading-relaxed font-semibold opacity-90 font-sans">
              您选择的食材不能完全凑齐配餐要求。为了您的烹饪体验，系统已自动启用<strong>智能模糊匹配</strong>机制，
              基于您的食材推荐了 <strong>{displayRecipes.length}</strong> 道相似菜谱，部分辅料和常见调味已默认添加，快选一个大饱口福吧！
            </p>
          </div>
        </div>

        {/* ⭐ 加载提示 */}
        {matchingLoading && (
          <div className="w-full text-center text-stone-400 font-bold py-3 text-sm">
            正在为您匹配菜谱...
          </div>
        )}

        {/* ⭐ 无结果提示 */}
        {!matchingLoading && displayRecipes.length === 0 && (
          <div className="w-full text-center py-16 text-stone-400 font-bold">
            暂无匹配菜谱，请尝试调整食材或匹配模式
          </div>
        )}

        {/* 菜谱列表 ⭐ 阶段10A：改用 displayRecipes，全部展示，滚动条滑动 */}
        <div className="flex flex-col gap-3 overflow-y-auto max-h-[520px] pb-2 px-1.5 custom-scroll w-full scroll-smooth">
          {displayRecipes.map((recipe) => {
            const isStarred = starredRecipes.includes(recipe.id);
            const isSelected = selectedResultsRecipeId === recipe.id;
            return (
              <div
                key={recipe.id}
                onClick={() => {
                  if (isSelected) {
                    setSelectedResultsRecipeId(null);
                    showToast(`已取消选择：「${recipe.name}」请重新选择`);
                  } else {
                    setSelectedResultsRecipeId(recipe.id);
                    showToast(` 已选中：「${recipe.name}」点击右侧或底部下一步直接开始`);
                  }
                }}
                className={`bg-white border rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer w-full text-left relative ${
                  isSelected
                    ? 'border-brand-green border-2 bg-brand-green/5 ring-2 ring-brand-green/20'
                    : 'border-stone-200 hover:border-[#8ca779]/45'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-3 right-3 bg-brand-green text-white font-extrabold text-[10px] rounded-full px-2 py-0.5 tracking-wider select-none z-10">
                    ✓ 已选
                  </span>
                )}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-stone-200 bg-stone-50 shadow-inner relative">
                    <img
                      src={
                        (recipe as any).coverImage ||
                        getRecipeImageUrl(recipe.name) ||
                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'
                      }
                      alt={recipe.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-sans font-black text-base text-[#2c3523] truncate">{recipe.name}</span>
                      <span className="text-[13px] font-mono font-black text-amber-955 bg-brand-yellow/80 px-1.5 py-0.5 rounded shrink-0">
                        约 {Math.round(recipe.calories * (potScale / 3))}卡
                      </span>
                    </div>
                    <div className="flex gap-0.5 text-brand-yellow text-[10px] shrink-0 mt-1">
                      {Array.from({ length: recipe.stars }).map((_, i) => (
                        <Star key={i} className="w-2.5 h-2.5 fill-current text-[#edd96a]" />
                      ))}
                      <span className="text-stone-400 text-[11px] font-sans font-bold ml-1">({recipe.difficulty})</span>
                    </div>
                  </div>
                </div>

                <div className="text-[13px] text-stone-500 font-sans sm:border-l border-dashed border-[#8ca779]/10 sm:px-5 py-1 sm:py-0 space-y-0.5 shrink-0">
                  <p className="leading-none">预计用时：<strong className="text-stone-850 font-black">{recipe.time}分钟</strong></p>
                  <p className="leading-none">就餐分量：<strong className="text-stone-850 font-black">{potScale}人份</strong></p>
                </div>

                <div className="flex items-center gap-3 shrink-0 sm:border-l border-dashed border-[#8ca779]/10 sm:pl-5 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCycleReplaceRecipe(recipe.id);
                      }}
                      className="bg-stone-50 hover:bg-[#eff7e8] border hover:border-brand-green py-2 px-3 rounded-xl text-[14px] text-stone-700 font-extrabold transition-all flex items-center gap-1 cursor-pointer"
                      title="换一道"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-stone-500" />
                      <span>换一道</span>
                    </button>

                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        setAnimatingStarId(recipe.id);
                        setTimeout(() => setAnimatingStarId(null), 400);
                        await toggleRecipeCollect(recipe.id, setStarredRecipes, showToast);
                      }}
                      className="p-1 focus:outline-none transition-transform duration-100 hover:scale-125 cursor-pointer relative"
                      title={isStarred ? '取消收藏' : '加入收藏'}
                    >
                      <Star className={`w-5.5 h-5.5 transition-colors ${
                        isStarred ? 'fill-current text-[#edd96a]' : 'text-stone-300 hover:text-[#edd96a]'
                      } ${
                        animatingStarId === recipe.id ? 'animate-star-bounce' : ''
                      }`} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={async (e) => {
                      e.stopPropagation();
                      setActiveRecipe(recipe);
                      setSelectedResultsRecipeId(recipe.id);
                      setRecipeDetailSource('eatwell_recommend');
                      if (basketCount === 0) {
                        setShowNoIngredientsPopup(true);
                      } else {
                        setSubStep(6);
                        setActiveCookingStepIndex(0);
                      }
                      // ⭐ 异步拉详情覆盖（拿完整 steps）
                      try {
                        const res = await recipeApi.getDetail(recipe.id);
                        const detailData = (res as any).data || res;
                        if (detailData && detailData.id) {
                          setActiveRecipe(mapRecipeDTOToRecipe(detailData));
                        }
                      } catch (err) {
                        console.warn('[RecipeResultPage] 获取菜谱详情失败', err);
                      }
                    }}
                    className="bg-[#8ca779] hover:bg-[#728f60] text-white font-extrabold text-[14px] px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    开始做
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t gap-3">
        <button
          onClick={() => setSubStep(4)}
          className="bg-white text-[#5d7350] border border-[#a2c28f]/30 py-2.5 px-6 rounded-full text-base font-bold cursor-pointer hover:bg-stone-50 transition-colors w-full sm:w-auto text-center"
        >
          ← 返回重新配餐
        </button>

        <button
          disabled={!selectedResultsRecipeId}
          onClick={async () => {
            if (!selectedResultsRecipeId) return;
            const foundRecipe =
              displayRecipes.find((r) => r.id === selectedResultsRecipeId) ||
              RECIPES_DATABASE.find((r) => r.id === selectedResultsRecipeId);
            if (foundRecipe) {
              setActiveRecipe(foundRecipe);
              setRecipeDetailSource('eatwell_recommend');
              if (basketCount === 0) {
                setShowNoIngredientsPopup(true);
              } else {
                setSubStep(6);
                setActiveCookingStepIndex(0);
              }
              // ⭐ 异步拉详情
              try {
                const res = await recipeApi.getDetail(foundRecipe.id);
                const detailData = (res as any).data || res;
                if (detailData && detailData.id) {
                  setActiveRecipe(mapRecipeDTOToRecipe(detailData));
                }
              } catch (err) {
                console.warn('[RecipeResultPage] 获取菜谱详情失败', err);
              }
            }
          }}
          className={`py-2.5 px-6 rounded-full text-base font-black shadow-md transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto ${
            selectedResultsRecipeId
              ? 'bg-[#8ca779] hover:bg-[#728f60] text-white active:scale-95 cursor-pointer'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed opacity-60'
          }`}
        >
          <span>确认选择菜谱→</span>
        </button>
      </div>
    </div>
  );
}