import { useState } from 'react';
import { ShoppingCart, Flame } from 'lucide-react';
import type { Food } from '../../types';

interface PotSelectorPageProps {
  matchingMode: 'strict' | 'fuzzy' | 'survival';
  setMatchingMode: (m: 'strict' | 'fuzzy' | 'survival') => void;
  activePot: string;
  setActivePot: (p: string) => void;
  hasSelectedSideCookware: boolean;
  setHasSelectedSideCookware: (v: boolean) => void;
  potScale: number;
  setPotScale: (n: number) => void;

  basketCount: number;
  selectedListWithDetails: Food[];
  selectedBasketCaloriesTotal: number;
  cartBadgePop: boolean;
  isBasketOpen: boolean;
  setIsBasketOpen: (v: boolean) => void;

  handleToggleIngredient: (name: string, category: 'veggie' | 'meat' | 'staple') => void;
  setSelectedVeggies: (v: string[]) => void;
  setSelectedMeats: (v: string[]) => void;
  setSelectedStaples: (v: string[]) => void;
  setSelectionOrder: (v: string[]) => void;

  setSubStep: (n: number) => void;
  setShowNoIngredientsPopup: (v: boolean) => void;
  showToast: (msg: string) => void;
}

export default function PotSelectorPage({
  matchingMode,  setMatchingMode,  activePot,  setActivePot,  hasSelectedSideCookware,
  setHasSelectedSideCookware,  potScale,  setPotScale,  basketCount,
  selectedListWithDetails,  selectedBasketCaloriesTotal,  cartBadgePop,
  isBasketOpen,  setIsBasketOpen,  handleToggleIngredient,  setSelectedVeggies,
  setSelectedMeats,  setSelectedStaples,  setSelectionOrder,  setSubStep,
  setShowNoIngredientsPopup,  showToast,
}: PotSelectorPageProps) {

  const [hoveredMode, setHoveredMode] = useState<'strict' | 'fuzzy' | 'survival' | null>(null);

  const activePotSpec = (() => {
    //左边
    switch (activePot) {
      case '炖煮锅': return { icon: '🍲', label: '炖煮锅' };
      case '汤锅/砂锅': return { icon: '🍯', label: '汤锅/砂锅' };
      case '高压锅': return { icon: '🫕', label: '高压锅' };
    //右边
      case '空气炸锅': return { icon: '🍿', label: '空气炸锅' };
      case '蒸笼/蒸锅': return { icon: '♨️', label: '蒸笼/蒸锅' };
      case '微波炉': return { icon: '📻', label: '微波炉' };
    //中间
      default: return { icon: '🍴', label: '全能烹饪锅' };
    }
  })();

  return (
    <div className="flex flex-col flex-1 max-w-[1400px] mx-auto w-full animate-fade-in text-stone-800 gap-3">

      {/* 匹配模式 */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-stone-200/50 rounded-2xl max-w-[720px] 
      w-full mx-auto mb-4 shrink-0 shadow-sm border border-stone-300/30">
        {(['strict', 'fuzzy', 'survival'] as const).map((mode) => {
          const labels = { strict: '严格匹配', fuzzy: '模糊匹配', survival: '荒野生存' };
          const tooltips = {
            strict: '严格匹配：只使用所选食材，不添加任何额外食材',
            fuzzy: '模糊匹配：以所选食材为主，酌情添加辅料',
            survival: '荒野生存：以吃饱为目标的简易快手餐',
          };
          return (
            <div key={mode} className="relative">
              <button
                onMouseEnter={() => setHoveredMode(mode)}
                onMouseLeave={() => setHoveredMode(null)}
                onClick={() => setMatchingMode(mode)}
                className={`w-full text-center py-2 text-sm font-black rounded-lg transition-all cursor-pointer ${
                  matchingMode === mode ? 'bg-[#8ca779] text-white shadow' : 'text-stone-600 hover:text-stone-850'
                }`}
              >
                {labels[mode]}
              </button>
              {hoveredMode === mode && (
                <div className="absolute top-[115%] left-1/2 -translate-x-1/2 z-50 w-72 p-4 bg-[#2c3e23] border border-[#8ca779] text-white 
                rounded-xl shadow-xl text-sm leading-relaxed pointer-events-none text-center font-medium">
                  {tooltips[mode]}
               </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 厨具三栏 */}
      <div className="grid grid-cols-3 gap-6 items-center justify-center my-2 min-h-[340px]">

        {/* 左侧 */}
        <div className="flex flex-col gap-2 w-full">
          <div className="text-[16px] text-stone-400 font-bold block mb-0.5 text-left pl-1">慢炖焖煮类</div>
          {[
            { name: '炖煮锅', icon: '🍲' },
            { name: '汤锅/砂锅', icon: '🍯' },
            { name: '高压锅', icon: '🫕' },
          ].map((pot) => (
            <div
              key={pot.name}
              onClick={() => {
                setActivePot(pot.name);
                setHasSelectedSideCookware(true);
              }}
              className={`p-4 rounded-2xl border-2 text-center flex items-center 
              gap-2 cursor-pointer transition-all duration-200 select-none ${
                activePot === pot.name
                  ? 'border-[#8ca779] bg-[#eff7e8] scale-102 shadow-sm font-bold'
                  : 'border-stone-200/60 bg-white/75 hover:border-[#8ca779]/40'
              }`}
            >
              <span className="text-3xl shrink-0">{pot.icon}</span>
              <span className="text-base font-black text-stone-700 text-left truncate">{pot.name}</span>
            </div>
          ))}
        </div>

        {/* 中央大锅 */}
        <div className="flex flex-col items-center justify-center relative bg-[#ffffff]/35 rounded-3xl border border-white/60 p-4 shadow-sm min-h-[260px]">
          {activePot === '全能能炒能煮大锅' && (
            <div className="absolute -top-4 h-6 w-full flex items-center justify-center gap-1 pointer-events-none opacity-40 select-none">
              {selectedListWithDetails.slice(0, 4).map((food, i) => (
                <span key={`fall-${i}`} className="text-xs inline-block animate-bounce">
                  {food.emoji}
                </span>
              ))}
              {selectedListWithDetails.length > 4 && <span className="text-stone-400 font-mono text-[7px]">...</span>}
            </div>
          )}

          <div
            onClick={() => {
              if (hasSelectedSideCookware) {
                setActivePot('全能能炒能煮大锅');
                setHasSelectedSideCookware(false);
                showToast('已成功恢复默认全能烹饪锅');
              }
            }}
            className="relative w-[300px] h-[300px] flex items-center justify-center 
            cursor-pointer select-none scale-105 filter drop-shadow-sm "
          >
             {/* 左右手柄 */}
            <div className="absolute left-0 w-8 h-15 rounded-l-lg border border-stone-300 bg-[#ffeb99]/30 border-brand-green/30 -translate-x-[50%] flex items-center justify-center transition-colors">
              <div className="w-0.5 h-6 border-r border-stone-200"></div>
            </div>
            <div className="absolute right-0 w-8 h-15 rounded-r-lg border border-stone-300 bg-[#ffeb99]/30 border-brand-green/30 translate-x-[50%] flex items-center justify-center transition-colors">
              <div className="w-0.5 h-6 border-l border-stone-200"></div>
            </div>
            {/* 锅外圈 */}
            <div className="w-60 h-60 rounded-full border border-[#8ca779] 
            bg-white flex items-center justify-center  shadow-md ring-2 ring-[#8ca779]/15">
              {/* 锅内圈 */}
              <div className="w-[85%] h-[85%] rounded-full border border-stone-250 flex items-center justify-center relative overflow-hidden  bg-[#f4faf0]">
                <div className="absolute inset-1.5 rounded-full border border-dashed border-[#8ca779]/30 bg-gradient-to-tr from-[#cbd8c5]/20 to-yellow-50/10 flex flex-col items-center justify-center">
                  <span className="text-8xl block ">{activePotSpec.icon}</span>
                  <span className="text-[16px] font-sans font-black text-[#5d7350] mt-5 text-center px-1 truncate max-w-[90px]">{activePotSpec.label}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (basketCount === 0) {
                setShowNoIngredientsPopup(true);
              } else {
                setSubStep(5);
              }
            }}
            className="bg-brand-yellow hover:bg-[#edd250] text-stone-855 font-black text-[15px] py-1.5 px-4.5 rounded-full border border-stone-400 shadow-md flex items-center gap-1 transition-all active:scale-95 hover:scale-105 cursor-pointer mt-3.5 animate-pulse-subtle"
          >
            <Flame className="w-6 h-6 text-rose-500 fill-current animate-pulse" />
            <span>开始烹饪</span>
          </button>
        </div>

        {/* 右侧 */}
        <div className="flex flex-col gap-2 w-full">
          <div className="text-[16px] text-stone-400 font-bold block mb-0.5 text-left pl-1">高温速熟类</div>
          {[
            { name: '空气炸锅', icon: '🍿' },
            { name: '蒸笼/蒸锅', icon: '♨️' },
            { name: '微波炉', icon: '📻' },
          ].map((pot) => (
            <div
              key={pot.name}
              onClick={() => {
                setActivePot(pot.name);
                setHasSelectedSideCookware(true);
              }}
              className={`p-4 rounded-2xl border-2 text-center flex items-center 
                gap-2 cursor-pointer transition-all duration-200 select-none ${
                activePot === pot.name
                  ? 'border-[#8ca779] bg-[#eff7e8] scale-102 shadow-sm font-bold'
                  : 'border-stone-200/60 bg-white/75 hover:border-[#8ca779]/40'
              }`}
            >
              <span className="text-3xl shrink-0">{pot.icon}</span>
              <span className="text-base font-black text-stone-700 text-left truncate">{pot.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 调味提示 */}
      <div className="max-w-[900px] mx-auto w-full bg-amber-50/60 border border-amber-200/50 rounded-2xl px-5 py-4 text-center text-stone-700 text-sm font-medium select-none flex items-center justify-center gap-2 shadow-inner leading-relaxed">
        <span className="text-base">🧂</span>
        <span>
          <strong className="text-stone-800">调味提示：</strong>
          基础调料辅料（如盐、酱油、食用油、香葱等）系统已默认您作为底料配置，烹饪时记得适量下锅点缀哦
        </span>
      </div>

      {/* 底部控制栏 */}
      {/* 改后：border-t（细线）+ border-stone-200（浅灰）与图4一致 */}
      <div className="relative flex items-center justify-center border-t border-stone-200 pt-3 mt-6 mb-4 max-w-[1300px] w-full mx-auto shrink-0 select-none">
        {/* ---- 4-1. 人数选择 ---- */}
        <div className="absolute left-0 top-3 flex items-center gap-3 bg-stone-50 border border-stone-200 p-4 px-2.5 rounded-2xl shrink-0">
          <span className="text-sm">👥</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={potScale <= 1}
              onClick={() => setPotScale(Math.max(1, potScale - 1))}
              className="w-5.5 h-5.5 rounded-lg bg-white border border-stone-300 font-extrabold text-base flex items-center justify-center hover:bg-stone-100 disabled:opacity-40 transition-colors cursor-pointer"
            >
              -
            </button>
            {/* 人数文字：原来是 3 + 人份 上下两行，改为一行显示 */}
            <span className="font-mono font-black text-base text-[#5d7350] min-w-[60px]  text-center">{potScale}人份</span>
            <button
              type="button"
              onClick={() => {
                if (potScale >= 10) {
                  showToast('就餐人最多支持 10 人哦！');
                } else {
                  setPotScale(potScale + 1);
                }
              }}
              className="w-5.5 h-5.5 rounded-lg bg-white border border-stone-300 font-extrabold text-xs flex items-center justify-center hover:bg-stone-100 transition-colors cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* ---- 4-2. 返回 / 推荐 ---- */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSubStep(3)}
            className="bg-[#f5f6f4] hover:bg-stone-200 text-stone-700 font-black text-base py-2.5 px-5.5 rounded-full transition-all active:scale-95 cursor-pointer"
          >
            ← 返回食材挑选
          </button>

          <button
            onClick={() => setSubStep(5)}
            className="bg-[#8ca779] hover:bg-[#728f60] text-white font-black text-base py-2.5 px-5.5 rounded-full shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            生成推荐菜谱 →
          </button>
        </div>

        {/* 购物车 */}
        <div className="absolute right-0 top-3 shrink-0">
          <button
            id="shopping-cart-btn"
            onClick={() => setIsBasketOpen(!isBasketOpen)}
             className="relative p-3 bg-white rounded-full border shadow shrink-0 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center cursor-pointer text-brand-green-dark"
            title="点击查看已选食材详情"
          >
            <ShoppingCart className="w-7 h-7 text-brand-green-dark" />
            {basketCount > 0 && (
              <span className={`absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full 
              text-[9px] w-4.5 h-4.5 flex items-center justify-center font-bold transition-all 
              duration-200 ${cartBadgePop ? 'scale-125 bg-rose-600' : 'scale-100'}`}>
                {basketCount}
              </span>
            )}
          </button>

          {/* 购物车展开浮窗 */}
          {isBasketOpen && (
            <div className="absolute bottom-[115%] right-0 z-50 w-72 max-h-80 bg-white border border-[#a2c28f]/30 rounded-2xl shadow-2xl p-4 flex flex-col text-left overflow-hidden animate-scale-up">
              <div className="flex justify-between items-center pb-2 border-b mb-2">
                <span className="font-extrabold text-sm text-stone-800">
                  购物车详情</span>
                <button
                  onClick={() => setIsBasketOpen(false)}
                  className="text-stone-400 hover:text-stone-600 font-bold p-0.5 text-xs"
                >
                  ✕
                </button>
              </div>
               {/* 浮窗内容 */}
              <div className="flex-1 overflow-y-auto custom-scroll pr-1 space-y-1.5 py-1">
                {selectedListWithDetails.length === 0 ? (
                  <p className="text-[16px] text-stone-400 italic py-4 text-center">篮子空空如也，请返回挑选食材</p>
                ) : (
                  /* 已选食材逐条列表（带删除） */
                  selectedListWithDetails.map((food, idx) => (
                    <div key={`basket-${idx}`} className="flex items-center justify-between p-1.5 hover:bg-stone-50 
                    rounded-xl border border-stone-100">
                      <span className="text-[15px] font-black text-stone-750 flex items-center gap-1.5">
                        <span>{food.emoji}</span>
                        <span>{food.name}</span>
                      </span>
                      <button
                        onClick={() => handleToggleIngredient(food.name, food.category)}
                        className="text-stone-350 hover:text-red-500 text-[15px] font-bold p-1 px-2 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  ))
                )}
              </div>
              {selectedListWithDetails.length > 0 && (
                <button
                  onClick={() => {
                    setSelectedVeggies([]);
                    setSelectedMeats([]);
                    setSelectedStaples([]);
                    setSelectionOrder([]);
                    setIsBasketOpen(false);
                    showToast('成功清空食材篮！');
                  }}
                  className="w-full mt-2 bg-stone-100 hover:bg-red-50 hover:text-red-600 border border-stone-200 py-1.5 rounded-xl text-stone-500 text-[15px] font-extrabold transition-colors text-center"
                >
                  全部清空
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}