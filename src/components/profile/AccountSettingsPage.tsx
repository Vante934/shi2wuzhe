interface AccountSettingsPageProps {
  profileNickname: string;   // ⭐ 改名：原 profileUsername → profileNickname
  profileAccount: string;    // ⭐ 新增：账号（只读）
  profileBio: string;
  profileAvatar: string;

  setProfileNickname: (v: string) => void;   // ⭐ 改名
  setProfileBio: (v: string) => void;
  setProfileAvatar: (v: string) => void;

  onBack: () => void;
  showToast: (msg: string) => void;
  onRequestLogout: () => void;
}

export default function AccountSettingsPage({
  profileNickname,  profileAccount,  profileBio,  profileAvatar,  setProfileNickname,
  setProfileBio,  setProfileAvatar,  onBack,  showToast,  onRequestLogout,
}: AccountSettingsPageProps) {
  const isCustomAvatar =
    profileAvatar &&
    typeof profileAvatar === 'string' &&
    (profileAvatar.startsWith('blob:') ||
      profileAvatar.startsWith('data:') ||
      profileAvatar.startsWith('http'));

  return (
    <div className="flex flex-col flex-1 w-full h-full space-y-4 overflow-y-auto custom-scroll px-2">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-1 px-3 text-base bg-white text-stone-600 rounded-lg hover:bg-brand-yellow font-bold border transition-colors cursor-pointer"
        >
          ← 返回
        </button>
        <span className="text-[28px] font-black text-stone-850">账号设置</span>
        <div className="w-12"></div>
      </div>

      <div className="space-y-4">

        {/* CARD 1: 头像 */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs text-left space-y-3.5">
          <label className="text-sm font-black text-stone-700 block">选择头像标识 或 上传自定义头像</label>
          <div className="flex flex-wrap items-center gap-4 pt-1">

            <div className="flex items-center gap-2 animate-scale-up">
              {['🎒', '👩‍🍳', '👨‍🍳', '🥗', '🍩', '🥑', '🥣'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setProfileAvatar(emoji);
                    showToast('头像标识已更新，记得点击保存！');
                  }}
                  className={`w-18 h-18 rounded-full border-2 text-3xl flex items-center justify-center transition-all cursor-pointer ${
                    profileAvatar === emoji
                      ? 'border-brand-green bg-[#eff7e8] scale-105 shadow-xs'
                      : 'border-stone-200 bg-stone-50 hover:bg-stone-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="h-6 w-[1px] bg-stone-200"></div>

            <div className="flex items-center gap-2.5">
              <label className="bg-stone-100 hover:bg-stone-200 border border-stone-300 text-[18px] font-black text-stone-600 px-3 py-2 rounded-xl cursor-pointer shadow-xs transition-all flex items-center gap-1">
                自定义头像上传
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      const url = URL.createObjectURL(file);
                      setProfileAvatar(url);
                      alert('头像自定义上传成功！已更新到您的个人中心和主页');
                    }
                  }}
                />
              </label>

              {isCustomAvatar && (
                <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-brand-green shadow-xs shrink-0 bg-stone-50">
                  <img src={profileAvatar} alt="Custom upload" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ⭐ CARD 2: 昵称（可改）+ 下方提示账号（只读） */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs text-left space-y-2">
          <label className="text-base font-black text-stone-700 block">账号昵称</label>
          <input
            type="text"
            value={profileNickname}
            onChange={(e) => setProfileNickname(e.target.value)}
            placeholder="如：Vante"
            className="bg-stone-50/50 border rounded-xl p-2.5 text-base w-full text-stone-750 outline-none focus:bg-white focus:border-brand-green font-bold transition-all"
          />
          {/* ⭐ 方案 2：昵称输入框下方小灰字显示账号 */}
          <div className="text-[12px] text-stone-400 font-mono font-semibold pt-1 pl-1">
            账号 <span className="text-stone-600 font-black">@{profileAccount}</span>
            <span className="ml-1 text-stone-400">（注册后不可修改）</span>
          </div>
        </div>

        {/* CARD 3: 签名 */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs text-left space-y-2">
          <label className="text-base font-black text-stone-700 block">个性签名</label>
          <textarea
            rows={2}
            value={profileBio}
            onChange={(e) => setProfileBio(e.target.value)}
            placeholder="编写一句话，展示您的烹饪美学与态度吧..."
            className="bg-stone-50/50 border rounded-2xl p-3 text-base w-full text-stone-750 outline-none focus:bg-white focus:border-brand-green font-semibold transition-all resize-none"
          />
        </div>

        {/* ⭐ 删除：原 CARD 4 第三方账号绑定整块（含手机号/微信/B站） */}

        <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => showToast('资料保存成功！基本信息已更新')}
            className="bg-brand-green hover:bg-brand-green-dark text-white font-extrabold text-base py-3 px-8 rounded-full cursor-pointer shadow-md transition-all active:scale-95 flex items-center gap-1"
          >
            保存修改
          </button>

          <button
            type="button"
            onClick={onRequestLogout}
            className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-extrabold text-base py-3 px-8 rounded-full cursor-pointer shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
          >
            退出登录
          </button>
        </div>

      </div>
    </div>
  );
}