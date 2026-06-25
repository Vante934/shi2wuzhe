/**
 * 社区模块接口
 */
import { request, PageResult } from '../request';
import type { CommunityPostDTO } from '../types';

export interface PostListParams {
  tab?: 'recommend' | 'latest' | 'follow';
  pageNum?: number;
  pageSize?: number;
}

export const communityApi = {
  getPostList(params: PostListParams = {}) {
    return request.get<PageResult<CommunityPostDTO>>('/api/community/post/list', {
      tab: 'recommend',
      pageNum: 1,
      pageSize: 10,
      ...params,
    });
  },

  /** 我的帖子（按 status 过滤） */
  getMyPosts(params: { status?: 1 | 3; pageNum?: number; pageSize?: number } = {}) {
    return request.get<PageResult<CommunityPostDTO>>('/api/community/post/mine', {
      status: 1,
      pageNum: 1,
      pageSize: 50,
      ...params,
    });
  },

  getPostDetail(id: string | number) {
    return request.get<CommunityPostDTO>(`/api/community/post/${id}`);
  },

  /** 发帖 / 存草稿 */
  publishPost(data: {
    title: string;
    content: string;
    imagesJson?: string[];
    recipeId?: number | null;
    tagsJson?: string[];
    status?: 1 | 3;   // 1=发布 3=草稿
  }) {
    return request.post('/api/community/post/publish', data);
  },

  deletePost(id: string | number) {
    return request.delete(`/api/community/post/${id}`);
  },

  likePost(postId: number) {
    return request.post<{ liked: boolean; likeCount: number }>(
      '/api/community/post/like',
      { postId }
    );
  },

  collectPost(postId: number) {
    return request.post<{ collected: boolean; collectCount: number }>(
      '/api/community/post/collect',
      { postId }
    );
  },

  report(data: {
    targetType: 1 | 2 | 3;
    targetId: number;
    reason: string;
    description?: string;
  }) {
    return request.post('/api/community/report', data);
  },
};