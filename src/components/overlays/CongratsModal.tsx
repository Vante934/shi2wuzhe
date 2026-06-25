interface CongratsModalProps {
  isOpen: boolean;
  recipeName: string;
  onBackHome: () => void;
  onStayHere: () => void;
}

export default function CongratsModal({
  isOpen,
  recipeName,
  onBackHome,
  onStayHere,
}: CongratsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-stone-900/75 backdrop-blur-md z-[999] flex items-center justify-center p-4 animate-fade-in select-none">

      <div className="absolute pointer-events-none inset-0 overflow-hidden select-none hidden md:block">
        <span className="absolute top-[20%] left-[15%] text-4xl animate-bounce-subtle duration-300">✨</span>
        <span className="absolute top-[28%] right-[20%] text-3xl animate-pulse">🌟</span>
        <span className="absolute bottom-[25%] left-[25%] text-3xl animate-bounce">🎈</span>
        <span className="absolute bottom-[30%] right-[15%] text-4xl animate-pulse duration-700">✨</span>
      </div>

      <div className="bg-white rounded-[2.5rem] w-full max-w-[460px] max-h-[90vh] overflow-y-auto custom-scroll p-6 text-center shadow-2xl relative border-4 border-[#edd96a]/70 animate-scale-up">

        <div className="absolute inset-0 bg-radial-gradient from-[#edd96a]/15 via-white to-transparent opacity-60 pointer-events-none"></div>

       

        <div className="relative w-28 h-28 mx-auto bg-stone-50 border-4 border-[#edd96a]/60 rounded-full flex items-center justify-center shadow-lg mb-4 animate-scale-up">
          <span className="text-6xl">🥢</span>
          <span className="absolute -top-1.5 -right-5 text-base text-yellow-400 animate-bounce">⭐</span>
          <span className="absolute -bottom-1 -left-3 text-base text-yellow-400 animate-pulse">⭐</span>
        </div>

        <div className="space-y-3 relative z-10">
          <h4 className="text-xl font-black text-stone-850 tracking-tight leading-tight">
            恭喜您完成「<span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">{recipeName}</span>」的制作！
          </h4>
          <p className="text-[11px] text-stone-500 leading-relaxed font-sans font-medium">
           
          </p>
        </div>

        <div className="my-4"></div>

        <div className="flex flex-col gap-2 relative z-10 pt-1.5">
          <button
            onClick={onBackHome}
            className="bg-brand-yellow hover:bg-[#edd96a] text-stone-850 font-black text-[18px] py-3 rounded-full border border-[#edd96a] shadow-md transition-all active:scale-95 cursor-pointer w-full"
          >
            完成，返回首页
          </button>
          <button
            onClick={onStayHere}
            className="text-[16px] text-stone-400 hover:text-stone-600 font-bold underline transition-colors cursor-pointer"
          >
            留在本页
          </button>
        </div>

      </div>
    </div>
  );
}