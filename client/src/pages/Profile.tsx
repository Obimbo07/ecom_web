import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowRight, FaUserAlt } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { 
  getProfile, 
  getUserOrders, 
  getUserReviews, 
  getShippingAddresses, 
  getPaymentMethods 
} from '@/lib/supabase';

// Define interfaces based on Supabase schema
interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  phone: string | null;
  image: string | null;
  verified: boolean;
  role?: string; // admin, user, etc.
  created_at: string;
  updated_at: string;
}

interface Order {
  id: number;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  order_items?: Array<{
    product_title: string;
    quantity: number;
    price: number;
  }>;
}

interface Review {
  id: number;
  product_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  is_verified: boolean;
  product?: {
    id: number;
    title: string;
    image: string | null;
    slug: string | null;
  };
}

interface ShippingAddress {
  id: number;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string;
  phone: string;
  is_default: boolean;
}

interface PaymentMethod {
  id: number;
  method_type: string;
  phone_number: string;
  last_four: string;
  is_default: boolean;
}

const Profile = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [shippingAddresses, setShippingAddresses] = useState<ShippingAddress[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  // Fetch user data from Supabase
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        setError('');

        // Fetch profile data (will auto-create if doesn't exist)
        const profileData = await getProfile(user.id);
        setProfile(profileData as Profile);

        // Fetch orders (may be empty for new users)
        try {
          const ordersData = await getUserOrders(user.id);
          setOrders(ordersData as Order[]);
        } catch (err) {
          console.log('No orders found for user');
          setOrders([]);
        }

        // Fetch reviews (may be empty for new users)
        try {
          const reviewsData = await getUserReviews(user.id);
          setReviews(reviewsData as Review[]);
        } catch (err) {
          console.log('No reviews found for user');
          setReviews([]);
        }

        // Fetch shipping addresses (may be empty for new users)
        try {
          const shippingData = await getShippingAddresses(user.id);
          setShippingAddresses(shippingData as ShippingAddress[]);
        } catch (err) {
          console.log('No shipping addresses found for user');
          setShippingAddresses([]);
        }

        // Fetch payment methods (may be empty for new users)
        try {
          const paymentData = await getPaymentMethods(user.id);
          setPaymentMethods(paymentData as PaymentMethod[]);
        } catch (err) {
          console.log('No payment methods found for user');
          setPaymentMethods([]);
        }
      } catch (err: any) {
        console.error('Error fetching profile data:', err);
        setError(err.message || 'Failed to fetch profile data.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [user, navigate]);

  const handleLogOutClick = () => {
    logout();
    navigate('/');
  };

  // Helper function to get image URL from Supabase storage
  const getImageUrl = (imagePath: string | null): string | undefined => {
    if (!imagePath) return undefined;
    if (imagePath.startsWith('http')) return imagePath;
    // If it's a Supabase storage path, return as is
    return imagePath;
  };
  
  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (!user || !profile) {
    return <div className="text-center py-10">Please sign in to view your profile</div>;
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
            {profile?.image && !imageError ? (
              <img
                src={getImageUrl(profile.image)}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <FaUserAlt className="w-16 h-16 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold">{profile?.username || profile?.full_name || 'User'}</h3>
            <p className="text-gray-600">{user?.email || 'No email'}</p>
            {profile?.phone && <p className="text-sm text-gray-500">{profile.phone}</p>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <Button className="bg-red-500 text-white" onClick={handleLogOutClick}>
          Sign Out
        </Button>
      </div>

      {/* Admin Access Button - Only visible for admin users */}
      {profile?.role === 'admin' && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-4 mb-6">
          <Link to="/admin" className="block">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-lg font-semibold text-white">Admin Dashboard</h4>
                <p className="text-purple-100 text-sm">Access admin panel and manage store</p>
              </div>
              <span className="text-white bg-white/20 p-3 rounded-full hover:bg-white/30 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
            </div>
          </Link>
        </div>
      )}

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