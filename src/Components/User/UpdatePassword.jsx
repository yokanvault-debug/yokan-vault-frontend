import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import MetaData from '../Layout/MetaData';
import { useAuth } from '../Utils/AuthContext';
import getFirebaseAuthErrorMessage from '../Utils/firebaseAuthError';
import { updatePassword, clearErrors } from '../../actions/userActions';
import { UPDATE_PASSWORD_RESET } from '../../constants/userConstants';

const UpdatePassword = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentUser, updateUserPassword } = useAuth();
    const { error, isUpdated, loading } = useSelector(state => state.user);
    const [oldPassword, setOldPassword] = useState('');
    const [password, setPassword] = useState('');
    const [firebaseError, setFirebaseError] = useState('');
    const [firebaseLoading, setFirebaseLoading] = useState(false);
    const hasFirebasePassword = Boolean(
        currentUser?.providerData?.some(provider => provider.providerId === 'password')
    );

    useEffect(() => {
        if (isUpdated) {
            navigate('/me');
            dispatch({ type: UPDATE_PASSWORD_RESET });
        }
    }, [dispatch, navigate, isUpdated]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setFirebaseError('');

        if (currentUser) {
            if (!hasFirebasePassword) {
                setFirebaseError('This account uses Google sign-in and does not have a password to change.');
                return;
            }

            setFirebaseLoading(true);
            try {
                await updateUserPassword(oldPassword, password);
                navigate('/me');
            } catch (updateError) {
                setFirebaseError(getFirebaseAuthErrorMessage(updateError, 'Password update'));
            } finally {
                setFirebaseLoading(false);
            }
            return;
        }

        dispatch(clearErrors());
        dispatch(updatePassword({ oldPassword, password }));
    };

    const isSubmitting = currentUser ? firebaseLoading : loading;

    return (
        <>
            <MetaData title="Change Password" />
            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form className="shadow-lg" onSubmit={submitHandler}>
                        <h1 className="mt-2 mb-5">Update Password</h1>
                        {firebaseError && <div className="alert alert-danger" role="alert">{firebaseError}</div>}
                        {!currentUser && error && <div className="alert alert-danger" role="alert">{error}</div>}
                        {currentUser && !hasFirebasePassword && (
                            <div className="alert alert-info" role="status">
                                This account uses Google sign-in and does not have a password to change.
                            </div>
                        )}
                        <div className="form-group">
                            <label htmlFor="old_password_field">Old Password</label>
                            <input
                                type="password"
                                id="old_password_field"
                                className="form-control"
                                autoComplete="current-password"
                                required
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="new_password_field">New Password</label>
                            <input
                                type="password"
                                id="new_password_field"
                                className="form-control"
                                autoComplete="new-password"
                                minLength={6}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn update-btn btn-block mt-4 mb-3"
                            disabled={isSubmitting || (currentUser && !hasFirebasePassword)}
                        >
                            {isSubmitting ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default UpdatePassword;
