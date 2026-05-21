import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { api } from './api'; // Commented out to use dummy data

// --- DUMMY DATA ---

const dummyUser = {
  id: 'u1',
  name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '+1 234 567 8900',
  avatar: 'https://i.pravatar.cc/150?u=jane',
  wishlist: ['s1', 's2']
};

const dummyCategories = [
  { _id: '1', name: 'Hair', icon: 'content_cut', count: 120 },
  { _id: '2', name: 'Nails', icon: 'back_hand', count: 85 },
  { _id: '3', name: 'Facial', icon: 'face', count: 45 },
  { _id: '4', name: 'Makeup', icon: 'brush', count: 60 },
  { _id: '5', name: 'Massage', icon: 'spa', count: 30 },
  { _id: '6', name: 'Barber', icon: 'storefront', count: 55 }
];

const dummySalons = [
  {
    id: 's1',
    _id: 's1',
    name: 'Aura Prestige',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80',
    rating: 4.9,
    reviews: 128,
    distance: '0.8 km',
    address: '124 Elite Avenue, Beverly Hills',
    priceRange: '$120 - $350',
    tags: ['Luxury', 'Hair', 'Spa'],
    featured: true,
    services: [
      { _id: 'srv1', name: 'Signature Blowout', duration: '45 min', price: '$80', category: 'Hair' },
      { _id: 'srv2', name: 'Balayage Color', duration: '120 min', price: '$250', category: 'Hair' }
    ]
  },
  {
    id: 's2',
    _id: 's2',
    name: 'Lumiere Beauty',
    image: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&q=80',
    rating: 4.7,
    reviews: 84,
    distance: '1.2 km',
    address: '45 Sunset Blvd, Los Angeles',
    priceRange: '$80 - $200',
    tags: ['Nails', 'Facial'],
    featured: true,
    services: [
      { _id: 'srv3', name: 'Gel Manicure', duration: '60 min', price: '$50', category: 'Nails' },
      { _id: 'srv4', name: 'Hydrating Facial', duration: '60 min', price: '$120', category: 'Facial' }
    ]
  },
  {
    id: 's3',
    _id: 's3',
    name: 'The Barber Club',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80',
    rating: 4.8,
    reviews: 210,
    distance: '2.5 km',
    address: '88 Downtown Street, LA',
    priceRange: '$40 - $100',
    tags: ['Barber', 'Men'],
    featured: false,
    services: [
      { _id: 'srv5', name: 'Classic Haircut', duration: '30 min', price: '$40', category: 'Barber' },
      { _id: 'srv6', name: 'Beard Trim', duration: '20 min', price: '$25', category: 'Barber' }
    ]
  },
  {
    id: 's4',
    _id: 's4',
    name: 'Glow Studio',
    image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80',
    rating: 4.6,
    reviews: 95,
    distance: '3.1 km',
    address: '77 Melrose Ave, West Hollywood',
    priceRange: '$60 - $150',
    tags: ['Makeup', 'Hair'],
    featured: false,
    services: [
      { _id: 'srv7', name: 'Evening Makeup', duration: '60 min', price: '$90', category: 'Makeup' }
    ]
  }
];

const dummyBookings = [
  {
    _id: 'b1',
    id: 'b1',
    status: 'confirmed',
    date: '2024-05-25T10:00:00Z',
    salon: dummySalons[0],
    services: [dummySalons[0].services[0]],
    totalAmount: 80
  },
  {
    _id: 'b2',
    id: 'b2',
    status: 'completed',
    date: '2024-05-10T14:30:00Z',
    salon: dummySalons[1],
    services: [dummySalons[1].services[0]],
    totalAmount: 50
  }
];

const dummyWallet = {
  balance: 250.00,
  currency: 'USD',
  transactions: [
    { _id: 't1', date: '2024-05-20', type: 'credit', amount: 100, description: 'Cashback Reward' },
    { _id: 't2', date: '2024-05-15', type: 'debit', amount: 50, description: 'Booking at Lumiere Beauty' }
  ]
};

const dummyAdminStats = {
  totalUsers: 1250,
  totalSalons: 45,
  totalBookings: 8400,
  revenue: 125000
};

const dummyNotifications = [
  { _id: 'n1', title: 'Booking Confirmed', message: 'Your booking at Aura Prestige is confirmed for tomorrow at 10 AM.', date: new Date().toISOString(), read: false },
  { _id: 'n2', title: 'Wallet Top-up', message: 'You received a $10 cashback reward.', date: new Date(Date.now() - 86400000).toISOString(), read: true }
];

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Auth Hooks ---
export const useUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      await delay(500);
      return dummyUser;
    },
    retry: false,
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (credentials: any) => {
      await delay(800);
      localStorage.setItem('token', 'dummy-token');
      return { user: dummyUser, token: 'dummy-token' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userData: any) => {
      await delay(800);
      localStorage.setItem('token', 'dummy-token');
      return { user: dummyUser, token: 'dummy-token' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

// --- Salon Hooks ---
export const useSalons = (keyword = '') => {
  return useQuery({
    queryKey: ['salons', keyword],
    queryFn: async () => {
      await delay(500);
      if (keyword) {
        return dummySalons.filter(s => s.name.toLowerCase().includes(keyword.toLowerCase()));
      }
      return dummySalons;
    },
  });
};

export const useSalon = (id: string) => {
  return useQuery({
    queryKey: ['salon', id],
    queryFn: async () => {
      await delay(300);
      return dummySalons.find(s => s.id === id || s._id === id) || dummySalons[0];
    },
    enabled: !!id,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      await delay(400);
      return dummyCategories;
    },
  });
};

// --- Booking Hooks ---
export const useMyBookings = () => {
  return useQuery({
    queryKey: ['myBookings'],
    queryFn: async () => {
      await delay(600);
      return dummyBookings;
    },
  });
};

export const useCreateBooking = () => {
  return useMutation({
    mutationFn: async (bookingData: any) => {
      await delay(1000);
      return { success: true, message: 'Booking successful!' };
    },
  });
};

// --- Admin Hooks ---
export const useAdminStats = () => {
  return useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      await delay(500);
      return dummyAdminStats;
    },
  });
};

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      await delay(400);
      return dummyNotifications;
    },
  });
};

export const useWallet = () => {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      await delay(500);
      return dummyWallet;
    },
  });
};

export const useWishlist = () => {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      await delay(300);
      return [dummySalons[0], dummySalons[1]]; // Return actual salon objects for wishlist
    },
  });
};

export const useSalonOwnerStats = () => {
  return useQuery({
    queryKey: ['salonOwnerStats'],
    queryFn: async () => {
      await delay(500);
      return {
        totalRevenue: 4500,
        totalBookings: 85,
        newCustomers: 12,
        rating: 4.8
      };
    },
  });
};

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      await delay(500);
      return [dummyUser, { ...dummyUser, id: 'u2', name: 'John Smith', email: 'john@example.com' }];
    },
  });
};
