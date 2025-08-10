import React from "react";
import GoogleCallback from "../../components/GoogleCallback";
import LayoutAuth from "../../components/layout/LayoutAuth";

const GoogleCallbackPage: React.FC = () => {
  return (
    <LayoutAuth>
      <GoogleCallback
        onSuccess={(user) => {
          console.log("Google auth success:", user);
        }}
        onError={(error) => {
          console.error("Google auth error:", error);
        }}
      />
    </LayoutAuth>
  );
};

export default GoogleCallbackPage;
