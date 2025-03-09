import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api';

// Define interfaces based on OrderResponse
interface Order {
  id: number;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  items: { product_title: string; quantity: number; price: number; size?: string }[];
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await api.get('api/user/orders/');
        setOrders(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to fetch orders.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-semibold mb-6">My Orders</h2>

      {/* Order Status Filters */}
      <div className="flex space-x-4 mb-4 text-gray-600">
        <button className="font-semibold">Delivered</button>
        <button>Processing</button>
        <button>Canceled</button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/profile/orders/${order.id}`}
            className="block bg-white rounded-lg shadow-md p-4"
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-lg font-semibold">Order #{order.id}</h4>
                <p className="text-gray-600">Tracking #: IW34753455</p> {/* Mock tracking number */}
                <p className="text-gray-600">Quantity: {order.items.reduce((sum, item) => sum + item.quantity, 0)}</p>
                <p className="text-gray-600">Total Amount: Ksh {order.total_amount.toFixed(2)}</p>
                <div className='flex gap-2'>
                Order Status: 
                    <p className={`text-sm ${order.status === 'delivered' ? 'text-green-600' : order.status === 'processing' ? 'text-yellow-600' : order.status === 'shipped' ? 'text-yellow-600': 'text-orange-600'}`}>
                    {order.status}
                    </p>
                </div>
                <div className='flex gap-2'>
                Payment Status: 
                    <p className={`text-sm ${order.payment_status === 'paid' ? 'text-green-600' : order.payment_status === 'unpaid' ? 'text-yellow-600' : order.payment_status === 'failed' ? 'text-yellow-600' : 'text-red-600'}`}>
                    <span className="capitalize">{order.payment_status}</span>
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