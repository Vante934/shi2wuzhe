import { useEffect } from 'react';
import type { SocialPost } from '../../types';
import { uploadApi, communityApi } from '../../api';

interface CustomPublishPageProps {
  customPublishSource: 'community' | 'cooking_logs';
  customPublishTitle: string;
  customPublishBody: string;
  customPublishEmoji: string;
  customPublishImages: string[];
  customPublishTags: string[];
  customPublishStars: number;
  customPublishImage: string | null;
  publishToCommunity: boolean;
  publishToLogs: boolean;

  socialPosts: SocialPost[];
  cookingLogs: Array<any>;
  profileUsername: string;
  profileAvatar: string;

  setCustomPublishTitle: (v: string) => void;
  setCustomPublishBody: (v: string) => void;
  setCustomPublishEmoji: (v: string) => void;
  setCustomPublishImages: (updater: (prev: string[]) => string[]) => void;
  setCustomPublishTags: (updater: (prev: string[]) => string[]) => void;
  setCustomPublishStars: (v: number) => void;
  setSocialPosts: (updater: (prev: SocialPost[]) => SocialPost[]) => void;
  setCookingLogs: (updater: (prev: any[]) => any[]) => void;

  /* 编辑模式相关 */
  editingRecipeId?: string | null;
  editingRecipeType?: 'original' | 'draft' | null;
  setMyOriginalRecipes?: (updater: (prev: any[]) => any[]) => void;
  setMyDraftPosts?: (updater: (prev: any[]) => any[]) => void;

  onClose: () => void;
  showToast: (msg: string) => void;
  setActiveTab: (tab: 'eatwell' | 'inspiration' | 'community' | 'profile') => void;
  setActiveProfileTabGroup: (g: any) => void;
  setActiveSidebarFilter: (f: any) => void;
}

const TITLE_MAX = 18;
const BODY_MAX = 500;
const IMAGE_MAX = 9;

