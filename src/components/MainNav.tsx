import { useRouter } from "next/navigation";

const navLinks = [
  { href: "/#hero", label: "Home" },
  { href: "/#quickOrder", label: "Menu" },
  { href: "/#contact", label: "Contact" },
];

export default function MainNav() {
  const router = useRouter();
  // Smooth scroll handler for hash links
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
    if (href.startsWith("/#")) {
      e.preventDefault();
      const id = href.replace("/#", "");
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        router.push(href);
      }
    }
  };
  return (
    <ul className="flex gap-6 text-base font-medium">
      {navLinks.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            className="hover:text-orange-600 transition-colors text-gray-700 cursor-pointer font-medium px-3 py-2 rounded-lg hover:bg-orange-50"
            onClick={e => handleSmoothScroll(e, link.href)}
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
