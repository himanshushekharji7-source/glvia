import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, TABLES } from './supabase';

// --- No dummy data fallback allowed ---

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Auth Hooks ---
export const useUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      if (typeof window === "undefined") return null;
      const firebaseUid = localStorage.getItem("token");
      if (!firebaseUid) return null;
      
      try {
        const { data, error } = await supabase
          .from(TABLES.USERS)
          .select("*")
          .eq("firebase_uid", firebaseUid)
          .single();
        if (data && !error) {
           return data;
        }
      } catch (e) {
        console.error("Failed to fetch user from Supabase", e);
      }
      return null;
    },
    retry: false,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: any) => {
      const firebaseUid = localStorage.getItem("token");
      if (!firebaseUid) throw new Error("No user logged in");
      
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .update(updates)
        .eq("firebase_uid", firebaseUid)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useMembershipPlans = () => {
  return useQuery({
    queryKey: ['membershipPlans'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from(TABLES.MEMBERSHIP_PLANS)
          .select('*')
          .order('sort_order', { ascending: true });
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error("Error fetching memberships", err);
        return [];
      }
    }
  });
};

export const usePurchaseMembership = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (plan: any) => {
      const firebaseUid = localStorage.getItem("token");
      if (!firebaseUid) throw new Error("No user logged in");
      
      const startDate = new Date();
      // Calculate expiry based on duration string (e.g., "12 Months")
      const expiryDate = new Date();
      const months = parseInt(plan.duration) || 12; // default to 12 if parsing fails
      expiryDate.setMonth(startDate.getMonth() + months);

      const updates = {
        active_membership_id: plan.id,
        membership_start_date: startDate.toISOString(),
        membership_expiry_date: expiryDate.toISOString(),
        membership_status: 'active'
      };
      
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .update(updates)
        .eq("firebase_uid", firebaseUid)
        .select()
        .single();
        
      if (error) throw error;
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
      try {
        const { data: dbSalons, error } = await supabase
          .from(TABLES.SALONS)
          .select('*')
          .eq('status', 'approved');
        
        if (error) throw error;
        
        if (dbSalons && dbSalons.length > 0) {
          let mapped = dbSalons.map(s => ({
            id: s.id,
            _id: s.id,
            name: s.name,
            images: s.images && s.images.length > 0 ? s.images : ['https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80'],
            rating: Number(s.rating) || 4.5,
            totalReviews: s.total_reviews || 0,
            distance: s.distance || '1.0 km',
            address: { street: s.address_street || '', city: s.address_city || '', state: s.address_state || '' },
            priceRange: s.price_range || '₹99 - ₹2999',
            tags: s.tags || ['Unisex'],
            description: s.description || '',
            featured: s.featured || false,
            contactPhone: s.contact_phone || '',
            contactEmail: s.contact_email || '',
          }));

          if (keyword) {
            const lowerKeyword = keyword.toLowerCase();
            mapped = mapped.filter(s => 
              s.name.toLowerCase().includes(lowerKeyword) ||
              s.tags.some((tag: any) => tag.toLowerCase().includes(lowerKeyword)) ||
              s.description.toLowerCase().includes(lowerKeyword)
            );
          }
          return mapped;
        }
        return [];
      } catch (err) {
        console.error("Error fetching salons from Supabase:", err);
        return [];
      }
    },
  });
};

