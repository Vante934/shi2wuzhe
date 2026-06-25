import { Sparkles, Heart, Star, MessageSquare, Plus, Home, Search, RotateCw, X } from 'lucide-react';
import type { SocialPost } from '../../types';

interface CommunityPageProps {
  socialPosts: SocialPost[];
  filteredSocialPosts: SocialPost[];
  forbiddenFoodsSelected: string[];
  followedAuthors: string[];
  profileUsername: string;
  profileAvatar: string;
  profileBio: string;
  activeSidebarFilter: 'all' | 'liked' | 'saved' | 'comments';
  setActiveSidebarFilter: (f: 'all' | 'liked' | 'saved' | 'comments') => void;
  communityFeedTab: 'discover' | 'following';
  setCommunityFeedTab: (t: 'discover' | 'following') => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  setSocialPosts: (updater: (prev: SocialPost[]) => SocialPost[]) => void;
  setChosenPost: (post: SocialPost | null) => void;
  setViewingAuthorProfile: (v: any) => void;
  showToast: (msg: string) => void;
  togglePostLike: (post: SocialPost) => void;
  refreshPostList?: () => void;
  loadMorePosts?: () => void;     // ⭐ 新增
  loadingMore?: boolean;          // ⭐ 新增
  onOpenPublishPage: () => void;
}

