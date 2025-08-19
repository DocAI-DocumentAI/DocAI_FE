import React from "react";
import GoogleCallback from "../../components/GoogleCallback";
import LayoutAuth from "../../components/layout/LayoutAuth";

const GoogleCallbackPage: React.FC = () => {
  console.log("🎯 GoogleCallbackPage component rendered");
  console.log("📍 Current URL in GoogleCallbackPage:", window.location.href);

  return (
    <LayoutAuth>
      <GoogleCallback
        onSuccess={(user) => {
          console.log("✅ Google auth success in GoogleCallbackPage:", user);
        }}
        onError={(error) => {
          console.error("❌ Google auth error in GoogleCallbackPage:", error);
        }}
      />
    </LayoutAuth>
  );
};

export default GoogleCallbackPage;
