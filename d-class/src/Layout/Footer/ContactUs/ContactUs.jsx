import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FacebookLogo,
  InstagramLogo,
  XLogo,
  YoutubeLogo,
  LinkedinLogo,
  TiktokLogo,
  Envelope,
  Phone,
} from "@phosphor-icons/react";

const ContactUs = () => {
  const { t, i18n } = useTranslation();
  const [hoveredItem, setHoveredItem] = useState(null);

  const socialMedia = [
    {
      name: "Facebook",
      icon: <FacebookLogo weight="fill" size={20} />,
      color: "#3b5998",
    },
    {
      name: "Instagram",
      icon: <InstagramLogo weight="fill" size={20} />,
      color: "#e1306c",
    },
    { name: "X", icon: <XLogo weight="bold" size={20} />, color: "#1DA1F2" },
    {
      name: "Youtube",
      icon: <YoutubeLogo weight="fill" size={20} />,
      color: "#FF0000",
    },
    {
      name: "Linkedin",
      icon: <LinkedinLogo weight="fill" size={20} />,
      color: "#0077b5",
    },
    {
      name: "Tiktok",
      icon: <TiktokLogo weight="fill" size={20} />,
      color: "#ff0050",
    },
  ];

  return (
    <div className=" transition-all">
      <h3 className="text-lightWhite font-bold text-2xl mb-6 relative">
        {t("general.contact_us")}
        <span
          className={`absolute -bottom-2 ${
            i18n.language === "ar" ? "right-0" : "left-0"
          }  w-16 h-1 bg-[#bbb] rounded-full`}
        ></span>
      </h3>

      <div className="flex flex-col gap-4 mb-8">
        <a
          href="#"
          className="flex items-center gap-x-3 text-[#bbb] p-2 transition-all duration-300 hover:text-lightWhite hover:bg-lightGrey rounded-xl"
        >
          <Envelope weight="fill" size={18} className="text-[#bbb]" />
          <span className="text-sm font-medium">info@company.com</span>
        </a>
        <a
          href="#"
          className="flex items-center gap-x-3 text-[#bbb] p-2 transition-all duration-300 hover:text-lightWhite hover:bg-lightGrey rounded-xl"
        >
          <Phone weight="fill" size={18} className="text-[#bbb]" />
          <span className="text-sm font-medium">+1 234 567 8900</span>
        </a>
      </div>

      <p className="text-[#bbb] text-sm mb-4 opacity-80">
        {t("footer.follow")}
      </p>

      <div className="flex flex-wrap justify-s gap-4">
        {socialMedia.map((social, index) => (
          <a
            key={index}
            href="#"
            className="relative"
            onMouseEnter={() => setHoveredItem(index)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <span
              className="transition-all duration-200"
              style={{
                color: hoveredItem === index ? social.color : "#bbb",
                transform: hoveredItem === index ? "scale(1.2)" : "scale(1)",
                display: "inline-block",
              }}
            >
              {social.icon}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default ContactUs;
