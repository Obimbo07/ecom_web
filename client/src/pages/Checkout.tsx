import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MpesaModal from '@/components/paymentModal/mpesaModal';
import { getOrderById } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

// Define interfaces based on Supabase schema
interface Order {
  id: number;
  created_at: string;
  status: string;
  payment_status: string;
  total_amount: number;
  order_items: OrderItem[];
  shipping_address?: Address | null;
  payment_method?: PaymentMethod | null;
}

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  size: string | null;
  color: string | null;
  price: number;
  product?: {
    id: number;
    title: string;
    image: string | null;
    price: number;
    images?: Array<{
      id: number;
      image: string;
      alt_text: string | null;
      display_order: number;
    }>;
  };
}

interface Address {
  id: number;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string;
  phone: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface PaymentMethod {
  id: number;
  method_type: string;
  phone_number: string;
  last_four: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

const AddressCard = ({ address }: { address: Address }) => (
  <div className="bg-white rounded-lg shadow-md p-4 mb-6">
    <h4 className="text-lg font-semibold mb-2">Shipping Address</h4>
    <p className="text-gray-600">{address.address_line1}</p>
    <p className="text-gray-600">{address.address_line2}</p>
    <p className="text-gray-600">{address.city}, {address.state}, {address.postal_code}</p>
    <p className="text-gray-600">{address.country}</p>
    <p className="text-gray-600">Phone: {address.phone}</p>
  </div>
);

const PaymentCard = ({ payment }: { payment: PaymentMethod }) => (
  <div className="bg-white rounded-lg shadow-md p-4 mb-6">
    <h4 className="text-lg font-semibold mb-2">Payment Method</h4>
    <p className="text-gray-600">Method: {payment.method_type}</p>
    <p className="text-gray-600">Phone: {payment.phone_number}</p>
    <p className="text-gray-600">Last Four Digits: {payment.last_four}</p>
  </div>
);

const OrderDetails = () => {
  const { orderid } = useParams<{ orderid: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      // Check if user is authenticated
      if (!user) {
        navigate('/signin');
        return;
      }

      if (!orderid) return;
      
      try {
        setLoading(true);
        const orderData = await getOrderById(Number(orderid));
        
        // Verify the order belongs to the current user
        if ((orderData as any).user_id !== user.id) {
          setError('You do not have permission to view this order.');
          return;
        }
        
        setOrder(orderData as Order);
      } catch (err: any) {
        console.error('Error fetching order:', err);
        setError(err.message || 'Failed to fetch order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderid, user, navigate]);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={() => navigate('/')} className="bg-blue-500 text-white">
          Back to Home
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold mb-4">Authentication Required</h2>
        <p className="text-gray-600 mb-4">Please sign in to view your order details.</p>
        <Button onClick={() => navigate('/signin')} className="bg-blue-500 text-white">
          Sign In
        </Button>
      </div>
    );
  }

  if (!order) {
    return <div className="text-center py-10">Order not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-semibold mb-6">Order #{order.id}</h2>
      <p className="text-gray-600 mb-4">{order.created_at}</p>
      
      <div className='flex capitalize justify-between mb-4 bg-white rounded-lg shadow-md p-4'>
        <p>Order Status:</p>
        <p className={`text-sm ${order.status === 'Delivered' ? 'text-green-600' : 'text-yellow-600'}`}>
          {order.status}
        </p>
        <p>Payment Status:</p>
        <p className={`text-sm ${order.payment_status === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
          {order.payment_status}
        </p>
      </div>

      {/* Order Items */}
      <div className="space-y-4 mb-6">
        {order.order_items?.map((item, index) => {
          const productImage = item.product?.images?.[0]?.image || item.product?.image;
          return (
            <div key={index} className="flex items-center bg-white rounded-lg shadow-md p-4">
              {productImage && (
                <img
                  src={productImage}
                  alt={item.product?.title || 'Product'}
                  className="w-20 h-20 object-cover rounded mr-4"
                />
              )}
              <div>
                <h4 className="text-lg font-semibold">{item.product?.title || 'Unknown Product'}</h4>
                {item.color && <p className="text-gray-600">Color: {item.color}</p>}
                {item.size && <p className="text-gray-600">Size: {item.size}</p>}
                <p className="text-gray-600">Qty: {item.quantity}</p>
                <p className="font-semibold">Ksh {item.price.toLocaleString()}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className='flex justify-between mb-4 bg-white rounded-lg shadow-md p-4'>
        <p className="text-black font-semibold text-2lg">Total Amount: Ksh {order.total_amount.toLocaleString()}</p>
      </div>

      {/* Address and Payment Information */}
      {order.shipping_address && <AddressCard address={order.shipping_address} />}
      {order.payment_method && <PaymentCard payment={order.payment_method} />}

      {/* Order Information */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h4 className="text-lg font-semibold mb-2">Order Information</h4>
        <p className="text-gray-600">Tracking #: IW34753455</p> {/* Mock tracking number */}
        <p className="text-gray-600">Delivery Method: FedEx, 3 days</p>
        <p className="text-gray-600">Discount: 10%, Personal Promo Code</p>
        <p className="text-gray-600">Total Amount: Ksh {order.total_amount}</p>
      </div>

      {/* Actions */}
      <div className='flex gap-4'>
        <Dialog>
          {order.payment_status !== 'paid' ? (
            <DialogTrigger asChild>
              <Button className="flex-1 bg-blue-500 text-white py-2 rounded">
                Pay Now
              </Button>
            </DialogTrigger>
          ) : (
            <Button className="flex-1 bg-gray-200 text-gray-700 py-2 rounded" disabled>
              Order Paid
            </Button>
          )}
          <DialogContent className="h-screen bg-white">
            <DialogHeader>
              <DialogTitle></DialogTitle>
              <DialogDescription>
              </DialogDescription>
            </DialogHeader>
            <MpesaModal
              isOpen={true}
              onClose={() => {}}
              orderId={order.id.toString()}
              amount={order.total_amount}
            />
            <DialogClose asChild>
                  <Button className='bg-red-600 text-white'variant="secondary">Close</Button>
             </DialogClose>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default OrderDetails;