export const useSalon = (id: string) => {
  return useQuery({
    queryKey: ['salon', id],
    queryFn: async () => {
      try {
        const { data: dbSalon, error: salonErr } = await supabase
          .from(TABLES.SALONS)
          .select('*')
          .eq('id', id)
          .single();

        if (salonErr) throw salonErr;

        if (dbSalon) {
          // Fetch categories and services for this salon
          const { data: dbCats } = await supabase
            .from(TABLES.SALON_CATEGORIES)
            .select('*')
            .eq('salon_id', id)
            .order('sort_order', { ascending: true });

          const { data: dbSvcs } = await supabase
            .from(TABLES.SALON_SERVICES)
            .select('*')
            .eq('salon_id', id)
            .order('sort_order', { ascending: true });

          const maleServiceCategories = dbCats ? dbCats.filter(c => c.gender === 'male').map(c => ({ name: c.name, image: c.image })) : [];
          const femaleServiceCategories = dbCats ? dbCats.filter(c => c.gender === 'female').map(c => ({ name: c.name, image: c.image })) : [];

          const maleServices = dbSvcs ? dbSvcs.filter(s => s.gender === 'male').map(s => ({
            _id: s.id,
            id: s.id,
            name: s.name,
            duration: s.duration || '30',
            price: Number(s.price),
            oldPrice: s.old_price ? Number(s.old_price) : undefined,
            category: s.category,
            image: s.image,
            description: s.description || ''
          })) : [];

          const femaleServices = dbSvcs ? dbSvcs.filter(s => s.gender === 'female').map(s => ({
            _id: s.id,
            id: s.id,
            name: s.name,
            duration: s.duration || '30',
            price: Number(s.price),
            oldPrice: s.old_price ? Number(s.old_price) : undefined,
            category: s.category,
            image: s.image,
            description: s.description || ''
          })) : [];

          // Merge services for backward compatibility
          const allServices = [...maleServices, ...femaleServices];

          return {
            id: dbSalon.id,
            _id: dbSalon.id,
            name: dbSalon.name,
            images: dbSalon.images && dbSalon.images.length > 0 ? dbSalon.images : ['https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80'],
            rating: Number(dbSalon.rating) || 4.5,
            totalReviews: dbSalon.total_reviews || 0,
            distance: dbSalon.distance || '1.0 km',
            address: { street: dbSalon.address_street || '', city: dbSalon.address_city || '', state: dbSalon.address_state || '' },
            address_street: dbSalon.address_street || '',
            address_city: dbSalon.address_city || '',
            address_state: dbSalon.address_state || '',
            timings: dbSalon.timings || '',
            facilities: dbSalon.facilities || [],
            google_map_url: dbSalon.google_map_url || '',
            priceRange: dbSalon.price_range || '₹99 - ₹2999',
            tags: dbSalon.tags || ['Unisex'],
            description: dbSalon.description || '',
            featured: dbSalon.featured || false,
            contactPhone: dbSalon.contact_phone || '',
            contactEmail: dbSalon.contact_email || '',
            is_active: !!dbSalon.is_active,
            status: dbSalon.status || 'pending',
            total_reviews: dbSalon.total_reviews || 0,
            maleServiceCategories,
            femaleServiceCategories,
            maleServices,
            femaleServices,
            services: allServices,
            openingHours: [{ day: 'Monday', open: '9:00 AM', close: '8:00 PM' }]
          };
        }
      } catch (err) {
        console.error(`Error fetching salon ${id} from Supabase:`, err);
      }
      return null;
    },
    enabled: !!id,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const { data: dbCats, error } = await supabase
          .from(TABLES.CATEGORIES)
          .select('*')
          .order('sort_order', { ascending: true });

        if (error) throw error;

        if (dbCats && dbCats.length > 0) {
          return dbCats.map(c => ({
            _id: c.id,
            id: c.id,
            name: c.name,
            slug: c.slug,
            icon: c.icon || 'spa',
            count: 0
          }));
        }
      } catch (err) {
        console.error("Error fetching categories from Supabase:", err);
      }
      return [];
    },
  });
};

