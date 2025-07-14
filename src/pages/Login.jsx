import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Sparkles, Zap } from 'lucide-react';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  // Floating emojis for background
  const socialEmojis = ['📱', '💬', '📊', '🚀', '⚡', '🎯', '💡', '🔔', '📈', '🌟', '💫', '🎨', '📸', '🎬', '🎪', '🎭', '🎊', '🎉', '💝', '🎁', '🔥', '✨', '🌈', '🦄', '🤖', '👥', '🌍', '💻', '📺', '📱'];

  useEffect(() => {
    // BYPASS LOGIN PAGE: Immediately redirect to dashboard
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (isSignUp) {
      if (!formData.fullName) {
        setError('Please enter your full name');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isSignUp) {
        const { data, error } = await authService.signUp(
          formData.email,
          formData.password,
          { full_name: formData.fullName }
        );

        if (error) {
          setError(error.message);
        } else {
          setSuccess('Account created successfully! Please check your email to verify your account.');
          // Reset form
          setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            fullName: ''
          });
        }
      } else {
        // DEVELOPMENT OVERRIDE: Allow any email/password to log in
        setSuccess('Login successful! Redirecting...');
        // Set a dummy user in localStorage to simulate login for useAuth
        localStorage.setItem('devUser', JSON.stringify({ email: formData.email }));
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 500);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email address first');
      return;
    }

    setLoading(true);
    const { error } = await authService.resetPassword(formData.email);
    
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Password reset email sent! Check your inbox.');
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { error } = await authService.signInWithGoogle();
      
      if (error) {
        setError(error.message);
      }
      // Success will be handled by the auth state change listener
    } catch (error) {
      setError('Google sign-in failed. Please try again.');
    }
    
    setLoading(false);
  };

  const FloatingEmoji = ({ emoji, delay = 0 }) => (
    <div
      className="absolute text-2xl opacity-20 animate-bounce"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${3 + Math.random() * 2}s`
      }}
    >
      {emoji}
    </div>
  );

  // BYPASS LOGIN PAGE: Render nothing (or a loading indicator if you prefer)
  return null;
};

export default Login;
