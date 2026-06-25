// 引入lucide-react图标库内4个导航所需图标组件
import { Soup, Lightbulb, Globe, User } from 'lucide-react';

/**
 * 导航标签的类型枚举约束
 * eatwell：好好吃饭页面标识
 * inspiration：随机灵感页面标识
 * community：交流社区页面标识
 * profile：个人中心页面标识
 */
export type TabType = 'eatwell' | 'inspiration' | 'community' | 'profile';

/**
 * 底部导航栏组件接收的所有参数类型定义
 */
interface BottomTabBarProps {
  // 当前处于激活选中状态的标签
  activeTab: TabType;
  // 切换标签页的触发回调函数，参数为目标标签类型
  onTabChange: (tab: TabType) => void;

  // 可选回调：切换标签时重置好好吃饭页面的子步骤状态
  onResetSubStep?: () => void;
  // 可选回调：切换标签时重置随机灵感页面的计数数据
  onResetInspirationCount?: () => void;
  // 可选回调：切换标签时重置交流社区的筛选条件
  onResetCommunityFilter?: () => void;
  // 可选回调：切换标签时重置个人中心内部子标签状态
  onResetProfileTab?: () => void;
}

/**
 * Tab按钮公共基础样式字符串
 * flex-1：四个按钮均分导航栏横向宽度
 * h-full：按钮高度填满父导航容器高度
 * flex flex-col：内部垂直排列（图标在上，文字在下）
 * items-center justify-center：图标文字整体居中对齐
 * gap-1.5：图标和下方文字之间的垂直间距
 * transition-all duration-200：所有样式变化开启200ms过渡动画
 */
const tabBaseClass =
  'flex-1 h-full flex flex-col items-center justify-center gap-1.5 transition-all duration-200';
/**
 * Tab被选中激活时的专属样式
 * bg-[#8caf77]：项目主题绿色背景
 * text-white：白色文字
 * font-black：超粗字体
 * shadow-inner：内部凹陷阴影，增强选中质感
 */
const tabActiveClass = 'bg-[#8caf77] text-white font-black shadow-inner';

/**
 * Tab未被选中时的默认样式
 * text-stone-400：灰色文字
 * hover:text-stone-700：悬停时文字变深
 * hover:bg-stone-50：悬停时背景变浅
 */
const tabInactiveClass = 'text-stone-400 hover:text-stone-700 hover:bg-stone-50';

/**
 * 页面底部固定导航栏组件
 * 全局悬浮在页面最底部，控制四大核心页面切换
 * 入参控制激活态与各页面状态重置逻辑
 */
export default function BottomTabBar({
  activeTab,
  onTabChange,
  onResetSubStep,
  onResetInspirationCount,
  onResetCommunityFilter,
  onResetProfileTab,
}: BottomTabBarProps) {
  return (
    <nav className="bg-white border-t border-stone-200 h-20 flex items-stretch justify-around shadow-2xl text-center select-none shrink-0 fixed bottom-0 left-0 right-0 z-50 overflow-hidden">

      <button
        onClick={() => {
          onTabChange('eatwell');
          onResetSubStep?.();
        }}
        className={`${tabBaseClass} ${activeTab === 'eatwell' ? tabActiveClass : tabInactiveClass}`}
      >
        <Soup className="w-8 h-8" />
        <span className="text-xs md:text-[13px] font-sans font-black">好好吃饭</span>
      </button>

      <button
        onClick={() => {
          onTabChange('inspiration');
          onResetInspirationCount?.();
        }}
        className={`${tabBaseClass} ${activeTab === 'inspiration' ? tabActiveClass : tabInactiveClass}`}
      >
        <Lightbulb className="w-8 h-8" />
        <span className="text-xs md:text-[13px] font-sans font-black">随机灵感</span>
      </button>

      <button
        onClick={() => {
          onTabChange('community');
          onResetCommunityFilter?.();
        }}
        className={`${tabBaseClass} ${activeTab === 'community' ? tabActiveClass : tabInactiveClass}`}
      >
        <Globe className="w-8 h-8" />
        <span className="text-xs md:text-[13px] font-sans font-black">交流社区</span>
      </button>

      <button
        onClick={() => {
          onTabChange('profile');
          onResetProfileTab?.();
        }}
        className={`${tabBaseClass} ${activeTab === 'profile' ? tabActiveClass : tabInactiveClass}`}
      >
        <User className="w-8 h-8" />
        <span className="text-xs md:text-[13px] font-sans font-black">个人中心</span>
      </button>
    </nav>

    

  );
}
