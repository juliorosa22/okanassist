// app/src/services/expoGoogleAuth.js
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import Constants from 'expo-constants';

// Complete the auth session for better UX
WebBrowser.maybeCompleteAuthSession();

class ExpoGoogleAuth {
  constructor() {
  // Force Expo proxy for Google OAuth
  this.redirectUri = AuthSession.makeRedirectUri({
    scheme: 'okanassist',
    useProxy: true,
    preferLocalhost: false, // Don't use localhost
  });
  
  // If still getting exp:// URI, manually create the proxy URI
  if (this.redirectUri.startsWith('exp://')) {
    console.log('⚠️ Got exp:// URI, forcing Expo proxy...');
    this.redirectUri = 'https://auth.expo.io/@okanassist22/okanassist' //`https://auth.expo.io/${Constants.manifest?.slug || 'okanassist'}`;
  }
  
  console.log('🔗 Final Redirect URI:', this.redirectUri);
}

async signIn() {
  try {
    const googleClientId = Constants.expoConfig?.extra?.googleWebClientId;
    
    if (!googleClientId) {
      throw new Error('Google Client ID not found');
    }

    console.log('🔍 Starting Google OAuth (Authorization Code Flow)...');

    // Use Authorization Code Flow with PKCE (more secure)
    const request = new AuthSession.AuthRequest({
      clientId: googleClientId,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.Code, // Changed to Code
      redirectUri: this.redirectUri,
      additionalParameters: {
        access_type: 'offline',
      },
      extraParams: {
        prompt: 'select_account',
      },
    });

    console.log('🔧 Request configured for authorization code flow');

    const result = await request.promptAsync({
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      useProxy: true,
    });

    if (result.type === 'success') {
      console.log('✅ Got authorization code, exchanging for tokens...');
      
      const authCode = result.params?.code;
      if (!authCode) {
        throw new Error('No authorization code received');
      }

      // Exchange code for tokens
      const tokenResult = await this.exchangeCodeForTokens(
        authCode, 
        googleClientId, 
        request.codeVerifier // PKCE verifier
      );

      return tokenResult;
    } else if (result.type === 'cancel') {
      return { success: false, error: 'User cancelled', cancelled: true };
    } else {
      return { 
        success: false, 
        error: result.error?.description || 'Authentication failed' 
      };
    }
    
  } catch (error) {
    console.error('❌ Google Auth error:', error);
    return { success: false, error: error.message };
  }
}

async exchangeCodeForTokens(authCode, clientId, codeVerifier) {
  try {
    console.log('🔄 Exchanging authorization code for tokens...');
    
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        code: authCode,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
        code_verifier: codeVerifier, // PKCE verifier
      }).toString(),
    });

    const data = await response.json();

    if (response.ok && data.id_token) {
      console.log('✅ Tokens received successfully');
      
      const userInfo = this.decodeJWTPayload(data.id_token);
      
      return {
        success: true,
        idToken: data.id_token,
        accessToken: data.access_token,
        user: {
          id: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          givenName: userInfo.given_name,
          familyName: userInfo.family_name,
        },
      };
    } else {
      console.error('❌ Token exchange failed:', data);
      throw new Error(data.error_description || 'Token exchange failed');
    }
  } catch (error) {
    console.error('❌ Token exchange error:', error);
    return { success: false, error: error.message };
  }
}
  decodeJWTPayload(token) {
    try {
      // Split the token into parts
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }
      
      // Decode the payload (middle part)
      const payload = parts[1];
      
      // Add padding if needed for base64 decoding
      const paddedPayload = payload + '==='.slice((payload.length + 3) % 4);
      
      // Decode base64
      const decoded = atob(paddedPayload);
      
      // Parse JSON
      return JSON.parse(decoded);
    } catch (error) {
      console.error('❌ JWT decode error:', error);
      return {};
    }
  }

  // Helper method to get user info from stored token
  getUserInfoFromToken(idToken) {
    return this.decodeJWTPayload(idToken);
  }

  // Method to check if we have a valid session
  async getCurrentUser() {
    // In a real app, you might want to store and check tokens
    // For now, this just returns null
    return null;
  }

  async signOut() {
    // Clear any stored tokens
    // For now, just return success
    console.log('🔄 Google sign out');
    return { success: true };
  }
}

export default new ExpoGoogleAuth();