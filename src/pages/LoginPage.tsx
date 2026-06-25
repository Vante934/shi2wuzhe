import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Soup,   Lock,   User,   ShieldAlert,   RefreshCw,   Sparkles,   ChevronRight,   Utensils,   Smile
} from 'lucide-react';
import { authApi } from '../api';
import { generateRandomProfile } from '../utils/randomProfile';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onGoGuest: () => void;
  // ⭐ 弹窗模式：去掉外围装饰（背景渐变、浮动表情、外卡片）
  isModalMode?: boolean;
}

export default function LoginPage({ onLoginSuccess, onGoGuest, isModalMode = false }: LoginPageProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');

  const [captchaImg, setCaptchaImg] = useState('');
  const [captchaUuid, setCaptchaUuid] = useState('');
  const [isCaptchaLoading, setIsCaptchaLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRefreshCaptcha = useCallback(async () => {
    try {
      setIsCaptchaLoading(true);
      const res = await authApi.getCaptcha();
      if (res.captchaEnabled) {
        setCaptchaImg(res.img);
        setCaptchaUuid(res.uuid);
      }
    } catch (err: any) {
      setErrorMessage('获取图形验证码失败，请刷新重试 ');
    } finally {
      setIsCaptchaLoading(false);
    }
  }, []);

  useEffect(() => {
    handleRefreshCaptcha();
  }, [handleRefreshCaptcha]);

  const handleTabChange = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setErrorMessage(null);
    setSuccessMessage(null);
    setCaptchaCode('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    handleRefreshCaptcha();
  };

  const handleSubmit = async () => {
    if (isLoading) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    const trimmedCode = captchaCode.trim();

    const credentialsRegex = /^[A-Za-z0-9]{1,13}$/;

    if (!trimmedUsername) {
      setErrorMessage('请填写账号名称');
      return;
    }
    if (!credentialsRegex.test(trimmedUsername)) {
      setErrorMessage('账号格式不正确（必须为 1-13 位英文字母或数字）');
      return;
    }

    if (!trimmedPassword) {
      setErrorMessage('请填写密码 ');
      return;
    }
    if (!credentialsRegex.test(trimmedPassword)) {
      setErrorMessage('密码格式不正确（必须为 1-13 位英文字母或数字）');
      return;
    }

    if (activeTab === 'register') {
      if (!confirmPassword) {
        setErrorMessage('请再次输入密码确认 ');
        return;
      }
      if (trimmedPassword !== confirmPassword.trim()) {
        setErrorMessage('两次输入的密码不一致，请核对后再试 ');
        return;
      }
    }

    if (!trimmedCode) {
      setErrorMessage('请填写右侧图形验证码 ');
      return;
    }

    setIsLoading(true);

    try {
      if (activeTab === 'login') {
        await authApi.login({
          username: trimmedUsername,
          password: trimmedPassword,
          code: trimmedCode,
          uuid: captchaUuid,
        });
        onLoginSuccess();
        } else {
          // 注册时附带随机昵称/头像/签名
          const profile = generateRandomProfile();
          await authApi.register({
            username: trimmedUsername,
            password: trimmedPassword,
            code: trimmedCode,
            uuid: captchaUuid,
            nickName: profile.nickName,
            avatar: profile.avatar,
            remark: profile.bio,
          });
          
          // 注册成功：切到登录 tab，自动填好账号密码，刷新验证码
          setActiveTab('login');
          setCaptchaCode('');
          setConfirmPassword('');
          await handleRefreshCaptcha();
          setErrorMessage(null);
          // 用一个绿色成功提示（复用 errorMessage 显示，但加 ✅ 表示成功）
          setSuccessMessage(` 注册成功！默认昵称：「${profile.nickName}」请输入验证码完成登录。`);
        }
    } catch (err: any) {
      setErrorMessage(err.message || '网络连接超时，请稍后重试');
      handleRefreshCaptcha();
      setCaptchaCode('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

    // ⭐ 弹窗模式下：不要外层全屏背景、不要浮动表情、不要外卡片
  const wrapperClass = isModalMode
    ? 'w-full p-8 md:p-10 relative select-none'
    : 'min-h-screen w-full flex items-center justify-center bg-radial from-[#eff5ec] via-[#f7faf5] to-[#e4eedf] p-4 relative overflow-hidden select-none';

  const innerCardClass = isModalMode
    ? 'w-full relative'
    : 'w-full max-w-xl bg-white border border-[#a2c28f]/20 rounded-[32px] shadow-2xl p-8 md:p-10 relative z-10 overflow-hidden transform transition-all duration-300';

  return (
    <div 
      className={wrapperClass}
      id="login-page-container"
      onKeyDown={handleKeyDown}
    >
      {/* 非弹窗模式才显示外围装饰 */}
      {!isModalMode && (
        <>
          <div className="absolute top-[10%] left-[8%] animate-pulse text-4xl opacity-75 hidden sm:block pointer-events-none">🥑</div>
          <div className="absolute top-[15%] right-[12%] text-3xl opacity-60 hidden sm:block pointer-events-none">🥐</div>
          <div className="absolute bottom-[18%] left-[10%] text-4xl opacity-75 hidden sm:block pointer-events-none text-[#8ba779]">🍓</div>
          <div className="absolute bottom-[12%] right-[10%] text-5xl opacity-60 hidden sm:block pointer-events-none">🍋</div>
          <div className="absolute w-[600px] h-[600px] bg-gradient-to-tr from-[#8ba779]/5 to-transparent rounded-full blur-3xl -top-40 -left-40 pointer-events-none" />
        </>
      )}

      <div 
        className={innerCardClass}
        id="login-card-main"
      >
        {!isModalMode && (
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#a2c28f] via-[#f5e88e] to-[#8ca779]" />
        )}

        <div className="text-center mt-3 mb-6" id="login-brand-header">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#eff7e8] border border-[#8ba779]/25 text-[#5d7350] shadow-sm mb-3.5 transform hover:scale-108 transition-all duration-300">
            <Soup className="w-7 h-7 text-[#5d7350] animate-pulse" />
          </div>
          <h2 className="text-3xl font-black text-[#5d7350] tracking-wider font-sans flex items-center justify-center gap-1.5">
            <span>识食物者</span>
            <span className="bg-[#f5e88e] text-stone-900 font-sans font-bold text-[13px] px-2 py-0.5 rounded-full border border-[#f5e88e]/30 scale-90 uppercase tracking-widest">
              网站
            </span>
          </h2>
        </div>

        {/* Tab 切换 */}
        <div className="flex bg-stone-100 p-1 rounded-2xl mb-6 relative border border-stone-200/50" id="login-tab-wrapper">
          <button
            onClick={() => handleTabChange('login')}
            className={`flex-1 py-3 text-[20px] font-black rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'login'
                ? 'bg-gradient-to-r from-[#a2c28f] to-[#8ca779] text-white shadow-md font-extrabold transform scale-[1.02]'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>登录</span>
          </button>
          <button
            onClick={() => handleTabChange('register')}
            className={`flex-1 py-3 text-[20px] font-black rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'register'
                ? 'bg-gradient-to-r from-[#a2c28f] to-[#8ca779] text-white shadow-md font-extrabold transform scale-[1.02]'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>注册</span>
          </button>
        </div>

        {/* 公共错误区 */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200/60 rounded-2xl flex items-start gap-2.5">
            <ShieldAlert className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="text-xs text-rose-600 font-medium leading-relaxed mt-0.5">
                {errorMessage}
              </p>
            </div>
          </div>
        )}

        {/* 成功提示区 */}
      {successMessage && (
        <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200/60 rounded-2xl flex items-start gap-2.5">
          <Sparkles className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
          <div className="text-left">
            <span className="block text-[10px] text-emerald-500 font-extrabold tracking-wider uppercase">
              操作成功
            </span>
            <p className="text-xs text-emerald-700 font-medium leading-relaxed mt-0.5">
              {successMessage}
            </p>
          </div>
        </div>
      )}

        {/* 字段输入 */}
        <div className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="block text-[13px] text-stone-400 font-bold tracking-wider uppercase pl-1">
              账号名称 (必填)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="1-13位英文字母或数字"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 hover:border-stone-300 focus:border-[#8ba779]/80 focus:bg-white text-xs text-stone-800 font-mono pl-10 pr-4 py-3.5 rounded-2xl transition-all duration-250 outline-none placeholder-stone-300"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[13px] text-stone-400 font-bold tracking-wider uppercase pl-1">
              密码密码 (必填)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                placeholder="1-13位英文字母或数字"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 hover:border-stone-300 focus:border-[#8ba779]/80 focus:bg-white text-xs text-stone-800 font-mono pl-10 pr-4 py-3.5 rounded-2xl transition-all duration-250 outline-none placeholder-stone-300"
              />
            </div>
          </div>

          {activeTab === 'register' && (
            <div className="space-y-1">
              <label className="block text-[13px] text-stone-400 font-bold tracking-wider uppercase pl-1">
                确认密码
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  placeholder="请再次确认您的账户密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 hover:border-stone-300 focus:border-[#8ba779]/80 focus:bg-white text-xs text-stone-800 font-mono pl-10 pr-4 py-3.5 rounded-2xl transition-all duration-250 outline-none placeholder-stone-300"
                />
              </div>
            </div>
          )}

          {/* 验证码框 */}
          <div className="grid grid-cols-5 gap-3">
            <div className="col-span-3 space-y-1">
              <label className="block text-[13px] text-stone-400 font-bold tracking-wider uppercase pl-1">
                图形验证码
              </label>
              <input
                type="text"
                maxLength={4}
                placeholder="图形中 4 位字符"
                value={captchaCode}
                onChange={(e) => setCaptchaCode(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 hover:border-stone-300 focus:border-[#8ba779]/80 focus:bg-white text-xs text-stone-800 font-mono px-4 py-3.5 rounded-2xl transition-all duration-250 outline-none placeholder-stone-300 uppercase"
              />
            </div>
            
            <div className="col-span-2 flex flex-col justify-end">
              <button
                type="button"
                onClick={handleRefreshCaptcha}
                disabled={isCaptchaLoading}
                className="h-[46px] w-full rounded-2xl overflow-hidden bg-stone-100 hover:bg-stone-200 border border-stone-200/50 flex items-center justify-center relative cursor-pointer group active:scale-97 transition-all duration-200"
                title="点击刷新验证码"
              >
                {captchaImg ? (
                  <img 
                    src={captchaImg.startsWith('data:') ? captchaImg : `data:image/gif;base64,${captchaImg}`} 
                    alt="验证码" 
                    className="h-full w-full object-cover select-none" 
                    referrerPolicy="no-referrer" 
                  />
                ) : (
                  <div className="flex items-center gap-1 text-stone-400 text-[10px]">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>拉取中</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200">
                  <RefreshCw className={`w-4 h-4 text-white ${isCaptchaLoading ? 'animate-spin' : ''}`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 提交按钮 */}
        <div className="mt-7">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className={`w-full py-4 rounded-2xl text-[20px] font-black text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
              isLoading 
                ? 'bg-stone-300 cursor-not-allowed shadow-none' 
                : 'bg-gradient-to-r from-[#8ba779] to-[#5d7350] hover:scale-102 active:scale-98'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>{activeTab === 'login' ? '登录中...' : '注册中...'}</span>
              </>
            ) : (
              <span>{activeTab === 'login' ? '确认登录，进入厨房 ➔' : '完成注册，加入食客 ➔'}</span>
            )}
          </button>
        </div>
        {/* 游客选项 */}
        <div className="mt-6 border-t border-stone-100/80 pt-4 text-center">
          <button
            type="button"
            onClick={onGoGuest}
            className="inline-flex items-center gap-1 text-[16px] text-[#5d7350] hover:text-[#8ba779] font-black transition-all group cursor-pointer"
          >
            <span>以游客身份继续浏览</span>
            <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}

