import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
} from '@mui/material';
import {
  Person,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthLayout from '../components/auth/AuthLayout';
import SocialLogin from '../components/auth/SocialLogin';

function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [serverError, setServerError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
    subscribeNewsletter: false,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'agreeTerms' || name === 'subscribeNewsletter' ? checked : value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    if (serverError) {
      setServerError('');
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 0) {
      if (!formData.name) {
        newErrors.name = 'Full name is required';
      } else if (formData.name.length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      }
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
    }
    
    if (step === 1) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    if (step === 2) {
      if (!formData.agreeTerms) {
        newErrors.agreeTerms = 'You must agree to the terms and conditions';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  // ✅ CRITICAL FIX: Added e.preventDefault()
  const handleSubmit = async (e) => {
    e.preventDefault();  // ← THIS PREVENTS GET REQUEST TO ROOT

    if (!validateStep(2)) return;
    
    setLoading(true);
    setServerError('');

    try {
      const response = await fetch('https://e-commerce-owv6.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      toast.success('Registration successful! Please login.', {
        position: 'bottom-right',
        autoClose: 3000,
      });

      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (error) {
      console.error('Registration error:', error);
      setServerError(error.message || 'Registration failed. Please try again.');
      toast.error(error.message || 'Registration failed. Please try again.', {
        position: 'bottom-right',
      });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      label: 'Personal Information',
      description: 'Tell us about yourself',
      content: (
        <Box sx={{ mt: 2 }}>
          {serverError && activeStep === 2 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {serverError}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      ),
    },
    {
      label: 'Security',
      description: 'Create your password',
      content: (
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Password must contain:
            </Typography>
            <Box sx={{ mt: 1 }}>
              {[
                'At least 6 characters',
                'At least one uppercase letter',
                'At least one number',
                'At least one special character',
              ].map((requirement, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <CheckCircle
                    sx={{
                      fontSize: 16,
                      color: formData.password.length > 0 ? 'success.main' : 'grey.400',
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {requirement}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      ),
    },
    {
      label: 'Terms & Conditions',
      description: 'Review and agree',
      content: (
        <Box sx={{ mt: 2 }}>
          {serverError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {serverError}
            </Alert>
          )}
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              maxHeight: 200,
              overflow: 'auto',
              mb: 3,
              bgcolor: 'grey.50',
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Terms and Conditions
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              By creating an account, you agree to our terms of service and privacy policy.
              Please read them carefully before proceeding.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
              tempor incididunt ut labore et dolore magna aliqua.
            </Typography>
          </Paper>

          <FormControlLabel
            control={
              <Checkbox
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                color="primary"
                disabled={loading}
              />
            }
            label="I agree to the Terms and Conditions"
          />
          {errors.agreeTerms && (
            <Typography variant="caption" color="error" sx={{ display: 'block', ml: 4, mt: 0.5 }}>
              {errors.agreeTerms}
            </Typography>
          )}

          <FormControlLabel
            control={
              <Checkbox
                name="subscribeNewsletter"
                checked={formData.subscribeNewsletter}
                onChange={handleChange}
                color="primary"
                disabled={loading}
              />
            }
            label="Subscribe to our newsletter for exclusive offers"
            sx={{ mt: 1 }}
          />
        </Box>
      ),
    },
  ];

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join ShopHub today"
      image="https://images.unsplash.com/photo-1574169208507-84376144848b?w=800&h=600&fit=crop"
      alternateLink="/login"
      alternateText="Already have an account?"
    >
      <Box>
        <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 3 }}>
          {steps.map((step, index) => (
            <Step key={index}>
              <StepLabel>
                <Typography variant="subtitle2">{step.label}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {step.description}
                </Typography>
              </StepLabel>
              <StepContent>
                {step.content}
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  {index > 0 && (
                    <Button onClick={handleBack} disabled={loading}>
                      Back
                    </Button>
                  )}
                  {index === steps.length - 1 ? (
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      disabled={loading}
                      sx={{ flex: 1 }}
                    >
                      {loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={loading}
                      sx={{ flex: 1 }}
                    >
                      Next
                    </Button>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 3 }}>
          <SocialLogin />
        </Box>
      </Box>
    </AuthLayout>
  );
}

export default RegisterPage;
