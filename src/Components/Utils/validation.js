import * as Yup from 'yup';
import { validateYupSchema, yupToFormErrors } from 'formik';

export const productSchema = Yup.object({
  name: Yup.string().trim().min(2, 'Product name must be at least 2 characters.').max(100, 'Product name cannot exceed 100 characters.').required('Product name is required.'),
  price: Yup.number().typeError('Price must be a number.').min(0, 'Price cannot be negative.').required('Price is required.'),
  description: Yup.string().trim().min(10, 'Description must be at least 10 characters.').required('Description is required.'),
  category: Yup.string().required('Please choose a category.'),
  stock: Yup.number().typeError('Stock must be a number.').integer('Stock must be a whole number.').min(0, 'Stock cannot be negative.').required('Stock is required.'),
  seller: Yup.string().trim().required('Seller name is required.'),
});

export const profileSchema = Yup.object({
  name: Yup.string().trim().min(2, 'Name must be at least 2 characters.').max(30, 'Name cannot exceed 30 characters.').required('Name is required.'),
  email: Yup.string().email('Please enter a valid email address.').required('Email is required.'),
});

// Runs a Yup schema through Formik's helpers; resolves with {} when valid, else { field: message }
export const validateWithYup = async (schema, values) => {
  try {
    await validateYupSchema(values, schema);
    return {};
  } catch (err) {
    return yupToFormErrors(err);
  }
};
