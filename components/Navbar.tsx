"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Search, Heart, UserRound, ShoppingBag } from "lucide-react";
import { useStore } from "@/app/context/StoreContext";

const navItems = [
  { label: "Sale", href: "/sale" },
  { label: "Women", href: "/women", dropdown: true },
  { label: "Men", href: "/men", dropdown: true },
  { label: "Home", href: "/home", dropdown: true },
  { label: "Gifts", href: "/gifts", dropdown: true },
  { label: "Buy More Save More", href: "/offers" },
  { label: "About Us", href: "/about", dropdown: true },
];

const womenColumns = [
  {
    title: "All Women's",
    links: [
      { label: "New-in", href: "/women/new-in" },
      { label: "Essentials", href: "/women/essentials" },
      { label: "Best Sellers", href: "/women/best-sellers" },
    ],
  },
  {
    title: "All Tops",
    links: [
      { label: "Sweaters", href: "/women/sweaters" },
      { label: "Cardigans", href: "/women/cardigans" },
      { label: "Hoodies", href: "/women/hoodies" },
      { label: "Tops & T-shirts", href: "/women/tops" },
      { label: "Dresses", href: "/women/dresses" },
    ],
    secondTitle: "Bottoms",
    secondLinks: [
      { label: "Skirts", href: "/women/skirts" },
      { label: "Pants", href: "/women/pants" },
    ],
  },
  {
    title: "Accessories",
    links: [
      { label: "Hats", href: "/women/hats" },
      { label: "Scarves & Shawls", href: "/women/scarves" },
      { label: "Gloves", href: "/women/gloves" },
      { label: "Socks", href: "/women/socks" },
    ],
    secondTitle: "Outerwear",
    secondLinks: [
      { label: "Coats", href: "/women/coats" },
      { label: "Blazers", href: "/women/blazers" },
      { label: "Jackets", href: "/women/jackets" },
    ],
  },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [headerHovered, setHeaderHovered] = useState(false);

  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const { cart, wishlist } = useStore();

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const wishlistCount = wishlist.length;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setActiveDropdown(null);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 z-50 transition-colors duration-300 ${
        isHomePage
          ? scrolled
            ? "top-0 bg-white text-black shadow-sm"
            : headerHovered
              ? "top-[40px] bg-white text-black shadow-sm"
              : "top-[40px] bg-transparent text-white"
          : scrolled
            ? "top-0 bg-white text-black shadow-sm"
            : "top-[40px] bg-white text-black shadow-sm"
      }`}
      onMouseEnter={() => setHeaderHovered(true)}
      onMouseLeave={() => {
        setHeaderHovered(false);
        setActiveDropdown(null);
      }}
    >
      <div className="relative flex h-[76px] items-center justify-between border-b border-black/5 px-5 md:px-8">
        {/* Mobile menu */}
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-xs tracking-widest md:hidden"
        >
          {menuOpen ? "CLOSE" : "MENU"}
        </button>

        {/* Logo */}
        <Link
          href="/"
          className="font-serif text-[28px] tracking-tight md:text-[32px]"
        >
          GOBI 45
        </Link>

        {/* Desktop navigation */}
        <nav
          aria-label="Main navigation"
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-5 whitespace-nowrap lg:flex xl:gap-7"
        >
          {navItems.map((item) => (
            <div
              key={item.label}
              onMouseEnter={() =>
                setActiveDropdown(item.label === "Women" ? "Women" : null)
              }
              className="flex h-[76px] items-center"
            >
              <Link
                href={item.href}
                onFocus={() =>
                  setActiveDropdown(item.label === "Women" ? "Women" : null)
                }
                className={`flex items-center gap-1 text-[10px] tracking-[0.12em] transition-colors hover:text-neutral-500 xl:text-[11px] ${
                  item.label === "Sale"
                    ? "rounded-full border border-red-500 px-5 py-3"
                    : ""
                }`}
              >
                {item.label.toUpperCase()}

                {item.dropdown && <span className="text-[9px]">⌄</span>}
              </Link>
            </div>
          ))}
        </nav>

        {/* Action icons */}
        <div className="ml-auto flex items-center gap-4 sm:gap-5">
          <Link href="/search" aria-label="Search">
            <Search size={21} strokeWidth={1.5} />
          </Link>

          <Link
            href="/wishlist"
            aria-label={`Wishlist, ${wishlistCount} items`}
            className="relative"
          >
            <Heart size={21} strokeWidth={1.5} />

            {wishlistCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[9px] text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link href="/account" aria-label="Account">
            <UserRound size={21} strokeWidth={1.5} />
          </Link>

          <Link
            href="/cart"
            aria-label={`Shopping cart, ${cartCount} items`}
            className="relative"
          >
            <ShoppingBag size={21} strokeWidth={1.5} />

            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[9px] text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Women's mega menu */}
      {activeDropdown === "Women" && (
        <div className="absolute left-0 top-full hidden w-full border-t border-black/5 bg-white px-8 py-10 text-black shadow-lg lg:block">
          <div className="grid grid-cols-3 gap-12">
            {womenColumns.map((column) => (
              <div key={column.title}>
                <h3 className="mb-6 text-base font-semibold">{column.title}</h3>

                <div className="flex flex-col items-start gap-5">
                  {column.links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setActiveDropdown(null)}
                      className="text-sm transition-colors hover:text-neutral-400"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                {column.secondTitle && (
                  <>
                    <h3 className="mb-5 mt-9 text-base font-semibold">
                      {column.secondTitle}
                    </h3>

                    <div className="flex flex-col items-start gap-5">
                      {column.secondLinks?.map((link) => (
                        <Link
                          key={link.label}
                          href={link.href}
                          onClick={() => setActiveDropdown(null)}
                          className="text-sm transition-colors hover:text-neutral-400"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile navigation */}
      {menuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="border-b border-black/10 bg-white px-6 py-5 text-black lg:hidden"
        >
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between border-b border-black/5 py-4 text-xs tracking-widest"
            >
              {item.label.toUpperCase()}
              {item.dropdown && <span>+</span>}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
