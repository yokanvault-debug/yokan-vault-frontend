import React, { useState, useEffect } from 'react'
import { productSchema, validateWithYup } from '../Utils/validation'
import { useNavigate } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import Sidebar from './SideBar'
// import { getToken } from '../Utils/helpers'
// import axios from 'axios'
import { getCategories } from '../../actions/categoryActions'
import { getBrands } from '../../actions/brandActions'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux'
import { newProduct, clearErrors } from '../../actions/productActions'
import { NEW_PRODUCT_RESET } from '../../constants/productConstants'

const NewProduct = () => {
    const dispatch = useDispatch()
    const { loading, error, success } = useSelector(state => state.newProduct)

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
    const [imagesPreview, setImagesPreview] = useState([])
    // const [error, setError] = useState('')
    // const [loading, setLoading] = useState(true)
    // const [success, setSuccess] = useState('')
    // const [product, setProduct] = useState({})

    // categories and brands come from the database (Admin > Categories / Brands)
    const { categories: categoryList } = useSelector(state => state.categories)
    const { brands: brandList } = useSelector(state => state.brands)
    const categories = (categoryList || []).map(c => c.name)
    const brands = (brandList || []).map(b => b.name)

    useEffect(() => {
        dispatch(getCategories())
        dispatch(getBrands())
    }, [dispatch])

    let navigate = useNavigate()

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

        dispatch(newProduct(formData))
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
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.readyState === 2) {
                    setImagesPreview(oldArray => [...oldArray, reader.result])
                }
            }

            reader.readAsDataURL(file)
            // console.log(reader)
        })

    }
    // const newProduct = async (formData) => {

    //     try {
    //         const config = {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${getToken()}`
    //             }
    //         }

    //         const { data } = await axios.post(`${import.meta.env.VITE_API}/admin/product/new`, formData, config)
    //         setLoading(false)
    //         setSuccess(data.success)
    //         setProduct(data.product)
    //     } catch (error) {
    //         setError(error.response.data.message)

    //     }
    // }
    // useEffect(() => {

    //     if (error) {
    //         toast.error(error, {
    //             position: 'bottom-right'
    //         });
    //     }

    //     if (success) {
    //         navigate('/admin/products');
    //         toast.success('Product created successfully', {
    //             position: 'bottom-right'
    //         })

    //     }

    // }, [error, success,])

    useEffect(() => {
        if (error) {
            toast.error(error, {
                position: 'bottom-right'
            });
            dispatch(clearErrors())
        }

        if (success) {
            navigate('/admin/products');
            toast.success('Product created successfully', {
                position: 'bottom-right'
            })
            dispatch({ type: NEW_PRODUCT_RESET })

        }

    }, [error, dispatch, navigate, success])


    return (
        <>
            <MetaData title={'New Product'} />
            <div className="row">
                <div className="col-12 col-md-2">
                    <Sidebar />
                </div>

                <div className="col-12 col-md-10">
                    <>
                        <div className="wrapper my-5">
                            <form className="shadow-lg" onSubmit={submitHandler} encType='multipart/form-data'>
                                <h1 className="mb-4">New Product</h1>

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
                                        {imagesPreview.map((img, index) => (
                                            <img src={img} key={`${index}-${img}`} alt={`Product image preview ${index + 1}`} className="mt-3 mr-2" style={{ width: 72, height: 72, objectFit: 'contain' }} />
                                        ))}
                                    </div>

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
                                // disabled={loading ? true : false}
                                >
                                    CREATE
                                </button>

                            </form>
                        </div>
                    </>
                </div>
            </div>

        </>
    )
}
export default NewProduct
