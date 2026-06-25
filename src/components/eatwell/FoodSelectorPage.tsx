/**
 * ============================================================================
 * 食材选择页（EatWell 流程第 1~3 步）
 * ----------------------------------------------------------------------------
 * subStep === 1  ->  选蔬菜
 * subStep === 2  ->  选肉类（含海鲜/蛋奶/豆制品）
 * subStep === 3  ->  选主食
 * ----------------------------------------------------------------------------
 * 主要功能：
 *   - 按当前 subStep 显示对应类别的食材网格（可点击多选）
 *   - 顶部搜索框：支持按名称/别名/拼音过滤
 *   - 已选配料篮：横向滚动展示已选食材标签
 *   - 底部三按钮：垃圾桶（清空）/ 下一步 / 购物车浮窗
 *   - 偏好设置中的"忌口"会从可选列表中自动过滤
 * ============================================================================
 */

import { Search, X, ShoppingCart, Trash2, ChevronRight } from 'lucide-react';
import type { Food } from '../../types';

interface FoodSelectorPageProps {
  subStep: 1 | 2 | 3;
  setSubStep: (s: number) => void;

  availableVeggiesFiltered: Food[];
  availableMeatsFiltered: Food[];
  availableStaplesFiltered: Food[];

  selectedVeggies: string[];
  selectedMeats: string[];
  selectedStaples: string[];
  selectedListWithDetails: Food[];
  selectedBasketCaloriesTotal: number;
  basketCount: number;

  forbiddenFoodsSelected: string[];

  searchQuery: string;
  setSearchQuery: (v: string) => void;

  isBasketOpen: boolean;
  setIsBasketOpen: (v: boolean) => void;

  showClearConfirm: boolean;
  setShowClearConfirm: (v: boolean) => void;

  cartBadgePop: boolean;

  handleToggleIngredient: (
    name: string,
    category: 'veggie' | 'meat' | 'staple',
    e?: React.MouseEvent
  ) => void;
  setSelectedVeggies: (v: string[]) => void;
  setSelectedMeats: (v: string[]) => void;
  setSelectedStaples: (v: string[]) => void;
  setSelectionOrder: (v: string[]) => void;

  checkQueryRestrictions: (q: string) => { type: string; message: string } | null;

  showToast: (msg: string) => void;
}

