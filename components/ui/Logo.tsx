import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  href?: string;
  className?: string;
}

const sizeMap = {
  sm: 32,
  md: 40,
  lg: 48,
};

const textSizeClasses = {
  sm: "text-sm sm:text-base",
  md: "text-base sm:text-lg",
  lg: "text-lg sm:text-xl",
};

export function Logo({
  size = "md",
  showText = true,
  href = "/dashboard",
  className = "",
}: LogoProps) {
  const dimension = sizeMap[size];

  const content = (
    <div className={`flex items-center gap-3 group ${className}`}>
      <div className="relative">
        {/* Shadow/outline for better visibility on all backgrounds */}
        <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 rounded-full blur-sm" />
        <Image
          src="/assets/images/sylvan-token-logo.png"
          alt="Sylvan Token Logo"
          width={dimension}
          height={dimension}
          className="object-contain relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_2px_4px_rgba(255,255,255,0.2)]"
          unoptimized
        />
      </div>

      {showText && (
        <span
          className={`font-bold ${textSizeClasses[size]} text-gradient-eco hidden sm:inline drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_1px_2px_rgba(255,255,255,0.1)]`}
        >
          Sylvan Token
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="no-underline">
        {content}
      </Link>
    );
  }

  return content;
}
