import { useRef, useEffect, useState } from 'react';
import { X, Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import type { SocialPost } from '../../types';

interface FloatingHeart {
  id: number;
  left: number;
}

interface PostDetailModalProps {
  post: SocialPost | null;
  followedAuthors: string[];
  floatingHearts: FloatingHeart[];
  currentUserCommentText: string;
  commentReplyText: string;
  activeReplyCommentIdx: number | null;
  commentError: string | null;
  profileUsername: string;

  setSocialPosts: (updater: (prev: SocialPost[]) => SocialPost[]) => void;
  togglePostLike: (post: SocialPost) => void;
  togglePostCollect: (post: SocialPost) => void;
  setChosenPost: (post: SocialPost | null) => void;
  setFollowedAuthors: (updater: (prev: string[]) => string[]) => void;
  setCurrentUserCommentText: (v: string) => void;
  setCommentReplyText: (v: string) => void;
  setActiveReplyCommentIdx: (v: number | null) => void;
  setViewingAuthorProfile: (v: any) => void;
  triggerHeartPop: () => void;
  handleSubmitComment: () => void;
  handleSubmitReply: (idx: number) => void;
  onClose: () => void;
}

const MOCK_COMMENT_AVATARS: Record<string, string> = {
  '小绿': '🥬',
  '食尚小捕快': '👮',
  '若依': '🎒',
  '若依 (我)': '🎒',
  '瘦身小达人': '🏃',
  '懒人食谱君': '🧑‍🍳',
  '冬日火锅狂人': '🍲',
  '厨艺大主宰': '👨‍🍳',
  '美食侦探': '🕵️',
  '吃货小队长': '🍱',
};

const getCommentAvatar = (name: string, fallback?: string) => {
  if (fallback) return fallback;
  return MOCK_COMMENT_AVATARS[name] || '🍽️';
};

const isUrlAvatar = (av: string) =>
  !!av && typeof av === 'string' &&
  (av.startsWith('blob:') || av.startsWith('data:') || av.startsWith('http') || av.startsWith('/'));

export default function PostDetailModal({
  post, followedAuthors, floatingHearts, currentUserCommentText, commentReplyText,
  activeReplyCommentIdx, commentError, profileUsername, setSocialPosts, setChosenPost, togglePostLike, togglePostCollect,
  setFollowedAuthors, setCurrentUserCommentText, setCommentReplyText, setActiveReplyCommentIdx, setViewingAuthorProfile,
  triggerHeartPop, handleSubmitComment, handleSubmitReply, onClose,
}: PostDetailModalProps) {
  if (!post) return null;
  const chosenPost = post;

  /* ⭐ Step 5：多图轮播索引 */
  const allImages: string[] = (chosenPost.images && chosenPost.images.length > 0)
    ? chosenPost.images
    : (chosenPost.image ? [chosenPost.image] : []);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  /* 切换帖子时重置图片索引 */
  useEffect(() => {
    setActiveImageIdx(0);
  }, [chosenPost.id]);

  /* textarea 自动增高 */
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentInputValue = activeReplyCommentIdx !== null ? commentReplyText : currentUserCommentText;
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  }, [currentInputValue]);

  const hasMultiImages = allImages.length > 1;
  const showImage = allImages.length > 0;
  const fallbackEmoji = chosenPost.emoji || (chosenPost as any).coverEmoji || '🥘';

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-[1300px] h-[800px] overflow-hidden grid grid-cols-1 md:grid-cols-[1.3fr_1fr] relative shadow-2xl animate-scale-up text-left border border-stone-100">

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-30 bg-white hover:bg-stone-50 border border-stone-200 p-2 rounded-full shadow-sm cursor-pointer transition-colors"
        >
          <X className="w-5 h-5 text-stone-700" />
        </button>

                {/* ============================================================
            ⭐ 仿小红书左侧图片区
            - 纯黑背景 bg-black
            - object-contain 保持比例完整显示，留黑边
            ============================================================ */}
        <div className="bg-#EAF6D9 relative overflow-hidden select-none flex items-center justify-center">

          {/* 浮动爱心（如果你不需要图片上飘爱心，可以把这段删了） */}
          {floatingHearts.map((heart) => (
            <span
              key={heart.id}
              style={{ left: `${heart.left}%` }}
              className="absolute bottom-16 text-3xl pointer-events-none animate-float-heart z-20"
            >
              ❤️
            </span>
          ))}

          {showImage ? (
            <>
              {/* ⭐ 核心改动：object-contain 完整显示图片 */}
              <img
                src={allImages[activeImageIdx]}
                alt={chosenPost.title}
                className="h-full w-full object-contain select-none"
                referrerPolicy="no-referrer"
              />

              {/* 仿小红书：右上角 1/N 计数（无底色，纯文字加阴影） */}
              {hasMultiImages && (
                <div className="absolute top-5 right-5 z-20 text-black text-[15px] font-black tracking-widest drop-shadow-[0_1px_rgba(0,0,0,0.8)]">
                  {activeImageIdx + 1} / {allImages.length}
                </div>
              )}

              {/* 左右切换按钮（更淡的圆形背景） */}
              {hasMultiImages && activeImageIdx > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveImageIdx((i) => Math.max(0, i - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white/90 flex items-center justify-center cursor-pointer transition-all backdrop-blur-sm"
                  title="上一张"
                >
                  <ChevronLeft className="w-7 h-7 -ml-0.5" />
                </button>
              )}
              {hasMultiImages && activeImageIdx < allImages.length - 1 && (
                <button
                  type="button"
                  onClick={() => setActiveImageIdx((i) => Math.min(allImages.length - 1, i + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white/90 flex items-center justify-center cursor-pointer transition-all backdrop-blur-sm"
                  title="下一张"
                >
                  <ChevronRight className="w-7 h-7 -mr-0.5" />
                </button>
              )}

              {/* 底部圆点指示器 */}
              {hasMultiImages && (
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                  {allImages.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      className={`rounded-full transition-all cursor-pointer shadow-md ${
                        idx === activeImageIdx
                          ? 'w-2 h-2 bg-black scale-110'
                          : 'w-1.5 h-1.5 bg-black/40 hover:bg-black/70'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            /* 无图：黑底大 emoji 居中 */
            <span className="text-9xl select-none drop-shadow-md">{fallbackEmoji}</span>
          )}
        </div>

        {/* ============================================================
            ⭐ Step 5 右侧：整体一个滚动容器（作者+正文+评论一起滚）
            - 滚动条隐藏（scrollbar-hidden）
            - 底部输入框固定不滚（用 flex-col + 滚动区 flex-1 + 输入区 shrink-0）
            ============================================================ */}
        <div className="flex flex-col border-l border-stone-100 bg-[#fbfcfb]/40 min-h-0 overflow-hidden">

          {/* ⭐ 上半整体滚动区：作者 + 正文 + 评论（无滚动条但能滚） */}
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hidden px-5 pt-5 pb-3 space-y-5">

            {/* 作者卡 */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div
                onClick={() => {
                  setViewingAuthorProfile({
                    name: chosenPost.author,
                    avatar: chosenPost.avatar,
                    bio: '元气美食达人(LV4)',
                    followers: '12.8k',
                    following: '186',
                    likes: `${chosenPost.likes + 245} 个赞`,
                    posts: [],
                  });
                }}
                className="flex items-center gap-2.5 cursor-pointer group hover:opacity-90 transition-opacity"
                title="点击查看博主个人主页"
              >
                {isUrlAvatar(chosenPost.avatar) ? (
                  <span className="w-10 h-10 rounded-full overflow-hidden inline-block border bg-white p-0.5 shadow-xs group-hover:border-brand-green/30 transition-colors shrink-0">
                    <img src={chosenPost.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                  </span>
                ) : (
                  <span className="text-2xl bg-white p-1 rounded-full shadow-xs border group-hover:border-brand-green/30 transition-colors">{chosenPost.avatar}</span>
                )}
                <div>
                  <span className="block font-black text-sm text-stone-850 tracking-tight group-hover:text-brand-green-dark transition-colors">{chosenPost.author}</span>
                  <span className="text-[12px] text-stone-400 block font-semibold font-sans">元气美食达人(LV4)</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setFollowedAuthors((prev) =>
                    prev.includes(chosenPost.author)
                      ? prev.filter((a) => a !== chosenPost.author)
                      : [...prev, chosenPost.author]
                  );
                }}
                className={`px-3 py-1.5 rounded-full text-[11px] font-black tracking-wider transition-all cursor-pointer ${
                  followedAuthors.includes(chosenPost.author)
                    ? 'bg-stone-100 text-stone-400 border border-stone-200'
                    : 'bg-rose-500 hover:bg-rose-600 text-white shadow-xs'
                }`}
              >
                {followedAuthors.includes(chosenPost.author) ? '✓ 已关注' : '+ 关注'}
              </button>
            </div>

            {/* 标题 + 正文 */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-[16px] text-stone-850 leading-snug break-words">
                {chosenPost.title}
              </h4>
              <p className="text-[13px] text-stone-500 leading-relaxed font-sans break-words whitespace-pre-wrap">
                {chosenPost.caption || '今天趁着厨房里食材丰富，用我的大炖煮锅一连烹调做出香气腾腾满满好几大碗！低卡均衡少油脂且味道纯粹，全家老小赞不绝口，快来抄作业！'}
              </p>
            </div>

            {/* 评论分隔 */}
            <div className="border-t border-stone-100 pt-3">
              <span className="text-[11px] font-mono text-stone-400 block mb-3 font-bold uppercase tracking-wider">
                评论 ({chosenPost.comments.length})
              </span>

              {/* 评论列表 */}
              <div className="space-y-5">
                {chosenPost.comments.length === 0 ? (
                  <div className="text-[12px] text-stone-300 text-center py-7 font-medium italic">
                    热评区空空如也，快来说说有什么好玩的好听的吧！
                  </div>
                ) : (
                  chosenPost.comments.map((comm: any, idx: number) => {
                    const commAvatar = getCommentAvatar(comm.name, comm.avatar);
                    return (
                      <div key={comm.id || idx} className="flex gap-3 group">
                        <button
                          type="button"
                          onClick={() => {
                            setViewingAuthorProfile({
                              name: comm.name,
                              avatar: commAvatar,
                              bio: '元气美食评论家(LV2)',
                              followers: '326',
                              following: '88',
                              likes: `${comm.likes || 0} 个赞`,
                              posts: [],
                            });
                          }}
                          className="shrink-0 w-9 h-9 rounded-full bg-stone-50 border border-stone-200 hover:border-brand-green/40 transition-all overflow-hidden flex items-center justify-center text-lg cursor-pointer hover:scale-105"
                          title={`查看 ${comm.name} 的主页`}
                        >
                          {isUrlAvatar(commAvatar) ? (
                            <img src={commAvatar} alt={comm.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <span>{commAvatar}</span>
                          )}
                        </button>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setViewingAuthorProfile({
                                  name: comm.name,
                                  avatar: commAvatar,
                                  bio: '元气美食评论家(LV2)',
                                  followers: '326',
                                  following: '88',
                                  likes: `${comm.likes || 0} 个赞`,
                                  posts: [],
                                });
                              }}
                              className="text-[13px] font-bold text-stone-500 hover:text-brand-green-dark transition-colors cursor-pointer"
                            >
                              {comm.name}
                            </button>
                            {comm.name.includes('(我)') && (
                              <span className="bg-[#eff7e8] text-[#5d7350] text-[9px] font-black px-1.5 py-[1px] rounded">
                                本人
                              </span>
                            )}
                          </div>

                          <p className="text-[14px] text-stone-800 font-medium leading-relaxed font-sans break-words whitespace-pre-wrap">
                            {comm.text}
                          </p>

                          <div className="flex items-center gap-4 text-[11px] text-stone-400 font-medium pt-1">
                            <span>{comm.time || '刚刚'}</span>

                            <button
                              type="button"
                              onClick={() => {
                                const updatedComment = { ...comm };
                                if (updatedComment.userLiked) {
                                  updatedComment.likes -= 1;
                                  updatedComment.userLiked = false;
                                } else {
                                  updatedComment.likes += 1;
                                  updatedComment.userLiked = true;
                                  if (updatedComment.userDisliked) {
                                    updatedComment.dislikes -= 1;
                                    updatedComment.userDisliked = false;
                                  }
                                }
                                const updatedPost = { ...chosenPost };
                                updatedPost.comments[idx] = updatedComment;
                                setSocialPosts((prev) => prev.map((p) => p.id === chosenPost.id ? updatedPost : p));
                                setChosenPost(updatedPost);
                              }}
                              className={`flex items-center gap-1 transition-colors cursor-pointer ${comm.userLiked ? 'text-rose-500 font-bold' : 'hover:text-rose-500'}`}
                            >
                              <span>👍</span>
                              <span>{comm.likes || 0}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const updatedComment = { ...comm };
                                if (updatedComment.userDisliked) {
                                  updatedComment.dislikes -= 1;
                                  updatedComment.userDisliked = false;
                                } else {
                                  updatedComment.dislikes += 1;
                                  updatedComment.userDisliked = true;
                                  if (updatedComment.userLiked) {
                                    updatedComment.likes -= 1;
                                    updatedComment.userLiked = false;
                                  }
                                }
                                const updatedPost = { ...chosenPost };
                                updatedPost.comments[idx] = updatedComment;
                                setSocialPosts((prev) => prev.map((p) => p.id === chosenPost.id ? updatedPost : p));
                                setChosenPost(updatedPost);
                              }}
                              className={`flex items-center gap-1 transition-colors cursor-pointer ${comm.userDisliked ? 'text-stone-800 font-bold' : 'hover:text-stone-700'}`}
                            >
                              <span>👎</span>
                              <span>{comm.dislikes || 0}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setActiveReplyCommentIdx(idx);
                                setCommentReplyText('');
                              }}
                              className="hover:text-brand-green-dark transition-colors cursor-pointer"
                            >
                              回复{comm.replies?.length ? ` (${comm.replies.length})` : ''}
                            </button>
                          </div>

                          {comm.replies && comm.replies.length > 0 && (
                            <div className="mt-3 space-y-3">
                              {comm.replies.map((reply: any, rIdx: number) => {
                                const replyAvatar = getCommentAvatar(reply.name, reply.avatar);
                                return (
                                  <div key={rIdx} className="flex gap-2.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setViewingAuthorProfile({
                                          name: reply.name,
                                          avatar: replyAvatar,
                                          bio: '元气美食评论家(LV1)',
                                          followers: '128',
                                          following: '36',
                                          likes: '12 个赞',
                                          posts: [],
                                        });
                                      }}
                                      className="shrink-0 w-7 h-7 rounded-full bg-stone-50 border border-stone-200 hover:border-brand-green/40 overflow-hidden flex items-center justify-center text-sm cursor-pointer hover:scale-105"
                                      title={`查看 ${reply.name} 的主页`}
                                    >
                                      {isUrlAvatar(replyAvatar) ? (
                                        <img src={replyAvatar} alt={reply.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                      ) : (
                                        <span>{replyAvatar}</span>
                                      )}
                                    </button>
                                    <div className="flex-1 min-w-0 space-y-0.5">
                                      <span className="text-[12px] font-bold text-stone-500 block">{reply.name}</span>
                                      <p className="text-[13px] text-stone-800 leading-relaxed font-sans font-medium break-words whitespace-pre-wrap">
                                        {reply.text}
                                      </p>
                                      <span className="text-[10px] text-stone-400 font-medium">{reply.time || '刚刚'}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* ⭐ 下半固定底部：输入框 + 点赞 + 收藏 + 发送 */}
          <div className="px-5 pt-3 pb-4 border-t border-stone-100 shrink-0 relative bg-white">
            {commentError && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-[10px] font-black px-3.5 py-1.5 rounded-full shadow-md z-30 animate-pulse">
                {commentError}
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  placeholder={activeReplyCommentIdx !== null
                    ? `回复 @${chosenPost.comments[activeReplyCommentIdx]?.name || ''}`
                    : '说点什么...'
                  }
                  value={currentInputValue}
                  onChange={(e) => {
                    if (activeReplyCommentIdx !== null) {
                      setCommentReplyText(e.target.value);
                    } else {
                      setCurrentUserCommentText(e.target.value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (activeReplyCommentIdx !== null) {
                        handleSubmitReply(activeReplyCommentIdx);
                      } else {
                        handleSubmitComment();
                      }
                    }
                  }}
                  className="w-full bg-[#f6f8f5] border border-stone-200 focus:bg-white focus:border-brand-green-dark px-4 py-2.5 pr-14 rounded-full text-[13px] font-bold text-stone-750 outline-none transition-all font-sans resize-none leading-snug
                  [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]"
                  style={{ minHeight: '42px', maxHeight: '120px' }}
                />
                {activeReplyCommentIdx !== null && (
                  <button
                    onClick={() => {
                      setActiveReplyCommentIdx(null);
                      setCommentReplyText('');
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-stone-200/70 hover:bg-stone-200 text-stone-500 text-[10px] font-black px-2 py-0.5 rounded cursor-pointer transition-colors"
                  >
                    取消
                  </button>
                )}
              </div>

              <button
                onClick={() => {
                  togglePostLike(chosenPost);
                  triggerHeartPop();
                }}
                className={`shrink-0 h-[42px] px-3 rounded-full border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  chosenPost.isLiked
                    ? 'bg-rose-50 border-rose-200 text-rose-500 scale-105 animate-heart-pop'
                    : 'bg-stone-50 border-stone-200 text-stone-500 hover:text-rose-500 hover:bg-rose-50/25'
                }`}
                title="点赞帖子"
              >
                <Heart className={`w-4 h-4 ${chosenPost.isLiked ? 'fill-current text-rose-500' : ''}`} />
                <span className="text-[12px] font-mono font-black">{chosenPost.likes}</span>
              </button>

              <button
                onClick={() => {
                  togglePostCollect(chosenPost);
                }}
                className={`shrink-0 h-[42px] w-[42px] rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                  chosenPost.isSaved
                    ? 'bg-amber-50 border-amber-200 text-amber-500 scale-105 animate-star-bounce'
                    : 'bg-stone-50 border-stone-200 text-stone-500 hover:text-amber-500'
                }`}
                title="收藏帖子"
              >
                <Star className={`w-4 h-4 ${chosenPost.isSaved ? 'fill-current text-amber-500' : ''}`} />
              </button>

              <button
                onClick={() => {
                  if (activeReplyCommentIdx !== null) {
                    handleSubmitReply(activeReplyCommentIdx);
                  } else {
                    handleSubmitComment();
                  }
                }}
                className="shrink-0 h-[42px] bg-[#8ca779] hover:bg-[#7ba066] active:scale-95 text-white font-black text-[13px] px-5 rounded-full cursor-pointer transition-all shadow-xs"
              >
                发送
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}