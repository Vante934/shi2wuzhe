interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[990] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-[340px] p-6 text-center shadow-2xl animate-scale-up border border-stone-150 flex flex-col items-center gap-4.5 relative text-left select-none">
        <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-xl font-bold font-sans">
          ❓
        </div>

        <div className="space-y-1.5 text-center">
          <h4 className="font-sans font-black text-stone-800 text-sm leading-snug">
            {title || '操作提示'}
          </h4>
          <p className="text-[11px] text-stone-500 leading-relaxed font-sans px-2">
            {message}
          </p>
        </div>

        <div className="flex gap-2.5 w-full mt-2">
          <button
            onClick={onCancel}
            className="flex-1 bg-stone-150 hover:bg-stone-200 text-stone-600 font-extrabold text-xs py-2.5 rounded-full transition-all active:scale-95 cursor-pointer text-center"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-brand-green hover:bg-[#728f60] text-white font-extrabold text-xs py-2.5 rounded-full shadow-md transition-all active:scale-95 cursor-pointer text-center"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}