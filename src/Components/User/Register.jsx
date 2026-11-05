import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth, API_ORIGIN } from '../Utils/AuthContext';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../Utils/firebase';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Container, Box, Typography, TextField, Button, Paper, Alert, IconButton, InputAdornment
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import AddIcon from '@mui/icons-material/Add';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import Swal from 'sweetalert2';
import getFirebaseAuthErrorMessage from '../Utils/firebaseAuthError';

const Register = () => {
  const { signup, loginWithGoogle, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [fileError, setFileError] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(false);
  const [usernameCheckError, setUsernameCheckError] = useState('');
  const fileInputRef = useRef(null);

  const hasTyped = useRef({
    firstName: false,
    lastName: false,
    username: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  const handleInputChange = (e) => {
    const { name } = e.target;
    if (name) {
      hasTyped.current[name] = true;
    }
    formik.handleChange(e);
  };

  const shouldShowError = (field) => {
    if (formik.submitCount > 0) {
      return Boolean(formik.errors[field]);
    }
    if (!hasTyped.current[field]) {
      return false;
    }
    return Boolean(formik.touched[field] && formik.errors[field]);
  };

  const handleSocialLogin = async (providerFunc, method) => {
    setAuthError('');
    try {
      const result = await providerFunc();
      navigate(result && result.needsProfile ? '/complete-profile' : '/');
    } catch (err) {
      console.error('Social login failed:', err.code || 'unknown error');
      setAuthError(getFirebaseAuthErrorMessage(err, method));
    }
  };

  const formik = useFormik({
    validateOnChange: true,
    initialValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      profilePicture: null
    },
    validationSchema: Yup.object({
      firstName: Yup.string().matches(/^[a-zA-Z\s\-']+$/, 'Only letters, spaces, hyphens, and apostrophes are allowed.').max(50, 'Must be 50 characters or less').required('First Name is required.'),
      lastName: Yup.string().matches(/^[a-zA-Z\s\-']+$/, 'Only letters, spaces, hyphens, and apostrophes are allowed.').max(50, 'Must be 50 characters or less').required('Last Name is required.'),
      username: Yup.string().min(3, 'Must be at least 3 characters').matches(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores').required('Username is required.'),
      email: Yup.string().email('Please enter a valid email address.').required('Email address is required.'),
      password: Yup.string().min(6, 'Password must be at least 6 characters.').required('Password is required.'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm Password is required.')
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setAuthError('');
      try {
        const usernameCheck = await axios.get(`${API_ORIGIN}/api/users/check-username?username=${values.username}`);
        if (!usernameCheck.data.available) {
          formik.setFieldError('username', 'Username is already taken.');
          setLoading(false);
          return;
        }

        let userCredential;
        let createdNow = true;
        try {
          userCredential = await signup(values.email, values.password);
        } catch (signupError) {
          // an earlier attempt may have left an unverified account behind: pick it up again
          if (signupError.code !== 'auth/email-already-in-use') throw signupError;
          try {
            userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
          } catch (e) { throw signupError; }
          if (userCredential.user.emailVerified) { await logout(); throw signupError; }
          createdNow = false;
        }
        try {
        const token = await userCredential.user.getIdToken();

        const formattedFirstName = values.firstName.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.substr(1).toLowerCase());
        const formattedLastName = values.lastName.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.substr(1).toLowerCase());

        const formData = new FormData();
        formData.append('displayName', `${formattedFirstName} ${formattedLastName}`);
        formData.append('username', values.username);
        if (values.profilePicture) {
          formData.append('photo', values.profilePicture);
        }

        await new Promise(r => setTimeout(r, 1000));
        
        await axios.put(`${API_ORIGIN}/api/users/profile`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });

        await axios.post(`${API_ORIGIN}/api/users/send-verification`, {
          email: values.email,
          firstName: formattedFirstName,
          lastName: formattedLastName
        });

        } catch (stepError) {
          if (createdNow) { try { await userCredential.user.delete(); } catch (e) { /* ignore */ } }
          throw stepError;
        }
        await logout();

        Swal.fire({
          icon: 'success',
          title: '<span style="font-family: \'Lora\', serif;">Registration successful!</span>',
          html: 'Please check your email to verify your account.',
          confirmButtonColor: '#1C1917',
          customClass: { popup: 'premium-swal-popup' }
        });

        navigate('/login');
      } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
          setAuthError(err.response.data.message);
        } else setAuthError(getFirebaseAuthErrorMessage(err, 'Email/Password sign-up'));
      }
      setLoading(false);
    },
  });

  const checkUsername = useCallback(async (val) => {
    if (!val || val.length < 3 || !/^[a-zA-Z0-9_]+$/.test(val)) {
      setUsernameAvailable(false);
      return;
    }

    setIsCheckingUsername(true);
    try {
      const res = await axios.get(`${API_ORIGIN}/api/users/check-username?username=${val}`);
      setUsernameAvailable(res.data.available);
      if (!res.data.available) {
        setUsernameCheckError('Username is already taken.');
      } else {
        setUsernameCheckError('');
      }
    } catch (err) {
      console.error('Username availability check failed:', err.code || err.response?.status || 'unknown error');
    }
    setIsCheckingUsername(false);
  }, []);

  useEffect(() => {
    setUsernameAvailable(false);
    setUsernameCheckError('');
    
    const val = formik.values.username;
    if (!val || val.length < 3 || !/^[a-zA-Z0-9_]+$/.test(val)) return;

    const handler = setTimeout(() => {
      checkUsername(val);
    }, 500);

    return () => clearTimeout(handler);
  }, [formik.values.username, checkUsername]);

  useEffect(() => {
    if (authError) {
      setAuthError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.email, formik.values.password]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError('');
    if (file) {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024;
      
      if (!isValidType) {
        setFileError('Only JPEG, PNG, and WEBP images are allowed. GIFs are not supported.');
        formik.setFieldValue('profilePicture', null);
        setPreviewUrl(null);
        return;
      }
      
      if (!isValidSize) {
        setFileError('File is too large (max 5MB). Defaulting to standard avatar.');
        formik.setFieldValue('profilePicture', null);
        setPreviewUrl(null);
        return;
      }
      
      // Valid file
      formik.setFieldValue('profilePicture', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Container maxWidth={false} sx={{ maxWidth: { xs: '100%', sm: 480 }, mt: { xs: 4, sm: 8 }, mb: 8 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 3, sm: 4 }, 
          textAlign: 'center', 
          border: '1px solid rgba(28, 25, 23, 0.08)',
          boxShadow: '0 8px 32px rgba(28, 25, 23, 0.04)'
        }}
      >
        <Typography 
          variant="h6" 
          color="primary" 
          gutterBottom 
          sx={{ 
            textTransform: 'uppercase', 
            letterSpacing: '0.14em', 
            mb: 1.5, 
            fontWeight: 600, 
            fontSize: '1.35rem',
            whiteSpace: 'nowrap'
          }}
        >
          Yokan Vault
        </Typography>
        
        <Typography variant="body2" color="textSecondary" sx={{ mb: 4, fontSize: '0.95rem' }}>
          Create an account to begin.
        </Typography>

        <Box 
          component="form" 
          onSubmit={formik.handleSubmit} 
          noValidate
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              size="small"
              id="firstName"
              name="firstName"
              label="First Name"
              variant="outlined"
              value={formik.values.firstName}
              onChange={handleInputChange}
              onBlur={formik.handleBlur}
              error={shouldShowError('firstName')}
              helperText={shouldShowError('firstName') ? formik.errors.firstName : ''}
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: '44px',
                }
              }}
              slotProps={{
                inputLabel: { sx: { fontSize: '0.95rem' } },
                htmlInput: { sx: { fontSize: '0.95rem' } },
                formHelperText: { sx: { fontSize: '0.8rem' } }
              }}
            />
            <TextField
              fullWidth
              size="small"
              id="lastName"
              name="lastName"
              label="Last Name"
              variant="outlined"
              value={formik.values.lastName}
              onChange={handleInputChange}
              onBlur={formik.handleBlur}
              error={shouldShowError('lastName')}
              helperText={shouldShowError('lastName') ? formik.errors.lastName : ''}
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: '44px',
                }
              }}
              slotProps={{
                inputLabel: { sx: { fontSize: '0.95rem' } },
                htmlInput: { sx: { fontSize: '0.95rem' } },
                formHelperText: { sx: { fontSize: '0.8rem' } }
              }}
            />
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ mb: 1, fontSize: '0.95rem', color: '#535758' }}>
              Profile Picture (Optional) <Typography component="span" sx={{ fontSize: '0.8rem', color: '#535758' }}>(Max 5MB)</Typography>
            </Typography>
            <Box 
              onClick={() => fileInputRef.current.click()}
              sx={{
                width: 82, height: 82, borderRadius: '50%', mx: 'auto',
                border: '2px dashed rgba(28, 25, 23, 0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', position: 'relative',
                backgroundImage: previewUrl ? `url(${previewUrl})` : 'url(/default-avatar.png)',
                backgroundSize: 'cover', backgroundPosition: 'center',
                transition: 'border-color 0.2s ease',
                '&:hover': { borderColor: '#1C1917' }
              }}
            >
              <Box sx={{
                position: 'absolute', bottom: 0, right: 0, 
                bgcolor: '#fbbf24', color: '#fff', width: 23, height: 23, 
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}>
                <AddIcon sx={{ fontSize: 15 }} />
              </Box>
            </Box>
            <Typography 
              variant="caption" 
              onClick={() => fileInputRef.current.click()}
              sx={{ color: '#535758', mt: 1, display: 'block', cursor: 'pointer', fontSize: '0.85rem', '&:hover': { color: '#303e4b' } }}
            >
              Upload Photo
            </Typography>
            <input 
              type="file" 
              accept="image/jpeg,image/png,image/webp"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {fileError && (
              <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1, fontSize: '0.8rem' }}>
                {fileError}
              </Typography>
            )}
          </Box>

          <TextField
            fullWidth
            size="small"
            id="username"
            name="username"
            label="Username"
            variant="outlined"
            value={formik.values.username}
            onChange={handleInputChange}
            onBlur={formik.handleBlur}
            error={Boolean(shouldShowError('username') && formik.errors.username) || Boolean(usernameCheckError)}
            helperText={(shouldShowError('username') && formik.errors.username) || usernameCheckError}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: '44px',
              }
            }}
            slotProps={{
              inputLabel: { sx: { fontSize: '0.95rem' } },
              htmlInput: { sx: { fontSize: '0.95rem' } },
              formHelperText: { sx: { fontSize: '0.8rem' } }
            }}
          />

          <TextField
            fullWidth
            size="small"
            id="email"
            name="email"
            label="Email Address"
            variant="outlined"
            value={formik.values.email}
            onChange={handleInputChange}
            onBlur={formik.handleBlur}
            error={shouldShowError('email')}
            helperText={shouldShowError('email') ? formik.errors.email : ''}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: '44px',
              }
            }}
            slotProps={{
              inputLabel: { sx: { fontSize: '0.95rem' } },
              htmlInput: { sx: { fontSize: '0.95rem' } },
              formHelperText: { sx: { fontSize: '0.8rem' } }
            }}
          />

          <TextField
            fullWidth
            size="small"
            id="password"
            name="password"
            label="Password"
            variant="outlined"
            type={showPassword ? 'text' : 'password'}
            value={formik.values.password}
            onChange={handleInputChange}
            onBlur={formik.handleBlur}
            error={shouldShowError('password')}
            helperText={shouldShowError('password') ? formik.errors.password : ''}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: '44px',
              }
            }}
            slotProps={{
              inputLabel: { sx: { fontSize: '0.95rem' } },
              htmlInput: { sx: { fontSize: '0.95rem' } },
              formHelperText: { sx: { fontSize: '0.8rem' } },
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                      size="small"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <Visibility sx={{ fontSize: '1.25rem' }} /> : <VisibilityOff sx={{ fontSize: '1.25rem' }} />}
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
          />

          <TextField
            fullWidth
            size="small"
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            variant="outlined"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formik.values.confirmPassword}
            onChange={handleInputChange}
            onBlur={formik.handleBlur}
            error={shouldShowError('confirmPassword')}
            helperText={shouldShowError('confirmPassword') ? formik.errors.confirmPassword : ''}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: '44px',
              }
            }}
            slotProps={{
              inputLabel: { sx: { fontSize: '0.95rem' } },
              htmlInput: { sx: { fontSize: '0.95rem' } },
              formHelperText: { sx: { fontSize: '0.8rem' } },
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                      size="small"
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <Visibility sx={{ fontSize: '1.25rem' }} /> : <VisibilityOff sx={{ fontSize: '1.25rem' }} />}
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
          />
          
          {authError && (
            <Alert severity="error" sx={{ borderRadius: 0, textAlign: 'left', fontSize: '0.9rem' }}>
              {authError}
            </Alert>
          )}

          <Button 
            type="submit" 
            fullWidth 
            variant="contained" 
            color="primary" 
            disabled={loading || isCheckingUsername || Boolean(usernameCheckError) || !usernameAvailable || formik.values.username.length < 3}
            sx={{ height: '44px', fontSize: '0.95rem', fontWeight: 600, letterSpacing: '0.04em' }}
          >
            {loading || isCheckingUsername ? 'Creating Account...' : 'Register'}
          </Button>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ fontSize: '0.85rem', color: '#535758' }}>
            Already have an account?{' '}
            <Link 
              to="/login" 
              style={{ 
                color: '#303e4b', 
                textDecoration: 'underline', 
                fontWeight: 600,
                textUnderlineOffset: '3px'
              }}
            >
              Sign In
            </Link>
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
          <Box sx={{ flex: 1, height: '1px', bgcolor: 'rgba(28, 25, 23, 0.1)' }} />
          <Typography variant="caption" sx={{ mx: 2, color: '#535758', textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.8rem', fontWeight: 500 }}>Or</Typography>
          <Box sx={{ flex: 1, height: '1px', bgcolor: 'rgba(28, 25, 23, 0.1)' }} />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button 
            variant="outlined" 
            startIcon={<GoogleIcon sx={{ fontSize: '1.35rem' }} />}
            onClick={() => handleSocialLogin(loginWithGoogle, 'Google sign-in')}
            sx={{ 
              height: '44px',
              borderColor: 'rgba(28, 25, 23, 0.2)', 
              color: '#303e4b', 
              '&:hover': { borderColor: '#1C1917', backgroundColor: 'transparent' }, 
              fontSize: '0.95rem',
              fontWeight: 500
            }}
          >
            Continue with Google
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