// --- Booking Hooks ---
export const useMyBookings = (salonId?: string, isSuperAdmin = false) => {
  return useQuery({
    queryKey: ['myBookings', salonId, isSuperAdmin],
    queryFn: async () => {
      try {
        const firebaseUid = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        let query = supabase
          .from(TABLES.BOOKINGS)
          .select('*, salons(id, name, images, address_street, address_city)')
          .order('created_at', { ascending: false });
          
        if (salonId) {
          query = query.eq('salon_id', salonId);
        } else if (isSuperAdmin) {
          // Fetch all bookings for super admin!
        } else if (firebaseUid) {
          query = query.eq('firebase_uid', firebaseUid);
        }

        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map((b: any) => ({
          id: b.id,
          _id: b.id,
          salonId: b.salons ? { _id: b.salons.id, name: b.salons.name, images: b.salons.images, address: b.salons.address_street } : b.salon_id,
          bookingReference: b.booking_reference,
          customerName: b.customer_name,
          customerPhone: b.customer_phone,
          services: b.services || [],
          totalAmount: b.total_amount,
          date: b.date,
          timeSlot: b.time_slot,
          paymentMethod: b.payment_method,
          status: b.status,
          createdAt: b.created_at,
        }));
      } catch (err) {
        console.error('Error fetching bookings:', err);
        return [];
      }
    },
    refetchInterval: 10000,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingData: any) => {
      try {
        // Build services array with names for JSONB storage
        const services = bookingData.services.map((svcId: string, idx: number) => ({
          id: svcId,
          name: bookingData.serviceNames?.[idx] || 'Service',
          price: 0,
          duration: '30',
        }));

        const firebaseUid = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const refId = '#GLV-' + Math.floor(100000 + Math.random() * 900000);

        const { data, error } = await supabase
          .from(TABLES.BOOKINGS)
          .insert({
            salon_id: bookingData.salonId,
            firebase_uid: firebaseUid,
            booking_reference: refId,
            customer_name: bookingData.customerName || 'Guest',
            customer_phone: bookingData.customerPhone || '',
            customer_email: bookingData.customerEmail || '',
            services: services,
            total_amount: bookingData.totalAmount,
            date: bookingData.date,
            time_slot: bookingData.timeSlot,
            payment_method: bookingData.paymentMethod || 'Pay at Salon',
            status: 'confirmed',
          })
          .select()
          .single();

        if (error) throw error;
        return { success: true, message: 'Booking successful!', booking: data };
      } catch (err: any) {
        console.error('Booking insert failed:', err);
        throw new Error(err.message || 'Booking failed');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      queryClient.invalidateQueries({ queryKey: ['salonOwnerStats'] });
    }
  });
};

export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from(TABLES.BOOKINGS)
        .update({ status })
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      queryClient.invalidateQueries({ queryKey: ['salonOwnerStats'] });
      queryClient.invalidateQueries({ queryKey: ['bookingDetails'] });
    },
  });
};

export const useBookingDetails = (id: string) => {
  return useQuery({
    queryKey: ['bookingDetails', id],
    queryFn: async () => {
      if (!id) return null;
      const firebaseUid = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      
      const { data, error } = await supabase
        .from(TABLES.BOOKINGS)
        .select('*, salons(id, name, images, address_street, address_city, contact_phone)')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      // Basic security check: if it belongs to someone else, reject unless user is owner (simplified)
      if (data.firebase_uid && firebaseUid && data.firebase_uid !== firebaseUid) {
        throw new Error("Unauthorized");
      }
      
      return data;
    },
    enabled: !!id,
  });
};

export const useRescheduleBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, date, timeSlot }: { id: string; date: string; timeSlot: string }) => {
      const { error } = await supabase
        .from(TABLES.BOOKINGS)
        .update({ date, time_slot: timeSlot })
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookingDetails'] });
      queryClient.invalidateQueries({ queryKey: ['salonOwnerStats'] });
    },
  });
};

