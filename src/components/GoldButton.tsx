import { Button } from "@/components/ui/button";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface GoldButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}

export function GoldButton({ className = "", style = {}, children, ...props }: GoldButtonProps) {
  return (
    <Button
      {...props}
      className={`bg-gradient-to-r from-[#FFD700] to-[#F4C430] text-black font-bold shadow-lg hover:from-yellow-400 hover:to-yellow-500 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-lg transition-all duration-200 border border-yellow-200 cursor-pointer min-h-11 sm:min-h-12 flex items-center justify-center ${className}`}
      style={{ boxShadow: "0 4px 24px 0 rgba(255, 215, 0, 0.15)", ...style }}
    >
      {children}
    </Button>
  );
}