export default function FoodSelectorPage({
  subStep, setSubStep, availableVeggiesFiltered, availableMeatsFiltered,
  availableStaplesFiltered, selectedVeggies, selectedMeats, selectedStaples,
  selectedListWithDetails, selectedBasketCaloriesTotal, basketCount,
  forbiddenFoodsSelected, searchQuery, setSearchQuery, isBasketOpen,
  setIsBasketOpen, showClearConfirm, setShowClearConfirm, cartBadgePop,
  handleToggleIngredient, setSelectedVeggies, setSelectedMeats, setSelectedStaples,
  setSelectionOrder, checkQueryRestrictions, showToast,
}: FoodSelectorPageProps) {

  // 当前步骤对应的食材池 + 搜索过滤
  const items = (
    subStep === 1 ? availableVeggiesFiltered :
    subStep === 2 ? availableMeatsFiltered :
                    availableStaplesFiltered
  ).filter((item) => {
    if (!searchQuery) return true;
    const term = searchQuery.toLowerCase();
    return (
      item.name.includes(term) ||
      item.alias.includes(term) ||
      item.pinyin.includes(term)
    );
  });

  // 搜索词撞到忌口
  const matchesForbidden =
    !!searchQuery &&
    forbiddenFoodsSelected.some(
      (forbidden) =>
        forbidden.toLowerCase().includes(searchQuery.toLowerCase()) ||
        searchQuery.toLowerCase().includes(forbidden.toLowerCase())
    );

  return (
    <div className="flex flex-col flex-1 mx-auto w-full gap-4 px-2">

      {/* ===== 模块1：搜索框 ===== */}
      <div className="relative max-w-[1200px] w-full mx-auto">
        <input
          type="text"
          placeholder="搜索更多美好..."
          value={searchQuery}
          onChange={(e) => {
            const val = e.target.value;
            setSearchQuery(val);
            if (val.trim()) {
              const check = checkQueryRestrictions(val);
              if (check) showToast(check.message);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (!searchQuery.trim()) {
                showToast('请输入需要添加的食材');
                return;
              }
              const check = checkQueryRestrictions(searchQuery);
              if (check) {
                showToast(check.message);
                return;
              }
              if (subStep < 3) {
                setSubStep(subStep + 1);
                setSearchQuery('');
                showToast('已为您自动暂存选择，进入下一步原料选择');
              } else {
                setSubStep(4);
                setSearchQuery('');
                showToast('原料备齐，进入准备烹饪阶段');
              }
            }
          }}
          className="w-full bg-white border-2 border-brand-green pl-12 pr-5 py-3 rounded-full text-base outline-none shadow-sm focus:border-brand-green-dark"
        />
        <Search className="w-6 h-6 text-[#8ba779] absolute left-4 top-3.5 animate-pulse" />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-5 top-4 hover:text-red-500"
          >
            <X className="w-6 h-6 text-stone-400" />
          </button>
        )}
      </div>

      {/* ===== 模块2：食材网格区（修复点：加 max-h 限高 + 内部滚动） =====
       ============================================================ */}
      <div
        className="bg-white/75 border border-brand-green/20 rounded-3xl p-5 overflow-y-auto custom-scroll"
        style={{ maxHeight: 'calc(100vh - 500px)', minHeight: '420px' }}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3.5">
          {/* 忌口横幅 */}
          {matchesForbidden && (
            <div className="col-span-full bg-red-50 border border-red-200 text-red-800 text-[11px] p-3 rounded-xl font-bold flex items-center gap-2 mb-2 select-none animate-fade-in text-left">
              <span>
                识食物者提示：该食材已设置忌口过滤，可前往"个人中心-偏好设置"解除"
                {forbiddenFoodsSelected.find(
                  (f) =>
                    f.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    searchQuery.toLowerCase().includes(f.toLowerCase())
                )}
                "此类食材已被过滤。
              </span>
            </div>
          )}

          {/* 空态 */}
          {items.length === 0 ? (
            <div className="col-span-full py-12 text-center flex flex-col items-center justify-center gap-2 w-full">
              <span className="text-3xl text-stone-300"></span>
              <p className="text-xs text-stone-400 font-bold px-4 leading-relaxed">
                没有搜索到当前食材，请检查是否被过滤，或者尝试其他食材关键字
              </p>
            </div>
          ) : (
            items.map((item) => {
              const isSelected =
                subStep === 1 ? selectedVeggies.includes(item.name) :
                subStep === 2 ? selectedMeats.includes(item.name) :
                                selectedStaples.includes(item.name);

              return (
                <div
                  key={item.name}
                  onClick={(e) => handleToggleIngredient(item.name, item.category, e)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border cursor-pointer select-none transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#a9c894] border-[#8ba779] text-white shadow-md scale-102 font-bold'
                      : 'bg-[#dbf1c4]/60 border-brand-green/20 text-stone-700 hover:bg-[#cbeab0] hover:scale-101'
                  }`}
                >
                  <span className="text-4xl">{item.emoji}</span>
                  <span className="text-xs font-black">{item.name}</span>
                  <span
                    className={`text-[13px] px-1.5 py-0.5 rounded font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {item.calories}卡/100g
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ===== 模块3：购物菜篮（保持不变） ===== */}
      <div className="bg-[#eff7e8] border border-brand-green/20 p-3 rounded-2xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-black text-brand-grey flex items-center gap-1">
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>购物菜篮 ({basketCount})</span>
          </span>
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-stone-800">
              预计总热量：
              <strong className="text-orange-950 bg-brand-yellow px-1.5 py-0.5 rounded">
                {selectedBasketCaloriesTotal} 卡
              </strong>
            </span>
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto custom-scroll pb-1">
          {selectedListWithDetails.length === 0 ? (
            <span className="text-[12px] text-stone-400 italic block py-1 pl-1">
              您还没有选择任何食材，上方卡片可多选
            </span>
          ) : (
            selectedListWithDetails.map((food) => (
              <div
                key={`${food.name}-label`}
                className="bg-white border text-[15px] text-stone-700 font-bold py-1 px-2.5 rounded-full flex items-center gap-1 shrink-0 shadow-sm"
              >
                <span>
                  {food.emoji} {food.name}{' '}
                  <strong className="text-stone-400 font-mono font-normal">
                    ({food.calories}c)
                  </strong>
                </span>
                <X
                  className="w-3 h-3 text-stone-400 hover:text-red-500 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleIngredient(food.name, food.category);
                  }}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* ===== 模块4：底部操作栏（保持不变） ===== */}
      <div className="flex justify-between items-center">
        <div className="relative">
          <button
            onClick={() => {
              if (basketCount === 0) {
                showToast('没有可清空的食材');
                return;
              }
              setShowClearConfirm(!showClearConfirm);
            }}
            className="bg-white hover:bg-rose-50 border border-stone-200 p-3 rounded-full shadow-md text-red-500 shrink-0 flex items-center justify-center transition-transform hover:scale-115 active:scale-90 cursor-pointer"
            title="一键清空所有已选食材"
          >
            <Trash2 className="w-7 h-7" />
          </button>

          {showClearConfirm && (
            <div className="absolute bottom-[115%] left-0 z-50 w-45 p-3 bg-white border-2 border-red-200 rounded-2xl shadow-xl text-left animate-scale-up">
              <p className="text-[13px] text-stone-500 font-bold mb-2">
                确定清空所有已选食材吗？
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-2.5 py-1 text-[12px] text-stone-500 border rounded-lg hover:bg-stone-50 font-semibold cursor-pointer"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    setSelectedVeggies([]);
                    setSelectedMeats([]);
                    setSelectedStaples([]);
                    setSelectionOrder([]);
                    setShowClearConfirm(false);
                    showToast('已清空所有已选食材');
                  }}
                  className="px-2.5 py-1 text-[12px] bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold cursor-pointer"
                >
                  确定
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            if (subStep < 3) setSubStep(subStep + 1);
            else setSubStep(4);
          }}
          className="bg-brand-yellow hover:bg-brand-yellow-hover text-stone-800 font-extrabold py-3.5 px-10 rounded-full border border-stone-300 shadow-md text-xs tracking-wide flex items-center gap-1"
        >
          <span>选好了，下一步</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="relative">
          <button
            id="shopping-cart-btn"
            onClick={() => setIsBasketOpen(!isBasketOpen)}
            className="relative p-3 bg-white rounded-full border shadow shrink-0 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center cursor-pointer text-brand-green-dark"
            title="点击查看已选食材详情"
          >
            <ShoppingCart className="w-7 h-7 text-brand-green-dark" />
            {basketCount > 0 && (
              <span
                className={`absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full text-[9px] w-4.5 h-4.5 flex items-center justify-center font-bold transition-all duration-200 ${
                  cartBadgePop ? 'scale-125 bg-rose-600' : 'scale-100'
                }`}
              >
                {basketCount}
              </span>
            )}
          </button>

          {isBasketOpen && (
            <div className="absolute bottom-[115%] right-0 z-50 w-72 max-h-80 bg-white border border-[#a2c28f]/30 rounded-2xl shadow-2xl p-4 flex flex-col text-left overflow-hidden animate-scale-up">
              <div className="flex justify-between items-center pb-2 border-b mb-2">
                <span className="font-extrabold text-sm text-stone-800">
                  购物车详情
                </span>
                <button
                  onClick={() => setIsBasketOpen(false)}
                  className="text-stone-400 hover:text-stone-600 font-bold p-0.5 text-xs"
                >
                  ✕
                </button>
              </div>

              {selectedListWithDetails.length === 0 ? (
                <div className="text-center py-6 text-[16px] text-stone-400">
                  篮子空空如也，快去挑选吧！
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto max-h-48 custom-scroll space-y-1.5 pr-1">
                    {selectedListWithDetails.map((item) => (
                      <div
                        key={item.name}
                        className="flex justify-between items-center p-1.5 px-2.5 bg-stone-50 rounded-xl border border-stone-150 text-[11px] text-stone-700"
                      >
                        <span className="flex items-center gap-1.5 font-semibold">
                          <span className="text-base">{item.emoji}</span>
                          <span>{item.name}</span>
                          <span className="text-[11px] text-stone-400 font-light">
                            ({item.calories}卡/100g)
                          </span>
                        </span>
                        <button
                          onClick={() => handleToggleIngredient(item.name, item.category)}
                          className="text-red-400 hover:text-red-650 hover:bg-stone-200/50 p-1 rounded-md text-[13px]"
                          title="移除此项"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between items-center text-[13px] font-mono font-bold text-stone-500 shrink-0">
                    <span>共计：{selectedListWithDetails.length} 样食材</span>
                    <span>估卡：{selectedBasketCaloriesTotal} kcal</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}