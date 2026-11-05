import { Link } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

const colHead = { color: '#ffffff', fontWeight: 700, fontSize: 15, mb: 2 };
const linkSx = { color: '#b8b8b3', fontSize: 14, textDecoration: 'none', display: 'block', mb: 1.4, '&:hover': { color: '#ffffff' } };

const Footer = () => {
  return (
    <Box component="footer" sx={{ mt: 'auto', bgcolor: '#1e1e1e', color: '#b8b8b3', pt: 6, pb: 3, px: { xs: 3, md: 6 } }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: { xs: 4, md: 6 } }}>
        <Box>
          <Typography sx={colHead}>Shop</Typography>
          <Box component={Link} to="/catalog" sx={linkSx}>Catalog</Box>
          <Box component={Link} to="/catalog?category=Blind%20Boxes" sx={linkSx}>Blind boxes</Box>
          <Box component={Link} to="/cart" sx={linkSx}>Your cart</Box>
        </Box>
        <Box>
          <Typography sx={colHead}>Account</Typography>
          <Box component={Link} to="/me" sx={linkSx}>My profile</Box>
          <Box component={Link} to="/me#orders" sx={linkSx}>My orders</Box>
          <Box component={Link} to="/login" sx={linkSx}>Login</Box>
        </Box>
        <Box>
          <Typography sx={colHead}>Customer service</Typography>
          <Typography sx={{ ...linkSx, mb: 1.4 }}>Orders can be cancelled while they are being processed</Typography>
          <Typography sx={{ ...linkSx, mb: 1.4 }}>Receipts are emailed with every order update</Typography>
        </Box>
        <Box>
          <Typography sx={colHead}>We accept</Typography>
          <Box sx={{ display: 'inline-block', border: '1px solid #4a4a4a', borderRadius: 1, px: 1.5, py: 0.8, color: '#ffffff', fontSize: 13 }}>Cash on Delivery</Box>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 5, pt: 3, borderTop: '1px solid #3a3a3a', textAlign: 'center' }}>
        <Typography sx={{ color: '#979c91', fontSize: 13 }}>
          © {new Date().getFullYear()} Yokan Vault. Built for the hunt.
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;
