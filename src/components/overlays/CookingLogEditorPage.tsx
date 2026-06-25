import { useEffect, useState } from 'react';
import { uploadApi } from '../../api';

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

interface CookingLogEditorPageProps {
  editingLog: CookingLog | null;

  cookingLogs: CookingLog[];
  setCookingLogs: (updater: (prev: CookingLog[]) => CookingLog[]) => void;

  // ⬇️ 新增（可选，未传就走旧 setCookingLogs）
  addCookingLog?: (log: CookingLog) => Promise<any> | void;
  updateCookingLog?: (log: CookingLog) => Promise<any> | void;

  onClose: () => void;
  showToast: (msg: string) => void;
}

const TITLE_MAX = 18;
const STEP_MAX = 200;
const DEFAULT_STEPS_COUNT = 4;

export default function CookingLogEditorPage({
  editingLog,
  cookingLogs,
  setCookingLogs,
  addCookingLog,
  updateCookingLog,
  onClose,
  showToast,
}: CookingLogEditorPageProps) {

  /* ============ state ============ */
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [steps, setSteps] = useState<string[]>(Array(DEFAULT_STEPS_COUNT).fill(''));

  /* ============ 初始化：如果是编辑模式，预填数据 ============ */
  useEffect(() => {
    if (editingLog) {
      setTitle(editingLog.name || '');
      setEmoji(editingLog.emoji || '');
      setImages(editingLog.images || []);
      setTags(editingLog.tags || []);
      // 步骤：至少 4 个
      const exist = editingLog.steps || [];
      if (exist.length >= DEFAULT_STEPS_COUNT) {
        setSteps(exist);
      } else {
        setSteps([...exist, ...Array(DEFAULT_STEPS_COUNT - exist.length).fill('')]);
      }
    } else {
      // 新建：全部清空
      setTitle('');
      setEmoji('');
      setImages([]);
      setTags([]);
      setSteps(Array(DEFAULT_STEPS_COUNT).fill(''));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingLog]);

  /* ============ 工具函数 ============ */
  const triggerFilePicker = () => {
    const input = document.getElementById('log-editor-file-input') as HTMLInputElement | null;
    if (input) input.click();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v.length > TITLE_MAX) {
      showToast(`标题最多输入 ${TITLE_MAX} 字`);
      setTitle(v.slice(0, TITLE_MAX));
      return;
    }
    setTitle(v);
  };

  const handleStepChange = (idx: number, val: string) => {
    if (val.length > STEP_MAX) {
      showToast(`单个步骤最多 ${STEP_MAX} 字`);
      val = val.slice(0, STEP_MAX);
    }
    setSteps((prev) => prev.map((s, i) => (i === idx ? val : s)));
  };

  const addStep = () => {
    setSteps((prev) => [...prev, '']);
  };

  const removeStep = (idx: number) => {
    if (steps.length <= 1) {
      showToast('至少保留一个步骤');
      return;
    }
    setSteps((prev) => prev.filter((_, i) => i !== idx));
  };

  /* ============ 保存 ============ */
  const handleSave = () => {
    if (!title.trim()) {
      showToast('请填写菜品名称');
      return;
    }
    const filledSteps = steps.map(s => s.trim()).filter(s => s.length > 0);
    if (filledSteps.length === 0) {
      showToast('请至少填写一个步骤');
      return;
    }

    const today = new Date().toISOString().slice(0, 10);

    if (editingLog) {
      const updated: any = {
        ...editingLog,
        name: title.trim(),
        emoji: emoji || editingLog.emoji || '🥘',
        images,
        tags,
        steps: filledSteps,
        note: filledSteps.join(' / '),
      };
      if (updateCookingLog) {
        updateCookingLog(updated);
      } else {
        setCookingLogs((prev) =>
          prev.map((l) => (l.id === editingLog.id ? updated : l))
        );
      }
      showToast('烹饪记录已更新');
    } else {
      const newLog: any = {
        id: `manual-${Date.now()}`,
        name: title.trim(),
        date: today,
        stars: 0,
        note: filledSteps.join(' / '),
        emoji: emoji || '🥘',
        duration: 15,
        images,
        tags,
        steps: filledSteps,
        fromRecipe: false,
      };
      if (addCookingLog) {
        addCookingLog(newLog);
      } else {
        setCookingLogs((prev) => [newLog, ...prev]);
      }
      showToast('烹饪记录已保存');
    }
    onClose();
  };
  /* ============ emoji 快捷选项 ============ */
  const QUICK_EMOJIS = ['🥘', '🥗', '🥩', '🍜', '🍤', '🧁', '🍗', '🍉', '🥟'];
  const TAGS = ['健康轻食', '营养高蛋白', '快手懒人', '传统硬菜', '低脂能量', '时令美馔'];

  const hasImages = images.length > 0;
  const hasEmoji = !!emoji && !hasImages;
  const IMAGE_MAX = 9;

  return (
    <div className="flex flex-col flex-1 w-full h-full justify-between animate-fade-in bg-white border border-[#a2c28f]/20 rounded-[2rem] p-8 shadow-sm overflow-hidden text-left relative">

      {/* Header bar */}
      <div className="flex items-center justify-between border-b pb-3 mb-4 shrink-0 select-none">
        <button
          onClick={onClose}
          className="p-1 px-3 text-base bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl hover:text-stone-900 font-extrabold border transition-colors cursor-pointer flex items-center gap-1"
        >
          ← 取消编辑
        </button>
        <div className="text-center">
          <span className="block text-[28px] font-black text-stone-850 mb-2">
            {editingLog ? '编辑烹饪记录' : '新建烹饪记录'}
          </span>
          <span className="block text-[13px] text-[#8ca779] font-black tracking-wide font-mono">
            私密烹饪步骤记录（仅自己可见）
          </span>
        </div>
        <div className="w-16"></div>
      </div>

      {/* 主体：左右两栏，跟发布工坊一样的比例 */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-8 flex-1 items-stretch min-h-0 overflow-hidden">

        {/* ============ Left: 配图区 ============ */}
        <div className="bg-[#fbfcfa] border border-[#a1c18e]/15 rounded-2xl p-4.5 flex flex-col gap-3 min-h-0 overflow-hidden">
          <span className="text-[13px] font-black text-stone-500 block shrink-0">记录配图</span>

          <div className="flex-1 min-h-0 bg-[#eff7e8] border-2 border-dashed border-[#a9c894] rounded-xl flex flex-col p-4 overflow-hidden">

            {hasImages ? (
              <div className="flex-1 min-h-0 overflow-y-auto custom-scroll">
                <div className="grid grid-cols-3 gap-3 w-full">
                  {images.slice(0, IMAGE_MAX).map((imgUrl, imgIdx) => (
                    <div key={imgIdx} className="relative aspect-square w-full rounded-lg overflow-hidden border border-stone-200 group bg-white">
                      <img src={imgUrl} alt={`Preview ${imgIdx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImages((prev) => prev.filter((_, idx2) => idx2 !== imgIdx));
                        }}
                        className="absolute -top-0.5 -right-0.5 bg-red-500 hover:bg-red-650 text-white rounded-full w-5 h-5 p-0 text-[10px] flex items-center justify-center font-bold font-mono shadow-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {images.length < IMAGE_MAX && (
                    <button
                      type="button"
                      onClick={triggerFilePicker}
                      className="aspect-square border border-dashed border-[#a9c894] rounded-lg flex flex-col items-center justify-center text-stone-400 bg-white hover:bg-stone-50 cursor-pointer"
                    >
                      <span className="text-sm font-black">+ 增加</span>
                    </button>
                  )}
                </div>
              </div>
            ) : hasEmoji ? (
              <div
                onClick={triggerFilePicker}
                className="flex-1 min-h-0 flex flex-col items-center justify-center cursor-pointer hover:bg-white/40 rounded-lg transition-colors group"
                title="点击此处导入图片"
              >
                <span className="text-[140px] leading-none select-none drop-shadow-sm group-hover:scale-105 transition-transform">
                  {emoji}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEmoji('');
                  }}
                  className="mt-4 text-[16px] text-stone-500 hover:text-red-500 font-bold underline underline-offset-2 px-3 py-1 rounded hover:bg-white/60"
                >
                  清除表情
                </button>
              </div>
            ) : (
              <div
                onClick={triggerFilePicker}
                className="flex-1 min-h-0 flex flex-col items-center justify-center cursor-pointer hover:bg-white/40 rounded-lg transition-colors text-center"
                title="点击此处导入图片"
              >
                <span className="text-[22px] text-[#5d7350] font-black block mb-2">
                  选择表情或导入图片
                </span>
                <span className="text-[13px] text-[#86a774] font-bold block">
                  （最多 {IMAGE_MAX} 张图片，或从下方选一个表情）
                </span>
                <span className="text-[15px] text-stone-400 font-medium mt-3 underline decoration-dashed underline-offset-2">
                  点击此处导入图片
                </span>
              </div>
            )}
          </div>

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={async (e) => {
              const files = Array.from(e.target.files || []) as File[];
              if (images.length + files.length > IMAGE_MAX) {
                showToast(`最多上传 ${IMAGE_MAX} 张照片`);
                e.target.value = '';
                return;
              }

              showToast(`正在上传 ${files.length} 张图片...`);
              try {
                const uploadedUrls: string[] = [];
                for (const f of files) {
                  const res: any = await uploadApi.upload(f);
                  const path = res?.fileName || res?.url;
                  if (path) uploadedUrls.push(path);
                }
                if (uploadedUrls.length === 0) {
                  showToast('上传失败');
                  e.target.value = '';
                  return;
                }
                setImages((prev) => [...prev, ...uploadedUrls]);
                setEmoji('');
                showToast(`成功添加 ${uploadedUrls.length} 张图片`);
              } catch (err) {
                console.error('[CookingLogEditorPage] 上传失败', err);
                showToast('上传失败，请重试');
              }
              e.target.value = '';
            }}
            className="hidden"
            id="log-editor-file-input"
          />

          {/* 快捷表情 */}
          <div className="flex items-center gap-2 shrink-0 border-t pt-3 border-stone-200/40">
            <div className="flex items-center gap-1.5 flex-1 min-w-0 flex-wrap">
              {QUICK_EMOJIS.map((emo) => (
                <button
                  type="button"
                  key={emo}
                  onClick={() => {
                    setEmoji(emo);
                    setImages([]);
                  }}
                  className={`w-9 h-9 rounded-lg border text-lg flex items-center justify-center cursor-pointer hover:bg-stone-100 shrink-0 transition-all ${
                    emoji === emo && !hasImages
                      ? 'border-[#8ca779] bg-[#eff7e8] scale-110 shadow-sm'
                      : 'border-stone-200 bg-white'
                  }`}
                >
                  {emo}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ============ Right: 表单（标题 + 标签 + 步骤） ============ */}
        <div className="flex flex-col gap-3 min-h-0 overflow-hidden">

          {/* 标题 */}
          <div className="space-y-1 shrink-0">
            <div className="flex items-center justify-between">
              <label className="text-[18px] font-black text-stone-550 block">标题（最多 {TITLE_MAX} 字）</label>
              <span className={`text-[16px] font-mono ${title.length >= TITLE_MAX ? 'text-red-500' : 'text-stone-400'}`}>
                {title.length}/{TITLE_MAX}
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                maxLength={TITLE_MAX}
                placeholder="给菜品起个名字"
                className="w-full bg-[#f8faf7] border border-stone-250/70 rounded-xl px-4 pr-10 py-3 text-base font-black outline-none focus:bg-white focus:border-[#8ca779]"
              />
              {title && (
                <button
                  type="button"
                  onClick={() => setTitle('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-700 flex items-center justify-center cursor-pointer transition-all text-sm font-bold"
                  title="清空标题"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* 标签 */}
          <div className="flex flex-wrap gap-1.5 shrink-0">
            {TAGS.map((tag) => {
              const isSelected = tags.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => {
                    if (isSelected) {
                      setTags((prev) => prev.filter((t) => t !== tag));
                    } else {
                      setTags((prev) => [...prev, tag]);
                    }
                  }}
                  className={`px-3 py-1.5 text-[12px] font-black rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#8ca779] border-brand-green/30 text-white shadow-3xs'
                      : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>

          {/* ============ 步骤分布编辑区（替换原"正文"） ============ */}
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between shrink-0 mb-2">
              <label className="text-[18px] font-black text-stone-550 block">步骤记录</label>
              <span className="text-[13px] text-stone-400 font-mono">共 {steps.length} 步</span>
            </div>

            {/* 步骤列表：可滚动 */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scroll space-y-2 pr-1">
              {steps.map((step, idx) => (
                <div key={idx} className="relative group">
                  {/* 步骤序号 */}
                  <div className="absolute left-3 top-3 w-7 h-7 rounded-full bg-[#8ca779] text-white text-[13px] font-black flex items-center justify-center shrink-0 z-10">
                    {idx + 1}
                  </div>

                  <textarea
                    value={step}
                    onChange={(e) => handleStepChange(idx, e.target.value)}
                    maxLength={STEP_MAX}
                    placeholder={`第 ${idx + 1} 步...`}
                    rows={2}
                    className="w-full bg-[#f8faf7] border border-stone-250/70 rounded-xl pl-13 pr-10 py-3 text-[14px] font-medium outline-none focus:bg-white focus:border-[#8ca779] resize-none leading-relaxed"
                    style={{ paddingLeft: '3.25rem' }}
                  />

                  {/* 删除按钮：仅当步骤数 > 1 时显示 */}
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(idx)}
                      className="absolute right-2 top-2 w-7 h-7 rounded-full bg-stone-100 hover:bg-red-100 text-stone-400 hover:text-red-500 flex items-center justify-center cursor-pointer transition-all text-sm font-bold opacity-0 group-hover:opacity-100"
                      title="删除此步骤"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              {/* 添加步骤按钮 */}
              <button
                type="button"
                onClick={addStep}
                className="w-full py-3 border-2 border-dashed border-[#a9c894] rounded-xl bg-[#eff7e8]/30 hover:bg-[#eff7e8] text-[#5d7350] font-black text-[15px] flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span className="text-xl">+</span>
                <span>添加步骤</span>
              </button>
            </div>

            <div className="text-[11px] text-stone-400 text-right pr-1 select-none font-bold shrink-0 mt-2">
              此记录仅保存在「个人中心 - 烹饪记录」中，不会发布到社区
            </div>
          </div>
        </div>
      </div>

      {/* 底部按钮 */}
      <div className="border-t border-stone-100 pt-3 mt-4 flex gap-3 justify-end shrink-0 select-none">
        <button
          onClick={onClose}
          className="bg-stone-100 text-stone-500 text-xs font-black px-6 py-2.5 rounded-xl cursor-pointer hover:bg-stone-200 active:scale-95 transition-all text-center"
        >
          取消
        </button>

        <button
          onClick={handleSave}
          className="bg-brand-green hover:bg-[#728f60] active:scale-95 text-white text-xs font-black px-8 py-2.5 rounded-xl cursor-pointer transition-all shadow-md text-center"
        >
          {editingLog ? '保存修改' : '保存记录'}
        </button>
      </div>

    </div>
  );
}