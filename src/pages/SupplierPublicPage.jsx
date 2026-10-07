import React, { useEffect, useMemo } from 'react';
import './SupplierPublicPage.css';
import { useSupplier } from '../context/SupplierContext';
import { useRouter } from '../context/RouterContext';
import SolarCalculator from '../components/SolarCalculator';
import dbService from '../services/db';

export default function SupplierPublicPage() {
  const router = useRouter();
  const { suppliers, activeSupplier, selectSupplierBySlug } = useSupplier();

  // Slug from router params
  const slug = router.params.slug;

  // Resolve supplier
  const supplier = useMemo(() => {
    if (slug) {
      return dbService.getSupplierBySlug(slug) || suppliers.find(s => s.slug === slug);
    }
    return activeSupplier;
  }, [slug, activeSupplier, suppliers]);

  // Synchronize supplier on mount if slug provided
  useEffect(() => {
    if (slug) {
      selectSupplierBySlug(slug);
    }
  }, [slug, selectSupplierBySlug]);

  if (!supplier) {
    return (
      <div className="supplier-public-not-found">
        <h2>Solar Supplier Page Not Found</h2>
        <p>The solar company profile you requested does not exist or has been removed.</p>
        <button
          type="button"
          onClick={() => router.navigate('home')}
          className="btn-return-home"
        >
          Return to Orbit Solar Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="supplier-public-page">
      {/* 1. Supplier Branded Hero Section */}
      <section className="supplier-hero-banner">
        <div className="supplier-hero-content">
          <div className="supplier-badge-row">
            <span className="verified-pill">✓ Verified PEC Solar EPC Partner</span>
            <span className="city-pill">📍 {supplier.cityName}</span>
            <span className="warranty-pill">🛡️ {supplier.warranties?.split('•')[0] || '25-Year Warranty'}</span>
          </div>

          <div className="supplier-profile-header">
            <div className="supplier-big-avatar">
              {supplier.name.charAt(0)}
            </div>
            <div className="supplier-profile-details">
              <h1 className="supplier-title">{supplier.name}</h1>
              <p className="supplier-tagline">{supplier.tagline}</p>
              <div className="supplier-meta-tags">
                <span className="meta-item">🏆 {supplier.rating || 4.9} ★ ({supplier.reviewsCount || 180}+ Verified Reviews)</span>
                <span className="meta-item">⚡ {supplier.completedProjects || '300+'} Turnkey Projects Installed</span>
                <span className="meta-item">📋 {supplier.pecReg || 'PEC Licensed'}</span>
                <span className="meta-item">⏱️ Net Metering: {supplier.netMeteringDays || '30 Days'}</span>
              </div>
            </div>
          </div>

          <div className="supplier-cta-row">
            <a
              href={`https://wa.me/${supplier.whatsapp}?text=${encodeURIComponent(`Assalam o Alaikum ${supplier.name}! I am visiting your official solar calculator on Orbit Solar and would like to inquire about system installation in ${supplier.cityName}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-public-wa"
            >
              💬 WhatsApp Official Team: +{supplier.whatsapp}
            </a>
            <span className="office-address">
              🏢 {supplier.address || `${supplier.area}, ${supplier.cityName}`}
            </span>
          </div>
        </div>
      </section>

      {/* 2. Dynamic Supplier-Specific Solar Calculator */}
      <main className="supplier-calc-container">
        <div className="supplier-calc-explainer">
          <div className="calc-live-badge">⚡ LIVE CATALOG ENGINE</div>
          <h2>Instant Solar Sizing & Equipment Quotation</h2>
          <p>
            All solar panel models, inverters, batteries, and turnkey installation rates below are provided directly by <strong>{supplier.name}</strong>.
          </p>
        </div>

        {/* The SolarCalculator will read directly from SupplierContext and use this supplier's products! */}
        <SolarCalculator supplierOverride={supplier} />
      </main>

      {/* 3. Trust, Warranties & Next Steps */}
      <section className="supplier-trust-footer">
        <div className="trust-grid">
          <div className="trust-card">
            <span className="trust-icon">📜</span>
            <h3>Tier-1 Official Import Warranties</h3>
            <p>Every solar panel comes with official manufacturer barcode verification and 25-30 year linear output guarantee.</p>
          </div>

          <div className="trust-card">
            <span className="trust-icon">⚡</span>
            <h3>Guaranteed Green Net Metering</h3>
            <p>Full turnkey DISCO (LESCO / IESCO / K-Electric) three-phase bi-directional green meter processing handled from start to finish.</p>
          </div>

          <div className="trust-card">
            <span className="trust-icon">🛠️</span>
            <h3>Custom Galvanized Structures</h3>
            <p>Standard L2/L3 or heavy-gauge elevated walkable structures engineered to withstand 140 km/h wind loads.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
