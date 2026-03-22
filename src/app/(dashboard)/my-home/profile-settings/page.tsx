"use client";

import { useState } from "react";
import { SettingsSidebar, type SettingsSection } from "@/components/profile/settings/settings-sidebar";
import ProfileFiltersForm from "@/components/profile/settings/profile-filters-form";
import ManageAlertsForm from "@/components/profile/settings/manage-alerts-form";
import SearchVisibilityForm from "@/components/profile/settings/search-visibility-form";
import HideProfileForm from "@/components/profile/settings/hide-profile-form";
import DeleteProfileFlow from "@/components/profile/settings/delete-profile-flow";
import ChangePasswordForm from "@/components/profile/settings/change-password-form";
import LogoutSection from "@/components/profile/settings/logout-section";

export default function ProfileSettingsPage() {
  const [active, setActive] = useState<SettingsSection>("profile-filters");
  const [showLogout, setShowLogout] = useState(false);

  function handleChange(section: SettingsSection) {
    if (section === "logout") {
      setShowLogout(true);
      return;
    }
    setActive(section);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground mb-4">
        <span>My Home</span>
        <span className="mx-1.5">/</span>
        <span className="text-foreground font-medium">Profile Settings</span>
      </nav>

      <h1 className="text-xl font-bold text-foreground mb-6">Profile Settings</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        <SettingsSidebar active={active} onChange={handleChange} />

        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-lg border border-input p-5">
            {active === "profile-filters" && <ProfileFiltersForm />}
            {active === "manage-alerts" && <ManageAlertsForm />}
            {active === "search-visibility" && <SearchVisibilityForm />}
            {active === "hide-profile" && <HideProfileForm />}
            {active === "delete-profile" && <DeleteProfileFlow />}
            {active === "change-password" && <ChangePasswordForm />}
          </div>
        </div>
      </div>

      <LogoutSection isOpen={showLogout} onClose={() => setShowLogout(false)} />
    </div>
  );
}
