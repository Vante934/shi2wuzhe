import { useState } from 'react';

interface PreferencesPageProps {
  cookingLevel: 'junior' | 'senior';
  setCookingLevel: (v: 'junior' | 'senior') => void;

  tasteTendency: string;
  setTasteTendency: (v: string) => void;

  avoidTags: string[];
  setAvoidTags: (updater: (prev: string[]) => string[]) => void;
  customAvoids: string[];
  setCustomAvoids: (updater: (prev: string[]) => string[]) => void;
  avoidSearchText: string;
  setAvoidSearchText: (v: string) => void;

  allergens: string[];
  setAllergens: (updater: (prev: string[]) => string[]) => void;
  customAllergens: string[];
  setCustomAllergens: (updater: (prev: string[]) => string[]) => void;
  allergenSearchText: string;
  setAllergenSearchText: (v: string) => void;

  mealReminder: boolean;
  setMealReminder: (v: boolean) => void;
  reminderTime: string;
  setReminderTime: (v: string) => void;

  onBack: () => void;
  showToast: (msg: string) => void;
}

/* ============================================================
   默认快捷标签：自定义添加的会拼在后面
   ============================================================ */
const DEFAULT_AVOID_TAGS = ['香菜', '芹菜', '洋葱', '大蒜', '辣椒', '花椒', '生姜', '葱花'];
const DEFAULT_ALLERGENS = ['花生', '坚果', '海鲜', '牛奶', '鸡蛋', '麸质', '大豆'];

