import { X } from 'lucide-react';

interface CookingLogEditModalProps {
  isOpen: boolean;
  log: any | null;
  tempLogName: string;
  tempLogStars: number;
  tempLogNote: string;
  setTempLogName: (v: string) => void;
  setTempLogStars: (v: number) => void;
  setTempLogNote: (v: string) => void;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
}

export default function CookingLogEditModal({
  isOpen,
  log,
  tempLogName,
  tempLogStars,
  tempLogNote,
  setTempLogName,
  setTempLogStars,
  setTempLogNote,
  onClose,
  onSave,
  onDelete,
}: CookingLogEditModalProps) {
  if (!isOpen || !log) return null;

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-55 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-[370px] p-6 text-left shadow-2xl animate-scale-up border border-stone-100 relative space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-stone-100 hover:bg-stone-200 p-2 rounded-full text-stone-400 hover:text-stone-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 border-b pb-3 border-stone-100">
          <span className="text-3xl p-1.5 bg-amber-50 rounded-2xl shrink-0">🥘</span>
          <div>
            <h4 className="font-sans font-black text-stone-850 text-xs">编辑手工烹调历史</h4>
            <p className="text-[9px] text-stone-400 font-mono font-semibold">
              记录标识码: #{log.id} | 日期: {log.date}
            </p>
          </div>
        </div>

        <div className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-stone-500 block">🥘 自定义菜品名称</label>
            <input
              type="text"
              value={tempLogName}
              onChange={(e) => setTempLogName(e.target.value)}
              className="w-full bg-[#f6f8f5] border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:bg-white focus:border-[#8ca779]"
            />
          </div>

          <div className="space-y-1 margin-t-2">
            <label className="text-[10px] font-black text-stone-500 block">⭐ 烹制打分评星</label>
            <select
              value={tempLogStars}
              onChange={(e) => setTempLogStars(Number(e.target.value))}
              className="w-full bg-[#f6f8f5] border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold font-sans outline-none focus:bg-white focus:border-[#8ca779]"
            >
              <option value="5">⭐⭐⭐⭐⭐ 五星级大厨 (精湛)</option>
              <option value="4">⭐⭐⭐⭐ 四星主厨 (满意)</option>
              <option value="3">⭐⭐⭐ 三星新手 (勉强)</option>
            </select>
          </div>

          <div className="space-y-1 margin-t-2">
            <label className="text-[10px] font-black text-stone-500 block">📝 制作心得或私密秘方</label>
            <textarea
              rows={3}
              value={tempLogNote}
              onChange={(e) => setTempLogNote(e.target.value)}
              className="w-full bg-[#f6f8f5] border border-stone-200 rounded-xl p-3 text-xs font-semibold outline-none focus:bg-white focus:border-[#8ca779] resize-none"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onSave}
            className="flex-1 bg-brand-green hover:bg-brand-green-dark text-white font-extrabold text-xs py-2.5 rounded-full shadow-md transition-all active:scale-95 text-center"
          >
            保存修改
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-500 font-extrabold text-xs px-4 py-2.5 rounded-full transition-all active:scale-95"
          >
            删除记录
          </button>
        </div>
      </div>
    </div>
  );
}