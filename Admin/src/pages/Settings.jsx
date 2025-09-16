import React, { useState } from "react";

const IconPlaceholder = ({ name, style }) => (
  <span style={style} aria-hidden="true">
    {name === "lock-closed" && "🔒"}
    {name === "business" && "🏢"}
    {name === "location" && "📍"}
    {name === "call" && "📞"}
    {name === "eye" && "👁️"}
    {name === "eye-off" && "👁️‍🗨️"}
    {name === "save" && "💾"}
    {name === "help" && "❓"}
    {name === "envelope" && "✉️"}
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

/* ---------- Main Component ---------- */
const Settings = () => {
  const [activeTab, setActiveTab] = useState("business");

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
  const handlePasswordSubmit = () => {
    if (
      !passwordData.oldPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      alert("Please fill in all password fields");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match");
      return;
    }
    alert("Password updated successfully");
    console.log("Password change submitted:", passwordData);
  };

  // Business state and handlers
  const [businessData, setBusinessData] = useState({
    businessName: "",
    location: "",
    contactNumber: "",
    email: "",
  });
  const handleBusinessChange = (field, value) =>
    setBusinessData((prev) => ({ ...prev, [field]: value }));
  const handleBusinessSubmit = () => {
    if (
      !businessData.businessName ||
      !businessData.location ||
      !businessData.contactNumber
    ) {
      alert("Please fill in all required business fields");
      return;
    }
    alert("Business information saved successfully");
    console.log("Business info submitted:", businessData);
  };

  // FAQ state and handlers
  const [faqData, setFaqData] = useState({
    question: "",
    answer: "",
  });
  const handleFaqChange = (field, value) =>
    setFaqData((prev) => ({ ...prev, [field]: value }));
  

  // Contact Us state and handlers
  const [contactData, setContactData] = useState({
    address: "",
    phone: "",
    email: "",
    supportEmail: "",
  });
  const handleContactChange = (field, value) =>
    setContactData((prev) => ({ ...prev, [field]: value }));
  const handleContactSubmit = () => {
    if (
      !contactData.address ||
      !contactData.phone ||
      !contactData.email ||
      !contactData.supportEmail
    ) {
      alert("Please fill in all contact information fields");
      return;
    }
    alert("Contact information saved successfully");
    console.log("Contact info submitted:", contactData);
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
                Manage your business details and contact information
              </p>
            </div>
            <InputField
              label="Business Name"
              value={businessData.businessName}
              onChange={(val) => handleBusinessChange("businessName", val)}
              placeholder="Enter business name"
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
              label="Contact Number"
              value={businessData.contactNumber}
              onChange={(val) => handleBusinessChange("contactNumber", val)}
              placeholder="Enter contact number"
              icon="call"
            />
            <InputField
              label="Email Address"
              value={businessData.email}
              onChange={(val) => handleBusinessChange("email", val)}
              placeholder="Enter email address"
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
                Manage your business contact details
              </p>
            </div>
            <InputField
              label="Address"
              value={contactData.address}
              onChange={(val) => handleContactChange("address", val)}
              placeholder="Enter your business address"
              icon="location"
              multiline
            />
            <InputField
              label="Phone Number"
              value={contactData.phone}
              onChange={(val) => handleContactChange("phone", val)}
              placeholder="Enter your primary phone number"
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
    </div>
  );
};

export default Settings;