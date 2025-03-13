import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface Banner {
  image: string;
  title: string;
  buttonText: string;
  buttonLink: string;
}

// Sample banner data (replace with your actual images)
const banners: Banner[] = [
  {
    image: '/sales.jpg', // Replace with actual image URL
    title: 'FASHION SALE',
    buttonText: 'Check',
    buttonLink: '/shop',
  },
  {
    image: 'sales2.jpg',
    title: 'WINTER COLLECTION',
    buttonText: 'Explore',
    buttonLink: '/shop/winter',
  },
  {
    image: '/shirt-pic.jpg',
    title: 'SUMMER DEALS',
    buttonText: 'Shop Now',
    buttonLink: '/shop/summer',
  },
];

export function BannerCarousel() {
  return (
    <Carousel className="w-full h-90">
      <CarouselContent>
        {banners.map((banner, index) => (
          <CarouselItem key={index}>
            <div
              className="relative h-90 bg-cover bg-center"
              style={{ backgroundImage: `url(${banner.image})` }}
            >
              {/* Overlay for better text visibility */}
              <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white mb-4">{banner.title}</h2>
                  <a
                    href={banner.buttonLink}
                    className="inline-block bg-red-500 text-white py-2 px-6 rounded hover:bg-red-600 transition"
                  >
                    {banner.buttonText}
                  </a>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white rounded-full p-2 hover:bg-gray-700" />
      <CarouselNext className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white rounded-full p-2 hover:bg-gray-700" />
    </Carousel>
  );
}

export default BannerCarousel;