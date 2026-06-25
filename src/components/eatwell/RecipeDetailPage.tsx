import { Share2 } from 'lucide-react';
import { getRecipeImageUrl, getRecipeIngredients } from '../../utils/recipeUtils';
import { resolveRecipeImage } from '../../utils/recipeImageHelper';
import type { Recipe } from '../../types';

interface RecipeDetailPageProps {
  recipe: Recipe;
  potScale: number;
  activeCookingStepIndex: number;
  recipeDetailSource: 'eatwell_recommend' | 'random_inspiration' | 'recipe_square' | 'profile_starred'| 'inspiration_recommend';

  setActiveCookingStepIndex: (n: number) => void;
  setSubStep: (n: number) => void;
  setActiveTab: (t: 'eatwell' | 'inspiration' | 'community' | 'profile') => void;
  setInspirationSubView: (v: 'search' | 'square' | 'generator') => void;
  setShowCongratsSuccess: (v: boolean) => void;
  setShowRecipeSharePopup: (v: boolean) => void;
  setShowWXQRCode: (v: boolean) => void;
}

export default function RecipeDetailPage({
  recipe, potScale, activeCookingStepIndex, recipeDetailSource, setActiveCookingStepIndex,
  setSubStep, setActiveTab, setInspirationSubView, setShowCongratsSuccess, setShowRecipeSharePopup, setShowWXQRCode,
}: RecipeDetailPageProps) {

  const activeRecipe = recipe;
  const totalProps = (activeRecipe.protein + activeRecipe.carbohydrates + activeRecipe.fat) || 1;
  const proteinPct = Math.round((activeRecipe.protein / totalProps) * 100);
  const carbPct = Math.round((activeRecipe.carbohydrates / totalProps) * 100);
  const fatPct = 100 - proteinPct - carbPct;

  return (
    /* 最外层 - 撑满父容器 */
    <div className="flex flex-col flex-1 mx-auto w-full animate-fade-in gap-3 px-0">

      {/* ============================================================
           核心改造：双栏 grid 布局
          - 左右比例从 1.4:2.4 改为更可控的方式
          - 通过修改 grid-cols-[X_Y] 的数字调整左右整体比例
          
          【你想调整左右整体宽度比例】：
          - 左栏更宽：[1.5fr_2fr] / [1fr_1fr]
          - 右栏更宽：[1fr_2fr] / [1fr_3fr]（当前接近这个）
          - 现在：[1.6fr_2.4fr] 右栏稍宽
          ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-[1.6fr_2.4fr] gap-4 flex-1 items-stretch min-h-0">

        {/* ====================================================================
            【左栏】图片 + 基础数据 + B站视频
             左栏内部 2 个区块可分别调整：
            - 上半（图片+基础数据）：默认自然高度，shrink-0
            - 下半（视频）：flex-1 撑满剩余
            ==================================================================== */}
        <div className="bg-white rounded-3xl border border-[#a2c28f]/20 p-3 flex flex-col gap-3 shadow-sm w-full">

          {/* ┌─────────────────────────────────────────────
               红框区块①：菜品图片 + 基础数据
              【单独调整方法】：
              - 图片高度：h-[160px] → 改成 h-[180px] / h-[200px]
              - 整体最大宽度：在外面加 max-w-[XXXpx]
              └───────────────────────────────────────────── */}
          <div className="shrink-0 space-y-3">
            {/* 菜品封面图 */}
            <div className="h-[260px] rounded-2xl overflow-hidden relative border shadow-inner bg-stone-100">
              <img
                src={resolveRecipeImage(activeRecipe)}
                alt={activeRecipe.name}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // 图片加载失败兜底（防止外链失效）
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80';
                }}
              />
              {/* 渐变蒙层 + 名称 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>
              <div className="absolute bottom-2 left-2 bg-black/75 text-white font-black text-[12px] px-2.5 py-1 rounded-md">
                {activeRecipe.name}
              </div>
              {/* 右上角 emoji 小角标（保留菜系视觉） */}
              {activeRecipe.coverEmoji && (
                <div className="absolute top-2 right-2 bg-white/90 text-xl px-2 py-1 rounded-full shadow-sm">
                  {activeRecipe.coverEmoji}
                </div>
              )}
            </div>

            {/* 菜品基础指标卡 */}
            <div className="space-y-1.5 bg-stone-50/70 p-3 rounded-xl border text-[13px] font-mono leading-relaxed shadow-sm">
              <div className="flex justify-between border-b pb-1.5 border-stone-200/50">
                <span className="font-extrabold text-stone-700">菜品基础指标：</span>
                <span className="text-[#8ca779] font-black text-[11px]">基本数据</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 font-sans">
                <span className="text-stone-600">预计时长：<strong className="text-stone-800 font-black">{activeRecipe.time}min</strong></span>
                <span className="text-stone-600">难度等级：<strong className="text-stone-800 font-black">{activeRecipe.difficulty}</strong></span>
                <span className="text-stone-600">推荐分量：<strong className="text-stone-800 font-black">{potScale}人份</strong></span>
                <span className="text-orange-950 font-black">能量值：{activeRecipe.calories} kcal</span>
              </div>
            </div>
          </div>

          {/* ┌─────────────────────────────────────────────
               红框区块②：B站视频教程入口
              【单独调整方法】：
              - 最小高度：min-h-[140px] → 改成 min-h-[200px] / min-h-[250px]
              - 是否撑满：flex-1（撑满左栏剩余）/ 去掉 flex-1（固定高度）
              └───────────────────────────────────────────── */}
          <a
            href={`https://search.bilibili.com/all?keyword=${encodeURIComponent(activeRecipe.name + ' 做法')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-full bg-[#fcefed] hover:bg-[#fae2e0] border-2 border-[#f0c3be] rounded-2xl p-3 shadow-sm transition-all duration-300 hover:scale-[1.02] cursor-pointer flex flex-col gap-2 min-h-[140px] flex-1"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-none">
              <div className="w-[3px] h-3.5 bg-[#f0c3be] rounded-full -rotate-[25deg] origin-bottom"></div>
              <div className="w-[3px] h-3.5 bg-[#f0c3be] rounded-full rotate-[25deg] origin-bottom"></div>
            </div>

            <div className="bg-rose-50/60 rounded-xl p-3 flex flex-col items-center justify-center relative flex-1 shadow-inner overflow-hidden border border-rose-100/50">
              <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></div>

              <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
                <span className="text-white text-sm ml-0.5">▶</span>
              </div>

              <span className="text-lg text-rose-950 font-black opacity-95 mt-2 flex items-center gap-1 text-center font-sans">
                点击任意处跳转视频教程
              </span>
              <span className="text-[16px] text-rose-500/80 font-mono mt-1">BILIBILI</span>
            </div>

            <div className="flex justify-between items-center px-1 text-stone-500 select-none pointer-events-none shrink-0 border-t border-[#f0c3be]/40 pt-1.5 font-mono">
              <div className="flex gap-0.5">
                <span className="w-1 h-1 bg-[#f0c3be] rounded-full"></span>
                <span className="w-1 h-1 bg-[#f0c3be] rounded-full"></span>
                <span className="w-1 h-1 bg-[#f0c3be] rounded-full"></span>
              </div>
              <div className="flex gap-1.5 text-[16px] font-mono leading-none">
                <span className="font-bold">进度条 ▪▪▪▪▪▫ 85%</span>
                <span className="font-bold"></span>
              </div>
            </div>
          </a>
        </div>

        {/* ====================================================================
            【右栏】营养环图 + 食材标签 + 步骤时间线
              右栏内部 3 个区块可分别调整：
            - 营养环图：shrink-0 自然高度
            - 食材标签：shrink-0 自然高度
            - 步骤时间线：flex-1 撑满剩余
            ==================================================================== */}
        <div className="flex flex-col gap-3 flex-1 min-h-0">

          {/* ┌─────────────────────────────────────────────
               红框区块③：营养环图卡（高营养配比健康指标）
              【单独调整方法】：
              - 整体高度由内容决定，加 min-h-[XXXpx] 强制更高
              - 环图大小：w-28 h-28 → 改 w-32 h-32 / w-36 h-36
              - 单独宽度限制：在外面加 max-w-[XXXpx] mr-auto
              └───────────────────────────────────────────── */}
          <div className="shrink-0">
            <div className="bg-white border border-[#a2c28f]/30 rounded-3xl p-4 shadow-xs flex flex-col items-center gap-2 relative select-none">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-5 w-full">
                <div className="flex items-center gap-4">
                  {/* 三层环图 */}
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="text-base font-mono font-black text-stone-800 leading-none">{activeRecipe.calories}</span>
                      <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider scale-90">千卡</span>
                    </div>

                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" stroke="#fff0f0" strokeWidth="6" fill="transparent" />
                      <circle cx="50" cy="50" r="42" stroke="#f28b82" strokeWidth="6" strokeDasharray="263.9" strokeDashoffset={263.9 - (263.9 * (fatPct / 100))} strokeLinecap="round" fill="transparent" className="transition-all duration-500" />

                      <circle cx="50" cy="50" r="33" stroke="#fff7e6" strokeWidth="6" fill="transparent" />
                      <circle cx="50" cy="50" r="33" stroke="#edd96a" strokeWidth="6" strokeDasharray="207.35" strokeDashoffset={207.35 - (207.35 * (carbPct / 100))} strokeLinecap="round" fill="transparent" className="transition-all duration-500" />

                      <circle cx="50" cy="50" r="24" stroke="#eff7e8" strokeWidth="6" fill="transparent" />
                      <circle cx="50" cy="50" r="24" stroke="#8ca779" strokeWidth="6" strokeDasharray="150.8" strokeDashoffset={150.8 - (150.8 * (proteinPct / 100))} strokeLinecap="round" fill="transparent" className="transition-all duration-500" />
                    </svg>
                  </div>

                  <div className="space-y-1 text-left min-w-[330px]">
                    <span className="block text-lg font-black text-stone-800">营养配比环形图</span>
                    <span className="text-[15px] text-stone-400 block font-sans">三大健康基础指标相对比率</span>
                  </div>
                </div>

                {/* 三大营养元素标签 */}
                {/*  改动：
                    - 容器加 min-w-[180px]：让三个卡片更宽
                    - 每个卡片加 min-w-[160px] px-3 py-1.5：单独变长
                    - g数那行加 whitespace-nowrap：强制不换行 */}
                <div className="grid grid-cols-3 sm:grid-cols-1 gap-2 shrink-0 w-full sm:w-auto min-w-[240px]">
                  {/* 蛋白质卡 */}
                  <div className="bg-[#eff7e8] border border-[#cbd8c5] rounded-lg px-3 py-1.5 flex flex-row items-baseline gap-2 text-right min-w-[160px] whitespace-nowrap">
                    <span className="text-[18px] text-[#4d5d44] font-black">蛋白质</span>
                    {/* whitespace-nowrap 强制 g 数和百分比同行不换行 */}
                    <span className="text-[15px] font-bold text-stone-800 leading-tight whitespace-nowrap">
                      {activeRecipe.protein}g <span className="font-mono text-[13px] text-[#5d7350]">({proteinPct}%)</span>
                    </span>
                  </div>
                  {/* 碳水卡 */}
                  <div className="bg-[#fff7e6] border border-[#ffe0b3] rounded-lg px-3 py-1.5 flex flex-row items-baseline gap-2 text-right min-w-[160px] whitespace-nowrap">
                    <span className="text-[18px] text-[#8c5a12] font-black">碳水</span>
                    <span className="text-[15px] font-bold text-stone-800 leading-tight whitespace-nowrap">
                      {activeRecipe.carbohydrates}g <span className="font-mono text-[13px] text-amber-600">({carbPct}%)</span>
                    </span>
                  </div>
                  {/* 脂肪卡 */}
                  <div className="bg-[#fff0f0] border border-[#ffd6d6] rounded-lg px-3 py-1.5 flex flex-row items-baseline gap-2 text-right min-w-[160px] whitespace-nowrap">
                    <span className="text-[18px] text-[#9c2d2d] font-black">脂肪</span>
                    <span className="text-[15px] font-bold text-stone-800 leading-tight whitespace-nowrap">
                      {activeRecipe.fat}g <span className="font-mono text-[13px] text-red-600">({fatPct}%)</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ┌─────────────────────────────────────────────
               红框区块④：本菜谱所需食材
              【单独调整方法】：
              - 加最小高度：min-h-[XXXpx] 让它更高
              - 加最大宽度：max-w-[XXXpx]
              - 标签字号：text-[11px] → text-[13px]
              └───────────────────────────────────────────── */}
            <div className="flex flex-wrap gap-1.5 animate-scale-up">
              {/* ⭐ 直接读 recipe.ingredients（来自后端 ingredients_json），只显示纯食材名 */}
              {(() => {
                const ingList = activeRecipe.ingredients || [];

                // 后端有数据 → 只取 name，不带形容词不带 amount
                if (ingList.length > 0) {
                  // 去重（同一食材出现多次只显示一次）
                  const uniqueNames = Array.from(new Set(ingList.map((i) => i.name).filter(Boolean)));
                  return uniqueNames.map((name, idx) => (
                    <span
                      key={`ing-${idx}`}
                      className="bg-white/90 border border-[#a2c28f]/30 px-2.5 py-1 text-[13px] font-black text-[#5d7350] rounded-xl shadow-2xs"
                    >
                      {name}
                    </span>
                  ));
                }

                // 后端没数据 → fallback 到本地 mock
                return getRecipeIngredients(activeRecipe.name).map((ing, idx) => (
                  <span
                    key={`ing-fallback-${idx}`}
                    className="bg-white/90 border border-[#a2c28f]/30 px-2.5 py-1 text-[13px] font-black text-[#5d7350] rounded-xl shadow-2xs"
                  >
                    {ing}
                  </span>
                ));
              })()}
            </div>

          {/* ┌─────────────────────────────────────────────
              ⭐ 红框区块⑤：智能烹饪详细步骤
              【单独调整方法】：
              - flex-1：撑满右栏剩余空间
              - 想固定高度：去掉 flex-1，加 h-[400px]
              - 步骤间距：space-y-2 → space-y-3
              └───────────────────────────────────────────── */}
          <div className="bg-white border border-stone-200/50 rounded-2xl p-4 flex flex-col shadow-xs flex-1 text-left min-h-0">
            <div className="flex flex-col gap-2 w-full flex-1 min-h-0">
              <span className="block text-xs font-black text-[#5d7350] font-sans flex items-center gap-1 border-b pb-2 shrink-0">
                烹饪详细步骤
              </span>
              {/* 步骤列表 - 可滚动 */}
              <div className="space-y-2 overflow-y-auto custom-scroll pr-1 flex-1 min-h-0">
                {activeRecipe.steps.map((stepText, idx) => {
                  const isActive = activeCookingStepIndex === idx;
                  const isPassed = activeCookingStepIndex > idx;
                  return (
                    <div
                      key={`timeline-${idx}`}
                      onClick={() => setActiveCookingStepIndex(idx)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer text-base leading-relaxed flex items-start gap-3.5 ${
                        isActive
                          ? 'bg-[#eff7e8] border-[#8ca779] font-black shadow-sm text-stone-900 border-2 scale-[1.01]'
                          : isPassed
                          ? 'bg-stone-50/50 border-stone-150 text-stone-400 opacity-60'
                          : 'bg-white border-stone-150 text-stone-600 hover:border-stone-200'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 border mt-0.5 ${
                        isActive
                          ? 'bg-[#8ca779] text-white border-[#8ca779]'
                          : isPassed
                          ? 'bg-[#8ca779]/30 text-white border-[#8ca779]/30'
                          : 'bg-white text-stone-550 border-stone-200'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="flex-1 text-left">{stepText}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 烹饪进度条 */}
            <div className="mt-3 pt-2 border-t border-stone-100 space-y-1.5 shrink-0">
              <div className="flex justify-between items-center text-[10px] font-mono leading-none">
                <span className="text-[#5d7350] font-black uppercase tracking-wider">烹饪进展</span>
                <span className="text-stone-800 font-extrabold">{activeCookingStepIndex + 1} / {activeRecipe.steps.length} 步已学完 ({Math.round(((activeCookingStepIndex + 1) / activeRecipe.steps.length) * 100)}%)</span>
              </div>
              <div className="w-full bg-stone-150 h-4 rounded-full overflow-hidden relative border shadow-inner">
                <div
                  className="bg-[#8ca779] h-full text-right text-[10px] text-white font-mono font-black flex items-center justify-end pr-3 transition-all duration-300"
                  style={{ width: `${((activeCookingStepIndex + 1) / activeRecipe.steps.length) * 100}%` }}
                >
                  <span>{Math.round(((activeCookingStepIndex + 1) / activeRecipe.steps.length) * 100)}%</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ============================================================
          底部操作栏（保持原样）
          ============================================================ */}
      <div className="flex items-center justify-between mt-3 border-t pt-3 shrink-0">
    <button
        onClick={() => {
          // 阶段2.2 改动：根据 source 正确返回到原来的页面
          if (recipeDetailSource === 'random_inspiration') {
            setActiveTab('inspiration');
            setInspirationSubView('generator');
            setSubStep(0); // 重置 eatwell 步骤，避免下次进入 eatwell 时显示意外页面
          } else if (recipeDetailSource === 'recipe_square') {
            setActiveTab('inspiration');
            setInspirationSubView('square');
            setSubStep(0);
          } else if (recipeDetailSource === 'profile_starred') {
            setActiveTab('profile');
            setSubStep(0);
          } else if (recipeDetailSource === 'eatwell_recommend') {
            // ⭐ 修正：eatwell 食材流程进来的，返回菜谱推荐结果页（subStep=5）
            setActiveTab('eatwell');
            setSubStep(5);
          } else if (recipeDetailSource === 'inspiration_recommend') {
            // 灵感页"每日推荐"或"搜索结果"进来的，返回菜谱搜索 tab
            setActiveTab('inspiration');
            setInspirationSubView('search');
            setSubStep(0);
          }
          else {
            setSubStep(5);
          }
          
          
        }}
        className="bg-white text-stone-650 border border-stone-250 px-5 py-2.5 rounded-full text-[16px] font-black shadow-xs cursor-pointer hover:bg-stone-50 transition-colors"
      >
        {recipeDetailSource === 'random_inspiration' ? '← 返回随机灵感' :
        recipeDetailSource === 'recipe_square' ? '← 返回菜谱广场' :
        recipeDetailSource === 'profile_starred' ? '← 返回个人中心' :
        recipeDetailSource === 'eatwell_recommend' ? '← 返回菜谱推荐' :
        recipeDetailSource === 'inspiration_recommend' ? '← 返回菜谱搜索' :
        '← 返回食谱单'}
      </button>

        <div className="flex items-center gap-3">
          <button
            disabled={activeCookingStepIndex === 0}
            onClick={() => setActiveCookingStepIndex(activeCookingStepIndex - 1)}
            className={`w-32 py-2.5 px-6 rounded-full border text-base font-black transition-all active:scale-95 flex items-center justify-center ${
              activeCookingStepIndex === 0
                ? 'bg-stone-100 text-stone-300 border-stone-200 cursor-not-allowed opacity-50'
                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50 cursor-pointer'
            }`}
          >
            上一步
          </button>

          <button
            onClick={() => {
              if (activeCookingStepIndex < activeRecipe.steps.length - 1) {
                setActiveCookingStepIndex(activeCookingStepIndex + 1);
              } else {
                setShowCongratsSuccess(true);
              }
              
            }}
            className="w-32 py-2.5 px-6 rounded-full border text-base font-black transition-all active:scale-95 flex items-center justify-center bg-brand-yellow text-stone-850 hover:bg-[#edd96a]/90 border-[#edd96a] shadow-xs cursor-pointer animate-pulse-subtle"
          >
            <span>{activeCookingStepIndex === activeRecipe.steps.length - 1 ? '完成本菜' : '下一步骤'}</span>
          </button>
        </div>

        <button
          onClick={() => {
            setShowRecipeSharePopup(true);
            setShowWXQRCode(false);
          }}
          className="p-2.5 bg-[#eff7e8] border border-brand-green/30 rounded-full hover:scale-105 transition-transform cursor-pointer"
          title="打开微信或社区分享"
        >
          <Share2 className="w-5 h-5 text-[#8ba779]" />
        </button>
        
      </div>
    </div>
  );
}