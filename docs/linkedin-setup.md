# LinkedIn OAuth Setup Guide

## Step 1: Create LinkedIn App
1. Go to https://developer.linkedin.com/
2. Click "Create app"
3. Fill in app details:
   - App Name: "Social Sight"
   - LinkedIn Company Page: (create a company page if needed)
   - Privacy Policy URL: https://socialsignt.netlify.app/privacy
   - App Logo: (upload a logo)
4. Check "I have read and agree to these terms"
5. Click "Create app"

## Step 2: Configure OAuth
1. In your app dashboard, go to "Auth" tab
2. Under "OAuth 2.0 settings":
   - Authorized redirect URLs: https://socialsignt.netlify.app/.netlify/functions/oauth
3. Save changes

## Step 3: Add Products
1. Go to "Products" tab
2. Add these products:
   - "Sign In with LinkedIn using OpenID Connect"
   - "Share on LinkedIn" (if available)
   - "Marketing Developer Platform" (for company analytics)

## Step 4: Get App Credentials
1. Go to "Auth" tab
2. Under "Application credentials":
   - Copy Client ID
   - Copy Client Secret
3. Keep these secure!

## Required Information:
- LinkedIn Client ID: [Copy from LinkedIn]
- LinkedIn Client Secret: [Copy from LinkedIn]
