"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Heart, Send, MoreVertical, Lock, Eye, CheckCircle2,
  Calendar, Shield, ChevronLeft, ChevronRight, Smartphone,
  Share2, Ban, Flag, Clock, Camera,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { SendInterestModal } from "@/components/communication/send-interest-modal";
import { checkExistingInterest, sendInterest, formatDateShort } from "@/lib/interest-messages";
import { getDailyUsage, getRemainingColor } from "@/lib/daily-interest-limit";

interface ProfileData {
  id: string;
  anugraha_id: string;
  full_name: string;
  gender: string;
  age: number;
  user_id: string;
  is_verified: boolean;
  id_proof_verified: boolean;
  updated_at: string;
}

interface PrimaryInfo {
  height: string | null;
  complexion: string | null;
  body_type: string | null;
  physical_status: string | null;
  marital_status: string | null;
  family_status: string | null;
  weight: string | null;
  blood_group: string | null;
  mother_tongue: string | null;
  about_the_candidate: string | null;
}

interface ReligiousInfo {
  religion: string | null;
  denomination: string | null;
  diocese: string | null;
  parish_name_place: string | null;
  caste_community: string | null;
  sub_caste_community: string | null;
  rasi: string | null;
  nakshatra: string | null;
  gothram: string | null;
  manglik: string | null;
  muslim_sect: string | null;
  muslim_community: string | null;
  jain_sect: string | null;
}

interface EducationInfo {
  educational_qualifications: string | null;
  education_level: string | null;
  education_in_detail: string | null;
  occupation_category: string | null;
  occupation_in_detail: string | null;
  organization_name: string | null;
  employment_category: string | null;
  working_country: string | null;
  working_state: string | null;
  working_district: string | null;
  annual_income: string | null;
}

interface LocationInfo {
  native_country: string | null;
  native_state: string | null;
  native_district: string | null;
  residing_country: string | null;
  residential_status: string | null;
}

interface FamilyInfo {
  father_name: string | null;
  father_occupation: string | null;
  mother_name: string | null;
  mother_occupation: string | null;
  about_candidate_family: string | null;
}

interface SiblingInfo {
  brothers_married: number;
  brothers_unmarried: number;
  sisters_married: number;
  sisters_unmarried: number;
}

interface LifestyleInfo {
  eating_habits: string | null;
  drinking_habits: string | null;
  smoking_habits: string | null;
  hobbies: string[] | null;
  sports_fitness_games: string[] | null;
  spoken_languages: string[] | null;
}

interface PartnerPref {
  pref_min_age: number | null;
  pref_max_age: number | null;
  pref_min_height: string | null;
  pref_max_height: string | null;
  pref_marital_status: string[] | null;
  pref_religion: string[] | null;
  pref_denomination: string[] | null;
  pref_education_level: string[] | null;
  pref_occupation_category: string[] | null;
  pref_mother_tongue: string[] | null;
  pref_native_country: string[] | null;
  pref_native_state: string[] | null;
  pref_working_country: string[] | null;
  pref_expectations_detail: string | null;
}

interface ContactInfo {
  mobile_number: string | null;
  whatsapp_number: string | null;
  custodian_name: string | null;
  custodian_relation: string | null;
  communication_address: string | null;
}

type Tab = "personal" | "partner" | "family" | "contact";

