import React from 'react';
import GoogleCallback from '../../components/GoogleCallback';
import LayoutAuth from '../../components/layout/LayoutAuth';

const GoogleCallbackPage: React.FC = () => {
  return (
    <LayoutAuth>
      <GoogleCallback />
    </LayoutAuth>
  );
};

export default GoogleCallbackPage;
