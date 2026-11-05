import React, { useState, useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import Product from './Product/Product'
// import products from '../products.json'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MetaData from './Layout/MetaData'
import Loader from './Layout/Loader';
import Carousel from './Layout/Carousel';
import Pagination from '@mui/material/Pagination';

import { useDispatch, useSelector } from 'react-redux'
import { getProducts } from '../actions/productActions'
import { getTopRatedProducts, getLatestProducts } from '../actions/homeActions'

// the carousel shows the 10 best reviewed products
const CAROUSEL_LIMIT = 10
// latest products load this many at a time while scrolling
const LATEST_PAGE_SIZE = 10

const collections = [
    { title: 'Trading cards', subtitle: 'Chase the cards that complete your set.', category: 'Trading Cards', accent: '#c4a47c' },
    { title: 'Mystery pulls', subtitle: 'A little suspense in every unboxing.', category: 'Blind Boxes', accent: '#6b7c93' },
    { title: 'Anime figures', subtitle: 'Display-worthy characters, curated.', category: 'Anime Figures', accent: '#f59e0b' },
    { title: 'Tabletop worlds', subtitle: 'Gather your crew around the table.', category: 'Board Games', accent: '#34d399' },
];

const Home = () => {
    const [price, setPrice] = useState([1, 1000]);
    const [currentPage, setCurrentPage] = useState(1)
    let { keyword } = useParams();
    const dispatch = useDispatch();
    const { loading, products, error, productsCount, resPerPage, filteredProductsCount } = useSelector(state => state.products);

    let count = productsCount;

    if (keyword) {
        count = filteredProductsCount
    }

    const handleChange = (event, newValue) => {
        setPrice(newValue);
    };

    function valuetext(price) {
        return `\u20b1${price.toString()}`;
    }

    const { products: topRated } = useSelector(state => state.topRatedProducts)
    const { products: latest, page: latestPage, hasMore, loading: latestLoading } = useSelector(state => state.latestProducts)
    const sentinelRef = useRef(null)

    useEffect(() => {
        if (keyword) {
            // search results keep the normal paging + price filter
            dispatch(getProducts(currentPage, keyword, price,))
        } else {
            // home page: carousel (top rated) + first page of the latest products
            dispatch(getTopRatedProducts(CAROUSEL_LIMIT))
            dispatch(getLatestProducts(1, LATEST_PAGE_SIZE))
        }
    }, [dispatch, currentPage, keyword, price,]);

    // infinite scroll: when the bottom marker comes into view, load the next page
    useEffect(() => {
        if (keyword || !sentinelRef.current) return
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !latestLoading && latestPage > 0) {
                dispatch(getLatestProducts(latestPage + 1, LATEST_PAGE_SIZE))
            }
        }, { rootMargin: '300px' })
        observer.observe(sentinelRef.current)
        return () => observer.disconnect()
    }, [keyword, hasMore, latestLoading, latestPage, dispatch])

    return (
        <>
            <MetaData title={'Yokan Vault'} />
            {keyword && loading ? <Loader /> : (
                <div className={keyword ? '' : 'home-vault'}>
                    {/* hero */}
                    {!keyword && (
                        <Box
                            className="home-hero"
                            sx={{
                                minHeight: { xs: 540, md: 650 },
                                display: 'flex',
                                alignItems: 'center',
                                position: 'relative',
                                overflow: 'hidden',
                                borderTop: '1px solid rgba(148,163,184,.12)',
                                borderBottom: '1px solid rgba(148,163,184,.12)',
                                background: 'radial-gradient(ellipse at 75% 45%, rgba(6,182,212,.17), transparent 35%), radial-gradient(ellipse at 28% 70%, rgba(168,85,247,.12), transparent 42%), linear-gradient(135deg, #0b1220 0%, #f8fcff 68%)',
                            }}
                        >
                            <Box sx={{ position: 'absolute', right: { xs: '-20%', md: '4%' }, top: '13%', width: { xs: 270, md: 450 }, aspectRatio: '1', border: '1px solid rgba(6,182,212,.16)', borderRadius: '50%', boxShadow: '0 0 0 34px rgba(6,182,212,.025), 0 0 0 76px rgba(168,85,247,.025)' }} />
                            <Container maxWidth="lg" sx={{ py: 10, position: 'relative', textAlign: 'left' }}>
                                <Box sx={{ maxWidth: 700 }}>
                                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 3, px: 1.5, py: 0.8, borderRadius: 99, color: '#bd9e7f', border: '1px solid rgba(6,182,212,.28)', bgcolor: 'rgba(6,182,212,.07)' }}>
                                        <AutoAwesomeIcon sx={{ fontSize: 15 }} />
                                        <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: '.2em' }}>A HOME FOR THE HARD-TO-FIND</Typography>
                                    </Box>
                                    <Typography variant="h1" sx={{ color: '#303e4b', fontSize: { xs: '3.15rem', md: '5.4rem' }, lineHeight: 1.02, letterSpacing: '-.055em', mb: 2.5 }}>
                                        Find your next<br />
                                        <Box component="span" sx={{ color: '#bd9e7f', textShadow: '0 0 36px rgba(6,182,212,.28)' }}>favorite pull.</Box>
                                    </Typography>
                                    <Typography sx={{ color: '#707477', maxWidth: 520, fontSize: { xs: 15, md: 17 }, lineHeight: 1.8, mb: 4 }}>
                                        Rare cards, shelf-worthy figures, and mystery finds—curated for collectors who know the thrill is in the hunt.
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                                        <Button component={Link} to="/catalog" variant="contained" endIcon={<ArrowForwardIcon />} sx={{ borderRadius: 2, px: 2.5 }}>
                                            Explore the vault
                                        </Button>
                                        <Button component={Link} to="/catalog?category=Blind%20Boxes" variant="outlined" sx={{ borderRadius: 2, borderColor: 'rgba(148,163,184,.3)', color: '#535758', px: 2.5 }}>
                                            Try a mystery pull
                                        </Button>
                                    </Box>
                                </Box>
                            </Container>
                        </Box>
                    )}

                    {/* carousel: the 10 best reviewed products, between the hero and the latest products */}
                    {!keyword && (
                        <Carousel title="Top Rated Picks" items={topRated || []} interval={4000} />
                    )}
                    {!keyword && <div className="home-divider" role="separator" />}

                    <div className="container container-fluid">
                        <h1 id="products_heading">Latest Products</h1>
                        <section id="products" className="container mt-5 home-section">
                            <div className="row">
                                {keyword ? (
                                    <>
                                        <div className="col-6 col-md-3 mt-5 mb-5">
                                            <Box sx={{ width: 150 }}>
                                                <Slider
                                                    getAriaLabel={() => 'Price Filter'}
                                                    value={price}
                                                    onChange={handleChange}
                                                    valueLabelDisplay="on"
                                                    getAriaValueText={valuetext}
                                                    min={1}
                                                    max={1000}

                                                />
                                            </Box>
                                            <div className="mt-5">
                                                <h4 className="mb-3">
                                                    Categories
                                                </h4>

                                            </div>
                                        </div>

                                        <div className="col-6 col-md-9">
                                            <div className="row">
                                                {products.map(product => (
                                                    <Product key={product._id} product={product} />
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    (latest || []).map(product => (
                                        <Product key={product._id} product={product} />
                                    ))
                                )}

                            </div>
                            {keyword && resPerPage < count && (
                                <div className="d-flex justify-content-center mt-5">
                                    <Stack spacing={2}>
                                        <Pagination
                                            count={Math.ceil(count / resPerPage)}
                                            page={currentPage}
                                            onChange={(event, value) => setCurrentPage(value)}
                                            color="primary"
                                            variant="outlined"
                                            shape="rounded"
                                            showFirstButton
                                            showLastButton
                                            size="large"
                                            sx={{
                                                backgroundColor: 'white',
                                            }}
                                        />
                                    </Stack>
                                </div>
                            )}
                            {!keyword && (
                                <div className="d-flex flex-column align-items-center mt-4">
                                    {/* infinite scroll marker */}
                                    <div ref={sentinelRef} style={{ height: 1, width: '100%' }} />
                                    {latestLoading && <div className="infinite-loading">Loading more finds...</div>}
                                    {!hasMore && latest && latest.length > 0 && (
                                        <Button component={Link} to="/catalog" endIcon={<ArrowForwardIcon />} sx={{ color: '#bd9e7f' }}>That's everything - browse the catalog</Button>
                                    )}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* collections */}
                    {!keyword && <div className="home-divider" role="separator" />}
                    {!keyword && (
                        <Container maxWidth="lg" sx={{ pb: { xs: 8, md: 12 }, pt: 2, textAlign: 'left' }}>
                            <Box sx={{ mb: 3 }}>
                                <Typography sx={{ color: '#6b7c93', fontSize: 10, fontWeight: 700, letterSpacing: '.25em', mb: 1 }}>PICK YOUR OBSESSION</Typography>
                                <Typography variant="h3" sx={{ color: '#303e4b', letterSpacing: '-.035em' }}>Explore collections</Typography>
                            </Box>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                                {collections.map((collection) => (
                                    <Box
                                        key={collection.category}
                                        component={Link}
                                        to={`/catalog?category=${encodeURIComponent(collection.category)}`}
                                        className="glass-panel"
                                        sx={{
                                            minHeight: 150, p: { xs: 2.5, md: 3.5 }, borderRadius: 3, textDecoration: 'none',
                                            transition: 'transform .2s ease, border-color .2s ease',
                                            '&:hover': { transform: 'translateY(-3px)', borderColor: `${collection.accent}88` },
                                        }}
                                    >
                                        <Typography sx={{ color: collection.accent, fontSize: 10, letterSpacing: '.2em', fontWeight: 700, mb: 1.5 }}>{collection.category.toUpperCase()}</Typography>
                                        <Typography variant="h5" sx={{ color: '#303e4b', mb: 0.75 }}>{collection.title}</Typography>
                                        <Typography sx={{ color: '#707477', fontSize: 13 }}>{collection.subtitle}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Container>
                    )}
                </div>
            )}
        </>
    )
}

export default Home
