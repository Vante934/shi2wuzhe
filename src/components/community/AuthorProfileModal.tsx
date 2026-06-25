import { X } from 'lucide-react';
import type { AuthorProfileVM } from '../../types';

interface AuthorProfileModalProps {
  authorProfile: AuthorProfileVM | null;
  followedAuthors: string[];
  setFollowedAuthors: (updater: (prev: string[]) => string[]) => void;
  onClose: () => void;
  onSelectPost: (post: any) => void;
}

export default function AuthorProfileModal({
  authorProfile,  followedAuthors,  setFollowedAuthors,  onClose,  onSelectPost,
}: AuthorProfileModalProps) {
  if (!authorProfile) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="bg-white rounded-[2.5rem] w-full max-w-[420px] overflow-hidden shadow-2xl relative border border-stone-100 animate-scale-up text-left">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-white/85 hover:bg-white border border-stone-200/50 p-2 rounded-full shadow-sm cursor-pointer transition-colors"
        >
          <X className="w-4 h-4 text-stone-700 font-extrabold" />
        </button>

        <div className="h-28 bg-gradient-to-tr from-[#e3f0d8] via-[#eff7e8] to-[#f4ebe1] p-5 relative">
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent"></div>
        </div>

        <div className="px-5 pb-5 relative z-10 -mt-10">
          <div className="flex items-end justify-between">
            <div className="w-18 h-18 bg-white p-1 rounded-full shadow-md border-4 border-white select-none animate-bounce-subtle overflow-hidden flex items-center justify-center shrink-0">
              {authorProfile.avatar && typeof authorProfile.avatar === 'string' && (authorProfile.avatar.startsWith('blob:') || authorProfile.avatar.startsWith('data:') || authorProfile.avatar.startsWith('http') || authorProfile.avatar.startsWith('/')) ? (
                <img src={authorProfile.avatar} alt="Author avatar" className="w-[102%] h-[102%] object-cover rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-4xl">{authorProfile.avatar}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setFollowedAuthors((prev) =>
                  prev.includes(authorProfile.name)
                    ? prev.filter((a) => a !== authorProfile.name)
                    : [...prev, authorProfile.name]
                );
              }}
              className={`px-5 py-1.5 rounded-full text-[15px] font-black tracking-wider transition-all cursor-pointer ${
                followedAuthors.includes(authorProfile.name)
                  ? 'bg-stone-100 text-stone-400 border border-stone-200'
                  : 'bg-rose-500 hover:bg-rose-600 text-white shadow-md hover:shadow-rose-300/30'
              }`}
            >
              {followedAuthors.includes(authorProfile.name) ? '✓ 已关注' : '关注 TA'}
            </button>
          </div>

          <div className="mt-3.5 space-y-1">
            <h4 className="font-black text-[26px] text-stone-850 flex items-center gap-1.5">
              {authorProfile.name}
              <span className="text-[9px] bg-red-50 text-red-500 border border-red-200/50 px-2 py-0.5 rounded-full font-sans font-black scale-95">博主专栏</span>
            </h4>
            <p className="text-[10px] text-stone-400 font-bold font-sans">
              {authorProfile.bio}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-[#fdfdfd] border border-stone-150 p-2.5 rounded-2xl mt-4 text-center font-mono text-xs shadow-xs">
            <div>
              <span className="text-[13px] text-[#526047] block font-black leading-none">关注</span>
              <span className="text-md font-black text-stone-850 mt-1 block">{authorProfile.following}</span>
            </div>
            <div className="border-l border-stone-200 border-dashed">
              <span className="text-[13px] text-[#526047] block font-black leading-none">粉丝</span>
              <span className="text-md   font-black text-stone-850 mt-1 block">{authorProfile.followers}</span>
            </div>
            <div className="border-l border-stone-200 border-dashed">
              <span className="text-[13px] text-[#526047] block font-black leading-none">获赞与收藏</span>
              <span className="text-md font-black text-rose-500 mt-1 block">{authorProfile.likes}</span>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <span className="text-[13px] font-black text-stone-400 font-mono block uppercase tracking-wider">
              TA的笔记 ({authorProfile.posts?.length || 0})
            </span>

            <div className="max-h-[200px] overflow-y-auto custom-scroll pr-1">
              {(!authorProfile.posts || authorProfile.posts.length === 0) ? (
                <div className="text-[13px] text-stone-300 text-center py-6 font-medium italic border border-dashed rounded-2xl bg-stone-50/50">
                  该博主暂未发布任何公开笔记哦～
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {authorProfile.posts.map((post: any) => (
                    <div
                      key={post.id}
                      onClick={() => onSelectPost(post)}
                      className="bg-white border border-stone-200/90 hover:border-brand-green/40 hover:shadow-sm rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 flex flex-col justify-between group"
                    >
                      <div className="h-20 bg-gradient-to-br from-[#eff7e8]/30 to-stone-50/40 relative flex items-center justify-center border-b border-stone-100 transition-colors group-hover:bg-[#eff7e8]/50">
                        <span className="text-3xl select-none transform group-hover:scale-110 transition-transform duration-300">{post.emoji || '🥘'}</span>
                      </div>
                      <div className="p-2 text-left space-y-1">
                        <h5 className="font-extrabold text-[10px] text-stone-850 line-clamp-2 leading-tight group-hover:text-[#5d7350] transition-colors">{post.title}</h5>
                        <div className="flex items-center justify-between text-[8px] text-stone-400 font-mono pt-1 border-t border-stone-50">
                          <span className="flex items-center gap-0.5 text-stone-500 font-semibold">❤️ {post.likes}</span>
                          <span>💬 {post.comments?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}