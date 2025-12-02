import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getOrderById, getShippingAddresses, getPaymentMethods } from '@/lib/supabase';
import MpesaModal from '@/components/paymentModal/mpesaModal';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Define interfaces
interface Order {
  id: number;
  order_number: string;
  created_at: string;
  status: string;
  payment_status: string;
  total_amount: number;
  order_items: OrderItem[];
}

interface OrderItem {
  id: number;
  product_id: number;
  product_title: string;
  product_image: string | null;
  size: string | null;
  color: string | null;
  quantity: number;
  price: number;
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
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [payment, setPayment] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!user) {
        navigate('/signin');
        return;
      }

      if (!orderId) {
        setError('Invalid order ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        // Fetch order by ID from Supabase
        const orderData = await getOrderById(parseInt(orderId));
        
        if (!orderData) {
          setError('Order not found');
          return;
        }

        // Verify order belongs to current user
        if ((orderData as any).user_id !== user.id) {
          setError('You do not have permission to view this order');
          return;
        }

        setOrder(orderData as Order);

        // Fetch default shipping address
        const addressesData = await getShippingAddresses(user.id);
        const defaultAddress = addressesData.find((addr: Address) => addr.is_default);
        if (defaultAddress) {
          setAddress(defaultAddress);
        }

        // Fetch default payment method
        const paymentsData = await getPaymentMethods(user.id);
        const defaultPayment = paymentsData.find((pay: PaymentMethod) => pay.is_default);
        if (defaultPayment) {
          setPayment(defaultPayment);
        }
      } catch (err: any) {
        console.error('Error fetching order details:', err);
        setError(err.message || 'Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, user, navigate]);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (!order) {
    return <div className="text-center py-10">Order not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-semibold mb-6">Order #{order.order_number || order.id}</h2>
      <p className="text-gray-600 mb-4">{new Date(order.created_at).toLocaleDateString()}</p>
      
      <div className='flex capitalize justify-between mb-4 bg-white rounded-lg shadow-md p-4'>
        <p>Order Status:</p>
        <p className={`text-sm ${order.status === 'delivered' ? 'text-green-600' : 'text-yellow-600'}`}>
          {order.status}
        </p>
        <p>Payment Status:</p>
        <p className={`text-sm ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
          {order.payment_status}
        </p>
      </div>

      {/* Order Items */}
      <div className="space-y-4 mb-6">
        {order.order_items.map((item) => (
          <div key={item.id} className="flex items-center bg-white rounded-lg shadow-md p-4">
            {item.product_image && (
              <img
                src={item.product_image}
                alt={item.product_title}
                className="w-20 h-20 object-cover rounded mr-4"
              />
            )}
            <div>
              <h4 className="text-lg font-semibold">{item.product_title}</h4>
              {item.color && <p className="text-gray-600">Color: {item.color}</p>}
              {item.size && <p className="text-gray-600">Size: {item.size}</p>}
              <p className="text-gray-600">Qty: {item.quantity}</p>
              <p className="font-semibold">Ksh {item.price.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className='flex justify-between mb-4 bg-white rounded-lg shadow-md p-4'>
        <p className="text-black font-semibold text-2lg">Total Amount: Ksh {order.total_amount.toFixed(2)}</p>
      </div>

      {/* Address and Payment Information */}
      {address && <AddressCard address={address} />}
      {payment && <PaymentCard payment={payment} />}

      {/* Order Information */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h4 className="text-lg font-semibold mb-2">Order Information</h4>
        <p className="text-gray-600">Order Number: {order.order_number || order.id}</p>
        <p className="text-gray-600">Order Date: {new Date(order.created_at).toLocaleDateString()}</p>
        <p className="text-gray-600">Total Amount: Ksh {order.total_amount.toFixed(2)}</p>
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