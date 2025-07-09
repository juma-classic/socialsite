# Facebook & Instagram OAuth Setup Guide

## Step 1: Create Facebook App
1. Go to https://developers.facebook.com/
2. Click "My Apps" → "Create App"
3. Choose "Business" as app type
4. Fill in app details:
   - App Name: "Social Sight"
   - App Contact Email: your email
   - Business Account: (optional)

## Step 2: Configure Facebook Login
1. In your app dashboard, click "Add Product"
2. Find "Facebook Login" and click "Set Up"
3. Choose "Web" platform
4. Add these URLs in Facebook Login settings:
   - Site URL: https://socialsignt.netlify.app
   - Valid OAuth Redirect URIs: https://socialsignt.netlify.app/.netlify/functions/oauth

## Step 3: Add Instagram Basic Display
1. In your app dashboard, click "Add Product"
2. Find "Instagram Basic Display" and click "Set Up"
3. In Instagram Basic Display settings:
   - Valid OAuth Redirect URIs: https://socialsignt.netlify.app/.netlify/functions/oauth
   - Deauthorize Callback URL: https://socialsignt.netlify.app/deauth
   - Data Deletion Request URL: https://socialsignt.netlify.app/deletion

## Step 4: Get App Credentials
1. Go to Settings → Basic
2. Copy your App ID and App Secret
3. Make your app Live (switch from Development to Live mode)

## Required Information:
- Facebook App ID: [Copy from Facebook]
- Facebook App Secret: [Copy from Facebook]
- Instagram App ID: [Same as Facebook App ID]
- Instagram App Secret: [Same as Facebook App Secret]