export default function CustomPublishPage({
  customPublishSource, customPublishTitle, customPublishBody, customPublishEmoji, customPublishImages,
  customPublishTags, customPublishStars, customPublishImage, publishToCommunity, publishToLogs,
  socialPosts, cookingLogs, profileUsername, profileAvatar, setCustomPublishTitle, setCustomPublishBody,
  setCustomPublishEmoji, setCustomPublishImages, setCustomPublishTags, setCustomPublishStars, setSocialPosts,
  setCookingLogs,
  editingRecipeId, editingRecipeType, setMyOriginalRecipes, setMyDraftPosts,
  onClose, showToast, setActiveTab, setActiveProfileTabGroup, setActiveSidebarFilter,
}: CustomPublishPageProps) {

  useEffect(() => {
    const isFreshOpen =
      !customPublishTitle &&
      !customPublishBody &&
      customPublishImages.length === 0 &&
      !editingRecipeId;

    if (isFreshOpen) {
      setCustomPublishEmoji('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isEditing = !!editingRecipeId;

  const handleCancel = () => {
    onClose();
    if (customPublishSource === 'community') {
      setActiveTab('community');
    } else {
      setActiveTab('profile');
      setActiveProfileTabGroup('cooking_logs');
    }
  };

  const handleSubmit = () => {
    if (!customPublishTitle.trim()) {
      showToast('请先编辑内容再保存哦！');
      return;
    }

    const postNote = customPublishBody.trim() || '手工烹制，清甜好吃，健康营养极其到位！';
    const chosenImg = customPublishImage || customPublishImages[0];

    /* ============ 编辑模式：覆盖原数据（本地） ============ */
    if (isEditing && editingRecipeType === 'original' && setMyOriginalRecipes) {
      setMyOriginalRecipes((prev) =>
        prev.map((r) =>
          r.id === editingRecipeId
            ? {
                ...r,
                title: customPublishTitle,
                name: customPublishTitle,
                body: postNote,
                caption: postNote,
                emoji: chosenImg ? undefined : customPublishEmoji,
                coverEmoji: chosenImg ? undefined : customPublishEmoji,
                image: chosenImg || undefined,
                images: customPublishImages,
                tags: customPublishTags,
                stars: customPublishStars,
              }
            : r
        )
      );
      showToast('原创食谱已更新');
      onClose();
      setActiveTab('profile');
      setActiveProfileTabGroup('recipes');
      return;
    }

    if (isEditing && editingRecipeType === 'draft' && setMyDraftPosts) {
      setMyDraftPosts((prev) =>
        prev.map((r) =>
          r.id === editingRecipeId
            ? {
                ...r,
                title: customPublishTitle,
                name: customPublishTitle,
                body: postNote,
                caption: postNote,
                emoji: chosenImg ? undefined : customPublishEmoji,
                coverEmoji: chosenImg ? undefined : customPublishEmoji,
                image: chosenImg || undefined,
                images: customPublishImages,
                tags: customPublishTags,
                stars: customPublishStars,
              }
            : r
        )
      );
      showToast('草稿已更新');
      onClose();
      setActiveTab('profile');
      setActiveProfileTabGroup('recipes');
      return;
    }

    /* ============ 非编辑模式：走真实后端 ============ */
    if (!publishToCommunity && !publishToLogs) {
      showToast('归档目标限制：请至少勾选「分享到社区」或「录入个人打卡」之一进行归档保存！');
      return;
    }

    (async () => {
      // 1) 发帖到后端
      if (publishToCommunity) {
        try {
          await communityApi.publishPost({
            title: customPublishTitle,
            content: postNote,
            imagesJson: customPublishImages.length > 0 ? customPublishImages : undefined,
            tagsJson: customPublishTags.length > 0 ? customPublishTags : undefined,
          });
          // 同步前端列表（占位插入，下次进社区会自动从后端拉到真实数据）
          const newPostId = `tmp-${Date.now()}`;
          const postItem: SocialPost = {
            id: newPostId,
            author: profileUsername,
            avatar: profileAvatar,
            title: customPublishTitle,
            caption: postNote,
            image: chosenImg || undefined,
            coverEmoji: chosenImg ? undefined : customPublishEmoji,
            emoji: chosenImg ? undefined : customPublishEmoji,
            stars: customPublishStars,
            time: '刚刚',
            likes: 0,
            saves: 0,
            isLiked: false,
            isSaved: false,
            comments: [],
          } as any;
          setSocialPosts((prev) => [postItem, ...prev]);
        } catch (err) {
          console.error('[CustomPublishPage] 发帖失败', err);
          showToast('发布到社区失败');
          return;
        }
      }

      // 2) 烹饪日志（本地）
      if (publishToLogs) {
        const newLogId = String(cookingLogs.length + 1);
        const logItem = {
          id: newLogId,
          name: customPublishTitle,
          date: new Date().toISOString().slice(0, 10),
          stars: customPublishStars,
          note: postNote,
          emoji: chosenImg ? '📸' : customPublishEmoji,
          duration: 15,
        };
        setCookingLogs((prev) => [logItem, ...prev]);
      }

      showToast('发布成功');
      onClose();

      if (publishToCommunity) {
        setActiveTab('community');
        setActiveSidebarFilter('all');
      } else {
        setActiveTab('profile');
        setActiveProfileTabGroup('cooking_logs');
      }
    })();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v.length > TITLE_MAX) {
      showToast(`标题最多 ${TITLE_MAX} 字哦！`);
      setCustomPublishTitle(v.slice(0, TITLE_MAX));
      return;
    }
    setCustomPublishTitle(v);
  };

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    if (v.length > BODY_MAX) {
      showToast(`正文最多 ${BODY_MAX} 字哦！`);
      setCustomPublishBody(v.slice(0, BODY_MAX));
      return;
    }
    setCustomPublishBody(v);
  };

  const triggerFilePicker = () => {
    const input = document.getElementById('custom-file-upload-input') as HTMLInputElement | null;
    if (input) input.click();
  };

  const QUICK_EMOJIS = ['🥘', '🥗', '🥩', '🍜', '🍤', '🧁', '🍗', '🍉', '🥟'];

  const hasImages = customPublishImages.length > 0;
  const hasEmoji = !!customPublishEmoji && !hasImages;

  return (
    <div className="flex flex-col flex-1 w-full h-full justify-between animate-fade-in bg-white border border-[#a2c28f]/20 rounded-[2rem] p-8 shadow-sm overflow-hidden text-left relative">

      <div className="flex items-center justify-between border-b pb-3 mb-4 shrink-0 select-none">
        <button
          onClick={handleCancel}
          className="p-1 px-3 text-base bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl hover:text-stone-900 font-extrabold border transition-colors cursor-pointer flex items-center gap-1"
        >
          ← 取消编辑
        </button>
        <div className="text-center">
          <span className="block text-[28px] font-black text-stone-850 mb-2">
            {isEditing ? '编辑食谱' : '发帖编辑界面'}
          </span>
          <span className="block text-[13px] text-[#8ca779] font-black tracking-wide font-mono">
            {isEditing
              ? (editingRecipeType === 'draft' ? '正在编辑草稿' : '正在编辑原创食谱')
              : '烹饪日志与社区发布'}
          </span>
        </div>
        <div className="w-16"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-8 flex-1 items-stretch min-h-0 overflow-hidden">

        {/* ============ Left: 配图区 ============ */}
        <div className="bg-[#fbfcfa] border border-[#a1c18e]/15 rounded-2xl p-4.5 flex flex-col gap-3 min-h-0 overflow-hidden">
          <span className="text-[13px] font-black text-stone-500 block shrink-0">发帖配图</span>

          <div className="flex-1 min-h-0 bg-[#eff7e8] border-2 border-dashed border-[#a9c894] rounded-xl flex flex-col p-4 overflow-hidden">
            {hasImages ? (
              <div className="flex-1 min-h-0 overflow-y-auto custom-scroll">
                <div className="grid grid-cols-3 gap-3 w-full">
                  {customPublishImages.slice(0, IMAGE_MAX).map((imgUrl, imgIdx) => (
                    <div key={imgIdx} className="relative aspect-square w-full rounded-lg overflow-hidden border border-stone-200 group bg-white">
                      <img src={imgUrl} alt={`Preview ${imgIdx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCustomPublishImages((prev) => prev.filter((_, idx2) => idx2 !== imgIdx));
                        }}
                        className="absolute -top-0.5 -right-0.5 bg-red-500 hover:bg-red-650 text-white rounded-full w-5 h-5 p-0 text-[10px] flex items-center justify-center font-bold font-mono shadow-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {customPublishImages.length < IMAGE_MAX && (
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
                  {customPublishEmoji}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCustomPublishEmoji('');
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

          {/* ============ 文件选择：接入真实上传 ============ */}
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={async (e) => {
              const files = Array.from(e.target.files || []) as File[];
              if (customPublishImages.length + files.length > IMAGE_MAX) {
                showToast(`最多上传 ${IMAGE_MAX} 张照片`);
                e.target.value = '';
                return;
              }

              showToast(`正在上传 ${files.length} 张图片...`);
              try {
                const uploadedUrls: string[] = [];
                for (const f of files) {
                  const res: any = await uploadApi.upload(f);
                  // 若依返回顶层：{ code, msg, url, fileName, ... }
                  // 优先用 fileName（相对路径），其次 url
                  const path = res?.fileName || res?.url;
                  if (path) uploadedUrls.push(path);
                }
                if (uploadedUrls.length === 0) {
                  showToast('上传失败');
                  e.target.value = '';
                  return;
                }
                setCustomPublishImages((prev) => [...prev, ...uploadedUrls]);
                setCustomPublishEmoji('');
                showToast(`成功上传 ${uploadedUrls.length} 张图片`);
              } catch (err) {
                console.error('[CustomPublishPage] 上传失败', err);
                showToast('上传失败，请重试');
              }
              e.target.value = '';
            }}
            className="hidden"
            id="custom-file-upload-input"
          />

          <div className="flex items-center gap-2 shrink-0 border-t pt-3 border-stone-200/40">
            <div className="flex items-center gap-1.5 flex-1 min-w-0 flex-wrap">
              {QUICK_EMOJIS.map((emo) => (
                <button
                  type="button"
                  key={emo}
                  onClick={() => {
                    setCustomPublishEmoji(emo);
                    setCustomPublishImages(() => []);
                  }}
                  className={`w-9 h-9 rounded-lg border text-lg flex items-center justify-center cursor-pointer hover:bg-stone-100 shrink-0 transition-all ${
                    customPublishEmoji === emo && !hasImages
                      ? 'border-[#8ca779] bg-[#eff7e8] scale-110 shadow-sm'
                      : 'border-stone-200 bg-white'
                  }`}
                >
                  {emo}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                const randomMockAIPics = [
                  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
                  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&fit=crop&q=60',
                  'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=500&auto=format&fit=crop&q=60',
                  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=60',
                  'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=500&auto=format&fit=crop&q=60',
                ];
                if (customPublishImages.length >= IMAGE_MAX) {
                  showToast(`最多只能上传 ${IMAGE_MAX} 张图片`);
                  return;
                }
                const pic = randomMockAIPics[Math.floor(Math.random() * randomMockAIPics.length)];
                setCustomPublishImages((prev) => [...prev, pic]);
                setCustomPublishEmoji('');
                showToast('已为您的文字生成图片');
              }}
              className="bg-[#a9c894] hover:bg-[#8ba779] text-white text-[16px] font-black py-2 px-4 rounded-lg cursor-pointer text-center shrink-0"
            >
              文字生图
            </button>
          </div>
        </div>

        {/* ============ Right: 表单 ============ */}
        <div className="flex flex-col gap-3 min-h-0 overflow-hidden">

          <div className="space-y-1 shrink-0">
            <div className="flex items-center justify-between">
              <label className="text-[18px] font-black text-stone-550 block">标题（最多 {TITLE_MAX} 字）</label>
              <span className={`text-[16px] font-mono ${customPublishTitle.length >= TITLE_MAX ? 'text-red-500' : 'text-stone-400'}`}>
                {customPublishTitle.length}/{TITLE_MAX}
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={customPublishTitle}
                onChange={handleTitleChange}
                maxLength={TITLE_MAX}
                placeholder="填写标题会有更多赞哦"
                className="w-full bg-[#f8faf7] border border-stone-250/70 rounded-xl px-4 pr-10 py-3 text-base font-black outline-none focus:bg-white focus:border-[#8ca779]"
              />

              {customPublishTitle && (
                <button
                  type="button"
                  onClick={() => setCustomPublishTitle('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-700 flex items-center justify-center cursor-pointer transition-all text-sm font-bold"
                  title="清空标题"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 shrink-0">
            {['健康轻食', '营养高蛋白', '快手懒人', '传统硬菜', '低脂能量', '时令美馔'].map((tag) => {
              const isSelected = customPublishTags.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => {
                    if (isSelected) {
                      setCustomPublishTags((prev) => prev.filter((t) => t !== tag));
                    } else {
                      setCustomPublishTags((prev) => [...prev, tag]);
                      showToast(`已关联帖子标签: #${tag}`);
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

          <div className="flex flex-col flex-1 min-h-0 space-y-1">
            <div className="flex items-center justify-between shrink-0">
              <label className="text-[18px] font-black text-stone-550 block">正文（最多 {BODY_MAX} 字）</label>
              <span className={`text-[16px] font-mono ${customPublishBody.length >= BODY_MAX ? 'text-red-500' : 'text-stone-400'}`}>
                {customPublishBody.length}/{BODY_MAX}
              </span>
            </div>
            <textarea
              value={customPublishBody}
              onChange={handleBodyChange}
              maxLength={BODY_MAX}
              placeholder="输入正文描述，真诚有价值的分享予人温暖"
              className="w-full flex-1 bg-[#f8faf7] border border-stone-250/70 rounded-xl p-4 text-base font-bold outline-none focus:bg-white focus:border-[#8ca779] resize-none min-h-0"
            />
            <div className="text-[11px] text-[#5d7350] text-right pr-1 select-none font-bold shrink-0">
              {isEditing ? '保存后将更新到食谱库中' : '本帖将同步推送至「社区广场」以及「个人中心」烹饪记录中'}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-stone-100 pt-3 mt-4 flex gap-3 justify-end shrink-0 select-none">
<button
  onClick={handleCancel}
  className="bg-stone-100 text-stone-500 text-xs font-black px-6 py-2.5 rounded-xl cursor-pointer hover:bg-stone-200 active:scale-95 transition-all text-center"
>
  {isEditing ? '取消' : '放弃'}
          </button>

          {!isEditing && (
            <button
              onClick={async () => {
                if (!customPublishTitle.trim()) {
                  showToast('请先填写标题再存草稿');
                  return;
                }
                try {
                  await communityApi.publishPost({
                    title: customPublishTitle,
                    content: customPublishBody.trim() || '（草稿）',
                    imagesJson: customPublishImages.length > 0 ? customPublishImages : undefined,
                    tagsJson: customPublishTags.length > 0 ? customPublishTags : undefined,
                    status: 3,   // 草稿
                  });
                  showToast('草稿已暂存');
                  onClose();
                  setActiveTab('profile');
                  setActiveProfileTabGroup('recipes');
                } catch (err) {
                  console.error('暂存草稿失败', err);
                  showToast('暂存失败');
                }
              }}
              className="bg-amber-100 text-amber-800 text-xs font-black px-6 py-2.5 rounded-xl cursor-pointer hover:bg-amber-200 active:scale-95 transition-all text-center"
            >
              暂存草稿
            </button>
          )}

        <button
          onClick={handleSubmit}
          className="bg-brand-green hover:bg-[#728f60] active:scale-95 text-white text-xs font-black px-8 py-2.5 rounded-xl cursor-pointer transition-all shadow-md text-center"
        >
          {isEditing ? '保存修改' : '确认发布'}
        </button>
      </div>

    </div>
  );
}