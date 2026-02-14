import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import { Gift } from "@phosphor-icons/react";
import BASE_URL from "Utilities/BASE_URL";
import appStore from "assests/Stores/app-store.png";
import googlePlay from "assests/Stores/google-play-store.png";

const BANNER_KEY = "bannerDismissed";

const BottomBanner = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(LoginAuthContext);

  const [bannerData, setBannerData] = useState(null);
  const [visible, setVisible] = useState(false);
  const [atFooter, setAtFooter] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(BANNER_KEY) === "true",
  );

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await fetch(`${BASE_URL}/home/bottom-banner`);
        const json = await res.json();
        if (json?.success && json?.data) {
          setBannerData(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch bottom banner:", err);
      }
    };
    fetchBanner();
  }, []);

  useEffect(() => {
    if (dismissed) return;

    const onScroll = () => {
      setVisible(window.scrollY > 300);

      const footer = document.querySelector("footer");
      if (footer) {
        const footerTop = footer.getBoundingClientRect().top;
        setAtFooter(footerTop <= window.innerHeight);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed]);

  const handleDismiss = () => {
    setDismissed(true);
    setVisible(false);
    sessionStorage.setItem(BANNER_KEY, "true");
  };

  if (dismissed || !visible || atFooter) return null;
  if (!bannerData || !bannerData.isActive) return null;

  const isArabic = i18n.language === "ar";
  const content = isAuthenticated
    ? (isArabic ? bannerData.registered_content_ar : bannerData.registered_content)
    : (isArabic ? bannerData.guest_content_ar : bannerData.guest_content);

  if (!content) return null;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-40 bg-primary text-white py-3 sm:py-6"
      style={{ animation: "slideUp .3s ease-out" }}
    >
      <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>

      <button
        onClick={handleDismiss}
        className="absolute top-2 right-3 text-white/70 hover:text-white text-xl leading-none"
        aria-label="Close"
      >
        &times;
      </button>

      <div
        className="Container mx-auto flex items-center justify-between gap-4 flex-wrap"
        dir={isArabic ? "rtl" : "ltr"}
      >
        <div dangerouslySetInnerHTML={{ __html: content }} />

        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            {bannerData.app_store_url && (
              <a href={bannerData.app_store_url} target="_blank" rel="noopener noreferrer">
                <img src={appStore} alt="App Store" className="h-9 sm:h-10" />
              </a>
            )}
            {bannerData.play_store_url && (
              <a href={bannerData.play_store_url} target="_blank" rel="noopener noreferrer">
                <img src={googlePlay} alt="Google Play" className="h-9 sm:h-10" />
              </a>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/register")}
              className="whitespace-nowrap rounded-lg bg-white text-black font-semibold text-sm px-5 py-2 hover:bg-gray-200 transition-colors"
            >
              {t("banner.register_button")}
            </button>
            <button
              onClick={() => navigate("/gift")}
              className="whitespace-nowrap rounded-lg bg-transparent text-white font-semibold text-sm px-5 py-2 border border-white/60 hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <Gift size={18} weight="bold" />
              {t("banner.gift_button")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BottomBanner;
