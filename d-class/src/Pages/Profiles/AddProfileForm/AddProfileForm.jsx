import React, { useRef, useEffect, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import Input from "Components/form/Inputs/Input";
import useInput from "Components/form/Hooks/user-input";
import usePostDataNoLang from "Hooks/usePostDataNoLang";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import Spinner from "Components/RequestHandler/Spinner";
import { useStatusHandler } from "Components/RequestHandler";

const AddProfileForm = ({ onClose, isOpen, profileToEdit = null }) => {
  const { t } = useTranslation();
  const modalRef = useRef(null);
  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState(null);
  const [imageError, setImageError] = useState("");
  const { token, setProfiles } = useContext(LoginAuthContext);
  const { postData, isLoading } = usePostDataNoLang();
  const { showError } = useStatusHandler();
  const isEditMode = !!profileToEdit;

  const {
    value: profileName,
    isValid: profileNameIsValid,
    hasError: profileNameHasError,
    inputChangeHandler: profileNameChangeHandler,
    inputBlurHandler: profileNameBlurHandler,
    inputFocusHandler: profileNameFocusHandler,
    reset: profileNameReset,
  } = useInput((value) => value.trim().length > 0);

  // Set initial profile data when editing
  useEffect(() => {
    if (isEditMode && profileToEdit) {
      // No longer setting the value - only populate image
      if (profileToEdit.image) {
        setProfileImage(profileToEdit.image);
      }
    }
  }, [isEditMode, profileToEdit]);

  // Close modal when clicking outside
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

  // Handle image upload
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setImageError("");

    if (file) {
      // Check file size (1MB = 1048576 bytes)
      if (file.size > 1048576) {
        setImageError(
          t("profiles.image_size_error") || "Image must be less than 1MB"
        );
        return;
      }

      // Preview image
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!profileNameIsValid) {
      return;
    }

    const profileData = {
      name: profileName,
      image: profileImage,
    };

    try {
      let response;

      if (isEditMode) {
        // Validate profile ID
        if (!profileToEdit?.id) {
          showError(
            t("profiles.missing_profile_id") || "Profile ID is missing"
          );
          return;
        }
        // Submit edit request
        response = await postData(
          `edit-profile/${profileToEdit.id}`,
          profileData,
          token
        );
      } else {
        // Submit create request
        response = await postData("create-profile", profileData, token);
      }

      // Handle response
      if (response.success) {
        setProfiles(response?.data?.profiles);
        onClose();
        profileNameReset();
      } else {
        showError(response.message || "api.fetch.error");
      }
    } catch (error) {
      showError("api.fetch.error");
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
        isOpen ? "flex" : "hidden"
      }`}
    >
      <div
        className="bg-white rounded-xl p-8 shadow-xl max-w-md w-full mx-4"
        ref={modalRef}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-16">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditMode
              ? t("profiles.edit_profile")
              : t("profiles.add_profile")}
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center mb-4">
            <div
              onClick={triggerFileInput}
              className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors"
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />
            <p className="text-sm text-gray-500 mt-2">
              {t("profiles.upload_image") || "Upload Image"}
            </p>
            {imageError && (
              <p className="text-red-500 text-xs mt-1">{imageError}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {t("profiles.max_file_size") || "Max file size: 1MB"}
            </p>
          </div>

          {/* Profile Name Input */}
          <div>
            <Input
              isWhite={true}
              type="text"
              placeholder={
                isEditMode ? profileToEdit?.name : t("profiles.profile_name")
              }
              value={profileName}
              onChange={profileNameChangeHandler}
              onBlur={profileNameBlurHandler}
              onFocus={profileNameFocusHandler}
              hasError={profileNameHasError}
              errorText={
                t("profiles.profile_name_required") ||
                "Profile name is required"
              }
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t("buttons.cancel") || "Cancel"}
            </button>
            <button
              type="submit"
              disabled={!profileNameIsValid}
              className={`flex-1 py-2 px-4 flex items-center justify-center rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors ${
                !profileNameIsValid ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <Spinner isWhite={true} />
              ) : (
                <>
                  {isEditMode
                    ? t("profiles.update_profile")
                    : t("profiles.add_profile")}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProfileForm;
