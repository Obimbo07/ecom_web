import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa'; // For star ratings
import { useAuth } from '@/context/AuthContext';
import { getUserReviews } from '@/lib/supabase';

// Define Review interface based on Supabase schema
interface Review {
    id: number;
    user_id: string;
    product_id: number;
    rating: number;
    comment: string | null;
    created_at: string;
    updated_at: string;
    is_verified: boolean;
    product?: {
        id: number;
        title: string;
        slug: string | null;
        image: string | null;
    };
}


const Reviews = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/signin');
            return;
        }
        fetchReviews();
    }, [user, navigate]);

    const fetchReviews = async () => {
        if (!user) return;
        
        try {
            setLoading(true);
            setError('');
            const reviewsData = await getUserReviews(user.id);
            setReviews(reviewsData || []);
        } catch (err: any) {
            console.error('Error fetching reviews:', err);
            setError(err.message || 'Failed to fetch reviews. Please try again later.');
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string | number | Date) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, index) => (
            <FaStar
                key={index}
                className={index < rating ? 'text-yellow-400' : 'text-gray-300'}
            />
        ));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-4">
                <div className="text-center py-10">
                    <p className="text-gray-600">Loading reviews...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 p-4">
                <div className="text-center py-10">
                    <p className="text-red-500">{error}</p>
                    <button
                        onClick={fetchReviews}
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <h2 className="text-2xl font-semibold mb-4">My Product Reviews</h2>
            {reviews.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <p className="text-gray-600">You haven't written any reviews yet.</p>
                    <button
                        onClick={() => navigate('/products')}
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Shop Products
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div
                            key={review.id}
                            className="bg-white rounded-lg shadow-md p-4"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    {review.product && (
                                        <div className="flex items-center gap-4 mb-3">
                                            {review.product.image && (
                                                <img 
                                                    src={review.product.image} 
                                                    alt={review.product.title}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                            )}
                                            <h3 className="text-lg font-semibold">
                                                {review.product.title}
                                            </h3>
                                        </div>
                                    )}
                                    {!review.product && (
                                        <h3 className="text-lg font-semibold mb-3">
                                            Product ID: {review.product_id}
                                        </h3>
                                    )}
                                    <div className="flex items-center mt-1">
                                        {renderStars(review.rating)}
                                        <span className="ml-2 text-gray-600">
                                            {review.rating}/5
                                        </span>
                                    </div>
                                    {review.comment && (
                                        <p className="mt-2 text-gray-700">
                                            {review.comment}
                                        </p>
                                    )}
                                    <p className="mt-2 text-sm text-gray-500">
                                        Created: {formatDate(review.created_at)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Updated: {formatDate(review.updated_at)}
                                    </p>
                                    <p
                                        className={`mt-1 text-sm ${
                                            review.is_verified
                                                ? 'text-green-500'
                                                : 'text-orange-500'
                                        }`}
                                    >
                                        {review.is_verified
                                            ? 'Verified Purchase'
                                            : 'Not Verified'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Reviews;