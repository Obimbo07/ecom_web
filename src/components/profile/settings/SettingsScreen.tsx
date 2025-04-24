import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FaUserAlt } from 'react-icons/fa';
import api from '@/api';
import { useAuth } from '@/context/AuthContext';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  bio: string;
  profile: {
    image: string | null;
    full_name: string;
    bio: string;
    phone: number | null;
    verified: boolean;
  };
}

const SettingsScreen = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    bio: '',
    profile: {
      full_name: '',
      bio: '',
      phone: '',
      image: null as File | null,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageError, setImageError] = useState(false); // New state to track image load failure
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
    fetchProfile();
  }, [isAuthenticated, navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('users/me/');
      setUser(response.data);
      setFormData({
        email: response.data.email,
        bio: response.data.bio || '',
        profile: {
          full_name: response.data.profile.full_name || '',
          bio: response.data.profile.bio || '',
          phone: response.data.profile.phone || '',
          image: null,
        },
      });
      setImageError(false); // Reset image error state on successful fetch
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch profile data.');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath: string | null): string | undefined => {
    if (!imagePath) return undefined;
    if (imagePath.startsWith('http')) return imagePath;
    return `${import.meta.env.VITE_API_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('profile.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        profile: { ...prev.profile, [field]: value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        profile: { ...prev.profile, image: e.target.files![0] },
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = new FormData();
      data.append('email', formData.email);
      data.append('bio', formData.bio);
      data.append('profile.full_name', formData.profile.full_name);
      data.append('profile.bio', formData.profile.bio);
      data.append('profile.phone', formData.profile.phone);
      if (formData.profile.image) {
        console.log('Image file:', formData.profile.image); // Debugging line
        data.append('profile.image', formData.profile.image);
      }

      const response = await api.put('users/me/update/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser(response.data);
      setSuccess('Profile updated successfully!');
      setImageError(false); // Reset image error on successful update
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-semibold mb-4">Settings</h2>
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gray-300 rounded-full overflow-hidden">
            {user?.profile.image && !imageError ? (
              <img
                src={getImageUrl(user.profile.image)}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={() => setImageError(true)} // Set error state if image fails to load
              />
            ) : (
              <FaUserAlt className="w-16 h-16 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold">{user?.username || 'Loading...'}</h3>
            <p className="text-gray-600">{user?.email || 'No email'}</p>
          </div>
        </div>

        {success && <p className="text-green-500 mb-4">{success}</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">User Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-gray-700">Full Name</label>
            <input
              type="text"
              name="profile.full_name"
              value={formData.profile.full_name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">Profile Bio</label>
            <textarea
              name="profile.bio"
              value={formData.profile.bio}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-gray-700">Phone</label>
            <input
              type="tel"
              name="profile.phone"
              value={formData.profile.phone}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">Profile Image</label>
            <input
              type="file"
              name="profile.image"
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
              accept="image/*"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-red-500 text-white"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SettingsScreen;