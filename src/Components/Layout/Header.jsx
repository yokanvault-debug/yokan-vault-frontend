import React, { useState, useEffect } from 'react'
import '../../App.css'
import {
    AppBar, Avatar, Badge, Box, Button, Divider, Drawer, IconButton,
    InputAdornment, Menu, MenuItem, TextField, Toolbar, Tooltip, Typography,
    useMediaQuery, useTheme
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined';
import CloudOffOutlinedIcon from '@mui/icons-material/CloudOffOutlined';
import { useDispatch, useSelector } from 'react-redux'
import { getCategories } from '../../actions/categoryActions'
import { loadUser } from '../../actions/userActions'
import { useAuth } from '../Utils/AuthContext'
import MusicToggle from './MusicToggle'

const fallbackCategories = [
    ['TCG', 'Trading Cards'],
    ['Blind Boxes', 'Blind Boxes'],
    ['Figures', 'Anime Figures'],
    ['Board Games', 'Board Games'],
];

export const Header = () => {
    const dispatch = useDispatch();
    const { logout: signOutEverywhere } = useAuth();
    const { user } = useSelector(state => state.auth)
    const { categories: shopCategories } = useSelector(state => state.categories)
    useEffect(() => { dispatch(getCategories()) }, [dispatch])
    const categories = shopCategories && shopCategories.length ? shopCategories.map((c) => [c.name, c.name]) : fallbackCategories
    const { cartItems } = useSelector(state => state.cart)
    const navigate = useNavigate()
    const theme = useTheme();
    const mobile = useMediaQuery(theme.breakpoints.down('lg'));
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [searchOpen, setSearchOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileAnchor, setProfileAnchor] = useState(null);
    const [databaseStatus, setDatabaseStatus] = useState('checking');

    // keep the user signed in after a page refresh (cookie -> /me)
    useEffect(() => {
        dispatch(loadUser())
    }, [dispatch]);

    // database status indicator
    useEffect(() => {
        let active = true;
        const checkDatabase = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API}/health`, { timeout: 3000 });
                if (active && response.data.status === 'connected') setDatabaseStatus('connected');
                else if (active) setDatabaseStatus('offline');
            } catch {
                if (active) setDatabaseStatus('offline');
            }
        };

        checkDatabase();
        const interval = setInterval(checkDatabase, 30000);
        return () => {
            active = false;
            clearInterval(interval);
        };
    }, []);

    // search suggestions
    useEffect(() => {
        if (query.trim().length < 2) {
            return undefined;
        }

        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API}/products`, {
                    params: { keyword: query.trim(), limit: 5 },
                    signal: controller.signal,
                });
                setSuggestions(response.data.products || []);
                setSearchOpen(true);
            } catch (error) {
                if (!axios.isCancel(error)) {
                    console.error('Search suggestions could not be loaded:', error);
                }
            }
        }, 220);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [query]);

    const closeSearch = () => setSearchOpen(false);
    const goToSearch = () => {
        if (query.trim()) navigate(`/catalog?search=${encodeURIComponent(query.trim())}`);
        closeSearch();
        setMobileOpen(false);
    };

    const logoutHandler = async () => {
        setProfileAnchor(null);
        setMobileOpen(false);
        // signs out of Firebase and clears the shop session
        await signOutEverywhere();
        toast.success('log out', {
            position: 'bottom-right'
        });
        navigate('/');
    }

    const categoryLinks = categories.map(([label, category]) => (
        <Button
            key={category}
            component={Link}
            to={`/catalog?category=${encodeURIComponent(category)}`}
            onClick={() => setMobileOpen(false)}
            sx={{ color: '#e3d3c5', minWidth: 'auto', px: 1.25, py: 0, height: { xs: 34, md: 39 }, fontSize: 12.5, whiteSpace: 'nowrap', borderRadius: 0, '&:hover': { color: '#bd9e7f' } }}
        >
            {label}
        </Button>
    ));

    // main header is 78px (68px on phones); the secondary bar is exactly half of that
    const MAIN_H = { xs: 68, md: 78 }
    const SECOND_H = { xs: 34, md: 39 }

    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                top: 0,
                zIndex: 1200,
                color: '#f6ece3',
                bgcolor: 'transparent',
                borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            }}
        >
            {/* ---------- main header ---------- */}
            <Toolbar sx={{ bgcolor: '#435266', minHeight: MAIN_H, height: MAIN_H, gap: { xs: 1, md: 3 }, px: { xs: 2, md: 5 } }}>
                {/* Logo (old logo for now) with the music gif on its right side */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mr: 'auto' }}>
                    <Link to="/" aria-label="Yokan Vault home" className="site-logo">
                        <img src="/images/yokan-logo.png" alt="Yokan Vault logo" />
                    </Link>
                    <MusicToggle />
                </Box>

                {!mobile && (
                    <Box sx={{ flex: 1, maxWidth: 320, position: 'relative' }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search the vault..."
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            onFocus={() => suggestions.length && setSearchOpen(true)}
                            onKeyDown={(event) => event.key === 'Enter' && goToSearch()}
                            slotProps={{
                                htmlInput: { 'aria-label': 'Search products' },
                                input: {
                                    startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#e3d3c5', fontSize: 19 }} /></InputAdornment>,
                                },
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': { height: 40, bgcolor: 'rgba(235, 240, 246, .5)', borderRadius: 2 },
                                '& input': { fontSize: 13 },
                            }}
                        />
                        {searchOpen && query.trim().length >= 2 && suggestions.length > 0 && (
                            <Box className="glass-panel" sx={{ bgcolor: '#435266', position: 'absolute', top: 48, left: 0, right: 0, zIndex: 1300, p: 0.75, borderRadius: 2, boxShadow: '0 18px 48px rgba(0,0,0,.4)' }}>
                                {suggestions.map((product) => (
                                    <Button
                                        key={product._id}
                                        fullWidth
                                        onClick={() => { navigate(`/product/${product._id}`); closeSearch(); }}
                                        sx={{ justifyContent: 'flex-start', gap: 1.25, textAlign: 'left', color: '#f6ece3', p: 1, textTransform: 'none' }}
                                    >
                                        <Avatar src={product.images && product.images[0] ? product.images[0].url : undefined} variant="rounded" sx={{ width: 36, height: 36, bgcolor: '#ebf0f6' }} />
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography noWrap sx={{ fontSize: 12, fontWeight: 600 }}>{product.name}</Typography>
                                            <Typography sx={{ color: '#b9a592', fontSize: 11 }}>{product.category}</Typography>
                                        </Box>
                                    </Button>
                                ))}
                                <Divider sx={{ borderColor: 'rgba(67, 82, 102, .15)', my: 0.5 }} />
                                <Button onClick={goToSearch} fullWidth sx={{ color: '#bd9e7f', fontSize: 12 }}>See all results</Button>
                            </Box>
                        )}
                    </Box>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1.5 } }}>
                    <Tooltip title={databaseStatus === 'connected' ? 'Yokan Vault database connected' : databaseStatus === 'checking' ? 'Checking database connection' : 'Database/API is offline'}>
                        <Box
                            role="status"
                            aria-label={databaseStatus === 'connected' ? 'Database connected' : databaseStatus === 'checking' ? 'Checking database connection' : 'Database disconnected'}
                            sx={{ display: 'inline-flex', alignItems: 'center', color: databaseStatus === 'connected' ? '#4ade80' : databaseStatus === 'checking' ? '#fbbf24' : '#f87171' }}
                        >
                            {databaseStatus === 'connected' ? <CloudDoneOutlinedIcon fontSize="small" /> : <CloudOffOutlinedIcon fontSize="small" />}
                        </Box>
                    </Tooltip>

                    <IconButton component={Link} to="/cart" aria-label="Shopping cart" sx={{ color: '#e3d3c5' }}>
                        <Badge badgeContent={cartItems ? cartItems.length : 0} color="secondary">
                            <ShoppingBagOutlinedIcon />
                        </Badge>
                    </IconButton>

                    {!mobile && !user && (
                        <>
                            <Button component={Link} to="/login" sx={{ color: '#e3d3c5' }}>Sign in</Button>
                            <Button component={Link} to="/register" variant="contained" sx={{ borderRadius: 2, px: 2 }}>Join the vault</Button>
                        </>
                    )}
                    {!mobile && user && (
                        <>
                            {user.role === 'admin' && <Button component={Link} to="/dashboard" sx={{ color: '#b9a592' }}>Command center</Button>}
                            {(user.username || user.name) && (
                                <Typography className="header-username" noWrap sx={{ maxWidth: 160, fontSize: 13, fontWeight: 600, color: '#f6ece3', letterSpacing: '.04em' }}>
                                    {user.username || user.name}
                                </Typography>
                            )}
                            <IconButton aria-label="My profile" component={Link} to="/me" sx={{ color: '#e3d3c5' }}>
                                {(user.avatar && user.avatar.url) || user.photoURL ? <Avatar src={(user.avatar && user.avatar.url) || user.photoURL} alt={user.name} sx={{ width: 32, height: 32 }} /> : <AccountCircleOutlinedIcon />}
                            </IconButton>
                            <Button onClick={logoutHandler} size="small" startIcon={<LogoutIcon fontSize="small" />} sx={{ color: '#f6ece3', border: '1px solid rgba(255,255,255,.35)', borderRadius: 2, px: 1.5, textTransform: 'none', '&:hover': { bgcolor: 'rgba(255,255,255,.12)' } }}>Logout</Button>
                        </>
                    )}
                    {(
                        <IconButton onClick={() => setMobileOpen(true)} aria-label="Open navigation" sx={{ color: '#e3d3c5' }}>
                            <MenuIcon />
                        </IconButton>
                    )}
                </Box>
            </Toolbar>

            {/* ---------- secondary header: categories + search (half the height of the main one) ---------- */}
            <Toolbar
                disableGutters
                sx={{
                    minHeight: SECOND_H,
                    height: SECOND_H,
                    px: { xs: 1, md: 5 },
                    gap: { xs: 1, md: 3 },
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    bgcolor: 'rgba(67, 82, 102, 0.62)',
                    backdropFilter: 'blur(14px)',
                }}
            >
                <Box className="secondary-links" sx={{ display: 'flex', alignItems: 'center', flex: '1 1 auto', minWidth: 0, overflowX: 'auto' }}>
                    {categoryLinks}
                </Box>

            </Toolbar>

            {/* sidebar (all screens): search, categories and account links, like the original */}
            <Drawer
                anchor="right"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                slotProps={{ paper: { sx: { width: 280, bgcolor: '#fefefe', color: '#f6ece3', p: 2 } } }}
            >
                <Typography sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, letterSpacing: '.1em', mb: 2 }}>YOKAN VAULT</Typography>
                <TextField
                    size="small"
                    placeholder="Search the vault..."
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => { if (event.key === 'Enter') { goToSearch(); setMobileOpen(false); } }}
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#e3d3c5', fontSize: 19 }} /></InputAdornment> } }}
                    sx={{ mb: 2, '& .MuiOutlinedInput-root': { bgcolor: 'rgba(235, 240, 246, .5)', borderRadius: 2 } }}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>{categoryLinks}</Box>
                <Divider sx={{ borderColor: 'rgba(67, 82, 102, .15)', my: 1 }} />
                {user && <Button component={Link} to="/me" onClick={() => setMobileOpen(false)} sx={{ justifyContent: 'flex-start', color: '#e3d3c5' }}>My profile</Button>}
                {user && <Button component={Link} to="/me#orders" onClick={() => setMobileOpen(false)} sx={{ justifyContent: 'flex-start', color: '#e3d3c5' }}>My orders</Button>}
                {user && user.role === 'admin' && <Button component={Link} to="/dashboard" onClick={() => setMobileOpen(false)} sx={{ justifyContent: 'flex-start', color: '#e3d3c5' }}>Command center</Button>}
                {!user ? (
                    <>
                        <Button component={Link} to="/login" onClick={() => setMobileOpen(false)} sx={{ justifyContent: 'flex-start', color: '#e3d3c5' }}>Sign in</Button>
                        <Button component={Link} to="/register" onClick={() => setMobileOpen(false)} sx={{ justifyContent: 'flex-start', color: '#bd9e7f' }}>Join the vault</Button>
                    </>
                ) : (
                    <Button onClick={logoutHandler} sx={{ justifyContent: 'flex-start', color: '#fda4af' }}>Logout</Button>
                )}
            </Drawer>
        </AppBar>
    )
}
