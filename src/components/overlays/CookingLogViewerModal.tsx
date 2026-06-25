import { X } from 'lucide-react';

interface CookingLog {
  id: string;
  name: string;
  date: string;
  stars: number;
  note: string;
  emoji: string;
  duration: number;
  steps?: string[];
  images?: string[];
  tags?: string[];
}

interface CookingLogViewerModalProps {
  log: CookingLog | null;
  onClose: () => void;
  onEdit: () => void;       // 跳转到编辑界面
  onDelete: () => void;     // 删除
}

const isUrl = (s: string) =>
  !!s && (s.startsWith('http') || s.startsWith('blob:') || s.startsWith('data:') || s.startsWith('/'));

export default function CookingLogViewerModal({
  log,
  onClose,
  onEdit,
  onDelete,
}: CookingLogViewerModalProps) {
  if (!log) return null;

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-[1100px] h-[80vh] overflow-hidden grid grid-cols-1 md:grid-cols-[1.25fr_1fr] relative shadow-2xl animate-scale-up text-left border border-stone-100">

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-white hover:bg-stone-50 border border-stone-200 p-2 rounded-full shadow-sm cursor-pointer transition-colors"
        >
          <X className="w-5 h-5 text-stone-700" />
        </button>

        {/* ============ 左侧：配图区 ============ */}
        <div className="bg-[#eff7e8] flex flex-col items-center justify-center p-7 relative overflow-hidden select-none">
          {log.images && log.images.length > 0 ? (
            <div className="w-full h-full grid grid-cols-2 gap-3 overflow-y-auto custom-scroll">
              {log.images.map((img, idx) => (
                <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-stone-200 bg-white">
                  {isUrl(img) ? (
                    <img src={img} alt={`记录配图 ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">{img}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              {isUrl(log.emoji) ? (
                <img src={log.emoji} alt={log.name} className="w-56 h-56 rounded-3xl object-cover shadow-md" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-[180px] leading-none drop-shadow-md select-none">{log.emoji || '🥘'}</span>
              )}
            </div>
          )}
        </div>

        {/* ============ 右侧：内容区 ============ */}
        <div className="p-7 flex flex-col border-l border-stone-100 bg-[#fbfcfb]/40 min-h-0 overflow-hidden">

          {/* 标题 + 日期 */}
          <div className="space-y-2 pb-4 border-b border-stone-100 shrink-0">
            <h2 className="text-[24px] font-black text-stone-850 break-words pr-10">{log.name}</h2>
            <div className="flex items-center gap-3 text-[16px] text-stone-400 font-mono">
            </div>

            {/* 标签 */}
            {log.tags && log.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {log.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 text-[11px] font-black rounded-lg bg-[#eff7e8] text-[#5d7350] border border-[#a2c28f]/20"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 步骤列表 */}
          <div className="flex-1 min-h-0 overflow-y-auto custom-scroll pr-2 pt-4 space-y-3">
            <span className="text-[18px] font-black text-stone-600 block mb-2">烹饪步骤</span>

            {log.steps && log.steps.length > 0 ? (
              log.steps.map((step, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#8ca779] text-white text-[14px] font-black flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 bg-stone-50 border border-stone-150 rounded-xl p-3 text-[14px] text-stone-750 font-medium leading-relaxed break-words whitespace-pre-wrap">
                    {step}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-stone-400 italic text-sm py-6 text-center">
                {log.note || '暂无步骤说明'}
              </div>
            )}
          </div>

          {/* 底部按钮 */}
          <div className="border-t border-stone-100 pt-4 mt-3 flex gap-3 justify-end shrink-0 select-none">
            <button
              onClick={onDelete}
              className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-[13px] font-black px-5 py-2.5 rounded-xl cursor-pointer active:scale-95 transition-all"
            >
              删除记录
            </button>
            <button
              onClick={onEdit}
              className="bg-brand-green hover:bg-[#728f60] active:scale-95 text-white text-[13px] font-black px-8 py-2.5 rounded-xl cursor-pointer transition-all shadow-md"
            >
              编辑记录
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}