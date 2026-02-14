import { List } from "@phosphor-icons/react";
import Logo from "./Components/Logo";
import SearchBar from "./Components/SearchBar";

const MobileNav = ({ onToggleDrawer }) => {
  return (
    <div className="flex xl:hidden items-center justify-between w-full">
      <Logo className="w-24" />

      <div className="flex items-center gap-x-2">
        <SearchBar isMobile />
        <button
          onClick={onToggleDrawer}
          className="text-white p-1"
          aria-label="Toggle menu"
        >
          <List size={28} />
        </button>
      </div>
    </div>
  );
};

export default MobileNav;
