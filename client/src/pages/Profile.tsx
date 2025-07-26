import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { FaArrowRight, FaUserAlt } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';
import { fetchOrdersStart, fetchOrdersSuccess, fetchOrdersFailure } from '../store/slices/orderSlice';

// Define interfaces based on API responses
interface UserProfile {
  username: string;
  email: string;
  image: string;
  profile: { bio: string; full_name: string; image: string | null; phone: number; verified: boolean } | null;
}

interface Order {
  id: string;
  userId: string;
  items: any[];
  totalAmount: number;
  status: "pending" | "completed" | "cancelled";
  createdAt: string;
  payment_status: "paid" | "unpaid";
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
  const dispatch: AppDispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { orders, loading, error } = useSelector((state: RootState) => state.order) as { orders: Order[]; loading: boolean; error: string | null };

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [shippingAddresses, setShippingAddresses] = useState<ShippingAddress[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingLocal, setLoadingLocal] = useState<boolean>(true);
  const [errorLocal, setErrorLocal] = useState<string>('');
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoadingLocal(true);
        // Fetch user profile data
        const userResponse = await api.get('users/me/');
        setUserProfile(userResponse.data as UserProfile);

        // Fetch orders using Redux action
        dispatch(fetchOrdersStart());
        try {
          const ordersResponse = await api.get('api/user/orders/');
          dispatch(fetchOrdersSuccess(ordersResponse.data as Order[]));
        } catch (err: any) {
          dispatch(fetchOrdersFailure(err.response?.data?.detail || 'Failed to fetch orders.'));
        }

        const reviewsResponse = await api.get('api/users/reviews/');
        setReviews(reviewsResponse.data as Review[]);

        const shippingResponse = await api.get('users/shipping-addresses');
        setShippingAddresses(shippingResponse.data as ShippingAddress[]);

        const paymentResponse = await api.get('users/payment-methods');
        setPaymentMethods(paymentResponse.data as PaymentMethod[]);
      } catch (err: any) {
        setErrorLocal(err.response?.data?.detail || 'Failed to fetch profile data.');
      } finally {
        setLoadingLocal(false);
      }
    };
    if (isAuthenticated) {
      fetchProfileData();
    } else {
      setLoadingLocal(false);
      setErrorLocal('User not authenticated.');
    }
  }, [isAuthenticated, dispatch]);

  const handleLogOutClick = () => {
    dispatch(logout());
    navigate('/');
  };

  // Helper function to normalize image URL
  const getImageUrl = (imagePath: string | null): string | undefined => {
    if (!imagePath) return undefined;
    if (imagePath.startsWith('http')) return imagePath;
    return `${import.meta.env.VITE_API_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };
  
  if (loadingLocal || loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (errorLocal || error) {
    return <div className="text-center py-10 text-red-500">{errorLocal || error}</div>;
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
            {userProfile?.profile?.image && !imageError ? (
              <img
                src={getImageUrl(userProfile.profile.image)}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={() => setImageError(true)} // Switch to icon if image fails
              />
            ) : (
              <FaUserAlt className="w-16 h-16 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold">{userProfile?.username || 'Loading...'}</h3>
            <p className="text-gray-600">{userProfile?.email || 'No email'}</p>
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