// --- Admin Hooks ---
export const useAdminStats = () => {
  return useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      try {
        const [usersCountRes, adminsCountRes, salonsCountRes, bookingsRes, salonsRes] = await Promise.all([
          supabase.from(TABLES.USERS).select('id', { count: 'exact', head: true }),
          supabase.from(TABLES.ADMIN_USERS).select('id', { count: 'exact', head: true }),
          supabase.from(TABLES.SALONS).select('id', { count: 'exact', head: true }).eq('status', 'approved'),
          supabase.from(TABLES.BOOKINGS).select('total_amount, status, salon_id, salons(name, rating, total_reviews)'),
          supabase.from(TABLES.SALONS).select('id, name, rating, total_reviews')
        ]);

        const totalCustomers = usersCountRes.count || 0;
        const totalAdmins = adminsCountRes.count || 0;
        const totalUsers = totalCustomers + totalAdmins;

        const activeSalons = salonsCountRes.count || 0;

        const bookings = bookingsRes.data || [];
        const totalBookings = bookings.length;

        const totalRevenue = bookings
          .filter((b: any) => b.status !== 'cancelled')
          .reduce((sum: number, b: any) => sum + Number(b.total_amount || 0), 0);

        const salonStatsMap: { [key: string]: { name: string; bookings: number; rating: number; revenue: number } } = {};
        
        const salonsList = salonsRes.data || [];
        salonsList.forEach(s => {
          salonStatsMap[s.id] = {
            name: s.name,
            bookings: 0,
            rating: Number(s.rating) || 4.5,
            revenue: 0
          };
        });

        bookings.forEach((b: any) => {
          const salonId = b.salon_id;
          if (salonId) {
            if (!salonStatsMap[salonId]) {
              const salonName = b.salons?.name || 'Unknown Salon';
              salonStatsMap[salonId] = {
                name: salonName,
                bookings: 0,
                rating: Number(b.salons?.rating) || 4.5,
                revenue: 0
              };
            }
            salonStatsMap[salonId].bookings += 1;
            if (b.status !== 'cancelled') {
              salonStatsMap[salonId].revenue += Number(b.total_amount || 0);
            }
          }
        });

        const topSalons = Object.values(salonStatsMap)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 3);

        return {
          totalUsers,
          activeSalons,
          totalBookings,
          totalRevenue,
          topSalons
        };
      } catch (err) {
        console.error("Error fetching admin stats from database:", err);
        return {
          totalUsers: 0,
          activeSalons: 0,
          totalBookings: 0,
          totalRevenue: 0,
          topSalons: []
        };
      }
    },
  });
};

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      return [];
    },
  });
};

export const useWallet = () => {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      await delay(500);
      return { balance: 0, cashback: 0, transactions: [] };
    },
  });
};

export const useWishlist = () => {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      await delay(300);
      return [];
    },
  });
};

export const useSalonOwnerStats = (salonId?: string) => {
  return useQuery({
    queryKey: ['salonOwnerStats', salonId],
    queryFn: async () => {
      if (!salonId) {
        return { dailyRevenue: 0, totalRevenue: 0, totalBookings: 0, activeStaff: 0, cancellationRate: '0%', recentBookings: [] };
      }
      try {
        const today = new Date().toISOString().split('T')[0];
        const [bookingsRes, staffRes] = await Promise.all([
          supabase.from(TABLES.BOOKINGS).select('*').eq('salon_id', salonId).order('created_at', { ascending: false }),
          supabase.from(TABLES.STAFF).select('*').eq('salon_id', salonId),
        ]);

        const bookings = bookingsRes.data || [];
        const staff = staffRes.data || [];

        const totalBookings = bookings.length;
        const cancelledCount = bookings.filter((b: any) => b.status === 'cancelled').length;
        const cancellationRate = totalBookings > 0 ? `${((cancelledCount / totalBookings) * 100).toFixed(1)}%` : '0%';
        const totalRevenue = bookings
          .filter((b: any) => b.status !== 'cancelled')
          .reduce((sum: number, b: any) => sum + Number(b.total_amount || 0), 0);
        const dailyRevenue = bookings
          .filter((b: any) => b.date === today && b.status !== 'cancelled')
          .reduce((sum: number, b: any) => sum + Number(b.total_amount || 0), 0);
        const activeStaff = staff.filter((s: any) => s.is_available).length;
        const recentBookings = bookings.slice(0, 8).map((b: any) => ({
          id: b.id,
          customerName: b.customer_name,
          services: b.services || [],
          timeSlot: b.time_slot,
          date: b.date,
          totalAmount: b.total_amount,
          status: b.status,
          paymentMethod: b.payment_method,
        }));

        return { dailyRevenue, totalRevenue, totalBookings, activeStaff, cancellationRate, recentBookings };
      } catch (err) {
        console.error('Error fetching salon owner stats:', err);
        return { dailyRevenue: 0, totalRevenue: 0, totalBookings: 0, activeStaff: 0, cancellationRate: '0%', recentBookings: [] };
      }
    },
    refetchInterval: 5000,
    enabled: !!salonId,
  });
};

