/**
 * 发布工坊 Hook（CustomPublishPage）
 * 接管：标题/正文/封面/图片/标签/星级 + 发布去向开关 + 页面开关
 *
 * ⚠️ 当前发布只更新前端 state，不调后端
 * ⚠️ 后续接入后端：
 *    - 发帖：communityApi.publishPost({ title, content, imagesJson, tagsJson })
 *    - 加烹饪记录：userApi.addCookingRecord({ recipeTitle, rating, note, imagesJson, cookDate })
 *    - 图片上传：uploadApi.upload(file)
 */
import { useState, useCallback } from 'react';

export type PublishSource = 'community' | 'cooking_logs';

interface OpenComposerOptions {
  source: PublishSource;
  /** 默认勾选"发到社区" */
  toCommunity?: boolean;
  /** 默认勾选"发到打卡" */
  toLogs?: boolean;
}

export function usePublishComposer() {
  // ============ 页面开关 ============
  const [isCustomPublishPage, setIsCustomPublishPage] = useState(false);

  // ============ 来源 / 去向 ============
  const [customPublishSource, setCustomPublishSource] = useState<PublishSource>('community');
  const [publishToCommunity, setPublishToCommunity] = useState<boolean>(true);
  const [publishToLogs, setPublishToLogs] = useState<boolean>(true);

  // ============ 正文字段 ============
  const [customPublishTitle, setCustomPublishTitle] = useState('');
  const [customPublishBody, setCustomPublishBody] = useState('');
  const [customPublishEmoji, setCustomPublishEmoji] = useState('🥘');
  const [customPublishImage, setCustomPublishImage] = useState<string | null>(null);
  const [customPublishImages, setCustomPublishImages] = useState<string[]>([]);
  const [customPublishTags, setCustomPublishTags] = useState<string[]>([]);
  const [customPublishStars, setCustomPublishStars] = useState<number>(5);

  // ============ Actions ============

  /** 重置所有表单字段为空白 */
  const resetComposer = useCallback(() => {
    setCustomPublishTitle('');
    setCustomPublishBody('');
    setCustomPublishStars(5);
    setCustomPublishEmoji('🥘');
    setCustomPublishImage(null);
    setCustomPublishImages([]);
    setCustomPublishTags([]);
  }, []);

  /** 打开发布页（默认会重置字段） */
  const openComposer = useCallback(
    (options: OpenComposerOptions) => {
      const { source, toCommunity, toLogs } = options;
      setCustomPublishSource(source);
      resetComposer();
      setPublishToCommunity(toCommunity ?? (source === 'community'));
      setPublishToLogs(toLogs ?? (source === 'cooking_logs'));
      setIsCustomPublishPage(true);
    },
    [resetComposer]
  );

  /** 关闭发布页 */
  const closeComposer = useCallback(() => {
    setIsCustomPublishPage(false);
  }, []);

  return {
    // 页面开关
    isCustomPublishPage,
    setIsCustomPublishPage,

    // 来源 / 去向
    customPublishSource,
    setCustomPublishSource,
    publishToCommunity,
    setPublishToCommunity,
    publishToLogs,
    setPublishToLogs,

    // 字段
    customPublishTitle,
    setCustomPublishTitle,
    customPublishBody,
    setCustomPublishBody,
    customPublishEmoji,
    setCustomPublishEmoji,
    customPublishImage,
    setCustomPublishImage,
    customPublishImages,
    setCustomPublishImages,
    customPublishTags,
    setCustomPublishTags,
    customPublishStars,
    setCustomPublishStars,

    // Actions
    openComposer,
    closeComposer,
    resetComposer,
  };
}