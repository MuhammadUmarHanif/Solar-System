import React, { useState, useMemo } from 'react';
import './SupplierDashboardPage.css';
import { useAuth } from '../context/AuthContext';
import { useSupplier } from '../context/SupplierContext';
import { useRouter } from '../context/RouterContext';
import dbService from '../services/db';
import {
  IconZap,
  IconBuilding,
  IconLayers,
  IconTool,
  IconCash,
  IconTrendingUp,
  IconCheck,
  IconCheckCircle,
  IconSettings,
  IconSearch,
  IconCopy,
  IconWhatsApp,
  IconPhone,
  IconX
} from '../components/Icons';

const CATEGORIES = [
  { id: 'all', label: 'All Products' },
  { id: 'panels', label: 'Solar Panels' },
  { id: 'batteries', label: 'Batteries' },
  { id: 'inverters', label: 'Inverters' },
  { id: 'mounting', label: 'Mounting & Structure' },
  { id: 'cables', label: 'Cables & Wiring' },
  { id: 'protection', label: 'Protection & SPDs' },
  { id: 'installation', label: 'Installation Services' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'other', label: 'Other' }
];

export default function SupplierDashboardPage() {
  const { currentUser, logout } = useAuth();
  const { suppliers, activeSupplier, activeSupplierId, addProduct, updateProduct, deleteProduct, dataVersion } = useSupplier();
  const router = useRouter();

  // Company ID resolution for single company management
  const currentSupplierId = currentUser?.supplierId || activeSupplierId || suppliers[0]?.id;
  const supplier = useMemo(() => {
    return suppliers.find(s => s.id === currentSupplierId) || activeSupplier;
  }, [suppliers, currentSupplierId, activeSupplier]);

  // Active Tab: 'overview' | 'products' | 'leads' | 'calculator' | 'settings'
  const [activeTab, setActiveTab] = useState('overview');

  // Products Tab State
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [productSearch, setProductSearch] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Product Form State
  const initialProductForm = {
    name: '',
    brand: '',
    category: 'panels',
    model: '',
    wattage: 585,
    voltage: 48,
    type: 'Monocrystalline N-Type TOPCon',
    price: 21500,
    pricePerWatt: 36.7,
    unit: 'Module',
    isAvailable: true,
    isActive: true,
    stockCount: 150,
    warrantyYears: 25,
    description: '',
    image: ''
  };
  const [productForm, setProductForm] = useState(initialProductForm);

  // Leads Tab State
  const [leadStatusFilter, setLeadStatusFilter] = useState('all');
  const [leadSearch, setLeadSearch] = useState('');
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState(null);

  // Settings Form State
  const [companySettings, setCompanySettings] = useState(() => ({
    name: supplier?.name || '',
    tagline: supplier?.tagline || '',
    pecReg: supplier?.pecReg || '',
    area: supplier?.area || '',
    address: supplier?.address || '',
    phone: supplier?.phone || '',
    whatsapp: supplier?.whatsapp || '',
    email: supplier?.email || '',
    currency: supplier?.currency || 'PKR',
    warranties: supplier?.warranties || '',
    netMeteringDays: supplier?.netMeteringDays || ''
  }));

  // Calculator Settings Form State
  const [calcSettings, setCalcSettings] = useState(() => ({
    derateFactor: supplier?.calculatorConfig?.derateFactor || 0.80,
    avgTariff: supplier?.calculatorConfig?.avgTariff || 48,
    installationLaborBase: supplier?.calculatorConfig?.installationLaborBase || 26000,
    installationLaborPerKw: supplier?.calculatorConfig?.installationLaborPerKw || 2800,
    netMeteringOngrid: supplier?.calculatorConfig?.netMeteringOngrid || 115000,
    netMeteringHybrid: supplier?.calculatorConfig?.netMeteringHybrid || 85000,
    cableProtectionBase: supplier?.calculatorConfig?.cableProtectionBase || 38000,
    cableProtectionPerKw: supplier?.calculatorConfig?.cableProtectionPerKw || 5800,
    standardStructureCostPerWatt: supplier?.calculatorConfig?.standardStructureCostPerWatt || 5.5,
    elevatedStructureCostPerWatt: supplier?.calculatorConfig?.elevatedStructureCostPerWatt || 15.0
  }));

  // Sync settings when supplier changes
  React.useEffect(() => {
    if (supplier) {
      setCompanySettings({
        name: supplier.name || '',
        tagline: supplier.tagline || '',
        pecReg: supplier.pecReg || '',
        area: supplier.area || '',
        address: supplier.address || '',
        phone: supplier.phone || '',
        whatsapp: supplier.whatsapp || '',
        email: supplier.email || '',
        currency: supplier.currency || 'PKR',
        warranties: supplier.warranties || '',
        netMeteringDays: supplier.netMeteringDays || ''
      });
      setCalcSettings({
        derateFactor: supplier.calculatorConfig?.derateFactor || 0.80,
        avgTariff: supplier.calculatorConfig?.avgTariff || 48,
        installationLaborBase: supplier.calculatorConfig?.installationLaborBase || 26000,
        installationLaborPerKw: supplier.calculatorConfig?.installationLaborPerKw || 2800,
        netMeteringOngrid: supplier.calculatorConfig?.netMeteringOngrid || 115000,
        netMeteringHybrid: supplier.calculatorConfig?.netMeteringHybrid || 85000,
        cableProtectionBase: supplier.calculatorConfig?.cableProtectionBase || 38000,
        cableProtectionPerKw: supplier.calculatorConfig?.cableProtectionPerKw || 5800,
        standardStructureCostPerWatt: supplier.calculatorConfig?.standardStructureCostPerWatt || 5.5,
        elevatedStructureCostPerWatt: supplier.calculatorConfig?.elevatedStructureCostPerWatt || 15.0
      });
    }
  }, [supplier]);

  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Fetch Supplier Products
  const supplierProducts = useMemo(() => {
    if (!supplier) return [];
    return dbService.getProductsBySupplier(supplier.id);
  }, [supplier, dataVersion]);

  // Fetch Supplier Leads
  const supplierLeads = useMemo(() => {
    if (!supplier) return [];
    return dbService.getLeadsBySupplier(supplier.id);
  }, [supplier, dataVersion]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return supplierProducts.filter(p => {
      const matchCat = productCategoryFilter === 'all' || p.category === productCategoryFilter;
      const matchQuery = !productSearch || 
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.brand?.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.model?.toLowerCase().includes(productSearch.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [supplierProducts, productCategoryFilter, productSearch]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return supplierLeads.filter(l => {
      const matchStatus = leadStatusFilter === 'all' || l.status === leadStatusFilter;
      const matchQuery = !leadSearch ||
        l.customerName?.toLowerCase().includes(leadSearch.toLowerCase()) ||
        (l.phone && String(l.phone).includes(leadSearch)) ||
        l.city?.toLowerCase().includes(leadSearch.toLowerCase()) ||
        l.ref?.toLowerCase().includes(leadSearch.toLowerCase());
      return matchStatus && matchQuery;
    });
  }, [supplierLeads, leadStatusFilter, leadSearch]);

  // Metrics
  const metrics = useMemo(() => {
    const totalLeads = supplierLeads.length;
    const newLeads = supplierLeads.filter(l => l.status === 'new').length;
    const confirmedBookings = supplierLeads.filter(l => l.status === 'confirmed' || l.status === 'completed').length;
    const totalGmv = supplierLeads
      .filter(l => l.status !== 'cancelled')
      .reduce((sum, l) => sum + (l.estimatedTotalCost || 0), 0);
    const activeProductsCount = supplierProducts.filter(p => p.isActive && p.isAvailable).length;

    return { totalLeads, newLeads, confirmedBookings, totalGmv, activeProductsCount };
  }, [supplierLeads, supplierProducts]);

  // Product Handlers
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm(initialProductForm);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name || '',
      brand: prod.brand || '',
      category: prod.category || 'panels',
      model: prod.model || '',
      wattage: prod.wattage || 0,
      voltage: prod.voltage || 0,
      type: prod.type || '',
      price: prod.price || 0,
      pricePerWatt: prod.pricePerWatt || 0,
      unit: prod.unit || 'Unit',
      isAvailable: prod.isAvailable ?? true,
      isActive: prod.isActive ?? true,
      stockCount: prod.stockCount || 0,
      warrantyYears: prod.warrantyYears || 5,
      description: prod.description || '',
      image: prod.image || ''
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) {
      alert('Please provide product name and price');
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, supplier.id, productForm);
      showToast(`Updated "${productForm.name}" successfully!`);
    } else {
      addProduct(supplier.id, productForm);
      showToast(`Added "${productForm.name}" to inventory!`);
    }
    setIsProductModalOpen(false);
  };

  const handleDeleteProduct = (prodId, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteProduct(prodId, supplier.id);
      showToast(`Deleted "${name}"`);
    }
  };

  const handleToggleProductStatus = (prod) => {
    updateProduct(prod.id, supplier.id, { isActive: !prod.isActive });
    showToast(`Product ${prod.isActive ? 'deactivated' : 'activated'}`);
  };

  // Lead Status Handler
  const handleUpdateLeadStatus = (leadId, newStatus) => {
    dbService.updateLeadStatus(leadId, supplier.id, newStatus);
    showToast(`Lead status updated to ${newStatus.toUpperCase()}`);
  };

  // Settings Save
  const handleSaveCompanySettings = (e) => {
    e.preventDefault();
    dbService.updateSupplier(supplier.id, companySettings);
    showToast('Company profile & WhatsApp configuration saved!');
  };

  // Calculator Settings Save
  const handleSaveCalcSettings = (e) => {
    e.preventDefault();
    dbService.updateSupplier(supplier.id, { calculatorConfig: calcSettings });
    showToast('Dynamic calculator parameters updated successfully!');
  };

  // Copy Public Link
  const publicUrl = `${window.location.origin}/supplier/${supplier?.slug || ''}`;
  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    showToast('Public Calculator link copied to clipboard!');
  };

  if (!supplier) {
    return (
      <div className="supplier-dash-loading">
        <h2>Loading Supplier Dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="supplier-dash-container">
      {/* Dashboard Top Header */}
      <header className="dash-header">
        <div className="dash-brand-info">
          <div className="dash-avatar">{supplier.name.charAt(0)}</div>
          <div>
            <div className="dash-title-row">
              <h1 className="dash-company-name">{supplier.name}</h1>
              <span className="dash-plan-badge plan-pro">
                COMPANY PORTAL
              </span>
              <span className={`dash-status-dot status-${supplier.status}`}>
                {supplier.status === 'active' ? '● System Live' : '● Maintenance'}
              </span>
            </div>
            <p className="dash-company-meta">
              <IconBuilding size={14} style={{ verticalAlign: 'middle', marginRight: '4px', color: '#00d2ff' }} />
              <span>{supplier.cityName} • {supplier.pecReg} • WhatsApp: +{supplier.whatsapp} • {supplier.email}</span>
            </p>
          </div>
        </div>

        <div className="dash-header-actions">
          <button 
            type="button" 
            onClick={() => router.navigate('/')} 
            className="btn-dash-action btn-view-public"
            title="View your public solar website and calculator"
          >
            ← Back to Live Website
          </button>
          <button 
            type="button" 
            onClick={() => { logout(); router.navigate('/'); }} 
            className="btn-dash-action"
            style={{ background: 'rgba(255, 69, 58, 0.15)', color: '#ff453a', border: '1px solid rgba(255, 69, 58, 0.3)' }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="dash-toast-notification">
          <IconCheckCircle size={15} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <nav className="dash-nav-tabs">
        <button
          type="button"
          className={`dash-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <IconTrendingUp size={16} />
          <span>Overview & Metrics</span>
        </button>
        <button
          type="button"
          className={`dash-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <IconLayers size={16} />
          <span>Product Catalog ({supplierProducts.length})</span>
        </button>
        <button
          type="button"
          className={`dash-tab-btn ${activeTab === 'leads' ? 'active' : ''}`}
          onClick={() => setActiveTab('leads')}
        >
          <IconZap size={16} />
          <span>Leads & Bookings ({supplierLeads.length})</span>
          {metrics.newLeads > 0 && <span className="tab-pill-alert">{metrics.newLeads}</span>}
        </button>
        <button
          type="button"
          className={`dash-tab-btn ${activeTab === 'calculator' ? 'active' : ''}`}
          onClick={() => setActiveTab('calculator')}
        >
          <IconSettings size={16} />
          <span>Calculator Pricing Engine</span>
        </button>
        <button
          type="button"
          className={`dash-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <IconBuilding size={16} />
          <span>Company & WhatsApp Profile</span>
        </button>
      </nav>

      {/* Main Tab Views */}
      <main className="dash-content-area">
        {/* ===================== TAB 1: OVERVIEW ===================== */}
        {activeTab === 'overview' && (
          <div className="tab-view overview-view">
            {/* KPI Cards */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-icon-wrap" style={{ background: 'rgba(0, 210, 255, 0.15)', color: '#00d2ff' }}>
                  <IconZap size={22} />
                </div>
                <div className="kpi-info">
                  <span className="kpi-label">Total Inquiries / Leads</span>
                  <strong className="kpi-value num-tabular">{metrics.totalLeads}</strong>
                  <span className="kpi-sub highlight-green">+{metrics.newLeads} new awaiting response</span>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon-wrap" style={{ background: 'rgba(0, 230, 118, 0.15)', color: '#00e676' }}>
                  <IconCheckCircle size={22} />
                </div>
                <div className="kpi-info">
                  <span className="kpi-label">Confirmed Bookings</span>
                  <strong className="kpi-value num-tabular">{metrics.confirmedBookings}</strong>
                  <span className="kpi-sub">
                    {metrics.totalLeads > 0 ? Math.round((metrics.confirmedBookings / metrics.totalLeads) * 100) : 0}% Conversion Rate
                  </span>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon-wrap" style={{ background: 'rgba(255, 179, 0, 0.15)', color: '#ffb300' }}>
                  <IconCash size={22} />
                </div>
                <div className="kpi-info">
                  <span className="kpi-label">Pipeline Project Value</span>
                  <strong className="kpi-value num-tabular">PKR {(metrics.totalGmv / 100000).toFixed(1)} Lakh</strong>
                  <span className="kpi-sub">Turnkey solar pipeline</span>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon-wrap" style={{ background: 'rgba(156, 39, 176, 0.15)', color: '#ba68c8' }}>
                  <IconLayers size={22} />
                </div>
                <div className="kpi-info">
                  <span className="kpi-label">Active Catalog Items</span>
                  <strong className="kpi-value num-tabular">{metrics.activeProductsCount} Items</strong>
                  <span className="kpi-sub">Panels, Inverters, Batteries</span>
                </div>
              </div>
            </div>

            {/* Quick Share Link Box */}
            <div className="share-link-banner">
              <div className="share-link-left">
                <span className="share-badge">
                  <IconZap size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  <span>Your Direct Customer Calculator URL</span>
                </span>
                <h3>Share this link on Facebook, WhatsApp ads, and your website</h3>
                <p>Customers will calculate their system using exclusively your panels, inverters, and rates.</p>
                <code className="public-url-code">{publicUrl}</code>
              </div>
              <div className="share-link-right">
                <button type="button" onClick={handleCopyLink} className="btn-copy-cta">
                  <IconCopy size={14} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                  <span>Copy Share Link</span>
                </button>
                <button type="button" onClick={() => router.navigate('supplier', { slug: supplier.slug })} className="btn-test-cta">
                  Test Experience →
                </button>
              </div>
            </div>

            {/* Recent Leads Preview */}
            <div className="section-card">
              <div className="section-card-header">
                <div>
                  <h3>Recent Customer Inquiries</h3>
                  <p>Latest estimates generated through your public solar calculator.</p>
                </div>
                <button type="button" onClick={() => setActiveTab('leads')} className="btn-view-all">
                  View All Leads ({supplierLeads.length}) →
                </button>
              </div>

              {supplierLeads.length === 0 ? (
                <div className="empty-state">
                  <p>No customer inquiries yet. Share your calculator link to start receiving leads!</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Ref #</th>
                        <th>Customer</th>
                        <th>System Size</th>
                        <th>Est. Price</th>
                        <th>Status</th>
                        <th>WhatsApp Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supplierLeads.slice(0, 5).map(lead => (
                        <tr key={lead.id}>
                          <td><span className="ref-tag">{lead.ref}</span></td>
                          <td>
                            <strong>{lead.customerName}</strong>
                            <div className="cell-sub">{lead.phone} • {lead.city}</div>
                          </td>
                          <td>
                            <span className="kw-badge">{lead.systemKw} kW</span>
                            <div className="cell-sub">{lead.selectedPanel?.name || 'Tier-1 Panel'}</div>
                          </td>
                          <td>
                            <strong className="price-tag">PKR {(lead.estimatedTotalCost / 100000).toFixed(2)} Lakh</strong>
                          </td>
                          <td>
                            <span className={`status-pill pill-${lead.status}`}>
                              {lead.status.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <a
                              href={`https://wa.me/${(lead.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Assalam o Alaikum ${lead.customerName || 'Customer'}! This is ${supplier.name}. We received your solar inquiry for ${lead.systemKw} kW system (Ref: ${lead.ref}). When can we schedule your roof survey?`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-wa-table"
                            >
                              💬 Chat on WhatsApp
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== TAB 2: PRODUCTS CRUD ===================== */}
        {activeTab === 'products' && (
          <div className="tab-view products-view">
            <div className="products-toolbar">
              <div className="toolbar-left">
                <input
                  type="text"
                  placeholder="Search products by brand, model, name..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="search-input"
                />
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="filter-category-select"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
              <button type="button" onClick={handleOpenAddProduct} className="btn-add-product">
                + Add New Product / Service
              </button>
            </div>

            {/* Category Pills */}
            <div className="category-pills-row">
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  type="button"
                  className={`cat-pill-btn ${productCategoryFilter === c.id ? 'active' : ''}`}
                  onClick={() => setProductCategoryFilter(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Products Table */}
            <div className="section-card">
              <div className="table-responsive">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Product / Model</th>
                      <th>Category</th>
                      <th>Specs / Rating</th>
                      <th>Price (PKR)</th>
                      <th>Stock & Availability</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="empty-table-cell">
                          No products found in this category. Click "+ Add New Product" to expand your catalog.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map(prod => (
                        <tr key={prod.id}>
                          <td>
                            <strong>{prod.name}</strong>
                            <div className="cell-sub">{prod.brand} {prod.model && `• ${prod.model}`}</div>
                          </td>
                          <td>
                            <span className="cat-badge">{prod.category}</span>
                          </td>
                          <td>
                            <div>
                              {prod.wattage > 0 && <span>{prod.wattage}W </span>}
                              {prod.voltage > 0 && <span>• {prod.voltage}V </span>}
                              {prod.pricePerWatt > 0 && <span className="ppw-text">(@ Rs.{prod.pricePerWatt}/W)</span>}
                            </div>
                            <div className="cell-sub">{prod.type || `${prod.warrantyYears}Y Warranty`}</div>
                          </td>
                          <td>
                            <strong className="price-tag">PKR {Number(prod.price).toLocaleString()}</strong>
                            <div className="cell-sub">per {prod.unit || 'unit'}</div>
                          </td>
                          <td>
                            <span className={`stock-badge ${prod.isAvailable ? 'in-stock' : 'out-of-stock'}`}>
                              {prod.isAvailable ? `In Stock (${prod.stockCount || 'Avail'})` : 'Out of Stock'}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => handleToggleProductStatus(prod)}
                              className={`status-toggle-btn ${prod.isActive ? 'active' : 'inactive'}`}
                              title="Click to enable or disable in public calculator"
                            >
                              {prod.isActive ? 'Active' : 'Disabled'}
                            </button>
                          </td>
                          <td>
                            <div className="row-actions">
                              <button
                                type="button"
                                onClick={() => handleOpenEditProduct(prod)}
                                className="btn-action-edit"
                                title="Edit Product"
                              >
                                <IconTool size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(prod.id, prod.name)}
                                className="btn-action-delete"
                                title="Delete Product"
                              >
                                <IconX size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 3: LEADS & CRM ===================== */}
        {activeTab === 'leads' && (
          <div className="tab-view leads-view">
            <div className="leads-toolbar">
              <div className="toolbar-left">
                <input
                  type="text"
                  placeholder="Search leads by name, phone, city, reference..."
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  className="search-input"
                />
                <select
                  value={leadStatusFilter}
                  onChange={(e) => setLeadStatusFilter(e.target.value)}
                  className="filter-category-select"
                >
                  <option value="all">All Statuses ({supplierLeads.length})</option>
                  <option value="new">New Inquiries</option>
                  <option value="contacted">Contacted</option>
                  <option value="quoted">Quoted / Surveyed</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed Installation</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="leads-counter-pill">
                Showing {filteredLeads.length} of {supplierLeads.length} Leads
              </div>
            </div>

            <div className="section-card">
              <div className="table-responsive">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Ref & Date</th>
                      <th>Customer Info</th>
                      <th>System Specifications</th>
                      <th>Estimated Project Cost</th>
                      <th>CRM Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="empty-table-cell">
                          No inquiries matching current filter.
                        </td>
                      </tr>
                    ) : (
                      filteredLeads.map(lead => (
                        <tr key={lead.id}>
                          <td>
                            <span className="ref-tag">{lead.ref}</span>
                            <div className="cell-sub">{new Date(lead.createdAt).toLocaleDateString()}</div>
                          </td>
                          <td>
                            <strong>{lead.customerName}</strong>
                            <div className="cell-sub">
                              <IconPhone size={11} style={{ verticalAlign: 'middle', marginRight: '4px', color: '#00d2ff' }} />
                              <span className="num-tabular">{lead.phone}</span>
                            </div>
                            <div className="cell-sub">
                              <IconBuilding size={11} style={{ verticalAlign: 'middle', marginRight: '4px', color: '#00d2ff' }} />
                              <span>{lead.city} {lead.address ? `• ${lead.address}` : ''}</span>
                            </div>
                          </td>
                          <td>
                            <span className="kw-badge num-tabular">{lead.systemKw} kW System</span>
                            <div className="cell-sub">
                              {lead.selectedPanel?.name || 'Selected Module'}
                              {lead.selectedInverter && ` • ${lead.selectedInverter.name}`}
                              {lead.selectedBattery && ` • ${lead.selectedBattery.name}`}
                            </div>
                          </td>
                          <td>
                            <strong className="price-tag num-tabular">PKR {(lead.estimatedTotalCost / 100000).toFixed(2)} Lakh</strong>
                            <div className="cell-sub num-tabular">Rs. {Number(lead.estimatedTotalCost).toLocaleString()}</div>
                          </td>
                          <td>
                            <select
                              value={lead.status}
                              onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value)}
                              className={`status-dropdown status-select-${lead.status}`}
                            >
                              <option value="new">New</option>
                              <option value="contacted">Contacted</option>
                              <option value="quoted">Quoted</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td>
                            <div className="row-actions">
                              <a
                                href={`https://wa.me/${(lead.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                  `Assalam o Alaikum ${lead.customerName || 'Customer'}!\n` +
                                  `This is ${supplier.name} regarding your solar calculation on our website (Ref: ${lead.ref}).\n\n` +
                                  `System Size: ${lead.systemKw} kW\n` +
                                  `Estimated Cost: PKR ${(lead.estimatedTotalCost / 100000).toFixed(2)} Lakh\n` +
                                  `Location: ${lead.city || ''}\n\n` +
                                  `Would you like us to schedule a free technical site survey of your roof?`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-wa-table"
                                title="Send WhatsApp Message"
                              >
                                <IconWhatsApp size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                <span>WhatsApp</span>
                              </a>
                              <button
                                type="button"
                                onClick={() => setSelectedLeadForDetail(lead)}
                                className="btn-view-details"
                                title="View Lead Details"
                              >
                                <IconSearch size={13} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
                                <span>Details</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 4: CALCULATOR SETTINGS ===================== */}
        {activeTab === 'calculator' && (
          <div className="tab-view calc-settings-view">
            <div className="section-card">
              <div className="section-card-header">
                <div>
                  <h3>Supplier-Specific Calculation Engine Parameters</h3>
                  <p>Fine-tune how your public calculator prices turnkey packages for customers.</p>
                </div>
              </div>

              <form onSubmit={handleSaveCalcSettings} className="settings-form-grid">
                <div className="form-group">
                  <label>Average NEPRA Tariff (PKR/kWh)</label>
                  <input
                    type="number"
                    value={calcSettings.avgTariff}
                    onChange={(e) => setCalcSettings({ ...calcSettings, avgTariff: parseFloat(e.target.value) || 48 })}
                  />
                  <small>Used to calculate customer monthly bill savings.</small>
                </div>

                <div className="form-group">
                  <label>System Derate Factor (Losses)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.6"
                    max="0.95"
                    value={calcSettings.derateFactor}
                    onChange={(e) => setCalcSettings({ ...calcSettings, derateFactor: parseFloat(e.target.value) || 0.8 })}
                  />
                  <small>Standard is 0.80 (accounting for dust, heat & inverter efficiency).</small>
                </div>

                <div className="form-group">
                  <label>Standard Structure Cost (PKR/Watt)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={calcSettings.standardStructureCostPerWatt}
                    onChange={(e) => setCalcSettings({ ...calcSettings, standardStructureCostPerWatt: parseFloat(e.target.value) || 5.5 })}
                  />
                  <small>Standard GI L2/L3 galvanized rooftop mounting.</small>
                </div>

                <div className="form-group">
                  <label>Elevated Structure Cost (PKR/Watt)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={calcSettings.elevatedStructureCostPerWatt}
                    onChange={(e) => setCalcSettings({ ...calcSettings, elevatedStructureCostPerWatt: parseFloat(e.target.value) || 15.0 })}
                  />
                  <small>Heavy-gauge elevated walkable structure.</small>
                </div>

                <div className="form-group">
                  <label>Base Electrical Cabling & SPD (PKR)</label>
                  <input
                    type="number"
                    value={calcSettings.cableProtectionBase}
                    onChange={(e) => setCalcSettings({ ...calcSettings, cableProtectionBase: parseInt(e.target.value, 10) || 38000 })}
                  />
                  <small>Fixed breaker, DB, and SPD foundation cost.</small>
                </div>

                <div className="form-group">
                  <label>Cabling & SPD Rate per kW (PKR)</label>
                  <input
                    type="number"
                    value={calcSettings.cableProtectionPerKw}
                    onChange={(e) => setCalcSettings({ ...calcSettings, cableProtectionPerKw: parseInt(e.target.value, 10) || 5800 })}
                  />
                  <small>Added per kW of total solar DC capacity.</small>
                </div>

                <div className="form-group">
                  <label>Net Metering Fee (On-Grid) (PKR)</label>
                  <input
                    type="number"
                    value={calcSettings.netMeteringOngrid}
                    onChange={(e) => setCalcSettings({ ...calcSettings, netMeteringOngrid: parseInt(e.target.value, 10) || 115000 })}
                  />
                  <small>DISCO green bidirectional meter, earthing & paperwork.</small>
                </div>

                <div className="form-group">
                  <label>Net Metering Fee (Hybrid) (PKR)</label>
                  <input
                    type="number"
                    value={calcSettings.netMeteringHybrid}
                    onChange={(e) => setCalcSettings({ ...calcSettings, netMeteringHybrid: parseInt(e.target.value, 10) || 85000 })}
                  />
                  <small>Hybrid systems with optional reverse power relay.</small>
                </div>

                <div className="form-group">
                  <label>Base Installation & Civil Labor (PKR)</label>
                  <input
                    type="number"
                    value={calcSettings.installationLaborBase}
                    onChange={(e) => setCalcSettings({ ...calcSettings, installationLaborBase: parseInt(e.target.value, 10) || 26000 })}
                  />
                  <small>Fixed mobilization and testing charge.</small>
                </div>

                <div className="form-group">
                  <label>Installation Labor Rate per kW (PKR)</label>
                  <input
                    type="number"
                    value={calcSettings.installationLaborPerKw}
                    onChange={(e) => setCalcSettings({ ...calcSettings, installationLaborPerKw: parseInt(e.target.value, 10) || 2800 })}
                  />
                  <small>Variable labor scaled by project kW size.</small>
                </div>

                <div className="form-actions-full">
                  <button type="submit" className="btn-primary-save">
                    💾 Save Calculator Engine Settings
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===================== TAB 5: COMPANY PROFILE & SETTINGS ===================== */}
        {activeTab === 'settings' && (
          <div className="tab-view company-settings-view">
            <div className="section-card">
              <div className="section-card-header">
                <div>
                  <h3>Company Branding & Contact Settings</h3>
                  <p>These details appear on your public calculator and power the WhatsApp lead button.</p>
                </div>
              </div>

              <form onSubmit={handleSaveCompanySettings} className="settings-form-grid">
                <div className="form-group">
                  <label>Company Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={companySettings.name}
                    onChange={(e) => setCompanySettings({ ...companySettings, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Tagline / Pitch</label>
                  <input
                    type="text"
                    value={companySettings.tagline}
                    onChange={(e) => setCompanySettings({ ...companySettings, tagline: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>PEC Engineering Registration</label>
                  <input
                    type="text"
                    value={companySettings.pecReg}
                    onChange={(e) => setCompanySettings({ ...companySettings, pecReg: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>WhatsApp Number (Without + or spaces) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 923008452190"
                    value={companySettings.whatsapp}
                    onChange={(e) => setCompanySettings({ ...companySettings, whatsapp: e.target.value.replace(/[^0-9]/g, '') })}
                  />
                  <small>Used for customer WhatsApp redirect after booking.</small>
                </div>

                <div className="form-group">
                  <label>Official Phone Number</label>
                  <input
                    type="text"
                    value={companySettings.phone}
                    onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Official Email</label>
                  <input
                    type="email"
                    value={companySettings.email}
                    onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Area / Branch Coverage</label>
                  <input
                    type="text"
                    value={companySettings.area}
                    onChange={(e) => setCompanySettings({ ...companySettings, area: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Physical Office Address</label>
                  <input
                    type="text"
                    value={companySettings.address}
                    onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Warranties Promised</label>
                  <input
                    type="text"
                    value={companySettings.warranties}
                    onChange={(e) => setCompanySettings({ ...companySettings, warranties: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Net Metering Turnaround Days</label>
                  <input
                    type="text"
                    value={companySettings.netMeteringDays}
                    onChange={(e) => setCompanySettings({ ...companySettings, netMeteringDays: e.target.value })}
                  />
                </div>

                <div className="form-actions-full">
                  <button type="submit" className="btn-primary-save">
                    <IconCheck size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                    <span>Save Company Profile & WhatsApp</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* ===================== ADD / EDIT PRODUCT MODAL ===================== */}
      {isProductModalOpen && (
        <div className="modal-overlay" onClick={() => setIsProductModalOpen(false)}>
          <div className="modal-card modal-lg" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setIsProductModalOpen(false)}
            >
              <IconX size={16} />
            </button>

            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Solar Product'}</h2>
              <p>Items added here will immediately appear in your public solar calculator.</p>
            </div>

            <form onSubmit={handleSaveProduct} className="modal-form-grid">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tiger Neo N-Type 585W TOPCon"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                >
                  <option value="panels">Solar Panels</option>
                  <option value="inverters">Inverters</option>
                  <option value="batteries">Batteries</option>
                  <option value="mounting">Mounting & Structure</option>
                  <option value="cables">Cables & Wiring</option>
                  <option value="protection">Protection & SPDs</option>
                  <option value="installation">Installation</option>
                  <option value="accessories">Accessories</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Brand Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jinko, Longi, Inverex, Narada"
                  value={productForm.brand}
                  onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Model Number</label>
                <input
                  type="text"
                  placeholder="e.g. JKM-585N-72HL4-BDV"
                  value={productForm.model}
                  onChange={(e) => setProductForm({ ...productForm, model: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Wattage / Power (W)</label>
                <input
                  type="number"
                  placeholder="e.g. 585 for panel, 10000 for 10kW inverter"
                  value={productForm.wattage}
                  onChange={(e) => {
                    const w = parseFloat(e.target.value) || 0;
                    setProductForm({ 
                      ...productForm, 
                      wattage: w,
                      pricePerWatt: w > 0 && productForm.price > 0 ? +(productForm.price / w).toFixed(2) : productForm.pricePerWatt
                    });
                  }}
                />
              </div>

              <div className="form-group">
                <label>Voltage (V)</label>
                <input
                  type="number"
                  placeholder="e.g. 48 for battery, 220 or 400 for inverter"
                  value={productForm.voltage}
                  onChange={(e) => setProductForm({ ...productForm, voltage: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="form-group">
                <label>Total Price (PKR) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 21500"
                  value={productForm.price}
                  onChange={(e) => {
                    const p = parseFloat(e.target.value) || 0;
                    setProductForm({ 
                      ...productForm, 
                      price: p,
                      pricePerWatt: productForm.wattage > 0 && p > 0 ? +(p / productForm.wattage).toFixed(2) : 0
                    });
                  }}
                />
              </div>

              <div className="form-group">
                <label>Unit</label>
                <input
                  type="text"
                  placeholder="e.g. Module, Unit, kWh, System"
                  value={productForm.unit}
                  onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Technology Type / Chemistry</label>
                <input
                  type="text"
                  placeholder="e.g. N-Type TOPCon, LiFePO4, On-Grid IP65"
                  value={productForm.type}
                  onChange={(e) => setProductForm({ ...productForm, type: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Warranty (Years)</label>
                <input
                  type="number"
                  placeholder="e.g. 25 for panels, 5 for inverter"
                  value={productForm.warrantyYears}
                  onChange={(e) => setProductForm({ ...productForm, warrantyYears: parseInt(e.target.value, 10) || 0 })}
                />
              </div>

              <div className="form-group">
                <label>Stock Quantity Available</label>
                <input
                  type="number"
                  value={productForm.stockCount}
                  onChange={(e) => setProductForm({ ...productForm, stockCount: parseInt(e.target.value, 10) || 0 })}
                />
              </div>

              <div className="form-group">
                <label>Availability & Status</label>
                <div className="checkbox-row">
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={productForm.isAvailable}
                      onChange={(e) => setProductForm({ ...productForm, isAvailable: e.target.checked })}
                    />
                    <span>Available In Stock</span>
                  </label>
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={productForm.isActive}
                      onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })}
                    />
                    <span>Active in Calculator</span>
                  </label>
                </div>
              </div>

              <div className="form-group form-group-full">
                <label>Product Description & Notes</label>
                <textarea
                  rows="3"
                  placeholder="Describe warranties, specifications, certifications..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                />
              </div>

              <div className="modal-actions-full">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-save">
                  {editingProduct ? 'Save Product Changes' : 'Create & Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== LEAD DETAIL MODAL ===================== */}
      {selectedLeadForDetail && (
        <div className="modal-overlay" onClick={() => setSelectedLeadForDetail(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setSelectedLeadForDetail(null)}
            >
              <IconX size={16} />
            </button>

            <div className="modal-header">
              <span className="ref-tag num-tabular">{selectedLeadForDetail.ref}</span>
              <h2>Inquiry Details: {selectedLeadForDetail.customerName}</h2>
              <p>Submitted on {new Date(selectedLeadForDetail.createdAt).toLocaleString()}</p>
            </div>

            <div className="lead-detail-body">
              <div className="detail-section">
                <h4>Customer Contact</h4>
                <p><strong>Phone:</strong> <span className="num-tabular">{selectedLeadForDetail.phone}</span></p>
                <p><strong>City:</strong> {selectedLeadForDetail.city}</p>
                <p><strong>Address:</strong> {selectedLeadForDetail.address || 'Not specified'}</p>
                <p><strong>Roof Type:</strong> {selectedLeadForDetail.roofType || 'Standard'}</p>
                {selectedLeadForDetail.notes && (
                  <p><strong>Notes:</strong> {selectedLeadForDetail.notes}</p>
                )}
              </div>

              <div className="detail-section">
                <h4>Selected System Sizing</h4>
                <p><strong>System Size:</strong> <span className="num-tabular">{selectedLeadForDetail.systemKw} kW</span></p>
                <p><strong>Estimated Total:</strong> <span className="num-tabular">PKR {(selectedLeadForDetail.estimatedTotalCost / 100000).toFixed(2)} Lakh (Rs. {Number(selectedLeadForDetail.estimatedTotalCost).toLocaleString()})</span></p>
                <p><strong>Panel:</strong> {selectedLeadForDetail.selectedPanel?.name || 'Selected Module'}</p>
                {selectedLeadForDetail.selectedInverter && (
                  <p><strong>Inverter:</strong> {selectedLeadForDetail.selectedInverter.name}</p>
                )}
                {selectedLeadForDetail.selectedBattery && (
                  <p><strong>Battery:</strong> {selectedLeadForDetail.selectedBattery.name}</p>
                )}
              </div>

              <div className="detail-section">
                <h4>Update Status</h4>
                <select
                  value={selectedLeadForDetail.status}
                  onChange={(e) => {
                    handleUpdateLeadStatus(selectedLeadForDetail.id, e.target.value);
                    setSelectedLeadForDetail({ ...selectedLeadForDetail, status: e.target.value });
                  }}
                  className="status-dropdown"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="quoted">Quoted</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="modal-actions-full">
                <a
                  href={`https://wa.me/${(selectedLeadForDetail.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Assalam o Alaikum ${selectedLeadForDetail.customerName || 'Customer'}! This is ${supplier?.name || 'Solar Partner'}. Regarding your ${selectedLeadForDetail.systemKw} kW solar estimate (Ref: ${selectedLeadForDetail.ref}), we are ready to schedule your site survey.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-wa-cta"
                >
                  <IconWhatsApp size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                  <span>Open in WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedLeadForDetail(null)}
                  className="btn-cancel"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
