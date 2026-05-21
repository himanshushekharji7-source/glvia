import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';

// --- Auth Hooks ---
export const useUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await api.get('/auth/profile');
      return data;
    },
    retry: false,
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (credentials: any) => {
      const { data } = await api.post('/auth/login', credentials);
      localStorage.setItem('token', data.token);
      return data;
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
      const { data } = await api.post('/auth/register', userData);
      localStorage.setItem('token', data.token);
      return data;
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
      const { data } = await api.get(`/salons?keyword=${keyword}`);
      return data;
    },
  });
};

export const useSalon = (id: string) => {
  return useQuery({
    queryKey: ['salon', id],
    queryFn: async () => {
      const { data } = await api.get(`/salons/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data;
    },
  });
};

// --- Booking Hooks ---
export const useMyBookings = () => {
  return useQuery({
    queryKey: ['myBookings'],
    queryFn: async () => {
      const { data } = await api.get('/bookings/mybookings');
      return data;
    },
  });
};

export const useCreateBooking = () => {
  return useMutation({
    mutationFn: async (bookingData: any) => {
      const { data } = await api.post('/bookings', bookingData);
      return data;
    },
  });
};

// --- Admin Hooks ---
export const useAdminStats = () => {
  return useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/stats');
      return data;
    },
  });
};

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/notifications');
      return data;
    },
  });
};

export const useWallet = () => {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const { data } = await api.get('/payments/wallet');
      return data;
    },
  });
};

export const useWishlist = () => {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const { data } = await api.get('/auth/profile');
      return data.wishlist || [];
    },
  });
};

export const useSalonOwnerStats = () => {
  return useQuery({
    queryKey: ['salonOwnerStats'],
    queryFn: async () => {
      const { data } = await api.get('/salons/my-salon/stats');
      return data;
    },
  });
};

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const { data } = await api.get('/admin/users');
      return data;
    },
  });
};
