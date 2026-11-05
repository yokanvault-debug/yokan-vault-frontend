import React, { useState, useEffect } from 'react'
import { productSchema, validateWithYup } from '../Utils/validation'
import MetaData from '../Layout/MetaData'
import Sidebar from './SideBar'

import { useParams, useNavigate } from 'react-router-dom';
import { getCategories } from '../../actions/categoryActions'
import { getBrands } from '../../actions/brandActions'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
// import axios from 'axios';
// import { getToken } from '../Utils/helpers';
import { useDispatch, useSelector } from 'react-redux'
import { updateProduct, getProductDetails, clearErrors } from '../../actions/productActions'
import { UPDATE_PRODUCT_RESET } from '../../constants/productConstants'


const UpdateProduct = () => {
    const dispatch = useDispatch()
    const { error, product } = useSelector(state => state.productDetails);
    const { loading, error: updateError, isUpdated } = useSelector(state => state.product);
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [stock, setStock] = useState(0);
    const [seller, setSeller] = useState('');
    const [brand, setBrand] = useState('');
    const [rarity, setRarity] = useState('common');
    const [series, setSeries] = useState('');
    const [isBlindBox, setIsBlindBox] = useState(false);
    const [dropRate, setDropRate] = useState(0);
    const [images, setImages] = useState([]);
    const [oldImages, setOldImages] = useState([]);
    const [imagesPreview, setImagesPreview] = useState([])
    // const [error, setError] = useState('')
    // const [product, setProduct] = useState({})
    // const [loading, setLoading] = useState(true)
    // const [updateError, setUpdateError] = useState('')
    // const [isUpdated, setIsUpdated] = useState(false)

    // categories and brands come from the database (Admin > Categories / Brands)
    const { categories: categoryList } = useSelector(state => state.categories)
    const { brands: brandList } = useSelector(state => state.brands)
    const categories = (categoryList || []).map(c => c.name)
    const brands = (brandList || []).map(b => b.name)

    useEffect(() => {
        dispatch(getCategories())
        dispatch(getBrands())
    }, [dispatch])
    let { id } = useParams();
    let navigate = useNavigate();

    const errMsg = (message = '') => toast.error(message, {
        position: 'bottom-right'
    });
    const successMsg = (message = '') => toast.success(message, {
        position: 'bottom-right'
    });

    // const getProductDetails = async (id) => {
    //     try {
    //         const { data } = await axios.get(`${import.meta.env.VITE_API}/product/${id}`)
    //         setProduct(data.product)
    //         setLoading(false)

    //     } catch (error) {
    //         setError(error.response.data.message)

    //     }
    // }

    // const updateProduct = async (id, productData) => {
    //     try {

    //         const config = {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${getToken()}`
    //             }
    //         }
    //         const { data } = await axios.put(`${import.meta.env.VITE_API}/admin/product/${id}`, productData, config)
    //         setIsUpdated(data.success)

    //     } catch (error) {
    //         setUpdateError(error.response.data.message)

    //     }
    // }
    // useEffect(() => {
    //     if (product && product._id !== id) {
    //         getProductDetails(id)
    //     } else {
    //         setName(product.name);
    //         setPrice(product.price);
    //         setDescription(product.description);
    //         setCategory(product.category);
    //         setSeller(product.seller);
    //         setStock(product.stock)
    //         setOldImages(product.images)
    //     }
    //     if (error) {
    //         errMsg(error)

    //     }
    //     if (updateError) {
    //         errMsg(updateError);

    //     }
    //     if (isUpdated) {
    //         navigate('/admin/products');
    //         successMsg('Product updated successfully');

    //     }
    // }, [error, isUpdated, updateError, product, id])

    const [formErrors, setFormErrors] = useState({})
    const submitHandler = async (e) => {
        e.preventDefault();
        const errors = await validateWithYup(productSchema, { name, price, description, category, stock, seller })
        setFormErrors(errors)
        if (Object.keys(errors).length) return

        const formData = new FormData();
        formData.set('name', name);
        formData.set('price', price);
        formData.set('description', description);
        formData.set('category', category);
        formData.set('stock', stock);
        formData.set('seller', seller);
        formData.set('brand', brand);
        formData.set('rarity', rarity);
        formData.set('series', series);
        formData.set('isBlindBox', isBlindBox);
        formData.set('dropRate', dropRate);
        images.forEach(image => {
            formData.append('images', image)
        })
        dispatch(updateProduct(product._id, formData))
    }
    const onChange = e => {
        const files = Array.from(e.target.files)
        if (files.length > 10) {
            toast.error('Choose up to 10 images.', { position: 'bottom-right' })
            e.target.value = ''
            return
        }
        if (files.some(file => !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) || file.size > 10 * 1024 * 1024)) {
            toast.error('Images must be JPG, PNG, WebP or GIF files no larger than 10 MB each.', { position: 'bottom-right' })
            e.target.value = ''
            return
        }
        setImages(files)
        setImagesPreview([]);
        setOldImages([])
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.readyState === 2) {
                    setImagesPreview(oldArray => [...oldArray, reader.result])
                }
            }
            reader.readAsDataURL(file)
        })
    }

    useEffect(() => {
        if (product && product._id !== id) {
            dispatch(getProductDetails(id))
        } else {
            setName(product.name);
            setPrice(product.price);
            setDescription(product.description);
            setCategory(product.category);
            setSeller(product.seller);
            setBrand(product.brand || '');
            setRarity(product.rarity || 'common');
            setSeries(product.series || '');
            setIsBlindBox(Boolean(product.isBlindBox));
            setDropRate(product.dropRate || 0);
            setStock(product.stock)
            setOldImages(product.images)
        }
        if (error) {
            errMsg(error)
            dispatch(clearErrors())

        }
        if (updateError) {
            errMsg(updateError);
            dispatch(clearErrors())

        }
        if (isUpdated) {
            navigate('/admin/products');
            successMsg('Product updated successfully');
            dispatch({ type: UPDATE_PRODUCT_RESET })

        }
    }, [error, updateError, product, id, isUpdated])
    return (
        <>
            <MetaData title={'Update Product'} />
            <div className="row">
                <div className="col-12 col-md-2">
                    <Sidebar />
                </div>
                <div className="col-12 col-md-10">
                    <>
                        <div className="wrapper my-5">
                            <form className="shadow-lg" onSubmit={submitHandler} encType='multipart/form-data'>
                                <h1 className="mb-4">Update Product</h1>
                                <div className="form-group">
                                    <label htmlFor="name_field">Name</label>
                                    <input
                                        type="text"
                                        id="name_field"
                                        className="form-control"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="price_field">Price</label>
                                    <input
                                        type="text"
                                        id="price_field"
                                        className="form-control"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="description_field">Description</label>
                                    <textarea className="form-control" id="description_field" rows="8" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="category_field">Category</label>
                                    <select className="form-control" id="category_field" value={category} onChange={(e) => setCategory(e.target.value)}>
                                        <option value="">Select category</option>
                                        {categories.map(category => (
                                            <option key={category} value={category} >{category}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="brand_field">Brand</label>
                                    <select className="form-control" id="brand_field" value={brand} onChange={(e) => setBrand(e.target.value)}>
                                        <option value="">No brand</option>
                                        {brands.map(brand => (
                                            <option key={brand} value={brand} >{brand}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="rarity_field">Rarity</label>
                                    <select className="form-control" id="rarity_field" value={rarity} onChange={(e) => setRarity(e.target.value)}>
                                        {['common', 'rare', 'epic', 'legendary'].map(r => (
                                            <option key={r} value={r} >{r}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="series_field">Series (needed for blind boxes)</label>
                                    <input
                                        type="text"
                                        id="series_field"
                                        className="form-control"
                                        value={series}
                                        onChange={(e) => setSeries(e.target.value)}
                                    />
                                </div>

                                <div className="form-group form-check">
                                    <input
                                        type="checkbox"
                                        id="blindbox_field"
                                        className="form-check-input"
                                        checked={isBlindBox}
                                        onChange={(e) => setIsBlindBox(e.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor="blindbox_field">This product is a blind box</label>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="droprate_field">Drop rate % (collectibles inside a series)</label>
                                    <input
                                        type="number"
                                        id="droprate_field"
                                        className="form-control"
                                        min="0"
                                        max="100"
                                        value={dropRate}
                                        onChange={(e) => setDropRate(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="stock_field">Stock</label>
                                    <input
                                        type="number"
                                        id="stock_field"
                                        className="form-control"
                                        value={stock}
                                        onChange={(e) => setStock(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="seller_field">Seller Name</label>
                                    <input
                                        type="text"
                                        id="seller_field"
                                        className="form-control"
                                        value={seller}
                                        onChange={(e) => setSeller(e.target.value)}
                                    />
                                </div>
                                <div className='form-group'>
                                    <label>Images</label>
                                    <div className='custom-file'>
                                        <input
                                            type='file'
                                            name='images'
                                            className='custom-file-input'
                                            id='customFile'
                                            onChange={onChange}
                                            accept='image/jpeg,image/png,image/webp,image/gif'
                                            multiple
                                        />
                                        <label className='custom-file-label' htmlFor='customFile'>
                                            Choose Images
                                        </label>
                                    </div>
                                    <div className="d-flex flex-wrap">
                                        {oldImages && oldImages.map((img, index) => (
                                            <img key={img.public_id || img.url || index} src={img.url} alt={`${name} image ${index + 1}`} className="mt-3 mr-2" style={{ width: 72, height: 72, objectFit: 'contain' }} />
                                        ))}
                                        {imagesPreview.map((img, index) => (
                                            <img src={img} key={`${index}-${img}`} alt={`New product image preview ${index + 1}`} className="mt-3 mr-2" style={{ width: 72, height: 72, objectFit: 'contain' }} />
                                        ))}
                                    </div>
                                    {images.length > 0 && <small className="form-text text-muted">Saving will replace the current images with the selected images.</small>}
                                </div>
                                {Object.keys(formErrors).length > 0 && (
                                    <div className="alert alert-danger py-2" role="alert">
                                        {Object.values(formErrors).map((m, i) => <div key={i}>{m}</div>)}
                                    </div>
                                )}
                                <button
                                    id="login_button"
                                    type="submit"
                                    className="btn btn-block py-3"
                                    disabled={loading ? true : false}
                                >
                                    UPDATE
                                </button>
                            </form>
                        </div>
                    </>
                </div>
            </div>
        </>
    )
}

export default UpdateProduct