import { BookOpen, Settings, BarChart3, ClipboardList, UserCheck, ChevronRight } from 'lucide-react';
import { getLevelByCookingCount } from '../../utils/levelHelper';

interface ProfileMainPageProps {
  profileNickname: string;   // ⭐ 改名：原 profileUsername → profileNickname（昵称）
  profileAccount: string;    // ⭐ 新增：账号（注册时定，只读）
  profileBio: string;
  profileAvatar: string;
  cookingLogsCount: number;
  myOriginalRecipesCount: number;
  starredRecipesCount: number;
  myDraftPostsCount: number;
  likeAndCollectCount?: number;
  followingCount?: number;
  followerCount?: number;

  onGoRecipes: () => void;
  onGoPreferences: () => void;
  onGoStatistics: () => void;
  onGoCookingLogs: () => void;
  onGoAccountSettings: () => void;
  isGuest?: boolean;
  onShowLogin?: () => void;
}

export default function ProfileMainPage({
  profileNickname,  profileAccount,  profileBio,  profileAvatar,  cookingLogsCount,  myOriginalRecipesCount,
  starredRecipesCount,  myDraftPostsCount,  onGoRecipes,  onGoPreferences,  onGoStatistics,
  onGoCookingLogs,  onGoAccountSettings, isGuest = false, onShowLogin,
  likeAndCollectCount = 0, followingCount = 0, followerCount = 0,
}: ProfileMainPageProps) {

    // ⭐ 根据烹饪数计算等级（与 CookingLogsPage 保持一致）
  const levelInfo = getLevelByCookingCount(cookingLogsCount);
  const isCustomAvatar =
    profileAvatar &&
    typeof profileAvatar === 'string' &&
    (profileAvatar.startsWith('blob:') ||
      profileAvatar.startsWith('data:') ||
      profileAvatar.startsWith('http') ||
      profileAvatar.startsWith('/'));

  return (
    <div className="flex flex-col flex-1 h-full w-full space-y-6 animate-fade-in overflow-y-auto custom-scroll px-4">

      {/* Hero Card */}
      <div className="rounded-3xl p-8 flex flex-col items-center gap-5 text-center relative select-none shrink-0">
        <div className="flex flex-col items-center gap-4 w-full text-center">
          <div className="w-[160px] h-[160px] rounded-full bg-white/60 backdrop-blur-sm text-brand-green border-4 border-white/80 flex items-center justify-center shrink-0 shadow-md overflow-hidden select-none animate-scale-up">
            {isCustomAvatar ? (
              <img src={profileAvatar} alt="My avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-6xl">{profileAvatar}</span>
            )}
          </div>

          <div className="space-y-2 w-full text-center">
            {/* ⭐ 改：显示昵称（大字）+ LV徽章 */}
            <div className="flex items-center gap-2.5 justify-center">
              <span className="text-3xl font-black text-stone-850 font-sans tracking-tight">{profileNickname}</span>
              {isGuest ? (
                <span className="bg-stone-400/80 text-white text-[11px] font-black px-2.5 py-1 rounded-full inline-block">
                  游客身份
                </span>
              ) : (
                <span className="bg-[#8ca779]/90 text-white text-[11px] font-black px-2.5 py-1 rounded-full inline-block">
                  LV{levelInfo.lv} {levelInfo.shortName}
                </span>
              )}
            </div>

            {/* ⭐ 新增：账号 @xxx 小字（昵称下方） */}
            <div className="text-[13px] text-stone-400 font-mono font-semibold tracking-wide">
              @{profileAccount}
            </div>
              {/* ⭐ 新增：游客提示 */}
              {isGuest && (
                <div className="flex flex-col items-center gap-2 mb-1">
                  <p className="text-[13px] text-stone-400 font-medium">
                    🔒 以游客身份浏览中，收藏、互动等功能需要登录
                  </p>
                  <button
                    onClick={onShowLogin}
                    className="bg-[#8caf77] hover:bg-[#9bbe85] text-white font-black text-sm py-2 px-6 rounded-full shadow transition-all active:scale-95 cursor-pointer"
                  >
                    立即登录 / 注册
                  </button>
                </div>
              )}
            {/* ⭐ 游客不显示个性签名 */}
            {!isGuest && (
              <p className="text-[16px] text-stone-600 leading-relaxed font-sans font-medium line-clamp-2 max-w-[600px] mx-auto text-center">
                {profileBio}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 text-[13px] text-stone-600 font-sans border-t border-stone-600/30 pt-5 w-full max-w-[800px]">
        <span><strong className="text-stone-850 text-xl font-black">{isGuest ? 0 : likeAndCollectCount}</strong> 获赞与收藏</span>
        <span className="text-stone-300">|</span>
        <span><strong className="text-stone-850 text-xl font-black">{isGuest ? 0 : followingCount}</strong> 关注</span>
        <span className="text-stone-300">|</span>
        <span><strong className="text-stone-850 text-xl font-black">{isGuest ? 0 : followerCount}</strong> 粉丝</span>
        <span><strong className="text-[#5d7350] text-xl font-black">{cookingLogsCount}</strong> 烹饪记录</span>
      </div>
      </div>

      {/* 菜单列表区 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 text-left flex-1 content-start">
        
        <button
          onClick={onGoRecipes}
          className="w-full flex items-center justify-between p-5 bg-white hover:bg-[#fcfdfb] border border-stone-200/80 hover:border-[#8ca779]/45 rounded-2xl shadow-xs transition-all duration-200 outline-none cursor-pointer group hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="text-base font-extrabold text-stone-750 flex items-center gap-4">
            <span className="bg-[#eff7e8]/80 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5 text-[#8ca779]" />
            </span>
            <span>我的食谱</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-stone-400 font-medium font-sans">
              原创  | 收藏  | 草稿 
            </span>
            <ChevronRight className="w-5 h-5 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        <button
          onClick={onGoPreferences}
          className="w-full flex items-center justify-between p-5 bg-white hover:bg-[#fcfdfb] border border-stone-200/80 hover:border-[#8ca779]/45 rounded-2xl shadow-xs transition-all duration-200 outline-none cursor-pointer group hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="text-base font-extrabold text-stone-750 flex items-center gap-4">
            <span className="bg-[#eff7e8]/80 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <Settings className="w-5 h-5 text-[#8caf77]" />
            </span>
            <span>偏好设置</span>
          </span>
          <div className="flex items-center gap-1">
            <span className="text-[12px] text-stone-400 font-medium">口味 | 忌口 | 过敏原</span>
            <ChevronRight className="w-5 h-5 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        <button
          onClick={onGoStatistics}
          className="w-full flex items-center justify-between p-5 bg-white hover:bg-[#fcfdfb] border border-stone-200/80 hover:border-[#8ca779]/45 rounded-2xl shadow-xs transition-all duration-200 outline-none cursor-pointer group hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="text-base font-extrabold text-stone-750 flex items-center gap-4">
            <span className="bg-amber-50 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <BarChart3 className="w-5 h-5 text-[#edd96a]" />
            </span>
            <span>数据统计</span>
          </span>
          <div className="flex items-center gap-1">
            <span className="text-[12px] text-stone-400 font-medium">今日 | 本周摄入分析</span>
            <ChevronRight className="w-5 h-5 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        <button
          onClick={onGoCookingLogs}
          className="w-full flex items-center justify-between p-5 bg-white hover:bg-[#fcfdfb] border border-stone-200/80 hover:border-[#8ca779]/45 rounded-2xl shadow-xs transition-all duration-200 outline-none cursor-pointer group hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="text-base font-extrabold text-stone-750 flex items-center gap-4">
            <span className="bg-orange-50 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <ClipboardList className="w-5 h-5 text-orange-400" />
            </span>
            <span>烹饪记录</span>
          </span>
          <div className="flex items-center gap-1">
            <span className="text-[12px] text-stone-400 font-medium">记录 | 日志</span>
            <ChevronRight className="w-5 h-5 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* ⭐ 删除"绑定"字样，因为已经不做第三方绑定 */}
        <button
          onClick={onGoAccountSettings}
          className="w-full md:col-span-2 flex items-center justify-between p-5 bg-white hover:bg-[#fcfdfb] border border-stone-200/80 hover:border-[#8ca779]/45 rounded-2xl shadow-xs transition-all duration-200 outline-none cursor-pointer group hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="text-base font-extrabold text-stone-750 flex items-center gap-4">
            <span className="bg-blue-50 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5 text-blue-400" />
            </span>
            <span>账号设置</span>
          </span>
          <div className="flex items-center gap-1">
            <span className="text-[12px] text-stone-400 font-medium">个人信息 | 退出登录</span>
            <ChevronRight className="w-5 h-5 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      </div>
    </div>
  );
}