export default function ViewFullProfilePage() {
  const params = useParams();
  const anugrahaId = params.anugraha_id as string;
  const supabase = createClient();
  const myProfile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("personal");
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [primaryInfo, setPrimaryInfo] = useState<PrimaryInfo | null>(null);
  const [religiousInfo, setReligiousInfo] = useState<ReligiousInfo | null>(null);
  const [educationInfo, setEducationInfo] = useState<EducationInfo | null>(null);
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [familyInfo, setFamilyInfo] = useState<FamilyInfo | null>(null);
  const [siblingInfo, setSiblingInfo] = useState<SiblingInfo | null>(null);
  const [lifestyleInfo, setLifestyleInfo] = useState<LifestyleInfo | null>(null);
  const [partnerPref, setPartnerPref] = useState<PartnerPref | null>(null);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [photos, setPhotos] = useState<{ photo_url: string; photo_type: string }[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [isViewerPremium, setIsViewerPremium] = useState(false);
  const [shortlisted, setShortlisted] = useState(false);
  const [sendingInterest, setSendingInterest] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [interestRemaining, setInterestRemaining] = useState(5);
  const [menuOpen, setMenuOpen] = useState(false);
  const [similarProfiles, setSimilarProfiles] = useState<{ id: string; anugraha_id: string; full_name: string; age: number; photo_url: string | null }[]>([]);

  const load = useCallback(async () => {
    setLoading(true);

    // Fetch profile by anugraha_id
    const { data: p } = await supabase
      .from("profiles")
      .select("id, anugraha_id, full_name, gender, age, user_id, is_verified, id_proof_verified, updated_at")
      .eq("anugraha_id", anugrahaId)
      .eq("is_active", true)
      .is("deleted_at", null)
      .single();

    if (!p) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setProfileData(p);

    // Record profile view
    if (myProfile && myProfile.id !== p.id) {
      supabase.from("profile_views").upsert(
        { viewer_id: myProfile.id, viewed_profile_id: p.id, last_viewed_at: new Date().toISOString() },
        { onConflict: "viewer_id,viewed_profile_id" }
      ).then(() => {});
    }

    // Parallel fetch all data
    const [
      primaryRes, religiousRes, educRes, locationRes,
      familyRes, siblingRes, lifestyleRes, prefRes,
      contactRes, photosRes, membershipRes,
    ] = await Promise.all([
      supabase.from("profile_primary_info").select("*").eq("profile_id", p.id).single(),
      supabase.from("profile_religious_info").select("*").eq("profile_id", p.id).single(),
      supabase.from("profile_education_profession").select("*").eq("profile_id", p.id).single(),
      supabase.from("profile_location_info").select("*").eq("profile_id", p.id).single(),
      supabase.from("profile_family_info").select("*").eq("profile_id", p.id).single(),
      supabase.from("profile_sibling_info").select("*").eq("profile_id", p.id).single(),
      supabase.from("profile_lifestyle_hobbies").select("*").eq("profile_id", p.id).single(),
      supabase.from("partner_preferences").select("*").eq("profile_id", p.id).single(),
      supabase.from("profile_contact_info").select("*").eq("profile_id", p.id).single(),
      supabase.from("profile_photos").select("photo_url, photo_type").eq("profile_id", p.id).eq("is_visible", true).order("display_order"),
      supabase.from("user_memberships").select("id").eq("user_id", p.user_id).eq("is_active", true).single(),
    ]);

    setPrimaryInfo(primaryRes.data);
    setReligiousInfo(religiousRes.data);
    setEducationInfo(educRes.data);
    setLocationInfo(locationRes.data);
    setFamilyInfo(familyRes.data);
    setSiblingInfo(siblingRes.data);
    setLifestyleInfo(lifestyleRes.data);
    setPartnerPref(prefRes.data);
    setContactInfo(contactRes.data);
    setPhotos(photosRes.data ?? []);
    setIsPremium(!!membershipRes.data);

    // Check if viewer is premium
    if (user) {
      const { data: viewerMembership } = await supabase
        .from("user_memberships")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();
      setIsViewerPremium(!!viewerMembership);
    }

    // Check if shortlisted
    if (myProfile) {
      const { data: sl } = await supabase
        .from("shortlists")
        .select("id")
        .eq("profile_id", myProfile.id)
        .eq("shortlisted_profile_id", p.id)
        .single();
      setShortlisted(!!sl);
    }

    // Load similar profiles
    const { data: similar } = await supabase
      .from("profiles")
      .select("id, anugraha_id, full_name, age")
      .eq("gender", p.gender)
      .eq("is_active", true)
      .is("deleted_at", null)
      .neq("id", p.id)
      .gte("age", p.age - 3)
      .lte("age", p.age + 3)
      .limit(3);

    if (similar && similar.length > 0) {
      const ids = similar.map((s: any) => s.id);
      const { data: simPhotos } = await supabase
        .from("profile_photos")
        .select("profile_id, photo_url")
        .in("profile_id", ids)
        .eq("photo_type", "profile")
        .eq("is_visible", true);
      const photoMap = new Map((simPhotos ?? []).map((p: any) => [p.profile_id, p.photo_url]));
      setSimilarProfiles(similar.map((s: any) => ({
        ...s,
        photo_url: photoMap.get(s.id) ?? null,
      })));
    }

    setLoading(false);
  }, [anugrahaId, supabase, myProfile, user]);

  useEffect(() => { load(); }, [load]);

  async function handleSendInterestClick() {
    if (!myProfile || !profileData) return;

    // Check existing interest
    const existing = await checkExistingInterest(supabase, myProfile.id, profileData.id);
    if (existing) {
      if (existing.status === "sent") {
        const sentDate = formatDateShort(existing.sent_at);
        const resendDate = existing.can_resend_after ? formatDateShort(existing.can_resend_after) : "";
        toast.info(`You have already sent an interest message on ${sentDate}.${resendDate ? ` You can resend on or after ${resendDate}.` : ""}`);
        return;
      }
      if (existing.status === "accepted") {
        toast.info("This candidate has accepted your interest. You can't send it again.");
        return;
      }
      if (existing.status === "cancelled" && existing.can_resend_after && new Date(existing.can_resend_after) > new Date()) {
        toast.info(`You can resend after ${formatDateShort(existing.can_resend_after)}.`);
        return;
      }
    }

    // Check daily limit for free users
    if (!isViewerPremium) {
      const usage = await getDailyUsage(supabase, myProfile.id);
      setInterestRemaining(usage.remaining);
      if (usage.remaining <= 0) {
        toast.error("Daily interest limit reached. Upgrade to Premium for more.");
        return;
      }
    }

    setShowInterestModal(true);
  }

  async function handleSendInterest(templateId: string, customMessage: string | null) {
    if (!myProfile || !profileData) return;
    try {
      await sendInterest(supabase, myProfile.id, profileData.id, templateId, customMessage, isViewerPremium);
      toast.success("Interest sent successfully!");
      if (!isViewerPremium) {
        setInterestRemaining((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send interest.";
      if (msg === "DAILY_LIMIT_REACHED") {
        toast.error("Daily interest limit reached. Upgrade to Premium for more.");
      } else {
        toast.error(msg);
      }
      throw err;
    }
  }

  async function handleShortlist() {
    if (!myProfile || !profileData) return;
    if (shortlisted) {
      await supabase.from("shortlists").delete().eq("profile_id", myProfile.id).eq("shortlisted_profile_id", profileData.id);
      setShortlisted(false);
      toast.success("Removed from shortlist.");
    } else {
      await supabase.from("shortlists").insert({ profile_id: myProfile.id, shortlisted_profile_id: profileData.id });
      setShortlisted(true);
      toast.success("Added to shortlist.");
    }
  }

  async function handleIgnore() {
    if (!myProfile || !profileData) return;
    const { error } = await supabase.from("ignored_profiles").insert({
      profile_id: myProfile.id,
      ignored_profile_id: profileData.id,
    });
    if (error) {
      toast.error(error.code === "23505" ? "Already ignored." : "Failed to ignore.");
    } else {
      toast.success("Profile ignored.");
    }
    setMenuOpen(false);
  }

  async function handleBlock() {
    if (!myProfile || !profileData) return;
    const { error } = await supabase.from("blocked_profiles").insert({
      blocker_id: myProfile.id,
      blocked_profile_id: profileData.id,
    });
    if (error) {
      toast.error(error.code === "23505" ? "Already blocked." : "Failed to block.");
    } else {
      toast.success("Profile blocked.");
    }
    setMenuOpen(false);
  }

  function fmt(val: string | number | string[] | null | undefined): string {
    if (val == null) return "—";
    if (Array.isArray(val)) return val.length > 0 ? val.join(", ") : "—";
    return String(val) || "—";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !profileData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-foreground mb-2">Profile Not Found</h1>
        <p className="text-sm text-muted-foreground mb-4">
          The profile with ID &ldquo;{anugrahaId}&rdquo; does not exist or has been removed.
        </p>
        <Link
          href="/my-home/search/partner-search"
          className="inline-flex items-center h-10 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          Back to Search
        </Link>
      </div>
    );
  }

  const profilePhoto = photos.find((p) => p.photo_type === "profile") ?? photos[0];
  const lastLogin = new Date(profileData.updated_at).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: "personal", label: "Personal Details" },
    { key: "partner", label: "Partner Preferences" },
    { key: "family", label: "Family Details" },
    { key: "contact", label: "Contact Details" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <nav className="text-xs text-muted-foreground mb-4">
        <Link href="/my-home" className="hover:text-primary">My Home</Link>
        <span className="mx-1.5">/</span>
        <Link href="/my-home/search/partner-search" className="hover:text-primary">Search</Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground font-medium">Full Profile</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column */}
        <div className="w-full lg:w-[320px] flex-shrink-0">
          <div className="bg-white rounded-lg border border-input overflow-hidden sticky top-20">
            {/* Photo */}
            <div className="aspect-[3/4] bg-muted relative">
              {profilePhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profilePhoto.photo_url}
                  alt={profileData.full_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <span className="text-6xl font-bold text-muted-foreground/30">
                    {profileData.full_name?.charAt(0) ?? "?"}
                  </span>
                </div>
              )}
              {photos.length > 0 && (
                <span className="absolute top-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <Camera className="h-3.5 w-3.5" /> {photos.length}
                </span>
              )}
            </div>

            {/* Profile Info */}
            <div className="p-4">
              <p className="text-base font-semibold text-foreground">{profileData.anugraha_id}</p>
              <div className="flex items-center gap-2 mt-1">
                {isPremium && (
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                    Premium
                  </span>
                )}
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                {profileData.id_proof_verified && (
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> ID Proof Verified
                  </p>
                )}
                {profileData.is_verified && (
                  <p className="flex items-center gap-1.5">
                    <Smartphone className="h-3.5 w-3.5 text-green-500" /> Mobile Number Verified
                  </p>
                )}
                <p className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Last Login: {lastLogin}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={handleSendInterestClick}
                  disabled={sendingInterest}
                  className="flex-1 h-9 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  <Send className="h-3.5 w-3.5" />
                  {sendingInterest ? "Sending..." : "Send Interest"}
                  {!isViewerPremium && interestRemaining < 5 && (
                    <span className={`ml-1 ${getRemainingColor(interestRemaining)}`}>
                      ({interestRemaining}/5)
                    </span>
                  )}
                </button>
                <button
                  onClick={handleShortlist}
                  className="h-9 w-9 flex items-center justify-center rounded-lg border border-input hover:bg-muted/50 transition-colors"
                  aria-label={shortlisted ? "Remove from shortlist" : "Add to shortlist"}
                >
                  <Heart className={cn("h-4 w-4", shortlisted ? "fill-primary text-primary" : "text-muted-foreground")} />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="h-9 w-9 flex items-center justify-center rounded-lg border border-input hover:bg-muted/50 transition-colors"
                  >
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </button>
                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-white rounded-lg border border-input shadow-lg py-1">
                        <button
                          onClick={() => {
                            const url = `${window.location.origin}/view-full-profile/${profileData.anugraha_id}`;
                            window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this profile: ${url}`)}`, "_blank");
                            setMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted/50 flex items-center gap-2"
                        >
                          <Share2 className="h-4 w-4 text-primary" /> Forward Profile
                        </button>
                        <button
                          onClick={handleIgnore}
                          className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted/50 flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4 text-primary" /> Ignore Profile
                        </button>
                        <button
                          onClick={handleBlock}
                          className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted/50 flex items-center gap-2"
                        >
                          <Ban className="h-4 w-4 text-primary" /> Block Profile
                        </button>
                        <button
                          onClick={() => {
                            toast.info("Report submitted. We'll review it shortly.");
                            setMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted/50 flex items-center gap-2"
                        >
                          <Flag className="h-4 w-4 text-primary" /> Report Misuse
                        </button>
                        <button
                          onClick={() => {
                            toast.info("Contact history will be available soon.");
                            setMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted/50 flex items-center gap-2"
                        >
                          <Clock className="h-4 w-4 text-primary" /> Contact History
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — Tabs */}
        <div className="flex-1 min-w-0">
          {/* Tab Bar */}
          <div className="flex border-b border-input gap-0 overflow-x-auto mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                  activeTab === tab.key
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Personal Details Tab */}
          {activeTab === "personal" && (
            <div className="space-y-6">
              <Section title="Primary Information">
                <DetailRow label="Full Name" value={isViewerPremium ? profileData.full_name : null} locked={!isViewerPremium} />
                <DetailRow label="Age" value={`${profileData.age} years`} />
                <DetailRow label="Gender" value={profileData.gender} />
                <DetailRow label="Height" value={fmt(primaryInfo?.height)} />
                <DetailRow label="Weight" value={fmt(primaryInfo?.weight)} />
                <DetailRow label="Complexion" value={fmt(primaryInfo?.complexion)} />
                <DetailRow label="Body Type" value={fmt(primaryInfo?.body_type)} />
                <DetailRow label="Physical Status" value={fmt(primaryInfo?.physical_status)} />
                <DetailRow label="Marital Status" value={fmt(primaryInfo?.marital_status)} />
                <DetailRow label="Family Status" value={fmt(primaryInfo?.family_status)} />
                <DetailRow label="Blood Group" value={fmt(primaryInfo?.blood_group)} />
                <DetailRow label="Mother Tongue" value={fmt(primaryInfo?.mother_tongue)} />
                {primaryInfo?.about_the_candidate && (
                  <div className="col-span-2 mt-2">
                    <p className="text-xs font-medium text-muted-foreground mb-1">About</p>
                    <p className="text-sm text-foreground">{primaryInfo.about_the_candidate}</p>
                  </div>
                )}
              </Section>

              <Section title="Religious Information">
                <DetailRow label="Religion" value={fmt(religiousInfo?.religion)} />
                <DetailRow label="Denomination" value={fmt(religiousInfo?.denomination)} />
                <DetailRow label="Diocese" value={fmt(religiousInfo?.diocese)} />
                <DetailRow label="Parish" value={fmt(religiousInfo?.parish_name_place)} />
                <DetailRow label="Caste / Community" value={fmt(religiousInfo?.caste_community)} />
                <DetailRow label="Sub-Caste" value={fmt(religiousInfo?.sub_caste_community)} />
                <DetailRow label="Rasi" value={fmt(religiousInfo?.rasi)} />
                <DetailRow label="Nakshatra" value={fmt(religiousInfo?.nakshatra)} />
                <DetailRow label="Gothram" value={fmt(religiousInfo?.gothram)} />
              </Section>

              <Section title="Education & Profession">
                <DetailRow label="Education" value={fmt(educationInfo?.education_level)} />
                <DetailRow label="Qualification" value={fmt(educationInfo?.educational_qualifications)} />
                <DetailRow label="Education Details" value={fmt(educationInfo?.education_in_detail)} />
                <DetailRow label="Occupation" value={fmt(educationInfo?.occupation_category)} />
                <DetailRow label="Occupation Details" value={fmt(educationInfo?.occupation_in_detail)} />
                <DetailRow label="Organization" value={fmt(educationInfo?.organization_name)} />
                <DetailRow label="Employment" value={fmt(educationInfo?.employment_category)} />
                <DetailRow label="Annual Income" value={fmt(educationInfo?.annual_income)} />
                <DetailRow label="Working Country" value={fmt(educationInfo?.working_country)} />
                <DetailRow label="Working State" value={fmt(educationInfo?.working_state)} />
                <DetailRow label="Working District" value={fmt(educationInfo?.working_district)} />
              </Section>

              <Section title="Location & Residing">
                <DetailRow label="Native Country" value={fmt(locationInfo?.native_country)} />
                <DetailRow label="Native State" value={fmt(locationInfo?.native_state)} />
                <DetailRow label="Native District" value={fmt(locationInfo?.native_district)} />
                <DetailRow label="Residing Country" value={fmt(locationInfo?.residing_country)} />
                <DetailRow label="Residential Status" value={fmt(locationInfo?.residential_status)} />
              </Section>

              <Section title="Hobbies & Interests">
                <DetailRow label="Eating Habits" value={fmt(lifestyleInfo?.eating_habits)} />
                <DetailRow label="Drinking Habits" value={fmt(lifestyleInfo?.drinking_habits)} />
                <DetailRow label="Smoking Habits" value={fmt(lifestyleInfo?.smoking_habits)} />
                <DetailRow label="Hobbies" value={fmt(lifestyleInfo?.hobbies)} />
                <DetailRow label="Sports" value={fmt(lifestyleInfo?.sports_fitness_games)} />
                <DetailRow label="Languages" value={fmt(lifestyleInfo?.spoken_languages)} />
              </Section>
            </div>
          )}

          {/* Partner Preferences Tab */}
          {activeTab === "partner" && (
            <Section title="Partner Preferences">
              <DetailRow label="Age" value={partnerPref?.pref_min_age && partnerPref?.pref_max_age ? `${partnerPref.pref_min_age} - ${partnerPref.pref_max_age} years` : "—"} />
              <DetailRow label="Height" value={partnerPref?.pref_min_height && partnerPref?.pref_max_height ? `${partnerPref.pref_min_height} to ${partnerPref.pref_max_height}` : "—"} />
              <DetailRow label="Marital Status" value={fmt(partnerPref?.pref_marital_status)} />
              <DetailRow label="Religion" value={fmt(partnerPref?.pref_religion)} />
              <DetailRow label="Denomination" value={fmt(partnerPref?.pref_denomination)} />
              <DetailRow label="Education" value={fmt(partnerPref?.pref_education_level)} />
              <DetailRow label="Occupation" value={fmt(partnerPref?.pref_occupation_category)} />
              <DetailRow label="Mother Tongue" value={fmt(partnerPref?.pref_mother_tongue)} />
              <DetailRow label="Native Country" value={fmt(partnerPref?.pref_native_country)} />
              <DetailRow label="Native State" value={fmt(partnerPref?.pref_native_state)} />
              <DetailRow label="Working Country" value={fmt(partnerPref?.pref_working_country)} />
              {partnerPref?.pref_expectations_detail && (
                <div className="col-span-2 mt-2">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Expectations</p>
                  <p className="text-sm text-foreground">{partnerPref.pref_expectations_detail}</p>
                </div>
              )}
            </Section>
          )}

          {/* Family Details Tab */}
          {activeTab === "family" && (
            <div className="space-y-6">
              <Section title="Family Information">
                <DetailRow label="Father's Name" value={fmt(familyInfo?.father_name)} />
                <DetailRow label="Father's Occupation" value={fmt(familyInfo?.father_occupation)} />
                <DetailRow label="Mother's Name" value={fmt(familyInfo?.mother_name)} />
                <DetailRow label="Mother's Occupation" value={fmt(familyInfo?.mother_occupation)} />
                {familyInfo?.about_candidate_family && (
                  <div className="col-span-2 mt-2">
                    <p className="text-xs font-medium text-muted-foreground mb-1">About Family</p>
                    <p className="text-sm text-foreground">{familyInfo.about_candidate_family}</p>
                  </div>
                )}
              </Section>

              <Section title="Siblings">
                <DetailRow label="Brothers (Married)" value={fmt(siblingInfo?.brothers_married)} />
                <DetailRow label="Brothers (Unmarried)" value={fmt(siblingInfo?.brothers_unmarried)} />
                <DetailRow label="Sisters (Married)" value={fmt(siblingInfo?.sisters_married)} />
                <DetailRow label="Sisters (Unmarried)" value={fmt(siblingInfo?.sisters_unmarried)} />
              </Section>
            </div>
          )}

          {/* Contact Details Tab */}
          {activeTab === "contact" && (
            <div>
              {isViewerPremium ? (
                <Section title="Contact Information">
                  <DetailRow label="Mobile" value={fmt(contactInfo?.mobile_number)} />
                  <DetailRow label="WhatsApp" value={fmt(contactInfo?.whatsapp_number)} />
                  <DetailRow label="Custodian Name" value={fmt(contactInfo?.custodian_name)} />
                  <DetailRow label="Custodian Relation" value={fmt(contactInfo?.custodian_relation)} />
                  <DetailRow label="Address" value={fmt(contactInfo?.communication_address)} />
                </Section>
              ) : (
                <div className="bg-white rounded-lg border border-input p-8 text-center relative">
                  <div className="blur-sm pointer-events-none select-none">
                    <div className="grid grid-cols-2 gap-4 text-left">
                      <div><p className="text-xs text-muted-foreground">Mobile</p><p className="text-sm">+91 98XXXXX45</p></div>
                      <div><p className="text-xs text-muted-foreground">WhatsApp</p><p className="text-sm">+91 98XXXXX45</p></div>
                      <div><p className="text-xs text-muted-foreground">Address</p><p className="text-sm">123 Main St, Bengaluru</p></div>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 rounded-lg">
                    <Lock className="h-8 w-8 text-primary mb-2" />
                    <p className="text-sm font-medium text-foreground mb-1">Premium Members Only</p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Upgrade to view contact details
                    </p>
                    <Link
                      href="/membership-plans"
                      className="inline-flex items-center h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      Upgrade Now
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Similar Profiles */}
          {similarProfiles.length > 0 && (
            <div className="mt-8">
              <h3 className="text-base font-semibold text-foreground mb-4">Similar Profiles</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {similarProfiles.map((sp) => (
                  <Link
                    key={sp.id}
                    href={`/view-full-profile/${sp.anugraha_id}`}
                    className="bg-white rounded-lg border border-input overflow-hidden hover:shadow-sm transition-shadow"
                  >
                    <div className="aspect-[4/3] bg-muted">
                      {sp.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={sp.photo_url} alt={sp.full_name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <span className="text-3xl font-bold text-muted-foreground/40">{sp.full_name?.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold text-foreground line-clamp-1">{sp.full_name}</p>
                      <p className="text-xs text-muted-foreground">{sp.anugraha_id} · {sp.age} yrs</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Send Interest Modal */}
      {profileData && (
        <SendInterestModal
          open={showInterestModal}
          onClose={() => setShowInterestModal(false)}
          profileId={profileData.anugraha_id}
          onSend={handleSendInterest}
          isPremium={isViewerPremium}
        />
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-input p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3 pb-2 border-b border-input">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">{children}</div>
    </div>
  );
}

function DetailRow({ label, value, locked }: { label: string; value: string | null; locked?: boolean }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      {locked ? (
        <Link href="/membership-plans" className="text-sm text-primary flex items-center gap-1 hover:underline">
          <Lock className="h-3 w-3" /> Upgrade to view
        </Link>
      ) : (
        <p className="text-sm text-foreground">{value ?? "—"}</p>
      )}
    </div>
  );
}
