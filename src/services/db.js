// Multi-Tenant Database & Storage Layer for Orbit Solar SaaS
// Encapsulates tenant isolation, seed data, and schema definitions
import { db as firestoreDb, rtdb } from './firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { ref, set as rtdbSet, remove as rtdbRemove } from 'firebase/database';

const DB_STORAGE_KEY = 'orbit_solar_single_company_v4';

// Asynchronous Firebase Cloud Sync (Realtime Database + Cloud Firestore)
const firebaseSync = {
  syncEntireDatabase: (data) => {
    try {
      if (rtdb && data) {
        const cleanPayload = {
          company: data.suppliers?.[0] || null,
          products: data.products || [],
          leads: data.leads || [],
          suppliers: data.suppliers || [],
          syncedAt: new Date().toISOString()
        };
        // Populate root orbit_system and individual collections in Realtime Database
        rtdbSet(ref(rtdb, 'orbit_system'), cleanPayload).catch(() => {});
        rtdbSet(ref(rtdb, 'products'), data.products || []).catch(() => {});
        rtdbSet(ref(rtdb, 'company'), data.suppliers?.[0] || {}).catch(() => {});
        if (data.leads && data.leads.length > 0) {
          rtdbSet(ref(rtdb, 'leads'), data.leads).catch(() => {});
        }
      }
    } catch {}
  },
  saveLead: (lead) => {
    try {
      if (firestoreDb && lead && lead.id) {
        setDoc(doc(firestoreDb, 'leads', String(lead.id)), lead, { merge: true }).catch(() => {});
      }
      if (rtdb && lead && lead.id) {
        rtdbSet(ref(rtdb, `leads/${lead.id}`), lead).catch(() => {});
      }
    } catch {}
  },
  deleteLead: (leadId) => {
    try {
      if (firestoreDb && leadId) {
        deleteDoc(doc(firestoreDb, 'leads', String(leadId))).catch(() => {});
      }
      if (rtdb && leadId) {
        rtdbRemove(ref(rtdb, `leads/${leadId}`)).catch(() => {});
      }
    } catch {}
  },
  saveSupplier: (supplier) => {
    try {
      if (firestoreDb && supplier && supplier.id) {
        setDoc(doc(firestoreDb, 'suppliers', String(supplier.id)), supplier, { merge: true }).catch(() => {});
      }
      if (rtdb && supplier && supplier.id) {
        rtdbSet(ref(rtdb, `suppliers/${supplier.id}`), supplier).catch(() => {});
        rtdbSet(ref(rtdb, 'company'), supplier).catch(() => {});
      }
    } catch {}
  },
  deleteSupplier: (supplierId) => {
    try {
      if (firestoreDb && supplierId) {
        deleteDoc(doc(firestoreDb, 'suppliers', String(supplierId))).catch(() => {});
      }
      if (rtdb && supplierId) {
        rtdbRemove(ref(rtdb, `suppliers/${supplierId}`)).catch(() => {});
      }
    } catch {}
  },
  saveProduct: (product) => {
    try {
      if (firestoreDb && product && product.id) {
        setDoc(doc(firestoreDb, 'products', String(product.id)), product, { merge: true }).catch(() => {});
      }
      if (rtdb && product && product.id) {
        rtdbSet(ref(rtdb, `products/${product.id}`), product).catch(() => {});
      }
    } catch {}
  },
  deleteProduct: (productId) => {
    try {
      if (firestoreDb && productId) {
        deleteDoc(doc(firestoreDb, 'products', String(productId))).catch(() => {});
      }
      if (rtdb && productId) {
        rtdbRemove(ref(rtdb, `products/${productId}`)).catch(() => {});
      }
    } catch {}
  },
  saveUser: (user) => {
    try {
      if (user && user.id) {
        const { passwordHash, ...safeUser } = user;
        if (firestoreDb) {
          setDoc(doc(firestoreDb, 'users', String(user.id)), safeUser, { merge: true }).catch(() => {});
        }
        if (rtdb) {
          rtdbSet(ref(rtdb, `users/${user.id}`), safeUser).catch(() => {});
        }
      }
    } catch {}
  }
};

