import React, { useState, useEffect } from "react";
import Container from "Components/Container/Container";
import { useTranslation } from "react-i18next";
import { useContext } from "react";
import { LoginAuthContext } from "Context/Authentication/LoginAuth";
import AddProfileForm from "./AddProfileForm/AddProfileForm";
import DeleteProfileModal from "./DeleteProfileModal/DeleteProfileModal";
import { Link } from "react-router-dom";

const ManageProfiles = () => {
  const { t } = useTranslation();
  const { profiles, allowedProfiles, setSelectedUserState } =
    useContext(LoginAuthContext);
  const [isAddProfileFormOpen, setIsAddProfileFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isManageMode, setIsManageMode] = useState(false);

  // No auto-open - user should manually click to add profile

  // Profile colors - calmer, more muted colors
  const profileColors = [
    "bg-sky-700", // Calm blue
    "bg-emerald-600", // Soft green
    "bg-amber-500", // Warm amber
    "bg-indigo-500", // Muted indigo
    "bg-rose-500", // Soft rose
    "bg-teal-500", // Muted teal
    "bg-slate-500", // Neutral slate
  ];

  // Function to get color based on profile index
  const getProfileColor = (index) => {
    return profileColors[index % profileColors.length];
  };

  // Check if we can add more profiles
  const canAddProfile = profiles?.length < allowedProfiles;

  // Open edit profile form
  const handleEditProfile = (profile) => {
    setSelectedProfile(profile);
    setIsAddProfileFormOpen(true);
  };

  // Open delete profile modal
  const handleDeleteProfile = (profile) => {
    setSelectedProfile(profile);
    setIsDeleteModalOpen(true);
  };

  // Toggle manage mode
  const toggleManageMode = () => {
    setIsManageMode(!isManageMode);
  };

  return (
    <section className="fixed h-[100vh] w-[100vw] bg-black z-[1000000000] inset-0 flex items-center justify-center overflow-y-auto py-8">
      <Container>
        <h2 className="text-white text-center mb-8 md:mb-16 text-2xl md:text-4xl font-bold px-4">
          {t("profiles.whos_watching")}
        </h2>

        <div className="flex items-center justify-center flex-wrap gap-4 md:gap-10 px-2">
          {profiles &&
            profiles?.map((profile, index) => (
              <div key={profile.id} className="relative">
                <Link
                  onClick={() => {
                    setSelectedUserState(profile);
                  }}
                  to={`/categories`}
                  state={{ isAuthenticated: true }}
                  className="flex flex-col items-center gap-y-2 group"
                >
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={`${profile.name}'s avatar`}
                      className="object-cover flex rounded-full items-center justify-center text-3xl md:text-5xl font-bold text-white gap-x-4 w-20 h-20 md:w-32 md:h-32 p-1"
                    />
                  ) : (
                    <div
                      className={`flex rounded-full items-center justify-center text-3xl md:text-5xl font-bold text-white gap-x-4 ${getProfileColor(
                        index
                      )} w-20 h-20 md:w-32 md:h-32 p-2 md:p-4`}
                    >
                      {profile.name.charAt(0)}
                    </div>
                  )}
                  <p className="text-lightWhite font-bold mt-1 md:mt-2 text-base md:text-xl group-hover:text-white">
                    {profile.name}
                  </p>
                </Link>

                {/* Management options dropdown */}
                {isManageMode && (
                  <div className="top-full mt-2 z-10 w-full flex flex-col gap-y-2">
                    <button
                      onClick={() => handleEditProfile(profile)}
                      className="bg-lightGrey text-xs md:text-sm text-white px-3 py-1 md:px-4 md:py-2 rounded-md"
                    >
                      {t("profiles.edit_profile")}
                    </button>
                    <button
                      onClick={() => handleDeleteProfile(profile)}
                      className="bg-primary text-xs md:text-sm text-white px-3 py-1 md:px-4 md:py-2 rounded-md"
                    >
                      {t("profiles.delete_profile")}
                    </button>
                  </div>
                )}
              </div>
            ))}

          {canAddProfile && (
            <button
              onClick={() => {
                setSelectedProfile(null);
                setIsAddProfileFormOpen(true);
              }}
              className="flex flex-col items-center gap-y-2 group"
            >
              <div className="flex rounded-full items-center justify-center text-4xl md:text-6xl font-bold text-white border-2 border-gray-400 border-dashed w-20 h-20 md:w-32 md:h-32 p-2 md:p-4 hover:border-white">
                +
              </div>
              <p className="text-lightWhite font-bold mt-1 md:mt-2 text-base md:text-xl group-hover:text-white">
                {t("profiles.add_profile")}
              </p>
            </button>
          )}
        </div>

        {/* Manage Profile Button */}
        <div className="flex justify-center mt-8 md:mt-16">
          <button
            onClick={toggleManageMode}
            className={`py-1.5 md:py-2 px-4 md:px-6 rounded-md font-medium transition-colors mt-primary text-sm md:text-base ${
              isManageMode
                ? "bg-gray-700 text-white"
                : "bg-primary text-white hover:bg-primary-dark"
            }`}
          >
            {isManageMode ? t("general.close") : t("profiles.manage_profile")}
          </button>
        </div>
      </Container>

      {/* Add/Edit Profile Form */}
      <AddProfileForm
        isOpen={isAddProfileFormOpen}
        onClose={() => {
          setIsAddProfileFormOpen(false);
          setSelectedProfile(null);
        }}
        profileToEdit={selectedProfile}
      />

      {/* Delete Profile Confirmation */}
      <DeleteProfileModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedProfile(null);
        }}
        profile={selectedProfile}
      />
    </section>
  );
};

export default ManageProfiles;
