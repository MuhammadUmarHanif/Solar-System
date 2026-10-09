import React, { useState, useMemo } from 'react';
import './SupplierDashboardPage.css';
import { useAuth } from '../context/AuthContext';
import { useSupplier } from '../context/SupplierContext';
import { useRouter } from '../context/RouterContext';
import { useTheme } from '../context/ThemeContext';
import dbService from '../services/db';
import {
  IconZap,
  IconBuilding,
  IconShield,
  IconLayers,
  IconTool,
  IconCash,
  IconTrendingUp,
  IconCheck,
  IconCheckCircle,
  IconSettings,
  IconSearch,
  IconWhatsApp,
  IconPhone,
  IconMail,
  IconExternalLink,
  IconLogOut,
  IconX,
  IconTrash
} from '../components/Icons';
import Lightbulb from '../components/Lightbulb';

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
  const { suppliers, activeSupplier, activeSupplierId, addProduct, updateProduct, deleteProduct, deleteLead, updateSupplier, dataVersion } = useSupplier();
  const { theme, toggleTheme } = useTheme();
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
    image: '',
    // Category-specific fields
    // 1. Installation Services:
    serviceScope: 'Turnkey Rooftop (Standard L2/L3)',
    pricingModel: 'per_kw',
    duration: '2-3 Days',
    teamSize: '4 Certified Technicians',
    coverageArea: 'Lahore & Surrounding 50km',
    // 2. Accessories:
    accessoryType: 'Protection & SPDs',
    specRating: '1000V DC 40kA 2-Pole',
    // 3. Other:
    otherClassification: 'Net Metering & DISCO Filing',
    leadTime: '3-5 Working Days',
    guaranteeTerms: '100% DISCO Meter Approval Guarantee'
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
    cityName: supplier?.cityName || '',
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
        cityName: supplier.cityName || '',
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplier, dataVersion]);

  // Fetch Supplier Leads
  const supplierLeads = useMemo(() => {
    if (!supplier) return [];
    return dbService.getLeadsBySupplier(supplier.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const refStr = l.ref || l.id || '';
      const phoneStr = l.customerPhone || l.phone || '';
      const cityStr = l.customerCity || l.city || '';
      const matchQuery = !leadSearch ||
        l.customerName?.toLowerCase().includes(leadSearch.toLowerCase()) ||
        String(phoneStr).includes(leadSearch) ||
        cityStr.toLowerCase().includes(leadSearch.toLowerCase()) ||
        refStr.toLowerCase().includes(leadSearch.toLowerCase());
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
    const targetCat = (productCategoryFilter && productCategoryFilter !== 'all') ? productCategoryFilter : 'panels';
    
    let defaultUnit = 'Module';
    let defaultName = '';
    let defaultPrice = 21500;
    let defaultDesc = '';

    if (targetCat === 'installation') {
      defaultUnit = 'kW';
      defaultName = 'Turnkey Rooftop Solar Installation (L2/L3)';
      defaultPrice = 3500;
      defaultDesc = 'Complete turnkey mechanical and electrical installation, DC stringing, DB termination, grounding pit setup, and inverter commissioning.';
    } else if (targetCat === 'accessories') {
      defaultUnit = 'Piece';
      defaultName = 'DC Surge Protection Device (SPD) 1000V 40kA';
      defaultPrice = 2800;
      defaultDesc = 'Heavy-duty solar DC surge protection device, DIN-rail mounting, visual fault indicator window, IEC 61643-31 compliant.';
    } else if (targetCat === 'other') {
      defaultUnit = 'Job';
      defaultName = 'Turnkey DISCO Net Metering & Green Meter Processing';
      defaultPrice = 45000;
      defaultDesc = 'End-to-end DISCO / NEPRA paperwork filing, distribution transformer NOC, safety inspection escort, and bi-directional meter activation.';
    }

    setProductForm({
      ...initialProductForm,
      category: targetCat,
      name: defaultName,
      unit: defaultUnit,
      price: defaultPrice,
      description: defaultDesc,
      wattage: targetCat === 'installation' || targetCat === 'other' ? 0 : 585,
      voltage: targetCat === 'installation' || targetCat === 'other' ? 0 : 48
    });
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
      unit: prod.unit || (prod.category === 'installation' ? 'kW' : prod.category === 'accessories' ? 'Piece' : prod.category === 'other' ? 'Job' : 'Unit'),
      isAvailable: prod.isAvailable ?? true,
      isActive: prod.isActive ?? true,
      stockCount: prod.stockCount || 0,
      warrantyYears: prod.warrantyYears !== undefined ? prod.warrantyYears : (prod.category === 'installation' ? 1 : 5),
      description: prod.description || '',
      image: prod.image || '',
      // Installation fields:
      serviceScope: prod.serviceScope || 'Turnkey Rooftop (Standard L2/L3)',
      pricingModel: prod.pricingModel || 'per_kw',
      duration: prod.duration || '2-3 Days',
      teamSize: prod.teamSize || '4 Certified Technicians',
      coverageArea: prod.coverageArea || 'Lahore & Surrounding 50km',
      // Accessories fields:
      accessoryType: prod.accessoryType || 'Protection & SPDs',
      specRating: prod.specRating || '',
      // Other fields:
      otherClassification: prod.otherClassification || 'Net Metering & DISCO Filing',
      leadTime: prod.leadTime || prod.duration || '3-5 Working Days',
      guaranteeTerms: prod.guaranteeTerms || ''
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) {
      alert('Please provide product name and price');
      return;
    }

    const cleanedProduct = { ...productForm };
    if (cleanedProduct.category === 'installation' || cleanedProduct.category === 'other') {
      cleanedProduct.wattage = 0;
      cleanedProduct.voltage = 0;
      cleanedProduct.pricePerWatt = 0;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, supplier.id, cleanedProduct);
      showToast(`Updated "${cleanedProduct.name}" successfully!`);
    } else {
      addProduct(supplier.id, cleanedProduct);
      showToast(`Added "${cleanedProduct.name}" to inventory!`);
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

  // Lead Delete Handler
  const handleDeleteLead = (leadId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this customer inquiry? This cannot be undone.')) return;
    deleteLead(leadId, supplier.id);
    if (selectedLeadForDetail && selectedLeadForDetail.id === leadId) {
      setSelectedLeadForDetail(null);
    }
    showToast('Customer inquiry deleted successfully');
  };

  // Settings Save
  const handleSaveCompanySettings = (e) => {
    e.preventDefault();
    updateSupplier(supplier.id, companySettings);
    showToast('Company profile & WhatsApp configuration saved!');
  };

  // Calculator Settings Save
  const handleSaveCalcSettings = (e) => {
    e.preventDefault();
    updateSupplier(supplier.id, { calculatorConfig: calcSettings });
    showToast('Dynamic calculator parameters updated successfully!');
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
          <div className="dash-avatar" aria-label={supplier.name}>
            <span>{supplier.name.charAt(0)}</span>
          </div>
          <div className="dash-brand-details">
            <div className="dash-title-row">
              <h1 className="dash-company-name">{supplier.name}</h1>
              <span className="dash-plan-badge">
                Company Portal
              </span>
              <span className={`dash-status-dot status-${supplier.status}`}>
                <span className="live-ping-dot" />
                <span>{supplier.status === 'active' ? 'System Live' : 'Maintenance'}</span>
              </span>
            </div>
            <div className="dash-company-meta">
              <span className="meta-item">
                <IconBuilding size={13} className="meta-icon" />
                <span>{supplier.cityName}</span>
              </span>
              {supplier.pecReg && (
                <span className="meta-item">
                  <IconShield size={13} className="meta-icon" />
                  <span>{supplier.pecReg}</span>
                </span>
              )}
              <span className="meta-item">
                <IconWhatsApp size={13} className="meta-icon" />
                <span>+{supplier.whatsapp}</span>
              </span>
              <span className="meta-item meta-email">
                <IconMail size={13} className="meta-icon" />
                <span>{supplier.email}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="dash-header-actions">
          <Lightbulb
            onClick={toggleTheme}
            className="btn-dash-action btn-dash-theme-toggle"
            toggled={theme === 'dark'}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </Lightbulb>
          <button 
            type="button" 
            onClick={() => router.navigate('/')} 
            className="btn-dash-action btn-view-public"
            title="View your public solar website and calculator"
          >
            <span>Live Website</span>
            <IconExternalLink size={14} />
          </button>
          <button 
            type="button" 
            onClick={() => { logout(); router.navigate('/'); }} 
            className="btn-dash-action btn-dash-logout"
            title="Logout of admin portal"
          >
            <IconLogOut size={14} />
            <span>Logout</span>
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
          <IconTrendingUp size={15} />
          <span>Overview & Metrics</span>
        </button>
        <button
          type="button"
          className={`dash-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <IconLayers size={15} />
          <span>Product Catalog</span>
          <span className="tab-count-pill">{supplierProducts.length}</span>
        </button>
        <button
          type="button"
          className={`dash-tab-btn ${activeTab === 'leads' ? 'active' : ''}`}
          onClick={() => setActiveTab('leads')}
        >
          <IconZap size={15} />
          <span>Leads & CRM</span>
          <span className="tab-count-pill">{supplierLeads.length}</span>
          {metrics.newLeads > 0 && <span className="tab-pill-alert">+{metrics.newLeads} new</span>}
        </button>
        <button
          type="button"
          className={`dash-tab-btn ${activeTab === 'calculator' ? 'active' : ''}`}
          onClick={() => setActiveTab('calculator')}
        >
          <IconSettings size={15} />
          <span>Calculator Engine</span>
        </button>
        <button
          type="button"
          className={`dash-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <IconBuilding size={15} />
          <span>Company Profile</span>
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
                <div className="kpi-card-header">
                  <span className="kpi-label">Total Inquiries</span>
                  <div className="kpi-icon-wrap icon-cyan">
                    <IconZap size={18} />
                  </div>
                </div>
                <div className="kpi-card-body">
                  <strong className="kpi-value num-tabular">{metrics.totalLeads}</strong>
                  <div className="kpi-tag tag-emerald">
                    <span className="tag-pulse" />
                    <span>+{metrics.newLeads} new awaiting response</span>
                  </div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-card-header">
                  <span className="kpi-label">Confirmed Bookings</span>
                  <div className="kpi-icon-wrap icon-emerald">
                    <IconCheckCircle size={18} />
                  </div>
                </div>
                <div className="kpi-card-body">
                  <strong className="kpi-value num-tabular">{metrics.confirmedBookings}</strong>
                  <div className="kpi-tag tag-cyan">
                    <span>{metrics.totalLeads > 0 ? Math.round((metrics.confirmedBookings / metrics.totalLeads) * 100) : 0}% Conversion Rate</span>
                  </div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-card-header">
                  <span className="kpi-label">Pipeline Project Value</span>
                  <div className="kpi-icon-wrap icon-amber">
                    <IconCash size={18} />
                  </div>
                </div>
                <div className="kpi-card-body">
                  <strong className="kpi-value num-tabular">PKR {(metrics.totalGmv / 100000).toFixed(1)} Lakh</strong>
                  <div className="kpi-tag tag-amber">
                    <span>Turnkey solar pipeline</span>
                  </div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-card-header">
                  <span className="kpi-label">Active Hardware Items</span>
                  <div className="kpi-icon-wrap icon-purple">
                    <IconLayers size={18} />
                  </div>
                </div>
                <div className="kpi-card-body">
                  <strong className="kpi-value num-tabular">{metrics.activeProductsCount} Items</strong>
                  <div className="kpi-tag tag-muted">
                    <span>Panels, Inverters, Batteries</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Leads Preview */}
            <div className="section-card">
              <div className="section-card-header">
                <div>
                  <div className="section-title-row">
                    <h3>Recent Customer Inquiries</h3>
                    <span className="section-pill-badge">Live CRM</span>
                  </div>
                  <p>Latest estimates generated through your public solar calculator.</p>
                </div>
                <button type="button" onClick={() => setActiveTab('leads')} className="btn-view-all">
                  <span>View All Leads ({supplierLeads.length})</span>
                  <IconExternalLink size={13} />
                </button>
              </div>

              {supplierLeads.length === 0 ? (
                <div className="empty-state">
                  <p>No customer inquiries yet. Leads will automatically appear here once customers calculate estimates.</p>
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
                        <th>Direct Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supplierLeads.slice(0, 5).map(lead => {
                        const refLabel = lead.ref || lead.id || 'LEAD';
                        const phone = lead.customerPhone || lead.phone || '';
                        const city = lead.customerCity || lead.city || '';
                        const waNumber = (lead.customerWhatsApp || lead.customerPhone || lead.phone || '').replace(/[^0-9]/g, '');
                        const panelName = lead.selectedProducts?.find(p => p.category === 'panels')?.name || lead.selectedPanel?.name || 'Tier-1 Solar Panels';

                        return (
                          <tr key={lead.id}>
                            <td><span className="ref-tag">{refLabel}</span></td>
                            <td>
                              <strong className="customer-name">{lead.customerName}</strong>
                              <div className="cell-sub">
                                {phone && <span>{phone}</span>}
                                {phone && city && <span> • </span>}
                                {city && <span>{city}</span>}
                              </div>
                            </td>
                            <td>
                              <span className="kw-badge">{lead.systemKw} kW</span>
                              <div className="cell-sub">{panelName}</div>
                            </td>
                            <td>
                              <strong className="price-tag num-tabular">PKR {(lead.estimatedTotalCost / 100000).toFixed(2)} Lakh</strong>
                            </td>
                            <td>
                              <span className={`status-pill pill-${lead.status}`}>
                                {lead.status.toUpperCase()}
                              </span>
                            </td>
                            <td>
                              <a
                                href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Assalam o Alaikum ${lead.customerName || 'Customer'}! This is ${supplier.name}. We received your solar inquiry for ${lead.systemKw} kW system (Ref: ${refLabel}). When can we schedule your roof survey?`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-wa-table"
                              >
                                <IconWhatsApp size={13} />
                                <span>WhatsApp</span>
                              </a>
                            </td>
                          </tr>
                        );
                      })}
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
                            <div className="cell-sub">
                              {prod.category === 'installation' ? (
                                `${prod.serviceScope || 'Turnkey Installation'}${prod.coverageArea ? ` • ${prod.coverageArea}` : ''}`
                              ) : prod.category === 'accessories' ? (
                                `${prod.brand ? `${prod.brand} • ` : ''}${prod.model || prod.accessoryType || 'Accessory'}`
                              ) : prod.category === 'other' ? (
                                `${prod.otherClassification || prod.brand || 'Custom Service'}${prod.leadTime ? ` • ${prod.leadTime}` : ''}`
                              ) : (
                                `${prod.brand || ''} ${prod.model ? `• ${prod.model}` : ''}`
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="cat-badge">{prod.category}</span>
                          </td>
                          <td>
                            {prod.category === 'installation' ? (
                              <div>
                                <div><strong>{prod.serviceScope || 'Turnkey Installation'}</strong></div>
                                <div className="cell-sub">
                                  {prod.duration && `⏱ ${prod.duration}`}
                                  {prod.warrantyYears ? ` • ${prod.warrantyYears}Y Workmanship` : ' • Workmanship Guaranteed'}
                                  {prod.teamSize ? ` • ${prod.teamSize}` : ''}
                                </div>
                              </div>
                            ) : prod.category === 'accessories' ? (
                              <div>
                                <div><strong>{prod.specRating || prod.accessoryType || 'Standard Spec'}</strong></div>
                                <div className="cell-sub">
                                  {prod.accessoryType || 'BOS Hardware'}
                                  {prod.warrantyYears ? ` • ${prod.warrantyYears}Y Warranty` : ''}
                                </div>
                              </div>
                            ) : prod.category === 'other' ? (
                              <div>
                                <div><strong>{prod.otherClassification || 'Custom Solution'}</strong></div>
                                <div className="cell-sub">
                                  {prod.leadTime || prod.duration || 'Standard'}
                                  {prod.guaranteeTerms ? ` • ${prod.guaranteeTerms}` : ''}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div>
                                  {prod.wattage > 0 && <span>{prod.wattage}W </span>}
                                  {prod.voltage > 0 && <span>• {prod.voltage}V </span>}
                                  {prod.pricePerWatt > 0 && <span className="ppw-text">(@ Rs.{prod.pricePerWatt}/W)</span>}
                                </div>
                                <div className="cell-sub">{prod.type || `${prod.warrantyYears}Y Warranty`}</div>
                              </div>
                            )}
                          </td>
                          <td>
                            <strong className="price-tag">PKR {Number(prod.price).toLocaleString()}</strong>
                            <div className="cell-sub">per {prod.unit || (prod.category === 'installation' ? 'kW' : prod.category === 'accessories' ? 'piece' : prod.category === 'other' ? 'job' : 'unit')}</div>
                          </td>
                          <td>
                            <span className={`stock-badge ${prod.isAvailable ? 'in-stock' : 'out-of-stock'}`}>
                              {prod.category === 'installation' || prod.category === 'other'
                                ? (prod.isAvailable ? 'Available' : 'Unavailable')
                                : (prod.isAvailable ? `In Stock (${prod.stockCount ?? 'Avail'})` : 'Out of Stock')
                              }
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
                      filteredLeads.map(lead => {
                        const refLabel = lead.ref || lead.id || 'LEAD';
                        const phone = lead.customerPhone || lead.phone || '';
                        const city = lead.customerCity || lead.city || '';
                        const address = lead.customerAddress || lead.address || '';
                        const waNumber = (lead.customerWhatsApp || lead.customerPhone || lead.phone || '').replace(/[^0-9]/g, '');
                        const panelName = lead.selectedProducts?.find(p => p.category === 'panels')?.name || lead.selectedPanel?.name || 'Tier-1 Solar Panels';
                        const inverterName = lead.selectedProducts?.find(p => p.category === 'inverters')?.name || lead.selectedInverter?.name;
                        const batteryName = lead.selectedProducts?.find(p => p.category === 'batteries')?.name || lead.selectedBattery?.name;

                        return (
                          <tr key={lead.id}>
                            <td>
                              <span className="ref-tag">{refLabel}</span>
                              <div className="cell-sub">{new Date(lead.createdAt).toLocaleDateString()}</div>
                            </td>
                            <td>
                              <strong className="customer-name">{lead.customerName}</strong>
                              {phone && (
                                <div className="cell-sub">
                                  <IconPhone size={11} style={{ verticalAlign: 'middle', marginRight: '4px', color: '#38bdf8' }} />
                                  <span className="num-tabular">{phone}</span>
                                </div>
                              )}
                              {city && (
                                <div className="cell-sub">
                                  <IconBuilding size={11} style={{ verticalAlign: 'middle', marginRight: '4px', color: '#38bdf8' }} />
                                  <span>{city}{address ? ` • ${address}` : ''}</span>
                                </div>
                              )}
                            </td>
                            <td>
                              <span className="kw-badge num-tabular">{lead.systemKw} kW System</span>
                              <div className="cell-sub">
                                {panelName}
                                {inverterName && ` • ${inverterName}`}
                                {batteryName && ` • ${batteryName}`}
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
                                  href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                                    `Assalam o Alaikum ${lead.customerName || 'Customer'}!\n` +
                                    `This is ${supplier.name} regarding your solar calculation on our website (Ref: ${refLabel}).\n\n` +
                                    `System Size: ${lead.systemKw} kW\n` +
                                    `Estimated Cost: PKR ${(lead.estimatedTotalCost / 100000).toFixed(2)} Lakh\n` +
                                    `Location: ${city}\n\n` +
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
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteLead(lead.id, e)}
                                  className="btn-delete-lead-table"
                                  title="Delete Customer Inquiry"
                                >
                                  <IconTrash size={13} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
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
                    <IconCheck size={16} />
                    <span>Save Calculation Parameters</span>
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
                  <label>Operational City / Hub</label>
                  <input
                    type="text"
                    placeholder="e.g. Pakistan (Lahore, Islamabad, Karachi)"
                    value={companySettings.cityName}
                    onChange={(e) => setCompanySettings({ ...companySettings, cityName: e.target.value })}
                  />
                  <small>Displayed in official quotes and customer headers.</small>
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
              <h2>
                {editingProduct
                  ? `Edit ${productForm.category === 'installation' ? 'Installation Service' : productForm.category === 'accessories' ? 'Accessory' : productForm.category === 'other' ? 'Custom Service' : 'Product'}`
                  : productForm.category === 'installation'
                    ? 'Add Installation Service'
                    : productForm.category === 'accessories'
                      ? 'Add Solar Accessory'
                      : productForm.category === 'other'
                        ? 'Add Custom Service / Other Item'
                        : 'Add New Solar Product'
                }
              </h2>
              <p>
                {productForm.category === 'installation'
                  ? 'Define turnkey solar installation rates, project timelines, crew capacity, and workmanship warranties.'
                  : productForm.category === 'accessories'
                    ? 'Configure SPDs, circuit breakers, MC4 connectors, earthing rods, conduits, and monitoring meters.'
                    : productForm.category === 'other'
                      ? 'Add Net Metering filing, drone shading surveys, custom fabrication, and specialized EPC services.'
                      : 'Items added here will appear in your public catalog and instant solar calculator.'}
              </p>
            </div>

            <form onSubmit={handleSaveProduct} className="modal-form-grid">
              {/* Category Selector */}
              <div className="form-group form-group-full">
                <label>Product Category *</label>
                <select
                  value={productForm.category}
                  onChange={(e) => {
                    const nextCat = e.target.value;
                    let nextUnit = productForm.unit;
                    let nextName = productForm.name;
                    let nextPrice = productForm.price;
                    let nextDesc = productForm.description;

                    if (nextCat === 'installation') {
                      if (!productForm.unit || productForm.unit === 'Module' || productForm.unit === 'Piece') nextUnit = 'kW';
                      if (!editingProduct) {
                        nextName = 'Turnkey Rooftop Solar Installation (L2/L3)';
                        nextPrice = 3500;
                        nextDesc = 'Complete turnkey mechanical and electrical installation, DC stringing, DB termination, grounding pit setup, and inverter commissioning.';
                      }
                    } else if (nextCat === 'accessories') {
                      if (!productForm.unit || productForm.unit === 'Module' || productForm.unit === 'kW' || productForm.unit === 'Job') nextUnit = 'Piece';
                      if (!editingProduct) {
                        nextName = 'DC Surge Protection Device (SPD) 1000V 40kA';
                        nextPrice = 2800;
                        nextDesc = 'Heavy-duty solar DC surge protection device, DIN-rail mounting, visual fault indicator window, IEC 61643-31 compliant.';
                      }
                    } else if (nextCat === 'other') {
                      if (!productForm.unit || productForm.unit === 'Module' || productForm.unit === 'kW' || productForm.unit === 'Piece') nextUnit = 'Job';
                      if (!editingProduct) {
                        nextName = 'Turnkey DISCO Net Metering & Green Meter Processing';
                        nextPrice = 45000;
                        nextDesc = 'End-to-end DISCO / NEPRA paperwork filing, distribution transformer NOC, safety inspection escort, and bi-directional meter activation.';
                      }
                    } else if (nextCat === 'panels') {
                      if (productForm.unit === 'kW' || productForm.unit === 'Job') nextUnit = 'Module';
                    }

                    setProductForm(prev => ({
                      ...prev,
                      category: nextCat,
                      unit: nextUnit,
                      name: nextName,
                      price: nextPrice,
                      description: nextDesc
                    }));
                  }}
                >
                  <option value="panels">Solar Panels</option>
                  <option value="inverters">Inverters</option>
                  <option value="batteries">Batteries</option>
                  <option value="mounting">Mounting & Structure</option>
                  <option value="cables">Cables & Wiring</option>
                  <option value="protection">Protection & SPDs</option>
                  <option value="installation">Installation Services</option>
                  <option value="accessories">Accessories</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Dynamic Category Notice Banner */}
              {productForm.category === 'installation' && (
                <div className="form-cat-notice installation">
                  <div className="form-cat-notice-content">
                    <span className="form-cat-notice-title">Installation Services Mode</span>
                    <span className="form-cat-notice-desc">Form adapted for turnkey site labor, structural fabrication, earthing pits, and commissioning timelines.</span>
                  </div>
                  <span className="form-cat-pill-badge installation">Services</span>
                </div>
              )}

              {productForm.category === 'accessories' && (
                <div className="form-cat-notice accessories">
                  <div className="form-cat-notice-content">
                    <span className="form-cat-notice-title">Solar Accessories & BOS Mode</span>
                    <span className="form-cat-notice-desc">Form adapted for SPDs, breakers, MC4 connectors, earthing materials, conduits, and monitoring meters.</span>
                  </div>
                  <span className="form-cat-pill-badge accessories">Accessories</span>
                </div>
              )}

              {productForm.category === 'other' && (
                <div className="form-cat-notice other">
                  <div className="form-cat-notice-content">
                    <span className="form-cat-notice-title">Custom Solutions & Other Services Mode</span>
                    <span className="form-cat-notice-desc">Form adapted for DISCO net metering filings, drone shading surveys, audits, and custom metal fabrication.</span>
                  </div>
                  <span className="form-cat-pill-badge other">Custom</span>
                </div>
              )}

              {!['installation', 'accessories', 'other'].includes(productForm.category) && (
                <div className="form-cat-notice hardware">
                  <div className="form-cat-notice-content">
                    <span className="form-cat-notice-title">Solar Hardware Specification Mode</span>
                    <span className="form-cat-notice-desc">Form adapted for technical electrical ratings, wattage, DC voltage, and per-watt pricing calculations.</span>
                  </div>
                  <span className="form-cat-pill-badge hardware">Hardware</span>
                </div>
              )}

              {/* ================= CATEGORY 1: INSTALLATION SERVICES ================= */}
              {productForm.category === 'installation' && (
                <>
                  <div className="form-group form-group-full">
                    <label>Service / Package Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Turnkey Rooftop Solar Installation (L2/L3 Standard)"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Installation Scope / Structure Type *</label>
                    <select
                      value={productForm.serviceScope}
                      onChange={(e) => setProductForm({ ...productForm, serviceScope: e.target.value })}
                    >
                      <option value="Turnkey Rooftop (Standard L2/L3)">Turnkey Rooftop (Standard L2/L3)</option>
                      <option value="Elevated Walkable Shed Structure (10-12ft)">Elevated Walkable Shed Structure (10-12ft)</option>
                      <option value="Heavy Ground Mount / Foundation">Heavy Ground Mount / Foundation</option>
                      <option value="Commercial & Industrial (C&I) Turnkey">Commercial & Industrial (C&I) Turnkey</option>
                      <option value="Earthing Pit Boring & Lightning Arrestor">Earthing Pit Boring & Lightning Arrestor</option>
                      <option value="Net Metering DISCO Approvals & Commissioning">Net Metering DISCO Approvals & Commissioning</option>
                      <option value="Operations & Maintenance (O&M) / Panel Wash">Operations & Maintenance (O&M) / Panel Wash</option>
                      <option value="Electrical & Inverter Wiring Only">Electrical & Inverter Wiring Only</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Billing Model / Pricing Basis *</label>
                    <select
                      value={productForm.pricingModel}
                      onChange={(e) => {
                        const pm = e.target.value;
                        let newUnit = productForm.unit;
                        if (pm === 'per_kw') newUnit = 'kW';
                        else if (pm === 'per_watt') newUnit = 'Watt';
                        else if (pm === 'fixed_job') newUnit = 'Job';
                        else if (pm === 'per_day') newUnit = 'Day';
                        setProductForm({ ...productForm, pricingModel: pm, unit: newUnit });
                      }}
                    >
                      <option value="per_kw">Per kW Capacity (e.g. Rs. 3,500 / kW)</option>
                      <option value="per_watt">Per Watt (e.g. Rs. 3.5 / Watt)</option>
                      <option value="fixed_job">Fixed Project / Site Lump Sum</option>
                      <option value="per_day">Per Day / Site Visit</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Service Rate (PKR) *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 3500 for per kW, 45000 for turnkey job"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Billing Unit Label</label>
                    <input
                      type="text"
                      placeholder="e.g. kW, Watt, Job, Day"
                      value={productForm.unit}
                      onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Estimated Project Timeline</label>
                    <select
                      value={productForm.duration}
                      onChange={(e) => setProductForm({ ...productForm, duration: e.target.value })}
                    >
                      <option value="1-2 Days">1 - 2 Days</option>
                      <option value="3-5 Days">3 - 5 Days</option>
                      <option value="1 Week">1 Week</option>
                      <option value="2-3 Weeks">2 - 3 Weeks</option>
                      <option value="Site Dependent">Site Dependent / Fast Track</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Crew / Team Size & Personnel</label>
                    <input
                      type="text"
                      placeholder="e.g. 4 Certified Solar Electricians + Structure Fabricator"
                      value={productForm.teamSize}
                      onChange={(e) => setProductForm({ ...productForm, teamSize: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Workmanship Warranty (Years)</label>
                    <input
                      type="number"
                      placeholder="e.g. 1 Year Workmanship Guarantee"
                      value={productForm.warrantyYears}
                      onChange={(e) => setProductForm({ ...productForm, warrantyYears: parseInt(e.target.value, 10) || 0 })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Service Coverage Hub / Region</label>
                    <input
                      type="text"
                      placeholder="e.g. Lahore & 50km Radius, All Punjab, Nationwide"
                      value={productForm.coverageArea}
                      onChange={(e) => setProductForm({ ...productForm, coverageArea: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Booking Status & Visibility</label>
                    <div className="checkbox-row">
                      <label className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={productForm.isAvailable}
                          onChange={(e) => setProductForm({ ...productForm, isAvailable: e.target.checked })}
                        />
                        <span>Available for Booking</span>
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
                    <label>Service Deliverables & Inclusions</label>
                    <textarea
                      rows="3"
                      placeholder="Detail what is included: e.g. DC string cabling & PVC conduits, AC/DC DB termination, inverter testing, earthing pit resistance measurement (< 5 ohms), mobile WiFi monitoring setup, DISCO readiness check..."
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    />
                  </div>
                </>
              )}

              {/* ================= CATEGORY 2: ACCESSORIES ================= */}
              {productForm.category === 'accessories' && (
                <>
                  <div className="form-group form-group-full">
                    <label>Accessory Item Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. DC Surge Protection Device (SPD) 1000V 40kA 2P"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Accessory Sub-Category *</label>
                    <select
                      value={productForm.accessoryType}
                      onChange={(e) => setProductForm({ ...productForm, accessoryType: e.target.value })}
                    >
                      <option value="Protection & SPDs">Protection & SPDs (Surge, Breakers, Fuses)</option>
                      <option value="Connectors & Clamps">Connectors & Clamps (MC4s, Mid/End Clamps)</option>
                      <option value="Earthing & Lightning">Earthing & Lightning (Rods, Chemical Bore, Arrestor)</option>
                      <option value="Conduits & Cable Management">Conduits, Trays & Cable Management</option>
                      <option value="Distribution Boxes">Distribution Boxes & IP65 Weatherproof DBs</option>
                      <option value="Monitoring & Smart Meters">Monitoring, IoT & Smart Energy Meters</option>
                      <option value="Panel Cleaning Tools">Panel Cleaning Tools & Water Kits</option>
                      <option value="General Fasteners & Hardware">General Fasteners, Bolts & Hardware</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Brand / Manufacturer</label>
                    <input
                      type="text"
                      placeholder="e.g. Suntree, Schneider, Chint, TOMZN, Phoenix Contact"
                      value={productForm.brand}
                      onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Model / Part Number</label>
                    <input
                      type="text"
                      placeholder="e.g. SUP2H-PV 1000V, MC4-4SQ"
                      value={productForm.model}
                      onChange={(e) => setProductForm({ ...productForm, model: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Technical Specifications / Rating</label>
                    <input
                      type="text"
                      placeholder="e.g. 1000V DC, 20-40kA, 2-Pole, DIN-Rail or 4-6mm² IP68"
                      value={productForm.specRating}
                      onChange={(e) => setProductForm({ ...productForm, specRating: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Packaging / Sales Unit</label>
                    <select
                      value={productForm.unit}
                      onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    >
                      <option value="Piece">Piece</option>
                      <option value="Pair / Set">Pair / Set</option>
                      <option value="Meter">Meter</option>
                      <option value="Roll (100m)">Roll (100m)</option>
                      <option value="Pack of 10">Pack of 10</option>
                      <option value="Box / Kit">Box / Kit</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Price (PKR) *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 2800"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Available Stock Quantity</label>
                    <input
                      type="number"
                      placeholder="e.g. 150"
                      value={productForm.stockCount}
                      onChange={(e) => setProductForm({ ...productForm, stockCount: parseInt(e.target.value, 10) || 0 })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Product Warranty (Years)</label>
                    <input
                      type="number"
                      placeholder="e.g. 1 or 2 Years"
                      value={productForm.warrantyYears}
                      onChange={(e) => setProductForm({ ...productForm, warrantyYears: parseInt(e.target.value, 10) || 0 })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Availability & Stock Status</label>
                    <div className="checkbox-row">
                      <label className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={productForm.isAvailable}
                          onChange={(e) => setProductForm({ ...productForm, isAvailable: e.target.checked })}
                        />
                        <span>In Stock</span>
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
                    <label>Technical Description & Compatibility</label>
                    <textarea
                      rows="3"
                      placeholder="Describe specs: e.g. Flame-retardant PBT housing, visual status indicator window, IEC 61643-31 compliant, DIN-rail mounting..."
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    />
                  </div>
                </>
              )}

              {/* ================= CATEGORY 3: OTHER / CUSTOM SERVICES ================= */}
              {productForm.category === 'other' && (
                <>
                  <div className="form-group form-group-full">
                    <label>Item / Service Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Turnkey DISCO Net Metering & Green Meter Processing"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Service Classification *</label>
                    <select
                      value={productForm.otherClassification}
                      onChange={(e) => setProductForm({ ...productForm, otherClassification: e.target.value })}
                    >
                      <option value="Net Metering & DISCO Filing">Net Metering & DISCO Regulatory Filing</option>
                      <option value="Site Survey & 3D Drone Shading">Site Survey, 3D Drone & Shading Study</option>
                      <option value="Custom Steel Walkway Fabrication">Custom Steel / GI Walkway Fabrication</option>
                      <option value="Third-Party Solar Audit">Third-Party Solar Audit & Thermal Camera Inspection</option>
                      <option value="Annual Maintenance Contract (AMC)">Annual Maintenance Contract (AMC)</option>
                      <option value="Solar Cleaning High-Pressure Kit">Solar Automated Cleaning & High-Pressure Kit</option>
                      <option value="Specialized Spares & Miscellaneous">Specialized Spares & Miscellaneous Services</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Provider / Engineering Team</label>
                    <input
                      type="text"
                      placeholder="e.g. In-House Certified Engineers, DISCO Consultant"
                      value={productForm.brand}
                      onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Pricing Basis & Unit</label>
                    <select
                      value={productForm.unit}
                      onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    >
                      <option value="Job">Per Project / Job</option>
                      <option value="Survey">Per Site Visit / Survey</option>
                      <option value="kW">Per System kW</option>
                      <option value="Year">Per Year (Annual AMC)</option>
                      <option value="Month">Per Month</option>
                      <option value="Unit">Per Unit / Piece</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Total Price (PKR) *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 45000"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Turnaround Time / Lead Days</label>
                    <input
                      type="text"
                      placeholder="e.g. 3-5 Working Days, 2-4 Weeks for DISCO approval"
                      value={productForm.leadTime}
                      onChange={(e) => setProductForm({ ...productForm, leadTime: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Guarantee / Validity Terms</label>
                    <input
                      type="text"
                      placeholder="e.g. 100% DISCO Meter Approval Guarantee, Valid for 6 Months"
                      value={productForm.guaranteeTerms}
                      onChange={(e) => setProductForm({ ...productForm, guaranteeTerms: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Warranty (Years)</label>
                    <input
                      type="number"
                      placeholder="e.g. 1 Year Guarantee"
                      value={productForm.warrantyYears}
                      onChange={(e) => setProductForm({ ...productForm, warrantyYears: parseInt(e.target.value, 10) || 0 })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Availability & Service Status</label>
                    <div className="checkbox-row">
                      <label className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={productForm.isAvailable}
                          onChange={(e) => setProductForm({ ...productForm, isAvailable: e.target.checked })}
                        />
                        <span>Available for Booking</span>
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
                    <label>Deliverables & Detailed Scope of Work</label>
                    <textarea
                      rows="3"
                      placeholder="e.g. Complete DISCO application preparation, load extension sanctioning, distribution transformer NOC, safety inspection representation, and green bi-directional meter activation..."
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    />
                  </div>
                </>
              )}

              {/* ================= CATEGORY 4: STANDARD SOLAR HARDWARE ================= */}
              {!['installation', 'accessories', 'other'].includes(productForm.category) && (
                <>
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
                </>
              )}

              <div className="modal-actions-full">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-save">
                  {editingProduct ? 'Save Changes' : 'Create & Publish'}
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
              <span className="ref-tag num-tabular">{selectedLeadForDetail.ref || selectedLeadForDetail.id || 'LEAD'}</span>
              <h2>Inquiry Details: {selectedLeadForDetail.customerName}</h2>
              <p>Submitted on {new Date(selectedLeadForDetail.createdAt).toLocaleString()}</p>
            </div>

            <div className="lead-detail-body">
              <div className="detail-section">
                <h4>Customer Contact</h4>
                <p><strong>Phone:</strong> <span className="num-tabular">{selectedLeadForDetail.customerPhone || selectedLeadForDetail.phone || selectedLeadForDetail.whatsappNumber || selectedLeadForDetail.customerWhatsApp || 'Not provided'}</span></p>
                {(selectedLeadForDetail.customerWhatsApp || selectedLeadForDetail.whatsappNumber) && (
                  <p><strong>WhatsApp:</strong> <span className="num-tabular">{selectedLeadForDetail.customerWhatsApp || selectedLeadForDetail.whatsappNumber}</span></p>
                )}
                <p><strong>City:</strong> {selectedLeadForDetail.customerCity || selectedLeadForDetail.city || 'Pakistan'}</p>
                <p><strong>Roof / Site Address:</strong> {selectedLeadForDetail.customerAddress || selectedLeadForDetail.address || selectedLeadForDetail.roofAddress || 'Not specified'}</p>
                <p><strong>Roof Structure Type:</strong> {selectedLeadForDetail.roofType || selectedLeadForDetail.roofStructure || 'Standard Rooftop'}</p>
                {(selectedLeadForDetail.customerNotes || selectedLeadForDetail.notes) && (
                  <p><strong>Customer Notes:</strong> {selectedLeadForDetail.customerNotes || selectedLeadForDetail.notes}</p>
                )}
              </div>

              <div className="detail-section">
                <h4>Selected System Sizing & Equipment Specs</h4>
                <p><strong>System Size:</strong> <span className="num-tabular">{selectedLeadForDetail.systemKw} kW ({selectedLeadForDetail.systemType ? selectedLeadForDetail.systemType.toUpperCase() : 'System'})</span></p>
                <p><strong>Estimated Total:</strong> <span className="num-tabular">PKR {(selectedLeadForDetail.estimatedTotalCost / 100000).toFixed(2)} Lakh (Rs. {Number(selectedLeadForDetail.estimatedTotalCost || 0).toLocaleString()})</span></p>
                <p>
                  <strong>Plates Quantity:</strong>{' '}
                  <span className="num-tabular">
                    {selectedLeadForDetail.numberOfPanels || Math.ceil(((selectedLeadForDetail.systemKw || 5) * 1000) / 585)} Plates
                  </span>
                </p>
                <p>
                  <strong>Solar Panel Model:</strong>{' '}
                  {selectedLeadForDetail.selectedPanel?.name ||
                   selectedLeadForDetail.selectedProducts?.find(p => p.category === 'panels')?.name ||
                   'Tier-1 Mono TOPCon 585W Modules'}{' '}
                  {selectedLeadForDetail.selectedPanel?.brand ? `(${selectedLeadForDetail.selectedPanel.brand})` : ''}
                </p>
                <p>
                  <strong>Solar Inverter:</strong>{' '}
                  {selectedLeadForDetail.selectedInverter?.name ||
                   selectedLeadForDetail.selectedProducts?.find(p => p.category === 'inverters')?.name ||
                   `${selectedLeadForDetail.systemKw || 5} kW Dual MPPT Tier-1 Inverter`}
                </p>
                {selectedLeadForDetail.systemType === 'hybrid' ? (
                  <p>
                    <strong>Battery Storage:</strong>{' '}
                    {selectedLeadForDetail.selectedBattery?.name ||
                     selectedLeadForDetail.selectedProducts?.find(p => p.category === 'batteries')?.name ||
                     'Lithium LiFePO4 Backup Battery Bank'}
                  </p>
                ) : (
                  <p><strong>Battery:</strong> None (On-Grid Net Metered Direct DISCO Export)</p>
                )}
                <p>
                  <strong>Mounting Structure:</strong>{' '}
                  {selectedLeadForDetail.selectedStructure?.name ||
                   (typeof selectedLeadForDetail.selectedStructure === 'string' ? selectedLeadForDetail.selectedStructure : null) ||
                   selectedLeadForDetail.roofType ||
                   'Standard Galvanized Steel Rooftop Structure'}
                </p>

                {/* Complete Itemized Cost Breakdown */}
                <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed rgba(255,255,255,0.12)' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.04em', marginBottom: '8px', textTransform: 'uppercase' }}>
                    Quotation & Cost Breakdown (A-to-Z):
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontSize: '12.5px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '7px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ color: '#94a3b8' }}>Panels Cost: </span>
                      <strong className="num-tabular" style={{ color: '#f1f5f9' }}>
                        PKR {Number(selectedLeadForDetail.panelsCost || Math.round((selectedLeadForDetail.estimatedTotalCost || 600000) * 0.44)).toLocaleString()}
                      </strong>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '7px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ color: '#94a3b8' }}>Inverter Cost: </span>
                      <strong className="num-tabular" style={{ color: '#f1f5f9' }}>
                        PKR {Number(selectedLeadForDetail.inverterCost || Math.round((selectedLeadForDetail.estimatedTotalCost || 600000) * 0.25)).toLocaleString()}
                      </strong>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '7px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ color: '#94a3b8' }}>Structure: </span>
                      <strong className="num-tabular" style={{ color: '#f1f5f9' }}>
                        PKR {Number(selectedLeadForDetail.structureCost || Math.round((selectedLeadForDetail.estimatedTotalCost || 600000) * 0.10)).toLocaleString()}
                      </strong>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '7px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ color: '#94a3b8' }}>Cables & BOS: </span>
                      <strong className="num-tabular" style={{ color: '#f1f5f9' }}>
                        PKR {Number(selectedLeadForDetail.cablesAndProtections || Math.round((selectedLeadForDetail.estimatedTotalCost || 600000) * 0.08)).toLocaleString()}
                      </strong>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '7px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ color: '#94a3b8' }}>Net Metering: </span>
                      <strong className="num-tabular" style={{ color: '#f1f5f9' }}>
                        PKR {Number(selectedLeadForDetail.netMeteringCost || 85000).toLocaleString()}
                      </strong>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '7px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ color: '#94a3b8' }}>Labor & Installation: </span>
                      <strong className="num-tabular" style={{ color: '#f1f5f9' }}>
                        PKR {Number(selectedLeadForDetail.installationLabor || Math.round((selectedLeadForDetail.estimatedTotalCost || 600000) * 0.06)).toLocaleString()}
                      </strong>
                    </div>
                  </div>
                </div>
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
                  href={`https://wa.me/${(selectedLeadForDetail.customerWhatsApp || selectedLeadForDetail.customerPhone || selectedLeadForDetail.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Assalam o Alaikum ${selectedLeadForDetail.customerName || 'Customer'}! This is ${supplier?.name || 'Solar Partner'}. Regarding your ${selectedLeadForDetail.systemKw} kW solar estimate (Ref: ${selectedLeadForDetail.ref || selectedLeadForDetail.id}), we are ready to schedule your site survey.`
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
                  onClick={() => handleDeleteLead(selectedLeadForDetail.id)}
                  className="btn-delete-modal-cta"
                  title="Delete this customer inquiry permanently"
                >
                  <IconTrash size={15} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                  <span>Delete Inquiry</span>
                </button>
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
