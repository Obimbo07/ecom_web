import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/api';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import ProductCard from '@/components/products/ProductsCard';
// Define interfaces based on the ProductResponse and HolidayDeal structure

interface HolidayDeal {
  deal_id: string;
  name: string;
  discount_percentage: number;
  discounted_price: number;
  start_date: string;
  end_date: string;
}

interface Product {
  id: number;
  title: string;
  price: number;
  old_price: number;
  image: string | null;
  description: string;
  specifications: string | null;
  type: string;
  stock_count: string;
  life: string;
  additional_images: { id: number; image: string | null; date: string }[];
  holiday_deals: HolidayDeal | null;
}

const DealsScreen: React.FC = () => {
  const [deals, setDeals] = useState<HolidayDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/holiday-deals/');
        setDeals(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to fetch deals');
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  if (loading) return <div className="text-center py-10">Loading deals...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (deals.length === 0) return <div className="text-center py-10">No active deals available</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6">Holiday Deals</h1>
      {deals.map((deal) => (
        <div key={deal.deal_id} className="mb-8">
          {/* Deal Banner */}
          <div
            className="relative bg-blue-600 text-white p-6 rounded-lg mb-4 cursor-pointer"
            onClick={() => navigate(`/deals/${deal.deal_id}`)}
          >
            <h2 className="text-2xl font-semibold">{deal.name}</h2>
            <p className="text-sm">
              {deal.discount_percentage}% Off - Ends{' '}
              {new Date(deal.end_date).toLocaleDateString()}
            </p>
            <button className="mt-2 bg-red-500 text-white px-4 py-2 rounded-full">
              Explore Deal
            </button>
          </div>
          {/* Products Carousel for this Deal */}
          <DealProducts dealId={deal.deal_id} />
        </div>
      ))}
    </div>
  );
};

// Component to fetch and display products for a specific deal
const DealProducts: React.FC<{ dealId: string }> = ({ dealId }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDealProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/holiday-deals/${dealId}/products/`);
        setProducts(response.data);
      } catch (err) {
        console.error('Error fetching deal products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDealProducts();
  }, [dealId]);

  if (loading) return <div className="text-center py-4">Loading products...</div>;
  if (products.length === 0) return <div className="text-center py-4">No products in this deal</div>;

  return (
    <Carousel className="w-full max-w-4xl">
      <CarouselContent className="-ml-1">
        {products.map((product) => (
          <CarouselItem key={product.id} className="basis-1/2 md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <ProductCard product={product} />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white rounded-full p-2 hover:bg-gray-700" />
      <CarouselNext className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white rounded-full p-2 hover:bg-gray-700" />
    </Carousel>
  );
};

export default DealsScreen;