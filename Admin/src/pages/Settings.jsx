import React, { useState, useEffect } from "react";
import { db } from "../../Backend/firebaseConfig.js";
import { doc, setDoc, getDoc } from "firebase/firestore";

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
    {name === "help" && "❓"}
    {name === "envelope" && "✉️"}
    {name === "calendar" && "📅"}
    {name === "close" && "❌"}
    {name === "information-circle" && "ℹ️"}
    {name === "image" && "🖼️"}
  </span>
);

const TabButton = ({ isActive, onPress, icon, title }) => (
  <button
    onClick={onPress}
    className={`flex-1 py-4 px-4 rounded-lg mx-1 flex flex-row items-center justify-center ${
      isActive ? "bg-[#A68B69]" : "bg-transparent"
    }`}
    style={{ border: "none", cursor: "pointer" }}
  >
    <IconPlaceholder name={icon} style={{ marginRight: 8 }} />
    <span
      className={`font-medium text-sm ${
        isActive ? "text-white" : "text-gray-600"
      }`}
    >
      {title}
    </span>
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
}) => (
  <div className="mb-6">
    <div className="flex flex-row items-center mb-2">
      {icon && <IconPlaceholder name={icon} style={{ marginRight: 4 }} />}
      <label className="text-sm font-medium text-gray-700">{label}</label>
    </div>
    <div className="relative">
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-4 bg-[#F9F9F9] border-2 border-[#CAC8C5] rounded-lg text-gray-800 h-20"
        />
      ) : (
        <input
          type={secureTextEntry && !showPassword ? "password" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-4 bg-[#F9F9F9] border-2 border-[#CAC8C5] rounded-lg text-gray-800 h-12"
        />
      )}
      {showToggle && (
        <button
          onClick={onToggle}
          className="absolute right-3 top-3"
          style={{ border: "none", background: "transparent" }}
          type="button"
        >
          <IconPlaceholder name={showPassword ? "eye-off" : "eye"} />
        </button>
      )}
    </div>
  </div>
);

// Save Modal Component
const SaveModal = ({ isVisible, onClose, onSave, title, message }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-11/12 max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            style={{ border: "none", background: "transparent" }}
          >
            <IconPlaceholder name="close" />
          </button>
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            style={{ border: "none", cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-[#A68B69] text-white rounded-lg hover:bg-[#8a7152] "
            style={{ border: "none", cursor: "pointer" }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------- Main Component ---------- */
const Settings = () => {
  const [activeTab, setActiveTab] = useState("business");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [modalData, setModalData] = useState({
    title: "",
    message: "",
    onSave: () => {},
  });

  // ✅ Load saved data from Firestore on mount
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

  // Business state and handlers
  const [businessData, setBusinessData] = useState({
    businessName: "",
    foundedYear: "",
    location: "",
    mission: "",
    vision: "",
    aboutUs: "", // Added About Us field
   
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
    }
  };

  const handleBusinessSubmit = () => {
    setModalData({
      title: "Save Business Information",
      message:
        "Are you sure you want to save these changes? This will update the information displayed in the About Us section.",
      onSave: handleBusinessSave,
    });
    setShowSaveModal(true);
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
    }
  };

  const handleContactSubmit = () => {
    setModalData({
      title: "Save Contact Information",
      message:
        "Are you sure you want to save these changes? This will update the contact information displayed in the About Us section.",
      onSave: handleContactSave,
    });
    setShowSaveModal(true);
  };

  // Password handling
  const handlePasswordSubmit = () => {
    setModalData({
      title: "Update Password",
      message: "Are you sure you want to update your password?",
      onSave: () => {
        if (
          !passwordData.oldPassword ||
          !passwordData.newPassword ||
          !passwordData.confirmPassword
        ) {
          setModalData({
            title: "Error",
            message: "Please fill in all password fields.",
            onSave: () => setShowSaveModal(false),
          });
          return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          setModalData({
            title: "Error",
            message: "New passwords do not match.",
            onSave: () => setShowSaveModal(false),
          });
          return;
        }
        console.log("Password updated successfully");
        setShowSaveModal(false);
      },
    });
    setShowSaveModal(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "business":
        return (
          <div className="bg-[#E0DAD6] rounded-xl shadow-lg overflow-hidden mx-4 mb-6 p-6">
            <div className="border-b border-[#CAC8C5] pb-6 mb-6">
              <div className="flex flex-row items-center mb-2">
                <IconPlaceholder name="business" />
                <h2 className="text-xl font-semibold text-gray-800 ml-2">
                  Business Information
                </h2>
              </div>
              <p className="text-gray-600">
                Manage your core business details.
              </p>
            </div>
            

            
            <InputField
              label="Business Name"
              value={businessData.businessName}
              onChange={(val) => handleBusinessChange("businessName", val)}
              placeholder="Enter business name"
            />
            <InputField
              label="Year Founded"
              value={businessData.foundedYear}
              onChange={(val) => handleBusinessChange("foundedYear", val)}
              placeholder="Enter the year your business was founded"
              icon="calendar"
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
              className="w-full py-4 px-6 bg-[#A68B69] rounded-lg flex flex-row items-center justify-center"
              style={{ border: "none", cursor: "pointer" }}
            >
              <IconPlaceholder name="save" />
              <span className="text-white font-medium ml-2">
                Save Business Information
              </span>
            </button>
          </div>
        );

      case "contact":
        return (
          <div className="bg-[#E0DAD6] rounded-xl shadow-lg overflow-hidden mx-4 mb-6 p-6">
            <div className="border-b border-[#CAC8C5] pb-6 mb-6">
              <div className="flex flex-row items-center mb-2">
                <IconPlaceholder name="envelope" />
                <h2 className="text-xl font-semibold text-gray-800 ml-2">
                  Contact Us Information
                </h2>
              </div>
              <p className="text-gray-600">
                Manage your business contact details.
              </p>
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
              className="w-full py-4 px-6 bg-[#A68B69] rounded-lg flex flex-row items-center justify-center"
              style={{ border: "none", cursor: "pointer" }}
            >
              <IconPlaceholder name="save" />
              <span className="text-white font-medium ml-2">
                Save Contact Information
              </span>
            </button>
          </div>
        );

      case "password":
        return (
          <div className="bg-[#E0DAD6] rounded-xl shadow-lg overflow-hidden mx-4 mb-6 p-6">
            <div className="border-b border-[#CAC8C5] pb-6 mb-6">
              <div className="flex flex-row items-center mb-2">
                <IconPlaceholder name="lock-closed" />
                <h2 className="text-xl font-semibold text-gray-800 ml-2">
                  Change Password
                </h2>
              </div>
              <p className="text-gray-600">
                Update your account password for better security
              </p>
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
            />
            <InputField
              label="Confirm New Password"
              value={passwordData.confirmPassword}
              onChange={(val) => handlePasswordChange("confirmPassword", val)}
              placeholder="Confirm new password"
              secureTextEntry
            />
            <button
              onClick={handlePasswordSubmit}
              className="w-full py-4 px-6 bg-[#A68B69] rounded-lg flex flex-row items-center justify-center"
              style={{ border: "none", cursor: "pointer" }}
            >
              <IconPlaceholder name="save" />
              <span className="text-white font-medium ml-2">
                Update Password
              </span>
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 bg-[#F9F9F9]">
      <header className="bg-[#A68B69] shadow-sm">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-white/80 mt-1">
            Manage your account and business information
          </p>
        </div>
      </header>
      <div
        className="flex-1 overflow-y-auto"
        style={{ height: "calc(100vh - 100px)" }}
      >
        <div className="p-4">
          <div className="bg-[#E6E6E6] rounded-lg p-1 flex flex-row">
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
      </div>

      {/* Save Modal */}
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