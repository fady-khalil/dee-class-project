import React, { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useContext } from "react";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import useDeleteNoLang from "Hooks/useDeleteNoLang";
import { useStatusHandler } from "Components/RequestHandler";
import Spinner from "Components/RequestHandler/Spinner";

const DeleteProfileModal = ({ isOpen, onClose, profile }) => {
  const { t } = useTranslation();
  const modalRef = useRef(null);
  const { token, setProfiles } = useContext(LoginAuthContext);
  const { deleteData, isLoading } = useDeleteNoLang();
  const { showError } = useStatusHandler();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        isOpen
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleDeleteProfile = async () => {
    if (!profile) return;

    const response = await deleteData(`delete-profile/${profile.id}`, token);
    if (response.success) {
      setProfiles(response.data?.profiles);
      onClose();
    } else {
      showError(response.message || "api.fetch.error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-xl p-8 shadow-xl max-w-md w-full mx-4"
        ref={modalRef}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            {t("profiles.delete_profile")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-8 text-center">
          <p className="text-gray-700 mb-4">{t("profiles.confirm_delete")}</p>
          <div className="mt-2 font-semibold text-gray-900">
            {profile?.name || ""}
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {t("profiles.no_cancel")}
          </button>
          <button
            type="button"
            onClick={handleDeleteProfile}
            className="flex-1 py-2 px-4 flex items-center justify-center rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            {isLoading ? (
              <Spinner isWhite={true} />
            ) : (
              <>{t("profiles.yes_delete")}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProfileModal;
