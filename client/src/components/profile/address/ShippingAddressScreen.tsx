import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { 
  getShippingAddresses, 
  createShippingAddress, 
  updateShippingAddress, 
  deleteShippingAddress 
} from '@/lib/supabase';

interface ShippingAddress {
  id: number;
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

const ShippingAddressScreen = () => {
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<ShippingAddress | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    fetchAddresses();
  }, [user, navigate]);

  const fetchAddresses = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError('');
      const data = await getShippingAddresses(user.id);
      setAddresses(data as ShippingAddress[]);
    } catch (err: any) {
      console.error('Error fetching addresses:', err);
      setError(err.message || 'Failed to fetch shipping addresses.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (formData: any) => {
    if (!user) return;
    
    try {
      const newAddress = await createShippingAddress(user.id, {
        fullName: formData.full_name,
        phone: formData.phone,
        addressLine1: formData.address_line1,
        addressLine2: formData.address_line2,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postal_code,
        country: formData.country,
        isDefault: formData.is_default,
      });
      setAddresses([...addresses, newAddress as ShippingAddress]);
      setSelectedAddress(null);
      setIsDrawerOpen(false);
    } catch (err: any) {
      console.error('Error adding address:', err);
      setError(err.message || 'Failed to add shipping address.');
    }
  };

  const handleUpdateAddress = async (id: number, formData: any) => {
    try {
      const updatedAddress = await updateShippingAddress(id, {
        fullName: formData.full_name,
        phone: formData.phone,
        addressLine1: formData.address_line1,
        addressLine2: formData.address_line2,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postal_code,
        country: formData.country,
        isDefault: formData.is_default,
      });
      setAddresses(addresses.map(addr => addr.id === id ? updatedAddress as ShippingAddress : addr));
      setSelectedAddress(null);
      setIsDrawerOpen(false);
    } catch (err: any) {
      console.error('Error updating address:', err);
      setError(err.message || 'Failed to update shipping address.');
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    
    try {
      await deleteShippingAddress(id);
      setAddresses(addresses.filter(addr => addr.id !== id));
    } catch (err: any) {
      console.error('Error deleting address:', err);
      setError(err.message || 'Failed to delete shipping address.');
    }
  };

  const handleFormSubmit = (formData: any) => {
    if (selectedAddress) {
      handleUpdateAddress(selectedAddress.id, formData);
    } else {
      handleAddAddress(formData);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Shipping Addresses</h2>
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button className="bg-blue-500 text-white" onClick={() => {
              setSelectedAddress(null);
              setIsDrawerOpen(true);
            }}>
              <FaPlus className="mr-2" /> Add Address
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{selectedAddress ? 'Edit Address' : 'Add New Address'}</DrawerTitle>
              <DrawerDescription>
                {selectedAddress ? 'Update your shipping address details.' : 'Enter details for a new shipping address.'}
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4">
              <form onSubmit={(e) => { e.preventDefault(); handleFormSubmit({
                full_name: e.currentTarget.full_name.value,
                address_line1: e.currentTarget.address_line1.value,
                address_line2: e.currentTarget.address_line2.value,
                city: e.currentTarget.city.value,
                state: e.currentTarget.state.value,
                postal_code: e.currentTarget.postal_code.value,
                country: e.currentTarget.country.value,
                phone: e.currentTarget.phone.value,
                is_default: e.currentTarget.is_default.checked,
              }); }}>
                <input
                  type="text"
                  name="full_name"
                  placeholder="Full Name"
                  defaultValue={selectedAddress?.full_name}
                  className="w-full p-2 mb-2 border rounded"
                  required
                />
                <input
                  type="text"
                  name="address_line1"
                  placeholder="Address Line 1"
                  defaultValue={selectedAddress?.address_line1}
                  className="w-full p-2 mb-2 border rounded"
                  required
                />
                <input
                  type="text"
                  name="address_line2"
                  placeholder="Address Line 2 (Optional)"
                  defaultValue={selectedAddress?.address_line2}
                  className="w-full p-2 mb-2 border rounded"
                />
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  defaultValue={selectedAddress?.city}
                  className="w-full p-2 mb-2 border rounded"
                  required
                />
                <input
                  type="text"
                  name="state"
                  placeholder="State/Province/Region (Optional)"
                  defaultValue={selectedAddress?.state}
                  className="w-full p-2 mb-2 border rounded"
                />
                <input
                  type="text"
                  name="postal_code"
                  placeholder="Postal Code"
                  defaultValue={selectedAddress?.postal_code}
                  className="w-full p-2 mb-2 border rounded"
                  required
                />
                <input
                  type="text"
                  name="country"
                  placeholder="Country"
                  defaultValue={selectedAddress?.country}
                  className="w-full p-2 mb-2 border rounded"
                  required
                />
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone (Optional)"
                  defaultValue={selectedAddress?.phone}
                  className="w-full p-2 mb-2 border rounded"
                />
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_default"
                    defaultChecked={selectedAddress?.is_default}
                    className="mr-2"
                  />
                  Set as default
                </label>
                <Button type="submit" className="mt-4 bg-red-500 text-white w-full">
                  {selectedAddress ? 'Update Address' : 'Save Address'}
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
        {addresses.map((address) => (
          <div key={address.id} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-start">
              <div>
                <p>{address.full_name}</p>
                <p>{address.address_line1}</p>
                {address.address_line2 && <p>{address.address_line2}</p>}
                <p>{address.city}, {address.state}, {address.postal_code}</p>
                <p>{address.country}</p>
                {address.phone && <p>Phone: {address.phone}</p>}
                {address.is_default && <p className="text-green-500">Default</p>}
              </div>
              <div className="space-x-2">
                <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                  <DrawerTrigger asChild>
                    <Button variant="ghost" onClick={() => {
                      setSelectedAddress(address);
                      setIsDrawerOpen(true);
                    }}>
                      <FaEdit />
                    </Button>
                  </DrawerTrigger>
                </Drawer>
                <Button variant="ghost" onClick={() => handleDeleteAddress(address.id)}>
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

export default ShippingAddressScreen;