# Social Sight

A lightweight, responsive web-based dashboard that tracks key social media metrics across multiple platforms. Built with React, TailwindCSS, and deployed on Netlify.

## Features

- **One-Click Account Connection**: No API tokens needed - connect with OAuth 2.0
- **Real-time Social Media Metrics**: Track likes, comments, followers, hashtags, and shares
- **Multi-Platform Support**: Facebook, Instagram, Twitter/X, LinkedIn, and TikTok
- **Responsive Dashboard**: Beautiful, modern UI that works on all devices
- **Data Visualization**: Interactive charts and graphs using Recharts
- **Serverless Architecture**: Powered by Netlify Functions
- **Secure Authentication**: Industry-standard OAuth 2.0 security
- **Historical Data**: Track performance over time

## Tech Stack

- **Frontend**: React 18, TailwindCSS, Recharts
- **Backend**: Netlify Functions (Node.js)
- **Deployment**: Netlify with CI/CD from GitHub
- **APIs**: Meta Graph API, Twitter API v2, LinkedIn API
- **Icons**: Lucide React

## Project Structure

```
/social-sight
├── /public              # Static files
├── /src
│   ├── /components      # Reusable UI components
│   ├── /pages          # Page components
│   ├── /apiHooks       # API fetch logic
│   └── App.jsx         # Main app component
├── /functions          # Netlify Functions
│   ├── facebook.js     # Facebook API integration
│   ├── instagram.js    # Instagram API integration
│   ├── twitter.js      # Twitter API integration
│   └── linkedin.js     # LinkedIn API integration
├── netlify.toml        # Deployment configuration
├── package.json        # Dependencies
└── README.md          # This file
```

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/juma-classic/socialsite.git
   cd socialsite
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up OAuth applications:**
   - Copy `.env.example` to `.env`
   - Create OAuth apps on each platform and add your Client IDs/Secrets:
     ```
     FACEBOOK_CLIENT_ID=your_facebook_app_id
     FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
     INSTAGRAM_CLIENT_ID=your_instagram_app_id
     INSTAGRAM_CLIENT_SECRET=your_instagram_app_secret
     TWITTER_CLIENT_ID=your_twitter_client_id
     TWITTER_CLIENT_SECRET=your_twitter_client_secret
     LINKEDIN_CLIENT_ID=your_linkedin_client_id
     LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
     ```

4. **Start development server:**
   ```bash
   npm start
   ```

## Deployment

### Deploy to Netlify

1. **Connect GitHub repository** to Netlify
2. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `build`
   - Functions directory: `functions`

3. **Add environment variables** in Netlify dashboard:
   - `FACEBOOK_CLIENT_ID` & `FACEBOOK_CLIENT_SECRET`
   - `INSTAGRAM_CLIENT_ID` & `INSTAGRAM_CLIENT_SECRET`
   - `TWITTER_CLIENT_ID` & `TWITTER_CLIENT_SECRET`
   - `LINKEDIN_CLIENT_ID` & `LINKEDIN_CLIENT_SECRET`

4. **Deploy** - Netlify will automatically build and deploy your site

Your site will be available at: `https://your-site-name.netlify.app`

## Easy Account Connection - No API Keys Required!

### One-Click OAuth Authentication
Instead of asking users for complex API tokens, Social Sight uses **secure OAuth authentication**:

1. **Click "Connect"** on any social media platform
2. **Login normally** on the platform's official website (Facebook.com, Instagram.com, etc.)
3. **Grant permissions** for Social Sight to read your public metrics
4. **Done!** Your account is connected and metrics start flowing

### Why This is Better Than API Keys:
- ✅ **No technical knowledge required** - anyone can connect accounts
- ✅ **More secure** - you login directly on official platforms
- ✅ **We never see your passwords** - OAuth handles everything securely
- ✅ **Easy to revoke** - disconnect anytime from platform settings
- ✅ **Official authentication** - approved by Facebook, Twitter, etc.

### For Advanced Users:
If you're a developer and prefer to use your own API keys, there's still a manual configuration option in the settings page.

## Features Overview

### Dashboard
- **Statistics Cards**: Display total followers, likes, comments, and shares
- **Growth Charts**: Visualize metrics over time
- **Top Hashtags**: See most used hashtags across platforms
- **Recent Activity**: Real-time feed of social media activity

### Analytics
- **Platform Comparison**: Compare performance across different platforms
- **Engagement Breakdown**: Pie chart showing engagement distribution
- **Detailed Metrics Table**: Comprehensive view of all metrics

### Settings
- **API Configuration**: Manage API keys and tokens
- **Notifications**: Set up email and push notifications
- **Data Management**: Configure data retention and export options
- **General Settings**: Timezone, currency, and theme preferences

## Customization

### Colors
The app uses a primary color scheme that can be customized in `tailwind.config.js`:

```js
colors: {
  primary: {
    50: '#eff6ff',
    500: '#3b82f6',
    600: '#2563eb',
    // ... add more shades
  }
}
```

### Components
All components are modular and can be easily customized:
- `StatCard.jsx` - Metric display cards
- `MetricsChart.jsx` - Chart components
- `Sidebar.jsx` - Navigation sidebar

## Security

- API keys are stored as environment variables
- CORS is properly configured for all endpoints
- Input validation and sanitization
- Rate limiting (implement based on your needs)

## Performance

- Lazy loading for components
- Optimized API calls with caching
- Responsive design for mobile devices
- Efficient state management

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Links

- **Live Demo**: [socialsight.netlify.app](https://socialsight.netlify.app)
- **GitHub**: [github.com/juma-classic/socialsite](https://github.com/juma-classic/socialsite)
- **Documentation**: [Link to detailed docs]

## Acknowledgments

- [React](https://reactjs.org/) - Frontend framework
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [Recharts](https://recharts.org/) - Charts and graphs
- [Netlify](https://netlify.com/) - Hosting and functions
- [Lucide React](https://lucide.dev/) - Icons

---

**Built with ❤️ by [Your Name]**
