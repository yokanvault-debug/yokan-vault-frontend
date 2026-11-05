import { Dialog, DialogContent, IconButton, Typography, Box, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const rarityColors = {
  common: '#64748b',
  rare: '#c4a47c',
  epic: '#6b7c93',
  legendary: '#f59e0b',
};

const PullRevealModal = ({ open, item, onClose }) => {
  if (!item) return null;
  const rarity = item.rarity || 'common';
  const accent = rarityColors[rarity] || rarityColors.common;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="pull-reveal-title"
      PaperProps={{
        sx: {
          overflow: 'hidden',
          border: `1px solid ${accent}66`,
          background: 'radial-gradient(circle at 50% 0%, rgba(235, 240, 246, .96), #f8fcff 72%)',
          boxShadow: `0 0 70px ${accent}24`,
        },
      }}
    >
      <IconButton onClick={onClose} aria-label="Close pull reveal" sx={{ position: 'absolute', right: 10, top: 10, zIndex: 1, color: '#707477' }}>
        <CloseIcon />
      </IconButton>
      <DialogContent sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
        <Typography sx={{ color: accent, fontSize: 11, letterSpacing: '.3em', fontWeight: 700, textTransform: 'uppercase', mb: 1 }}>
          Vault pull revealed
        </Typography>
        <Typography id="pull-reveal-title" variant="h5" sx={{ color: '#303e4b', mb: 2 }}>
          A new piece for your collection
        </Typography>
        <Box
          className="pull-reveal"
          sx={{
            p: 1,
            mb: 2.5,
            borderRadius: 3,
            border: `1px solid ${accent}77`,
            background: `linear-gradient(145deg, ${accent}1c, rgba(255, 255, 255, .9))`,
            boxShadow: `0 0 38px ${accent}22`,
          }}
        >
          <Box
            component="img"
            src={item.images && item.images[0] ? item.images[0].url : '/images/default-product.png'}
            alt={item.name}
            sx={{ width: '100%', height: 250, objectFit: 'contain', borderRadius: 2 }}
          />
        </Box>
        <span className={`rarity-badge rarity-${rarity}`} style={{ marginBottom: 12 }}>{rarity}</span>
        <Typography variant="h5" sx={{ color: '#303e4b', fontWeight: 700, mt: 1 }}>{item.name}</Typography>
        <Typography sx={{ color: '#707477', mt: 1, mb: 3, fontSize: 13 }}>
          {item.series ? `${item.series} · ` : ''}Added to your collection showcase.
        </Typography>
        <Button variant="contained" onClick={onClose} fullWidth sx={{ borderRadius: 2 }}>Continue collecting</Button>
      </DialogContent>
    </Dialog>
  );
};

export default PullRevealModal;
