import { useState } from 'react';
import { Code, Copy, Check, Sparkles } from 'lucide-react';
import {
  VUE_CODE_STORE,
  VUE_CODE_EATWELL,
  VUE_CODE_COMMUNITY,
  VUE_CODE_SCAN,
  VUE_CODE_LOGIN,
  VUE_CODE_USER_STORE,
  VUE_CODE_STORAGE,
  VUE_CODE_REQUEST,
  VUE_CODE_ROUTER,
} from '../../vue_code.ts';

type ExportFileKey =
  | 'store_export'
  | 'eatwell_export'
  | 'community_export'
  | 'login_export'
  | 'user_store_export'
  | 'request_export'
  | 'storage_export'
  | 'router_export'
  | 'scan_export';

interface VueExporterPanelProps {
  onClose: () => void;
}

export default function VueExporterPanel({ onClose }: VueExporterPanelProps) {
  const [activeExportFile, setActiveExportFile] = useState<ExportFileKey>('store_export');
  const [copiedNotification, setCopiedNotification] = useState(false);

  const handleCopySourceCode = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  const getActiveCode = (): string => {
    switch (activeExportFile) {
      case 'store_export': return VUE_CODE_STORE;
      case 'eatwell_export': return VUE_CODE_EATWELL;
      case 'community_export': return VUE_CODE_COMMUNITY;
      case 'login_export': return VUE_CODE_LOGIN;
      case 'user_store_export': return VUE_CODE_USER_STORE;
      case 'request_export': return VUE_CODE_REQUEST;
      case 'storage_export': return VUE_CODE_STORAGE;
      case 'router_export': return VUE_CODE_ROUTER;
      default: return VUE_CODE_SCAN;
    }
  };

  const tabs: { key: ExportFileKey; label: string }[] = [
    { key: 'store_export', label: 'PiniaStore.ts (共享状态)' },
    { key: 'eatwell_export', label: 'EatWell.vue (主页选择)' },
    { key: 'community_export', label: 'Community.vue (交流社区)' },
    { key: 'login_export', label: 'Login.vue (登录与注册)' },
    { key: 'user_store_export', label: 'user.js (Pinia账户Store)' },
    { key: 'request_export', label: 'request.js (若依/Axios封装)' },
    { key: 'storage_export', label: 'storage.js (缓存储存封装)' },
    { key: 'router_export', label: 'router.js (路由拦截校验)' },
  ];

  return (
    <div className="bg-[#1e2417] border border-[#a2c28f]/20 rounded-3xl p-6 shadow-2xl flex flex-col flex-1 text-white animate-fade-in min-h-[750px] justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-brand-yellow" />
            <h3 className="font-bold text-base font-sans leading-none">
              Vue 3 + Vant 4 完美源代码极速导出器
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 px-3 text-xs bg-brand-green/20 text-brand-green rounded-lg hover:bg-brand-green/30"
          >
            ← 返回模拟区
          </button>
        </div>

        <p className="text-xs text-stone-300 mb-4 leading-relaxed font-sans">
          这些是为您的项目特制的 Vue 3 单文件组件。使用 Vant 4 组件标签，采用现代{' '}
          <code className="bg-[#2c3523] px-1 text-brand-yellow font-mono text-xs">
            &lt;script setup lang="ts"&gt;
          </code>{' '}
          糖语法，响应式状态由 Pinia 自动分发。直接一键复制即可无缝接入您的研发工程中：
        </p>

        {/* 文件选择 tabs */}
        <div className="flex flex-wrap gap-1.5 mb-4 bg-black/30 p-1.5 rounded-xl border border-white/5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveExportFile(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeExportFile === tab.key
                  ? 'bg-brand-green text-white font-bold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 代码区 */}
        <div className="relative bg-black/60 rounded-xl overflow-hidden border border-white/10">
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
            <button
              onClick={() => handleCopySourceCode(getActiveCode())}
              className="bg-[#2c3523] hover:bg-[#3d4931] border border-[#a2c28f]/20 p-2 rounded-lg text-xs text-brand-yellow font-bold flex items-center gap-1 transition-all pointer-events-auto"
            >
              {copiedNotification ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  <span>已拷贝到剪贴板！</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>一键复制代码</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 overflow-x-auto text-xs font-mono text-[#b3cc9a] leading-relaxed max-h-[480px] custom-scroll">
            <code>{getActiveCode()}</code>
          </pre>
        </div>
      </div>

      <div className="text-stone-400 text-xs text-center border-t border-white/5 pt-4 mt-4 font-sans flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-brand-yellow animate-spin-slow" />
        <span>以上代码均存储在当前工程 📁 `/vue/` 静态目录下目录供实地查阅。</span>
      </div>
    </div>
  );
}