// Seed Initial Data (Single Company Solar Platform)
const initializeSeedDatabase = () => {
  const company = {
    id: 'sup_orbit_solar',
    slug: 'orbit-solar',
    name: 'Orbit Solar Technologies',
    tagline: 'Tier-1 Gold Partner • Premium Residential & Commercial EPC',
    pecReg: 'PEC C-4 Licensed Contractor',
    cityId: 'all',
    cityName: 'Pakistan (Lahore, Islamabad, Karachi)',
    area: 'Nationwide Engineering Hub',
    address: 'Main Commercial Avenue, DHA Phase 5, Lahore',
    phone: '+92 300 8452190',
    whatsapp: '923008452190',
    email: 'admin@orbit.solar',
    currency: 'PKR',
    rating: 4.9,
    reviewsCount: 380,
    completedProjects: '500+',
    warranties: '25Y Panels • 5Y Inverter Replacement • 2Y Free Operations & Maintenance',
    netMeteringDays: '30-35 Days Guaranteed',
    status: 'active',
    plan: 'pro',
    calculatorConfig: {
      derateFactor: 0.80,
      avgTariff: 48,
      installationLaborBase: 26000,
      installationLaborPerKw: 2800,
      netMeteringOngrid: 115000,
      netMeteringHybrid: 85000,
      cableProtectionBase: 38000,
      cableProtectionPerKw: 5800,
      standardStructureCostPerWatt: 5.5,
      elevatedStructureCostPerWatt: 15.0
    },
    createdAt: '2025-01-15T10:00:00.000Z'
  };

  const suppliers = [company];

  const supplierUsers = [
    {
      id: 'user_admin',
      name: 'Orbit Solar Admin',
      email: 'admin@orbit.solar',
      passwordHash: 'admin123',
      role: 'supplier',
      supplierId: company.id,
      createdAt: company.createdAt
    }
  ];

  // Create isolated products for each supplier
  const products = [];

  suppliers.forEach((s, idx) => {
    const rateOffset = idx === 0 ? 0 : idx === 1 ? 0.5 : idx === 2 ? -0.8 : 0.2;

    // 1. Solar Panels
    products.push(
      {
        id: `p_jinko_${s.id}`,
        supplierId: s.id,
        category: 'panels',
        name: 'Jinko Tiger Neo 585W N-Type TOPCon',
        brand: 'Jinko Solar',
        model: 'JKM585N-72HL4-BDV',
        wattage: 585,
        voltage: '43.2V',
        type: 'N-Type TOPCon 16BB',
        pricePerWatt: +(34.5 + rateOffset).toFixed(1),
        price: Math.round(585 * (34.5 + rateOffset)),
        unit: 'per piece',
        stockQuantity: 450,
        isAvailable: true,
        isActive: true,
        efficiency: '22.6%',
        warranty: '15Y Product / 30Y Linear Power',
        bifacial: true,
        description: '🔥 Top choice in Pakistan with maximum yield in high ambient temperatures.',
        createdAt: s.createdAt
      },
      {
        id: `p_longi_${s.id}`,
        supplierId: s.id,
        category: 'panels',
        name: 'Longi Hi-MO X6 Explorer 580W HPBC',
        brand: 'Longi Solar',
        model: 'LR5-72HTH-580M',
        wattage: 580,
        voltage: '44.1V',
        type: 'HPBC Mono PERC',
        pricePerWatt: +(33.5 + rateOffset).toFixed(1),
        price: Math.round(580 * (33.5 + rateOffset)),
        unit: 'per piece',
        stockQuantity: 620,
        isAvailable: true,
        isActive: true,
        efficiency: '22.4%',
        warranty: '15Y Product / 25Y Power',
        bifacial: false,
        description: '⚡ Premium aesthetic and exceptional anti-dust low light performance.',
        createdAt: s.createdAt
      },
      {
        id: `p_canadian_${s.id}`,
        supplierId: s.id,
        category: 'panels',
        name: 'Canadian Solar BiHiKu7 600W Bifacial',
        brand: 'Canadian Solar',
        model: 'CS7L-600MB-AG',
        wattage: 600,
        voltage: '41.5V',
        type: 'N-Type Bifacial Dual Glass',
        pricePerWatt: +(35.5 + rateOffset).toFixed(1),
        price: Math.round(600 * (35.5 + rateOffset)),
        unit: 'per piece',
        stockQuantity: 300,
        isAvailable: true,
        isActive: true,
        efficiency: '23.0%',
        warranty: '12Y Product / 30Y Power',
        bifacial: true,
        description: '✨ Heavy dual-glass commercial & residential high output generation module.',
        createdAt: s.createdAt
      },
      {
        id: `p_trina_${s.id}`,
        supplierId: s.id,
        category: 'panels',
        name: 'Trina Solar Vertex 670W Ultra-High',
        brand: 'Trina Solar',
        model: 'TSM-DEG21C.20-670',
        wattage: 670,
        voltage: '46.0V',
        type: '210mm Triple-cut N-Type',
        pricePerWatt: +(36.0 + rateOffset).toFixed(1),
        price: Math.round(670 * (36.0 + rateOffset)),
        unit: 'per piece',
        stockQuantity: 240,
        isAvailable: true,
        isActive: true,
        efficiency: '23.5%',
        warranty: '15Y Product / 30Y Power',
        bifacial: true,
        description: '🚀 Fewer modules required per roof, maximizing space efficiency.',
        createdAt: s.createdAt
      },
      {
        id: `p_ja_${s.id}`,
        supplierId: s.id,
        category: 'panels',
        name: 'JA Solar DeepBlue 4.0 Pro 580W',
        brand: 'JA Solar',
        model: 'JAM72D40-580/GB',
        wattage: 580,
        voltage: '44.0V',
        type: 'N-Type Bycium+ Bifacial',
        pricePerWatt: +(34.0 + rateOffset).toFixed(1),
        price: Math.round(580 * (34.0 + rateOffset)),
        unit: 'per piece',
        stockQuantity: 380,
        isAvailable: true,
        isActive: true,
        efficiency: '22.3%',
        warranty: '12Y Product / 30Y Power',
        bifacial: true,
        description: '💎 Proven performance, lower degradation & high bifacial yield.',
        createdAt: s.createdAt
      },
      {
        id: `p_inverex_${s.id}`,
        supplierId: s.id,
        category: 'panels',
        name: 'Inverex Nitrox 550W Tier-1 Mono',
        brand: 'Inverex',
        model: 'Nitrox Pro 550M',
        wattage: 550,
        voltage: '41.8V',
        type: 'Tier-1 Mono PERC',
        pricePerWatt: +(34.0 + rateOffset).toFixed(1),
        price: Math.round(550 * (34.0 + rateOffset)),
        unit: 'per piece',
        stockQuantity: 410,
        isAvailable: true,
        isActive: true,
        efficiency: '21.3%',
        warranty: '12Y Product / 25Y Power',
        bifacial: false,
        description: '🇵🇰 Pakistani brand support with official nationwide service centers.',
        createdAt: s.createdAt
      }
    );

    // 2. Inverters
    products.push(
      {
        id: `inv_1_2_${s.id}`,
        supplierId: s.id,
        category: 'inverters',
        name: 'Fronus / Inverex 1.2 kW Solar Hybrid Inverter',
        brand: 'Fronus / Inverex',
        model: 'Solar 1.2K-12V',
        wattage: 1200,
        type: 'Hybrid Solar / Pure Sine Wave',
        price: 75000 + (idx * 2000),
        unit: 'per unit',
        stockQuantity: 50,
        isAvailable: true,
        isActive: true,
        warranty: '2 Years Local Warranty',
        description: 'Ideal for 1-2 Marla homes, running fans, lights, TV & UPS replacement.',
        createdAt: s.createdAt
      },
      {
        id: `inv_2_5_${s.id}`,
        supplierId: s.id,
        category: 'inverters',
        name: 'Inverex / Knox 2.5 kW Solar Hybrid Inverter',
        brand: 'Inverex / Knox',
        model: 'Aero 2.5K-24V',
        wattage: 2500,
        type: 'Hybrid Solar / MPPT Charge Controller',
        price: 105000 + (idx * 2500),
        unit: 'per unit',
        stockQuantity: 40,
        isAvailable: true,
        isActive: true,
        warranty: '5 Years Warranty',
        description: 'Ideal for 2-3 Marla homes, running fridge, water pump & essential household load.',
        createdAt: s.createdAt
      },
      {
        id: `inv_3_6_${s.id}`,
        supplierId: s.id,
        category: 'inverters',
        name: 'Solis / Knox 3.6 kW Dual-MPPT Single-Phase Inverter',
        brand: 'Solis',
        model: 'S6-GR1P3.6K',
        wattage: 3600,
        type: 'On-Grid / Dual MPPT',
        price: 145000 + (idx * 3000),
        unit: 'per unit',
        stockQuantity: 25,
        isAvailable: true,
        isActive: true,
        warranty: '5 Years Replacement Warranty',
        description: 'Ideal for 3kW - 4kW 5-Marla homes with low idle draw.',
        createdAt: s.createdAt
      },
      {
        id: `inv_6_${s.id}`,
        supplierId: s.id,
        category: 'inverters',
        name: 'Inverex Nitrox 6 kW Hybrid Dual-MPPT Inverter',
        brand: 'Inverex Nitrox',
        model: 'Nitrox 6kW-48V',
        wattage: 6000,
        type: 'Hybrid On/Off-Grid with Battery Port',
        price: 178000 + (idx * 2000),
        unit: 'per unit',
        stockQuantity: 40,
        isAvailable: true,
        isActive: true,
        warranty: '5 Years Local Replacement',
        description: 'Runs essential household load seamlessly during power cuts.',
        createdAt: s.createdAt
      },
      {
        id: `inv_10_${s.id}`,
        supplierId: s.id,
        category: 'inverters',
        name: 'Sungrow / Huawei 10 kW Three-Phase Inverter',
        brand: 'Sungrow',
        model: 'SG10RT Multi-MPPT',
        wattage: 10000,
        type: 'Three-Phase On-Grid Smart Inverter',
        price: 228000 + (idx * 4000),
        unit: 'per unit',
        stockQuantity: 35,
        isAvailable: true,
        isActive: true,
        warranty: '10 Years Limited Warranty',
        description: 'Best-seller in Pakistan for 1 Kanal homes with multiple ACs.',
        createdAt: s.createdAt
      },
      {
        id: `inv_15_${s.id}`,
        supplierId: s.id,
        category: 'inverters',
        name: 'Huawei Smart PV 15 kW Three-Phase Inverter',
        brand: 'Huawei',
        model: 'SUN2000-15KTL-M2',
        wattage: 15000,
        type: 'Three-Phase On-Grid AI-Powered',
        price: 315000 + (idx * 5000),
        unit: 'per unit',
        stockQuantity: 20,
        isAvailable: true,
        isActive: true,
        warranty: '10 Years Manufacturer Warranty',
        description: 'High voltage DC arc protection with cloud monitoring.',
        createdAt: s.createdAt
      },
      {
        id: `inv_20_${s.id}`,
        supplierId: s.id,
        category: 'inverters',
        name: 'Sungrow 20 kW Three-Phase Commercial Inverter',
        brand: 'Sungrow',
        model: 'SG20RT',
        wattage: 20000,
        type: 'Three-Phase Heavy Commercial',
        price: 395000,
        unit: 'per unit',
        stockQuantity: 15,
        isAvailable: true,
        isActive: true,
        warranty: '5 Years Warranty',
        description: 'Commercial 3-Phase inverter with 98.6% peak efficiency.',
        createdAt: s.createdAt
      }
    );

    // 3. Batteries
    products.push(
      {
        id: `bat_lifepo4_5_${s.id}`,
        supplierId: s.id,
        category: 'batteries',
        name: '5.12 kWh LiFePO4 Lithium Battery Wall-Mount',
        brand: 'Narada / Pylontech',
        model: '48V 100Ah Smart BMS',
        wattage: 5120,
        type: 'LiFePO4 Lithium Wall-Mount',
        price: 335000 + (idx * 5000),
        unit: 'per unit',
        stockQuantity: 30,
        isAvailable: true,
        isActive: true,
        warranty: '10 Years Warranty / 6000 Cycles',
        description: 'Zero maintenance wall mount battery. Powers entire home smoothly.',
        createdAt: s.createdAt
      },
      {
        id: `bat_lifepo4_10_${s.id}`,
        supplierId: s.id,
        category: 'batteries',
        name: '10.24 kWh LiFePO4 High-Capacity Lithium Bank',
        brand: 'Pylontech / Shoto',
        model: '48V 200Ah High-C Rate',
        wattage: 10240,
        type: 'LiFePO4 Industrial Lithium',
        price: 640000 + (idx * 10000),
        unit: 'per bank',
        stockQuantity: 15,
        isAvailable: true,
        isActive: true,
        warranty: '10 Years / 6000 Cycles',
        description: 'Runs 1.5 Ton Inverter AC and complete house all night during loadshedding.',
        createdAt: s.createdAt
      },
      {
        id: `bat_tubular_4x_${s.id}`,
        supplierId: s.id,
        category: 'batteries',
        name: '4x 240Ah Tall Tubular Deep-Cycle Bank',
        brand: 'Phoenix / AGS / Osaka',
        model: 'TX-2500 Tall Tubular Set',
        wattage: 5760,
        type: 'Deep Cycle Lead-Acid Tubular',
        price: 180000 + (idx * 3000),
        unit: 'set of 4',
        stockQuantity: 50,
        isAvailable: true,
        isActive: true,
        warranty: '1 Year Full Replacement',
        description: 'Economical battery bank for standard UPS loadshedding backup.',
        createdAt: s.createdAt
      }
    );

    // 4. Mounting & Structures
    products.push(
      {
        id: `struct_std_${s.id}`,
        supplierId: s.id,
        category: 'mounting',
        name: 'Standard L2 / L3 Heavy Galvanized Rooftop Brackets',
        brand: 'Certified GI 12-14 Gauge',
        model: 'L2-L3 Standard',
        type: 'Low Profile Rooftop Mounting',
        price: s.calculatorConfig.standardStructureCostPerWatt,
        unit: 'per watt',
        stockQuantity: 100000,
        isAvailable: true,
        isActive: true,
        description: 'Heavy gauge galvanized frames, rust-proof with wind rating up to 130 km/h.',
        createdAt: s.createdAt
      },
      {
        id: `struct_elev_${s.id}`,
        supplierId: s.id,
        category: 'mounting',
        name: 'Elevated Walkable Shed Structure (10-12 ft)',
        brand: 'Custom Pipe Truss High-Rise',
        model: 'Walkable Rooftop Truss',
        type: 'Elevated Walkable Shed',
        price: s.calculatorConfig.elevatedStructureCostPerWatt,
        unit: 'per watt',
        stockQuantity: 50000,
        isAvailable: true,
        isActive: true,
        description: 'Raised platform structure allowing full roof usability for sitting or laundry.',
        createdAt: s.createdAt
      }
    );

    // 5. Cables & Protection
    products.push(
      {
        id: `cables_${s.id}`,
        supplierId: s.id,
        category: 'cables',
        name: 'Pakistan Cables / Fast Cables Pure Copper Wiring Pack',
        brand: 'Pakistan Cables 99.9%',
        model: 'Cu/XLPE/PVC Multi-Core',
        type: 'Solar Grade UV-Resistant DC & AC Cable',
        price: 38000,
        unit: 'package',
        stockQuantity: 200,
        isAvailable: true,
        isActive: true,
        description: 'Pure copper certified DC solar cables with TUV certification.',
        createdAt: s.createdAt
      },
      {
        id: `protect_${s.id}`,
        supplierId: s.id,
        category: 'protection',
        name: 'Schneider & Terasaki AC/DC Breakers & SPD Surge Arresters',
        brand: 'Schneider / Terasaki',
        model: 'DC 1000V SPD + MCB Set',
        type: 'Comprehensive Protection Box',
        price: 24000,
        unit: 'set',
        stockQuantity: 150,
        isAvailable: true,
        isActive: true,
        description: 'Type-II surge protection devices with Class-A DC circuit breakers.',
        createdAt: s.createdAt
      }
    );
  });

  // Pre-seed some leads for the company CRM
  const leads = [
    {
      id: 'LEAD-101',
      supplierId: company.id,
      customerName: 'Usman Ghani',
      customerPhone: '+92 300 4567890',
      customerWhatsApp: '923004567890',
      customerCity: 'Lahore',
      customerAddress: 'House 42, Sector F, DHA Phase 5',
      systemKw: 10.0,
      systemType: 'ongrid',
      monthlyBillRs: 52000,
      monthlyUnits: 1080,
      selectedProducts: [
        { category: 'panels', name: 'Jinko Tiger Neo 585W N-Type TOPCon', quantity: 18, unitPrice: 20182, subtotal: 363276 },
        { category: 'inverters', name: 'Sungrow / Huawei 10 kW Three-Phase Inverter', quantity: 1, unitPrice: 228000, subtotal: 228000 },
        { category: 'mounting', name: 'Standard L2 / L3 Heavy Galvanized Rooftop Brackets', quantity: 10000, unitPrice: 5.5, subtotal: 55000 }
      ],
      estimatedTotalCost: 1145000,
      status: 'confirmed', // 'new' | 'contacted' | 'quoted' | 'confirmed' | 'completed' | 'cancelled'
      customerNotes: 'Require net metering connection before summer bills increase.',
      supplierNotes: 'Site survey done. Net metering application submitted to LESCO.',
      createdAt: '2025-03-28T14:30:00.000Z',
      updatedAt: '2025-03-29T09:15:00.000Z'
    },
    {
      id: 'LEAD-102',
      supplierId: company.id,
      customerName: 'Chaudhry Tariq',
      customerPhone: '+92 321 9876543',
      customerWhatsApp: '923219876543',
      customerCity: 'Lahore',
      customerAddress: 'Plaza 14, Main Commercial, Johar Town',
      systemKw: 15.0,
      systemType: 'ongrid',
      monthlyBillRs: 78000,
      monthlyUnits: 1625,
      selectedProducts: [
        { category: 'panels', name: 'Longi Hi-MO X6 Explorer 580W HPBC', quantity: 26, unitPrice: 19430, subtotal: 505180 },
        { category: 'inverters', name: 'Huawei Smart PV 15 kW Three-Phase Inverter', quantity: 1, unitPrice: 315000, subtotal: 315000 }
      ],
      estimatedTotalCost: 1690000,
      status: 'quoted',
      customerNotes: 'Need 15kW quotation on elevated shed structure.',
      supplierNotes: 'Quotation shared on WhatsApp. Follow up scheduled for Friday.',
      createdAt: '2025-04-01T11:20:00.000Z',
      updatedAt: '2025-04-01T15:40:00.000Z'
    },
    {
      id: 'LEAD-103',
      supplierId: company.id,
      customerName: 'Dr. Shahzad Mir',
      customerPhone: '+92 333 4455667',
      customerWhatsApp: '923334455667',
      customerCity: 'Lahore',
      customerAddress: 'Gulberg III, Near Ghalib Market',
      systemKw: 7.0,
      systemType: 'hybrid',
      monthlyBillRs: 38000,
      monthlyUnits: 790,
      selectedProducts: [
        { category: 'panels', name: 'Jinko Tiger Neo 585W N-Type TOPCon', quantity: 12, unitPrice: 20182, subtotal: 242184 },
        { category: 'inverters', name: 'Inverex Nitrox 6 kW Hybrid Dual-MPPT Inverter', quantity: 1, unitPrice: 178000, subtotal: 178000 },
        { category: 'batteries', name: '5.12 kWh LiFePO4 Lithium Battery Wall-Mount', quantity: 1, unitPrice: 335000, subtotal: 335000 }
      ],
      estimatedTotalCost: 1220000,
      status: 'new',
      customerNotes: 'Suffering from loadshedding, need lithium battery backup.',
      supplierNotes: '',
      createdAt: '2025-04-03T16:45:00.000Z',
      updatedAt: '2025-04-03T16:45:00.000Z'
    },
    {
      id: 'LEAD-201',
      supplierId: company.id,
      customerName: 'Brig. (R) Asad Malik',
      customerPhone: '+92 333 5566778',
      customerWhatsApp: '923335566778',
      customerCity: 'Islamabad',
      customerAddress: 'Sector F-7/2, Islamabad',
      systemKw: 15.0,
      systemType: 'ongrid',
      monthlyBillRs: 85000,
      monthlyUnits: 1770,
      selectedProducts: [
        { category: 'panels', name: 'Canadian Solar BiHiKu7 600W Bifacial', quantity: 25, unitPrice: 21600, subtotal: 540000 },
        { category: 'inverters', name: 'Huawei Smart PV 15 kW Three-Phase Inverter', quantity: 1, unitPrice: 320000, subtotal: 320000 }
      ],
      estimatedTotalCost: 1820000,
      status: 'confirmed',
      customerNotes: 'Dual glass bifacial modules preferred for high yield.',
      supplierNotes: 'Site survey done, installation starts next Tuesday.',
      createdAt: '2025-03-25T10:00:00.000Z',
      updatedAt: '2025-03-26T12:00:00.000Z'
    },
    {
      id: 'LEAD-301',
      supplierId: company.id,
      customerName: 'Kamran Memon',
      customerPhone: '+92 331 8765432',
      customerWhatsApp: '923318765432',
      customerCity: 'Karachi',
      customerAddress: 'Block 4, Clifton, Karachi',
      systemKw: 10.0,
      systemType: 'ongrid',
      monthlyBillRs: 58000,
      monthlyUnits: 1200,
      selectedProducts: [
        { category: 'panels', name: 'Trina Solar Vertex 670W Ultra-High', quantity: 15, unitPrice: 23584, subtotal: 353760 },
        { category: 'inverters', name: 'Sungrow / Huawei 10 kW Three-Phase Inverter', quantity: 1, unitPrice: 228000, subtotal: 228000 }
      ],
      estimatedTotalCost: 1120000,
      status: 'contacted',
      customerNotes: 'K-Electric net metering documentation assistance required.',
      supplierNotes: 'Spoke on phone, waiting for electric bill copy.',
      createdAt: '2025-04-02T09:10:00.000Z',
      updatedAt: '2025-04-02T14:30:00.000Z'
    }
  ];

  return {
    version: '3.0',
    users: supplierUsers,
    suppliers,
    products,
    leads
  };
};

