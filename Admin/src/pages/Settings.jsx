import React, { useState, useEffect } from "react";
import { db } from "../../Backend/firebaseConfig.js";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getAuth, reauthenticateWithCredential, updatePassword, EmailAuthProvider } from "firebase/auth";

const IconPlaceholder = ({ name, style }) => (
  <span style={style} aria-hidden="true">
    {name === "lock-closed" && "🔒"}
    {name === "business" && "🏢"}
    {name === "location" && "📍"}
    {name === "call" && "📞"}
    {name === "telephone" && "☎️"}
    {name === "eye" && "👁️"}
    {name === "eye-off" && "👁️‍🗨️"}
    {name === "save" && "💾"}
    {name === "envelope" && "✉️"}
    {name === "calendar" && "📅"}
    {name === "close" && "❌"}
    {name === "information-circle" && "ℹ️"}
  </span>
);

const TabButton = ({ isActive, onPress, icon, title }) => (
  <button
    onClick={onPress}
    className={`flex-1 py-3 px-4 mx-1 rounded-md flex items-center justify-center transition-colors duration-200 ${
      isActive ? "bg-[#A68B69] text-white" : "bg-[#E6E6E6] text-gray-600 hover:bg-[#CAC8C5]"
    }`}
    style={{ border: "none", cursor: "pointer" }}
  >
    <IconPlaceholder name={icon} style={{ marginRight: 6 }} />
    <span className="font-medium text-sm">{title}</span>
  </button>
);

