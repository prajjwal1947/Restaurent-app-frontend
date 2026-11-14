# WhatsApp OAuth Integration Guide

This guide explains how to implement WhatsApp OAuth2 authentication for the restaurant app.

## Overview

Instead of manually entering system-user tokens, users can now sign in with their Meta account to authorize WhatsApp Business. The flow is similar to Gmail OAuth.

## Frontend Changes

The frontend has been updated with:
- **OAuth Button**: "Connect with Meta" button that initiates the OAuth flow
- **Manual Fallback**: Still supports manual token entry as a fallback option
- **Callback Handler**: Needs to handle the OAuth callback at `/admin/oauth/whatsapp/callback`

## Backend Implementation Required

### 1. Set Up Meta App

1. Go to https://developers.facebook.com/
2. Create a new app or use existing one
3. Add "WhatsApp Business" product
4. Get your App ID and App Secret
5. Go to Settings > Basic and save these values securely

### 2. Configure OAuth Redirect URI

In your Meta App Dashboard:
- Go to Settings > Basic
- Add your Redirect URI: `http://localhost:5173/admin/oauth/whatsapp/callback` (dev) or your production domain
- For production: `https://yourdomain.com/admin/oauth/whatsapp/callback`

### 3. Create Backend Endpoints

Add these endpoints to your backend:

#### A. `POST /api/v1/settings/whatsapp/oauth/authorize`

Initiates the OAuth flow.

**Request:**
```json
{
  "redirectUri": "http://localhost:5173/admin/oauth/whatsapp/callback"
}
```

**Response:**
```json
{
  "data": {
    "authorizationUrl": "https://www.facebook.com/v18.0/dialog/oauth?client_id=xxx&redirect_uri=xxx&scope=xxx&state=xxx"
  }
}
```

**Implementation (Node.js/Express example):**
```javascript
router.post('/settings/whatsapp/oauth/authorize', authMiddleware, (req, res) => {
  const { redirectUri } = req.body;
  const clientId = process.env.META_APP_ID;
  const scope = 'whatsapp_business_messaging,business_management';
  const state = crypto.randomBytes(32).toString('hex');
  
  // Store state in session/cache for verification (expires in 10 min)
  // redisClient.setex(`oauth_state_${state}`, 600, restaurantId);
  
  const authorizationUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
    `client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scope)}` +
    `&state=${state}` +
    `&response_type=code`;
  
  res.json({ data: { authorizationUrl } });
});
```

#### B. `GET /api/v1/oauth/whatsapp/callback`

Handles OAuth callback from Meta.

**Query Parameters:**
- `code`: Authorization code from Meta
- `state`: State parameter for CSRF protection

**Implementation:**
```javascript
router.get('/oauth/whatsapp/callback', async (req, res) => {
  const { code, state } = req.query;
  
  if (!code || !state) {
    return res.redirect('/admin?error=oauth_failed');
  }
  
  try {
    // Verify state (check if it exists in cache/session)
    // const restaurantId = await redisClient.get(`oauth_state_${state}`);
    // if (!restaurantId) throw new Error('Invalid state parameter');
    
    // Exchange code for access token
    const tokenResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        redirect_uri: req.body.redirectUri, // or get from cache
        code,
      }),
    });
    
    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      throw new Error('Failed to get access token');
    }
    
    // Get user info and phone number
    const userResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=${tokenData.access_token}`
    );
    const userData = await userResponse.json();
    
    // Get WhatsApp Business phone numbers
    const waResponse = await fetch(
      `https://graph.facebook.com/v18.0/${userData.id}/phone_numbers?access_token=${tokenData.access_token}`
    );
    const waData = await waResponse.json();
    
    // Store in database
    const restaurant = await restaurantDb.updateOne(
      { _id: restaurantId },
      {
        'whatsappConnection.connected': true,
        'whatsappConnection.accessToken': encryptToken(tokenData.access_token),
        'whatsappConnection.phoneNumberId': waData.data[0].phone_number_id,
        'whatsappConnection.displayPhoneNumber': waData.data[0].display_phone_number,
        'whatsappConnection.connectedAt': new Date(),
      }
    );
    
    // Redirect back to admin panel
    res.redirect('/admin/settings?success=whatsapp_connected');
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect('/admin?error=oauth_failed');
  }
});
```

### 4. Update Existing Endpoint

Update `PATCH /api/v1/settings/whatsapp` to support OAuth tokens:

```javascript
router.patch('/settings/whatsapp', authMiddleware, async (req, res) => {
  const { phoneNumberId, accessToken } = req.body;
  
  // If accessToken is from OAuth, it's already encrypted
  // If from manual entry, encrypt it
  const token = accessToken.startsWith('EAAB') ? 
    encryptToken(accessToken) : 
    accessToken;
  
  const restaurant = await restaurantDb.updateOne(
    { _id: req.restaurant.id },
    {
      'whatsappConnection.connected': true,
      'whatsappConnection.accessToken': token,
      'whatsappConnection.phoneNumberId': phoneNumberId,
      'whatsappConnection.connectedAt': new Date(),
    }
  );
  
  res.json({ data: restaurant.whatsappConnection });
});
```

## Frontend OAuth Callback Handler

Create a new file: `admin/src/pages/OAuthCallback.jsx`

```javascript
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../services/api';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      navigate('/admin/settings?error=oauth_failed');
      return;
    }

    if (code) {
      // The backend has already processed the callback
      // Just redirect to settings with success message
      navigate('/admin/settings?success=whatsapp_connected');
    } else {
      navigate('/admin/settings');
    }
  }, [searchParams, navigate]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <p>Processing WhatsApp connection...</p>
    </div>
  );
}
```

Add to router:
```javascript
// In your router setup
import OAuthCallback from './pages/OAuthCallback';

{
  path: '/oauth/whatsapp/callback',
  element: <OAuthCallback />,
}
```

## Security Considerations

1. **Token Encryption**: Always encrypt access tokens before storing in database
2. **State Parameter**: Use CSRF tokens (state parameter) to prevent attacks
3. **HTTPS Only**: Never use OAuth in production over HTTP
4. **Token Rotation**: Implement token refresh logic for long-lived sessions
5. **Scope Limiting**: Request only necessary scopes (`whatsapp_business_messaging`, `business_management`)

## Environment Variables

Add to your backend `.env`:
```
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
ENCRYPTION_KEY=your_encryption_key_for_tokens
```

## Testing

1. Click "Connect with Meta" in the WhatsApp section
2. You'll be redirected to Meta's login page
3. Authorize the app
4. You'll be redirected back to `/admin/oauth/whatsapp/callback`
5. Settings should show "Connected" with your phone number

## Troubleshooting

- **"Invalid redirect URI"**: Make sure the URI matches exactly in Meta App Dashboard
- **"Invalid code"**: Code expired (valid for ~10 minutes) or already used
- **Token not working**: Check if token is properly encrypted/decrypted
- **Phone number not found**: Make sure you have WhatsApp Business Account set up

## References

- Meta OAuth Docs: https://developers.facebook.com/docs/facebook-login/web
- WhatsApp Cloud API: https://developers.facebook.com/docs/whatsapp/cloud-api/reference
- WhatsApp Business Phone Numbers: https://developers.facebook.com/docs/whatsapp/business-management-api/phone-numbers
