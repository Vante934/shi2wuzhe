interface GlobalToastProps {
  message: string | null;
}

/* ============================================================
   去除字符串中的所有 emoji（统一过滤所有 showToast 调用里的 emoji）
   ============================================================ */
const stripEmoji = (str: string) => {
  if (!str) return '';
  return str
    .replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      ''
    )
    .replace(/\s+/g, ' ')
    .trim();
};

export default function GlobalToast({ message }: GlobalToastProps) {
  if (!message) return null;

  const cleanMessage = stripEmoji(message);
  if (!cleanMessage) return null;

  return (
    /* ============================================================
       【位置】底部居中（在底部 TabBar 之上）
       - fixed bottom-28：距底部 112px（避开 TabBar 80px + 留一点空隙）
       - left-1/2 -translate-x-1/2：水平居中
       
       【大小】小巧胶囊形
       【样式】白底、绿色描边
       ============================================================ */
    <div className="fixed bottom-38 left-1/2 -translate-x-1/2 z-[100] pointer-events-none animate-toast-slide-up">
      <div className="bg-white border-2 border-[#a2c28f] text-[#36482c] text-[20px] font-bold px-6 py-3 rounded-full shadow-lg whitespace-nowrap max-w-[80vw] overflow-hidden text-ellipsis">
        {cleanMessage}
      </div>
    </div>
  );
}