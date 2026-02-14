import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import useApiQuery from "Hooks/useApiQuery";
import {
  FacebookLogo,
  InstagramLogo,
  XLogo,
  YoutubeLogo,
  LinkedinLogo,
  TiktokLogo,
  WhatsappLogo,
  Envelope,
  Phone,
} from "@phosphor-icons/react";

const SOCIAL_ICONS = {
  facebook: FacebookLogo,
  instagram: InstagramLogo,
  twitter: XLogo,
  linkedin: LinkedinLogo,
  youtube: YoutubeLogo,
  tiktok: TiktokLogo,
  whatsapp: WhatsappLogo,
};

const SOCIAL_COLORS = {
  facebook: "#3b5998",
  instagram: "#e1306c",
  twitter: "#1DA1F2",
  youtube: "#FF0000",
  linkedin: "#0077b5",
  tiktok: "#ff0050",
  whatsapp: "#25D366",
};

const ContactUs = () => {
  const { t, i18n } = useTranslation();
  const [hoveredItem, setHoveredItem] = useState(null);
  const { data } = useApiQuery("home/contact-info");
  const contactInfo = data?.data;

  const renderSocialIcon = (platform) => {
    const IconComponent = SOCIAL_ICONS[platform];
    return IconComponent ? <IconComponent weight="fill" size={20} /> : null;
  };

  return (
    <div className="transition-all">
      <h3 className="text-lightWhite font-bold text-2xl mb-6 relative">
        {t("general.contact_us")}
        <span
          className={`absolute -bottom-2 ${
            i18n.language === "ar" ? "right-0" : "left-0"
          } w-16 h-1 bg-[#bbb] rounded-full`}
        ></span>
      </h3>

      <div className="flex flex-col gap-4 mb-8">
        {contactInfo?.email && (
          <a
            href={`mailto:${contactInfo.email}`}
            className="flex items-center gap-x-3 text-[#bbb] p-2 transition-all duration-300 hover:text-lightWhite hover:bg-lightGrey rounded-xl"
          >
            <Envelope weight="fill" size={18} className="text-[#bbb]" />
            <span className="text-sm font-medium">{contactInfo.email}</span>
          </a>
        )}
        {contactInfo?.phone && (
          <a
            href={`tel:${contactInfo.phone}`}
            className="flex items-center gap-x-3 text-[#bbb] p-2 transition-all duration-300 hover:text-lightWhite hover:bg-lightGrey rounded-xl"
          >
            <Phone weight="fill" size={18} className="text-[#bbb]" />
            <span className="text-sm font-medium">{contactInfo.phone}</span>
          </a>
        )}
      </div>

      {contactInfo?.socialMedia && contactInfo.socialMedia.length > 0 && (
        <>
          <p className="text-[#bbb] text-sm mb-4 opacity-80">
            {t("footer.follow")}
          </p>

          <div className="flex flex-wrap justify-s gap-4">
            {contactInfo.socialMedia.map((social, index) => (
              <a
                key={social._id || index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative"
                onMouseEnter={() => setHoveredItem(index)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <span
                  className="transition-all duration-200"
                  style={{
                    color: hoveredItem === index ? (SOCIAL_COLORS[social.platform] || "#bbb") : "#bbb",
                    transform: hoveredItem === index ? "scale(1.2)" : "scale(1)",
                    display: "inline-block",
                  }}
                >
                  {renderSocialIcon(social.platform)}
                </span>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ContactUs;
