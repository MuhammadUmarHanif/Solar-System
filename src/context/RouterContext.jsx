import React, { createContext, useContext, useState, useEffect } from 'react';

const RouterContext = createContext(null);

const parseCurrentLocation = () => {
  // Support both HTML5 pushState path & hash routes like #/supplier/apex-solar
  const hash = window.location.hash.replace(/^#/, '');
  const path = hash || window.location.pathname || '/';

  // Normalize path
  let cleanPath = path;
  if (cleanPath.startsWith('/')) cleanPath = cleanPath.slice(1);
  const segments = cleanPath.split('/').filter(Boolean);

  if (segments.length === 0) {
    return { route: 'home', params: {}, raw: '/' };
  }

  // /supplier/:slug or /company/:slug
  if (segments[0] === 'supplier' || segments[0] === 'company') {
    return {
      route: 'supplier',
      params: { slug: segments[1] || '' },
      raw: `/${segments.join('/')}`
    };
  }

  // /dashboard or /supplier-dashboard
  if (segments[0] === 'dashboard') {
    return {
      route: 'dashboard',
      params: { tab: segments[1] || 'overview' },
      raw: `/${segments.join('/')}`
    };
  }

  // /admin or /super-admin
  if (segments[0] === 'admin') {
    return {
      route: 'admin',
      params: { tab: segments[1] || 'overview' },
      raw: `/${segments.join('/')}`
    };
  }

  // /login
  if (segments[0] === 'login') {
    return { route: 'login', params: {}, raw: '/login' };
  }

  // /register
  if (segments[0] === 'register') {
    return { route: 'register', params: {}, raw: '/register' };
  }

  return { route: 'home', params: {}, raw: '/' };
};

export const RouterProvider = ({ children }) => {
  const [location, setLocation] = useState(parseCurrentLocation());

  useEffect(() => {
    const handlePopState = () => {
      setLocation(parseCurrentLocation());
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigate = (toPath) => {
    let target = toPath;
    if (!target.startsWith('/')) target = `/${target}`;

    // Update both history API & state
    window.history.pushState({}, '', target);
    setLocation(parseCurrentLocation());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const value = {
    route: location.route,
    params: location.params,
    currentPath: location.raw,
    navigate
  };

  return (
    <RouterContext.Provider value={value}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};