export default function PreferencesPage({
  cookingLevel, setCookingLevel, tasteTendency, setTasteTendency, avoidTags, setAvoidTags,
  customAvoids, setCustomAvoids, avoidSearchText, setAvoidSearchText, allergens, setAllergens,
  customAllergens, setCustomAllergens, allergenSearchText, setAllergenSearchText, mealReminder,
  setMealReminder, reminderTime, setReminderTime, onBack, showToast,
}: PreferencesPageProps) {

  const [openPrefSection, setOpenPrefSection] = useState<string | null>('cookingMode');

  /* ============================================================
     【新增】添加自定义忌口
     - 拼到 customAvoids（用于持久化记住"自定义"标签）
     - 同时勾选到 avoidTags（即选中状态）
     ============================================================ */
  const handleAddCustomAvoid = (raw: string) => {
    const v = raw.trim();
    if (!v) return;

    // 已经在默认标签里 → 只勾选
    if (DEFAULT_AVOID_TAGS.includes(v)) {
      if (!avoidTags.includes(v)) {
        setAvoidTags((prev) => [...prev, v]);
        showToast(`已添加忌口：${v}`);
      } else {
        showToast(`「${v}」已经在忌口列表中`);
      }
      setAvoidSearchText('');
      return;
    }

    // 加入自定义标签列表
    if (!customAvoids.includes(v)) {
      setCustomAvoids((prev) => [...prev, v]);
    }
    // 自动勾选
    if (!avoidTags.includes(v)) {
      setAvoidTags((prev) => [...prev, v]);
    }
    showToast(`已添加忌口：${v}`);
    setAvoidSearchText('');
  };

  /* ============================================================
     【新增】添加自定义过敏原
     - 拼到 customAllergens
     - 同时勾选到 allergens
     ============================================================ */
  const handleAddCustomAllergen = (raw: string) => {
    const v = raw.trim();
    if (!v) return;

    if (DEFAULT_ALLERGENS.includes(v)) {
      if (!allergens.includes(v)) {
        setAllergens((prev) => [...prev, v]);
        showToast(`已添加过敏原：${v}`);
      } else {
        showToast(`「${v}」已经在过敏原列表中`);
      }
      setAllergenSearchText('');
      return;
    }

    if (!customAllergens.includes(v)) {
      setCustomAllergens((prev) => [...prev, v]);
    }
    if (!allergens.includes(v)) {
      setAllergens((prev) => [...prev, v]);
    }
    showToast(`已添加过敏原：${v}`);
    setAllergenSearchText('');
  };

  /* ============================================================
     【新增】合并默认 + 自定义标签，统一渲染
     ============================================================ */
  const allAvoidTagsToShow = [...DEFAULT_AVOID_TAGS, ...customAvoids.filter(c => !DEFAULT_AVOID_TAGS.includes(c))];
  const allAllergensToShow = [...DEFAULT_ALLERGENS, ...customAllergens.filter(c => !DEFAULT_ALLERGENS.includes(c))];

  /* ============================================================
     【新增】点击 X 删除标签：
     - 自定义的 → 同时从 customAvoids 和 avoidTags 移除
     - 默认的不可删除 X（只能反选）
     ============================================================ */
  const removeAvoidTag = (tag: string) => {
    setAvoidTags((prev) => prev.filter((t) => t !== tag));
    if (customAvoids.includes(tag)) {
      setCustomAvoids((prev) => prev.filter((c) => c !== tag));
    }
  };

  const removeAllergen = (tag: string) => {
    setAllergens((prev) => prev.filter((a) => a !== tag));
    if (customAllergens.includes(tag)) {
      setCustomAllergens((prev) => prev.filter((c) => c !== tag));
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full h-full space-y-4 overflow-y-auto custom-scroll px-2">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-1 px-3 text-base bg-white text-stone-600 rounded-lg hover:bg-brand-yellow font-bold border cursor-pointer transition-colors"
        >
          ← 返回
        </button>
        <span className="text-[28px] font-black text-stone-850 mb-4">偏好设置</span>
        <div className="w-12"></div>
      </div>

      <div className="space-y-3 text-left">

        {/* 1. 厨艺模式 */}
        <div className="bg-white border border-stone-200/80 rounded-2xl overflow-hidden shadow-xs transition-all duration-200">
          <button
            onClick={() => setOpenPrefSection(openPrefSection === 'cooking' ? null : 'cooking')}
            className="w-full flex items-center justify-between p-4 font-bold text-[20px] text-stone-800 hover:bg-[#fcfdfb] cursor-pointer"
          >
            <span className="flex items-center gap-2">🍳 厨艺模式</span>
            <span className="text-[15px] text-stone-400 font-medium flex items-center gap-1.5">
              {cookingLevel === 'junior' ? '厨房小白' : '厨房大佬'}
              <span>{openPrefSection === 'cooking' ? '▲' : '▼'}</span>
            </span>
          </button>

          {openPrefSection === 'cooking' && (
            <div className="p-4 border-t border-stone-100 bg-[#fbfcf9] space-y-3 animate-fade-in text-[11px] text-stone-600 text-left">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 w-full">
                <div>
                  <span className="text-[15px] font-black text-stone-850 block">模式切换</span>
                  <span className="text-[13px] text-stone-400 block mt-0.5">
                    {cookingLevel === 'junior'
                      ? '当前：厨房小白模式 —— 新手友好、描述详尽的快手菜'
                      : '当前：厨房大佬模式 —— 高级调味、充满挑战的复杂菜'}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 select-none">
                  <span className={`text-[13px] font-bold ${cookingLevel === 'junior' ? 'text-[#8ca779] font-black' : 'text-stone-400'}`}>小白</span>
                  <button
                    type="button"
                    onClick={() => setCookingLevel(cookingLevel === 'junior' ? 'senior' : 'junior')}
                    className={`w-12 h-6.5 rounded-full relative transition-colors duration-200 outline-none cursor-pointer ${
                      cookingLevel === 'senior' ? 'bg-[#8ca779]' : 'bg-stone-300'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5.5 h-5.5 bg-white rounded-full transition-transform duration-200 shadow-md ${
                        cookingLevel === 'senior' ? 'translate-x-5.5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className={`text-[13px] font-bold ${cookingLevel === 'senior' ? 'text-[#8ca779] font-black' : 'text-stone-400'}`}>大佬</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. 口味偏好 */}
        <div className="bg-white border border-stone-200/80 rounded-2xl overflow-hidden shadow-xs transition-all duration-200">
          <button
            onClick={() => setOpenPrefSection(openPrefSection === 'taste' ? null : 'taste')}
            className="w-full flex items-center justify-between p-4 font-bold text-[20px] text-stone-800 hover:bg-[#fcfdfb] cursor-pointer"
          >
            <span className="flex items-center gap-2">🌶️ 口味偏好</span>
            <span className="text-[15px] text-stone-400 font-medium flex items-center gap-1.5">
              {tasteTendency || '请选择'}
              <span>{openPrefSection === 'taste' ? '▲' : '▼'}</span>
            </span>
          </button>

          {openPrefSection === 'taste' && (
            <div className="p-4 border-t border-[#f1f5ef] bg-[#fbfcf9] space-y-3.5 text-[13px] text-stone-600">
              <div className="space-y-1">
                <span className="text-[15px] font-black text-stone-500 block mb-3">您的口味偏好 (单选)</span>
                <div className="flex flex-wrap gap-2">
                  {['不挑（默认）', '清淡', '重口', '偏辣', '偏甜', '偏咸'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setTasteTendency(opt)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        tasteTendency === opt
                          ? 'bg-[#8ca779] border-[#8ca779] text-white shadow-xs'
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {tasteTendency !== '不挑（默认）' && (
                  <button
                    onClick={() => {
                      setTasteTendency('不挑（默认）');
                      showToast('已恢复默认');
                    }}
                    className="text-[13px] text-[#5d7350] hover:text-[#415237] underline font-extrabold flex items-center gap-1 cursor-pointer pt-1"
                  >
                    重置默认
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ============ 3. 忌口食材：自定义合并到上方快捷标签 ============ */}
        <div className="bg-white border border-stone-200/80 rounded-2xl overflow-hidden shadow-xs transition-all duration-200">
          <button
            onClick={() => setOpenPrefSection(openPrefSection === 'avoid' ? null : 'avoid')}
            className="w-full flex items-center justify-between p-4 font-bold text-[20px] text-stone-800 hover:bg-[#fcfdfb] cursor-pointer"
          >
            <span className="flex items-center gap-2">🚫 忌口食材</span>
            <span className="text-[15px] text-stone-400 font-medium flex items-center gap-1.5">
              已避开 {avoidTags.length} 款
              <span>{openPrefSection === 'avoid' ? '▲' : '▼'}</span>
            </span>
          </button>

          {openPrefSection === 'avoid' && (
            <div className="p-4 border-t border-[#f1f5ef] bg-[#fbfcf9] space-y-4 text-[13px] text-stone-600 text-left">

              {/* 快捷标签：默认 + 自定义合并展示 */}
              <div className="space-y-2">
                <span className="text-[15px] font-black text-stone-500 block mb-3">快捷标签 (多选，点击可勾选/取消)</span>
                <div className="flex flex-wrap gap-1.5">
                  {allAvoidTagsToShow.map((tag) => {
                    const isSelected = avoidTags.includes(tag);
                    const isCustom = customAvoids.includes(tag);
                    return (
                      <div key={tag} className="relative inline-flex items-center group">
                        <button
                          onClick={() => {
                            if (isSelected) {
                              setAvoidTags((prev) => prev.filter((t) => t !== tag));
                            } else {
                              setAvoidTags((prev) => [...prev, tag]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-full border text-[13px] font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-rose-500 border-rose-500 text-white shadow-xs pr-7'
                              : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                          } ${isCustom ? 'border-dashed' : ''}`}
                        >
                          {isSelected ? '✓ ' : ''}{tag}
                        </button>

                        {/* 自定义标签右上角小 X：彻底删除 */}
                        {isCustom && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeAvoidTag(tag);
                              showToast(`已删除自定义忌口：${tag}`);
                            }}
                            className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                              isSelected
                                ? 'right-1.5 bg-white/30 hover:bg-white/50 text-white'
                                : 'right-1.5 bg-stone-300/0 group-hover:bg-stone-300 text-stone-500'
                            }`}
                            title="删除此自定义标签"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 添加自定义食材 */}
              <div className="space-y-2.5 pt-1 border-t border-dashed border-stone-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="输入想要过滤的食材，例如：牛肉、香菇"
                    value={avoidSearchText}
                    onChange={(e) => setAvoidSearchText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddCustomAvoid(avoidSearchText);
                      }
                    }}
                    className="flex-1 bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-[15px] outline-none focus:border-brand-green"
                  />
                  <button
                    onClick={() => handleAddCustomAvoid(avoidSearchText)}
                    className="bg-brand-green hover:bg-brand-green-dark text-white text-[13px] font-extrabold px-3 py-1.5 rounded-xl cursor-pointer"
                  >
                    添加 +
                  </button>
                </div>

                {avoidSearchText.trim().length > 0 && (
                  <div className="bg-white border rounded-xl p-2 w-full max-h-[140px] overflow-y-auto space-y-1 shadow-xs font-mono">
                    <span className="text-[11px] text-stone-400 block px-1">匹配食材:</span>
                    {['牛肉', '猪肉', '羊肉', '西红柿', '黄瓜', '菠菜', '香菇', '金针菇', '胡椒', '韭菜', '芝麻']
                      .filter((item) => item.includes(avoidSearchText.trim()))
                      .map((item) => (
                        <button
                          key={item}
                          onClick={() => handleAddCustomAvoid(item)}
                          className="w-full text-left p-1.5 text-[13px] text-stone-700 hover:bg-[#8ca779]/10 rounded-md font-bold transition-colors"
                        >
                          添加 "{item}"
                        </button>
                      ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* ============ 4. 过敏原：自定义合并到上方快捷标签 ============ */}
        <div className="bg-white border border-stone-200/80 rounded-2xl overflow-hidden shadow-xs transition-all duration-200">
          <button
            onClick={() => setOpenPrefSection(openPrefSection === 'allergens' ? null : 'allergens')}
            className="w-full flex items-center justify-between p-4 font-bold text-[20px] text-stone-800 hover:bg-[#fcfdfb] cursor-pointer"
          >
            <span className="flex items-center gap-2">🥜 过敏原设置</span>
            <span className="text-[15px] text-stone-400 font-medium flex items-center gap-1.5">
              已选 {allergens.length} 种过敏原
              <span>{openPrefSection === 'allergens' ? '▲' : '▼'}</span>
            </span>
          </button>

          {openPrefSection === 'allergens' && (
            <div className="p-4 border-t border-[#f1f5ef] bg-[#fbfcf9] space-y-4 text-xs text-stone-600 text-left animate-fade-in">

              {/* 快捷标签：默认 + 自定义合并展示 */}
              <div className="space-y-1.5">
                <span className="text-[15px] font-black text-stone-500 block mb-3">快捷标签 (多选，点击可勾选/取消)</span>
                <div className="flex flex-wrap gap-1.5">
                  {allAllergensToShow.map((alg) => {
                    const isSelected = allergens.includes(alg);
                    const isCustom = customAllergens.includes(alg);
                    return (
                      <div key={alg} className="relative inline-flex items-center group">
                        <button
                          onClick={() => {
                            if (isSelected) {
                              setAllergens((prev) => prev.filter((a) => a !== alg));
                            } else {
                              setAllergens((prev) => [...prev, alg]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-600 border-amber-600 text-white shadow-xs pr-7'
                              : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'
                          } ${isCustom ? 'border-dashed' : ''}`}
                        >
                          {isSelected ? '✓ ' : ''}{alg}
                        </button>

                        {isCustom && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeAllergen(alg);
                              showToast(`已删除自定义过敏原：${alg}`);
                            }}
                            className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                              isSelected
                                ? 'right-1.5 bg-white/30 hover:bg-white/50 text-white'
                                : 'right-1.5 bg-stone-300/0 group-hover:bg-stone-300 text-stone-500'
                            }`}
                            title="删除此自定义标签"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 添加自定义过敏原 */}
              <div className="space-y-2 pt-3 border-t border-dashed border-stone-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="输入过敏原，例：芒果、荞麦、坚果"
                    value={allergenSearchText}
                    onChange={(e) => setAllergenSearchText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddCustomAllergen(allergenSearchText);
                      }
                    }}
                    className="flex-1 bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-[15px] outline-none focus:border-brand-green font-medium"
                  />
                  <button
                    onClick={() => handleAddCustomAllergen(allergenSearchText)}
                    className="bg-[#8ca779] hover:bg-[#728f60] text-white px-3.5 py-1.5 rounded-xl text-xs font-black cursor-pointer shadow-xs transition-all active:scale-95"
                  >
                    添加 +
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 5. 通知设置 */}
        <div className="bg-white border border-stone-200/80 rounded-2xl overflow-hidden shadow-xs transition-all duration-200">
          <button
            onClick={() => setOpenPrefSection(openPrefSection === 'notification' ? null : 'notification')}
            className="w-full flex items-center justify-between p-4 font-bold text-[20px] text-stone-800 hover:bg-[#fcfdfb] cursor-pointer"
          >
            <span className="flex items-center gap-2">🔔 通知设置</span>
            <span className="text-[15px] text-stone-400 font-medium flex items-center gap-1.5">
              {mealReminder ? '已开启提醒' : '已关闭提醒'}
              <span>{openPrefSection === 'notification' ? '▲' : '▼'}</span>
            </span>
          </button>

          {openPrefSection === 'notification' && (
            <div className="p-4 border-t border-[#f1f5ef] bg-[#fbfcf9] text-xs text-stone-600 space-y-3 text-left animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-stone-850 block mb-0.5">就餐提醒服务</strong>
                  <p className="text-[13px] text-stone-400 block font-normal">开启后系统会在指定时间通过界面或通知栏同步提醒</p>
                </div>
                <button
                  onClick={() => setMealReminder(!mealReminder)}
                  className={`w-12 h-6 rounded-full p-0.5 transition-colors relative cursor-pointer ${mealReminder ? 'bg-brand-green' : 'bg-stone-300'}`}
                >
                  <span className={`w-5 h-5 rounded-full bg-white block shadow transition-transform ${mealReminder ? 'translate-x-[24px]' : 'translate-x-0'}`}></span>
                </button>
              </div>

              {mealReminder && (
                <div className="bg-stone-50 border border-stone-200/50 p-3 rounded-2xl space-y-2 animate-fade-in mt-2 select-none">
                  <div className="flex items-center justify-between">
                    <span className="text-[15px] font-black text-stone-500">自定义时间:</span>
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="bg-white border rounded-lg px-2 py-0.5 text-[15px] text-stone-700 outline-none focus:border-[#8ca779] font-mono font-bold"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}