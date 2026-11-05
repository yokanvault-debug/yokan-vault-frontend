import { useState, useEffect } from 'react'
import {
    Container, Typography, Box, Button, CircularProgress, Alert,
    Popover, TextField, FormControl, InputLabel, Select, MenuItem, Rating, Checkbox, ListItemText
} from '@mui/material';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { useSearchParams } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import { useDispatch, useSelector } from 'react-redux'
import MetaData from '../Layout/MetaData'
import ProductCard from './ProductCard';
import { getProducts } from '../../actions/productActions'
import { getCategories } from '../../actions/categoryActions'

const CATALOG_PAGE_SIZE = 8

const Catalog = () => {
    const [searchParams] = useSearchParams();
    // a new header link (category / search) resets the filters
    return <CatalogContent key={searchParams.toString()} searchParams={searchParams} />;
};

const CatalogContent = ({ searchParams }) => {
    const dispatch = useDispatch()
    const { loading, products, error, resPerPage, filteredProductsCount } = useSelector(state => state.products);
    const { categories } = useSelector(state => state.categories);

    // Filter states
    const [keyword, setKeyword] = useState(() => searchParams.get('search') || '');
    const [selectedCategories, setSelectedCategories] = useState(() => {
        const category = searchParams.get('category');
        return category ? category.split(',') : [];
    });
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [minRating, setMinRating] = useState(0);
    const [minReviews, setMinReviews] = useState('');
    const [rarity, setRarity] = useState('');
    const [currentPage, setCurrentPage] = useState(1)

    // Popover state
    const [anchorEl, setAnchorEl] = useState(null);

    // Debounce search
    const [debouncedKeyword, setDebouncedKeyword] = useState(keyword);

    useEffect(() => {
        dispatch(getCategories())
    }, [dispatch]);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedKeyword(keyword), 250);
        return () => clearTimeout(timer);
    }, [keyword]);

    const validNumericFilter = (value, max, integer = false) => {
        if (value === '') return true
        const number = Number(value)
        return Number.isFinite(number) && number >= 0 && number <= max && (!integer || Number.isInteger(number))
    }
    const filterError =
        !validNumericFilter(minPrice, 1_000_000_000) ? 'Minimum price must be between 0 and 1,000,000,000.' :
        !validNumericFilter(maxPrice, 1_000_000_000) ? 'Maximum price must be between 0 and 1,000,000,000.' :
        minPrice !== '' && maxPrice !== '' && Number(minPrice) > Number(maxPrice) ? 'Minimum price cannot exceed maximum price.' :
        !validNumericFilter(minReviews, 1_000_000_000, true) ? 'Minimum reviews must be a whole number between 0 and 1,000,000,000.' :
        ''

    useEffect(() => {
        if (filterError) return
        dispatch(getProducts(
            currentPage,
            debouncedKeyword,
            [minPrice, maxPrice],
            selectedCategories.join(','),
            CATALOG_PAGE_SIZE,
            minRating > 0 ? minRating : '',
            minReviews,
            rarity
        ))
    }, [dispatch, currentPage, debouncedKeyword, selectedCategories, minPrice, maxPrice, minRating, minReviews, rarity, filterError]);

    const handleFilterClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleFilterClose = () => {
        setAnchorEl(null);
    };

    const pageCount = resPerPage ? Math.ceil((filteredProductsCount || 0) / resPerPage) : 1

    return (
        <div className="catalog-vault">
            <MetaData title={'Catalog'} />
            <Container maxWidth="lg" sx={{ pt: { xs: 4, sm: 8 }, pb: 12 }}>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: '#303e4b', textAlign: 'center' }}>
                    The Collector&apos;s Vault
                </Typography>
                <Typography sx={{ color: '#707477', textAlign: 'center', mb: 4 }}>Find the next piece for your collection.</Typography>

                {/* Sticky Pill Filter Bar */}
                <Box sx={{ position: 'sticky', top: { xs: 106, md: 121 }, zIndex: 50, bgcolor: 'transparent', py: 2, mb: 6, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
                    <Box
                        sx={{
                            pointerEvents: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            bgcolor: 'rgba(255, 255, 255, .92)',
                            borderRadius: '16px',
                            boxShadow: '0 8px 32px rgba(0,0,0,.22)',
                            border: '1px solid rgba(148,163,184,.16)',
                            p: '6px 12px',
                            width: '100%',
                            maxWidth: '650px'
                        }}
                    >
                        <SearchIcon sx={{ color: '#535758', ml: 1, width: 20 }} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={keyword}
                            onChange={(e) => { setCurrentPage(1); setKeyword(e.target.value) }}
                            style={{
                                border: 'none',
                                outline: 'none',
                                background: 'transparent',
                                padding: '12px 15px',
                                width: '100%',
                                fontSize: '1rem',
                                color: '#303e4b',
                            }}
                        />
                        <Button
                            onClick={handleFilterClick}
                            sx={{
                                bgcolor: 'transparent',
                                border: 'none',
                                borderLeft: '1px solid rgba(148,163,184,.16)',
                                borderRadius: 0,
                                pl: 2,
                                pr: 1,
                                color: '#535758',
                                fontWeight: 500,
                                textTransform: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                '&:hover': { bgcolor: 'transparent', opacity: 0.7 }
                            }}
                        >
                            <TuneIcon sx={{ width: 18, height: 18 }} />
                            Filter
                        </Button>
                    </Box>
                </Box>

                <Popover
                    open={Boolean(anchorEl)}
                    anchorEl={anchorEl}
                    onClose={handleFilterClose}
                    slotProps={{ paper: { sx: { bgcolor: '#fefefe', color: '#303e4b', border: '1px solid rgba(148,163,184,.28)' } } }}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    sx={{ mt: 1 }}
                >
                    <Box sx={{ p: 3, width: 300, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Typography variant="h6" sx={{ color: '#303e4b', fontWeight: 600 }}>
                            Filters
                        </Typography>

                        <FormControl fullWidth size="small">
                            <InputLabel>Category</InputLabel>
                            <Select
                                multiple
                                value={selectedCategories}
                                onChange={(e) => { setCurrentPage(1); setSelectedCategories(e.target.value) }}
                                renderValue={(selected) => selected.join(', ')}
                                label="Category"
                            >
                                {(categories || []).map((cat) => (
                                    <MenuItem key={cat._id} value={cat.name}>
                                        <Checkbox checked={selectedCategories.indexOf(cat.name) > -1} />
                                        <ListItemText primary={cat.name} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth size="small">
                            <InputLabel>Rarity</InputLabel>
                            <Select
                                value={rarity}
                                onChange={(e) => { setCurrentPage(1); setRarity(e.target.value) }}
                                label="Rarity"
                            >
                                <MenuItem value="">All rarities</MenuItem>
                                {['common', 'rare', 'epic', 'legendary'].map(value => (
                                    <MenuItem key={value} value={value}>
                                        {value.charAt(0).toUpperCase() + value.slice(1)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                size="small"
                                label="Min Price"
                                type="number"
                                value={minPrice}
                                error={Boolean(minPrice && !validNumericFilter(minPrice, 1_000_000_000)) || Boolean(minPrice && maxPrice && Number(minPrice) > Number(maxPrice))}
                                slotProps={{ htmlInput: { min: 0, max: 1_000_000_000, step: 0.01 } }}
                                onChange={(e) => { setCurrentPage(1); setMinPrice(e.target.value) }}
                            />
                            <TextField
                                size="small"
                                label="Max Price"
                                type="number"
                                value={maxPrice}
                                error={Boolean(maxPrice && !validNumericFilter(maxPrice, 1_000_000_000)) || Boolean(minPrice && maxPrice && Number(minPrice) > Number(maxPrice))}
                                slotProps={{ htmlInput: { min: 0, max: 1_000_000_000, step: 0.01 } }}
                                onChange={(e) => { setCurrentPage(1); setMaxPrice(e.target.value) }}
                            />
                        </Box>

                        <Box>
                            <Typography variant="body2" sx={{ color: '#535758', mb: 1 }}>Minimum Rating</Typography>
                            <Rating value={minRating} onChange={(event, newValue) => { setCurrentPage(1); setMinRating(newValue || 0) }} />
                        </Box>

                        <TextField
                            size="small"
                            label="Min Reviews"
                            type="number"
                            error={Boolean(minReviews && !validNumericFilter(minReviews, 1_000_000_000, true))}
                            slotProps={{ htmlInput: { min: 0, max: 1_000_000_000, step: 1 } }}
                            value={minReviews}
                            onChange={(e) => { setCurrentPage(1); setMinReviews(e.target.value) }}
                        />

                        <Button
                            variant="contained"
                            onClick={() => {
                                setCurrentPage(1)
                                setMinReviews('');
                                setSelectedCategories([]);
                                setMinPrice('');
                                setMaxPrice('');
                                setMinRating(0);
                                setRarity('');
                            }}
                            sx={{ bgcolor: '#c4a47c', color: '#fff', '&:hover': { bgcolor: '#b8946a' } }}
                        >
                            Clear Filters
                        </Button>
                    </Box>
                </Popover>

                {filterError && <Alert severity="warning" sx={{ mb: 3 }}>{filterError}</Alert>}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                        <CircularProgress sx={{ color: '#c4a47c' }} />
                    </Box>
                ) : error && !(products && products.length) ? (
                    <Alert severity="error" sx={{ mt: 4 }}>The catalog API is unavailable. Start the backend and connect it to MongoDB to load products.</Alert>
                ) : !products || products.length === 0 ? (
                    <Typography variant="h6" sx={{ textAlign: 'center', mt: 10, color: '#707477' }}>
                        No products found matching your filters.
                    </Typography>
                ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 250px), 1fr))', gap: 2.5 }}>
                        {products.map((product) => <ProductCard key={product._id} product={product} />)}
                    </Box>
                )}

                {pageCount > 1 && (
                    <div className="d-flex justify-content-center mt-5">
                        <Stack spacing={2}>
                            <Pagination
                                count={pageCount}
                                page={currentPage}
                                onChange={(event, value) => setCurrentPage(value)}
                                color="primary"
                                variant="outlined"
                                shape="rounded"
                                showFirstButton
                                showLastButton
                                size="large"
                                sx={{ backgroundColor: 'white' }}
                            />
                        </Stack>
                    </div>
                )}
            </Container>
        </div>
    );
};

export default Catalog;
