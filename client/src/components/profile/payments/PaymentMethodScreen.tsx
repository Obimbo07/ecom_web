import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import api from '@/api';
import { useAuth } from '@/context/AuthContext';

interface PaymentMethod {
  id: number;
  method_type: string;
  phone_number?: string;
  last_four?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

const PaymentMethodScreen = () => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
    fetchMethods();
  }, [isAuthenticated, navigate]);

  const fetchMethods = async () => {
    try {
      setLoading(true);
      const response = await api.get('users/payment-methods/');
      setMethods(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch payment methods.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMethod = async (formData: any) => {
    try {
      const response = await api.post('users/payment-methods/', formData);
      setMethods([...methods, response.data]);
      setSelectedMethod(null); // Close drawer
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add payment method.');
    }
  };

  const handleUpdateMethod = async (id: number, formData: any) => {
    try {
      const response = await api.put(`users/payment-methods/${id}/`, formData);
      setMethods(methods.map(method => method.id === id ? response.data : method));
      setSelectedMethod(null); // Close drawer
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update payment method.');
    }
  };

  const handleDeleteMethod = async (id: number) => {
    try {
      await api.delete(`users/payment-methods/${id}/`);
      setMethods(methods.filter(method => method.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete payment method.');
    }
  };

  const handleFormSubmit = (formData: any) => {
    if (selectedMethod) {
      handleUpdateMethod(selectedMethod.id, formData);
    } else {
      handleAddMethod(formData);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Payment Methods</h2>
        <Drawer>
          <DrawerTrigger asChild>
            <Button className="bg-blue-500 text-white">
              <FaPlus className="mr-2" /> Add Method
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{selectedMethod ? 'Edit Method' : 'Add New Payment Method'}</DrawerTitle>
              <DrawerDescription>
                {selectedMethod ? 'Update your payment method details.' : 'Enter details for a new payment method.'}
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4">
              <form onSubmit={(e) => { e.preventDefault(); handleFormSubmit({
                method_type: e.currentTarget.method_type.value,
                phone_number: e.currentTarget.phone_number.value,
                last_four: e.currentTarget.last_four.value,
                is_default: e.currentTarget.is_default.checked,
              }); }}>
                <select
                  name="method_type"
                  defaultValue={selectedMethod?.method_type || 'mpesa'}
                  className="w-full p-2 mb-2 border rounded"
                  required
                >
                  <option value="mpesa">Mpesa</option>
                  <option value="visa">Visa</option>
                  <option value="mastercard">Mastercard</option>
                </select>
                <input
                  type="text"
                  name="phone_number"
                  placeholder="Phone Number (for Mpesa)"
                  defaultValue={selectedMethod?.phone_number}
                  className="w-full p-2 mb-2 border rounded"
                  required={selectedMethod?.method_type === 'mpesa'}
                />
                <input
                  type="text"
                  name="last_four"
                  placeholder="Last 4 Digits (for Cards)"
                  defaultValue={selectedMethod?.last_four}
                  className="w-full p-2 mb-2 border rounded"
                  required={selectedMethod?.method_type !== 'mpesa'}
                />
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_default"
                    defaultChecked={selectedMethod?.is_default}
                    className="mr-2"
                  />
                  Set as default
                </label>
                <Button type="submit" className="mt-4 bg-red-500 text-white w-full">
                  {selectedMethod ? 'Update Method' : 'Save Method'}
                </Button>
              </form>
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
      <div className="space-y-4">
        {methods.map((method) => (
          <div key={method.id} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-start">
              <div>
                <p>{method.method_type === 'mpesa' ? 'Mpesa' : method.method_type.toUpperCase()} {method.last_four ? `****${method.last_four}` : `(${method.phone_number})`}</p>
                {method.is_default && <p className="text-green-500">Default</p>}
              </div>
              <div className="space-x-2">
                <Button variant="ghost" onClick={() => setSelectedMethod(method)}>
                  <FaEdit />
                </Button>
                <Button variant="ghost" onClick={() => handleDeleteMethod(method.id)}>
                  <FaTrash className="text-red-500" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethodScreen;