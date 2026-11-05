import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../Utils/AuthContext';
import Swal from 'sweetalert2';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Container, Box, Typography, TextField, Button, Paper, Alert, IconButton, InputAdornment
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import getFirebaseAuthErrorMessage from '../Utils/firebaseAuthError';

const Login = () => {
  const redirectTo = new URLSearchParams(window.location.search).get('redirect') === 'shipping' ? '/shipping' : '/';
  const { login, loginWithGoogle, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const hasTyped = useRef({ identifier: false, password: false });

  const formik = useFormik({
    validateOnChange: true,
    initialValues: {
      identifier: '',
      password: '',
    },
    validationSchema: Yup.object({
      identifier: Yup.string()
        .required('Email or username is required.')
        .test(
          'email-or-username',
          'Enter a valid email address or username.',
          (value) => {
            const identifier = value?.trim();
            return !identifier || (identifier.includes('@')
              ? Yup.string().email().isValidSync(identifier)
              : /^[a-zA-Z0-9_]{3,30}$/.test(identifier));
          }
        ),
      password: Yup.string().required('Password is required.'),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setAuthError('');
      try {
        const cred = await login(values.identifier.trim(), values.password);
        
        if (!cred.user.emailVerified) {
          await logout();
          throw new Error('Firebase: Please verify your email address to login.');
        }

        navigate(redirectTo);
      } catch (err) {
        setAuthError(err.response?.data?.message || getFirebaseAuthErrorMessage(err, 'Email/Password sign-in'));
      }
      setLoading(false);
    },
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

  useEffect(() => {
    if (authError) {
      setAuthError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.identifier, formik.values.password]);

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
          Sign in to continue to your account.
        </Typography>

        <Box 
          component="form" 
          onSubmit={formik.handleSubmit} 
          noValidate
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            fullWidth
            size="small"
            id="identifier"
            name="identifier"
            label="Email or username"
            variant="outlined"
            value={formik.values.identifier}
            onChange={handleInputChange}
            onBlur={formik.handleBlur}
            error={shouldShowError('identifier')}
            helperText={shouldShowError('identifier') ? formik.errors.identifier : ''}
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
            disabled={loading}
            sx={{ height: '44px', fontSize: '0.95rem', fontWeight: 600, letterSpacing: '0.04em' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ fontSize: '0.85rem', color: '#535758' }}>
            Don't have an account?{' '}
            <Link 
              to="/register" 
              style={{ 
                color: '#303e4b', 
                textDecoration: 'underline', 
                fontWeight: 600,
                textUnderlineOffset: '3px'
              }}
            >
              Sign Up
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

export default Login;
