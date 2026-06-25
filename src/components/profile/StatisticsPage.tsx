import { useEffect, useState } from 'react';
import { userApi } from '../../api';

interface StatisticsPageProps {
  onBack: () => void;
}

interface WeekDay {
  day: string;
  kcal: number;
  isToday: boolean;
  isOver: boolean;
}

interface WeeklyStats {
  weekData: WeekDay[];
  avgIntake: number;
  baselineKcal: number;
  diffPercent: number;
  dailyDiff: number;
  proteinRate: number;
  glIndex: number;
  carbsPct: number;
  proteinPct: number;
  fatPct: number;
  hasData: boolean;
}

export default function StatisticsPage({ onBack }: StatisticsPageProps) {
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await userApi.getWeeklyNutrition();
        setStats(res.data as any);
      } catch (err) {
        console.error('[StatisticsPage] 拉营养统计失败', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 计算柱状图的"最大高度"基准（用 baseline 或最大值的较大者）
  const maxKcal = stats
    ? Math.max(stats.baselineKcal, ...stats.weekData.map(d => d.kcal)) * 1.1
    : 2400;

  return (
    <div className="flex flex-col flex-1 w-full h-full space-y-2.5 px-2 overflow-hidden">

      {/* 顶部返回 + 标题 */}
      <div className="flex items-center justify-between shrink-0">
        <button
          onClick={onBack}
          className="p-1 px-3 text-sm bg-white text-stone-600 rounded-lg hover:bg-brand-yellow font-bold border transition-colors cursor-pointer"
        >
          ← 返回
        </button>
        <span className="text-[27px] font-black text-stone-850">营养分析周报</span>
        <div className="w-12"></div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-stone-400 font-bold">加载中...</div>
      ) : !stats || !stats.hasData ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-stone-400 font-bold gap-2">
          <span className="text-5xl">📊</span>
          <p className="text-base">本周还没有烹饪记录</p>
          <p className="text-sm text-stone-300">去做几道菜，让数据丰富起来吧～</p>
        </div>
      ) : (
        <>
          {/* ============ 4 项卡片：真实数据 ============ */}
          <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-xs text-left grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            <div className="space-y-0.5">
              <span className="text-[12px] text-stone-400 block font-bold mb-1">周均摄入</span>
              <span className="text-[20px] font-mono font-black text-stone-850 block leading-tight">
                {stats.avgIntake.toLocaleString()} kcal
              </span>
              <span className={`text-[12px] font-black font-semibold ${stats.diffPercent < 0 ? 'text-[#8ca779]' : 'text-rose-500'}`}>
                {stats.diffPercent < 0
                  ? `低于每日建议 ${Math.abs(stats.diffPercent)}% 💚`
                  : `高于每日建议 ${stats.diffPercent}% 🔥`}
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[12px] text-stone-400 block font-bold mb-1">每日卡路里</span>
              <span className="text-[20px] font-mono font-black text-stone-850 block leading-tight">
                {stats.dailyDiff > 0 ? '+' : ''}{stats.dailyDiff} kcal
              </span>
              <span className={`text-[12px] font-black font-semibold ${stats.dailyDiff < 0 ? 'text-rose-500' : 'text-amber-500'}`}>
                {stats.dailyDiff < 0 ? '减脂中 🔥' : '增肌中 💪'}
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[12px] text-stone-400 block font-bold mb-1">蛋白质达标率</span>
              <span className="text-[20px] font-mono font-black text-stone-850 block leading-tight">
                {stats.proteinRate.toFixed(1)} %
              </span>
              <span className="text-[12px] text-brand-green font-semibold">
                {stats.proteinRate >= 80 ? '优质蛋白补充 ⭐' : '蛋白质偏低 ⚠️'}
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[12px] text-stone-400 block font-bold mb-1">综合膳食评级</span>
              <span className="text-[20px] font-mono font-black text-stone-850 block leading-tight">
                GL {stats.glIndex.toFixed(1)}
              </span>
              <span className="text-[12px] text-stone-400 font-semibold">
                状态：{stats.glIndex < 5 ? '低升糖 健康' : stats.glIndex < 7 ? '中升糖 平衡' : '高升糖 偏高'}
              </span>
            </div>
          </div>

          {/* ============ 中间柱状图：真实数据 ============ */}
          <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-xs text-left space-y-2 shrink-0">
            <div className="flex justify-between items-center">
              <span className="text-[15px] font-black text-stone-850">每周摄入趋势图</span>
              <div className="flex items-center gap-3 text-[13px] font-bold text-stone-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[#8ca779]"></span> <span>已摄入</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-0.5 border-t-2 border-dashed border-red-500"></span>
                  <span>基准热卡 ({stats.baselineKcal} kcal)</span>
                </span>
              </div>
            </div>

            <div className="w-full bg-stone-50/50 rounded-xl p-3 border border-stone-100/50 flex flex-col h-[420px]">
              <div className="relative flex-1 min-h-0 w-full">
                <svg className="w-full h-full" viewBox="0 0 500 120" preserveAspectRatio="none">
                  {/* 网格线 */}
                  <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f3f0" strokeDasharray="3,3" />
                  <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f3f0" strokeDasharray="3,3" />
                  <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f3f0" strokeDasharray="3,3" />

                  {/* 基准线（红色虚线） */}
                  {(() => {
                    const baselineY = 120 - (stats.baselineKcal / maxKcal) * 120;
                    return <line x1="0" y1={baselineY} x2="500" y2={baselineY} stroke="#f43f5e" strokeWidth="1" strokeDasharray="4,4" />;
                  })()}

                  {/* 7 根柱子 */}
                  {stats.weekData.map((d, i) => {
                    const barWidth = 22;
                    const gap = 65;
                    const x = 35 + i * gap;
                    const heightPx = (d.kcal / maxKcal) * 120;
                    const y = 120 - heightPx;
                    // 颜色：今天 = 橙色 / 超基准 = 浅绿 / 正常 = 深绿
                    const fill = d.isToday ? '#ffb703' : d.isOver ? '#cbd8c5' : '#8ca779';
                    return (
                      <rect
                        key={d.day}
                        x={x}
                        y={y}
                        width={barWidth}
                        height={heightPx}
                        rx="3"
                        fill={fill}
                      />
                    );
                  })}
                </svg>

                {/* 高峰提示标签（如果有超基准的，给最高那天打个标） */}
                {(() => {
                  const overDays = stats.weekData.filter(d => d.isOver);
                  if (overDays.length === 0) return null;
                  const maxDay = overDays.reduce((a, b) => a.kcal > b.kcal ? a : b);
                  const idx = stats.weekData.findIndex(d => d.day === maxDay.day);
                  const leftPct = (35 + idx * 65) / 500 * 100;
                  const topPct = (1 - maxDay.kcal / maxKcal) * 100;
                  return (
                    <div
                      className="absolute bg-amber-500 text-white font-mono font-black text-[9px] py-0.5 px-1.5 rounded shadow-sm"
                      style={{ top: `${Math.max(2, topPct - 10)}%`, left: `${leftPct}%`, transform: 'translateX(-50%)' }}
                    >
                      {Math.round(maxDay.kcal)}!
                    </div>
                  );
                })()}
              </div>

              {/* 周一~周日 */}
              <div className="flex justify-around items-center text-[13px] font-black text-stone-500 font-sans pt-1.5 mt-1.5 border-t border-stone-100 shrink-0">
                {stats.weekData.map(d => (
                  <span key={d.day} className={d.isToday ? 'text-amber-500' : ''}>{d.day}</span>
                ))}
              </div>
            </div>
          </div>

          {/* ============ 底部三大膳食占比：真实数据 ============ */}
          <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-xs text-left space-y-2 shrink-0">
            <span className="text-[13px] font-black text-stone-850 block">三大膳食摄入占比</span>

            <div className="space-y-2">

              <div className="space-y-1">
                <div className="flex justify-between items-center text-[12px] font-black text-stone-700">
                  <span>碳水复合物</span>
                  <span className="font-mono text-stone-500">占 {stats.carbsPct}% (
                    {stats.carbsPct >= 45 && stats.carbsPct <= 60 ? '健康' : stats.carbsPct > 60 ? '偏多' : '偏少'}
                  )</span>
                </div>
                <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${stats.carbsPct}%` }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-[12px] font-black text-stone-700">
                  <span>高蛋白</span>
                  <span className="font-mono text-[#8ca779]">占 {stats.proteinPct}% (
                    {stats.proteinPct >= 20 && stats.proteinPct <= 30 ? '优' : stats.proteinPct < 20 ? '偏低' : '偏高'}
                  )</span>
                </div>
                <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#8ca779] h-full rounded-full transition-all duration-500" style={{ width: `${stats.proteinPct}%` }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-[12px] font-black text-stone-700">
                  <span>不饱和油脂 </span>
                  <span className="font-mono text-stone-500">占 {stats.fatPct}% (
                    {stats.fatPct >= 20 && stats.fatPct <= 30 ? '均衡' : stats.fatPct < 20 ? '偏少' : '偏多'}
                  )</span>
                </div>
                <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-rose-400 h-full rounded-full transition-all duration-500" style={{ width: `${stats.fatPct}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}