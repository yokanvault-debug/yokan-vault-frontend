import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#c4a47c', contrastText: '#ffffff' },
    secondary: { main: '#435266' },
    background: {
      default: '#f8fcff',
      paper: '#fefefe',
    },
    text: {
      primary: '#303e4b',
      secondary: '#707477',
    },
  },
  typography: {
    fontFamily: '"DM Sans", sans-serif',
    h1: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700 },
    h2: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 },
    h4: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 },
    h5: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    }
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: '#f8fcff' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '12px 24px',
          boxShadow: 'none',
          '&.Mui-disabled': {
            color: '#707477',
          },
          '&:hover': {
            boxShadow: '0 8px 32px rgba(196, 164, 124, 0.14)',
          }
        },
        contained: {
          backgroundColor: '#c4a47c',
          color: '#ffffff',
          '&:hover': { backgroundColor: '#b8946a' },
        }
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { color: '#535758' },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: { color: '#535758' },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(67, 82, 102, 0.48)',
            },
            '&:hover fieldset': {
              borderColor: '#c4a47c',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#c4a47c',
            },
          },
        },
      },
    },
  },
});
