import { useState, useEffect, useCallback } from 'react';
import './App.css';

// Define TypeScript interfaces
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  userType: string;
  companyName?: string;
  phone: string;
  address: string;
  lat?: number;
  lng?: number;
  registered: string;
  loginAttempts: number;
  lockUntil?: number;
  tinNumber?: string;
  businessLicense?: string;
  vatRegistered: boolean;
}

interface Company {
  id: string;
  userId: string;
  name: string;
  description: string;
  location: string;
  lat: number;
  lng: number;
  rating: number;
  totalOrders: number;
  established: string;
  tinNumber: string;
  businessLicense: string;
  vatNumber?: string;
  tradeLicenseExpiry: string;
  complianceStatus: 'compliant' | 'pending' | 'suspended';
}

interface Material {
  id: string;
  companyId: string;
  name: string;
  category: string;
  description: string;
  price: number;
  unit: string;
  quantity: number;
  minOrder: number;
  transportCost?: number;
  rating?: number;
  brand?: string;
  model?: string;
  specifications: {
    weight?: string;
    dimensions?: string;
    materialType?: string;
    color?: string;
    grade?: string;
    certification?: string[];
    origin?: string;
    shelfLife?: string;
    packaging?: string;
    safetyStandards?: string[];
  };
  images?: string[];
  taxIncluded: boolean;
  vatPercentage: number;
  lastUpdated: string;
}

interface Order {
  id: string;
  customerId: string;
  companyId: string;
  materialId: string;
  quantity: number;
  unitPrice: number;
  transportCost: number;
  totalAmount: number;
  status: string;
  orderDate: string;
  deliveryDate?: string;
  address: string;
  notes?: string;
  invoiceNumber?: string;
  taxAmount: number;
  vatAmount: number;
  paymentMethod: string;
  paymentStatus: string;
}

interface Alert {
  message: string;
  type: string;
}

interface FormData {
  loginEmail: string;
  loginPassword: string;
  selectedUser: string;
  registerFullName: string;
  registerEmail: string;
  registerPassword: string;
  registerPhone: string;
  registerAddress: string;
  registerCompanyName: string;
  registerUserType: string;
  materialName: string;
  materialCategory: string;
  materialPrice: string;
  materialQuantity: string;
  materialUnit: string;
  materialMinOrder: string;
  materialDescription: string;
  searchQuery: string;
  searchCategory: string;
  searchMaxPrice: string;
  searchSupplier: string;
  searchSortBy: 'price_asc' | 'price_desc' | 'distance_asc' | 'distance_desc' | 'rating_desc' | 'newest';
  orderQuantity: string;
  orderAddress: string;
  materialBrand: string;
  materialModel: string;
  materialWeight: string;
  materialDimensions: string;
  materialGrade: string;
  materialOrigin: string;
  materialCertifications: string;
}

// Ethiopian Regions/States
const ETHIOPIAN_REGIONS = [
  'Addis Ababa', 'Afar', 'Amhara', 'Benishangul-Gumuz', 'Dire Dawa', 
  'Gambela', 'Harari', 'Oromia', 'Somali', 'Southern Nations, Nationalities, and Peoples\' Region', 
  'Tigray', 'Sidama', 'South West Ethiopia Peoples\' Region'
];

// Measurement units
const MEASUREMENT_UNITS = [
  'Kilogram (KG)', 'Gram (g)', 'Liter (L)', 'Milliliter (mL)', 
  'Meter (m)', 'Centimeter (cm)', 'Millimeter (mm)', 'Square Meter (m²)', 
  'Cubic Meter (m³)', 'Piece', 'Box', 'Bag', 'Carton', 'Roll', 
  'Sheet', 'Bundle', 'Pair', 'Set', 'Ton', 'Quintal'
];

// Departments/Categories for Ethiopia
const DEPARTMENTS = [
  'Agriculture', 'Construction', 'Manufacturing', 'Healthcare', 
  'Education', 'Transportation', 'Energy', 'Information Technology',
  'Textile & Apparel', 'Food & Beverage', 'Pharmaceuticals', 'Mining',
  'Tourism', 'Real Estate', 'Telecommunications', 'Banking & Finance',
  'Government', 'NGO', 'Retail', 'Wholesale', 'Logistics', 'Automotive',
  'Electronics', 'Chemical', 'Plastic', 'Metal Works', 'Wood & Furniture',
  'Printing & Packaging', 'Water & Sanitation', 'Environmental'
];

// Certification Standards
const CERTIFICATION_STANDARDS = [
  'ES (Ethiopian Standard)', 'ISO 9001', 'ISO 14001', 'ISO 45001',
  'CE Mark', 'FDA Approved', 'WHO-GMP', 'Ethiopian FDA',
  'Quality Management System', 'Environmental Management',
  'Occupational Health & Safety'
];

