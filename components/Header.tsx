export default function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-[#E5E5E5] bg-white px-6">
      <span className="text-lg font-bold text-[#0D6E6E]">
        MapEstate
      </span>
      <div className="flex items-center gap-4">
        <div className="flex h-9 w-70 items-center gap-2 rounded-lg bg-[#F5F5F5] px-3">
          <svg
            className="h-4 w-4 text-[#888888]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <span className="text-sm text-[#888888]">
            エリア・駅名で検索...
          </span>
        </div>
      </div>
    </header>
  );
}
