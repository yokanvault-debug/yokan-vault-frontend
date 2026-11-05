import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Container, Paper, Box, Typography, TextField, 
  Button, CircularProgress 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAuth, API_ORIGIN } from '../Utils/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CompleteProfile = () => {
  const { currentUser, authLoading, logout, mongoUser, setMongoUser, syncSession } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [hasTouched, setHasTouched] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileError, setFileError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(false);
  const fileInputRef = useRef(null);

  // not signed in -> login;  profile already finished -> home
  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) navigate('/login', { replace: true });
    else if (mongoUser && mongoUser.username) navigate('/', { replace: true });
  }, [authLoading, currentUser, mongoUser, navigate]);

  const checkUsername = useCallback(async (val) => {
    if (!val || val.length < 3) {
      setUsernameAvailable(false);
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(val)) return;

    setIsCheckingUsername(true);
    try {
      const res = await axios.get(`${API_ORIGIN}/api/users/check-username?username=${val}`);
      setUsernameAvailable(res.data.available);
      if (!res.data.available) {
        setUsernameError('Username is already taken.');
      }
    } catch (err) {
      console.error(err);
    }
    setIsCheckingUsername(false);
  }, []);

  useEffect(() => {
    if (username.length > 0) {
      setHasTouched(true);
      setUsernameError('');
    } else if (username.length === 0 && hasTouched) {
      setUsernameError('Username is required.');
    }

    setUsernameAvailable(false);
    
    if (username && username.length < 3) {
      setUsernameError('Username must be at least 3 characters.');
      return;
    }
    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameError('Only letters, numbers, and underscores are allowed.');
      return;
    }

    const handler = setTimeout(() => {
      if (username && username.length >= 3) {
        checkUsername(username);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [username, checkUsername]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError('');
    if (file) {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024;
      
      if (!isValidType) {
        setFileError('Only JPEG, PNG, and WEBP images are allowed. GIFs are not supported.');
        setProfilePicture(null);
        setPreviewUrl(null);
        return;
      }
      
      if (!isValidSize) {
        setFileError('File is too large (max 5MB).');
        setProfilePicture(null);
        setPreviewUrl(null);
        return;
      }
      
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setHasTouched(true);
    if (!username.trim()) {
      setUsernameError('Username is required.');
      return;
    }
    if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters.');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameError('Only letters, numbers, and underscores are allowed.');
      return;
    }
    if (usernameError || isCheckingUsername || !usernameAvailable) {
      return;
    }

    setLoading(true);
    try {

      const token = await currentUser.getIdToken();
      const formData = new FormData();
      formData.append('username', username);
      if (profilePicture) {
        formData.append('photo', profilePicture);
      }

      const res = await axios.put(`${API_ORIGIN}/api/users/profile`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        }
      });

      // Update local state, triggering App.jsx to unmount this page and show normal routes
      setMongoUser(res.data.user);
      // profile is complete now: open the shop session, then go shopping
      await syncSession();
      navigate('/', { replace: true });
    } catch (err) {
      console.error(err);
      const serverMessage = err.response && err.response.data && err.response.data.message;
      setUsernameError(serverMessage || 'An error occurred. Please try again.');
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="xs" sx={{ mt: { xs: 4, sm: 8 }, mb: 8 }}>
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
          sx={{ textTransform: 'uppercase', letterSpacing: '0.18em', mb: 2, fontWeight: 600, fontSize: '1.25rem' }}
        >
          Yokan Vault
        </Typography>
        
        <Typography variant="body2" color="textSecondary" sx={{ mb: 4, fontSize: '0.85rem' }}>
          Please complete your profile to continue.
        </Typography>

        <form onSubmit={handleSave} noValidate>
          <Box sx={{ mt: 3, mb: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ mb: 1, fontSize: '0.85rem', color: '#535758' }}>
              Profile Picture (Optional) <Typography component="span" sx={{ fontSize: '0.75rem', color: '#535758' }}>(Max 5MB)</Typography>
            </Typography>
            <Box 
              onClick={() => fileInputRef.current.click()}
              sx={{
                width: 75, height: 75, borderRadius: '50%', mx: 'auto',
                border: '2px dashed rgba(28, 25, 23, 0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', position: 'relative',
                backgroundImage: previewUrl ? `url(${previewUrl})` : `url(${mongoUser?.photoURL}), url(/images/default-avatar.png)`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                transition: 'border-color 0.2s ease',
                '&:hover': { borderColor: '#1C1917' }
              }}
            >
              <Box sx={{
                position: 'absolute', bottom: 0, right: 0, 
                bgcolor: '#fbbf24', color: '#fff', width: 21, height: 21, 
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}>
                <AddIcon sx={{ fontSize: 14 }} />
              </Box>
            </Box>
            <Typography 
              variant="caption" 
              onClick={() => fileInputRef.current.click()}
              sx={{ color: '#535758', mt: 1, display: 'block', cursor: 'pointer', '&:hover': { color: '#303e4b' } }}
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
              <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                {fileError}
              </Typography>
            )}
          </Box>

          <TextField
            fullWidth
            label="Choose a Username *"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={Boolean(usernameError)}
            helperText={usernameError}
            size="small"
            sx={{ mb: 4 }}
            slotProps={{
              inputLabel: { sx: { fontSize: '0.85rem' } },
              htmlInput: { sx: { fontSize: '0.9rem' } }
            }}
          />

          <Button 
            fullWidth 
            type="submit"
            variant="contained" 
            disabled={loading || isCheckingUsername || Boolean(usernameError) || !usernameAvailable || username.length < 3}
            sx={{ 
              height: '40px',
              bgcolor: '#303e4b', 
              color: '#fff',
              mb: 2,
              '&:hover': { bgcolor: '#292524' }
            }}
          >
            {loading || isCheckingUsername ? <CircularProgress size={24} color="inherit" /> : 'Save & Continue'}
          </Button>

          <Button 
            fullWidth 
            variant="text" 
            onClick={() => logout()}
            disabled={loading}
            sx={{ 
              color: '#535758',
              fontSize: '0.8rem',
              '&:hover': { color: '#303e4b', bgcolor: 'transparent' }
            }}
          >
            Sign out instead
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default CompleteProfile;
