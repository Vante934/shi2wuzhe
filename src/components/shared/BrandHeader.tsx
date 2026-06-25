import { UtensilsCrossed, Code } from 'lucide-react';

interface BrandHeaderProps {
  isExporterPanelOpen: boolean;
  activeInspectorView: string;
  onOpenExporter?: () => void;
  onResetInspector: () => void;
}

export default function BrandHeader({
  isExporterPanelOpen,
  activeInspectorView,
  onOpenExporter,
  onResetInspector,
}: BrandHeaderProps) {
  return (
    <header className="w-full max-w-[1700px] flex flex-col lg:flex-row items-center justify-between bg-[#2c3523] border border-[#a2c28f]/20 rounded-2xl px-6 py-4 mb-5 shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="bg-[#8ca779] p-2.5 rounded-xl text-white shadow-md">
          <UtensilsCrossed className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-widest font-sans flex items-center gap-2">
            识食物者
          </h1>
          <p className="text-xs text-stone-300">智能美食社区 · 大卡追踪与营养搭配平台</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 mt-3 lg:mt-0">
        <button
          onClick={onOpenExporter}
          className={`hidden flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-sans text-sm font-semibold transition-all ${
            isExporterPanelOpen
              ? 'bg-brand-yellow text-brand-grey font-bold shadow-lg'
              : 'bg-[#3b472f] text-stone-200 border border-[#a2c28f]/10 hover:bg-[#465437]'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>获取 Vue 3 + Vant 4 完美源代码</span>
        </button>

        <button
          onClick={onResetInspector}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-sans transition-all ${
            activeInspectorView === 'free'
              ? 'bg-[#8ca779] text-white font-bold'
              : 'bg-[#1e2417] text-stone-400 hover:text-white'
          }`}
        >
          <span>重置自由交互</span>
        </button>
      </div>
    </header>
  );
}