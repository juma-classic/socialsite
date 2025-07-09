# 🚀 Real Social Media Connections Setup Guide

## 📋 **Quick Overview**

You're about to enable real social media connections for Social Sight! This will allow users to connect their accounts with one click using secure OAuth 2.0 authentication.

**Current Status:** ✅ Your app is deployed and OAuth infrastructure is ready
**What's needed:** Create OAuth applications on each platform and add credentials

---

## 🎯 **Step 1: Create OAuth Applications**

### **Facebook & Instagram** 
📋 **Time:** ~10 minutes  
📍 **URL:** https://developers.facebook.com/

1. **Create App:**
   - Click "My Apps" → "Create App" → "Business"
   - App Name: `Social Sight`
   - Contact Email: Your email

2. **Add Facebook Login:**
   - Dashboard → "Add Product" → "Facebook Login" → "Set Up"
   - Platform: Web
   - Site URL: `https://socialsignt.netlify.app`
   - Valid OAuth Redirect URIs: `https://socialsignt.netlify.app/.netlify/functions/oauth`

3. **Add Instagram Basic Display:**
   - Dashboard → "Add Product" → "Instagram Basic Display" → "Set Up"
   - Valid OAuth Redirect URIs: `https://socialsignt.netlify.app/.netlify/functions/oauth`
   - Deauthorize: `https://socialsignt.netlify.app/deauth`
   - Data Deletion: `https://socialsignt.netlify.app/deletion`

4. **Go Live:**
   - Settings → Basic → App Mode → "Live"

5. **Copy Credentials:**
   - App ID: `[YOUR_FACEBOOK_APP_ID]`
   - App Secret: `[YOUR_FACEBOOK_APP_SECRET]`

---

### **Twitter/X**
📋 **Time:** ~15 minutes  
📍 **URL:** https://developer.twitter.com/

1. **Apply for Developer Account** (if needed)
2. **Create App:**
   - "Create App"
   - App Name: `Social Sight`
   - Description: `Social media analytics dashboard`
   - Website: `https://socialsignt.netlify.app`

3. **Configure OAuth 2.0:**
   - Settings → "Authentication settings" → "Edit"
   - Enable "OAuth 2.0"
   - Callback URLs: `https://socialsignt.netlify.app/.netlify/functions/oauth`
   - Website: `https://socialsignt.netlify.app`

4. **Set Permissions:**
   - Permissions → "Read" (minimum)

5. **Copy Credentials:**
   - Keys and tokens → "OAuth 2.0 Client ID and Client Secret"
   - Client ID: `[YOUR_TWITTER_CLIENT_ID]`
   - Client Secret: `[YOUR_TWITTER_CLIENT_SECRET]`

---

### **LinkedIn**
📋 **Time:** ~10 minutes  
📍 **URL:** https://developer.linkedin.com/

1. **Create App:**
   - "Create app"
   - App Name: `Social Sight`
   - LinkedIn Company Page: (create if needed)
   - Privacy Policy: `https://socialsignt.netlify.app/privacy`

2. **Configure OAuth:**
   - Auth tab → "OAuth 2.0 settings"
   - Authorized redirect URLs: `https://socialsignt.netlify.app/.netlify/functions/oauth`

3. **Add Products:**
   - Products tab → Add:
     - "Sign In with LinkedIn using OpenID Connect"
     - "Share on LinkedIn" (if available)

4. **Copy Credentials:**
   - Auth tab → "Application credentials"
   - Client ID: `[YOUR_LINKEDIN_CLIENT_ID]`
   - Client Secret: `[YOUR_LINKEDIN_CLIENT_SECRET]`

---

## 🔧 **Step 2: Configure Netlify Environment Variables**

1. **Go to Netlify Dashboard:**
   - Visit: https://app.netlify.com/
   - Select your `socialsignt` site

2. **Add Environment Variables:**
   - Site Settings → Environment Variables → "Add new variable"
   - Add these 8 variables:

```bash
FACEBOOK_CLIENT_ID=[YOUR_FACEBOOK_APP_ID]
FACEBOOK_CLIENT_SECRET=[YOUR_FACEBOOK_APP_SECRET]
INSTAGRAM_CLIENT_ID=[YOUR_FACEBOOK_APP_ID]  # Same as Facebook
INSTAGRAM_CLIENT_SECRET=[YOUR_FACEBOOK_APP_SECRET]  # Same as Facebook
TWITTER_CLIENT_ID=[YOUR_TWITTER_CLIENT_ID]
TWITTER_CLIENT_SECRET=[YOUR_TWITTER_CLIENT_SECRET]
LINKEDIN_CLIENT_ID=[YOUR_LINKEDIN_CLIENT_ID]
LINKEDIN_CLIENT_SECRET=[YOUR_LINKEDIN_CLIENT_SECRET]
```

3. **Save and Redeploy:**
   - After adding all variables, trigger a new deployment
   - Deploys → "Trigger deploy" → "Deploy site"

---

## ✅ **Step 3: Test OAuth Connections**

1. **Visit Your Site:** https://socialsignt.netlify.app
2. **Go to Settings** (or the account connection page)
3. **Try connecting each platform:**
   - Click "Connect Facebook"
   - Login with your Facebook account
   - Grant permissions
   - Should redirect back with success message

4. **Verify All Platforms:**
   - ✅ Facebook
   - ✅ Instagram
   - ✅ Twitter
   - ✅ LinkedIn

---

## 🐛 **Troubleshooting Common Issues**

### **"App ID not found" Error**
- ✅ Double-check Client ID in Netlify environment variables
- ✅ Ensure no extra spaces in the values
- ✅ Verify app is in "Live" mode (Facebook)

### **"Invalid redirect URI" Error**
- ✅ Check redirect URI exactly matches: `https://socialsignt.netlify.app/.netlify/functions/oauth`
- ✅ No trailing slashes
- ✅ HTTPS not HTTP

### **"App not approved" Error**
- ✅ Facebook: Switch app to Live mode
- ✅ Twitter: Ensure developer account is approved
- ✅ LinkedIn: Add required products

### **CORS/Network Errors**
- ✅ Check browser console for specific errors
- ✅ Verify environment variables are set in Netlify
- ✅ Try in incognito mode

---

## 📞 **Need Help?**

If you encounter issues:

1. **Check Platform Documentation:**
   - Facebook: https://developers.facebook.com/docs/facebook-login/
   - Twitter: https://developer.twitter.com/en/docs/authentication/oauth-2-0
   - LinkedIn: https://docs.microsoft.com/en-us/linkedin/shared/authentication/

2. **Debug Steps:**
   - Check Netlify function logs for detailed errors
   - Use browser developer tools to inspect network requests
   - Verify all URLs and credentials are exact matches

3. **Common Solutions:**
   - Clear browser cache and cookies
   - Try different browser or incognito mode
   - Wait 5-10 minutes after changing app settings

---

## 🎉 **Success Checklist**

- [ ] Facebook app created and live
- [ ] Instagram Basic Display added
- [ ] Twitter app created with OAuth 2.0
- [ ] LinkedIn app created with required products
- [ ] All 8 environment variables added to Netlify
- [ ] Site redeployed after adding variables
- [ ] Successfully connected all 4 platforms
- [ ] Users can connect/disconnect accounts
- [ ] OAuth flow works end-to-end

**Estimated Total Time:** 45-60 minutes
**Skill Level:** Beginner (detailed guides provided)

---

**Your Social Sight dashboard will be fully functional with real social media data once this setup is complete!** 🚀
