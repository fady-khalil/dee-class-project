import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import DesktopNav from "./DesktopNav";
import MobileNav from "./MobileNav";
import MobileDrawer from "./MobileDrawer";

const Header = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  // Hide on scroll down, show on scroll up — transparent header transitions at 50px
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      setIsVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      setScrolled(currentScrollPos > 50);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

  // Close drawer on route change
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname]);

  return (
    <>
      <div
        className={`w-full header_container py-3 flex items-center fixed top-0 left-0 right-0 transition-all duration-300 z-[1000] ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        } ${
          isHomePage && !scrolled
            ? "bg-transparent"
            : "bg-black/90 backdrop-blur-md"
        }`}
      >
        <header
          className={`w-full transition ease-in duration-300 ${
            scrolled ? "border-b border-white/10" : ""
          }`}
        >
          <DesktopNav />
          <MobileNav onToggleDrawer={() => setIsDrawerOpen((prev) => !prev)} />
        </header>
      </div>

      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      {/* Spacer to prevent content overlap — hidden on home page */}
      {!isHomePage && <div className="h-24" />}
    </>
  );
};

export default Header;
