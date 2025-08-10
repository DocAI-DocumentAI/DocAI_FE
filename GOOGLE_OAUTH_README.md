# Google OAuth Implementation

This document describes the Google OAuth login functionality implemented in the DocAI application.

## Overview

The Google OAuth implementation allows users to sign in using their Google accounts. The flow follows OAuth 2.0 authorization code flow with the following steps:

1. User clicks "Login with Google" button
2. Application requests Google auth URL from backend API
3. User is redirected to Google's authorization server
4. User grants permission and is redirected back with authorization code
5. Application exchanges the code for user data and tokens
6. User is authenticated and redirected based on their role

## Architecture

### Components

- **GoogleLoginButton**: Reusable button component that initiates OAuth flow
- **GoogleCallback**: Component that handles OAuth callback and processes authorization code
- **GoogleAuthService**: Service class with static methods for OAuth operations
- **useGoogleAuth**: Custom hook for managing OAuth state and flow

### Files Structure

```
src/
├── components/
│   ├── GoogleLoginButton.tsx     # OAuth login button
│   └── GoogleCallback.tsx        # OAuth callback handler
├── hooks/
│   └── useGoogleAuth.ts          # OAuth custom hook
├── services/
│   └── googleAuthService.ts      # OAuth service methods
├── pages/auth/
│   └── GoogleCallback.tsx        # OAuth callback page
├── types/
│   ├── User.ts                   # User and OAuth types
│   └── GoogleOAuth.ts            # Comprehensive OAuth types
├── utils/
│   └── localStorage.ts           # Storage utilities
└── store/slices/
    └── authSlice.ts              # Redux auth state management
```

## API Endpoints

### Get Google Auth URL
```
GET /auth/google/auth-url
Response: { "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..." }
```

### Exchange Authorization Code
```
POST /auth/exchange-code
Body: { "code": "authorization_code_from_google" }
Response: User object with tokens and profile data
```

## Usage

### Basic Implementation

```tsx
import GoogleLoginButton from '../components/GoogleLoginButton';

function LoginPage() {
  const handleGoogleError = (error: string) => {
    console.error('Google login failed:', error);
  };

  const handleGoogleLoading = (loading: boolean) => {
    console.log('Google login loading:', loading);
  };

  return (
    <GoogleLoginButton
      onError={handleGoogleError}
      onLoading={handleGoogleLoading}
      disabled={false}
    />
  );
}
```

### Using the Custom Hook

```tsx
import { useGoogleAuth } from '../hooks/useGoogleAuth';

function CustomLoginComponent() {
  const { isLoading, error, initiateGoogleLogin, clearAuthError } = useGoogleAuth();

  const handleLogin = async () => {
    try {
      await initiateGoogleLogin();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      <button onClick={handleLogin} disabled={isLoading}>
        {isLoading ? 'Connecting...' : 'Login with Google'}
      </button>
      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

## Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
VITE_API_BASE_URL=https://production.docai.asia/api
```

### Backend Requirements

The backend must implement the following endpoints:

1. **GET /auth/google/auth-url**: Returns Google OAuth authorization URL
2. **POST /auth/exchange-code**: Exchanges authorization code for user data

## Security Considerations

1. **HTTPS Only**: OAuth flow requires HTTPS in production
2. **State Parameter**: Backend should implement CSRF protection using state parameter
3. **Token Storage**: Tokens are stored in localStorage (consider httpOnly cookies for production)
4. **Token Refresh**: Implement token refresh logic for long-term sessions

## Error Handling

The implementation handles various error scenarios:

- Network errors during API calls
- OAuth errors from Google (user denial, invalid state, etc.)
- Invalid authorization codes
- Backend API errors

## Role-based Navigation

After successful authentication, users are redirected based on their role:

- **Admin**: `/admin/dashboard`
- **Editor**: `/editor/view-draft`
- **Manager**: `/manager/approvalQueue`
- **Default**: `/` (home page)

## Testing

To test the Google OAuth flow:

1. Ensure the backend API is running and accessible
2. Start the development server: `npm run dev`
3. Navigate to `/login`
4. Click the "Continue with Google" button
5. Complete the OAuth flow on Google's servers
6. Verify successful authentication and role-based redirect

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend allows requests from your domain
2. **Redirect URI Mismatch**: Verify Google OAuth app configuration
3. **Invalid Client ID**: Check Google Cloud Console configuration
4. **Network Errors**: Verify API endpoints are accessible

### Debug Mode

Enable debug logging by adding console.log statements in:
- `GoogleAuthService` methods
- `useGoogleAuth` hook
- `GoogleCallback` component

## Future Enhancements

1. **Token Refresh**: Implement automatic token refresh
2. **Remember Me**: Add persistent login option
3. **Multiple Providers**: Support additional OAuth providers
4. **Enhanced Security**: Implement PKCE for additional security
5. **Offline Support**: Handle offline scenarios gracefully

## Dependencies

- React 19+
- React Router DOM 7+
- Redux Toolkit 2+
- Axios 1+
- TypeScript 5+

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

This implementation is part of the DocAI application and follows the same license terms.
