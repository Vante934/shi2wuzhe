// 导入图标组件：向右箭头图标，用于按钮右侧展示
import { ChevronRight } from 'lucide-react';

// 定义组件入参类型约束
interface WelcomePageProps {
  onStart: () => void;
  // ⭐ 新增：点击任意处回调
  onClickAnywhere: () => void;
}

// 环形蔬菜数据源：每个元素对应一个蔬菜表情+名称提示
const VEGGIE_RING = [
  { emoji: '🌽',  },
  { emoji: '🥬',  },
  { emoji: '🥦',  },
  { emoji: '🧅',  },
  { emoji: '🍅',  },
  { emoji: '🎃',  },
  { emoji: '🍆',  },
  { emoji: '🥕',  },
  { emoji: '🫛',  },
  { emoji: '🍄',  },
  { emoji: '🥔',  },
  { emoji: '🥒',  },
];

// 首页欢迎页面组件，接收点击启动回调
export default function WelcomePage({ onStart, onClickAnywhere }: WelcomePageProps) {
  return (
    // 最外层容器：弹性垂直布局、铺满剩余高度、居中对齐、内边距、文字居中、禁止鼠标选中文字、相对定位
    <div
  className="flex flex-col items-center justify-center flex-1 py-4 text-center relative select-none min-h-0 cursor-pointer"
  onClick={onClickAnywhere}
>

      {/* ========== 外层大容器：承载环形蔬菜 + 中间大锅 ========== */}
      {/* 固定宽高520*460，内部居中，底部外边距 */}
      <div className="relative w-[520px] h-[460px] flex items-center justify-center mb-10">
        {/* 遍历所有蔬菜数组，逐个计算坐标渲染emoji */}
        {VEGGIE_RING.map((veg, idx, arr) => {
          // 1. 计算当前蔬菜在圆环上的弧度角度
          // -Math.PI/2 = 起始角度从正上方(12点钟方向)开始；一圈2π弧度
          // idx * 2π / arr.length：均分360°圆环，12个蔬菜每个间隔30°
          const angle = -Math.PI / 2 + (idx * 2 * Math.PI) / arr.length;

          // 2. 圆环圆心坐标：容器宽520 一半=260；容器高460 一半=230
          // 圆环水平半径：230  竖直半径：200（椭圆环，不是正圆形）
          // Math.cos(角度) = 水平偏移系数  Math.sin(角度)=竖直偏移系数
          // 末尾-28：emoji尺寸是text-5xl，减去一半尺寸让emoji中心点对准圆环点位，不然会偏移错位
          const x = 260 + 280 * Math.cos(angle) - 28;
          const y = 220 + 230 * Math.sin(angle) - 28;

          // 交替浮动动画：偶数索引一套动画，奇数另一套，错落浮动更自然
          const animName = idx % 2 === 0 ? 'animate-float-1' : 'animate-float-2';

          return (
            // 绝对定位每个蔬菜表情，left/x top/y 精准定位
            <div
              key={`veg-ring-${idx}`} // 唯一key，react渲染列表必备
              style={{ left: `${x}px`, top: `${y}px` }} // 动态计算出来的坐标
              className={`
                absolute text-5xl  // 表情大小
                ${animName} z-10   // 浮动动画、层级高于大锅底层
                hover:scale-130 transition-all cursor-pointer // 悬浮放大、鼠标手型
                drop-shadow-md select-none // 阴影、禁止选中文字
              `}
             >
              {veg.emoji}
            </div>
          );
        })}

        {/* ========== 中间大锅容器（点击触发开始） ========== */}
        <div
          onClick={(e) => { e.stopPropagation(); onClickAnywhere(); }} // 点击整口锅触发启动回调
          className="
            relative w-[310px] h-[270px] 
            flex flex-col items-center justify-center 
            cursor-pointer hover:scale-105 transition-all group mt-10
          "
        >
          {/* 锅上方蒸汽动画层 */}
          <div className="absolute top-[-32px] flex gap-5 justify-center w-full z-20">
            {/* 四根蒸汽柱子，不同尺寸、延迟、动画，模拟袅袅热气 */}
            <div className="w-3 h-10 bg-white/80 rounded-full blur-[2px] animate-steam-1"></div>
            <div className="w-2.5 h-15 bg-white/100 rounded-full blur-[3px] animate-steam-2 [animation-delay:0.3s]"></div>
            <div className="w-3 h-10 bg-white/80 rounded-full blur-[2px] animate-steam-1 [animation-delay:0.6s]"></div>
            <div className="w-2.5 h-15 bg-white/100 rounded-full blur-[2px] animate-steam-2 [animation-delay:1.1s]"></div>
            <div className="w-2.5 h-15 bg-white/80 rounded-full blur-[2px] animate-steam-2 [animation-delay:1.1s]"></div>
          </div>

          {/* 锅盖部分：group-hover时向上抬升 */}
          <div className="
            w-[220px] h-6 bg-[#6c8a5a] rounded-full shadow-md 
            border-b-2 border-[#526a44]/50 flex items-center justify-center 
            relative translate-y-1 group-hover:-translate-y-2 transition-transform duration-300
          ">
            {/* 锅盖把手 */}
            <div className="w-10 h-5 bg-[#dbb874] rounded-t-lg border-b border-[#cca65c] absolute -top-4 shadow-inner"></div>
          </div>

          {/* 锅身主体，渐变绿色、底部大圆角、左右锅把手 */}
          <div className="
            w-[230px] h-[125px] bg-gradient-to-r from-[#8caf77] to-[#71985c] 
            rounded-b-[4rem] relative shadow-lg flex flex-col items-center justify-center 
            border-t-2 border-[#b9d6a8] pb-2
          ">
            {/* 左侧锅把手 */}
            <div className="absolute left-[-20px] top-6 w-5 h-10 bg-[#6c8a5a] rounded-l-xl border-y border-l border-[#526a44]"></div>
            {/* 右侧锅把手 */}
            <div className="absolute right-[-20px] top-6 w-5 h-10 bg-[#6c8a5a] rounded-r-xl border-y border-r border-[#526a44]"></div>
            {/* 锅身文字标识 */}
            <span className="text-lg text-[#eef6ea] font-black tracking-widest uppercase mt-1">识食物者</span>
          </div>

          {/* 锅底部地面投影，hover缩小更立体 */}
          <div className="w-[180px] h-3 bg-black/15 rounded-full blur-[4px] mt-3 group-hover:scale-95 transition-all"></div>
        </div>
      </div>

      {/* 页面大标题文案 */}
      <h2 className="text-2xl md:text-4xl font-black text-stone-700 tracking-wide font-sans mt-16 md:mt-10 mb-14">
        欢迎来到「识食物者」，今天你好好吃饭了吗？
      </h2>

      {/* 底部点击按钮，同样触发onStart */}
      <button
        onClick={(e) => { e.stopPropagation(); onClickAnywhere(); }}
        className="
          bg-[#8caf77] hover:bg-[#9bbe85] text-white font-black text-base 
          py-4 px-12 rounded-full shadow-lg border border-[#8caf77]/20 
          flex items-center gap-2 tracking-wide transition-all transform 
          active:scale-95 duration-200 mb-0
        "
      >
        <span>开启美食之旅</span>
        {/* 右侧箭头图标 */}
        <ChevronRight className="w-5 h-5 text-brand-yellow font-extrabold stroke-[3]" />
      </button>
    </div>
  );
}