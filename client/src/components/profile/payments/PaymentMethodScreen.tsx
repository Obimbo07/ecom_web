import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { 
  getPaymentMethods, 
  createPaymentMethod, 
  updatePaymentMethod, 
  deletePaymentMethod 
} from '@/lib/supabase';

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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    fetchMethods();
  }, [user, navigate]);

  const fetchMethods = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError('');
      const data = await getPaymentMethods(user.id);
      setMethods(data as PaymentMethod[]);
    } catch (err: any) {
      console.error('Error fetching payment methods:', err);
      setError(err.message || 'Failed to fetch payment methods.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMethod = async (formData: any) => {
    if (!user) return;
    
    try {
      const newMethod = await createPaymentMethod(user.id, {
        methodType: formData.method_type,
        phoneNumber: formData.phone_number,
        lastFour: formData.last_four,
        isDefault: formData.is_default,
      });
      setMethods([...methods, newMethod as PaymentMethod]);
      setSelectedMethod(null);
      setIsDrawerOpen(false);
    } catch (err: any) {
      console.error('Error adding payment method:', err);
      setError(err.message || 'Failed to add payment method.');
    }
  };

  const handleUpdateMethod = async (id: number, formData: any) => {
    try {
      const updatedMethod = await updatePaymentMethod(id, {
        methodType: formData.method_type,
        phoneNumber: formData.phone_number,
        lastFour: formData.last_four,
        isDefault: formData.is_default,
      });
      setMethods(methods.map(method => method.id === id ? updatedMethod as PaymentMethod : method));
      setSelectedMethod(null);
      setIsDrawerOpen(false);
    } catch (err: any) {
      console.error('Error updating payment method:', err);
      setError(err.message || 'Failed to update payment method.');
    }
  };

  const handleDeleteMethod = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) return;
    
    try {
      await deletePaymentMethod(id);
      setMethods(methods.filter(method => method.id !== id));
    } catch (err: any) {
      console.error('Error deleting payment method:', err);
      setError(err.message || 'Failed to delete payment method.');
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
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button className="bg-blue-500 text-white" onClick={() => {
              setSelectedMethod(null);
              setIsDrawerOpen(true);
            }}>
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
                <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                  <DrawerTrigger asChild>
                    <Button variant="ghost" onClick={() => {
                      setSelectedMethod(method);
                      setIsDrawerOpen(true);
                    }}>
                      <FaEdit />
                    </Button>
                  </DrawerTrigger>
                </Drawer>
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