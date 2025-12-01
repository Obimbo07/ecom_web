import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeCarousel from '@/components/carousel/HomeCarousel';
import ProductsCarousel from '@/components/products/ProductsCarousel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCategories, getActiveHolidayDeals } from '@/lib/supabase';
import AdvertCarousel from '@/components/carousel/AdvertCarousel';

interface Category {
  id: number;
  title: string;
  image: string | null;
  slug: string | null;
}

interface HolidayDeal {
  id: number;
  name: string;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  slug: string | null;
  banner_image: string | null;
}

const Home = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [deals, setDeals] = useState<HolidayDeal[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingDeals, setLoadingDeals] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    };

    const fetchDeals = async () => {
      try {
        setLoadingDeals(true);
        const data = await getActiveHolidayDeals();
        setDeals(data);
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Define static link and dynamic deal links
  const links = [
    { title: 'Best Discount', icon: 'v1036-06.jpg', url: '/discounts' },
    ...(deals.length > 0
      ? [
          { 
            title: deals[1]?.name || 'Holiday Deals', 
            icon: deals[1]?.banner_image || 'ramadhan_campaign.gif', 
            url: `/deals/${deals[1]?.slug || deals[1]?.id}` 
          },
          ...(deals.length > 1
            ? [{ 
                title: deals[0]?.name || 'Deals of the Day', 
                icon: deals[0]?.banner_image || 'DOD_2_cfa99cf6fa.avif', 
                url: `/deals/${deals[0]?.slug || deals[0]?.id}` 
              }]
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
              className="flex flex-col items-center w-full p-4 rounded-lg cursor-pointer hover:bg-gray-200 transition"
              onClick={() => navigate(link.url)}
            >
              <span className="text-3xl mb-2">
                <img 
                  src={link.icon} 
                  alt={link.title} 
                  className="w-full h-auto rounded-lg"
                  onError={(e) => {
                    // Fallback image if loading fails
                    e.currentTarget.src = '/placeholder-deal.png';
                  }}
                />
              </span>
              <p className="text-sm text-center font-medium">{link.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="my-6 px-4">
        <h2 className="text-xl font-semibold mb-4">New Arrivals</h2>
        <ProductsCarousel featured />
      </div>

      {/* Shop by Category */}
      <div className="my-6 px-4">
        <h2 className="text-xl font-semibold mb-4">Shop by Category</h2>
        <Tabs defaultValue={categories[0]?.id.toString() || 'all'} className="w-full">
          <TabsList className="flex justify-start space-x-2 mb-4 overflow-x-auto">
            <TabsTrigger value="all" className="px-4 py-2">All Products</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id.toString()}
                className="px-4 py-2 whitespace-nowrap"
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

      <div className="my-6 px-4">
        <AdvertCarousel />
      </div>

      <div className="my-6 px-4">
        <h2 className="text-xl font-semibold mb-4">Featured Products</h2>
        <ProductsCarousel featured />
      </div>

      <div className="my-6 px-4">
        <h2 className="text-xl font-semibold mb-4">All Products</h2>
        <ProductsCarousel />
      </div>
    </div>
  );
};

export default Home;