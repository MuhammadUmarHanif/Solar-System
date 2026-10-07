import React, { createContext, useContext, useState, useEffect } from 'react';
import dbService from '../services/db';
import { auth as firebaseAuth } from '../services/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut 
} from 'firebase/auth';

const AUTH_STORAGE_KEY = 'orbit_company_auth_session_v1';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.id) return parsed;
      }
    } catch (e) {
      console.warn("Failed to restore auth session", e);
    }
    return null;
  });

  const [currentSupplier, setCurrentSupplier] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync currentSupplier whenever user changes or DB updates
  useEffect(() => {
    if (user && user.supplierId) {
      const s = dbService.getSupplierById(user.supplierId);
      setCurrentSupplier(s);
    } else {
      setCurrentSupplier(null);
    }
    setLoading(false);
  }, [user]);

  const saveSession = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  const login = async (email, password) => {
    let cleanEmail = (email || '').trim().toLowerCase();
    if (cleanEmail === 'admin') cleanEmail = 'admin@orbit.solar';
    const foundUser = dbService.findUserByEmail(cleanEmail);

    if (!foundUser) {
      throw new Error("No account found with this email address.");
    }

    if (foundUser.passwordHash !== password) {
      throw new Error("Invalid password. Please check your credentials.");
    }

    const sessionUser = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      role: 'admin',
      supplierId: foundUser.supplierId
    };

    saveSession(sessionUser);
    if (firebaseAuth) {
      signInWithEmailAndPassword(firebaseAuth, cleanEmail, password).catch(() => {});
    }
    return sessionUser;
  };

  const registerSupplier = async (form) => {
    const cleanEmail = (form.email || '').trim().toLowerCase();

    if (dbService.findUserByEmail(cleanEmail)) {
      throw new Error("An account with this email address already exists.");
    }

    // 1. Create company supplier entity
    const newSupplier = dbService.createSupplier({
      name: form.companyName || 'My Solar Company',
      email: cleanEmail,
      phone: form.phone,
      whatsapp: form.whatsapp || form.phone,
      cityId: form.cityId || 'lahore',
      cityName: form.cityName || 'Lahore',
      area: form.area || 'Commercial Area',
      address: form.address || '',
      tagline: form.tagline || 'Authorized Solar Energy Installer',
      pecReg: form.pecReg || 'PEC Licensed Contractor',
      plan: 'pro'
    });

    // 2. Create supplier user
    const newUser = dbService.createUser({
      name: form.contactPerson || form.companyName,
      email: cleanEmail,
      password: form.password,
      role: 'admin',
      supplierId: newSupplier.id
    });

    const sessionUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: 'admin',
      supplierId: newSupplier.id
    };

    saveSession(sessionUser);
    if (firebaseAuth && form.password) {
      createUserWithEmailAndPassword(firebaseAuth, cleanEmail, form.password).catch(() => {});
    }
    return { user: sessionUser, supplier: newSupplier };
  };

  const logout = () => {
    saveSession(null);
    setCurrentSupplier(null);
    if (firebaseAuth) {
      firebaseSignOut(firebaseAuth).catch(() => {});
    }
  };

  const updateSupplierProfile = (updates) => {
    if (!user || !user.supplierId) return null;
    const updated = dbService.updateSupplier(user.supplierId, updates);
    setCurrentSupplier(updated);
    return updated;
  };

  const isAdmin = Boolean(user);
  const isAuthenticated = Boolean(user);

  const value = {
    user,
    currentUser: user,
    currentSupplier,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    registerSupplier,
    logout,
    updateSupplierProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
