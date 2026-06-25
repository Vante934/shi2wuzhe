/**
 * 社区互动 Hook
 * 游客模式：
 *   - 帖子列表正常拉（公开数据）
 *   - 评论列表正常拉（公开数据）
 *   - 点赞/收藏/评论/回复 → 拦截 + Toast
 */
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { communityApi, commentApi, storage } from '../api';
import {
  mapCommunityPostDTOToSocialPost,
  mapCommentDTOToSocialComment,
} from '../api/mappers';
import type { SocialPost, SocialComment, AuthorProfileVM } from '../types';

interface FloatingHeart {
  id: number;
  left: number;
}

interface UseCommunityActionsOptions {
  profileUsername: string;
  searchQuery: string;
  showToast: (msg: string) => void;
}

const isGuest = () => storage.isGuest() || !storage.getToken();
const GUEST_TIP = '该功能需要登录后使用，请先登录或注册';

const PAGE_SIZE = 20;

export function useCommunityActions(options: UseCommunityActionsOptions) {
  const { profileUsername, searchQuery, showToast } = options;

  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  // ⭐ 新增：分页 / 循环加载
  const [loadingMore, setLoadingMore] = useState(false);
  const pageNumRef = useRef(1);
  const loopRoundRef = useRef(0);
  const isFetchingRef = useRef(false);

  const [activeSidebarFilter, setActiveSidebarFilter] =
    useState<'all' | 'liked' | 'saved' | 'comments'>('all');
  const [communityFeedTab, setCommunityFeedTab] =
    useState<'discover' | 'following'>('discover');

  const [chosenPost, setChosenPost] = useState<SocialPost | null>(null);
  const [viewingAuthorProfile, setViewingAuthorProfile] =
    useState<AuthorProfileVM | null>(null);

  const [followedAuthors, setFollowedAuthors] = useState<string[]>([]);

  const [currentUserCommentText, setCurrentUserCommentText] = useState('');
  const [commentReplyText, setCommentReplyText] = useState('');
  const [activeReplyCommentIdx, setActiveReplyCommentIdx] =
    useState<number | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);

  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);

  /**
   * 拉取帖子列表
   * @param reset true=重置回第一页（切 tab / 刷新），false=追加（触底加载）
   */
  const fetchPostList = useCallback(
    async (reset: boolean = false) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      if (reset) {
        pageNumRef.current = 1;
        loopRoundRef.current = 0;
        setLoadingList(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const tab = communityFeedTab === 'following' ? 'follow' : 'latest';
        const res = await communityApi.getPostList({
          tab,
          pageNum: pageNumRef.current,
          pageSize: PAGE_SIZE,
        });

        const records = (res.data?.records || []) as any[];
        const total = res.data?.total ?? 0;
        const currentPage = pageNumRef.current;

        // 给重复轮次的帖子加后缀，防止 React key 冲突
        const suffix = loopRoundRef.current > 0 ? `__r${loopRoundRef.current}` : '';
        const posts = records.map((r) => {
          const p = mapCommunityPostDTOToSocialPost(r);
          return suffix ? { ...p, id: `${p.id}${suffix}` } : p;
        });

        if (reset) {
          setSocialPosts(posts);
        } else {
          setSocialPosts((prev) => [...prev, ...posts]);
        }

        const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
        if (currentPage >= totalPages) {
          // 当前轮次拉完，进入下一轮循环
          loopRoundRef.current += 1;
          pageNumRef.current = 1;
        } else {
          pageNumRef.current = currentPage + 1;
        }
      } catch (err) {
        console.error('[useCommunityActions] 拉取帖子列表失败', err);
      } finally {
        setLoadingList(false);
        setLoadingMore(false);
        isFetchingRef.current = false;
      }
    },
    [communityFeedTab]
  );

  // 切 tab 时重新拉
  useEffect(() => {
    if (isGuest() && communityFeedTab === 'following') {
      setSocialPosts([]);
      return;
    }
    fetchPostList(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityFeedTab]);

  // ⭐ 触底加载更多
  const loadMorePosts = useCallback(() => {
    if (isFetchingRef.current) return;
    if (isGuest() && communityFeedTab === 'following') return;
    fetchPostList(false);
  }, [fetchPostList, communityFeedTab]);

  const lastLoadedPostIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!chosenPost) {
      lastLoadedPostIdRef.current = null;
      return;
    }
    if (lastLoadedPostIdRef.current === chosenPost.id) return;
    lastLoadedPostIdRef.current = chosenPost.id;

    (async () => {
      try {
        const realId = String(chosenPost.id).split('__r')[0];
        const res = await commentApi.getCommentList({
          targetType: 2,
          targetId: Number(realId),
          pageNum: 1,
          pageSize: 50,
        });
        const records = (res.data?.records || []) as any[];
        const comments = records.map(mapCommentDTOToSocialComment);
        const updated = { ...chosenPost, comments };
        setChosenPost(updated);
        setSocialPosts((prev) =>
          prev.map((p) => (p.id === chosenPost.id ? updated : p))
        );
      } catch (err) {
        console.error('[useCommunityActions] 拉取评论失败', err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosenPost?.id]);

  const filteredSocialPosts = useMemo(() => {
    let base = socialPosts;
    if (activeSidebarFilter === 'liked') {
      base = socialPosts.filter((p) => p.isLiked);
    } else if (activeSidebarFilter === 'saved') {
      base = socialPosts.filter((p) => p.isSaved);
    }
    if (communityFeedTab === 'following') {
      if (followedAuthors.length > 0) {
        base = base.filter((p) => followedAuthors.includes(p.author));
      } else {
        base = base.filter(
          (p) =>
            p.author === profileUsername ||
            (p.comments && p.comments.some((c) => c.name === profileUsername))
        );
      }
    }
    if (searchQuery) {
      base = base.filter(
        (p) =>
          p.title.includes(searchQuery) ||
          p.author.includes(searchQuery) ||
          (p.tags && p.tags.some((t: string) => t.includes(searchQuery) || searchQuery.includes(t)))
      );
    }
    return base;
  }, [socialPosts, activeSidebarFilter, searchQuery, communityFeedTab, followedAuthors, profileUsername]);

  const triggerHeartPop = useCallback(() => {
    const newHearts = Array.from({ length: 5 }).map((_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 80 + 10,
    }));
    setFloatingHearts((prev) => [...prev, ...newHearts]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => !newHearts.some((nh) => nh.id === h.id)));
    }, 1200);
  }, []);

  // ============ 写操作（带游客守卫） ============

  const handleSubmitComment = useCallback(async () => {
    if (isGuest()) { showToast(GUEST_TIP); return; }
    if (!currentUserCommentText.trim()) {
      setCommentError('评论内容不能为空，请先输入文字哦～');
      setTimeout(() => setCommentError(null), 2200);
      return;
    }
    if (!chosenPost) return;

    const content = currentUserCommentText.trim();
    const realId = String(chosenPost.id).split('__r')[0];

    try {
      await commentApi.addComment({
        targetType: 2,
        targetId: Number(realId),
        content,
      });

      const listRes = await commentApi.getCommentList({
        targetType: 2,
        targetId: Number(realId),
        pageNum: 1,
        pageSize: 50,
      });
      const newComments = (listRes.data?.records || []).map(mapCommentDTOToSocialComment);
      const updated = { ...chosenPost, comments: newComments };
      setChosenPost(updated);
      setSocialPosts((prev) =>
        prev.map((p) => (p.id === chosenPost.id ? updated : p))
      );
      setCurrentUserCommentText('');
      showToast('评论已发布');
    } catch (err) {
      console.error('[useCommunityActions] 发评论失败', err);
      showToast('评论失败，请重试');
    }
  }, [currentUserCommentText, chosenPost, showToast]);

  const handleSubmitReply = useCallback(
    async (commentIdx: number) => {
      if (isGuest()) { showToast(GUEST_TIP); return; }
      if (!commentReplyText.trim()) {
        setCommentError('回复内容不能为空，请先输入文字哦～');
        setTimeout(() => setCommentError(null), 2200);
        return;
      }
      if (!chosenPost) return;
      const parentComment: any = chosenPost.comments[commentIdx];
      if (!parentComment) return;

      const content = commentReplyText.trim();
      const realId = String(chosenPost.id).split('__r')[0];

      try {
        await commentApi.addComment({
          targetType: 2,
          targetId: Number(realId),
          content,
          parentId: Number(parentComment.id),
          replyToUserId: parentComment._userId ?? undefined,
        });

        const listRes = await commentApi.getCommentList({
          targetType: 2,
          targetId: Number(realId),
          pageNum: 1,
          pageSize: 50,
        });
        const newComments = (listRes.data?.records || []).map(mapCommentDTOToSocialComment);
        const updated = { ...chosenPost, comments: newComments };
        setChosenPost(updated);
        setSocialPosts((prev) =>
          prev.map((p) => (p.id === chosenPost.id ? updated : p))
        );

        setCommentReplyText('');
        setActiveReplyCommentIdx(null);
        showToast('回复已发布');
      } catch (err) {
        console.error('[useCommunityActions] 回复失败', err);
        showToast('回复失败，请重试');
      }
    },
    [commentReplyText, chosenPost, showToast]
  );

  const togglePostLike = useCallback(
    async (post: SocialPost) => {
      if (isGuest()) { showToast(GUEST_TIP); return; }

      const optimistic = {
        ...post,
        isLiked: !post.isLiked,
        likes: post.likes + (post.isLiked ? -1 : 1),
      };
      setSocialPosts((prev) =>
        prev.map((p) => (p.id === post.id ? optimistic : p))
      );
      if (chosenPost?.id === post.id) setChosenPost(optimistic);

      try {
        const realId = String(post.id).split('__r')[0];
        const res = await communityApi.likePost(Number(realId));
        const liked = res.data?.liked ?? optimistic.isLiked;
        const likeCount = res.data?.likeCount ?? optimistic.likes;
        const final = { ...optimistic, isLiked: liked, likes: likeCount };
        setSocialPosts((prev) =>
          prev.map((p) => (p.id === post.id ? final : p))
        );
        if (chosenPost?.id === post.id) setChosenPost(final);
      } catch (err) {
        console.error('[useCommunityActions] 点赞失败，回滚', err);
        setSocialPosts((prev) => prev.map((p) => (p.id === post.id ? post : p)));
        if (chosenPost?.id === post.id) setChosenPost(post);
        showToast('点赞失败，请稍后重试');
      }
    },
    [chosenPost, showToast]
  );

  const togglePostCollect = useCallback(
    async (post: SocialPost) => {
      if (isGuest()) { showToast(GUEST_TIP); return; }

      const optimistic = {
        ...post,
        isSaved: !post.isSaved,
        saves: (post.saves ?? 0) + (post.isSaved ? -1 : 1),
      };
      setSocialPosts((prev) =>
        prev.map((p) => (p.id === post.id ? optimistic : p))
      );
      if (chosenPost?.id === post.id) setChosenPost(optimistic);

      try {
        const realId = String(post.id).split('__r')[0];
        const res = await communityApi.collectPost(Number(realId));
        const collected = res.data?.collected ?? optimistic.isSaved;
        const collectCount = res.data?.collectCount ?? optimistic.saves;
        const final = { ...optimistic, isSaved: collected, saves: collectCount };
        setSocialPosts((prev) =>
          prev.map((p) => (p.id === post.id ? final : p))
        );
        if (chosenPost?.id === post.id) setChosenPost(final);
      } catch (err) {
        console.error('[useCommunityActions] 收藏失败，回滚', err);
        setSocialPosts((prev) => prev.map((p) => (p.id === post.id ? post : p)));
        if (chosenPost?.id === post.id) setChosenPost(post);
        showToast('收藏失败，请稍后重试');
      }
    },
    [chosenPost, showToast]
  );

  const refreshPostList = useCallback(() => {
    fetchPostList(true);
  }, [fetchPostList]);

  return {
    socialPosts,
    setSocialPosts,
    filteredSocialPosts,
    loadingList,
    loadingMore,
    loadMorePosts,
    activeSidebarFilter,
    setActiveSidebarFilter,
    communityFeedTab,
    setCommunityFeedTab,
    chosenPost,
    setChosenPost,
    viewingAuthorProfile,
    setViewingAuthorProfile,
    followedAuthors,
    setFollowedAuthors,
    currentUserCommentText,
    setCurrentUserCommentText,
    commentReplyText,
    setCommentReplyText,
    activeReplyCommentIdx,
    setActiveReplyCommentIdx,
    commentError,
    floatingHearts,
    setFloatingHearts,
    triggerHeartPop,
    handleSubmitComment,
    handleSubmitReply,
    togglePostLike,
    togglePostCollect,
    refreshPostList,
  };
}