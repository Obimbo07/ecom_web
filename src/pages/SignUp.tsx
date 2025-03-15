import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import api from '../api';
import { FaFacebookF, FaInstagram, FaGoogle } from 'react-icons/fa'; // For social media icons
import { useAuth } from '@/context/AuthContext';

const SignUp = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false); // State for "Remember me"
  const { register } = useAuth();
 const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(username, email, password);
      navigate("/")
    } catch (err) {
      setError('Login failed. Check your credentials.');
    }
  };

  // Placeholder for social login (to be implemented with actual OAuth)
  const handleSocialLogin = (provider: string) => {
    console.log(`Logging in with ${provider}`);
    // Implement OAuth flow here (e.g., redirect to backend OAuth endpoint)
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      {/* Logo and Tagline */}
      <div className="text-center mb-8">
        <div className="w-50 h-50 mx-auto">
          {/* Replace with your logo image or SVG */}
          <div>
            <img src="logo.png" alt="Logo" />
          </div>
        </div>
        <p className="text-white text-md">
          Wholesale and Retail for Apparel and Clothing <br /> Best Deals under one roof
        </p>
      </div>
      {/* Login Form */}
      <div className="w-full max-w-md bg-transparent rounded-lg">
        <h2 className="text-2xl text-white text-center mb-6">Register</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 bg-white rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-white rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-white rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center text-white">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2"
              />
              Remember me
            </label>
          </div>
          <button
            type="submit"
            className="w-full bg-white text-black py-3 rounded-full font-semibold hover:bg-gray-200 transition"
          >
            SIGN UP
          </button>
        </form>

        {/* Sign Up and Social Login */}
        <div className="text-center mt-6">
          <p className="text-gray-400 mb-4">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:underline">
              Login
            </Link>
          </p>
          <p className="text-gray-400 mb-4">Or</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => handleSocialLogin('facebook')}
              className="text-blue-600 hover:text-blue-800"
            >
              <FaFacebookF size={24} />
            </button>
            <button
              onClick={() => handleSocialLogin('instagram')}
              className="text-pink-600 hover:text-pink-800"
            >
              <FaInstagram size={24} />
            </button>
            <button
              onClick={() => handleSocialLogin('google')}
              className="text-red-600 hover:text-red-800"
            >
              <FaGoogle size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;