import { getLevelByCookingCount } from '../../utils/levelHelper';

interface CookingLog {
  id: string;
  name: string;
  date: string;
  stars: number;
  note: string;
  emoji: string;
  duration: number;
  steps?: string[];
  fromRecipe?: boolean;
}

interface CookingLogsPageProps {
  cookingLogs: CookingLog[];
  onBack: () => void;
  onOpenPublishLog: () => void;
  onClickManualLog: (log: CookingLog) => void;
}

export default function CookingLogsPage({
  cookingLogs,
  onBack,
  onOpenPublishLog,
  onClickManualLog,
}: CookingLogsPageProps) {

  const manualLogs = cookingLogs.filter((log: any) => !log.fromRecipe);

  const totalCooked = cookingLogs.length;
  const { name: currentLevelName, nextLevelName, nextRequired, dishesToNext, percent } =
    getLevelByCookingCount(totalCooked);

  return (
    /* 外层去掉自身滚动，改成 flex 控制内部 */
    <div className="flex flex-col flex-1 w-full h-full space-y-4 overflow-hidden px-2">
      <div className="flex items-center justify-between shrink-0">
        <button
          onClick={onBack}
          className="p-1 px-3 text-base bg-white text-stone-600 rounded-lg hover:bg-brand-yellow font-bold border transition-colors cursor-pointer"
        >
          ← 返回
        </button>
        <span className="text-[28px] font-black text-stone-850">烹饪记录</span>
        <div className="w-12"></div>
      </div>

      {/* ===== 厨艺等级卡 ===== */}
      <div className="bg-white border border-[#a2c28f]/20 rounded-3xl p-4.5 shadow-xs flex flex-col gap-3 select-none shrink-0">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="block text-[15px] text-stone-400 font-sans tracking-wide">厨艺等级</span>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black text-[#5d7350]">{currentLevelName}</span>
              <span className="bg-[#eff7e8] text-brand-green-dark font-sans font-extrabold text-[9px] px-1.5 py-0.5 rounded-full border border-[#a2c28f]/20">
                累计烹饪 {totalCooked} 道菜
              </span>
            </div>
          </div>
          {nextRequired !== 999 && (
            <div className="text-right">
              <span className="block text-[13px] text-stone-400 font-sans">距离下一等级还差</span>
              <span className="text-m font-serif font-black text-rose-500">{dishesToNext} 道菜</span>
            </div>
          )}
        </div>

        <div className="h-4 w-full bg-stone-100 rounded-full overflow-hidden relative border border-stone-200">
          <div
            style={{ width: `${percent}%` }}
            className="h-full bg-gradient-to-r from-[#a2c28f] to-[#8ca779] rounded-full transition-all duration-500"
          />
        </div>
      </div>

      {/* ============ 【改动1】编辑入口卡片放大 ============ */}
      <div
        onClick={onOpenPublishLog}
        className="bg-stone-50 border-2 border-dashed border-stone-300 rounded-3xl p-8 hover:bg-[#f3f7f0] hover:border-[#8ca779] transition-all duration-350 cursor-pointer select-none group flex items-center gap-6 shrink-0"
      >
        <div className="w-30 h-30 bg-white rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform text-6xl border border-stone-200 shrink-0">
          📝
        </div>
        <div className="text-left flex-1">
          <span className="block text-2xl font-black text-stone-700 mb-2">新建烹饪记录</span>
          <span className="block text-[16px] text-stone-500 font-sans">点击进入独立烹饪记录编辑界面，记录每一次成功</span>
        </div>
        <span className="text-[#8ca779] text-4xl font-black shrink-0 mr-2">+</span>
      </div>

      {/* ============ 【改动2】日志列表：flex-1 撑满 + 明显的滚动条 ============ */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scroll pr-2 space-y-2.5">
        {manualLogs.length === 0 ? (
          <div className="text-center py-10 text-stone-400 text-sm font-bold italic">
            暂无烹饪记录，点击上方"新建烹饪记录"开始记录吧！
          </div>
        ) : (
          manualLogs.map((log) => (
            <div
              key={log.id}
              onClick={() => onClickManualLog(log)}
              className="bg-white border border-stone-150 rounded-2xl p-3 flex gap-3 text-left shadow-xs hover:border-[#8ca779]/30 hover:bg-[#eff7e8]/5 transition-all cursor-pointer group active:scale-[0.99]"
            >
              <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-xl border shadow-xs shrink-0 self-start font-sans overflow-hidden">
                {(log as any).images && (log as any).images.length > 0 ? (
                  <img
                    src={(log as any).images[0]}
                    alt={log.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span>{log.emoji || '🥘'}</span>
                )}
              </div>

              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h5 className="text-[13px] font-black text-stone-850 truncate">
                    {log.name}
                  </h5>
                  <span className="text-[10px] font-mono text-stone-400 block shrink-0">{log.date}</span>
                </div>

                <p className="text-[11px] text-stone-500 leading-relaxed font-sans font-medium line-clamp-2">
                  {log.note || (log.steps && log.steps.length > 0 ? `共 ${log.steps.length} 个步骤` : '无备注')}
                </p>
              </div>

              <span className="text-[10px] text-[#8ca779] font-black self-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                查看 →
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}