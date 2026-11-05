import React, { useState, useEffect } from 'react'
import {
    Box, Button, Paper, Rating, Tooltip, Typography,
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux'
import { addItemToCart } from '../../actions/cartActions'
import { pullBlindBox, clearErrors } from '../../actions/blindBoxActions'
import { PULL_BLINDBOX_RESET } from '../../constants/blindBoxConstants'
import PullRevealModal from './PullRevealModal';

const swalDark = { background: '#fefefe', color: '#303e4b', confirmButtonColor: '#c4a47c' }

const ProductCard = ({ product }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth)
    const { cartItems } = useSelector(state => state.cart)
    const { item, error, loading: pulling } = useSelector(state => state.blindBox)
    // every card reads the same blindBox state, so remember which card asked for the pull
    const [pulledHere, setPulledHere] = useState(false)
    const [revealedItem, setRevealedItem] = useState(null);

    const rarity = product.rarity || 'common';
    const blindBox = Boolean(product.isBlindBox);
    const image = product.images && product.images[0] ? product.images[0].url : '/images/default-product.png';
    const reviewCount = Number(product.numOfReviews) || 0;
    const rating = Math.min(5, Math.max(0, Number(product.ratings) || 0));

    useEffect(() => {
        if (!pulledHere) return
        if (item) {
            setRevealedItem(item)
            setPulledHere(false)
            dispatch({ type: PULL_BLINDBOX_RESET })
        }
        if (error) {
            setPulledHere(false)
            Swal.fire({
                icon: 'error',
                title: 'Pull could not be completed',
                text: error,
                ...swalDark,
            });
            dispatch(clearErrors())
        }
    }, [item, error, pulledHere, dispatch])

    const handleAdd = async () => {
        if (!user) {
            const result = await Swal.fire({
                icon: 'info',
                title: 'Sign in to collect',
                text: 'Create an account or sign in to add items to your vault.',
                confirmButtonText: 'Sign in',
                showCancelButton: true,
                ...swalDark,
            });
            if (result.isConfirmed) navigate('/login');
            return;
        }

        const existing = cartItems && cartItems.find(i => i.product === product._id)
        const quantity = existing ? existing.quantity + 1 : 1
        if (quantity > product.stock) {
            await Swal.fire({
                icon: 'warning',
                title: 'Stock limit reached',
                text: 'There is no more available stock for this item.',
                ...swalDark,
            });
            return;
        }

        await dispatch(addItemToCart(product._id, quantity))
        await Swal.fire({
            icon: 'success',
            title: 'Added to your vault',
            timer: 1100,
            showConfirmButton: false,
            ...swalDark,
        });
    };

    const handlePull = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setPulledHere(true)
        dispatch(pullBlindBox(product._id))
    };

    return (
        <>
            <Paper
                elevation={0}
                className="glass-panel"
                sx={{
                    overflow: 'hidden',
                    borderRadius: 3,
                    textAlign: 'left',
                    transition: 'transform .25s ease, border-color .25s ease, box-shadow .25s ease',
                    '&:hover': { transform: 'translateY(-5px)', borderColor: `${rarity === 'legendary' ? '#f59e0b' : '#c4a47c'}88`, boxShadow: '0 18px 42px rgba(0,0,0,.26)' },
                }}
            >
                <Box
                    component={Link}
                    to={`/product/${product._id}`}
                    sx={{
                        display: 'block',
                        position: 'relative',
                        overflow: 'hidden',
                        aspectRatio: '1 / 1',
                        background: 'radial-gradient(circle at 50% 40%, #ebf0f6, #0b1220 72%)',
                    }}
                >
                    {product.stock === 0 && (
                        <Box sx={{ position: 'absolute', inset: 0, zIndex: 1, display: 'grid', placeItems: 'center', bgcolor: 'rgba(248,252,255,.7)' }}>
                            <Typography sx={{ color: '#fda4af', border: '1px solid #fda4af88', px: 2, py: 1, borderRadius: 1, letterSpacing: '.12em', fontSize: 12, fontWeight: 700 }}>SOLD OUT</Typography>
                        </Box>
                    )}
                    <Box
                        component="img"
                        src={image}
                        alt={product.name}
                        loading="lazy"
                        sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 2.5, transition: 'transform .45s ease', '&:hover': { transform: 'scale(1.07)' } }}
                    />
                    <Box sx={{ position: 'absolute', top: 14, left: 14 }}><span className={`rarity-badge rarity-${rarity}`}>{rarity}</span></Box>
                    {blindBox && <Typography sx={{ position: 'absolute', right: 14, top: 18, color: '#c4b5fd', fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase' }}>Mystery pull</Typography>}
                </Box>
                <Box sx={{ p: 2.25 }}>
                    <Typography sx={{ color: '#535758', textTransform: 'uppercase', letterSpacing: '.12em', fontSize: 10, fontWeight: 700 }}>
                        {product.category}{product.series ? ` · ${product.series}` : ''}
                    </Typography>
                    {product.dropRate > 0 && (
                        <Typography sx={{ color: '#f59e0b', fontSize: 10, mt: 0.5 }}>Drop rate {product.dropRate}%</Typography>
                    )}
                    <Tooltip title={product.name} placement="top" arrow>
                        <Typography
                            component={Link}
                            to={`/product/${product._id}`}
                            sx={{ display: 'block', mt: 0.8, mb: 1.75, color: '#303e4b', textDecoration: 'none', fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                            {product.name}
                        </Typography>
                    </Tooltip>
                    <Box
                        component={Link}
                        to={`/product/${product._id}`}
                        aria-label={reviewCount ? `${rating.toFixed(1)} out of 5, ${reviewCount} reviews. View product reviews.` : 'No reviews yet. View product details.'}
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.75, width: 'fit-content', mb: 1.5, color: '#64748b', textDecoration: 'none' }}
                    >
                        {reviewCount > 0 ? (
                            <>
                                <Rating value={rating} precision={0.1} size="small" readOnly />
                                <Typography component="span" sx={{ fontSize: 11, color: '#64748b' }}>
                                    {rating.toFixed(1)} · {reviewCount} review{reviewCount === 1 ? '' : 's'}
                                </Typography>
                            </>
                        ) : (
                            <Typography component="span" sx={{ fontSize: 11, color: '#64748b' }}>
                                No reviews yet
                            </Typography>
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.75 }}>
                        <Typography sx={{ color: '#303e4b', fontWeight: 700, fontSize: 17 }}>₱{Number(product.price).toFixed(2)}</Typography>
                        <Typography sx={{ color: product.stock <= 3 ? '#fbbf24' : '#64748b', fontSize: 11 }}>
                            {product.stock > 0 ? `${product.stock} in stock` : 'Unavailable'}
                        </Typography>
                    </Box>
                    {blindBox ? (
                        <Box sx={{ display: 'grid', gap: 1 }}>
                            <Button fullWidth disabled={product.stock === 0} onClick={handleAdd} variant="contained" startIcon={<AddShoppingCartIcon />} sx={{ borderRadius: 2, bgcolor: '#7c3aed', color: '#fff', '&:hover': { bgcolor: '#9333ea' } }}>
                                Add blind box to cart
                            </Button>
                            <Button fullWidth disabled={Boolean(pulling)} onClick={handlePull} variant="outlined" startIcon={<AutoAwesomeIcon />} sx={{ borderRadius: 2, borderColor: 'rgba(168,85,247,.5)', color: '#d8b4fe' }}>
                                {pulling && pulledHere ? 'Opening...' : 'Open a purchased pull'}
                            </Button>
                            {!!(product.pullOdds && product.pullOdds.length) && (
                                <Typography sx={{ color: '#535758', fontSize: 11, mt: 1, textAlign: 'center' }}>
                                    Odds: {product.pullOdds.map(({ rarity: tier, probability }) => `${tier} ${probability}%`).join(' · ')}
                                </Typography>
                            )}
                        </Box>
                    ) : (
                        <Button fullWidth disabled={product.stock === 0} onClick={handleAdd} variant="outlined" startIcon={<AddShoppingCartIcon />} sx={{ borderColor: 'rgba(196, 164, 124, .45)', color: '#bd9e7f', borderRadius: 2 }}>
                            Add to cart
                        </Button>
                    )}
                </Box>
            </Paper>
            <PullRevealModal open={Boolean(revealedItem)} item={revealedItem} onClose={() => setRevealedItem(null)} />
        </>
    );
};

export default ProductCard;