// --- Staff Hooks ---
export const useSalonStaff = (salonId?: string) => {
  return useQuery({
    queryKey: ['salonStaff', salonId],
    queryFn: async () => {
      if (!salonId) return [];
      const { data, error } = await supabase
        .from(TABLES.STAFF)
        .select('*')
        .eq('salon_id', salonId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!salonId,
    refetchInterval: 10000,
  });
};

export const useAddStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (staffData: { salon_id: string; name: string; role: string }) => {
      const { data, error } = await supabase.from(TABLES.STAFF).insert(staffData).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['salonStaff', vars.salon_id] });
      queryClient.invalidateQueries({ queryKey: ['salonOwnerStats'] });
    },
  });
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, salon_id, ...updates }: { id: string; salon_id: string; name?: string; role?: string; is_available?: boolean }) => {
      const { error } = await supabase.from(TABLES.STAFF).update(updates).eq('id', id);
      if (error) throw error;
      return { id, salon_id };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['salonStaff', result.salon_id] });
      queryClient.invalidateQueries({ queryKey: ['salonOwnerStats'] });
    },
  });
};

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, salon_id }: { id: string; salon_id: string }) => {
      const { error } = await supabase.from(TABLES.STAFF).delete().eq('id', id);
      if (error) throw error;
      return { salon_id };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['salonStaff', result.salon_id] });
      queryClient.invalidateQueries({ queryKey: ['salonOwnerStats'] });
    },
  });
};

// --- Salon Service Management Hooks ---
export const useAddService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (serviceData: {
      salon_id: string; name: string; description?: string;
      price: number; old_price?: number; duration?: string;
      category: string; gender: string; image: string;
      products_used?: string;
    }) => {
      const { data, error } = await supabase.from(TABLES.SALON_SERVICES).insert(serviceData).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['salon', vars.salon_id] });
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, salon_id, ...updates }: any) => {
      const { error } = await supabase.from(TABLES.SALON_SERVICES).update(updates).eq('id', id);
      if (error) throw error;
      return { id, salon_id };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['salon', result.salon_id] });
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, salon_id }: { id: string; salon_id: string }) => {
      const { error } = await supabase.from(TABLES.SALON_SERVICES).delete().eq('id', id);
      if (error) throw error;
      return { salon_id };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['salon', result.salon_id] });
    },
  });
};