const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  secureTextEntry = false,
  showToggle = false,
  onToggle,
  showPassword,
  icon,
  multiline = false,
  error,
}) => (
  <div className="mb-4">
    <div className="flex items-center mb-1">
      {icon && <IconPlaceholder name={icon} style={{ marginRight: 4, color: "#A68B69" }} />}
      <label className="text-sm font-medium text-gray-700">{label}</label>
    </div>
    <div className="relative">
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-3 py-2 bg-white border-2 border-[#CAC8C5] rounded-md text-gray-800 focus:outline-none focus:border-[#A68B69] transition-colors duration-200 ${error ? "border-red-500" : ""}`}
          rows={4}
        />
      ) : (
        <input
          type={secureTextEntry && !showPassword ? "password" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-3 py-2 bg-white border-2 border-[#CAC8C5] rounded-md text-gray-800 focus:outline-none focus:border-[#A68B69] transition-colors duration-200 ${error ? "border-red-500" : ""}`}
        />
      )}
      {showToggle && (
        <button
          onClick={onToggle}
          className="absolute right-3 top-2.5"
          style={{ border: "none", background: "transparent" }}
          type="button"
        >
          <IconPlaceholder name={showPassword ? "eye-off" : "eye"} />
        </button>
      )}
    </div>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const SaveModal = ({ isVisible, onClose, onSave, title, message }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            style={{ border: "none", background: "transparent" }}
          >
            <IconPlaceholder name="close" />
          </button>
        </div>
        <p className="text-gray-600 mb-6 text-sm">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200"
            style={{ border: "none", cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-[#A68B69] text-white rounded-md hover:bg-[#8a7152] transition-colors duration-200"
            style={{ border: "none", cursor: "pointer" }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const Settings = () => {
  const [activeTab, setActiveTab] = useState("business");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [modalData, setModalData] = useState({
    title: "",
    message: "",
    onSave: () => {},
  });
  const [errors, setErrors] = useState({});

  // Business state and handlers
  const [businessData, setBusinessData] = useState({
    businessName: "",
    foundedYear: "",
    location: "",
    mission: "",
    vision: "",
    aboutUs: "",
  });
  const handleBusinessChange = (field, value) =>
    setBusinessData((prev) => ({ ...prev, [field]: value }));

  const handleBusinessSave = async () => {
    try {
      await setDoc(doc(db, "settings", "businessInfo"), businessData);
      setShowSaveModal(false);
      console.log("Business information saved successfully");
    } catch (error) {
      console.error("Error saving business info:", error);
      setModalData({
        title: "Error",
        message: "Failed to save business information. Please try again.",
        onSave: () => setShowSaveModal(false),
      });
    }
  };

  const handleBusinessSubmit = () => {
    const newErrors = {};
    if (!businessData.businessName) newErrors.businessName = "Business name is required";
    if (!businessData.foundedYear) newErrors.foundedYear = "Year founded is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setModalData({
        title: "Save Business Information",
        message: "Are you sure you want to save these changes?",
        onSave: handleBusinessSave,
      });
      setShowSaveModal(true);
    }
  };

  // Contact state and handlers
  const [contactData, setContactData] = useState({
    telephone1: "",
    telephone2: "",
    email: "",
    supportEmail: "",
  });
  const handleContactChange = (field, value) =>
    setContactData((prev) => ({ ...prev, [field]: value }));

  const handleContactSave = async () => {
    try {
      await setDoc(doc(db, "settings", "contactInfo"), contactData);
      setShowSaveModal(false);
      console.log("Contact information saved successfully");
    } catch (error) {
      console.error("Error saving contact info:", error);
      setModalData({
        title: "Error",
        message: "Failed to save contact information. Please try again.",
        onSave: () => setShowSaveModal(false),
      });
    }
  };

  const handleContactSubmit = () => {
    const newErrors = {};
    if (!contactData.email) newErrors.email = "General email is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setModalData({
        title: "Save Contact Information",
        message: "Are you sure you want to save these changes?",
        onSave: handleContactSave,
      });
      setShowSaveModal(true);
    }
  };

  // Password state and handlers
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const handlePasswordChange = (field, value) =>
    setPasswordData((prev) => ({ ...prev, [field]: value }));

  const handlePasswordSave = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("No user is signed in");

      const credential = EmailAuthProvider.credential(user.email, passwordData.oldPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwordData.newPassword);
      setShowSaveModal(false);
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setModalData({
        title: "Success",
        message: "Password updated successfully.",
        onSave: () => setShowSaveModal(false),
      });
      setShowSaveModal(true);
    } catch (error) {
      console.error("Error updating password:", error);
      setModalData({
        title: "Error",
        message: error.message || "Failed to update password. Please try again.",
        onSave: () => setShowSaveModal(false),
      });
      setShowSaveModal(true);
    }
  };

  const handlePasswordSubmit = () => {
    const newErrors = {};
    if (!passwordData.oldPassword) newErrors.oldPassword = "Current password is required";
    if (!passwordData.newPassword) newErrors.newPassword = "New password is required";
    if (!passwordData.confirmPassword) newErrors.confirmPassword = "Confirm password is required";
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "New password must be at least 6 characters";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setModalData({
        title: "Update Password",
        message: "Are you sure you want to update your password?",
        onSave: handlePasswordSave,
      });
      setShowSaveModal(true);
    }
  };

  // Load saved data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const businessRef = doc(db, "settings", "businessInfo");
        const contactRef = doc(db, "settings", "contactInfo");

        const businessSnap = await getDoc(businessRef);
        const contactSnap = await getDoc(contactRef);

        if (businessSnap.exists()) {
          setBusinessData(businessSnap.data());
        }
        if (contactSnap.exists()) {
          setContactData(contactSnap.data());
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    fetchData();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "business":
        return (
          <div className="bg-white rounded-lg shadow-md mx-4 mb-6 p-6">
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <IconPlaceholder name="business" style={{ color: "#A68B69" }} />
                <h2 className="text-xl font-semibold text-gray-800 ml-2">Business Information</h2>
              </div>
              <p className="text-gray-600 text-sm">Manage your core business details.</p>
            </div>
            <InputField
              label="Business Name"
              value={businessData.businessName}
              onChange={(val) => handleBusinessChange("businessName", val)}
              placeholder="Enter business name"
              error={errors.businessName}
            />
            <InputField
              label="Year Founded"
              value={businessData.foundedYear}
              onChange={(val) => handleBusinessChange("foundedYear", val)}
              placeholder="Enter the year your business was founded"
              icon="calendar"
              error={errors.foundedYear}
            />
            <InputField
              label="Business Location"
              value={businessData.location}
              onChange={(val) => handleBusinessChange("location", val)}
              placeholder="Enter complete business address"
              icon="location"
              multiline
            />
            <InputField
              label="About Us"
              value={businessData.aboutUs}
              onChange={(val) => handleBusinessChange("aboutUs", val)}
              placeholder="Tell your company's story and what makes you unique"
              multiline
              icon="information-circle"
            />
            <InputField
              label="Mission Statement"
              value={businessData.mission}
              onChange={(val) => handleBusinessChange("mission", val)}
              placeholder="Enter your company's mission statement"
              multiline
            />
            <InputField
              label="Vision Statement"
              value={businessData.vision}
              onChange={(val) => handleBusinessChange("vision", val)}
              placeholder="Enter your company's vision statement"
              multiline
            />
            <button
              onClick={handleBusinessSubmit}
              className="w-full py-3 px-6 bg-[#A68B69] text-white rounded-md flex items-center justify-center hover:bg-[#8a7152] transition-colors duration-200"
              style={{ border: "none", cursor: "pointer" }}
            >
              <IconPlaceholder name="save" />
              <span className="font-medium ml-2">Save Business Information</span>
            </button>
          </div>
        );
      case "contact":
        return (
          <div className="bg-white rounded-lg shadow-md mx-4 mb-6 p-6">
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <IconPlaceholder name="envelope" style={{ color: "#A68B69" }} />
                <h2 className="text-xl font-semibold text-gray-800 ml-2">Contact Us Information</h2>
              </div>
              <p className="text-gray-600 text-sm">Manage your business contact details.</p>
            </div>
            <InputField
              label="Telephone Number"
              value={contactData.telephone1}
              onChange={(val) => handleContactChange("telephone1", val)}
              placeholder="Enter your telephone number"
              icon="telephone"
            />
            <InputField
              label="Contact Number"
              value={contactData.telephone2}
              onChange={(val) => handleContactChange("telephone2", val)}
              placeholder="Enter a contact number (optional)"
              icon="call"
            />
            <InputField
              label="General Email"
              value={contactData.email}
              onChange={(val) => handleContactChange("email", val)}
              placeholder="Enter your general inquiry email"
              icon="envelope"
              error={errors.email}
            />
            <InputField
              label="Support Email"
              value={contactData.supportEmail}
              onChange={(val) => handleContactChange("supportEmail", val)}
              placeholder="Enter your support email"
              icon="envelope"
            />
            <button
              onClick={handleContactSubmit}
              className="w-full py-3 px-6 bg-[#A68B69] text-white rounded-md flex items-center justify-center hover:bg-[#8a7152] transition-colors duration-200"
              style={{ border: "none", cursor: "pointer" }}
            >
              <IconPlaceholder name="save" />
              <span className="font-medium ml-2">Save Contact Information</span>
            </button>
          </div>
        );
      case "password":
        return (
          <div className="bg-white rounded-lg shadow-md mx-4 mb-6 p-6">
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <IconPlaceholder name="lock-closed" style={{ color: "#A68B69" }} />
                <h2 className="text-xl font-semibold text-gray-800 ml-2">Change Password</h2>
              </div>
              <p className="text-gray-600 text-sm">Update your account password for better security.</p>
            </div>
            <InputField
              label="Current Password"
              value={passwordData.oldPassword}
              onChange={(val) => handlePasswordChange("oldPassword", val)}
              placeholder="Enter current password"
              secureTextEntry
              showToggle
              showPassword={showOldPassword}
              onToggle={() => setShowOldPassword(!showOldPassword)}
              error={errors.oldPassword}
            />
            <InputField
              label="New Password"
              value={passwordData.newPassword}
              onChange={(val) => handlePasswordChange("newPassword", val)}
              placeholder="Enter new password"
              secureTextEntry
              showToggle
              showPassword={showNewPassword}
              onToggle={() => setShowNewPassword(!showNewPassword)}
              error={errors.newPassword}
            />
            <InputField
              label="Confirm New Password"
              value={passwordData.confirmPassword}
              onChange={(val) => handlePasswordChange("confirmPassword", val)}
              placeholder="Confirm new password"
              secureTextEntry
              error={errors.confirmPassword}
            />
            <button
              onClick={handlePasswordSubmit}
              className="w-full py-3 px-6 bg-[#A68B69] text-white rounded-md flex items-center justify-center hover:bg-[#8a7152] transition-colors duration-200"
              style={{ border: "none", cursor: "pointer" }}
            >
              <IconPlaceholder name="save" />
              <span className="font-medium ml-2">Update Password</span>
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 bg-[#F9F9F9] min-h-screen">
      <header className="bg-[#A68B69] shadow-sm">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-white/80 mt-1 text-sm">Manage your account and business information</p>
        </div>
      </header>
      <div className="p-4">
        <div className="bg-[#E6E6E6] rounded-lg p-1 flex">
          <TabButton
            isActive={activeTab === "business"}
            onPress={() => setActiveTab("business")}
            icon="business"
            title="Business Info"
          />
          <TabButton
            isActive={activeTab === "contact"}
            onPress={() => setActiveTab("contact")}
            icon="envelope"
            title="Contact Us"
          />
          <TabButton
            isActive={activeTab === "password"}
            onPress={() => setActiveTab("password")}
            icon="lock-closed"
            title="Change Password"
          />
        </div>
      </div>
      {renderContent()}
      <SaveModal
        isVisible={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={modalData.onSave}
        title={modalData.title}
        message={modalData.message}
      />
    </div>
  );
};

export default Settings;