function App() {
  // State Management
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [materials, setMaterials] = useState<Material[]>(() => {
    const savedMaterials = localStorage.getItem('materials');
    return savedMaterials ? JSON.parse(savedMaterials) : [];
  });
  const [companies, setCompanies] = useState<Company[]>(() => {
    const savedCompanies = localStorage.getItem('companies');
    return savedCompanies ? JSON.parse(savedCompanies) : [];
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    const savedOrders = localStorage.getItem('orders');
    return savedOrders ? JSON.parse(savedOrders) : [];
  });
  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      const parsedUsers = JSON.parse(savedUsers);
      return parsedUsers.map((user: User) => ({
        ...user,
        loginAttempts: user.loginAttempts || 0,
        lockUntil: user.lockUntil || 0,
        vatRegistered: user.vatRegistered || false
      }));
    }
    return [];
  });
  const [tins, setTins] = useState<Array<{id: string, userId: string, tinNumber: string, registeredDate: string, businessType: string}>>(() => {
    const savedTins = localStorage.getItem('tins');
    return savedTins ? JSON.parse(savedTins) : [];
  });
  const [searchResults, setSearchResults] = useState<Array<Material & {company?: Company, totalCost?: number, estimatedTransport?: number, distance?: number}>>([]);
  const [alert, setAlert] = useState<Alert | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'}>({ key: 'totalCost', direction: 'asc' });
  
  const [formData, setFormData] = useState<FormData>({
    loginEmail: '',
    loginPassword: '',
    selectedUser: '',
    registerFullName: '',
    registerEmail: '',
    registerPassword: '',
    registerPhone: '',
    registerAddress: '',
    registerCompanyName: '',
    registerUserType: 'customer',
    materialName: '',
    materialCategory: '',
    materialPrice: '',
    materialQuantity: '',
    materialUnit: '',
    materialMinOrder: '',
    materialDescription: '',
    searchQuery: '',
    searchCategory: 'all',
    searchMaxPrice: '',
    searchSupplier: '',
    searchSortBy: 'price_asc',
    orderQuantity: '',
    orderAddress: '',
    materialBrand: '',
    materialModel: '',
    materialWeight: '',
    materialDimensions: '',
    materialGrade: '',
    materialOrigin: 'Ethiopia',
    materialCertifications: '',
  });

  const [tinData, setTinData] = useState({
    tinNumber: '',
    businessName: '',
    businessType: '',
    region: '',
    woreda: '',
    kebele: '',
    businessAddress: '',
    registrationDate: new Date().toISOString().split('T')[0],
    vatNumber: '',
    tradeLicense: '',
    licenseExpiry: ''
  });

  // Initialize with sample data
  useEffect(() => {
    if (users.length === 0) {
      const sampleUsers: User[] = [
        {
          id: 'user1',
          name: 'Mehari Admin',
          email: 'meharinageb@gmail.com',
          password: 'password123',
          userType: 'company',
          companyName: 'Mehari General Supplies PLC',
          phone: '+251909919154',
          address: 'Bole Road, Addis Ababa, Ethiopia',
          lat: 8.9806,
          lng: 38.7578,
          registered: '2023-01-15',
          loginAttempts: 0,
          lockUntil: 0,
          tinNumber: 'ET0001234567',
          businessLicense: 'BL/ET/2023/001',
          vatRegistered: true
        },
        {
          id: 'user2',
          name: 'John Customer',
          email: 'customer@example.com',
          password: 'password123',
          userType: 'customer',
          companyName: '',
          phone: '+251 912 345 678',
          address: 'Megenagna, Addis Ababa, Ethiopia',
          lat: 9.0227,
          lng: 38.7468,
          registered: '2023-02-20',
          loginAttempts: 0,
          lockUntil: 0,
          vatRegistered: false
        }
      ];
      setUsers(sampleUsers);
      localStorage.setItem('users', JSON.stringify(sampleUsers));
    }

    if (companies.length === 0) {
      const sampleCompanies: Company[] = [
        {
          id: 'comp1',
          userId: 'user1',
          name: 'Mehari General Supplies PLC',
          description: 'Premium supplier for various industrial and consumer goods with 20+ years of experience',
          location: 'Bole Road, Addis Ababa',
          lat: 8.9806,
          lng: 38.7578,
          rating: 4.8,
          totalOrders: 124,
          established: '2020',
          tinNumber: 'ET0001234567',
          businessLicense: 'BL/ET/2023/001',
          vatNumber: 'VAT00123456',
          tradeLicenseExpiry: '2025-12-31',
          complianceStatus: 'compliant'
        },
        {
          id: 'comp2',
          userId: 'user3',
          name: 'Ethio Industrial Supplies PLC',
          description: 'Industrial materials wholesale with nationwide distribution',
          location: 'Merkato, Addis Ababa',
          lat: 9.0300,
          lng: 38.7500,
          rating: 4.5,
          totalOrders: 89,
          established: '2019',
          tinNumber: 'ET0002345678',
          businessLicense: 'BL/ET/2019/045',
          vatNumber: 'VAT00234567',
          tradeLicenseExpiry: '2024-12-31',
          complianceStatus: 'compliant'
        },
        {
          id: 'comp3',
          userId: 'user4',
          name: 'Addis Pharmaceuticals & Medical Supplies PLC',
          description: 'Specialized in medical and pharmaceutical products with FDA approval',
          location: 'Kaliti, Addis Ababa',
          lat: 8.8500,
          lng: 38.7200,
          rating: 4.7,
          totalOrders: 156,
          established: '2018',
          tinNumber: 'ET0003456789',
          businessLicense: 'BL/ET/2018/123',
          vatNumber: 'VAT00345678',
          tradeLicenseExpiry: '2024-12-31',
          complianceStatus: 'compliant'
        }
      ];
      setCompanies(sampleCompanies);
      localStorage.setItem('companies', JSON.stringify(sampleCompanies));
    }

    if (materials.length === 0) {
      const sampleMaterials: Material[] = [
        {
          id: 'mat1',
          companyId: 'comp1',
          name: 'Portland Cement - 42.5 Grade',
          category: 'Construction',
          description: 'High quality Portland cement 42.5 Grade for construction. Suitable for structural concrete, plastering, and masonry works.',
          price: 850,
          unit: '50kg bag',
          quantity: 500,
          minOrder: 10,
          transportCost: 15,
          rating: 4.5,
          brand: 'Dangote',
          model: 'PC-42.5',
          specifications: {
            weight: '50kg',
            dimensions: 'N/A',
            materialType: 'Cement',
            color: 'Gray',
            grade: '42.5',
            certification: ['ES (Ethiopian Standard)', 'ISO 9001'],
            origin: 'Ethiopia',
            shelfLife: '6 months',
            packaging: 'PP woven bags',
            safetyStandards: ['OSHA Compliant', 'Dust Control']
          },
          images: ['cement1.jpg', 'cement2.jpg'],
          taxIncluded: true,
          vatPercentage: 15,
          lastUpdated: '2024-01-15'
        },
        {
          id: 'mat2',
          companyId: 'comp1',
          name: 'Medical Gloves - Nitrile Powder-Free',
          category: 'Healthcare',
          description: 'Disposable latex-free medical gloves, powder-free, ambidextrous. Suitable for medical and laboratory use.',
          price: 120,
          unit: 'Box (100 pcs)',
          quantity: 1000,
          minOrder: 5,
          transportCost: 8,
          rating: 4.7,
          brand: 'MediSafe',
          model: 'NG-100',
          specifications: {
            weight: '200g per box',
            dimensions: 'Medium',
            materialType: 'Nitrile',
            color: 'Blue',
            grade: 'Medical Grade',
            certification: ['FDA Approved', 'CE Mark', 'ISO 13485'],
            origin: 'China',
            shelfLife: '5 years',
            packaging: 'Box of 100',
            safetyStandards: ['FDA Class I', 'Latex Free']
          },
          images: ['gloves1.jpg'],
          taxIncluded: true,
          vatPercentage: 15,
          lastUpdated: '2024-01-10'
        },
        {
          id: 'mat3',
          companyId: 'comp2',
          name: 'Fertilizer Urea - 46% Nitrogen',
          category: 'Agriculture',
          description: 'Agricultural grade urea fertilizer with 46% nitrogen content. Promotes healthy plant growth and high yield.',
          price: 950,
          unit: '50kg bag',
          quantity: 2000,
          minOrder: 20,
          transportCost: 12,
          rating: 4.3,
          brand: 'AgriMax',
          model: 'U-46',
          specifications: {
            weight: '50kg',
            dimensions: 'N/A',
            materialType: 'Chemical Fertilizer',
            color: 'White',
            grade: '46% N',
            certification: ['ES (Ethiopian Standard)', 'ISO 14001'],
            origin: 'Ethiopia',
            shelfLife: '2 years',
            packaging: 'PP woven bags',
            safetyStandards: ['MSDS Available', 'Proper Storage Required']
          },
          taxIncluded: true,
          vatPercentage: 15,
          lastUpdated: '2024-01-12'
        },
        {
          id: 'mat4',
          companyId: 'comp3',
          name: 'Desktop Computer - Dell Optiplex 3090',
          category: 'Information Technology',
          description: 'Dell Optiplex 3090 desktop computer with Intel Core i5, 8GB RAM, 256GB SSD. Perfect for office and educational use.',
          price: 25000,
          unit: 'Piece',
          quantity: 50,
          minOrder: 1,
          transportCost: 200,
          rating: 4.6,
          brand: 'Dell',
          model: 'Optiplex 3090',
          specifications: {
            weight: '5.2kg',
            dimensions: '292 x 92 x 294 mm',
            materialType: 'Electronic',
            color: 'Black',
            grade: 'Commercial Grade',
            certification: ['ISO 9001', 'Energy Star'],
            origin: 'China',
            shelfLife: 'N/A',
            packaging: 'Original box',
            safetyStandards: ['FCC', 'CE', 'RoHS']
          },
          taxIncluded: true,
          vatPercentage: 15,
          lastUpdated: '2024-01-05'
        }
      ];
      setMaterials(sampleMaterials);
      localStorage.setItem('materials', JSON.stringify(sampleMaterials));
    }

    if (orders.length === 0) {
      const sampleOrders: Order[] = [
        {
          id: 'order1',
          customerId: 'user2',
          companyId: 'comp1',
          materialId: 'mat1',
          quantity: 50,
          unitPrice: 850,
          transportCost: 750,
          totalAmount: 43000,
          status: 'delivered',
          orderDate: '2023-10-15',
          deliveryDate: '2023-10-18',
          address: 'Megenagna, Addis Ababa',
          invoiceNumber: 'INV-2023-001',
          taxAmount: 6450,
          vatAmount: 967.5,
          paymentMethod: 'Bank Transfer',
          paymentStatus: 'paid'
        }
      ];
      setOrders(sampleOrders);
      localStorage.setItem('orders', JSON.stringify(sampleOrders));
    }
    
    if (tins.length === 0) {
      const sampleTins = [
        {
          id: 'tin1',
          userId: 'user1',
          tinNumber: 'ET0001234567',
          registeredDate: '2020-05-15',
          businessType: 'General Trading'
        }
      ];
      setTins(sampleTins);
      localStorage.setItem('tins', JSON.stringify(sampleTins));
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('materials', JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem('companies', JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);
  
  useEffect(() => {
    localStorage.setItem('tins', JSON.stringify(tins));
  }, [tins]);

  // Utility Functions
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const showAlert = (message: string, type = 'info', duration = 5000): void => {
    setAlert({ message, type });
    if (duration > 0) {
      setTimeout(() => setAlert(null), duration);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculateTransportCost = (fromLat: number, fromLng: number, toLat: number, toLng: number, quantity: number): number => {
    const distance = calculateDistance(fromLat, fromLng, toLat, toLng);
    
    const baseRate = 500;
    const ratePerKm = 15;
    const quantityFactor = Math.max(1, quantity / 100);
    
    return Math.round(baseRate + (distance * ratePerKm * quantityFactor));
  };

  const getMaterialById = (id: string): Material | undefined => materials.find(m => m.id === id);
  const getCompanyById = (id: string): Company | undefined => companies.find(c => c.id === id);
  const getUserById = (id: string): User | undefined => users.find(u => u.id === id);
  const getCompanyByUserId = (userId: string): Company | undefined => companies.find(c => c.userId === userId);
  const getTinByUserId = (userId: string) => tins.find(t => t.userId === userId);

  const isUserLocked = (user: User): boolean => {
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return true;
    }
    return false;
  };

  const resetLoginAttempts = (userId: string): void => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId && user.lockUntil && user.lockUntil <= Date.now()) {
        return {
          ...user,
          loginAttempts: 0,
          lockUntil: 0
        };
      }
      return user;
    }));
  };

  const handleTinRegistration = (e: React.FormEvent): void => {
    e.preventDefault();
    
    if (!currentUser) {
      showAlert('Please login to register TIN', 'danger');
      return;
    }
    
    const existingTin = getTinByUserId(currentUser.id);
    if (existingTin) {
      showAlert('You already have a registered TIN', 'warning');
      return;
    }
    
    const newTin = {
      id: 'tin' + (tins.length + 1),
      userId: currentUser.id,
      tinNumber: tinData.tinNumber,
      registeredDate: tinData.registrationDate,
      businessType: tinData.businessType
    };
    
    setTins(prev => [...prev, newTin]);
    
    const company = getCompanyByUserId(currentUser.id);
    if (company) {
      setCompanies(prev => prev.map(comp => {
        if (comp.id === company.id) {
          return {
            ...comp,
            tinNumber: tinData.tinNumber,
            vatNumber: tinData.vatNumber,
            businessLicense: tinData.tradeLicense,
            tradeLicenseExpiry: tinData.licenseExpiry
          };
        }
        return comp;
      }));
    }
    
    showAlert('TIN registered successfully! Your business is now compliant with Ethiopian trade regulations.', 'success');
    
    setTinData({
      tinNumber: '',
      businessName: '',
      businessType: '',
      region: '',
      woreda: '',
      kebele: '',
      businessAddress: '',
      registrationDate: new Date().toISOString().split('T')[0],
      vatNumber: '',
      tradeLicense: '',
      licenseExpiry: ''
    });
  };

  const handleLogin = (e: React.FormEvent): void => {
    e.preventDefault();
    const { loginPassword, selectedUser } = formData;
    
    const user = users.find(u => u.email === selectedUser);
    
    if (!user) {
      showAlert('Please select a valid user from the list or enter a valid email', 'danger');
      return;
    }
    
    if (isUserLocked(user)) {
      const remainingTime = Math.ceil((user.lockUntil! - Date.now()) / 1000);
      showAlert(`Account is locked. Please try again in ${remainingTime} seconds`, 'danger');
      return;
    }
    
    if (user.password === loginPassword) {
      setUsers(prev => prev.map(u => {
        if (u.id === user.id) {
          return {
            ...u,
            loginAttempts: 0,
            lockUntil: 0
          };
        }
        return u;
      }));
      
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      showAlert('Login successful!', 'success');
      setCurrentPage('home');
      setFormData(prev => ({ ...prev, loginPassword: '', selectedUser: '' }));
    } else {
      const newAttempts = (user.loginAttempts || 0) + 1;
      let lockUntil = 0;
      
      if (newAttempts >= 3) {
        lockUntil = Date.now() + 30000;
        showAlert('Too many failed attempts. Account locked for 30 seconds.', 'danger');
      } else {
        showAlert(`Incorrect password. ${3 - newAttempts} attempts remaining.`, 'danger');
      }
      
      setUsers(prev => prev.map(u => {
        if (u.id === user.id) {
          return {
            ...u,
            loginAttempts: newAttempts,
            lockUntil: lockUntil
          };
        }
        return u;
      }));
    }
  };

  const handleRegister = (e: React.FormEvent): void => {
    e.preventDefault();
    const { 
      registerFullName, registerEmail, registerPassword, registerPhone, 
      registerAddress, registerCompanyName, registerUserType 
    } = formData;
    
    const existingUser = users.find(u => u.email === registerEmail);
    if (existingUser) {
      showAlert('User with this email already exists', 'danger');
      return;
    }
    
    const newUser: User = {
      id: 'user' + (users.length + 1),
      name: registerFullName,
      email: registerEmail,
      password: registerPassword,
      phone: registerPhone,
      address: registerAddress,
      userType: registerUserType,
      companyName: registerUserType === 'company' ? registerCompanyName : '',
      lat: 9.0320 + (Math.random() * 0.05 - 0.025),
      lng: 38.7469 + (Math.random() * 0.05 - 0.025),
      registered: new Date().toISOString().split('T')[0],
      loginAttempts: 0,
      lockUntil: 0,
      vatRegistered: false
    };
    
    setUsers(prev => [...prev, newUser]);
    
    if (registerUserType === 'company') {
      const newCompany: Company = {
        id: 'comp' + (companies.length + 1),
        userId: newUser.id,
        name: registerCompanyName,
        description: '',
        location: registerAddress,
        lat: newUser.lat || 9.0320,
        lng: newUser.lng || 38.7469,
        rating: 0,
        totalOrders: 0,
        established: new Date().getFullYear().toString(),
        tinNumber: '',
        businessLicense: '',
        tradeLicenseExpiry: '',
        complianceStatus: 'pending'
      };
      setCompanies(prev => [...prev, newCompany]);
    }
    
    showAlert('Registration successful! Please login.', 'success');
    setCurrentPage('login');
    setFormData(prev => ({
      ...prev,
      registerFullName: '',
      registerEmail: '',
      registerPassword: '',
      registerPhone: '',
      registerAddress: '',
      registerCompanyName: ''
    }));
  };

  const handleLogout = (): void => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    showAlert('Logged out successfully', 'info');
    setCurrentPage('home');
  };

  const handleAddMaterial = (e: React.FormEvent): void => {
    e.preventDefault();
    const { 
      materialName, materialCategory, materialPrice, materialQuantity,
      materialUnit, materialMinOrder, materialDescription,
      materialBrand, materialModel, materialWeight, materialDimensions,
      materialGrade, materialOrigin, materialCertifications
    } = formData;
    
    if (!currentUser || currentUser.userType !== 'company') {
      showAlert('Only company users can add materials', 'danger');
      return;
    }
    
    const company = getCompanyByUserId(currentUser.id);
    if (!company) {
      showAlert('Company profile not found', 'danger');
      return;
    }
    
    const newMaterial: Material = {
      id: 'mat' + (materials.length + 1),
      companyId: company.id,
      name: materialName,
      category: materialCategory,
      price: parseFloat(materialPrice),
      quantity: parseInt(materialQuantity),
      unit: materialUnit,
      minOrder: parseInt(materialMinOrder),
      description: materialDescription,
      transportCost: 15,
      rating: 0,
      brand: materialBrand,
      model: materialModel,
      specifications: {
        weight: materialWeight,
        dimensions: materialDimensions,
        grade: materialGrade,
        origin: materialOrigin,
        certification: materialCertifications.split(',').map(c => c.trim()).filter(c => c)
      },
      taxIncluded: true,
      vatPercentage: 15,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    setMaterials(prev => [...prev, newMaterial]);
    showAlert('Material added successfully! Product specifications saved.', 'success');
    setCurrentPage('company-dashboard');
    
    setFormData(prev => ({
      ...prev,
      materialName: '',
      materialCategory: '',
      materialPrice: '',
      materialQuantity: '',
      materialUnit: '',
      materialMinOrder: '',
      materialDescription: '',
      materialBrand: '',
      materialModel: '',
      materialWeight: '',
      materialDimensions: '',
      materialGrade: '',
      materialOrigin: 'Ethiopia',
      materialCertifications: ''
    }));
  };

  const handleDeleteMaterial = (id: string): void => {
    setMaterials(prev => prev.filter(m => m.id !== id));
    showAlert('Material deleted successfully', 'success');
  };

  const handlePlaceOrder = (materialId: string): void => {
    if (!currentUser || currentUser.userType !== 'customer') {
      showAlert('Only customers can place orders', 'danger');
      return;
    }
    
    const { orderQuantity, orderAddress } = formData;
    const quantity = parseInt(orderQuantity);
    
    const material = getMaterialById(materialId);
    if (!material) {
      showAlert('Material not found', 'danger');
      return;
    }
    
    if (quantity < material.minOrder) {
      showAlert(`Minimum order quantity is ${material.minOrder}`, 'danger');
      return;
    }
    
    const company = getCompanyById(material.companyId);
    if (!company) {
      showAlert('Supplier not found', 'danger');
      return;
    }
    
    const transportCost = calculateTransportCost(
      company.lat, company.lng,
      currentUser.lat || 9.0320, currentUser.lng || 38.7469,
      quantity
    );
    
    const subtotal = material.price * quantity;
    const vatAmount = material.taxIncluded ? 0 : subtotal * (material.vatPercentage / 100);
    const totalAmount = subtotal + transportCost + vatAmount;
    
    const newOrder: Order = {
      id: 'order' + (orders.length + 1),
      customerId: currentUser.id,
      companyId: company.id,
      materialId: materialId,
      quantity: quantity,
      unitPrice: material.price,
      transportCost: transportCost,
      totalAmount: totalAmount,
      status: 'pending',
      orderDate: new Date().toISOString().split('T')[0],
      address: orderAddress || currentUser.address,
      notes: '',
      invoiceNumber: `INV-${new Date().getFullYear()}-${orders.length + 1000}`,
      taxAmount: 0,
      vatAmount: vatAmount,
      paymentMethod: 'Bank Transfer',
      paymentStatus: 'pending'
    };
    
    setOrders(prev => [...prev, newOrder]);
    showAlert('Order placed successfully! Invoice generated.', 'success');
    setCurrentPage('orders');
    setFormData(prev => ({ ...prev, orderQuantity: '', orderAddress: '' }));
  };

  const handleUpdateOrderStatus = (orderId: string, status: string): void => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const updatedOrder = { ...order, status };
        if (status === 'delivered') {
          updatedOrder.deliveryDate = new Date().toISOString().split('T')[0];
          updatedOrder.paymentStatus = 'paid';
        }
        return updatedOrder;
      }
      return order;
    }));
    showAlert(`Order status updated to ${status}`, 'success');
  };

  const handleContactSupplier = (materialId: string): void => {
    const material = getMaterialById(materialId);
    if (!material) return;
    
    const company = getCompanyById(material.companyId);
    if (!company) return;
    
    const user = users.find(u => u.id === company.userId);
    if (!user) return;
    
    showAlert(`Contacting ${company.name}. Phone: ${user.phone}. Email: ${user.email}`, 'info');
  };

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const { searchQuery, searchCategory, searchMaxPrice, searchSupplier, searchSortBy } = formData;
    
    let results = materials.filter(material => {
      let matches = true;
      
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        matches = matches && (
          material.name.toLowerCase().includes(searchLower) ||
          material.description.toLowerCase().includes(searchLower) ||
          material.brand?.toLowerCase().includes(searchLower) ||
          material.model?.toLowerCase().includes(searchLower) ||
          material.category.toLowerCase().includes(searchLower)
        );
      }
      
      if (searchCategory && searchCategory !== 'all') {
        matches = matches && material.category === searchCategory;
      }
      
      if (searchMaxPrice) {
        matches = matches && material.price <= parseFloat(searchMaxPrice);
      }
      
      if (searchSupplier) {
        const company = getCompanyById(material.companyId);
        matches = matches && company?.name.toLowerCase().includes(searchSupplier.toLowerCase());
      }
      
      return matches;
    });
    
    results = results.map(material => {
      const company = getCompanyById(material.companyId);
      let estimatedTransport = 0;
      let distance = 0;
      
      if (company && currentUser) {
        distance = calculateDistance(
          company.lat, company.lng,
          currentUser.lat || 9.0320, currentUser.lng || 38.7469
        );
        estimatedTransport = calculateTransportCost(
          company.lat, company.lng,
          currentUser.lat || 9.0320, currentUser.lng || 38.7469,
          material.minOrder
        );
      }
      
      const totalCost = material.price + (estimatedTransport / material.minOrder);
      
      return {
        ...material,
        company,
        totalCost,
        estimatedTransport,
        distance
      };
    });
    
    results.sort((a, b) => {
      switch (searchSortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'distance_asc':
          return (a.distance || 0) - (b.distance || 0);
        case 'distance_desc':
          return (b.distance || 0) - (a.distance || 0);
        case 'rating_desc':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        default:
          return (a.totalCost || 0) - (b.totalCost || 0);
      }
    });
    
    setSearchResults(results);
    setSortConfig({ key: searchSortBy.split('_')[0], direction: searchSortBy.includes('asc') ? 'asc' : 'desc' });
  }, [formData, materials, currentUser]);

  const handleSort = (sortBy: FormData['searchSortBy']) => {
    setFormData(prev => ({ ...prev, searchSortBy: sortBy }));
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSearch(fakeEvent);
  };

  const navigateTo = (page: string): void => {
    setCurrentPage(page);
  };

  const switchUserType = (type: string): void => {
    setFormData(prev => ({ ...prev, registerUserType: type }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'selectedUser' && value) {
      const user = users.find(u => u.email === value);
      if (user && isUserLocked(user)) {
        const remainingTime = Math.ceil((user.lockUntil! - Date.now()) / 1000);
        showAlert(`This account is currently locked. Please try again in ${remainingTime} seconds.`, 'warning', 3000);
      }
    }
  };

  const handleDatalistInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, selectedUser: value }));
    
    const user = users.find(u => u.email === value);
    if (user && isUserLocked(user)) {
      const remainingTime = Math.ceil((user.lockUntil! - Date.now()) / 1000);
      showAlert(`This account is currently locked. Please try again in ${remainingTime} seconds.`, 'warning', 3000);
    }
  };

  const handleTinInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setTinData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      users.forEach(user => {
        if (user.lockUntil && user.lockUntil <= Date.now()) {
          resetLoginAttempts(user.id);
        }
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [users]);

  const calculateStats = () => {
    const userOrders = currentUser ? orders.filter(o => 
      currentUser.userType === 'company' 
        ? getCompanyByUserId(currentUser.id)?.id === o.companyId
        : o.customerId === currentUser.id
    ) : [];
    
    const totalRevenue = userOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const pendingOrders = userOrders.filter(o => o.status === 'pending').length;
    const deliveredOrders = userOrders.filter(o => o.status === 'delivered').length;
    
    return { totalRevenue, pendingOrders, deliveredOrders, totalOrders: userOrders.length };
  };

  const renderHeader = () => (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <div className="logo-icon">
            <i className="fas fa-boxes"></i>
          </div>
          <div className="logo-text">
            <h1>EthioSupply AI</h1>
            <p>AI-Driven Supply Chain Platform for Ethiopia</p>
          </div>
        </div>
        
        <div className="nav-links">
          {currentUser ? renderUserNav() : renderGuestNav()}
        </div>
      </div>
    </header>
  );

  const renderGuestNav = () => (
    <>
      <a href="#" className={`nav-link ${currentPage === 'home' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigateTo('home'); }}>
        <i className="fas fa-home"></i> Home
      </a>
      <a href="#" className={`nav-link ${currentPage === 'login' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigateTo('login'); }}>
        <i className="fas fa-sign-in-alt"></i> Login
      </a>
      <a href="#" className={`nav-link ${currentPage === 'register' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigateTo('register'); }}>
        <i className="fas fa-user-plus"></i> Register
      </a>
    </>
  );

  const renderUserNav = () => {
    const isCompany = currentUser?.userType === 'company';
    const userTin = getTinByUserId(currentUser?.id || '');
    
    return (
      <>
        <a href="#" className={`nav-link ${currentPage === 'home' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigateTo('home'); }}>
          <i className="fas fa-home"></i> Home
        </a>
        
        {isCompany ? (
          <>
            <a href="#" className={`nav-link ${currentPage === 'company-dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigateTo('company-dashboard'); }}>
              <i className="fas fa-tachometer-alt"></i> Dashboard
            </a>
            <a href="#" className={`nav-link ${currentPage === 'add-material' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigateTo('add-material'); }}>
              <i className="fas fa-box"></i> Add Product
            </a>
            <a href="#" className={`nav-link ${currentPage === 'analytics' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigateTo('analytics'); }}>
              <i className="fas fa-chart-line"></i> Analytics
            </a>
          </>
        ) : (
          <>
            <a href="#" className={`nav-link ${currentPage === 'customer-dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigateTo('customer-dashboard'); }}>
              <i className="fas fa-tachometer-alt"></i> Dashboard
            </a>
            <a href="#" className={`nav-link ${currentPage === 'search-materials' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigateTo('search-materials'); }}>
              <i className="fas fa-search"></i> Search
            </a>
            <a href="#" className={`nav-link ${currentPage === 'price-forecast' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigateTo('price-forecast'); }}>
              <i className="fas fa-chart-bar"></i> Price Forecast
            </a>
          </>
        )}
        
        <a href="#" className={`nav-link ${currentPage === 'orders' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigateTo('orders'); }}>
          <i className="fas fa-shopping-cart"></i> Orders
        </a>
        <a href="#" className={`nav-link ${currentPage === 'supplier-map' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigateTo('supplier-map'); }}>
          <i className="fas fa-map-marked-alt"></i> Supplier Map
        </a>
        
        {isCompany && !userTin && (
          <a href="#" className={`nav-link ${currentPage === 'tin-registration' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigateTo('tin-registration'); }}>
            <i className="fas fa-file-contract"></i> Register TIN
          </a>
        )}
        
        <div className="user-info">
          <div className="user-avatar">
            {currentUser?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="user-name">{currentUser?.name}</div>
            <div className="user-type">
              {currentUser?.userType === 'company' ? 'Supplier' : 'Customer'}
              {userTin && <span className="tin-badge">TIN: {userTin.tinNumber}</span>}
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </>
    );
  };

  const renderAlert = () => {
    if (!alert) return null;
    
    const alertIcons: Record<string, string> = {
      success: 'check-circle',
      danger: 'exclamation-circle',
      warning: 'exclamation-triangle',
      info: 'info-circle'
    };
    
    return (
      <div className={`alert alert-${alert.type}`}>
        <i className={`fas fa-${alertIcons[alert.type] || 'info-circle'}`}></i>
        {alert.message}
      </div>
    );
  };

  const renderMaterialSpecs = (material: Material) => {
    const specs = material.specifications;
    return (
      <div className="specs-grid">
        {specs.brand && (
          <div className="spec-item">
            <label>Brand:</label>
            <span>{specs.brand}</span>
          </div>
        )}
        {specs.model && (
          <div className="spec-item">
            <label>Model:</label>
            <span>{specs.model}</span>
          </div>
        )}
        {specs.grade && (
          <div className="spec-item">
            <label>Grade:</label>
            <span>{specs.grade}</span>
          </div>
        )}
        {specs.weight && (
          <div className="spec-item">
            <label>Weight:</label>
            <span>{specs.weight}</span>
          </div>
        )}
        {specs.dimensions && (
          <div className="spec-item">
            <label>Dimensions:</label>
            <span>{specs.dimensions}</span>
          </div>
        )}
        {specs.origin && (
          <div className="spec-item">
            <label>Origin:</label>
            <span>{specs.origin}</span>
          </div>
        )}
        {specs.shelfLife && (
          <div className="spec-item">
            <label>Shelf Life:</label>
            <span>{specs.shelfLife}</span>
          </div>
        )}
        {specs.certification && specs.certification.length > 0 && (
          <div className="spec-item full-width">
            <label>Certifications:</label>
            <div className="certifications">
              {specs.certification.map((cert, idx) => (
                <span key={idx} className="cert-badge">{cert}</span>
              ))}
            </div>
          </div>
        )}
        <div className="spec-item full-width">
          <label>Tax & Compliance:</label>
          <div className="compliance-info">
            <span className={`tax-badge ${material.taxIncluded ? 'included' : 'excluded'}`}>
              {material.taxIncluded ? 'Tax Included' : 'Tax Excluded'}
            </span>
            <span className="vat-badge">VAT: {material.vatPercentage}%</span>
            <span className="last-updated">Updated: {formatDate(material.lastUpdated)}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderMaterialDetails = () => {
    if (!selectedMaterial) return null;
    
    const company = getCompanyById(selectedMaterial.companyId);
    
    return (
      <div className="modal-overlay" onClick={() => setSelectedMaterial(null)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{selectedMaterial.name}</h2>
            <button className="modal-close" onClick={() => setSelectedMaterial(null)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="modal-body">
            <div className="material-detail-grid">
              <div className="detail-section">
                <h3>Product Description</h3>
                <p>{selectedMaterial.description}</p>
              </div>
              
              <div className="detail-section">
                <h3>Specifications</h3>
                {renderMaterialSpecs(selectedMaterial)}
              </div>
              
              <div className="detail-section">
                <h3>Supplier Information</h3>
                {company && (
                  <div className="supplier-details">
                    <div className="supplier-header">
                      <h4>{company.name}</h4>
                      <div className="supplier-rating">
                        <i className="fas fa-star"></i> {company.rating}/5
                      </div>
                    </div>
                    <p>{company.description}</p>
                    <div className="supplier-info-grid">
                      <div className="info-item">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{company.location}</span>
                      </div>
                      <div className="info-item">
                        <i className="fas fa-file-contract"></i>
                        <span>TIN: {company.tinNumber}</span>
                      </div>
                      <div className="info-item">
                        <i className="fas fa-shield-alt"></i>
                        <span>License: {company.businessLicense}</span>
                      </div>
                      <div className="info-item">
                        <i className="fas fa-calendar-check"></i>
                        <span>Established: {company.established}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="detail-section">
                <h3>Pricing & Order Information</h3>
                <div className="pricing-details">
                  <div className="price-breakdown">
                    <div className="price-item">
                      <span>Unit Price:</span>
                      <strong>{formatCurrency(selectedMaterial.price)}</strong>
                    </div>
                    <div className="price-item">
                      <span>Unit:</span>
                      <span>{selectedMaterial.unit}</span>
                    </div>
                    <div className="price-item">
                      <span>Minimum Order:</span>
                      <span>{selectedMaterial.minOrder} {selectedMaterial.unit}</span>
                    </div>
                    <div className="price-item">
                      <span>Available Stock:</span>
                      <span>{selectedMaterial.quantity} {selectedMaterial.unit}</span>
                    </div>
                    <div className="price-item">
                      <span>VAT:</span>
                      <span>{selectedMaterial.vatPercentage}%</span>
                    </div>
                  </div>
                  
                  <div className="order-form">
                    <h4>Place Order</h4>
                    <div className="form-group">
                      <label>Quantity</label>
                      <input
                        type="number"
                        min={selectedMaterial.minOrder}
                        max={selectedMaterial.quantity}
                        value={formData.orderQuantity}
                        onChange={(e) => setFormData(prev => ({ ...prev, orderQuantity: e.target.value }))}
                        placeholder={`Min: ${selectedMaterial.minOrder}`}
                      />
                    </div>
                    <div className="form-group">
                      <label>Delivery Address</label>
                      <input
                        type="text"
                        value={formData.orderAddress}
                        onChange={(e) => setFormData(prev => ({ ...prev, orderAddress: e.target.value }))}
                        placeholder="Enter delivery address"
                      />
                    </div>
                    <button 
                      className="btn btn-primary"
                      onClick={() => {
                        handlePlaceOrder(selectedMaterial.id);
                        setSelectedMaterial(null);
                      }}
                    >
                      <i className="fas fa-shopping-cart"></i> Place Order
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderHome = () => {
    const stats = {
      totalMaterials: materials.length,
      totalCompanies: companies.length,
      totalOrders: orders.length,
      avgRating: (materials.reduce((sum: number, m: Material) => sum + (m.rating || 0), 0) / materials.length).toFixed(1) || '4.5'
    };
    
    return (
      <main className="main-content">
        <section className="home-hero">
          <h1>AI-Driven Supply Chain Platform for Ethiopia</h1>
          <p>Connecting businesses across all departments and regions in Ethiopia</p>
          <p className="hero-subtitle">Optimizing supply chains across Agriculture, Construction, Healthcare, Manufacturing, and more through AI-powered solutions</p>
          
          {currentUser ? (
            <div className="cta-buttons">
              {currentUser.userType === 'company' ? (
                <button className="btn btn-primary" onClick={() => navigateTo('company-dashboard')}>
                  <i className="fas fa-tachometer-alt"></i> Go to Dashboard
                </button>
              ) : (
                <button className="btn btn-primary" onClick={() => navigateTo('search-materials')}>
                  <i className="fas fa-search"></i> Find Products
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => navigateTo('supplier-map')}>
                <i className="fas fa-map-marked-alt"></i> View Supplier Map
              </button>
            </div>
          ) : (
            <div className="cta-buttons">
              <button className="btn btn-primary" onClick={() => navigateTo('register')}>
                <i className="fas fa-user-plus"></i> Get Started
              </button>
              <button className="btn btn-secondary" onClick={() => navigateTo('login')}>
                <i className="fas fa-sign-in-alt"></i> Login
              </button>
            </div>
          )}
        </section>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.totalMaterials}+</div>
            <div className="stat-label">Products Listed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalCompanies}</div>
            <div className="stat-label">Verified Suppliers</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalOrders}</div>
            <div className="stat-label">Orders Processed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.avgRating}/5</div>
            <div className="stat-label">Average Rating</div>
          </div>
        </div>
        
        <h2 className="text-center mb-3">Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-robot"></i>
            </div>
            <h3>AI Price Forecasting</h3>
            <p>Predict future product prices using machine learning algorithms based on historical data and market trends</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-map-marked-alt"></i>
            </div>
            <h3>GIS Supplier Mapping</h3>
            <p>Interactive map showing supplier locations across all Ethiopian regions with real-time transport cost calculations</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-truck-loading"></i>
            </div>
            <h3>Logistics Optimization</h3>
            <p>Smart routing and transport cost minimization using advanced algorithms</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-file-contract"></i>
            </div>
            <h3>TIN Registration</h3>
            <p>Register and manage Taxpayer Identification Numbers for Ethiopian businesses</p>
          </div>
        </div>
        
        <h2 className="text-center mb-3">Departments Served</h2>
        <div className="departments-grid">
          {DEPARTMENTS.slice(0, 12).map((dept, index) => (
            <div className="department-badge" key={index}>
              <i className="fas fa-industry"></i> {dept}
            </div>
          ))}
        </div>
      </main>
    );
  };

  const renderLogin = () => {
    const selectedUser = users.find(u => u.email === formData.selectedUser);
    const isLocked = selectedUser ? isUserLocked(selectedUser) : false;
    const remainingTime = selectedUser && selectedUser.lockUntil 
      ? Math.ceil((selectedUser.lockUntil - Date.now()) / 1000)
      : 0;
    
    return (
      <main className="main-content">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <h2>Welcome Back</h2>
              <p>Login to your account</p>
            </div>
            <div className="auth-body">
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label">Select or Enter Email</label>
                  <div className="hybrid-input-container">
                    <input
                      list="userList"
                      className="form-input hybrid-input"
                      name="selectedUser"
                      value={formData.selectedUser}
                      onChange={handleDatalistInputChange}
                      required
                      placeholder="Select user or type email"
                      disabled={isLocked}
                    />
                    <datalist id="userList">
                      {users.map(user => (
                        <option 
                          key={user.id} 
                          value={user.email}
                        >
                          {user.name} - {user.email} ({user.userType === 'company' ? 'Supplier' : 'Customer'})
                        </option>
                      ))}
                    </datalist>
                    <div className="input-hint">
                      <i className="fas fa-info-circle"></i>
                      Select from list or type your email
                    </div>
                  </div>
                  
                  {selectedUser && isLocked && (
                    <div className="alert alert-warning mt-1">
                      <i className="fas fa-lock"></i>
                      Account locked. Please try again in {remainingTime > 0 ? remainingTime : 0} seconds.
                    </div>
                  )}
                  
                  {selectedUser && !isLocked && selectedUser.loginAttempts > 0 && (
                    <div className="alert alert-info mt-1">
                      <i className="fas fa-exclamation-triangle"></i>
                      {selectedUser.loginAttempts} failed attempt(s). {3 - selectedUser.loginAttempts} attempt(s) remaining.
                    </div>
                  )}
                </div>
                
                {formData.selectedUser && !isLocked && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Password for {selectedUser?.name}</label>
                      <input 
                        type="password" 
                        className="form-input" 
                        name="loginPassword"
                        value={formData.loginPassword}
                        onChange={handleInputChange}
                        required 
                        placeholder="Enter your password"
                        autoComplete="current-password"
                      />
                    </div>
                    
                    <button type="submit" className="btn-submit" disabled={isLocked}>
                      <i className="fas fa-sign-in-alt"></i> Login
                    </button>
                  </>
                )}
                
                {!formData.selectedUser && (
                  <div className="alert alert-info">
                    <i className="fas fa-info-circle"></i>
                    Please select or enter your email address to continue
                  </div>
                )}
              </form>
              
              <div className="text-center mt-2">
                <p>Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('register'); }}>Register here</a></p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  };

  const renderRegister = () => (
    <main className="main-content">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Create Account</h2>
            <p>Join EthioSupply AI Platform</p>
          </div>
          <div className="auth-body">
            <div className="auth-tabs">
              <button 
                className={`auth-tab ${formData.registerUserType === 'customer' ? 'active' : ''}`} 
                onClick={() => switchUserType('customer')}
              >
                Customer
              </button>
              <button 
                className={`auth-tab ${formData.registerUserType === 'company' ? 'active' : ''}`} 
                onClick={() => switchUserType('company')}
              >
                Supplier
              </button>
            </div>
            
            <form onSubmit={handleRegister}>
              {formData.registerUserType === 'company' && (
                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    name="registerCompanyName"
                    value={formData.registerCompanyName}
                    onChange={handleInputChange}
                    placeholder="Enter company name"
                    required={formData.registerUserType === 'company'}
                  />
                </div>
              )}
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    name="registerFullName"
                    value={formData.registerFullName}
                    onChange={handleInputChange}
                    required 
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    name="registerEmail"
                    value={formData.registerEmail}
                    onChange={handleInputChange}
                    required 
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    name="registerPassword"
                    value={formData.registerPassword}
                    onChange={handleInputChange}
                    required 
                    placeholder="Create a password"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input 
                    type="tel" 
                    className="form-input" 
                    name="registerPhone"
                    value={formData.registerPhone}
                    onChange={handleInputChange}
                    required 
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Address *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  name="registerAddress"
                  value={formData.registerAddress}
                  onChange={handleInputChange}
                  required 
                  placeholder="Enter your address"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <input type="checkbox" required /> I agree to Ethiopian Trade Regulations
                </label>
                <p className="form-hint">
                  By registering, you agree to comply with all Ethiopian trade laws and regulations including proper TIN registration and tax compliance.
                </p>
              </div>
              
              <button type="submit" className="btn-submit">
                <i className="fas fa-user-plus"></i> Create Account
              </button>
            </form>
            
            <div className="text-center mt-2">
              <p>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('login'); }}>Login here</a></p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );

  const renderCompanyDashboard = () => {
    if (!currentUser || currentUser.userType !== 'company') {
      return (
        <main className="main-content">
          <div className="alert alert-danger">Access denied. Company users only.</div>
        </main>
      );
    }
    
    const company = getCompanyByUserId(currentUser.id);
    const companyMaterials = materials.filter(m => m.companyId === company?.id);
    const companyOrders = orders.filter(o => o.companyId === company?.id);
    const userTin = getTinByUserId(currentUser.id);
    
    const stats = calculateStats();
    
    return (
      <main className="main-content">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <i className="fas fa-building"></i>
            <h1>Supplier Dashboard</h1>
          </div>
          <p className="dashboard-subtitle">Welcome back, {company?.name}. Manage your products, orders, and analytics.</p>
          {userTin && (
            <div className="tin-display">
              <i className="fas fa-file-contract"></i>
              <span>TIN: {userTin.tinNumber} | Registered: {formatDate(userTin.registeredDate)}</span>
            </div>
          )}
        </div>
        
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Total Products</h3>
              <div className="card-icon"><i className="fas fa-box"></i></div>
            </div>
            <div className="stat-value">{companyMaterials.length}</div>
            <p className="stat-label">Products listed</p>
          </div>
          
          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Total Orders</h3>
              <div className="card-icon"><i className="fas fa-shopping-cart"></i></div>
            </div>
            <div className="stat-value">{stats.totalOrders}</div>
            <p className="stat-label">Orders received</p>
          </div>
          
          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Pending Orders</h3>
              <div className="card-icon"><i className="fas fa-clock"></i></div>
            </div>
            <div className="stat-value">{stats.pendingOrders}</div>
            <p className="stat-label">Require attention</p>
          </div>
          
          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Total Revenue</h3>
              <div className="card-icon"><i className="fas fa-chart-line"></i></div>
            </div>
            <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
            <p className="stat-label">All time sales</p>
          </div>
        </div>
        
        {!userTin && (
          <div className="alert alert-warning">
            <i className="fas fa-exclamation-triangle"></i>
            <strong>Important:</strong> You haven't registered your TIN yet. Ethiopian law requires all businesses to register for TIN.
            <button className="btn btn-primary btn-sm ml-2" onClick={() => navigateTo('tin-registration')}>
              <i className="fas fa-file-contract"></i> Register TIN Now
            </button>
          </div>
        )}
        
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Your Products</h3>
            <button className="btn btn-primary" onClick={() => navigateTo('add-material')}>
              <i className="fas fa-plus"></i> Add New Product
            </button>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Department</th>
                  <th>Specifications</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {companyMaterials.map((material: Material) => (
                  <tr key={material.id}>
                    <td>
                      <strong>{material.name}</strong><br/>
                      <small>{material.brand} | {material.model}</small>
                    </td>
                    <td><span className="badge badge-primary">{material.category}</span></td>
                    <td>
                      <div className="specs-preview">
                        {material.specifications.grade && <span>{material.specifications.grade}</span>}
                        {material.specifications.weight && <span>{material.specifications.weight}</span>}
                        {material.specifications.origin && <span>{material.specifications.origin}</span>}
                      </div>
                    </td>
                    <td>
                      <strong>{formatCurrency(material.price)}</strong><br/>
                      <small>VAT: {material.vatPercentage}%</small>
                    </td>
                    <td>{material.quantity} {material.unit}</td>
                    <td>
                      {material.quantity > 0 
                        ? <span className="badge badge-success">In Stock</span> 
                        : <span className="badge badge-danger">Out of Stock</span>}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn-action btn-edit" onClick={() => setSelectedMaterial(material)}>
                          <i className="fas fa-eye"></i> View
                        </button>
                        <button className="btn-action btn-delete" onClick={() => handleDeleteMaterial(material.id)}>
                          <i className="fas fa-trash"></i> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Orders</h3>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {companyOrders.slice(0, 5).map((order: Order) => {
                  const material = getMaterialById(order.materialId);
                  const customer = getUserById(order.customerId);
                  return (
                    <tr key={order.id}>
                      <td><strong>{order.id}</strong><br/><small>Inv: {order.invoiceNumber}</small></td>
                      <td>{customer ? customer.name : 'Unknown'}</td>
                      <td>{material ? material.name : 'Unknown'}</td>
                      <td>{order.quantity} {material ? material.unit : ''}</td>
                      <td>
                        {formatCurrency(order.totalAmount)}<br/>
                        <small>VAT: {formatCurrency(order.vatAmount)}</small>
                      </td>
                      <td>
                        {order.status === 'delivered' ? <span className="badge badge-success">Delivered</span> :
                         order.status === 'in_transit' ? <span className="badge badge-warning">In Transit</span> :
                         order.status === 'pending' ? <span className="badge badge-primary">Pending</span> :
                         <span className="badge badge-danger">Cancelled</span>}
                      </td>
                      <td>
                        {order.status === 'pending' && (
                          <button className="btn-action btn-success" onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}>
                            Confirm
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    );
  };

  const renderCustomerDashboard = () => {
    if (!currentUser || currentUser.userType !== 'customer') {
      return (
        <main className="main-content">
          <div className="alert alert-danger">Access denied. Customer users only.</div>
        </main>
      );
    }
    
    const userOrders = orders.filter(o => o.customerId === currentUser.id);
    const stats = calculateStats();
    
    return (
      <main className="main-content">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <i className="fas fa-user"></i>
            <h1>Customer Dashboard</h1>
          </div>
          <p className="dashboard-subtitle">Welcome back, {currentUser.name}. Find products, track orders, and more.</p>
        </div>
        
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Total Orders</h3>
              <div className="card-icon"><i className="fas fa-shopping-cart"></i></div>
            </div>
            <div className="stat-value">{stats.totalOrders}</div>
            <p className="stat-label">Orders placed</p>
          </div>
          
          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Pending Orders</h3>
              <div className="card-icon"><i className="fas fa-clock"></i></div>
            </div>
            <div className="stat-value">{stats.pendingOrders}</div>
            <p className="stat-label">Awaiting delivery</p>
          </div>
          
          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Delivered</h3>
              <div className="card-icon"><i className="fas fa-check-circle"></i></div>
            </div>
            <div className="stat-value">{stats.deliveredOrders}</div>
            <p className="stat-label">Completed orders</p>
          </div>
          
          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Total Spent</h3>
              <div className="card-icon"><i className="fas fa-money-bill-wave"></i></div>
            </div>
            <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
            <p className="stat-label">All purchases</p>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Orders</h3>
            <button className="btn btn-primary" onClick={() => navigateTo('search-materials')}>
              <i className="fas fa-search"></i> Find Products
            </button>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Product</th>
                  <th>Supplier</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Invoice</th>
                </tr>
              </thead>
              <tbody>
                {userOrders.slice(0, 5).map((order: Order) => {
                  const material = getMaterialById(order.materialId);
                  const company = getCompanyById(order.companyId);
                  return (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{material ? material.name : 'Unknown'}</td>
                      <td>{company ? company.name : 'Unknown'}<br/><small>TIN: {company?.tinNumber}</small></td>
                      <td>
                        {formatCurrency(order.totalAmount)}<br/>
                        <small>VAT: {formatCurrency(order.vatAmount)}</small>
                      </td>
                      <td>
                        {order.status === 'delivered' ? <span className="badge badge-success">Delivered</span> :
                         order.status === 'in_transit' ? <span className="badge badge-warning">In Transit</span> :
                         order.status === 'pending' ? <span className="badge badge-primary">Pending</span> :
                         <span className="badge badge-danger">Cancelled</span>}
                      </td>
                      <td>{formatDate(order.orderDate)}</td>
                      <td>
                        {order.invoiceNumber && (
                          <button className="btn-action btn-view">
                            <i className="fas fa-file-invoice"></i> View
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recommended Products</h3>
          </div>
          <div className="materials-grid">
            {materials.slice(0, 4).map((material: Material) => {
              const company = getCompanyById(material.companyId);
              return (
                <div className="material-card" key={material.id}>
                  <div className="material-header">
                    <h3 className="material-title">{material.name}</h3>
                    <span className="material-category">{material.category}</span>
                    <div className="material-supplier">
                      <i className="fas fa-building"></i>
                      <span>{company ? company.name : 'Unknown Supplier'}</span>
                      <span className="supplier-tin">{company?.tinNumber}</span>
                    </div>
                  </div>
                  <div className="material-body">
                    <p className="material-description">{material.description.substring(0, 100)}...</p>
                    
                    <div className="material-specs-preview">
                      {material.brand && <span><i className="fas fa-tag"></i> {material.brand}</span>}
                      {material.specifications.grade && <span><i className="fas fa-certificate"></i> {material.specifications.grade}</span>}
                      {material.specifications.origin && <span><i className="fas fa-globe"></i> {material.specifications.origin}</span>}
                    </div>
                    
                    <div className="material-price">
                      {formatCurrency(material.price)} / {material.unit}
                      <div className="vat-info">VAT {material.vatPercentage}% included</div>
                    </div>
                    
                    <div className="material-stats">
                      <div className="stat-item">
                        <div className="value">{material.quantity}</div>
                        <div className="label">In Stock</div>
                      </div>
                      <div className="stat-item">
                        <div className="value">{material.minOrder}+</div>
                        <div className="label">Min Order</div>
                      </div>
                      <div className="stat-item">
                        <div className="value">{material.rating || '4.5'}/5</div>
                        <div className="label">Rating</div>
                      </div>
                    </div>
                    
                    <div className="material-actions">
                      <button 
                        className="btn btn-primary" 
                        onClick={() => setSelectedMaterial(material)}
                      >
                        <i className="fas fa-eye"></i> View Details
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => {
                          setFormData(prev => ({ 
                            ...prev, 
                            orderQuantity: material.minOrder.toString(),
                            orderAddress: currentUser.address
                          }));
                          handlePlaceOrder(material.id);
                        }}
                      >
                        <i className="fas fa-shopping-cart"></i> Quick Order
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    );
  };

  const renderAddMaterial = () => (
    <main className="main-content">
      <div className="form-container">
        <h2 className="form-title">Add New Product with Specifications</h2>
        <form onSubmit={handleAddMaterial}>
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input 
              type="text" 
              className="form-input" 
              name="materialName"
              value={formData.materialName}
              onChange={handleInputChange}
              required 
              placeholder="e.g., Portland Cement 42.5 Grade, Medical Gloves Nitrile"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Department/Category *</label>
              <select 
                className="form-select" 
                name="materialCategory"
                value={formData.materialCategory}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Department</option>
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Unit of Measurement *</label>
              <div className="unit-selection">
                <input 
                  type="text" 
                  className="form-input" 
                  name="materialUnit"
                  value={formData.materialUnit}
                  onChange={handleInputChange}
                  required 
                  placeholder="e.g., KG, Liter, Meter"
                  list="unitList"
                />
                <datalist id="unitList">
                  {MEASUREMENT_UNITS.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </datalist>
                <div className="unit-hint">
                  <i className="fas fa-info-circle"></i>
                  <small>Type or select from common units</small>
                </div>
              </div>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Brand</label>
              <input 
                type="text" 
                className="form-input" 
                name="materialBrand"
                value={formData.materialBrand}
                onChange={handleInputChange}
                placeholder="e.g., Dangote, Dell, MediSafe"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Model</label>
              <input 
                type="text" 
                className="form-input" 
                name="materialModel"
                value={formData.materialModel}
                onChange={handleInputChange}
                placeholder="e.g., PC-42.5, Optiplex 3090, NG-100"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Price per Unit (ETB) *</label>
              <input 
                type="number" 
                className="form-input" 
                name="materialPrice"
                value={formData.materialPrice}
                onChange={handleInputChange}
                required 
                min="0" 
                step="0.01" 
                placeholder="e.g., 850.00"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Available Quantity *</label>
              <input 
                type="number" 
                className="form-input" 
                name="materialQuantity"
                value={formData.materialQuantity}
                onChange={handleInputChange}
                required 
                min="0" 
                placeholder="e.g., 500"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Minimum Order Quantity *</label>
              <input 
                type="number" 
                className="form-input" 
                name="materialMinOrder"
                value={formData.materialMinOrder}
                onChange={handleInputChange}
                required 
                min="1" 
                placeholder="e.g., 10"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Grade/Quality</label>
              <input 
                type="text" 
                className="form-input" 
                name="materialGrade"
                value={formData.materialGrade}
                onChange={handleInputChange}
                placeholder="e.g., 42.5 Grade, Medical Grade, 46% N"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Weight</label>
              <input 
                type="text" 
                className="form-input" 
                name="materialWeight"
                value={formData.materialWeight}
                onChange={handleInputChange}
                placeholder="e.g., 50kg, 200g per box"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Dimensions</label>
              <input 
                type="text" 
                className="form-input" 
                name="materialDimensions"
                value={formData.materialDimensions}
                onChange={handleInputChange}
                placeholder="e.g., 292x92x294mm, N/A"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Country of Origin</label>
              <input 
                type="text" 
                className="form-input" 
                name="materialOrigin"
                value={formData.materialOrigin}
                onChange={handleInputChange}
                placeholder="e.g., Ethiopia, China"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Certifications</label>
              <input 
                type="text" 
                className="form-input" 
                name="materialCertifications"
                value={formData.materialCertifications}
                onChange={handleInputChange}
                placeholder="e.g., ES Standard, ISO 9001, FDA Approved"
              />
              <small className="form-hint">Separate multiple certifications with commas</small>
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea 
              className="form-textarea" 
              name="materialDescription"
              value={formData.materialDescription}
              onChange={handleInputChange}
              required 
              placeholder="Describe the product, specifications, quality, intended use, etc."
              rows={4}
            ></textarea>
          </div>
          
          <div className="form-group">
            <label className="form-label">
              <input type="checkbox" defaultChecked /> Include 15% VAT in price
            </label>
            <p className="form-hint">
              According to Ethiopian tax regulations, VAT must be clearly stated for all commercial transactions.
            </p>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn-submit">
              <i className="fas fa-save"></i> Add Product with Specifications
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigateTo('company-dashboard')}>
              <i className="fas fa-times"></i> Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );

  const renderSearchMaterials = () => {
    const hasSearchResults = searchResults.length > 0;
    const displayMaterials = hasSearchResults ? searchResults : materials;
    
    return (
      <main className="main-content">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <i className="fas fa-search"></i>
            <h1>Advanced Product Search</h1>
          </div>
          <p className="dashboard-subtitle">Search, filter, and sort products across all departments with detailed specifications</p>
        </div>
        
        <div className="search-container">
          <form onSubmit={handleSearch}>
            <div className="search-form enhanced">
              <div className="form-group">
                <label className="form-label">Search Products</label>
                <input 
                  type="text" 
                  className="form-input" 
                  name="searchQuery"
                  value={formData.searchQuery}
                  onChange={handleInputChange}
                  placeholder="Product name, brand, model, description..."
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Supplier</label>
                <input 
                  type="text" 
                  className="form-input" 
                  name="searchSupplier"
                  value={formData.searchSupplier}
                  onChange={handleInputChange}
                  placeholder="Supplier name"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Department</label>
                <select 
                  className="form-select" 
                  name="searchCategory"
                  value={formData.searchCategory}
                  onChange={handleInputChange}
                >
                  <option value="all">All Departments</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Max Price (ETB)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  name="searchMaxPrice"
                  value={formData.searchMaxPrice}
                  onChange={handleInputChange}
                  placeholder="No limit"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Sort By</label>
                <select 
                  className="form-select" 
                  name="searchSortBy"
                  value={formData.searchSortBy}
                  onChange={handleInputChange}
                >
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="distance_asc">Distance: Nearest</option>
                  <option value="distance_desc">Distance: Farthest</option>
                  <option value="rating_desc">Highest Rated</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">&nbsp;</label>
                <button type="submit" className="btn-submit">
                  <i className="fas fa-search"></i> Search
                </button>
              </div>
            </div>
          </form>
          
          <div className="sort-options">
            <span className="sort-label">Quick Sort:</span>
            <button 
              className={`sort-btn ${formData.searchSortBy === 'price_asc' ? 'active' : ''}`}
              onClick={() => handleSort('price_asc')}
            >
              <i className="fas fa-sort-amount-down"></i> Price (Low to High)
            </button>
            <button 
              className={`sort-btn ${formData.searchSortBy === 'price_desc' ? 'active' : ''}`}
              onClick={() => handleSort('price_desc')}
            >
              <i className="fas fa-sort-amount-up"></i> Price (High to Low)
            </button>
            <button 
              className={`sort-btn ${formData.searchSortBy === 'distance_asc' ? 'active' : ''}`}
              onClick={() => handleSort('distance_asc')}
            >
              <i className="fas fa-map-marker-alt"></i> Nearest
            </button>
            <button 
              className={`sort-btn ${formData.searchSortBy === 'rating_desc' ? 'active' : ''}`}
              onClick={() => handleSort('rating_desc')}
            >
              <i className="fas fa-star"></i> Top Rated
            </button>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              {hasSearchResults ? `Search Results (${displayMaterials.length} found)` : 'Available Products'}
              <span className="sort-indicator">
                Sorted by: {formData.searchSortBy.replace('_', ' ').toUpperCase()}
              </span>
            </h3>
            <div className="result-stats">
              <span className="stat-item">
                <i className="fas fa-filter"></i> {displayMaterials.length} Products
              </span>
              {hasSearchResults && (
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setSearchResults([]);
                    setFormData(prev => ({ ...prev, searchQuery: '', searchSupplier: '', searchMaxPrice: '' }));
                  }}
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
          
          <div className="materials-grid enhanced">
            {displayMaterials.map(item => {
              const company = item.company || getCompanyById(item.companyId);
              const estimatedTransport = item.estimatedTransport || 
                (company && currentUser ? calculateTransportCost(
                  company.lat, company.lng,
                  currentUser.lat || 9.0320, currentUser.lng || 38.7469,
                  item.minOrder
                ) : 0);
              
              const distance = item.distance || 
                (company && currentUser ? calculateDistance(
                  company.lat, company.lng,
                  currentUser.lat || 9.0320, currentUser.lng || 38.7469
                ) : 0);
              
              return (
                <div className="material-card enhanced" key={item.id}>
                  <div className="material-header">
                    <div className="material-title-section">
                      <h3 className="material-title">{item.name}</h3>
                      <div className="material-meta">
                        <span className="material-category">{item.category}</span>
                        {item.brand && <span className="material-brand">{item.brand}</span>}
                      </div>
                    </div>
                    <div className="material-supplier">
                      <i className="fas fa-building"></i>
                      <div className="supplier-info">
                        <span className="supplier-name">{company ? company.name : 'Unknown Supplier'}</span>
                        <span className="supplier-location">
                          <i className="fas fa-map-marker-alt"></i> {company?.location}
                          {distance > 0 && ` (${distance.toFixed(1)} km)`}
                        </span>
                        {company?.tinNumber && (
                          <span className="supplier-tin">
                            <i className="fas fa-file-contract"></i> TIN: {company.tinNumber}
                          </span>
                        )}
                      </div>
                      <span className="supplier-rating">
                        <i className="fas fa-star"></i> {company ? company.rating : 'N/A'}/5
                      </span>
                    </div>
                  </div>
                  
                  <div className="material-body">
                    <p className="material-description">{item.description}</p>
                    
                    <div className="material-specs">
                      {item.brand && (
                        <div className="spec-item">
                          <i className="fas fa-tag"></i>
                          <span>Brand: {item.brand}</span>
                        </div>
                      )}
                      {item.model && (
                        <div className="spec-item">
                          <i className="fas fa-cube"></i>
                          <span>Model: {item.model}</span>
                        </div>
                      )}
                      {item.specifications.grade && (
                        <div className="spec-item">
                          <i className="fas fa-certificate"></i>
                          <span>Grade: {item.specifications.grade}</span>
                        </div>
                      )}
                      {item.specifications.weight && (
                        <div className="spec-item">
                          <i className="fas fa-weight"></i>
                          <span>Weight: {item.specifications.weight}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="material-price-section">
                      <div className="main-price">
                        <div className="price-amount">{formatCurrency(item.price)}</div>
                        <div className="price-unit">per {item.unit}</div>
                      </div>
                      <div className="price-details">
                        <div className="detail-item">
                          <span className="label">Min Order:</span>
                          <span className="value">{item.minOrder} {item.unit}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Available:</span>
                          <span className="value">{item.quantity} {item.unit}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Est. Transport:</span>
                          <span className="value">{formatCurrency(estimatedTransport)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">VAT:</span>
                          <span className="value">{item.vatPercentage}% included</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="material-actions">
                      <button 
                        className="btn btn-primary" 
                        onClick={() => setSelectedMaterial(item)}
                      >
                        <i className="fas fa-eye"></i> View Full Specifications
                      </button>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => {
                          setFormData(prev => ({ 
                            ...prev, 
                            orderQuantity: item.minOrder.toString(),
                            orderAddress: currentUser?.address || ''
                          }));
                          handlePlaceOrder(item.id);
                        }}
                      >
                        <i className="fas fa-shopping-cart"></i> Order Now
                      </button>
                      <button 
                        className="btn btn-outline"
                        onClick={() => handleContactSupplier(item.id)}
                      >
                        <i className="fas fa-phone-alt"></i> Contact Supplier
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    );
  };

  const renderOrders = () => {
    const isCompany = currentUser?.userType === 'company';
    const userOrders = isCompany 
      ? orders.filter(o => {
          const company = getCompanyByUserId(currentUser.id);
          return company && o.companyId === company.id;
        })
      : orders.filter(o => o.customerId === currentUser?.id);
    
    const totalValue = userOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalTax = userOrders.reduce((sum, order) => sum + order.vatAmount, 0);
    
    return (
      <main className="main-content">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <i className="fas fa-shopping-cart"></i>
            <h1>{isCompany ? 'Order Management' : 'My Orders'}</h1>
          </div>
          <p className="dashboard-subtitle">
            {isCompany ? 'Manage customer orders and generate invoices' : 'Track your orders and view invoices'}
          </p>
          
          <div className="order-summary">
            <div className="summary-item">
              <span className="label">Total Orders:</span>
              <span className="value">{userOrders.length}</span>
            </div>
            <div className="summary-item">
              <span className="label">Total Value:</span>
              <span className="value">{formatCurrency(totalValue)}</span>
            </div>
            <div className="summary-item">
              <span className="label">Total VAT:</span>
              <span className="value">{formatCurrency(totalTax)}</span>
            </div>
          </div>
        </div>
        
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>{isCompany ? 'Customer' : 'Supplier'}</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Amount</th>
                <th>Tax Details</th>
                <th>Status</th>
                <th>Date</th>
                {isCompany ? <th>Actions</th> : <th>Invoice</th>}
              </tr>
            </thead>
            <tbody>
              {userOrders.map((order: Order) => {
                const material = getMaterialById(order.materialId);
                const company = getCompanyById(order.companyId);
                const customer = getUserById(order.customerId);
                
                return (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.id}</strong><br/>
                      <small className="invoice-number">{order.invoiceNumber}</small>
                    </td>
                    <td>
                      {isCompany 
                        ? (customer ? customer.name : 'Unknown') 
                        : (company ? `${company.name}` : 'Unknown')}
                      <br/>
                      <small>{isCompany ? customer?.phone : company?.tinNumber}</small>
                    </td>
                    <td>
                      {material ? material.name : 'Unknown'}<br/>
                      <small>{material?.brand} | {material?.model}</small>
                    </td>
                    <td>{order.quantity} {material ? material.unit : ''}</td>
                    <td>
                      <div className="amount-details">
                        <div className="total">{formatCurrency(order.totalAmount)}</div>
                        <div className="breakdown">
                          <small>Product: {formatCurrency(order.unitPrice * order.quantity)}</small><br/>
                          <small>Transport: {formatCurrency(order.transportCost)}</small><br/>
                          <small>VAT: {formatCurrency(order.vatAmount)}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="tax-info">
                        <span className="tax-badge">VAT: {formatCurrency(order.vatAmount)}</span><br/>
                        <small>Rate: 15%</small>
                      </div>
                    </td>
                    <td>
                      <div className="status-cell">
                        {order.status === 'delivered' ? (
                          <>
                            <span className="badge badge-success">Delivered</span>
                            <small>{order.deliveryDate && formatDate(order.deliveryDate)}</small>
                          </>
                        ) : order.status === 'in_transit' ? (
                          <>
                            <span className="badge badge-warning">In Transit</span>
                            <small>Est. delivery soon</small>
                          </>
                        ) : order.status === 'pending' ? (
                          <>
                            <span className="badge badge-primary">Pending</span>
                            <small>Awaiting confirmation</small>
                          </>
                        ) : (
                          <>
                            <span className="badge badge-danger">Cancelled</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td>{formatDate(order.orderDate)}</td>
                    <td>
                      {isCompany ? (
                        <div className="table-actions">
                          {order.status === 'pending' && (
                            <>
                              <button className="btn-action btn-success" onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}>
                                <i className="fas fa-check"></i> Confirm
                              </button>
                              <button className="btn-action btn-danger" onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}>
                                <i className="fas fa-times"></i> Cancel
                              </button>
                            </>
                          )}
                          {order.status === 'confirmed' && (
                            <button className="btn-action btn-warning" onClick={() => handleUpdateOrderStatus(order.id, 'in_transit')}>
                              <i className="fas fa-truck"></i> Ship
                            </button>
                          )}
                          {order.status === 'in_transit' && (
                            <button className="btn-action btn-success" onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}>
                              <i className="fas fa-check-circle"></i> Deliver
                            </button>
                          )}
                        </div>
                      ) : (
                        <button className="btn-action btn-view">
                          <i className="fas fa-file-invoice"></i> Invoice
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {userOrders.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Order Summary</h3>
            </div>
            <div className="order-total-summary">
              <div className="total-item">
                <span>Subtotal (Products):</span>
                <span>{formatCurrency(userOrders.reduce((sum, o) => sum + (o.unitPrice * o.quantity), 0))}</span>
              </div>
              <div className="total-item">
                <span>Transport Total:</span>
                <span>{formatCurrency(userOrders.reduce((sum, o) => sum + o.transportCost, 0))}</span>
              </div>
              <div className="total-item">
                <span>VAT Total (15%):</span>
                <span>{formatCurrency(totalTax)}</span>
              </div>
              <div className="total-item grand-total">
                <span>Grand Total:</span>
                <span>{formatCurrency(totalValue)}</span>
              </div>
            </div>
          </div>
        )}
      </main>
    );
  };

  const renderAnalytics = () => {
    const company = currentUser ? getCompanyByUserId(currentUser.id) : null;
    const companyMaterials = company ? materials.filter(m => m.companyId === company.id) : [];
    const companyOrders = company ? orders.filter(o => o.companyId === company.id) : [];
    
    const monthlyRevenue = companyOrders.reduce((acc, order) => {
      const month = new Date(order.orderDate).getMonth();
      acc[month] = (acc[month] || 0) + order.totalAmount;
      return acc;
    }, {} as Record<number, number>);
    
    return (
      <main className="main-content">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <i className="fas fa-chart-line"></i>
            <h1>Analytics Dashboard</h1>
          </div>
          <p className="dashboard-subtitle">AI-powered insights and market trends for Ethiopian businesses</p>
        </div>
        
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Price Trends</h3>
              <div className="card-icon"><i className="fas fa-chart-bar"></i></div>
            </div>
            <div className="stat-value">+5.2%</div>
            <p className="stat-label">Overall price increase this month</p>
          </div>
          
          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Monthly Revenue</h3>
              <div className="card-icon"><i className="fas fa-money-bill-wave"></i></div>
            </div>
            <div className="stat-value">{formatCurrency(Object.values(monthlyRevenue).reduce((a, b) => a + b, 0))}</div>
            <p className="stat-label">This month</p>
          </div>
          
          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Top Department</h3>
              <div className="card-icon"><i className="fas fa-star"></i></div>
            </div>
            <div className="stat-value">Construction</div>
            <p className="stat-label">Most active department</p>
          </div>
          
          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Revenue Forecast</h3>
              <div className="card-icon"><i className="fas fa-chart-line"></i></div>
            </div>
            <div className="stat-value">+12.5%</div>
            <p className="stat-label">Next quarter growth</p>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">AI Price Forecast</h3>
            <div className="badge badge-primary">Next 30 Days</div>
          </div>
          <div className="p-2">
            <div className="forecast-chart-placeholder">
              <i className="fas fa-chart-line"></i>
              <p>Price forecasting chart would be displayed here</p>
            </div>
            <div className="forecast-details">
              <div className="forecast-item positive">
                <i className="fas fa-arrow-up"></i>
                <div>
                  <strong>Construction Materials:</strong> Expected increase of 5-8%
                </div>
              </div>
              <div className="forecast-item stable">
                <i className="fas fa-minus"></i>
                <div>
                  <strong>Agricultural Supplies:</strong> Prices stabilizing
                </div>
              </div>
              <div className="forecast-item positive">
                <i className="fas fa-arrow-up"></i>
                <div>
                  <strong>Medical Supplies:</strong> Steady 3-5% growth expected
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Top Performing Products</h3>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Department</th>
                  <th>Avg Price</th>
                  <th>Demand Trend</th>
                  <th>Profit Margin</th>
                  <th>AI Recommendation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Portland Cement</td>
                  <td><span className="badge badge-primary">Construction</span></td>
                  <td>{formatCurrency(850)}</td>
                  <td><span className="badge badge-success">↑ 12%</span></td>
                  <td>25%</td>
                  <td><span className="badge badge-success">Increase Stock</span></td>
                </tr>
                <tr>
                  <td>Medical Gloves</td>
                  <td><span className="badge badge-primary">Healthcare</span></td>
                  <td>{formatCurrency(120)}</td>
                  <td><span className="badge badge-success">↑ 15%</span></td>
                  <td>30%</td>
                  <td><span className="badge badge-success">Increase Stock</span></td>
                </tr>
                <tr>
                  <td>Urea Fertilizer</td>
                  <td><span className="badge badge-primary">Agriculture</span></td>
                  <td>{formatCurrency(950)}</td>
                  <td><span className="badge badge-warning">→ Stable</span></td>
                  <td>18%</td>
                  <td><span className="badge badge-warning">Maintain Level</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {company && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Your Business Performance</h3>
            </div>
            <div className="performance-metrics">
              <div className="metric">
                <div className="metric-value">{companyMaterials.length}</div>
                <div className="metric-label">Products Listed</div>
              </div>
              <div className="metric">
                <div className="metric-value">{companyOrders.length}</div>
                <div className="metric-label">Total Orders</div>
              </div>
              <div className="metric">
                <div className="metric-value">{company.rating}/5</div>
                <div className="metric-label">Customer Rating</div>
              </div>
              <div className="metric">
                <div className="metric-value">{formatCurrency(companyOrders.reduce((sum, o) => sum + o.totalAmount, 0))}</div>
                <div className="metric-label">Total Revenue</div>
              </div>
            </div>
          </div>
        )}
      </main>
    );
  };

  const renderSupplierMap = () => {
    const userLocation = currentUser ? { lat: currentUser.lat || 9.0320, lng: currentUser.lng || 38.7469 } : null;
    
    return (
      <main className="main-content">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <i className="fas fa-map-marked-alt"></i>
            <h1>Supplier Map</h1>
          </div>
          <p className="dashboard-subtitle">Interactive map showing suppliers across all Ethiopian regions with transport cost calculations</p>
        </div>
        
        <div className="map-container">
          <div className="map-placeholder">
            <i className="fas fa-map-marked-alt"></i>
            <h3>GIS Supplier Map</h3>
            <p>Supplier locations across Ethiopian regions would be displayed here with interactive markers</p>
            <p>Transport costs calculated based on distance from your location</p>
            {userLocation && (
              <div className="user-location-info">
                <i className="fas fa-map-pin"></i>
                Your Location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </div>
            )}
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Suppliers by Region</h3>
            <div className="badge badge-primary">{companies.length} Verified Suppliers</div>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Region</th>
                  <th>TIN Number</th>
                  <th>Products</th>
                  <th>Rating</th>
                  <th>Est. Transport Cost*</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company: Company) => {
                  const companyMaterials = materials.filter(m => m.companyId === company.id);
                  const distance = userLocation ? calculateDistance(
                    company.lat, company.lng,
                    userLocation.lat, userLocation.lng
                  ) : 0;
                  
                  const estTransport = userLocation ? calculateTransportCost(
                    company.lat, company.lng,
                    userLocation.lat, userLocation.lng,
                    100
                  ) : 0;
                  
                  return (
                    <tr key={company.id}>
                      <td>
                        <strong>{company.name}</strong><br/>
                        <small>{company.complianceStatus === 'compliant' ? 
                          <span className="badge badge-success">Compliant</span> : 
                          <span className="badge badge-warning">Pending</span>}
                        </small>
                      </td>
                      <td>{company.location}</td>
                      <td>
                        {company.location.includes('Addis') ? 'Addis Ababa' :
                         company.location.includes('Bole') ? 'Addis Ababa' :
                         company.location.includes('Merkato') ? 'Addis Ababa' :
                         company.location.includes('Kaliti') ? 'Addis Ababa' : 'Oromia'}
                      </td>
                      <td>{company.tinNumber || 'Not Registered'}</td>
                      <td>{companyMaterials.length} items</td>
                      <td>
                        <div className="rating-display">
                          <i className="fas fa-star"></i> {company.rating || '4.5'}/5
                        </div>
                      </div>
                      <td>
                        {formatCurrency(estTransport)}
                        {distance > 0 && <br/>}
                        {distance > 0 && <small>{distance.toFixed(1)} km away</small>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-2">
            <p><small>*Estimated transport cost for 100 units from your location</small></p>
          </div>
        </div>
      </main>
    );
  };

  const renderPriceForecast = () => (
    <main className="main-content">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <i className="fas fa-chart-bar"></i>
          <h1>AI Price Forecasting</h1>
        </div>
        <p className="dashboard-subtitle">Machine learning predictions for product prices across Ethiopian markets</p>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">30-Day Price Forecast</h3>
          <div className="badge badge-primary">Powered by AI</div>
        </div>
        <div className="p-2">
          <div className="forecast-chart-placeholder">
            <i className="fas fa-chart-line"></i>
            <p>Price forecasting chart would be displayed here</p>
          </div>
        </div>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Construction Forecast</h3>
            <div className="card-icon"><i className="fas fa-industry"></i></div>
          </div>
          <div className="stat-value">+5.2%</div>
          <p className="stat-label">Expected price increase</p>
          <div className="mt-2">
            <p><small><strong>Factors:</strong> Rising demand, fuel costs, seasonal factors</small></p>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Agriculture Forecast</h3>
            <div className="card-icon"><i className="fas fa-seedling"></i></div>
          </div>
          <div className="stat-value">+3.5%</div>
          <p className="stat-label">Expected price increase</p>
          <div className="mt-2">
            <p><small><strong>Factors:</strong> Planting season, fertilizer costs, weather patterns</small></p>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Transport Cost</h3>
            <div className="card-icon"><i className="fas fa-truck"></i></div>
          </div>
          <div className="stat-value">+3.5%</div>
          <p className="stat-label">Expected increase</p>
          <div className="mt-2">
            <p><small><strong>Factors:</strong> Fuel prices, road conditions, seasonal traffic</small></p>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">AI Recommendations</h3>
        </div>
        <div className="p-2">
          <div className="alert alert-info">
            <i className="fas fa-robot"></i>
            <strong>AI Suggestion:</strong> Based on current trends, we recommend purchasing construction materials and medical supplies now before expected price increases in the coming month.
          </div>
          <div className="alert alert-success">
            <i className="fas fa-lightbulb"></i>
            <strong>Cost Optimization:</strong> Consider ordering from suppliers in Addis Ababa for central Ethiopia deliveries to minimize transport costs.
          </div>
          <div className="alert alert-warning">
            <i className="fas fa-exclamation-triangle"></i>
            <strong>Market Alert:</strong> Agricultural product prices may fluctuate during rainy season (June-September). Plan procurement accordingly.
          </div>
          <div className="alert alert-primary">
            <i className="fas fa-file-contract"></i>
            <strong>Tax Compliance:</strong> Ensure all transactions include proper VAT documentation as per Ethiopian Revenue and Customs Authority guidelines.
          </div>
        </div>
      </div>
    </main>
  );

  const renderTinRegistration = () => {
    const userTin = getTinByUserId(currentUser?.id || '');
    
    if (userTin) {
      return (
        <main className="main-content">
          <div className="form-container">
            <div className="tin-status-card">
              <div className="tin-status-header">
                <i className="fas fa-file-contract success"></i>
                <h2>TIN Already Registered</h2>
              </div>
              <div className="tin-details">
                <div className="tin-detail-item">
                  <label>TIN Number:</label>
                  <span className="tin-value">{userTin.tinNumber}</span>
                </div>
                <div className="tin-detail-item">
                  <label>Registration Date:</label>
                  <span className="tin-value">{formatDate(userTin.registeredDate)}</span>
                </div>
                <div className="tin-detail-item">
                  <label>Business Type:</label>
                  <span className="tin-value">{userTin.businessType}</span>
                </div>
                <div className="tin-detail-item">
                  <label>Status:</label>
                  <span className="badge badge-success">Active & Compliant</span>
                </div>
              </div>
              <div className="compliance-note">
                <i className="fas fa-check-circle"></i>
                Your business is compliant with Ethiopian Revenue and Customs Authority regulations.
              </div>
              <div className="tin-actions">
                <button className="btn btn-secondary" onClick={() => navigateTo('company-dashboard')}>
                  <i className="fas fa-arrow-left"></i> Back to Dashboard
                </button>
                <button className="btn btn-primary" onClick={() => window.print()}>
                  <i className="fas fa-print"></i> Print Certificate
                </button>
              </div>
            </div>
          </div>
        </main>
      );
    }
    
    if (!currentUser || currentUser.userType !== 'company') {
      return (
        <main className="main-content">
          <div className="alert alert-danger">
            <i className="fas fa-exclamation-circle"></i>
            TIN registration is only available for registered companies/suppliers.
          </div>
        </main>
      );
    }
    
    return (
      <main className="main-content">
        <div className="form-container">
          <h2 className="form-title">Register Taxpayer Identification Number (TIN)</h2>
          <p className="form-subtitle">Register your business TIN for Ethiopian tax purposes as required by law</p>
          
          <form onSubmit={handleTinRegistration}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">TIN Number *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  name="tinNumber"
                  value={tinData.tinNumber}
                  onChange={handleTinInputChange}
                  required 
                  placeholder="ET0001234567"
                  pattern="ET\d{10}"
                  title="TIN must start with ET followed by 10 digits"
                />
                <small className="form-hint">Format: ET followed by 10 digits (e.g., ET0001234567)</small>
              </div>
              
              <div className="form-group">
                <label className="form-label">Business Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  name="businessName"
                  value={tinData.businessName}
                  onChange={handleTinInputChange}
                  required 
                  placeholder="Your registered business name"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Business Type *</label>
                <select 
                  className="form-select" 
                  name="businessType"
                  value={tinData.businessType}
                  onChange={handleTinInputChange}
                  required
                >
                  <option value="">Select Business Type</option>
                  <option value="Sole Proprietorship">Sole Proprietorship</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Private Limited Company">Private Limited Company</option>
                  <option value="Share Company">Share Company</option>
                  <option value="Government Enterprise">Government Enterprise</option>
                  <option value="NGO">NGO</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">VAT Number</label>
                <input 
                  type="text" 
                  className="form-input" 
                  name="vatNumber"
                  value={tinData.vatNumber}
                  onChange={handleTinInputChange}
                  placeholder="VAT00123456 (if applicable)"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Region *</label>
                <select 
                  className="form-select" 
                  name="region"
                  value={tinData.region}
                  onChange={handleTinInputChange}
                  required
                >
                  <option value="">Select Region</option>
                  {ETHIOPIAN_REGIONS.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Trade License Number *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  name="tradeLicense"
                  value={tinData.tradeLicense}
                  onChange={handleTinInputChange}
                  required
                  placeholder="e.g., BL/ET/2023/001"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Woreda</label>
                <input 
                  type="text" 
                  className="form-input" 
                  name="woreda"
                  value={tinData.woreda}
                  onChange={handleTinInputChange}
                  placeholder="Enter woreda name"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Kebele</label>
                <input 
                  type="text" 
                  className="form-input" 
                  name="kebele"
                  value={tinData.kebele}
                  onChange={handleTinInputChange}
                  placeholder="Enter kebele number"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Business Address *</label>
              <input 
                type="text" 
                className="form-input" 
                name="businessAddress"
                value={tinData.businessAddress}
                onChange={handleTinInputChange}
                required 
                placeholder="Full business address"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Registration Date *</label>
                <input 
                  type="date" 
                  className="form-input" 
                  name="registrationDate"
                  value={tinData.registrationDate}
                  onChange={handleTinInputChange}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">License Expiry Date *</label>
                <input 
                  type="date" 
                  className="form-input" 
                  name="licenseExpiry"
                  value={tinData.licenseExpiry}
                  onChange={handleTinInputChange}
                  required 
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <input type="checkbox" required /> I certify that all information provided is accurate
              </label>
              <p className="form-hint">
                By submitting, you agree to comply with Ethiopian tax laws and regulations.
                False information may result in legal action.
              </p>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn-submit">
                <i className="fas fa-file-contract"></i> Register TIN & Become Compliant
              </button>
              <button type="button" className="btn-secondary" onClick={() => navigateTo('company-dashboard')}>
                <i className="fas fa-times"></i> Cancel
              </button>
            </div>
          </form>
          
          <div className="tin-info-box">
            <h4><i className="fas fa-info-circle"></i> About Ethiopian TIN Registration</h4>
            <p>The Taxpayer Identification Number (TIN) is mandatory for all businesses in Ethiopia under Proclamation No. 983/2016.</p>
            <ul>
              <li><strong>Legal Requirement:</strong> All businesses must register for TIN with the Ethiopian Revenue and Customs Authority (ERCA)</li>
              <li><strong>Tax Compliance:</strong> Required for tax filing, customs clearance, and business transactions</li>
              <li><strong>Validity:</strong> TIN is valid for the lifetime of the business</li>
              <li><strong>Annual Renewal:</strong> Must be renewed annually for tax purposes</li>
              <li><strong>VAT Registration:</strong> Businesses with annual turnover above 1,000,000 ETB must register for VAT</li>
              <li><strong>Penalties:</strong> Failure to register may result in fines and business suspension</li>
            </ul>
            <div className="legal-note">
              <i className="fas fa-balance-scale"></i>
              <strong>Legal Note:</strong> This platform complies with Ethiopian commercial code and tax regulations.
              All transactions are recorded for tax audit purposes.
            </div>
          </div>
        </div>
      </main>
    );
  };

  const renderFooter = () => (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>EthioSupply AI</h3>
          <p>AI-driven platform optimizing supply chains across all departments in Ethiopia. Master's Program Project.</p>
          <p><i className="fas fa-map-marker-alt"></i> Serving All Regions of Ethiopia</p>
          <p><i className="fas fa-balance-scale"></i> Compliant with Ethiopian Trade Regulations</p>
        </div>
        
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li><a href="#" onClick={(e) => { e.preventDefault(); navigateTo('home'); }}><i className="fas fa-chevron-right"></i> Home</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); navigateTo('search-materials'); }}><i className="fas fa-chevron-right"></i> Find Products</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); navigateTo('supplier-map'); }}><i className="fas fa-chevron-right"></i> Supplier Map</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); navigateTo('price-forecast'); }}><i className="fas fa-chevron-right"></i> Price Forecast</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Departments</h3>
          <div className="footer-departments">
            {DEPARTMENTS.slice(0, 6).map((dept, index) => (
              <span key={index} className="footer-dept-badge">{dept}</span>
            ))}
          </div>
        </div>
        
        <div className="footer-section">
          <h3>Contact & Compliance</h3>
          <ul className="footer-links">
            <li><a href="#"><i className="fas fa-envelope"></i> meharinageb@gmail.com</a></li>
            <li><a href="#"><i className="fas fa-phone"></i> +251909919154</a></li>
            <li><a href="#"><i className="fas fa-university"></i> Ethiopian Revenue & Customs</a></li>
            <li><a href="#"><i className="fas fa-gavel"></i> Trade Regulations</a></li>
          </ul>
        </div>
      </div>
      
      <div className="copyright">
        <p>© 2024 EthioSupply AI Platform | Master's Program Project | Compliant with Ethiopian Commercial Code & Tax Laws | All data is stored locally in your browser</p>
        <p className="disclaimer">
          <i className="fas fa-exclamation-triangle"></i>
          Disclaimer: This platform follows Ethiopian trade regulations. Users are responsible for proper TIN registration and tax compliance.
        </p>
      </div>
    </footer>
  );

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home': return renderHome();
      case 'login': return renderLogin();
      case 'register': return renderRegister();
      case 'company-dashboard': return renderCompanyDashboard();
      case 'customer-dashboard': return renderCustomerDashboard();
      case 'add-material': return renderAddMaterial();
      case 'search-materials': return renderSearchMaterials();
      case 'orders': return renderOrders();
      case 'analytics': return renderAnalytics();
      case 'supplier-map': return renderSupplierMap();
      case 'price-forecast': return renderPriceForecast();
      case 'tin-registration': return renderTinRegistration();
      default: return renderHome();
    }
  };

  return (
    <div className="app-container">
      {renderHeader()}
      {renderAlert()}
      {renderCurrentPage()}
      {renderMaterialDetails()}
      {renderFooter()}
    </div>
  );
}

export default App;
