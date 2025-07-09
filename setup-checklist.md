# Social Sight OAuth Setup Checklist

## ✅ **Step 1: Create OAuth Applications**

### Facebook & Instagram
- [ ] Go to https://developers.facebook.com/
- [ ] Create new app with name "Social Sight"
- [ ] Add Facebook Login product
- [ ] Add Instagram Basic Display product
- [ ] Set redirect URI: `https://socialsignt.netlify.app/.netlify/functions/oauth`
- [ ] Copy App ID and App Secret
- [ ] Switch app to Live mode

### Twitter/X
- [ ] Go to https://developer.twitter.com/
- [ ] Create new app with name "Social Sight"
- [ ] Enable OAuth 2.0
- [ ] Set callback URL: `https://socialsignt.netlify.app/.netlify/functions/oauth`
- [ ] Copy Client ID and Client Secret

### LinkedIn
- [ ] Go to https://developer.linkedin.com/
- [ ] Create new app with name "Social Sight"
- [ ] Set redirect URL: `https://socialsignt.netlify.app/.netlify/functions/oauth`
- [ ] Add required products (Sign In with LinkedIn)
- [ ] Copy Client ID and Client Secret

## ✅ **Step 2: Configure Netlify Environment Variables**

1. Go to your Netlify dashboard: https://app.netlify.com/
2. Select your "socialsignt" site
3. Go to Site Settings → Environment Variables
4. Add the following variables:

```
FACEBOOK_CLIENT_ID=your_facebook_app_id_here
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret_here
INSTAGRAM_CLIENT_ID=your_facebook_app_id_here
INSTAGRAM_CLIENT_SECRET=your_facebook_app_secret_here
TWITTER_CLIENT_ID=your_twitter_client_id_here
TWITTER_CLIENT_SECRET=your_twitter_client_secret_here
LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret_here
```

## ✅ **Step 3: Test OAuth Connections**

1. After adding environment variables, redeploy your site
2. Visit https://socialsignt.netlify.app
3. Go to Settings page
4. Try connecting each social media account
5. Verify that OAuth flow works correctly

## 🔧 **Troubleshooting**

### Common Issues:
- **"App not found" error**: Check that your Client IDs are correct
- **"Invalid redirect URI"**: Ensure redirect URLs match exactly in platform settings
- **"App in development mode"**: Some platforms require apps to be in "Live" mode
- **CORS errors**: Check that your platform app settings allow your domain

### Debugging Steps:
1. Check browser developer console for errors
2. Verify environment variables are set in Netlify
3. Check that platform app settings match your site URL
4. Ensure apps are approved/live on each platform

## 📞 **Need Help?**

If you encounter issues:
1. Check the platform-specific setup guides in `/docs/`
2. Verify all URLs and credentials are correct
3. Check Netlify function logs for detailed error messages
4. Ensure your apps have the required permissions on each platform

---

**Note**: This process typically takes 30-60 minutes depending on platform approval times.
