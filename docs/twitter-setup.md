# Twitter OAuth Setup Guide

## Step 1: Create Twitter App
1. Go to https://developer.twitter.com/
2. Apply for a developer account if you don't have one
3. Once approved, click "Create App"
4. Fill in app details:
   - App Name: "Social Sight"
   - Description: "Social media analytics dashboard"
   - Website: https://socialsignt.netlify.app
   - Terms of Service: (optional)
   - Privacy Policy: (optional)

## Step 2: Configure OAuth 2.0
1. In your app dashboard, go to "Settings" tab
2. Click "Edit" next to "Authentication settings"
3. Enable "OAuth 2.0"
4. Add these URLs:
   - Callback URLs: https://socialsignt.netlify.app/.netlify/functions/oauth
   - Website URL: https://socialsignt.netlify.app
5. Save changes

## Step 3: Set Permissions
1. Go to "Permissions" tab
2. Set permissions to "Read" (minimum required)
3. Save changes

## Step 4: Get App Credentials
1. Go to "Keys and tokens" tab
2. Under "OAuth 2.0 Client ID and Client Secret":
   - Copy Client ID
   - Copy Client Secret
3. Keep these secure!

## Required Information:
- Twitter Client ID: [Copy from Twitter]
- Twitter Client Secret: [Copy from Twitter]
