import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../api'; // Adjust the import path as necessary
import mpesaModal from '@/components/paymentModal/mpesaModal';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import MpesaModal from '@/components/paymentModal/mpesaModal';


interface Order {
  id: number;
  created_at: string;
  status: string;
  payment_status: string;
  total_amount: number;
  items: OrderItem[];
}

interface OrderItem {
  product_title: string;
  size: string;
  quantity: number;
  price: number;
  image?: string; // Add image property
}

interface Product {
  title: string;
  image: string;
}

interface Address {
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
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
  const [order, setOrder] = useState<Order | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [payment, setPayment] = useState<PaymentMethod | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const orderResponse = await api.get('api/user/orders/');
        const selectedOrder = orderResponse.data.find((order: Order) => order.id === Number(orderId));
        if (!selectedOrder) throw new Error('Order not found');

        const productsResponse = await api.get('api/products/');
        const products = productsResponse.data;

        const updatedItems = selectedOrder.items.map((item) => {
          const product = products.find((product: Product) => product.title === item.product_title);
          return {
            ...item,
            image: product ? product.image : '', // Set the image if product is found
          };
        });

        setOrder({ ...selectedOrder, items: updatedItems });

        const addressResponse = await api.get('users/users/shipping-addresses/');
        const addressData = addressResponse.data.find((addr: Address) => addr.is_default);
        setAddress(addressData);

        const paymentResponse = await api.get('users/users/payment-methods/');
        const paymentData = paymentResponse.data.find((pay: PaymentMethod) => pay.is_default);
        setPayment(paymentData);
      } catch (err: any) {
        setError(err.response?.data?.detail || err.message || 'Failed to fetch order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);




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
      <h2 className="text-2xl font-semibold mb-6">Order #{order.id}</h2>
      <p className="text-gray-600 mb-4">{order.created_at}</p>
     
      <div className='flex capitalize justify-between mb-4 bg-white rounded-lg shadow-md p-4'>
        Order Status: <p className={`text-sm ${order.status === 'Delivered' ? 'text-green-600' : 'text-yellow-600'}`}>
          {order.status}
        </p>
        Payment Status: <p className={`text-sm ${order.payment_status === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
          {order.payment_status}
        </p>
      </div>

      {/* Order Items */}
      <div className="space-y-4 mb-6">
        {order.items.map((item, index) => (
          <div key={index} className="flex items-center bg-white rounded-lg shadow-md p-4">
            {item.image && (
              <img
                src={item.image}
                alt={item.product_title}
                className="w-20 h-20 object-cover rounded mr-4"
              />
            )}
            <div>
              <h4 className="text-lg font-semibold">{item.product_title}</h4>
              <p className="text-gray-600">Color: Gray</p> {/* Mock color */}
              <p className="text-gray-600">Size: {item.size || 'N/A'}</p>
              <p className="text-gray-600">Qty: {item.quantity}</p>
              <p className="font-semibold">Ksh {item.price.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      <span className='flex justify-between mb-4 bg-white rounded-lg shadow-md p-4'>
        <p className="text-black font-semibold text-2lg">Total Amount: Ksh {order.total_amount}</p>
      </span>



      {/* Address and Payment Information */}
      {address && <AddressCard address={address} />}
      {payment && <PaymentCard payment={payment} />}

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
      <Drawer className='w-full'>
        {order.payment_status == 'paid' ? (
          <DrawerTrigger className="flex-1 bg-gray-200 text-gray-700 py-2 rounded" disabled>
            Order Paid
          </DrawerTrigger>
        ) : (
          <DrawerTrigger className="flex-1 bg-blue-500 text-white py-2 rounded" >
            Pay Now
          </DrawerTrigger>
        )}
        <DrawerContent className='bg-white'>
          <DrawerHeader>
            <MpesaModal isOpen={true} onClose={function (): void {
                throw new Error('Function not implemented.');
              } } orderId={orderId} amount={order.total_amount} />
            <DrawerTitle>Are you absolutely sure?</DrawerTitle>
            <DrawerDescription>This action cannot be undone.</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <button className="bg-blue-500 text-white py-2 px-4 rounded">Submit</button>
            <DrawerClose>
              <button className="bg-gray-200 text-gray-700 py-2 px-4 rounded">Cancel</button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>

      </Drawer>
      </div>
    </div>
  );
};

export default OrderDetails;