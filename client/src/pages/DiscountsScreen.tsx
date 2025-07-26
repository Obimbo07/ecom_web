import React, { useEffect, useState } from 'react';
import api from '@/api';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import ProductCard from '@/components/products/ProductsCard';

// Define interfaces (same as ProductCard)
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

const DiscountsScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiscountedProducts = async () => {
      try {
        setLoading(true);
        // Fetch all products
        const response = await api.get('/api/products/');
        const allProducts: Product[] = response.data as Product[];

        // Filter products with discounts
        const discountedProducts = allProducts.filter((product) => {
          const hasRegularDiscount = product.old_price > product.price;
          const hasHolidayDiscount = !!product.holiday_deals;
          return hasRegularDiscount || hasHolidayDiscount;
        });

        setProducts(discountedProducts);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    fetchDiscountedProducts();
  }, []);

  if (loading) return <div className="text-center py-10">Loading discounted products...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (products.length === 0) return <div className="text-center py-10">No discounted products available</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6">Discounted Products</h1>
      {/* Carousel Layout */}
      <Carousel className="w-full max-w-4xl mx-auto">
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
    </div>
  );
};

export default DiscountsScreen;