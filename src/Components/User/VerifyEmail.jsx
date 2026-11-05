import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Container, Paper, Typography, Box, Button, CircularProgress } from '@mui/material';
import { applyActionCode } from 'firebase/auth';
import { auth, firebaseConfigured } from '../Utils/firebase';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  
  const oobCode = searchParams.get('oobCode');
  const mode = searchParams.get('mode');
  
  // Use a ref to prevent strict-mode double firing
  const hasAttempted = useRef(false);

  useEffect(() => {
    if (!firebaseConfigured || !auth) {
      setStatus('error');
      setErrorMessage('Email verification is unavailable until Yokan Vault Firebase credentials are configured.');
      return;
    }

    if (mode !== 'verifyEmail' || !oobCode) {
      setStatus('error');
      setErrorMessage('Invalid or missing verification code.');
      return;
    }

    if (hasAttempted.current) return;
    hasAttempted.current = true;

    const verifyCode = async () => {
      try {
        await applyActionCode(auth, oobCode);
        setStatus('success');
      } catch (error) {
        setStatus('error');
        if (error.code === 'auth/invalid-action-code') {
          setErrorMessage('This verification link has expired or has already been used.');
        } else {
          setErrorMessage(error.message.replace('Firebase: ', ''));
        }
      }
    };

    verifyCode();
  }, [oobCode, mode]);

  return (
    <Container maxWidth="xs" sx={{ mt: { xs: 8, sm: 12 }, mb: 8 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 4, sm: 5 }, 
          textAlign: 'center', 
          border: '1px solid rgba(28, 25, 23, 0.08)',
          boxShadow: '0 12px 40px rgba(28, 25, 23, 0.06)'
        }}
      >
        <Typography 
          variant="h6" 
          color="primary" 
          gutterBottom 
          sx={{ textTransform: 'uppercase', letterSpacing: '0.18em', mb: 3, fontWeight: 600, fontSize: '1.25rem' }}
        >
          Yokan Vault
        </Typography>

        {status === 'verifying' && (
          <Box sx={{ py: 4 }}>
            <CircularProgress size={48} sx={{ color: '#303e4b', mb: 3 }} />
            <Typography variant="body1" sx={{ color: '#535758', fontWeight: 500 }}>
              Verifying your email...
            </Typography>
            <Typography variant="body2" sx={{ color: '#535758', mt: 1 }}>
              Please wait while we secure your account.
            </Typography>
          </Box>
        )}

        {status === 'success' && (
          <Box sx={{ py: 2 }}>
            <CheckCircleOutlinedIcon sx={{ fontSize: 64, color: '#10B981', mb: 2 }} />
            <Typography variant="h5" sx={{ fontFamily: '"Cormorant", serif', fontWeight: 600, color: '#303e4b', mb: 1 }}>
              Email Verified
            </Typography>
            <Typography variant="body2" sx={{ color: '#535758', mb: 4, lineHeight: 1.6 }}>
              Your account has been successfully verified. You can now access all features of your account.
            </Typography>
            <Button
              component={Link}
              to="/login"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ py: 1.5, fontSize: '0.85rem' }}
            >
              Continue to Login
            </Button>
          </Box>
        )}

        {status === 'error' && (
          <Box sx={{ py: 2 }}>
            <ErrorOutlinedIcon sx={{ fontSize: 64, color: '#EF4444', mb: 2 }} />
            <Typography variant="h5" sx={{ fontFamily: '"Cormorant", serif', fontWeight: 600, color: '#303e4b', mb: 1 }}>
              Verification Failed
            </Typography>
            <Typography variant="body2" sx={{ color: '#535758', mb: 4, lineHeight: 1.6 }}>
              {errorMessage}
            </Typography>
            <Button
              component={Link}
              to="/login"
              fullWidth
              variant="outlined"
              color="primary"
              sx={{ py: 1.5, fontSize: '0.85rem' }}
            >
              Return to Login
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default VerifyEmail;
