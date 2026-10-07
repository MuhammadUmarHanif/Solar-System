import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import dbService from '../services/db';
import { useRouter } from './RouterContext';

const SupplierContext = createContext(null);

export const SupplierProvider = ({ children }) => {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState(() => dbService.getSuppliers());
  
  // Active tenant ID
  const [activeSupplierId, setActiveSupplierId] = useState(() => {
    // If URL is /supplier/:slug, resolve by slug
    if (router.route === 'supplier' && router.params.slug) {
      const match = dbService.getSupplierBySlug(router.params.slug);
      if (match) return match.id;
    }
    const all = dbService.getSuppliers();
    return all[0]?.id || 'sup_orbit_solar';
  });

  // Products version state for triggering reactivity on product updates
  const [dataVersion, setDataVersion] = useState(1);

  // Sync active supplier from route if route is /supplier/:slug
  useEffect(() => {
    if (router.route === 'supplier' && router.params.slug) {
      const found = dbService.getSupplierBySlug(router.params.slug);
      if (found) {
        setActiveSupplierId(found.id);
      }
    }
  }, [router.route, router.params.slug]);

  // Refresh suppliers list
  const refreshSuppliers = useCallback(() => {
    const list = dbService.getSuppliers();
    setSuppliers(list);
    setDataVersion(v => v + 1);
  }, []);

  // Active Supplier Object
  const activeSupplier = useMemo(() => {
    return suppliers.find(s => s.id === activeSupplierId) || suppliers[0] || null;
  }, [suppliers, activeSupplierId]);

  // Products for Active Supplier
  const activeProducts = useMemo(() => {
    if (!activeSupplier) return [];
    return dbService.getProductsBySupplier(activeSupplier.id);
  }, [activeSupplier, dataVersion]);

  // Categorized Active Products
  const currentPanels = useMemo(() => {
    return activeProducts.filter(p => p.category === 'panels' && p.isActive && p.isAvailable);
  }, [activeProducts]);

  const currentInverters = useMemo(() => {
    return activeProducts.filter(p => p.category === 'inverters' && p.isActive && p.isAvailable);
  }, [activeProducts]);

  const currentBatteries = useMemo(() => {
    return activeProducts.filter(p => p.category === 'batteries' && p.isActive && p.isAvailable);
  }, [activeProducts]);

  const currentStructures = useMemo(() => {
    return activeProducts.filter(p => p.category === 'mounting' && p.isActive && p.isAvailable);
  }, [activeProducts]);

  const currentCables = useMemo(() => {
    return activeProducts.filter(p => p.category === 'cables' && p.isActive && p.isAvailable);
  }, [activeProducts]);

  const currentProtections = useMemo(() => {
    return activeProducts.filter(p => p.category === 'protection' && p.isActive && p.isAvailable);
  }, [activeProducts]);

  // Actions for Supplier Product Management
  const addProduct = (supplierId, productData) => {
    const res = dbService.createProduct(supplierId, productData);
    setDataVersion(v => v + 1);
    return res;
  };

  const updateProduct = (productId, supplierId, updates) => {
    const res = dbService.updateProduct(productId, supplierId, updates);
    setDataVersion(v => v + 1);
    return res;
  };

  const deleteProduct = (productId, supplierId) => {
    const res = dbService.deleteProduct(productId, supplierId);
    setDataVersion(v => v + 1);
    return res;
  };

  // Actions for Booking & Leads
  const submitCustomerBooking = (bookingData) => {
    const lead = dbService.createLead({
      ...bookingData,
      supplierId: bookingData.supplierId || activeSupplier?.id
    });
    setDataVersion(v => v + 1);
    return lead;
  };

  const updateLeadStatus = (leadId, supplierId, status, notes) => {
    const lead = dbService.updateLeadStatus(leadId, supplierId, status, notes);
    setDataVersion(v => v + 1);
    return lead;
  };

  const updateSupplier = (supplierId, updates) => {
    const res = dbService.updateSupplier(supplierId, updates);
    const updatedList = dbService.getSuppliers();
    setSuppliers([...updatedList]);
    setDataVersion(v => v + 1);
    return res;
  };

  const selectSupplierBySlug = (slug) => {
    const found = dbService.getSupplierBySlug(slug);
    if (found) {
      setActiveSupplierId(found.id);
      return found;
    }
    return null;
  };

  const value = {
    suppliers,
    activeSupplierId,
    setActiveSupplierId,
    activeSupplier,
    activeProducts,
    currentPanels,
    currentInverters,
    currentBatteries,
    currentStructures,
    currentCables,
    currentProtections,
    refreshSuppliers,
    updateSupplier,
    addProduct,
    updateProduct,
    deleteProduct,
    submitCustomerBooking,
    updateLeadStatus,
    selectSupplierBySlug,
    dataVersion
  };

  return (
    <SupplierContext.Provider value={value}>
      {children}
    </SupplierContext.Provider>
  );
};

export const useSupplier = () => {
  const context = useContext(SupplierContext);
  if (!context) {
    throw new Error('useSupplier must be used within a SupplierProvider');
  }
  return context;
};
