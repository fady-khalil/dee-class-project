import { createContext, useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import BASE_URL from "Utilities/BASE_URL";

const ContactInfoContext = createContext();

const ContactInfoProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [contactInfo, setContactInfo] = useState(null);
  const fetchedRef = useRef(false);

  // Set from external source (e.g. /home response)
  const setContactData = useCallback((data) => {
    if (data) {
      setContactInfo(data);
      fetchedRef.current = true;
    }
  }, []);

  // Fetch only if not already loaded (for non-home pages)
  const fetchContactInfo = useCallback(async () => {
    if (fetchedRef.current || contactInfo) return;
    fetchedRef.current = true;
    try {
      const res = await fetch(
        `${BASE_URL}/${i18n.language}/home/contact-info`
      );
      const json = await res.json();
      setContactInfo(json.data || null);
    } catch {
      // silent fail — footer is non-critical
    }
  }, [contactInfo, i18n.language]);

  return (
    <ContactInfoContext.Provider
      value={{ contactInfo, setContactData, fetchContactInfo }}
    >
      {children}
    </ContactInfoContext.Provider>
  );
};

export { ContactInfoContext, ContactInfoProvider };
