import api from '@/api';
import { useState, useEffect } from 'react';

interface MpesaModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
}

const MpesaModal = ({ isOpen, onClose, orderId, amount }: MpesaModalProps) => {
  const [phoneNumber, setPhoneNumber] = useState('254794570888');
  const [checkoutRequestId, setCheckoutRequestId] = useState('');
  const [initiateDisabled, setInitiateDisabled] = useState(false);
  const [fetchDisabled, setFetchDisabled] = useState(false);
  const [completeDisabled, setCompleteDisabled] = useState(false);
  const [initiateTimer, setInitiateTimer] = useState(0);
  const [fetchTimer, setFetchTimer] = useState(0);
  const [completeTimer, setCompleteTimer] = useState(0);

  useEffect(() => {
    let initiateTimerId: NodeJS.Timeout;
    if (initiateTimer > 0) {
      initiateTimerId = setInterval(() => {
        setInitiateTimer((prev) => prev - 1);
      }, 2000);
    } else if (initiateTimer === 0 && initiateDisabled) {
      setInitiateDisabled(false);
      if (checkoutRequestId) {
        console.log(checkoutRequestId, 'checkout id in timer')
        handleFetchPayment(checkoutRequestId);
      }
    }
    return () => clearInterval(initiateTimerId);
  }, [initiateTimer, initiateDisabled, checkoutRequestId]);

  // Timer logic for Fetch Payment button
  useEffect(() => {
    let fetchTimerId: NodeJS.Timeout;
    if (fetchTimer > 0) {
      fetchTimerId = setInterval(() => {
        setFetchTimer((prev) => prev - 1);
      }, 1000);
    } else if (fetchTimer === 0 && fetchDisabled) {
      setFetchDisabled(false);
    }
    return () => clearInterval(fetchTimerId);
  }, [fetchTimer, fetchDisabled]);

  // Timer logic for Complete button
  useEffect(() => {
    let completeTimerId: NodeJS.Timeout;
    if (completeTimer > 0) {
      completeTimerId = setInterval(() => {
        setCompleteTimer((prev) => prev - 1);
      }, 1000);
    } else if (completeTimer === 0 && completeDisabled) {
      setCompleteDisabled(false);
    }
    return () => clearInterval(completeTimerId);
  }, [completeTimer, completeDisabled]);

  const handleFetchPayment = async ({checkoutRequestId}: any) => {
    setFetchDisabled(true);
    setFetchTimer(10);
    try {
      const response = await api.post('api/query-mpesa/', {
        "checkout_request_id": checkoutRequestId,
      });
      console.log('Payment status fetched:', response.data);
    } catch (err) {
      console.error('Error fetching payment status:', err);
    }
  };

  const handleInitiatePayment = async () => {
    setInitiateDisabled(true);
    setInitiateTimer(20);
    try {
      const response = await api.post('api/checkout-session/', {
        order_id: orderId,
        shipping_address_id: 1,
        payment_method_id: 1,
        phone_number: phoneNumber,
      });
        console.log('Payment initiated:', response.data);
        const data = response.data;
        const { checkout_request_id } = data;
        console.log(checkout_request_id, 'checkoutRequestId in stk initiate');
        const checkoutRequestId = checkout_request_id;
        console.log(checkoutRequestId, 'checkoutRequestId in stk ');
        setCheckoutRequestId(checkoutRequestId);
    
        return checkoutRequestId;
    } catch (err) {
      console.error('Error initiating payment:', err);
      setInitiateDisabled(false); // Re-enable on error
      setInitiateTimer(0);
    }
  };
  console.log(checkoutRequestId, 'requestId in modal global');
  // Handle Fetch Payment click

  // Handle Complete click
  const handleComplete = async () => {
    setCompleteDisabled(true);
    setCompleteTimer(20); // 20 seconds timer
    try {
      await api.put(`/orders/${orderId}`, { status: 'paid' });
      console.log('Payment completed');
      onClose(); // Close modal on success
    } catch (err) {
      console.error('Error completing payment:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="flex items-center justify-center">
      <div className="">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 flex justify-between items-center">
          Pay Using M-PESA <span className="text-lg">KES {amount}</span>
        </h2>

        {/* Step 1: Click to receive M-PESA Menu */}
        <p className="text-blue-600 mb-2 cursor-pointer">1. Click here to receive M-PESA Menu</p>

        {/* Phone Number Input */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Phone Number</label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter phone number"
          />
        </div>

        {/* Initiate Payment Button */}
        <button
          onClick={handleInitiatePayment}
          disabled={initiateDisabled}
          className={`w-full bg-blue-500 text-white p-2 rounded mb-4 ${
            initiateDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
          }`}
        >
          {initiateDisabled ? `Initiate Payment (${initiateTimer}s)` : 'Initiate Payment'}
        </button>

        {/* Step 2 & 3: M-PESA PIN and Confirmation */}
        <p className="text-gray-600 mb-2">
          2. Enter your M-PESA PIN and click OK
        </p>
        <p className="text-gray-600 mb-4">
          3. You will receive a confirmation SMS from M-PESA
        </p>
        <p className="text-gray-600 mb-4">
          After you receive a successful reply from M-PESA, click the complete button below.
        </p>

        {/* Alternative Instructions */}
        <p className="text-gray-600 mb-2">Or follow instructions below</p>
        <ol className="text-gray-600 list-decimal list-inside mb-4">
          <li>Go to MPESA menu on your phone</li>
          <li>Select Paybill option</li>
          <li>Enter Business Number 222222</li>
          <li>Enter Account Number YLQDDJX6</li>
          <li>Enter the amount {amount}.00</li>
          <li>Enter your MPESA PIN and Send</li>
          <li>You will receive a confirmation SMS from MPESA</li>
        </ol>

        {/* Buttons */}
        <div className="flex justify-between space-x-2">
          <button
            onClick={handleFetchPayment}
            disabled={fetchDisabled}
            className={`flex-1 bg-gray-300 text-gray-700 p-2 rounded ${
              fetchDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-400'
            }`}
          >
            {fetchDisabled ? `Fetch Payment (${fetchTimer}s)` : 'Fetch Payment'}
          </button>
          
          <button
            onClick={handleComplete}
            disabled={completeDisabled}
            className={`flex-1 bg-blue-500 text-white p-2 rounded ${
              completeDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
            }`}
          >
            {completeDisabled ? `Complete (${completeTimer}s)` : 'Complete'}
          </button>
        </div>
      </div>
    </div>
  ); 
};

export default MpesaModal;