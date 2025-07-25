import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import api from '../api';
import { FaFacebookF, FaInstagram, FaGoogle } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const dispatch: AppDispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    dispatch(loginStart());
    try {
      const response = await api.post('users/login/', { email, password });
      console.log(response, 'api sign response');
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      dispatch(loginSuccess({
        id: response.data.user_id, // Assuming user_id is returned
        username: response.data.username, // Assuming username is returned
        email: email,
        token: response.data.access_token,
      }));
      navigate('/');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Login failed. Check your credentials.';
      dispatch(loginFailure(errorMessage));
    }
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Logging in with ${provider}`);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <div className="w-50 h-50 mx-auto">
          <img src="logo.png" alt="Logo" />
        </div>
        <p className="text-white text-md">
          Wholesale and Retail for Apparel and Clothing <br /> Best Deals under one roof
        </p>
      </div>
      <div className="w-full max-w-md bg-transparent rounded-lg">
        <h2 className="text-2xl text-white text-center mb-6">SIGN IN</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-white rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-white rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center text-white">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2"
                disabled={loading}
              />
              Remember me
            </label>
          </div>
          <button
            type="submit"
            className={`w-full bg-white text-black py-3 rounded-full font-semibold transition ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'
            }`}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'SIGN IN'} {/* Change text */}
          </button>
        </form>
        <div className="text-center mt-6">
          <p className="text-gray-400 mb-4">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-blue-400 hover:underline">
              Sign Up
            </Link>
          </p>
          <p className="text-gray-400 mb-4">Or</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => handleSocialLogin('facebook')}
              className="text-blue-600 hover:text-blue-800"
              disabled={loading} // Optional
            >
              <FaFacebookF size={24} />
            </button>
            <button
              onClick={() => handleSocialLogin('instagram')}
              className="text-pink-600 hover:text-pink-800"
              disabled={loading}
            >
              <FaInstagram size={24} />
            </button>
            <button
              onClick={() => handleSocialLogin('google')}
              className="text-red-600 hover:text-red-800"
              disabled={loading}
            >
              <FaGoogle size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
