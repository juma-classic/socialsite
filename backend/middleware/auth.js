const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to authenticate JWT token
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        message: 'Please provide a valid authentication token' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'User not found or inactive' 
      });
    }

    req.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      subscription: user.subscription
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'Please log in again' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Please log in again' 
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({ 
      error: 'Authentication failed',
      message: 'Internal server error' 
    });
  }
};

/**
 * Middleware to check if user has required subscription features
 */
const requireSubscription = (feature) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const hasFeature = user.subscription.features[feature];
      
      if (!hasFeature) {
        return res.status(403).json({ 
          error: 'Subscription required',
          message: `This feature requires a subscription plan that includes ${feature}`,
          requiredFeature: feature,
          currentPlan: user.subscription.plan
        });
      }

      next();
    } catch (error) {
      console.error('Subscription check error:', error);
      return res.status(500).json({ error: 'Failed to check subscription' });
    }
  };
};

/**
 * Middleware to check posting limits
 */
const checkPostingLimits = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user can create more posts this month
    const canPost = await user.canCreatePost();
    
    if (!canPost) {
      const postsThisMonth = await user.getPostsThisMonth();
      return res.status(403).json({ 
        error: 'Post limit reached',
        message: `You have reached your monthly limit of ${user.subscription.features.maxPosts} posts`,
        postsThisMonth: postsThisMonth,
        maxPosts: user.subscription.features.maxPosts,
        currentPlan: user.subscription.plan
      });
    }

    next();
  } catch (error) {
    console.error('Post limit check error:', error);
    return res.status(500).json({ error: 'Failed to check posting limits' });
  }
};

/**
 * Middleware to check platform limits
 */
const checkPlatformLimits = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const canAddPlatform = user.canAddPlatform();
    
    if (!canAddPlatform) {
      const connectedPlatforms = user.socialAccounts.filter(acc => acc.isActive).length;
      return res.status(403).json({ 
        error: 'Platform limit reached',
        message: `You can only connect ${user.subscription.features.maxPlatforms} platforms`,
        connectedPlatforms: connectedPlatforms,
        maxPlatforms: user.subscription.features.maxPlatforms,
        currentPlan: user.subscription.plan
      });
    }

    next();
  } catch (error) {
    console.error('Platform limit check error:', error);
    return res.status(500).json({ error: 'Failed to check platform limits' });
  }
};

/**
 * Middleware to validate platform access
 */
const validatePlatformAccess = (req, res, next) => {
  const { platform } = req.params;
  
  const supportedPlatforms = ['facebook', 'instagram', 'twitter', 'linkedin', 'google', 'tiktok'];
  
  if (!supportedPlatforms.includes(platform)) {
    return res.status(400).json({ 
      error: 'Unsupported platform',
      message: `Platform '${platform}' is not supported`,
      supportedPlatforms: supportedPlatforms
    });
  }

  next();
};

/**
 * Middleware to check if user has connected the specified platform
 */
const requirePlatformConnection = async (req, res, next) => {
  try {
    const { platform } = req.params;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hasAccess = user.hasPlatformAccess(platform);
    
    if (!hasAccess) {
      return res.status(403).json({ 
        error: 'Platform not connected',
        message: `You need to connect your ${platform} account first`,
        platform: platform
      });
    }

    next();
  } catch (error) {
    console.error('Platform connection check error:', error);
    return res.status(500).json({ error: 'Failed to check platform connection' });
  }
};

/**
 * Middleware to refresh tokens if they're about to expire
 */
const refreshTokensIfNeeded = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
    
    for (const account of user.socialAccounts) {
      if (account.tokenExpiry && account.tokenExpiry < oneHourFromNow && account.refreshToken) {
        try {
          // Attempt to refresh the token
          const refreshResult = await refreshAccessToken(account.platform, account.refreshToken);
          
          if (refreshResult.success) {
            account.accessToken = refreshResult.tokens.access_token;
            if (refreshResult.tokens.refresh_token) {
              account.refreshToken = refreshResult.tokens.refresh_token;
            }
            account.tokenExpiry = refreshResult.tokens.expires_in ? 
              new Date(Date.now() + refreshResult.tokens.expires_in * 1000) : null;
            account.lastSync = new Date();
            
            console.log(`Token refreshed for ${account.platform}`);
          } else {
            console.warn(`Token refresh failed for ${account.platform}:`, refreshResult.error);
          }
        } catch (error) {
          console.error(`Token refresh error for ${account.platform}:`, error);
        }
      }
    }
    
    await user.save();
    next();
  } catch (error) {
    console.error('Token refresh middleware error:', error);
    next(); // Continue even if refresh fails
  }
};

/**
 * Middleware to add user context to request
 */
const addUserContext = async (req, res, next) => {
  try {
    if (req.user && req.user.id) {
      const user = await User.findById(req.user.id);
      if (user) {
        req.userContext = {
          subscription: user.subscription,
          socialAccounts: user.socialAccounts,
          settings: user.settings,
          canPost: await user.canCreatePost(),
          canAddPlatform: user.canAddPlatform(),
          postsThisMonth: await user.getPostsThisMonth()
        };
      }
    }
    next();
  } catch (error) {
    console.error('User context middleware error:', error);
    next(); // Continue even if context fails
  }
};

/**
 * Middleware to log API requests
 */
const logRequest = (req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;
  
  res.send = function(data) {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    originalSend.call(this, data);
  };
  
  next();
};

/**
 * Middleware to validate request body
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message,
        details: error.details
      });
    }
    
    next();
  };
};

/**
 * Helper function to refresh access token
 */
async function refreshAccessToken(platform, refreshToken) {
  // Implementation depends on platform
  // This is a placeholder - actual implementation would be in the auth service
  return { success: false, error: 'Refresh not implemented' };
}

module.exports = {
  authenticateToken,
  requireSubscription,
  checkPostingLimits,
  checkPlatformLimits,
  validatePlatformAccess,
  requirePlatformConnection,
  refreshTokensIfNeeded,
  addUserContext,
  logRequest,
  validateRequest
};