// Database Access & Persistence
class SolarSaaSDatabase {
  constructor() {
    this.db = this.loadDatabase();
    // Asynchronously synchronize entire database to Firebase Realtime Database on startup
    firebaseSync.syncEntireDatabase(this.db);
  }

  loadDatabase() {
    const seed = initializeSeedDatabase();
    try {
      const raw = localStorage.getItem(DB_STORAGE_KEY) || localStorage.getItem('orbit_solar_single_company_v2');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.suppliers) && Array.isArray(parsed.products)) {
          // Merge missing seed baseline products so all products are stored in DB
          const existingIds = new Set(parsed.products.map(p => p.id));
          const existingNames = new Set(parsed.products.map(p => (p.name || '').toLowerCase().trim()));
          
          let changed = false;
          seed.products.forEach(sp => {
            const cleanName = (sp.name || '').toLowerCase().trim();
            if (!existingIds.has(sp.id) && !existingNames.has(cleanName)) {
              parsed.products.push(sp);
              changed = true;
            }
          });

          if (!parsed.suppliers || parsed.suppliers.length === 0) {
            parsed.suppliers = seed.suppliers;
            changed = true;
          }

          if (changed) {
            this.saveDatabase(parsed);
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to parse database from localStorage", e);
    }
    this.saveDatabase(seed);
    return seed;
  }

