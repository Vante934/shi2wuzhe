import { X } from 'lucide-react';

interface NoIngredientsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;     // 直接去烹饪
  onGoBack: () => void;       // 返回选食材
}

export default function NoIngredientsModal({
  isOpen,
  onClose,
  onProceed,
  onGoBack,
}: NoIngredientsModalProps) {
  if (!isOpen) return null;

  return (
    /* ============================================================
        弹窗遮罩层
        改动：
        - absolute → fixed  改为固定定位，覆盖整个视口
        - z-55 → z-[999]    更高层级，避免被其他元素遮挡
        ============================================================ */
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4">

      {/* ============================================================
          弹窗主卡片
          改动：
          - max-w-[380px] → max-w-[480px]  整体放大
          - p-6 → p-8                       内边距更舒展
          - gap-5 → gap-6                   元素间距加大
          ============================================================ */}
      <div className="bg-white rounded-[2rem] w-full max-w-[480px] p-8 text-center shadow-2xl animate-scale-up border border-stone-100 flex flex-col items-center gap-6 relative">
        
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-stone-50 hover:bg-stone-100 p-2 rounded-full text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/*  改动：去掉灯泡 emoji 图标圆圈
            如果想保留圆圈但去 emoji，可以把 💡 改为空字符串
            如果想完全删掉这一块，直接删除下面整个 div */}
        {/* 
        <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-2xl shadow-inner mt-2">
        </div>
        */}

        {/* 标题和描述 - 字号放大 */}
        <div className="space-y-2 mt-2">
          {/* 标题字号 text-sm → text-lg */}
          <h4 className="font-sans font-black text-stone-850 text-[24px]">您还没有挑选食材</h4>
          {/* 描述字号 text-[11px] → text-[14px] */}
          <p className="text-[14px] text-stone-500 leading-relaxed font-sans px-2">
            空空如也的餐盘依旧可以开启烹饪之旅！请选择：
          </p>
        </div>

        {/* 操作按钮 - 字号 padding 放大 */}
        <div className="flex flex-col gap-3 w-full mt-2">
          {/* 主按钮 */}
          <button
            onClick={onProceed}
            className="w-full bg-[#8ca779] hover:bg-[#728f60] text-white font-extrabold text-sm py-3 rounded-full shadow-md transition-all active:scale-95 cursor-pointer"
          >
            直接去烹饪（不挑食材）
          </button>
          {/* 次按钮 */}
          <button
            onClick={onGoBack}
            className="w-full bg-white hover:bg-stone-50 text-stone-600 border border-stone-250 font-extrabold text-sm py-3 rounded-full transition-all active:scale-95 cursor-pointer"
          >
            返回上一步，选食材
          </button>
        </div>
      </div>
    </div>
  );
}