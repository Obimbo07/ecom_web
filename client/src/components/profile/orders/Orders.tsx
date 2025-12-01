import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserOrders } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';

// Define interfaces based on Supabase schema
interface Order {
  id: number;
  order_number: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  tracking_number: string | null;
  order_items?: Array<{
    id: number;
    product_title: string;
    quantity: number;
    price: number;
    size: string | null;
  }>;
}

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState<string>('all');

  // Fetch orders from Supabase
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const ordersData = await getUserOrders(user.id);
        setOrders(ordersData as Order[]);
      } catch (err: any) {
        console.error('Error fetching orders:', err);
        setError(err.message || 'Failed to fetch orders.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold mb-4">No Orders Found</h2>
        <Link to="/categories" className="text-blue-500 hover:underline">
          Start Shopping
        </Link>
      </div>
    );
  }

  // Filter orders based on status
  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => {
        if (filter === 'delivered') return order.status === 'delivered'
        if (filter === 'processing') return order.status === 'processing' || order.status === 'pending'
        if (filter === 'cancelled') return order.status === 'cancelled'
        return true
      })

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-semibold mb-6">My Orders</h2>

      {/* Order Status Filters */}
      <div className="flex space-x-4 mb-4 text-gray-600">
        <button 
          className={`font-semibold ${filter === 'all' ? 'text-blue-500' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`font-semibold ${filter === 'delivered' ? 'text-blue-500' : ''}`}
          onClick={() => setFilter('delivered')}
        >
          Delivered
        </button>
        <button 
          className={`font-semibold ${filter === 'processing' ? 'text-blue-500' : ''}`}
          onClick={() => setFilter('processing')}
        >
          Processing
        </button>
        <button 
          className={`font-semibold ${filter === 'cancelled' ? 'text-blue-500' : ''}`}
          onClick={() => setFilter('cancelled')}
        >
          Canceled
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Link
            key={order.id}
            to={`/checkout/${order.id}`}
            className="block bg-white rounded-lg shadow-md p-4"
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-lg font-semibold">Order #{order.order_number || order.id}</h4>
                {order.tracking_number && <p className="text-gray-600">Tracking #: {order.tracking_number}</p>}
                <p className="text-gray-600">
                  Quantity: {order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                </p>
                <p className="text-gray-600">Total Amount: Ksh {order.total_amount.toLocaleString()}</p>
                <div className='flex gap-2'>
                  Order Status: 
                  <p className={`text-sm capitalize ${
                    order.status === 'delivered' ? 'text-green-600' : 
                    order.status === 'processing' || order.status === 'shipped' ? 'text-yellow-600': 
                    'text-orange-600'
                  }`}>
                    {order.status}
                  </p>
                </div>
                <div className='flex gap-2'>
                  Payment Status: 
                  <p className={`text-sm capitalize ${
                    order.payment_status === 'paid' ? 'text-green-600' : 
                    order.payment_status === 'unpaid' || order.payment_status === 'pending' ? 'text-yellow-600' : 
                    'text-red-600'
                  }`}>
                    {order.payment_status}
                  </p>
                </div>
              </div>
              <button className="text-blue-500">Details</button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Orders;