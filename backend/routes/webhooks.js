const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const Post = require('../models/Post');
const User = require('../models/User');

// Facebook webhook verification
router.get('/facebook', (req, res) => {
  const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN || 'facebook_verify_token_123';
  
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Facebook webhook verified');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

// Facebook webhook for receiving updates
router.post('/facebook', (req, res) => {
  const body = req.body;
  
  if (body.object === 'page') {
    body.entry.forEach(entry => {
      const webhookEvent = entry.messaging?.[0] || entry.changes?.[0];
      
      if (webhookEvent) {
        console.log('Facebook webhook received:', JSON.stringify(webhookEvent, null, 2));
        // Process the webhook event here
        // Update post engagement metrics, handle comments, etc.
      }
    });
    
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Twitter webhook verification
router.get('/twitter', (req, res) => {
  const crc_token = req.query.crc_token;
  
  if (crc_token) {
    const hash = crypto
      .createHmac('sha256', process.env.TWITTER_CONSUMER_SECRET || 'twitter_secret')
      .update(crc_token)
      .digest('base64');
    
    res.status(200).json({
      response_token: `sha256=${hash}`
    });
  } else {
    res.sendStatus(400);
  }
});

// Twitter webhook for receiving updates
router.post('/twitter', (req, res) => {
  const body = req.body;
  
  console.log('Twitter webhook received:', JSON.stringify(body, null, 2));
  
  // Process Twitter webhook events
  if (body.tweet_create_events) {
    body.tweet_create_events.forEach(tweet => {
      console.log('New tweet:', tweet.text);
      // Handle new tweet events
    });
  }
  
  if (body.favorite_events) {
    body.favorite_events.forEach(event => {
      console.log('Tweet favorited:', event.favorited_status.text);
      // Update engagement metrics
    });
  }
  
  res.status(200).send('OK');
});

// LinkedIn webhook verification
router.get('/linkedin', (req, res) => {
  const challenge = req.query.challenge;
  
  if (challenge) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(400);
  }
});

// LinkedIn webhook for receiving updates
router.post('/linkedin', (req, res) => {
  const body = req.body;
  
  console.log('LinkedIn webhook received:', JSON.stringify(body, null, 2));
  
  // Process LinkedIn webhook events
  if (body.events) {
    body.events.forEach(event => {
      console.log('LinkedIn event:', event.eventType);
      // Handle LinkedIn events
    });
  }
  
  res.status(200).send('OK');
});

// Instagram webhook verification
router.get('/instagram', (req, res) => {
  const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN || 'instagram_verify_token_123';
  
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Instagram webhook verified');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

// Instagram webhook for receiving updates
router.post('/instagram', (req, res) => {
  const body = req.body;
  
  if (body.object === 'instagram') {
    body.entry.forEach(entry => {
      const changes = entry.changes || [];
      
      changes.forEach(change => {
        console.log('Instagram webhook received:', JSON.stringify(change, null, 2));
        // Process Instagram webhook events
      });
    });
    
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Generic webhook handler for other platforms
router.post('/generic', (req, res) => {
  const body = req.body;
  const platform = req.query.platform;
  
  console.log(`Generic webhook received for ${platform}:`, JSON.stringify(body, null, 2));
  
  // Process generic webhook events
  res.status(200).json({ 
    message: 'Webhook received',
    platform: platform || 'unknown'
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    webhooks: {
      facebook: '/api/webhooks/facebook',
      twitter: '/api/webhooks/twitter',
      linkedin: '/api/webhooks/linkedin',
      instagram: '/api/webhooks/instagram',
      generic: '/api/webhooks/generic'
    }
  });
});

module.exports = router;
