import { useState, useEffect, useCallback } from 'react';
import { sdk } from '../lib/sdk';
import type { Service } from '../../../shared/schema';

export function useMarketplace() {
  const [services, setServices] = useState<Service[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async (userId?: string) => {
    try {
      setLoading(true);
      const servicesData = await sdk.marketplace.listServices(userId);
      setServices(servicesData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSellers = useCallback(async () => {
    try {
      setLoading(true);
      const sellersData = await sdk.marketplace.listSellers();
      setSellers(sellersData);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    // Initial data fetch
    fetchServices();
    fetchSellers();
  }, [fetchServices, fetchSellers]);

  const createService = async (serviceData: any) => {
    try {
      const newService = await sdk.marketplace.createService(serviceData);
      setServices(prev => [...prev, newService]);
      return newService;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateService = async (serviceId: string, serviceData: any) => {
    try {
      const updatedService = await sdk.marketplace.updateService(serviceId, serviceData);
      setServices(prev => prev.map(s => s.id === serviceId ? updatedService : s));
      return updatedService;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteService = async (serviceId: string) => {
    try {
      await sdk.marketplace.deleteService(serviceId);
      setServices(prev => prev.filter(s => s.id !== serviceId));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    services,
    sellers,
    loading,
    error,
    fetchServices, // expose refetch functionality
    createService,
    updateService,
    deleteService,
  };
}
