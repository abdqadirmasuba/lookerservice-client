export interface Provider {
  id: string;
  businessName: string;
  description: string;
  profileImage?: string;
  coverImage?: string;
  rating: number;
  reviewsCount: number;
  servicesOffered: Service[];
  location: {
    city: string;
    district: string;
    distance?: number;
  };
  contactInfo: {
    phone?: string;
    email?: string;
  };
  isVerified: boolean;
  isFeatured: boolean;
  createdAt: string;
}

// API response format for provider list
export interface ProviderListItem {
  id: string;
  business_name: string;
  business_description: string;
  address: string;
  city: string;
  average_rating: number;
  total_reviews: number;
  full_name: string;
  profile_picture_url: string | null;
  distance: number;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  priceType: 'fixed' | 'starting_from' | 'negotiable';
  category: {
    id: string;
    name: string;
  };
  duration?: number;
  providerId: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  photos?: string[];
  createdAt: string;
  bookingId?: string;
}

export interface SearchFilters {
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  distance?: number;
  rating?: number;
  availability?: 'today' | 'this_week' | 'any';
}

export interface ExploreFilters {
  search: string;
  categoryId: string | null;
  categoryName: string | null;
  serviceId: string | null;
  serviceName: string | null;
  location: string | null;
  sortBy: 'rating' | 'reviews' | 'distance' | null;
  latitude: number | null;
  longitude: number | null;
}

export interface ProviderGallery {
  id: string;
  imageUrl: string;
  caption?: string;
  createdAt: string;
}
