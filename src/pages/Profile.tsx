import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { FaArrowRight, FaUserAlt } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

// Define interfaces based on API responses
interface User {
  username: string;
  email: string;
  image: string;
  profile: { bio: string; full_name: string; image: string | null; phone: number; verified: boolean };
}

interface Order {
  id: number;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  items: { product_title: string; quantity: number; price: number }[];
}

interface Review {
  id: number;
  product: number;
  rating: number;
  review_text: string | null;
  created_at: string;
  updated_at: string;
  is_approved: boolean;
}

interface ShippingAddress {
  id: number;
  address_line1: string;
  city: string;
  postal_code: string;
}

interface PaymentMethod {
  id: number;
  method_type: string;
  last_four: string;
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [shippingAddresses, setShippingAddresses] = useState<ShippingAddress[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [imageError, setImageError] = useState(false); // New state for image load failure
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Fetch user data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);

        const userResponse = await api.get('users/me/');
        setUser(userResponse.data);

        const ordersResponse = await api.get('api/user/orders/');
        setOrders(ordersResponse.data);

        const reviewsResponse = await api.get('api/users/reviews/');
        setReviews(reviewsResponse.data);

        const shippingResponse = await api.get('users/shipping-addresses');
        setShippingAddresses(shippingResponse.data);

        const paymentResponse = await api.get('users/payment-methods');
        setPaymentMethods(paymentResponse.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to fetch profile data.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const handleLogOutClick = () => {
    logout();
    navigate('/');
  };

  // Helper function to normalize image URL
  const getImageUrl = (imagePath: string | null): string | undefined => {
    if (!imagePath) return undefined;
    if (imagePath.startsWith('http')) return imagePath;
    return `${import.meta.env.VITE_API_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };
  
  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">My Profile</h2>
        <Link to="/search" className="text-blue-500">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </Link>
      </div>

      {/* User Profile */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-300 rounded-full overflow-hidden">
            {user?.profile?.image && !imageError ? (
              <img
                src={getImageUrl(user.profile.image)}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={() => setImageError(true)} // Switch to icon if image fails
              />
            ) : (
              <FaUserAlt className="w-16 h-16 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold">{user?.username || 'Loading...'}</h3>
            <p className="text-gray-600">{user?.email || 'No email'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <Button className="bg-red-500 text-white" onClick={handleLogOutClick}>
          Sign Out
        </Button>
      </div>

      {/* Profile Sections */}
      <div className="space-y-4">
        {/* My Orders */}
        <Link to="/profile/orders" className="block bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-lg font-semibold">My orders</h4>
              <p className="text-gray-600">Already have {orders.length} orders</p>
            </div>
            <span className="text-gray-400">
              <FaArrowRight />
            </span>
          </div>
        </Link>

        {/* Shipping Addresses */}
        <Link to="/profile/shipping-addresses" className="block bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-lg font-semibold">Shipping addresses</h4>
              <p className="text-gray-600">{shippingAddresses.length} addresses</p>
            </div>
            <span className="text-gray-400">
              <FaArrowRight />
            </span>
          </div>
        </Link>

        {/* Payment Methods */}
        <Link to="/profile/payment-methods" className="block bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-lg font-semibold">Payment methods</h4>
              <p className="text-gray-600">
                {paymentMethods.length > 0
                  ? `${paymentMethods[0].method_type} *${paymentMethods[0].last_four}`
                  : 'No methods'}
              </p>
            </div>
            <span className="text-gray-400">
              <FaArrowRight />
            </span>
          </div>
        </Link>

        {/* Promocodes */}
        <Link to="#" className="block bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-lg font-semibold">Promocodes</h4>
              <p className="text-gray-600">Coming Soon</p>
            </div>
            <span className="text-gray-400">
              <FaArrowRight />
            </span>
          </div>
        </Link>

        {/* My Reviews */}
        <Link to="/profile/reviews" className="block bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-lg font-semibold">My reviews</h4>
              <p className="text-gray-600">Reviews for {reviews.length} items</p>
            </div>
            <span className="text-gray-400">
              <FaArrowRight />
            </span>
          </div>
        </Link>

        {/* Settings */}
        <Link to="/profile/settings" className="block bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-lg font-semibold">Settings</h4>
              <p className="text-gray-600">Notifications, password</p>
            </div>
            <span className="text-gray-400">
              <FaArrowRight />
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Profile;