export const useSalonServices = (salonId?: string) => {
  return useQuery({
    queryKey: ['salonServicesOwner', salonId],
    queryFn: async () => {
      if (!salonId) return [];
      const { data, error } = await supabase
        .from(TABLES.SALON_SERVICES)
        .select('*')
        .eq('salon_id', salonId)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!salonId,
  });
};

// --- Salon Profile Update Hook ---
export const useUpdateSalonProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { error } = await supabase.from(TABLES.SALONS).update(updates).eq('id', id);
      if (error) throw error;
      return { id };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['salon', result.id] });
      queryClient.invalidateQueries({ queryKey: ['salons'] });
    },
  });
};

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      try {
        const [usersRes, adminUsersRes] = await Promise.all([
          supabase.from(TABLES.USERS).select('*'),
          supabase.from(TABLES.ADMIN_USERS).select('*')
        ]);

        const mappedUsers = (usersRes.data || []).map((u: any) => ({
          _id: u.id,
          id: u.id,
          firstName: u.first_name || 'Customer',
          lastName: u.last_name || '',
          email: u.email,
          phoneNumber: u.phone_number || '',
          role: 'customer',
          walletBalance: Number(u.wallet_balance) || 0,
          createdAt: u.created_at || new Date().toISOString(),
        }));

        const mappedAdminUsers = (adminUsersRes.data || []).map((au: any) => {
          const names = (au.name || 'Admin User').trim().split(/\s+/);
          const firstName = names[0];
          const lastName = names.slice(1).join(' ');
          
          return {
            _id: au.id,
            id: au.id,
            firstName: firstName,
            lastName: lastName,
            email: au.email,
            phoneNumber: '',
            role: au.role,
            walletBalance: 0,
            createdAt: au.created_at || new Date().toISOString(),
          };
        });

        return [...mappedUsers, ...mappedAdminUsers];
      } catch (err) {
        console.error("Error fetching admin users from database:", err);
        return [];
      }
    },
  });
};

// --- Salon Reviews and Ratings Ecosystem Hooks ---
export const useSalonReviews = (salonId?: string) => {
  return useQuery({
    queryKey: ['salonReviews', salonId],
    queryFn: async () => {
      if (!salonId) return [];
      try {
        // Mode A: Query the new verified salon_reviews table (Filter by 'approved' status only - Correction 1 & 4)
        const { data, error } = await supabase
          .from('salon_reviews')
          .select('*, customer:users(first_name, last_name, avatar_url), service:salon_services(name)')
          .eq('salon_id', salonId)
          .eq('status', 'approved')
          .order('created_at', { ascending: false });

        if (error) {
          console.error("salon_reviews table is not available yet, raising unavailable flag:", error);
          const res = [] as any;
          res.isUnavailable = true;
          return res;
        }

        return (data || []).map((r: any) => ({
          id: r.id,
          bookingId: r.booking_id,
          salonId: r.salon_id,
          customerId: r.customer_id,
          serviceName: r.service?.name || "Salon Service",
          rating: Number(r.rating) || 5,
          reviewText: r.review_text || "",
          images: r.images || [],
          ownerReply: r.owner_reply || null,
          status: r.status || "approved",
          isVerifiedBooking: !!r.is_verified_booking,
          customerName: r.customer ? `${r.customer.first_name || ""} ${r.customer.last_name || ""}`.trim() || "Verified Client" : "Verified Client",
          createdAt: r.created_at || new Date().toISOString()
        }));
      } catch (err) {
        console.error("Error fetching salon reviews:", err);
        const res = [] as any;
        res.isUnavailable = true;
        return res;
      }
    },
    enabled: !!salonId,
  });
};

