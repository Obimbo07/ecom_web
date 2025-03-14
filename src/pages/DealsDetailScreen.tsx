import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/api';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import ProductCard from '@/components/products/ProductsCard';

interface HolidayDeal {
  deal_id: string;
  name: string;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface Product {
  id: number;
  title: string;
  price: number;
  old_price: number;
  image: string | null;
  additional_images: { id: number; image: string | null; date: string }[];
  holiday_deals: HolidayDeal | null;
}

const DealDetailScreen: React.FC = () => {
  const { dealId } = useParams<{ dealId: string }>();
  const [deal, setDeal] = useState<HolidayDeal | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        setLoading(true);
        const dealResponse = await api.get(`/api/holiday-deals/${dealId}/`);
        const productsResponse = await api.get(`/api/holiday-deals/${dealId}/products/`);
        setDeal(dealResponse.data);
        setProducts(productsResponse.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to fetch deal details');
      } finally {
        setLoading(false);
      }
    };
    fetchDeal();
  }, [dealId]);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!deal) return <div className="text-center py-10">Deal not found</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">{deal.name}</h1>
      <p className="text-sm text-gray-600 mb-6">
        {deal.discount_percentage}% Off - Ends{' '}
        {new Date(deal.end_date).toLocaleDateString()}
      </p>
      {products.length === 0 ? (
        <div className="text-center py-4">No products in this deal</div>
      ) : (
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
      )}
    </div>
  );
};

export default DealDetailScreen;