/**
 * 评论模块接口
 */
import { request, PageResult } from '../request';
import type { CommentDTO } from '../types';

export const commentApi = {
  /** 添加评论 */
  addComment(data: {
    targetType: 1 | 2;
    targetId: number;
    content: string;
    parentId?: number | null;
    replyToUserId?: number | null;
  }) {
    return request.post('/api/community/comment/add', data);
  },

  /** 评论列表 */
  getCommentList(params: {
    targetType: 1 | 2;
    targetId: number;
    parentId?: number;
    pageNum?: number;
    pageSize?: number;
  }) {
    return request.get<PageResult<CommentDTO>>('/api/community/comment/list', {
      pageNum: 1,
      pageSize: 20,
      ...params,
    });
  },

  /** 评论点赞 / 取消点赞 */
  likeComment(commentId: number) {
    return request.post<{ liked: boolean; likeCount: number; dislikeCount?: number }>(
      '/api/community/comment/like',
      { commentId }
    );
  },

  /** 评论踩 / 取消踩 */
  dislikeComment(commentId: number) {
    return request.post<{ disliked: boolean; likeCount?: number; dislikeCount: number }>(
      '/api/community/comment/dislike',
      { commentId }
    );
  },
};