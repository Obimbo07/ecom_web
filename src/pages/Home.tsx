import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import HomeCarousel from '@/components/carousel/HomeCarousel';
import ProductsCarousel from '@/components/products/ProductsCarousel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/api';

interface Category {
  id: number;
  title: string;
  image: string | null;
}

interface HolidayDeal {
  deal_id: string;
  name: string;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [deals, setDeals] = useState<HolidayDeal[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingDeals, setLoadingDeals] = useState(true);
  const navigate = useNavigate();

  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await api.get('/api/categories/');
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    };

    const fetchDeals = async () => {
      try {
        setLoadingDeals(true);
        const response = await api.get('/api/holiday-deals/');
        setDeals(response.data);
      } catch (err) {
        console.error('Error fetching deals:', err);
      } finally {
        setLoadingDeals(false);
      }
    };

    fetchCategories();
    fetchDeals();
  }, []);

  if (loadingCategories || loadingDeals) {
    return <div className="text-center py-10">Loading...</div>;
  }

  // Define static link and dynamic deal links
  const links = [
    { title: 'Best Discount', icon: 'v1036-06.jpg', url: '/discounts' },
    ...(deals.length > 0
      ? [
          { title: deals[1]?.name || 'Ramadhan Kareem', icon: 'ramadhan_campaign.gif', url: `/deals/${deals[1]?.deal_id}` },
          ...(deals.length > 1
            ? [{ title: deals[0]?.name || 'Deals of the Day', icon: 'DOD_2_cfa99cf6fa.avif', url: `/deals/${deals[0]?.deal_id}` }]
            : [])
        ]
      : [])
  ];

  return (
    <div className="bg-gray-100">
      {/* Main Carousel */}
      <HomeCarousel />

      {/* Deals Section */}
      <div className="my-6 px-4">
        <div className="grid grid-cols-3 gap-4">
          {links.map((link, index) => (
            <div
              key={index}
              className="flex flex-col items-center w-full p-4 rounded-lg cursor-pointer"
              onClick={() => navigate(link.url)}
            >
              <span className="text-3xl mb-2">
                <img src={link.icon} alt={link.title} className="w-full h-auto" />
              </span>
              <p className="text-sm text-center">{link.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="my-6 px-4">
        <h2 className="text-xl font-semibold mb-4">Featured Products</h2>
        <ProductsCarousel />
      </div>

      {/* Shop by Category */}
      <div className="my-6 px-4">
        <h2 className="text-xl font-semibold mb-4">Shop by Category</h2>
        <Tabs defaultValue={categories[0]?.id.toString() || 'all'} className="w-full">
          <TabsList className="flex justify-start space-x-2 mb-4">
            <TabsTrigger value="all" className="px-4 py-2">All Products</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id.toString()}
                className="px-4 py-2"
              >
                {category.title}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="all">
            <ProductsCarousel />
          </TabsContent>
          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id.toString()}>
              <ProductsCarousel categoryId={category.id} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Home;