export default function CommunityPage({
  socialPosts, filteredSocialPosts, forbiddenFoodsSelected, followedAuthors, profileUsername,
  profileAvatar, profileBio, activeSidebarFilter, setActiveSidebarFilter, communityFeedTab,
  setCommunityFeedTab, searchQuery, setSearchQuery, setSocialPosts, setChosenPost,
  setViewingAuthorProfile, showToast, onOpenPublishPage,togglePostLike, refreshPostList,
  loadMorePosts, loadingMore,    // ⭐ 新增
}: CommunityPageProps) {

  const isCustomAvatar = (av: string) =>
    av && typeof av === 'string' &&
    (av.startsWith('blob:') || av.startsWith('data:') || av.startsWith('http') || av.startsWith('/'));

  const matchesForbidden = searchQuery && forbiddenFoodsSelected.some((forbidden) =>
    forbidden.toLowerCase().includes(searchQuery.toLowerCase()) ||
    searchQuery.toLowerCase().includes(forbidden.toLowerCase())
  );

  /* ============================================================
     【改动3】空状态文案：按当前 sidebar filter 和搜索状态返回不同文案
     - 搜索时：没找到搜索结果
     - 我的点赞：暂无点赞
     - 收藏清单：暂无收藏
     - 首页：暂无内容
     ============================================================ */
  const getEmptyText = () => {
    if (searchQuery.trim()) {
      return '没有找到社区分享贴，快去发布第一篇相关的美味打卡吧';
    }
    if (activeSidebarFilter === 'liked') return '暂无点赞，快去给喜欢的帖子点个赞吧！';
    if (activeSidebarFilter === 'saved') return '暂无收藏，快去收藏喜欢的内容吧！';
    return '暂无内容，快去发布第一篇美味打卡吧';
  };

  return (
    <div className="flex w-full overflow-hidden" style={{ height: 'calc(100vh - 100px)' }}>

      {/* 左侧栏 */}
      <div className="w-[340px] bg-white/40  backdrop-blur-sm p-7 pt-10 flex flex-col justify-between rounded-2xl items-center shrink-0 -ml-4 -my-6 mr-4">
        <div className="w-full text-center  space-y-4 font-sans pb-3 flex-1">

          <div className="flex flex-col items-center pt-2">
            <div className="w-25 h-25 rounded-full bg-brand-green/10 text-[#8ba779] flex items-center justify-center text-3xl font-bold border shadow-inner overflow-hidden shrink-0">
              {isCustomAvatar(profileAvatar) ? (
                <img src={profileAvatar} alt="My avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                profileAvatar
              )}
            </div>
            <span className="text-[23px] font-black text-stone-850 mt-5 block font-sans">{profileUsername}</span>
            <p className="text-[15px] text-[#86927e] font-medium leading-normal italic m3-2 mx-1 line-clamp-2 font-sans">
              {profileBio}
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full text-left pt-2 font-sans">
            <button
              type="button"
              onClick={() => {
                setActiveSidebarFilter('all');
                setSearchQuery('');
              }}
              className={`w-full text-left text-[20px] p-3 rounded-xl font-black flex items-center gap-2.5 transition-all duration-200 cursor-pointer ${
                activeSidebarFilter === 'all'
                  ? 'bg-[#8ca779] text-white scale-102 shadow-md'
                  : 'text-stone-500 hover:bg-[#eff7e8]/45'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span>首页发现</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSidebarFilter('liked')}
              className={`w-full text-left text-[20px] p-3 rounded-xl font-black flex items-center gap-2.5 transition-all duration-200 cursor-pointer ${
                activeSidebarFilter === 'liked'
                  ? 'bg-[#8ca779] text-white scale-102 shadow-md'
                  : 'text-stone-500 hover:bg-[#eff7e8]/45'
              }`}
            >
              <Heart className="w-5 h-5" />
              <span>我的点赞</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSidebarFilter('saved')}
              className={`w-full text-left text-[20px] p-3 rounded-xl font-black flex items-center gap-2.5 transition-all duration-200 cursor-pointer ${
                activeSidebarFilter === 'saved'
                  ? 'bg-[#8ca779] text-white scale-102 shadow-md'
                  : 'text-stone-500 hover:bg-[#eff7e8]/45'
              }`}
            >
              <Star className="w-5 h-5" />
              <span>收藏清单</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSidebarFilter('comments')}
              className={`w-full text-left text-[20px] p-3 rounded-xl font-black flex items-center gap-2.5 transition-all duration-200 cursor-pointer ${
                activeSidebarFilter === 'comments'
                  ? 'bg-[#8ca779] text-white scale-102 shadow-md'
                  : 'text-stone-500 hover:bg-[#eff7e8]/45'
              }`}
            >
              <MessageSquare className="w-5 h-5 text-[#cbd8c5] fill-stone-50" />
              <span>评论回复</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenPublishPage}
          className="bg-brand-green hover:bg-[#8ba779] text-white w-14 h-14 rounded-full shadow-md flex items-center justify-center transition-transform active:scale-95 cursor-pointer mb-2"
          title="发布新帖"
        >
          <Plus className="w-7 h-7 font-black" />
        </button>
      </div>

      {/* 右侧内容区 */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {activeSidebarFilter === 'comments' ? (
          <MyCommentsView
            socialPosts={socialPosts}
            profileUsername={profileUsername}
            setActiveSidebarFilter={setActiveSidebarFilter}
            setChosenPost={setChosenPost}
            showToast={showToast}
          />
        ) : (
          <>
            {/* ============ 顶部搜索栏 + 清除键 ============ */}
            <div className="flex items-center justify-between w-full max-w-[900px] mx-auto gap-3 mb-5 shrink-0 select-none">
              <button
                onClick={() => {
                  setActiveSidebarFilter('all');
                  setSearchQuery('');
                  setChosenPost(null);
                }}
                className="w-12 h-12 rounded-full flex items-center justify-center border border-stone-200 bg-white hover:bg-[#eff7e8] hover:text-brand-green text-stone-500 transition-all duration-200 shadow-xs cursor-pointer active:scale-95 shrink-0"
                title="回到首页"
              >
                <Home className="w-5 h-5 text-stone-600" />
              </button>

              {/* ============ 改动1：搜索框 + 清除键 ============ */}
              <div className="relative flex-1 border border-stone-200 rounded-full bg-white shadow-xs focus-within:ring-2 focus-within:ring-[#8ca779]/50 transition-all duration-200">
                <input
                  type="text"
                  placeholder="在社区搜索你的热爱"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (!searchQuery.trim()) {
                        showToast('请输入作者名字或关键词！');
                        return;
                      }
                      showToast(`已为您筛选[${searchQuery}]相关的讨论灵感！`);
                    }
                  }}
                  /* pr-12 改成 pr-14 让出清除键的空间 */
                  className="w-full bg-white border border-stone-200 pl-12 pr-14 py-3.5 rounded-full text-[15px] outline-none font-bold transition-all focus:bg-white focus:border-[#8ca779] shadow-xs"
                />
                <Search className="w-5 h-5 text-stone-400 absolute left-4 top-3.5 pointer-events-none" />

                {/* ===== 清除键：仅有内容时显示 ===== */}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-700 transition-all cursor-pointer"
                    title="清除搜索"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                onClick={() => {
                  if (refreshPostList) refreshPostList();
                  showToast('已刷新');
                }}
                className="w-12 h-12 rounded-full flex items-center justify-center border border-stone-200 bg-white hover:bg-[#eff7e8] hover:text-brand-green text-stone-500 transition-all duration-200 shadow-xs cursor-pointer active:scale-95 active:rotate-180 duration-500 shrink-0"
                title="换一批帖子"
              >
                <RotateCw className="w-5 h-5 text-stone-600" />
              </button>
            </div>

            {/* 关注/发现 Tab */}
            <div className="flex gap-5 justify-center items-center w-full mb-5 select-none shrink-0">
              <button
                type="button"
                onClick={() => {
                  setCommunityFeedTab('following');
                  if (followedAuthors.length === 0) {
                    showToast('您尚未关注任何食友，默认显示您自己发布的美味帖子哦！');
                  } else {
                    showToast('关注的人');
                  }
                }}
                className={`px-6 py-2 text-[15px] font-sans font-black tracking-wide rounded-full border transition-all duration-300 relative cursor-pointer ${
                  communityFeedTab === 'following'
                    ? 'bg-[#8ca779] text-white border-brand-green/10 shadow-xs'
                    : 'bg-white text-stone-500 border-stone-200/50 hover:bg-stone-100 hover:text-stone-850'
                }`}
              >
                关注
              </button>

              <button
                type="button"
                onClick={() => {
                  setCommunityFeedTab('discover');
                  showToast('回到首页');
                }}
                className={`px-6 py-2 text-[15px] font-sans font-black tracking-wide rounded-full border transition-all duration-300 relative cursor-pointer ${
                  communityFeedTab === 'discover'
                    ? 'bg-[#8ca779] text-white border-brand-green/10 shadow-xs'
                    : 'bg-white text-stone-500 border-stone-200/50 hover:bg-stone-100 hover:text-stone-850'
                }`}
              >
                发现
              </button>
            </div>

            {matchesForbidden && (
              <div className="bg-red-50 border border-red-200 text-red-800 text-[12px] p-3 rounded-2xl font-bold flex items-center gap-2 mb-4 select-none animate-fade-in text-left shrink-0">
                <span>识食物者提示：您在个人中心设置了忌口"{forbiddenFoodsSelected.find((f) => f.toLowerCase().includes(searchQuery.toLowerCase()) || searchQuery.toLowerCase().includes(f.toLowerCase()))}"，此类食材的作品动态已过滤</span>
              </div>
            )}

            {/* 帖子瀑布流 */}
            {/* ⭐ Step 4 帖子瀑布流（小红书风格）
                - 容器独立滚动（左栏不动）
                - 卡片高度自适应：图片按比例撑开 / 无图固定 200px + emoji */}
              <div
              className="flex-1 min-h-0 overflow-y-auto scrollbar-hidden pr-2"
              onScroll={(e) => {
                const el = e.currentTarget;
                if (el.scrollHeight - el.scrollTop - el.clientHeight < 400) {
                  loadMorePosts?.();
                }
              }}
            >
              {filteredSocialPosts.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center select-none">
                  <p className="text-base text-stone-400 font-bold px-6 leading-relaxed text-center">
                    {getEmptyText()}
                  </p>
                </div>
              ) : (
                <div className="columns-4 gap-4 text-left">
                  {filteredSocialPosts.map((post) => {
                    const hasImage = !!post.image;
                    const customEmoji = post.emoji || (post as any).coverEmoji;
                    const fallbackEmoji = customEmoji || '🥘';

                    return (
                      <div
                        key={post.id}
                        onClick={() => setChosenPost(post)}
                        className="break-inside-avoid bg-white border border-stone-200 rounded-2xl overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col group shadow-sm font-sans mb-4"
                      >
                        {/* 封面区 */}
                        {hasImage ? (
                          <div className="w-full bg-stone-50 overflow-hidden border-b">
                            <img
                              src={post.image}
                              alt={post.title}
                              className="w-full h-auto block transition-transform duration-300 group-hover:scale-105"
                              referrerPolicy="no-referrer"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-[200px] bg-gradient-to-br from-[#eff7e8]/40 to-[#f6f8f5]/50 group-hover:from-[#f3f9ee]/70 flex items-center justify-center border-b transition-colors">
                            <span className="text-7xl group-hover:scale-110 transition-transform duration-300 drop-shadow-sm select-none">
                              {fallbackEmoji}
                            </span>
                          </div>
                        )}

                        {/* 文字区 */}
                        <div className="p-3.5 space-y-2 text-left font-sans">
                          <h4 className="text-[13px] font-extrabold text-stone-850 leading-snug group-hover:text-[#5d7350] transition-colors">
                            {post.title}
                          </h4>

                          <div className="flex items-center justify-between text-[10px] text-stone-400 border-t border-dashed border-stone-100 pt-2 shrink-0 font-sans">
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingAuthorProfile({
                                  name: post.author,
                                  avatar: post.avatar,
                                  bio: '元气美食达人(LV4)',
                                  followers: '12.8k',
                                  following: '186',
                                  likes: `${post.likes + 152} 个赞`,
                                  posts: socialPosts.filter((p) => p.author === post.author),
                                });
                              }}
                              className="flex items-center gap-1.5 font-bold text-stone-700 hover:text-brand-green transition-colors cursor-pointer min-w-0"
                              title="点击查看博主个人主页"
                            >
                              {isCustomAvatar(post.avatar) ? (
                                <span className="w-5 h-5 rounded-full overflow-hidden inline-block border border-stone-200 shrink-0 bg-stone-50">
                                  <img src={post.avatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                </span>
                              ) : (
                                <span className="text-sm">{post.avatar}</span>
                              )}
                              <span className="truncate max-w-[80px] font-sans font-bold text-stone-700">{post.author}</span>
                            </span>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePostLike(post);
                              }}
                              className={`flex items-center gap-1 font-bold transition-all font-sans shrink-0 ${
                                post.isLiked ? 'text-red-500 scale-105 font-black animate-heart-pop' : 'hover:text-red-500 text-stone-400'
                              }`}
                            >
                              <Heart className={`w-3.5 h-3.5 font-sans ${post.isLiked ? 'fill-current text-red-500' : 'text-stone-300'}`} />
                              <span>{post.likes}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}              
              {/* ⭐ 底部加载提示 */}
              {filteredSocialPosts.length > 0 && (
                <div className="text-center py-6 text-stone-400 text-[13px] font-medium select-none">
                  {loadingMore ? '加载中...' : '继续往下滑还有更多 ↓'}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

          // ============================================================
          // 子组件：我的评论视图
          // ============================================================
          interface MyCommentsViewProps {
            socialPosts: SocialPost[];
            profileUsername: string;
            setActiveSidebarFilter: (f: 'all' | 'liked' | 'saved' | 'comments') => void;
            setChosenPost: (post: SocialPost | null) => void;
            showToast: (msg: string) => void;
          }

          function MyCommentsView({
            socialPosts,
            profileUsername,
            setActiveSidebarFilter,
            setChosenPost,
            showToast,
          }: MyCommentsViewProps) {

            const myCommentsList = socialPosts.flatMap((post) =>
              post.comments
                .filter((c) => c.name === profileUsername || c.name.includes('(我)'))
                .map((c) => ({ post, comment: c }))
            );

            const repliesList = socialPosts.flatMap((post) =>
              post.comments
                .filter((c) => c.name === profileUsername || c.name.includes('(我)'))
                .flatMap((c) =>
                  ((c as any).replies || [])
                    .filter((r: any) => r.name !== profileUsername && !r.name.includes('(我)'))
                    .map((r: any) => ({ post, comment: c, reply: r }))
                )
            );

            return (
              <div className="w-full h-full flex flex-col space-y-4 animate-fade-in text-left overflow-hidden">

                <div className="flex items-center w-full gap-2 mb-2 shrink-0 select-none">
                  <button
                    onClick={() => {
                      setActiveSidebarFilter('all');
                      showToast('返回主页');
                    }}
                    className="px-4 py-1.5 rounded-full flex items-center gap-1.5 border border-stone-200 bg-white hover:bg-[#eff7e8] hover:text-brand-green 
                    text-stone-500 text-[12px] font-bold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
                    title="回到社区初始页"
                  >
                    <Home className="w-3.5 h-3.5 text-stone-600" />
                    <span>返回主页</span>
                  </button>
                </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-10 relative pt-1.5 overflow-hidden px-4">

        <div className="space-y-3.5 overflow-y-auto custom-scroll pr-2 min-h-0">
          <div className="flex items-center gap-1.5 border-b border-stone-100 pb-2 mb-3 select-none shrink-0">
            <span className="text-[22px] font-black text-stone-800 font-sans bg-[#eff7e8]/60 px-2.5 py-0.5 rounded-full">
              我的评论 ({myCommentsList.length})
            </span>
          </div>

          <div className="space-y-3">
            {myCommentsList.length === 0 ? (
              <div className="text-[18px] text-stone-300 text-center py-20 italic font-sans font-medium">
                暂无发表过的评论，快去留下您对美食的真知灼见吧！
              </div>
            ) : (
              myCommentsList.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setChosenPost(item.post);
                    showToast(`已跳转至[${item.post.title}]详情`);
                  }}
                  className="bg-white p-6 rounded-2xl border border-stone-150 hover:border-[#8ca779]/45 hover:bg-[#eff7e8]/10 transition-all cursor-pointer 
                  flex gap-5 group text-left items-start justify-between shadow-3xs hover:shadow-xs"
                >
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex items-center gap-1.5 text-[15px] text-stone-400 font-bold">
                      <span className="w-7 h-4 rounded-full bg-[#8ca779] text-white text-[9px] flex items-center justify-center border font-black scale-95 select-none">我</span>
                      <span className="text-[#5d7350] truncate max-w-[150px] font-sans">《{item.post.title}》</span>
                      <span className="font-mono">{item.comment.time || '刚刚'}</span>
                    </div>

                    <p className="text-[16px] text-stone-750 font-bold leading-relaxed font-sans break-words whitespace-pre-wrap">
                      {item.comment.text}
                    </p>

                    <div className="flex items-center gap-2 text-[13px] text-stone-400 font-sans border-t border-dashed border-stone-150 pt-1.5 ">
                      <span> 已获赞 {item.comment.likes || 0}</span>
                      <span>·</span>
                      <span className="text-[#5d7350] group-hover:underline font-extrabold">查看详情 →</span>
                    </div>
                  </div>

                  <div className="w-12 h-12 bg-stone-100 border border-stone-200/60 rounded-xl overflow-hidden flex flex-col items-center 
                  justify-center relative shrink-0 shadow-3xs group-hover:scale-102 transition-transform select-none">
                    {item.post.image ? (
                      <img src={item.post.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="Original Post Cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-amber-50">
                        <span className="text-xl drop-shadow-xs select-none">{item.post.emoji || (item.post as any).coverEmoji || '🥘'}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="hidden md:block absolute top-[10px] bottom-[10px] left-1/2 w-px bg-stone-400 -translate-x-1/2 select-none pointer-events-none"></div>

        <div className="space-y-3.5 overflow-y-auto custom-scroll pl-2 border-t md:border-t-0 md:pt-0 pt-4 border-stone-100 min-h-0">
          <div className="flex items-center gap-1.5 border-b border-stone-100 pb-2 mb-3 select-none shrink-0">
            <span className="text-[22px] font-black text-stone-800 font-sans bg-[#eff7e8]/60 px-2.5 py-0.5 rounded-full">
              回复我的 ({repliesList.length})
            </span>
          </div>

          <div className="space-y-3">
            {repliesList.length === 0 ? (
              <div className="text-[18px] text-stone-300 text-center py-20 italic font-medium font-sans">
                暂无评论回复，快去讨论吧！
              </div>
            ) : (
              repliesList.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setChosenPost(item.post);
                    showToast(`已跳转至[${item.reply.name}]详情`);
                  }}
                  className="bg-white p-6 rounded-2xl border border-stone-150 hover:border-[#8ca779] hover:bg-[#eff7e8]/10 transition-all cursor-pointer 
                  space-y-2 group text-left shadow-3xs hover:shadow-xs"
                >
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <div className="flex items-center gap-1">
                      <span className="text-brand-green-dark font-black">{item.reply.name}</span>
                      <span className="text-stone-450 font-medium">回复了你</span>
                    </div>
                    <span className="text-[9px] text-stone-400 font-mono">{item.reply.time || '刚刚'}</span>
                  </div>

                  <p className="text-[11px] text-stone-400 leading-relaxed bg-stone-50/80 p-2 rounded-xl italic font-sans break-words whitespace-pre-wrap">
                    我的评论: "{item.comment.text}"
                  </p>

                  <p className="text-[12px] text-stone-850 font-extrabold leading-relaxed pl-2 border-l-2 border-[#8ca779] break-words whitespace-pre-wrap">
                    {item.reply.text}
                  </p>

                  <div className="text-[9px] text-[#5d7350] font-black text-right pt-0.5 group-hover:underline">
                    查看详情 →
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}