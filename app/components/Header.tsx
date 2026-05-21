import Link from "next/link";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showLocation?: boolean;
  showNotification?: boolean;
  transparent?: boolean;
}

export default function Header({
  title,
  showBack = false,
  showLocation = true,
  showNotification = true,
  transparent = false,
}: HeaderProps) {
  return (
    <header
      className={`sticky top-0 z-40 px-5 py-3 flex items-center justify-between ${
        transparent
          ? ""
          : "bg-surface-card/90 backdrop-blur-xl border-b border-border"
      }`}
    >
      <div className="flex items-center gap-3">
        {showBack && (
          <Link
            href="/"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-dim hover:bg-border-strong transition-colors"
          >
            <span className="material-icons-round text-[20px] text-text-primary">
              arrow_back
            </span>
          </Link>
        )}
        {showLocation && !title && (
          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-text-tertiary text-[11px] font-medium uppercase tracking-widest">
              <span className="material-icons-round text-[12px]">location_on</span>
              Current Location
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[15px] font-bold text-text-primary">
                Beverly Hills, CA
              </span>
              <span className="material-icons-round text-[16px] text-text-secondary">
                keyboard_arrow_down
              </span>
            </div>
          </div>
        )}
        {title && (
          <h1 className="text-lg font-bold text-text-primary">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        {showNotification && (
          <Link
            href="/notifications"
            className="relative w-10 h-10 flex items-center justify-center rounded-full bg-surface-dim hover:bg-border-strong transition-colors"
          >
            <span className="material-icons-round text-[20px] text-text-primary">
              notifications_none
            </span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
          </Link>
        )}
      </div>
    </header>
  );
}
