import { ClipboardList } from 'lucide-react';

interface InspectorPanelProps {
  activeInspectorView: string;
  onSelectPreset: (presetId: string) => void;
}

export default function InspectorPanel({
  activeInspectorView,
  onSelectPreset,
}: InspectorPanelProps) {
  return (
    <div className="hidden bg-[#232a1b] border border-[#a2c28f]/10 rounded-3xl p-5 shadow-inner flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="w-5 h-5 text-brand-green" />
          <h3 className="text-white font-bold text-sm tracking-wider font-sans">原型视点演示舱</h3>
        </div>

        <p className="text-xs text-stone-400 mb-4 bg-[#1b2115] p-3 rounded-lg border border-[#a2c28f]/5 leading-relaxed">
          点击下方快捷跳转锚点，右侧实机框架将流畅跳转至对应等级页面视图：
        </p>

        <div className="flex flex-col gap-4 max-h-[580px] overflow-y-auto pr-1 custom-scroll">
          {/* MODULE 1 */}
          <div className="space-y-1">
            <span className="text-xs text-brand-yellow font-bold tracking-wider font-mono px-1 flex items-center gap-1">
              模块一：食材选择与菜谱生成
            </span>
            <div className="grid grid-cols-1 gap-1 pl-1">
              {[
                { id: 'module1-ingredients', label: '· 食材选择页（一级页面）' },
                { id: 'module1-pots', label: '· 厨具选择页（二级页面）' },
                { id: 'module1-recipes', label: '· 菜谱结果页（二级页面）' },
                { id: 'module1-detail', label: '· 菜谱详情页（三级页面）' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelectPreset(item.id)}
                  className={`text-left text-xs py-1.5 px-3 rounded-lg transition-all ${
                    activeInspectorView === item.id
                      ? 'bg-[#8ca779] text-white font-semibold'
                      : 'bg-[#1d2316] text-[#b6c7ab] hover:bg-[#28311f]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* MODULE 2 & 3 */}
          <div className="space-y-1">
            <span className="text-xs text-brand-green font-bold tracking-wider font-mono px-1 flex items-center gap-1">
              模块二&三：菜谱广场与随机生成
            </span>
            <div className="grid grid-cols-1 gap-1 pl-1">
              {[
                { id: 'module2-plaza', label: '· 菜谱广场页（一级页面）' },
                { id: 'module2-search', label: '· 菜谱搜索结果页（二级页面）' },
                { id: 'module3-spin-page', label: '· 随机生成页（一级页面）' },
                { id: 'module3-spin-result', label: '· 随机生成结果页（二级页面）' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelectPreset(item.id)}
                  className={`text-left text-xs py-1.5 px-3 rounded-lg transition-all ${
                    activeInspectorView === item.id
                      ? 'bg-[#8ca779] text-white font-semibold'
                      : 'bg-[#1d2316] text-[#b6c7ab] hover:bg-[#28311f]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* MODULE 6 & 7 & 8 */}
          <div className="space-y-1">
            <span className="text-xs text-[#cadbb7] font-bold tracking-wider font-mono px-1 flex items-center gap-1">
              模块六&七&八：分享社区与个人中心
            </span>
            <div className="grid grid-cols-1 gap-1 pl-1">
              {[
                { id: 'module6-community', label: '· 社区广场页（一级页面）' },
                { id: 'module6-post-detail', label: '· 帖子详情页（二级页面）' },
                { id: 'module6-publish', label: '· 发帖页（二级页面）' },
                { id: 'module7-profile-main', label: '· 个人中心主页（一级页面）' },
                { id: 'module7-preferences', label: '· 偏好设置页（二级页面）' },
                { id: 'module7-my-recipes', label: '· 我的菜谱页（二级页面）' },
                { id: 'module7-cook-history', label: '· 烹饪记录页（二级页面）' },
                { id: 'module7-account-settings', label: '· 账号设置页（三级页面）' },
                { id: 'module8-global-search', label: '· 全局搜索页（二级页面）' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelectPreset(item.id)}
                  className={`text-left text-xs py-1.5 px-3 rounded-lg transition-all ${
                    activeInspectorView === item.id
                      ? 'bg-[#8ca779] text-white font-semibold'
                      : 'bg-[#1d2316] text-[#b6c7ab] hover:bg-[#28311f]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-[#a2c28f]/10 text-[11px] text-stone-500 font-mono text-center">
        识食物者 Gourmet Smart App v1.2.0
      </div>
    </div>
  );
}