import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MainNavProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

const navLinks = [
  { href: "/#hero", label: "Home" },
  { href: "/#quickOrder", label: "Menu" },
  { href: "/#contact", label: "Contact" },
];

export default function MainNav({ mobile = false, onNavigate }: MainNavProps) {
  const router = useRouter();
  // Smooth scroll handler for hash links
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
    if (href.startsWith("/#")) {
      e.preventDefault();
      const id = href.replace("/#", "");
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        if (onNavigate) onNavigate();
      } else {
        router.push(href);
      }
    } else if (onNavigate) {
      onNavigate();
    }
  };
  return (
    <ul
      className={
        mobile
          ? "flex flex-col gap-4 text-lg font-medium bg-white p-4 rounded-lg shadow-md relative"
          : "flex gap-6 text-base font-medium"
      }
    >
      {mobile && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2"
          aria-label="Close menu"
          type="button"
          onClick={onNavigate}
        >
          <X className="w-6 h-6 text-gray-700" />
        </Button>
      )}
      {navLinks.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            className="hover:text-green-700 transition-colors"
            onClick={e => handleSmoothScroll(e, link.href)}
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
