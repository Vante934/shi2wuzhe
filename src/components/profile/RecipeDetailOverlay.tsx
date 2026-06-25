import { X } from 'lucide-react';

interface RecipeDetailOverlayProps {
  detail: any | null;
  isEditing: boolean;
  editingName: string;
  editingEmoji: string;

  setIsEditing: (v: boolean) => void;
  setEditingName: (v: string) => void;
  setEditingEmoji: (v: string) => void;
  setMyOriginalRecipes: (updater: (prev: any[]) => any[]) => void;
  setMyDraftRecipes: (updater: (prev: any[]) => any[]) => void;
  setDetail: (v: any) => void;

  onCookNow: () => void;
  onClose: () => void;
}

export default function RecipeDetailOverlay({
  detail,
  isEditing,
  editingName,
  editingEmoji,
  setIsEditing,
  setEditingName,
  setEditingEmoji,
  setMyOriginalRecipes,
  setMyDraftRecipes,
  setDetail,
  onCookNow,
  onClose,
}: RecipeDetailOverlayProps) {
  if (!detail) return null;
  const viewingMyRecipeDetail = detail;

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="bg-white rounded-[2.5rem] w-full max-w-[460px] p-6 text-center shadow-2xl relative overflow-hidden border border-stone-200 text-left animate-scale-up">

        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 bg-stone-100 hover:bg-stone-200 p-2 border rounded-full cursor-pointer transition-colors"
        >
          <X className="w-4 h-4 text-stone-700" />
        </button>

        <div className="text-center pb-3 border-b border-stone-100 mb-4 select-none">
          <span className="text-[25px] font-black text-stone-400 font-sans tracking-wide">食谱详情</span>
        </div>

        {!isEditing ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-5xl bg-amber-50 p-3 rounded-2xl border shadow-inner shrink-0 select-none">
                {viewingMyRecipeDetail.coverEmoji || viewingMyRecipeDetail.emoji || '🥘'}
              </span>
              <div className="min-w-0">
                <h4 className="font-extrabold text-[#3a4730] text-[20px] leading-snug truncate">
                  {viewingMyRecipeDetail.name || viewingMyRecipeDetail.title || '自定义美味食谱'}
                </h4>
                <p className="text-[15px] text-[#8ca779] font-black mt-1">
                  难度: <strong className="text-stone-700 font-extrabold">{viewingMyRecipeDetail.difficulty || '普通'}</strong>
                </p>
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-200/50 rounded-2xl p-3.5 text-base text-stone-600 font-sans space-y-1.5 shadow-inner select-none">
              <p>⏰ 预计用时: <strong className="text-stone-850 font-black">{viewingMyRecipeDetail.time || 15} 分钟</strong></p>
              <p>🔥 能量消耗: <strong className="text-stone-850 font-black">{viewingMyRecipeDetail.calories || 300} kcal</strong></p>
            </div>

            <div className="space-y-2">
              <span className="text-[18px] font-black text-stone-500 block">烹饪步骤:</span>
              <div className="max-h-[140px] overflow-y-auto custom-scroll pr-1">
                <ul className="text-[15px] text-stone-600 leading-relaxed font-sans space-y-1 pr-1">
                  {viewingMyRecipeDetail.steps && viewingMyRecipeDetail.steps.length > 0 ? (
                    viewingMyRecipeDetail.steps.map((st: string, idx: number) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-[#8ca779] font-mono font-black select-none">{idx + 1}.</span>
                        <span>{st}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-stone-400 italic">暂无步骤说明</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-stone-100">
              {viewingMyRecipeDetail.id && (viewingMyRecipeDetail.id.startsWith('or-') || viewingMyRecipeDetail.id.startsWith('df-')) && (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditingName(viewingMyRecipeDetail.name || viewingMyRecipeDetail.title || '自定义美味食谱');
                    setEditingEmoji(viewingMyRecipeDetail.coverEmoji || viewingMyRecipeDetail.emoji || '🥘');
                  }}
                  className="bg-brand-yellow hover:bg-[#edd96a] text-stone-850 font-black text-base py-3 rounded-full flex-1 text-center shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                >
                   编辑食谱
                </button>
              )}
              <button
                onClick={onCookNow}
                className="bg-[#8ca779] hover:bg-[#728f60] text-white font-black text-base py-3 rounded-full flex-1 text-center shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
              >
                 立即烹饪
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <span className="block text-base font-black text-amber-800">编辑食谱名称与标志</span>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_3.5fr] gap-3">
              <div className="space-y-1">
                <label className="text-[15px] font-black text-stone-500 block">标志</label>
                <input
                  type="text"
                  value={editingEmoji}
                  onChange={(e) => setEditingEmoji(e.target.value)}
                  className="bg-white border rounded-xl p-2 text-base w-full text-center outline-none focus:border-brand-green font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[15px] font-black text-stone-500 block">食谱名称</label>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="bg-white border rounded-xl p-2 text-base w-full outline-none focus:border-brand-green font-bold text-stone-850"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1 border-t border-stone-100">
              <button
                onClick={() => setIsEditing(false)}
                className="text-[16px] text-stone-500 px-4 py-2 rounded-xl border hover:bg-stone-100 font-bold cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (!editingName.trim()) return;
                  const updated = { ...viewingMyRecipeDetail, name: editingName, coverEmoji: editingEmoji };
                  if (viewingMyRecipeDetail.id.startsWith('or-')) {
                    setMyOriginalRecipes((prev) => prev.map((r) => r.id === viewingMyRecipeDetail.id ? updated : r));
                  } else if (viewingMyRecipeDetail.id.startsWith('df-')) {
                    setMyDraftRecipes((prev) => prev.map((r) => r.id === viewingMyRecipeDetail.id ? updated : r));
                  }
                  setDetail(updated);
                  setIsEditing(false);
                }}
                className="bg-brand-green text-white text-[16px] font-extrabold px-5 py-2 rounded-xl hover:bg-brand-green-dark cursor-pointer shadow-sm animate-scale-up"
              >
                保存修改
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}