export const useSubmitReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reviewData: {
      booking_id: string;
      salon_id: string;
      customer_id?: string;
      service_id?: string | null;
      rating: number;
      review_text: string;
      images?: string[];
      is_verified_booking?: boolean;
    }) => {
      try {
        // Enforce Correction 1: Insert status as 'pending'
        const { data, error } = await supabase
          .from('salon_reviews')
          .insert({
            booking_id: reviewData.booking_id,
            salon_id: reviewData.salon_id,
            customer_id: reviewData.customer_id || null,
            service_id: reviewData.service_id || null,
            rating: reviewData.rating,
            review_text: reviewData.review_text,
            images: reviewData.images || [],
            status: 'pending',
            is_verified_booking: reviewData.is_verified_booking !== false
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err: any) {
        console.error("Review submission failed:", err);
        throw err;
      }
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['salonReviews', vars.salon_id] });
      queryClient.invalidateQueries({ queryKey: ['salon', vars.salon_id] });
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      queryClient.invalidateQueries({ queryKey: ['salonOwnerStats'] });
      queryClient.invalidateQueries({ queryKey: ['reviewsModeration', vars.salon_id] });
    }
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, salon_id, ...updates }: { id: string; salon_id: string; rating?: number; review_text?: string; images?: string[] }) => {
      try {
        // When a user updates a review, reset status to 'pending' for re-moderation safety
        const { data, error } = await supabase
          .from('salon_reviews')
          .update({ ...updates, status: 'pending' })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err: any) {
        console.error("Updating review failed:", err);
        throw err;
      }
    },
    onSuccess: (data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['salonReviews', vars.salon_id] });
      queryClient.invalidateQueries({ queryKey: ['salon', vars.salon_id] });
      queryClient.invalidateQueries({ queryKey: ['salonOwnerStats'] });
      queryClient.invalidateQueries({ queryKey: ['reviewsModeration', vars.salon_id] });
    }
  });
};

export const useOwnerReply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, salon_id, owner_reply }: { id: string; salon_id: string; owner_reply: string }) => {
      const { data, error } = await supabase
        .from('salon_reviews')
        .update({ owner_reply })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['salonReviews', vars.salon_id] });
      queryClient.invalidateQueries({ queryKey: ['reviewsModeration', vars.salon_id] });
    }
  });
};

export const useReviewsModeration = (salonId?: string) => {
  return useQuery({
    queryKey: ['reviewsModeration', salonId],
    queryFn: async () => {
      if (!salonId) return [];
      try {
        const { data, error } = await supabase
          .from('salon_reviews')
          .select('*, customer:users(first_name, last_name, avatar_url), service:salon_services(name)')
          .eq('salon_id', salonId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("salon_reviews table query failed for moderation:", error);
          return [];
        }

        return data || [];
      } catch (err) {
        console.error("Error loading reviews for moderation:", err);
        return [];
      }
    },
    enabled: !!salonId,
  });
};

export const useUpdateReviewStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, salon_id, status }: { id: string; salon_id: string; status: 'approved' | 'rejected' | 'hidden' }) => {
      const { data, error } = await supabase
        .from('salon_reviews')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { id, salon_id };
    },
    onSuccess: (data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['salonReviews', vars.salon_id] });
      queryClient.invalidateQueries({ queryKey: ['reviewsModeration', vars.salon_id] });
      queryClient.invalidateQueries({ queryKey: ['salon', vars.salon_id] });
    }
  });
};

// --- Support Tickets TanStack React Query Hooks ---

export const useSupportTickets = (customerId?: string) => {
  return useQuery({
    queryKey: ['supportTickets', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const { data, error } = await supabase
        .from(TABLES.SUPPORT_TICKETS)
        .select("*")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!customerId,
    refetchInterval: 12000, // Optimized polling interval for customer feed
    refetchOnWindowFocus: true, // Instant sync on window return
  });
};

export const useCreateSupportTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newTicket: any) => {
      const { data, error } = await supabase
        .from(TABLES.SUPPORT_TICKETS)
        .insert(newTicket)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['supportTickets', data.customer_id] });
      queryClient.invalidateQueries({ queryKey: ['adminSupportTickets'] });
    }
  });
};

export const useAllSupportTickets = () => {
  return useQuery({
    queryKey: ['adminSupportTickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TABLES.SUPPORT_TICKETS)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 8000, // Optimized polling interval for admin dashboard
    refetchOnWindowFocus: true, // Instant sync on window return
  });
};

export const useUpdateSupportTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from(TABLES.SUPPORT_TICKETS)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminSupportTickets'] });
      queryClient.invalidateQueries({ queryKey: ['supportTickets', data.customer_id] });
    }
  });
};

