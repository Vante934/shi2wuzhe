import { X } from 'lucide-react';

interface RecipeShareModalProps {
  isOpen: boolean;
  recipeName: string;
  recipeId: string;
  recipeProtein: number;
  recipeCarbs: number;
  recipeFat: number;
  recipeCalories: number;
  recipeCoverEmoji: string;
  showWXQRCode: boolean;
  setShowWXQRCode: (v: boolean) => void;
  onClose: () => void;
  showToast: (msg: string) => void;
  onSelectCommunityShare: () => void;
}

export default function RecipeShareModal({
  isOpen,  recipeName,  recipeId,  recipeProtein,  recipeCarbs,
  recipeFat,  recipeCalories,  recipeCoverEmoji,  showWXQRCode,
  setShowWXQRCode,  onClose,  showToast,  onSelectCommunityShare,
}: RecipeShareModalProps) {
  if (!isOpen) return null;

  const shareUrl = `https://shishiwuzhe.com/share/recipe/${recipeId || 'recipe'}`;

  return (
    /* ============================================================
        遮罩层
        改动：
        - absolute → fixed   全屏覆盖
        - z-55 → z-[999]     最高层级
        ============================================================ */
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[999] flex items-center justify-center p-4">

      {/* ============================================================
          弹窗主卡片
          改动：
          - max-w-[420px] → max-w-[560px]  放大
          - p-6 → p-8                      内边距加大
          ============================================================ */}
      <div className="bg-white rounded-[2rem] w-full max-w-[560px] p-8 text-center shadow-2xl animate-scale-up border border-stone-100 flex flex-col items-center gap-6 relative">
        
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-stone-50 hover:bg-stone-100 p-2 rounded-full text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 改动：删除顶部链接 emoji 图标
            如果想完全不要这一块，删除下面整个 div */}
        {/* 
        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-xl shadow-inner mt-2">
          🔗
        </div>
        */}

        {/* 标题区 - 字号放大 */}
        <div className="space-y-2 w-full mt-2">
          {/* 标题字号 text-sm → text-lg */}
          <h4 className="font-sans font-black text-stone-850 text-[24px]">分享菜谱</h4>
          {/* 描述字号 text-[10px] → text-[13px] */}
          <p className="text-[13px] text-stone-500 leading-relaxed font-sans">
            分享菜谱「{recipeName}」，传递健康能量
          </p>
        </div>

        {/* 两个分享按钮卡片 - 整体放大 */}
        <div className="grid grid-cols-2 gap-4 w-full pt-2">
          {/* 微信分享卡 */}
          <button
            type="button"
            onClick={() => {
              setShowWXQRCode(true);
              navigator.clipboard.writeText(shareUrl).then(() => {
                showToast('微信分享链接已自动复制至您的剪贴板！');
              }).catch(() => {});
            }}
            className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all cursor-pointer ${
              showWXQRCode
                ? 'bg-emerald-50/70 border-[#8ca779]/50 text-[#345325]'
                : 'bg-stone-50 border-stone-200/60 hover:bg-stone-100'
            }`}
          >
            <span className="text-3xl">🔗</span>
            <span className="text-m font-black">生成微信分享链接</span>
            <span className="text-[13px] text-[#5d7350] font-bold">一键复制</span>
          </button>

          {/* 社区发布卡 */}
          <button
            type="button"
            onClick={onSelectCommunityShare}
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-stone-50 border border-stone-200/60 hover:bg-stone-100 hover:border-amber-300 transition-all cursor-pointer"
          >
            <span className="text-3xl">👩‍🍳</span>
            <span className="text-m font-black">发布至社区广场</span>
            <span className="text-[13px] text-stone-400">生成食谱干货帖</span>
          </button>
        </div>

        {/* 微信二维码/链接展开区 - 字号略放大 */}
        {showWXQRCode && (
          <div className="w-full bg-[#fdfdfd] border border-[#a2c28f]/30 rounded-2xl p-4 flex flex-col items-start gap-2 animate-scale-up text-left">
            <span className="text-[13px] font-black text-stone-500 block">分享链接：</span>
            <div className="flex gap-2 w-full">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="bg-stone-50 border border-stone-250/70 rounded-xl px-3 py-2 text-[15px] font-mono select-all flex-1 outline-none text-stone-700"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl).then(() => {
                    showToast('复制成功！快去微信分享给好友吧～');
                  });
                }}
                className="px-4 bg-[#8ca779] text-white text-m font-black rounded-xl hover:bg-[#728f60] transition-colors cursor-pointer shrink-0"
              >
                复制
              </button>
            </div>
            <p className="text-[13px] text-stone-400 leading-normal">
              提示：该链接支持直接点击跳转。已自动写入剪贴板，畅享绿色健康烹饪！
            </p>
          </div>
        )}
      </div>
    </div>
  );
}