  saveDatabase(state = this.db) {
    try {
      this.db = state;
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(state));
      firebaseSync.syncEntireDatabase(state);
    } catch (e) {
      console.error("Database write error", e);
    }
  }

  resetDatabase() {
    const fresh = initializeSeedDatabase();
    this.saveDatabase(fresh);
    return fresh;
  }

  // --- USERS & AUTH ---

  findUserByEmail(email) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (cleanEmail === 'admin' || cleanEmail === 'admin@orbit.solar') {
      return this.db.users.find(u => u.email.toLowerCase() === 'admin@orbit.solar') || this.db.users[0];
    }
    return this.db.users.find(u => u.email.toLowerCase() === cleanEmail);
  }

  findUserById(id) {
    return this.db.users.find(u => u.id === id);
  }

  createUser(userData) {
    const newUser = {
      id: `user_${Date.now()}`,
      name: userData.name,
      email: (userData.email || '').trim().toLowerCase(),
      passwordHash: userData.password, // In real backend bcrypt hashed
      role: userData.role || 'supplier',
      supplierId: userData.supplierId || null,
      createdAt: new Date().toISOString()
    };
    this.db.users.push(newUser);
    this.saveDatabase();
    firebaseSync.saveUser(newUser);
    return newUser;
  }

  // --- SUPPLIERS (TENANTS) ---

  getSuppliers() {
    return [...this.db.suppliers];
  }

  getSupplierById(id) {
    return this.db.suppliers.find(s => s.id === id) || null;
  }

  getSupplierBySlug(slug) {
    const cleanSlug = (slug || '').trim().toLowerCase();
    return this.db.suppliers.find(s => s.slug.toLowerCase() === cleanSlug) || null;
  }

  createSupplier(supplierData) {
    const baseSlug = (supplierData.slug || supplierData.name || 'company')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    // Ensure slug uniqueness
    const existingSlugs = new Set(this.db.suppliers.map(s => s.slug));
    let slug = baseSlug || `supplier-${Date.now()}`;
    let counter = 1;
    while (existingSlugs.has(slug)) {
      slug = `${baseSlug}-${counter++}`;
    }

    const id = `sup_${Date.now()}`;
    const newSupplier = {
      id,
      slug,
      name: supplierData.name || 'New Solar Company',
      tagline: supplierData.tagline || 'Authorized Solar Energy Solutions',
      pecReg: supplierData.pecReg || 'PEC Registered',
      cityId: supplierData.cityId || 'lahore',
      cityName: supplierData.cityName || 'Lahore',
      area: supplierData.area || 'Commercial Area',
      address: supplierData.address || '',
      phone: supplierData.phone || '+92 300 0000000',
      whatsapp: (supplierData.whatsapp || '923000000000').replace(/[^0-9]/g, ''),
      email: (supplierData.email || '').trim().toLowerCase(),
      currency: 'PKR',
      rating: 5.0,
      reviewsCount: 1,
      completedProjects: '10+',
      warranties: supplierData.warranties || '25Y Panels • 5Y Inverter Replacement',
      netMeteringDays: supplierData.netMeteringDays || '30 Days Guaranteed',
      status: 'active',
      plan: supplierData.plan || 'free',
      calculatorConfig: {
        derateFactor: 0.80,
        avgTariff: 48,
        installationLaborBase: 26000,
        installationLaborPerKw: 2800,
        netMeteringOngrid: 115000,
        netMeteringHybrid: 85000,
        cableProtectionBase: 38000,
        cableProtectionPerKw: 5800,
        standardStructureCostPerWatt: 5.5,
        elevatedStructureCostPerWatt: 15.0,
        ...supplierData.calculatorConfig
      },
      createdAt: new Date().toISOString()
    };

    this.db.suppliers.unshift(newSupplier);

    // Seed default baseline products for this new supplier
    this.seedDefaultProductsForSupplier(newSupplier.id);

    this.saveDatabase();
    firebaseSync.saveSupplier(newSupplier);
    return newSupplier;
  }

  seedDefaultProductsForSupplier(supplierId) {
    // Clone top baseline products into supplier tenant space
    const templateProducts = [
      {
        category: 'panels',
        name: 'Longi Hi-MO X6 580W HPBC',
        brand: 'Longi Solar',
        model: 'LR5-72HTH-580',
        wattage: 580,
        type: 'Mono PERC HPBC',
        pricePerWatt: 34.0,
        price: 19720,
        unit: 'per piece',
        stockQuantity: 200,
        isAvailable: true,
        isActive: true,
        efficiency: '22.5%',
        warranty: '15Y Product / 25Y Power',
        bifacial: false,
        description: 'High reliability and efficiency for residential rooftops.'
      },
      {
        category: 'panels',
        name: 'Jinko Tiger Neo 585W N-Type TOPCon',
        brand: 'Jinko Solar',
        model: 'JKM585N-72HL4',
        wattage: 585,
        type: 'N-Type TOPCon',
        pricePerWatt: 34.5,
        price: 20182,
        unit: 'per piece',
        stockQuantity: 250,
        isAvailable: true,
        isActive: true,
        efficiency: '22.6%',
        warranty: '15Y Product / 30Y Linear',
        bifacial: true,
        description: 'Maximum generation in high heat climates.'
      },
      {
        category: 'inverters',
        name: 'Solis 6 kW Dual-MPPT Inverter',
        brand: 'Solis',
        model: 'S6-GR1P6K',
        wattage: 6000,
        type: 'Dual MPPT',
        price: 175000,
        unit: 'per unit',
        stockQuantity: 15,
        isAvailable: true,
        isActive: true,
        warranty: '5 Years Replacement',
        description: 'Efficient inverter for small to medium residential systems.'
      },
      {
        category: 'inverters',
        name: 'Sungrow 10 kW Three-Phase Smart Inverter',
        brand: 'Sungrow',
        model: 'SG10RT',
        wattage: 10000,
        type: 'Three-Phase On-Grid',
        price: 228000,
        unit: 'per unit',
        stockQuantity: 20,
        isAvailable: true,
        isActive: true,
        warranty: '10 Years Warranty',
        description: 'Top choice for 10kW residential and commercial systems.'
      },
      {
        category: 'batteries',
        name: '5.12 kWh LiFePO4 Lithium Wall-Mount',
        brand: 'Pylontech / Narada',
        model: '48V 100Ah',
        wattage: 5120,
        type: 'LiFePO4 Lithium Wall Mount',
        price: 335000,
        unit: 'per unit',
        stockQuantity: 10,
        isAvailable: true,
        isActive: true,
        warranty: '10 Years / 6000 Cycles',
        description: 'Reliable lithium backup bank with integrated smart BMS.'
      },
      {
        category: 'mounting',
        name: 'Standard L2 / L3 Heavy Galvanized Stand',
        brand: 'Standard GI',
        model: 'L2-L3',
        type: 'Rooftop Low Profile',
        price: 5.5,
        unit: 'per watt',
        stockQuantity: 50000,
        isAvailable: true,
        isActive: true,
        description: 'Rust-proof zinc-coated mounting structures.'
      }
    ];

    templateProducts.forEach(tp => {
      this.db.products.push({
        id: `prod_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        supplierId,
        ...tp,
        createdAt: new Date().toISOString()
      });
    });
  }

  updateSupplier(id, updates) {
    const idx = this.db.suppliers.findIndex(s => s.id === id);
    if (idx === -1) return null;

    // Don't allow changing supplier ID
    const { id: _, ...safeUpdates } = updates;
    this.db.suppliers[idx] = {
      ...this.db.suppliers[idx],
      ...safeUpdates,
      calculatorConfig: {
        ...this.db.suppliers[idx].calculatorConfig,
        ...(safeUpdates.calculatorConfig || {})
      }
    };
    this.saveDatabase();
    firebaseSync.saveSupplier(this.db.suppliers[idx]);
    return this.db.suppliers[idx];
  }

  deleteSupplier(id) {
    this.db.suppliers = this.db.suppliers.filter(s => s.id !== id);
    // Cascade delete tenant's products, leads, and supplier users
    this.db.products = this.db.products.filter(p => p.supplierId !== id);
    this.db.leads = this.db.leads.filter(l => l.supplierId !== id);
    this.db.users = this.db.users.filter(u => u.supplierId !== id);
    this.saveDatabase();
    firebaseSync.deleteSupplier(id);
    return true;
  }

  // --- PRODUCTS (STRICT TENANT ISOLATION) ---

  getProductsBySupplier(supplierId, options = {}) {
    let list = this.db.products.filter(p => p.supplierId === supplierId);

    if (options.category && options.category !== 'all') {
      list = list.filter(p => p.category === options.category);
    }
    if (options.onlyActive) {
      list = list.filter(p => p.isActive && p.isAvailable);
    }
    if (options.search) {
      const q = options.search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.model && p.model.toLowerCase().includes(q))
      );
    }

    return [...list];
  }

  getProductById(id, supplierId = null) {
    const product = this.db.products.find(p => p.id === id);
    if (!product) return null;
    // Security: Check tenant boundary if supplierId provided
    if (supplierId && product.supplierId !== supplierId) {
      return null; // Unauthorized cross-tenant access prevented
    }
    return product;
  }

  createProduct(supplierId, productData) {
    if (!supplierId) throw new Error("supplierId is required to create a product.");
    const id = `p_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const watts = parseFloat(productData.wattage) || 0;
    const pricePerWatt = parseFloat(productData.pricePerWatt) || 0;
    let price = parseFloat(productData.price) || 0;

    // Auto compute plate price if pricePerWatt given
    if (productData.category === 'panels' && pricePerWatt > 0 && watts > 0 && !price) {
      price = Math.round(watts * pricePerWatt);
    }

    const newProduct = {
      id,
      supplierId,
      category: productData.category || 'other',
      name: productData.name || 'Solar Product',
      brand: productData.brand || '',
      model: productData.model || '',
      wattage: watts,
      voltage: productData.voltage || '',
      type: productData.type || '',
      price: Math.max(0, price),
      pricePerWatt: pricePerWatt || (watts > 0 ? +(price / watts).toFixed(2) : 0),
      unit: productData.unit || 'per piece',
      stockQuantity: parseInt(productData.stockQuantity ?? productData.stockCount ?? 100, 10),
      isAvailable: productData.isAvailable !== false,
      isActive: productData.isActive !== false,
      efficiency: productData.efficiency || (productData.category === 'inverters' ? '98.5%' : '22.5%'),
      warranty: productData.warranty || (productData.warrantyYears ? `${productData.warrantyYears}Y Product / Linear Power` : '25Y Linear'),
      bifacial: Boolean(productData.bifacial),
      description: productData.description || '',
      imageUrl: productData.imageUrl || '',
      createdAt: new Date().toISOString()
    };

    this.db.products.unshift(newProduct);
    this.saveDatabase();
    firebaseSync.saveProduct(newProduct);
    return newProduct;
  }

  updateProduct(id, supplierId, updates) {
    const idx = this.db.products.findIndex(p => p.id === id && p.supplierId === supplierId);
    if (idx === -1) return null; // Tenant isolation: cannot edit another supplier's product

    const prev = this.db.products[idx];
    const watts = updates.wattage !== undefined ? parseFloat(updates.wattage) : prev.wattage;
    const pricePerWatt = updates.pricePerWatt !== undefined ? parseFloat(updates.pricePerWatt) : prev.pricePerWatt;
    let price = updates.price !== undefined ? parseFloat(updates.price) : prev.price;

    if (prev.category === 'panels' && updates.pricePerWatt !== undefined && watts > 0) {
      price = Math.round(watts * pricePerWatt);
    }

    const stockQty = updates.stockQuantity !== undefined 
      ? parseInt(updates.stockQuantity, 10) 
      : (updates.stockCount !== undefined ? parseInt(updates.stockCount, 10) : prev.stockQuantity);

    const warrantyStr = updates.warranty !== undefined 
      ? updates.warranty 
      : (updates.warrantyYears ? `${updates.warrantyYears}Y Product / Linear Power` : prev.warranty);

    this.db.products[idx] = {
      ...prev,
      ...updates,
      wattage: watts,
      pricePerWatt,
      price,
      stockQuantity: stockQty,
      warranty: warrantyStr,
      updatedAt: new Date().toISOString()
    };

    this.saveDatabase();
    firebaseSync.saveProduct(this.db.products[idx]);
    return this.db.products[idx];
  }

  deleteProduct(id, supplierId) {
    const initialLen = this.db.products.length;
    this.db.products = this.db.products.filter(p => !(p.id === id && p.supplierId === supplierId));
    if (this.db.products.length !== initialLen) {
      this.saveDatabase();
      firebaseSync.deleteProduct(id);
      return true;
    }
    return false;
  }

  // --- LEADS & BOOKINGS (CRM PIPELINE) ---

  getLeadsBySupplier(supplierId, options = {}) {
    let list = this.db.leads.filter(l => l.supplierId === supplierId);
    if (options.status && options.status !== 'all') {
      list = list.filter(l => l.status === options.status);
    }
    return [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getAllLeads() {
    // Super Admin view
    return [...this.db.leads].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  createLead(leadData) {
    if (!leadData.supplierId) throw new Error("supplierId is required to submit a booking.");

    const supplier = this.getSupplierById(leadData.supplierId);
    if (!supplier) throw new Error("Target supplier does not exist.");

    const id = leadData.id || `LEAD-${Math.floor(1000 + Math.random() * 9000)}`;

    const customerName = (leadData.customerName || leadData.name || '').trim();
    const customerPhone = (leadData.customerPhone || leadData.phone || '').trim();
    const customerWhatsApp = (leadData.customerWhatsApp || leadData.whatsappNumber || leadData.whatsapp || customerPhone).replace(/[^0-9]/g, '');
    const customerCity = leadData.customerCity || leadData.city || supplier.cityName || 'Pakistan';
    const customerAddress = (leadData.customerAddress || leadData.address || '').trim();
    const customerNotes = (leadData.customerNotes || leadData.notes || '').trim();

    const newLead = {
      // Retain all rich equipment & cost breakdown properties
      ...leadData,
      id,
      supplierId: leadData.supplierId,
      customerName,
      name: customerName,
      customerPhone,
      phone: customerPhone,
      customerWhatsApp,
      whatsapp: customerWhatsApp,
      whatsappNumber: customerWhatsApp,
      customerCity,
      city: customerCity,
      customerAddress,
      address: customerAddress,
      roofType: leadData.roofType || 'Standard Rooftop',
      systemKw: parseFloat(leadData.systemKw) || 5.0,
      systemType: leadData.systemType || 'ongrid',
      monthlyBillRs: parseInt(leadData.monthlyBillRs, 10) || 0,
      monthlyUnits: parseInt(leadData.monthlyUnits, 10) || 0,
      numberOfPanels: leadData.numberOfPanels || null,
      selectedPanel: leadData.selectedPanel || null,
      selectedInverter: leadData.selectedInverter || null,
      selectedBattery: leadData.selectedBattery || null,
      selectedStructure: leadData.selectedStructure || null,
      panelsCost: leadData.panelsCost || null,
      inverterCost: leadData.inverterCost || null,
      structureCost: leadData.structureCost || null,
      cablesAndProtections: leadData.cablesAndProtections || null,
      netMeteringCost: leadData.netMeteringCost || null,
      installationLabor: leadData.installationLabor || null,
      batteryCost: leadData.batteryCost || null,
      selectedProducts: Array.isArray(leadData.selectedProducts) ? leadData.selectedProducts : [],
      estimatedTotalCost: Math.round(parseFloat(leadData.estimatedTotalCost) || 0),
      status: leadData.status || 'new',
      customerNotes,
      notes: customerNotes,
      supplierNotes: leadData.supplierNotes || '',
      createdAt: leadData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.db.leads.unshift(newLead);
    this.saveDatabase();
    firebaseSync.saveLead(newLead);
    return newLead;
  }

  deleteLead(leadId, supplierId = null) {
    const idx = this.db.leads.findIndex(l => l.id === leadId && (supplierId === null || l.supplierId === supplierId));
    if (idx === -1) return false;

    this.db.leads.splice(idx, 1);
    this.saveDatabase();
    firebaseSync.deleteLead(leadId);
    return true;
  }

  updateLeadStatus(leadId, supplierId, status, notes = null) {
    const idx = this.db.leads.findIndex(l => l.id === leadId && (supplierId === null || l.supplierId === supplierId));
    if (idx === -1) return null;

    this.db.leads[idx].status = status;
    if (notes !== null) {
      this.db.leads[idx].supplierNotes = notes;
    }
    this.db.leads[idx].updatedAt = new Date().toISOString();
    this.saveDatabase();
    firebaseSync.saveLead(this.db.leads[idx]);
    return this.db.leads[idx];
  }

  // --- ANALYTICS & METRICS ---

  getSupplierAnalytics(supplierId) {
    const leads = this.db.leads.filter(l => l.supplierId === supplierId);
    const products = this.db.products.filter(p => p.supplierId === supplierId);
    
    const totalLeads = leads.length;
    const newInquiries = leads.filter(l => l.status === 'new').length;
    const bookings = leads.filter(l => l.status === 'confirmed' || l.status === 'completed').length;
    const estimatedSalesValue = leads
      .filter(l => l.status !== 'cancelled')
      .reduce((acc, curr) => acc + (curr.estimatedTotalCost || 0), 0);
    
    const activeProducts = products.filter(p => p.isActive && p.isAvailable).length;
    const conversionRate = totalLeads > 0 ? +((bookings / totalLeads) * 100).toFixed(1) : 0;

    return {
      totalLeads,
      newInquiries,
      bookings,
      estimatedSalesValue,
      activeProducts,
      totalProducts: products.length,
      conversionRate,
      recentLeads: leads.slice(0, 5)
    };
  }

  // Server-Side Recalculation Engine (Security: Prevents client price tampering)
  validateAndCalculateQuote(supplierId, params) {
    const supplier = this.getSupplierById(supplierId);
    if (!supplier) throw new Error("Supplier not found");

    const cfg = supplier.calculatorConfig;
    const requiredKw = Math.max(1, parseFloat(params.systemKw) || 5.0);
    const systemType = params.systemType === 'hybrid' ? 'hybrid' : 'ongrid';

    // Fetch panels
    const panels = this.getProductsBySupplier(supplierId, { category: 'panels', onlyActive: true });
    let selectedPanel = panels.find(p => p.id === params.panelId) || panels[0];
    if (!selectedPanel) {
      selectedPanel = { name: 'Tier-1 585W Panel', wattage: 585, price: 20182, pricePerWatt: 34.5 };
    }

    const panelWatts = selectedPanel.wattage || 585;
    const numberOfPanels = Math.max(4, Math.ceil((requiredKw * 1000) / panelWatts));
    const exactSystemKw = +((numberOfPanels * panelWatts) / 1000).toFixed(2);
    const panelsCost = numberOfPanels * selectedPanel.price;

    // Fetch inverters
    const inverters = this.getProductsBySupplier(supplierId, { category: 'inverters', onlyActive: true });
    let selectedInverter = inverters.find(i => i.id === params.inverterId);
    if (!selectedInverter) {
      // Auto match by kW capacity
      selectedInverter = inverters.find(i => (i.wattage / 1000) >= exactSystemKw) || inverters[inverters.length - 1];
    }
    const inverterCost = selectedInverter ? selectedInverter.price : 220000;

    // Fetch batteries
    let batteryCost = 0;
    let selectedBattery = null;
    if (systemType === 'hybrid') {
      const batteries = this.getProductsBySupplier(supplierId, { category: 'batteries', onlyActive: true });
      selectedBattery = batteries.find(b => b.id === params.batteryId) || batteries[0];
      batteryCost = selectedBattery ? selectedBattery.price : 335000;
    }

    // Structure
    const structureCostPerWatt = params.structureType === 'elevated'
      ? cfg.elevatedStructureCostPerWatt
      : cfg.standardStructureCostPerWatt;
    const structureCost = Math.round(exactSystemKw * 1000 * structureCostPerWatt);

    // Cabling & Protections
    const cablesAndProtections = Math.round(cfg.cableProtectionBase + (exactSystemKw * cfg.cableProtectionPerKw));

    // Net Metering
    const netMeteringCost = systemType === 'ongrid' ? cfg.netMeteringOngrid : cfg.netMeteringHybrid;

    // Labor
    const installationLabor = Math.round(cfg.installationLaborBase + (exactSystemKw * cfg.installationLaborPerKw));

    const turnkeySubtotal = panelsCost + inverterCost + structureCost + cablesAndProtections + netMeteringCost + batteryCost + installationLabor;
    const turnkeyMin = Math.round(turnkeySubtotal * 0.96);
    const turnkeyMax = Math.round(turnkeySubtotal * 1.04);

    return {
      systemKw: exactSystemKw,
      numberOfPanels,
      selectedPanel,
      selectedInverter,
      selectedBattery,
      panelsCost,
      inverterCost,
      batteryCost,
      structureCost,
      cablesAndProtections,
      netMeteringCost,
      installationLabor,
      turnkeySubtotal,
      turnkeyMin,
      turnkeyMax
    };
  }
}

export const dbService = new SolarSaaSDatabase();
export default dbService;
