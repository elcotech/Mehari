import { useState, useEffect } from 'react';
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
}

interface Alert {
  message: string;
  type: string;
}

interface FormData {
  loginEmail: string;
  loginPassword: string;
  selectedAddress: string;
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
  orderQuantity: string;
  orderAddress: string;
}

function App() {
  // State Management with proper types
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
    return savedUsers ? JSON.parse(savedUsers) : [];
  });
  const [searchResults, setSearchResults] = useState<Array<Material & {company?: Company, totalCost?: number, estimatedTransport?: number}>>([]);
  const [alert, setAlert] = useState<Alert | null>(null);
  const [formData, setFormData] = useState<FormData>({
    loginEmail: '',
    loginPassword: '',
    selectedAddress: '',
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
    orderQuantity: '',
    orderAddress: '',
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
          companyName: 'Mehari Construction Supplies',
          phone: '+251909919154',
          address: 'Bole, Addis Ababa',
          lat: 8.9806,
          lng: 38.7578,
          registered: '2023-01-15'
        },
        {
          id: 'user2',
          name: 'John Customer',
          email: 'customer@example.com',
          password: 'password123',
          userType: 'customer',
          companyName: '',
          phone: '+251 912 345 678',
          address: 'Megenagna, Addis Ababa',
          lat: 9.0227,
          lng: 38.7468,
          registered: '2023-02-20'
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
          name: 'Mehari Construction Supplies',
          description: 'Premium construction materials supplier',
          location: 'Bole, Addis Ababa',
          lat: 8.9806,
          lng: 38.7578,
          rating: 4.8,
          totalOrders: 124,
          established: '2020'
        },
        {
          id: 'comp2',
          userId: 'user3',
          name: 'Ethio Build Materials',
          description: 'Building materials wholesale',
          location: 'Merkato, Addis Ababa',
          lat: 9.0300,
          lng: 38.7500,
          rating: 4.5,
          totalOrders: 89,
          established: '2019'
        },
        {
          id: 'comp3',
          userId: 'user4',
          name: 'Addis Cement & Steel',
          description: 'Specialized in cement and steel products',
          location: 'Kaliti, Addis Ababa',
          lat: 8.8500,
          lng: 38.7200,
          rating: 4.7,
          totalOrders: 156,
          established: '2018'
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
          name: 'Portland Cement',
          category: 'cement',
          description: 'High quality Portland cement for construction',
          price: 850,
          unit: '50kg bag',
          quantity: 500,
          minOrder: 10,
          transportCost: 15,
          rating: 4.5
        },
        {
          id: 'mat2',
          companyId: 'comp1',
          name: 'Steel Rebar',
          category: 'steel',
          description: 'Grade 60 steel reinforcement bars',
          price: 12000,
          unit: 'ton',
          quantity: 45,
          minOrder: 1,
          transportCost: 20,
          rating: 4.7
        },
        {
          id: 'mat3',
          companyId: 'comp2',
          name: 'Clay Bricks',
          category: 'bricks',
          description: 'Standard size clay bricks',
          price: 4.5,
          unit: 'piece',
          quantity: 10000,
          minOrder: 100,
          transportCost: 12,
          rating: 4.3
        },
        {
          id: 'mat4',
          companyId: 'comp3',
          name: 'Crushed Stone',
          category: 'aggregates',
          description: '20mm crushed stone for concrete',
          price: 650,
          unit: 'cubic meter',
          quantity: 120,
          minOrder: 5,
          transportCost: 18,
          rating: 4.6
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
          address: 'Megenagna, Addis Ababa'
        }
      ];
      setOrders(sampleOrders);
      localStorage.setItem('orders', JSON.stringify(sampleOrders));
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

  // Utility Functions with proper types
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

  const calculateTransportCost = (fromLat: number, fromLng: number, toLat: number, toLng: number, quantity: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (toLat - fromLat) * Math.PI / 180;
    const dLng = (toLng - fromLng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(fromLat * Math.PI / 180) * Math.cos(toLat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    const baseRate = 500;
    const ratePerKm = 15;
    const quantityFactor = Math.max(1, quantity / 100);
    
    return Math.round(baseRate + (distance * ratePerKm * quantityFactor));
  };

  const getMaterialById = (id: string): Material | undefined => materials.find(m => m.id === id);
  const getCompanyById = (id: string): Company | undefined => companies.find(c => c.id === id);
  const getUserById = (id: string): User | undefined => users.find(u => u.id === id);
  const getCompanyByUserId = (userId: string): Company | undefined => companies.find(c => c.userId === userId);

  // Authentication
  const handleLogin = (e: React.FormEvent): void => {
    e.preventDefault();
    const { loginEmail, loginPassword, selectedAddress } = formData;
    
    const user = users.find(u => 
      u.email === loginEmail && u.password === loginPassword
    );
    
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      showAlert('Login successful!', 'success');
      setCurrentPage('home');
      setFormData(prev => ({ ...prev, loginEmail: '', loginPassword: '', selectedAddress: '' }));
    } else {
      showAlert('Invalid email or password', 'danger');
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
      registered: new Date().toISOString().split('T')[0]
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
        established: new Date().getFullYear().toString()
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

  // Material Management
  const handleAddMaterial = (e: React.FormEvent): void => {
    e.preventDefault();
    const { 
      materialName, materialCategory, materialPrice, materialQuantity,
      materialUnit, materialMinOrder, materialDescription 
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
      rating: 0
    };
    
    setMaterials(prev => [...prev, newMaterial]);
    showAlert('Material added successfully!', 'success');
    setCurrentPage('company-dashboard');
    setFormData(prev => ({
      ...prev,
      materialName: '',
      materialCategory: '',
      materialPrice: '',
      materialQuantity: '',
      materialUnit: '',
      materialMinOrder: '',
      materialDescription: ''
    }));
  };

  const handleDeleteMaterial = (id: string): void => {
    setMaterials(prev => prev.filter(m => m.id !== id));
    showAlert('Material deleted successfully', 'success');
  };

  // Order Management
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
    
    const totalAmount = (material.price * quantity) + transportCost;
    
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
      notes: ''
    };
    
    setOrders(prev => [...prev, newOrder]);
    showAlert('Order placed successfully!', 'success');
    setCurrentPage('orders');
    setFormData(prev => ({ ...prev, orderQuantity: '', orderAddress: '' }));
  };

  const handleUpdateOrderStatus = (orderId: string, status: string): void => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const updatedOrder = { ...order, status };
        if (status === 'delivered') {
          updatedOrder.deliveryDate = new Date().toISOString().split('T')[0];
        }
        return updatedOrder;
      }
      return order;
    }));
    showAlert(`Order status updated to ${status}`, 'success');
  };

  // Contact Supplier Function
  const handleContactSupplier = (materialId: string): void => {
    const material = getMaterialById(materialId);
    if (!material) return;
    
    const company = getCompanyById(material.companyId);
    if (!company) return;
    
    const user = users.find(u => u.id === company.userId);
    if (!user) return;
    
    showAlert(`Contacting ${company.name}. Phone: ${user.phone}. Email: ${user.email}`, 'info');
    
    // Simulate opening contact dialog
    const contactMessage = `Hello, I'm interested in ${material.name}. Could you provide more details?`;
    console.log('Contact message:', contactMessage);
    console.log('Supplier contact info:', {
      company: company.name,
      phone: user.phone,
      email: user.email,
      address: company.location
    });
  };

  // Search Functionality
  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault();
    const { searchQuery, searchCategory, searchMaxPrice } = formData;
    
    let results = materials.filter(material => {
      let matches = true;
      
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        matches = matches && (
          material.name.toLowerCase().includes(searchLower) ||
          material.description.toLowerCase().includes(searchLower) ||
          material.category.toLowerCase().includes(searchLower)
        );
      }
      
      if (searchCategory && searchCategory !== 'all') {
        matches = matches && material.category === searchCategory;
      }
      
      if (searchMaxPrice) {
        matches = matches && material.price <= parseFloat(searchMaxPrice);
      }
      
      return matches;
    });
    
    results = results.map(material => {
      const company = getCompanyById(material.companyId);
      let estimatedTransport = 0;
      
      if (company && currentUser) {
        estimatedTransport = calculateTransportCost(
          company.lat, company.lng,
          currentUser.lat || 9.0320, currentUser.lng || 38.7469,
          material.minOrder
        );
      }
      
      return {
        ...material,
        company,
        totalCost: material.price + (estimatedTransport / material.minOrder),
        estimatedTransport
      };
    });
    
    results.sort((a, b) => (a.totalCost || 0) - (b.totalCost || 0));
    setSearchResults(results);
  };

  // Navigation
  const navigateTo = (page: string): void => {
    setCurrentPage(page);
  };

  const switchUserType = (type: string): void => {
    setFormData(prev => ({ ...prev, registerUserType: type }));
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Render Header
  const renderHeader = () => (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <div className="logo-icon">
            <i className="fas fa-hard-hat"></i>
          </div>
          <div className="logo-text">
            <h1>Mehari SupplyChain AI</h1>
            <p>AI-Driven Construction Material Platform</p>
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
              <i className="fas fa-box"></i> Add Material
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
        
        <div className="user-info">
          <div className="user-avatar">
            {currentUser?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="user-name">{currentUser?.name}</div>
            <div className="user-type">{currentUser?.userType === 'company' ? 'Supplier' : 'Customer'}</div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </>
    );
  };

  // Render Alert
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

  // Render Pages
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
          <h1>AI-Driven Construction Supply Chain Platform</h1>
          <p>Revolutionizing material procurement in Ethiopia with artificial intelligence</p>
          <p className="hero-subtitle">Optimizing construction material supply chains in Addis Ababa through AI-powered price forecasting, GIS-based supplier mapping, and real-time logistics optimization</p>
          
          {currentUser ? (
            <div className="cta-buttons">
              {currentUser.userType === 'company' ? (
                <button className="btn btn-primary" onClick={() => navigateTo('company-dashboard')}>
                  <i className="fas fa-tachometer-alt"></i> Go to Dashboard
                </button>
              ) : (
                <button className="btn btn-primary" onClick={() => navigateTo('search-materials')}>
                  <i className="fas fa-search"></i> Find Materials
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
            <div className="stat-label">Construction Materials</div>
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
            <p>Predict future material prices using machine learning algorithms based on historical data and market trends</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-map-marked-alt"></i>
            </div>
            <h3>GIS Supplier Mapping</h3>
            <p>Interactive map showing supplier locations with real-time transport cost calculations</p>
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
              <i className="fas fa-chart-line"></i>
            </div>
            <h3>Real-time Analytics</h3>
            <p>Dashboard with key performance indicators and market insights for suppliers</p>
          </div>
        </div>
      </main>
    );
  };

  const renderLogin = () => (
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
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  name="loginEmail"
                  value={formData.loginEmail}
                  onChange={handleInputChange}
                  required 
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  name="loginPassword"
                  value={formData.loginPassword}
                  onChange={handleInputChange}
                  required 
                  placeholder="Enter your password"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Select Address (Optional)</label>
                <select 
                  className="form-select" 
                  name="selectedAddress"
                  value={formData.selectedAddress}
                  onChange={handleInputChange}
                >
                  <option value="">Select from registered addresses</option>
                  {users.map(user => (
                    <option key={user.id} value={user.address}>
                      {user.name} - {user.address}
                    </option>
                  ))}
                </select>
                <small className="form-text">Select a registered user address to auto-fill</small>
              </div>
              
              <button type="submit" className="btn-submit">
                <i className="fas fa-sign-in-alt"></i> Login
              </button>
            </form>
            
            <div className="text-center mt-2">
              <p>Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('register'); }}>Register here</a></p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );

  const renderRegister = () => (
    <main className="main-content">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Create Account</h2>
            <p>Join Mehari Construction Platform</p>
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
                  <label className="form-label">Company Name</label>
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
                  <label className="form-label">Full Name</label>
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
                  <label className="form-label">Email Address</label>
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
                  <label className="form-label">Password</label>
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
                  <label className="form-label">Phone Number</label>
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
                <label className="form-label">Address</label>
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
    
    const stats = {
      totalMaterials: companyMaterials.length,
      totalOrders: companyOrders.length,
      pendingOrders: companyOrders.filter(o => o.status === 'pending').length,
      revenue: companyOrders.reduce((sum: number, o: Order) => sum + o.totalAmount, 0)
    };
    
    return (
      <main className="main-content">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <i className="fas fa-hard-hat"></i>
            <h1>Supplier Dashboard</h1>
          </div>
          <p className="dashboard-subtitle">Welcome back, {company?.name}. Manage your materials, orders, and analytics.</p>
        </div>
        
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Total Materials</h3>
              <div className="card-icon"><i className="fas fa-box"></i></div>
            </div>
            <div className="stat-value">{stats.totalMaterials}</div>
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
            <div className="stat-value">{formatCurrency(stats.revenue)}</div>
            <p className="stat-label">All time sales</p>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Your Materials</h3>
            <button className="btn btn-primary" onClick={() => navigateTo('add-material')}>
              <i className="fas fa-plus"></i> Add New
            </button>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {companyMaterials.map((material: Material) => (
                  <tr key={material.id}>
                    <td>
                      <strong>{material.name}</strong><br/>
                      <small>{material.description.substring(0, 50)}...</small>
                    </td>
                    <td><span className="badge badge-primary">{material.category}</span></td>
                    <td><strong>{formatCurrency(material.price)}</strong> / {material.unit}</td>
                    <td>{material.quantity} {material.unit}</td>
                    <td>
                      {material.quantity > 0 
                        ? <span className="badge badge-success">In Stock</span> 
                        : <span className="badge badge-danger">Out of Stock</span>}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn-action btn-edit" onClick={() => {/* Edit functionality */}}>
                          <i className="fas fa-edit"></i> Edit
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
    
    const stats = {
      totalOrders: userOrders.length,
      pendingOrders: userOrders.filter(o => o.status === 'pending').length,
      deliveredOrders: userOrders.filter(o => o.status === 'delivered').length,
      totalSpent: userOrders.reduce((sum: number, o: Order) => sum + o.totalAmount, 0)
    };
    
    return (
      <main className="main-content">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <i className="fas fa-user"></i>
            <h1>Customer Dashboard</h1>
          </div>
          <p className="dashboard-subtitle">Welcome back, {currentUser.name}. Find materials, track orders, and more.</p>
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
            <div className="stat-value">{formatCurrency(stats.totalSpent)}</div>
            <p className="stat-label">All purchases</p>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Orders</h3>
            <button className="btn btn-primary" onClick={() => navigateTo('search-materials')}>
              <i className="fas fa-search"></i> Find Materials
            </button>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Material</th>
                  <th>Supplier</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
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
                      <td>{company ? company.name : 'Unknown'}</td>
                      <td>{formatCurrency(order.totalAmount)}</td>
                      <td>
                        {order.status === 'delivered' ? <span className="badge badge-success">Delivered</span> :
                         order.status === 'in_transit' ? <span className="badge badge-warning">In Transit</span> :
                         order.status === 'pending' ? <span className="badge badge-primary">Pending</span> :
                         <span className="badge badge-danger">Cancelled</span>}
                      </td>
                      <td>{formatDate(order.orderDate)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recommended Materials</h3>
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
                    </div>
                  </div>
                  <div className="material-body">
                    <p>{material.description}</p>
                    <div className="material-price">{formatCurrency(material.price)} / {material.unit}</div>
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
                    <button className="btn btn-primary w-100 mt-2" onClick={() => {
                      setFormData(prev => ({ 
                        ...prev, 
                        orderQuantity: material.minOrder.toString(),
                        orderAddress: currentUser.address
                      }));
                      setCurrentPage('search-materials');
                    }}>
                      <i className="fas fa-shopping-cart"></i> Order Now
                    </button>
                    <button className="btn btn-secondary w-100 mt-2" onClick={() => handleContactSupplier(material.id)}>
                      <i className="fas fa-phone-alt"></i> Contact Supplier
                    </button>
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
        <h2 className="form-title">Add New Material</h2>
        <form onSubmit={handleAddMaterial}>
          <div className="form-group">
            <label className="form-label">Material Name</label>
            <input 
              type="text" 
              className="form-input" 
              name="materialName"
              value={formData.materialName}
              onChange={handleInputChange}
              required 
              placeholder="e.g., Portland Cement"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                className="form-select" 
                name="materialCategory"
                value={formData.materialCategory}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Category</option>
                <option value="cement">Cement</option>
                <option value="steel">Steel</option>
                <option value="bricks">Bricks</option>
                <option value="aggregates">Aggregates</option>
                <option value="timber">Timber</option>
                <option value="equipment">Equipment</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Unit</label>
              <input 
                type="text" 
                className="form-input" 
                name="materialUnit"
                value={formData.materialUnit}
                onChange={handleInputChange}
                required 
                placeholder="e.g., 50kg bag, ton, piece"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Price per Unit</label>
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
              <label className="form-label">Available Quantity</label>
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
          
          <div className="form-group">
            <label className="form-label">Minimum Order Quantity</label>
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
            <label className="form-label">Description</label>
            <textarea 
              className="form-textarea" 
              name="materialDescription"
              value={formData.materialDescription}
              onChange={handleInputChange}
              required 
              placeholder="Describe the material, specifications, etc."
            ></textarea>
          </div>
          
          <button type="submit" className="btn-submit">
            <i className="fas fa-save"></i> Add Material
          </button>
        </form>
      </div>
    </main>
  );

  const renderSearchMaterials = () => {
    const categories = ['all', 'cement', 'steel', 'bricks', 'aggregates', 'timber', 'equipment', 'other'];
    
    return (
      <main className="main-content">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <i className="fas fa-search"></i>
            <h1>Find Construction Materials</h1>
          </div>
          <p className="dashboard-subtitle">Search for materials, compare prices, and calculate transport costs</p>
        </div>
        
        <div className="search-container">
          <form onSubmit={handleSearch}>
            <div className="search-form">
              <div className="form-group">
                <label className="form-label">Search</label>
                <input 
                  type="text" 
                  className="form-input" 
                  name="searchQuery"
                  value={formData.searchQuery}
                  onChange={handleInputChange}
                  placeholder="What material are you looking for?"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Category</label>
                <select 
                  className="form-select" 
                  name="searchCategory"
                  value={formData.searchCategory}
                  onChange={handleInputChange}
                >
                  <option value="all">All Categories</option>
                  {categories.filter(c => c !== 'all').map(cat => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
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
                <label className="form-label">&nbsp;</label>
                <button type="submit" className="btn-submit">
                  <i className="fas fa-search"></i> Search
                </button>
              </div>
            </div>
          </form>
        </div>
        
        {searchResults.length > 0 ? (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Search Results ({searchResults.length} found)</h3>
              <div>
                <span className="badge badge-primary">Sorted by: Total Cost (Material + Transport)</span>
              </div>
            </div>
            <div className="materials-grid">
              {searchResults.map(item => {
                const company = item.company;
                return (
                  <div className="material-card" key={item.id}>
                    <div className="material-header">
                      <h3 className="material-title">{item.name}</h3>
                      <span className="material-category">{item.category}</span>
                      <div className="material-supplier">
                        <i className="fas fa-building"></i>
                        <span>{company ? company.name : 'Unknown Supplier'}</span>
                        <span className="badge badge-success">{company ? company.rating + '/5' : 'N/A'}</span>
                      </div>
                    </div>
                    <div className="material-body">
                      <p>{item.description}</p>
                      <div className="material-price">{formatCurrency(item.price)} / {item.unit}</div>
                      <div className="material-stats">
                        <div className="stat-item">
                          <div className="value">{formatCurrency(item.price)}</div>
                          <div className="label">Material Cost</div>
                        </div>
                        <div className="stat-item">
                          <div className="value">~{formatCurrency(item.estimatedTransport || 0)}</div>
                          <div className="label">Est. Transport</div>
                        </div>
                        <div className="stat-item">
                          <div className="value">{formatCurrency(item.totalCost || item.price)}</div>
                          <div className="label">Total per Unit</div>
                        </div>
                      </div>
                      <button className="btn btn-primary w-100 mt-2" onClick={() => {
                        setFormData(prev => ({ 
                          ...prev, 
                          orderQuantity: item.minOrder.toString(),
                          orderAddress: currentUser?.address || ''
                        }));
                        showAlert(`Ready to order ${item.name}. Please enter quantity and address.`, 'info');
                      }}>
                        <i className="fas fa-shopping-cart"></i> Order Now
                      </button>
                      <button className="btn btn-secondary w-100 mt-2" onClick={() => handleContactSupplier(item.id)}>
                        <i className="fas fa-phone-alt"></i> Contact Supplier
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Available Materials</h3>
            </div>
            <div className="materials-grid">
              {materials.map((material: Material) => {
                const company = getCompanyById(material.companyId);
                return (
                  <div className="material-card" key={material.id}>
                    <div className="material-header">
                      <h3 className="material-title">{material.name}</h3>
                      <span className="material-category">{material.category}</span>
                      <div className="material-supplier">
                        <i className="fas fa-building"></i>
                        <span>{company ? company.name : 'Unknown Supplier'}</span>
                      </div>
                    </div>
                    <div className="material-body">
                      <p>{material.description}</p>
                      <div className="material-price">{formatCurrency(material.price)} / {material.unit}</div>
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
                      <button className="btn btn-primary w-100 mt-2" onClick={() => {
                        setFormData(prev => ({ 
                          ...prev, 
                          orderQuantity: material.minOrder.toString(),
                          orderAddress: currentUser?.address || ''
                        }));
                        handlePlaceOrder(material.id);
                      }}>
                        <i className="fas fa-shopping-cart"></i> Order Now
                      </button>
                      <button className="btn btn-secondary w-100 mt-2" onClick={() => handleContactSupplier(material.id)}>
                        <i className="fas fa-phone-alt"></i> Contact Supplier
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
    
    return (
      <main className="main-content">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <i className="fas fa-shopping-cart"></i>
            <h1>{isCompany ? 'Order Management' : 'My Orders'}</h1>
          </div>
          <p className="dashboard-subtitle">{isCompany ? 'Manage customer orders' : 'Track your orders and deliveries'}</p>
        </div>
        
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Material</th>
                {isCompany ? <th>Customer</th> : <th>Supplier</th>}
                <th>Quantity</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                {isCompany ? <th>Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {userOrders.map((order: Order) => {
                const material = getMaterialById(order.materialId);
                const company = getCompanyById(order.companyId);
                const customer = getUserById(order.customerId);
                
                return (
                  <tr key={order.id}>
                    <td><strong>{order.id}</strong></td>
                    <td>{material ? material.name : 'Unknown'}</td>
                    <td>
                      {isCompany 
                        ? (customer ? customer.name : 'Unknown') 
                        : (company ? company.name : 'Unknown')}
                    </td>
                    <td>{order.quantity} {material ? material.unit : ''}</td>
                    <td>{formatCurrency(order.totalAmount)}</td>
                    <td>
                      {order.status === 'delivered' ? <span className="badge badge-success">Delivered</span> :
                       order.status === 'in_transit' ? <span className="badge badge-warning">In Transit</span> :
                       order.status === 'pending' ? <span className="badge badge-primary">Pending</span> :
                       <span className="badge badge-danger">Cancelled</span>}
                    </td>
                    <td>{formatDate(order.orderDate)}</td>
                    {isCompany ? (
                      <td>
                        {order.status === 'pending' ? (
                          <div className="table-actions">
                            <button className="btn-action btn-success" onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}>
                              <i className="fas fa-check"></i> Confirm
                            </button>
                            <button className="btn-action btn-danger" onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}>
                              <i className="fas fa-times"></i> Cancel
                            </button>
                          </div>
                        ) : order.status === 'confirmed' ? (
                          <button className="btn-action btn-warning" onClick={() => handleUpdateOrderStatus(order.id, 'in_transit')}>
                            <i className="fas fa-truck"></i> Ship
                          </button>
                        ) : order.status === 'in_transit' ? (
                          <button className="btn-action btn-success" onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}>
                            <i className="fas fa-check-circle"></i> Deliver
                          </button>
                        ) : 'Completed'}
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    );
  };

  const renderAnalytics = () => (
    <main className="main-content">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <i className="fas fa-chart-line"></i>
          <h1>Analytics Dashboard</h1>
        </div>
        <p className="dashboard-subtitle">AI-powered insights and market trends for construction materials</p>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Price Trends</h3>
            <div className="card-icon"><i className="fas fa-chart-bar"></i></div>
          </div>
          <div className="stat-value">+5.2%</div>
          <p className="stat-label">Cement price increase this month</p>
        </div>
        
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Material Distribution</h3>
            <div className="card-icon"><i className="fas fa-chart-pie"></i></div>
          </div>
          <div className="stat-value">{materials.length}</div>
          <p className="stat-label">Total materials listed</p>
        </div>
        
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Top Category</h3>
            <div className="card-icon"><i className="fas fa-star"></i></div>
          </div>
          <div className="stat-value">Cement</div>
          <p className="stat-label">Most demanded material</p>
        </div>
        
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Revenue Forecast</h3>
            <div className="card-icon"><i className="fas fa-money-bill-wave"></i></div>
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
          <p><strong>AI Insights:</strong> Cement prices expected to increase by 5-8% due to rising demand. Steel prices stabilizing. Consider stocking aggregates before rainy season.</p>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Top Performing Materials</h3>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Category</th>
                <th>Avg Price</th>
                <th>Demand Trend</th>
                <th>Profit Margin</th>
                <th>AI Recommendation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Portland Cement</td>
                <td><span className="badge badge-primary">Cement</span></td>
                <td>{formatCurrency(850)}</td>
                <td><span className="badge badge-success">↑ 12%</span></td>
                <td>25%</td>
                <td><span className="badge badge-success">Increase Stock</span></td>
              </tr>
              <tr>
                <td>Steel Rebar</td>
                <td><span className="badge badge-primary">Steel</span></td>
                <td>{formatCurrency(12000)}</td>
                <td><span className="badge badge-warning">→ Stable</span></td>
                <td>18%</td>
                <td><span className="badge badge-warning">Maintain Level</span></td>
              </tr>
              <tr>
                <td>Clay Bricks</td>
                <td><span className="badge badge-primary">Bricks</span></td>
                <td>{formatCurrency(4.5)}</td>
                <td><span className="badge badge-success">↑ 8%</span></td>
                <td>22%</td>
                <td><span className="badge badge-success">Increase Stock</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );

  const renderSupplierMap = () => (
    <main className="main-content">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <i className="fas fa-map-marked-alt"></i>
          <h1>Supplier Map</h1>
        </div>
        <p className="dashboard-subtitle">Interactive map showing material suppliers in Addis Ababa with transport cost calculations</p>
      </div>
      
      <div className="map-container">
        <div className="map-placeholder">
          <i className="fas fa-map-marked-alt" style={{ fontSize: '4rem', color: 'var(--primary)', marginBottom: '1rem' }}></i>
          <h3>GIS Supplier Map</h3>
          <p>Supplier locations would be displayed here with interactive markers</p>
          <p>Transport costs calculated based on distance from your location</p>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Suppliers by Location</h3>
          <div className="badge badge-primary">{companies.length} Suppliers</div>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Location</th>
                <th>Materials</th>
                <th>Avg Price</th>
                <th>Rating</th>
                <th>Est. Transport Cost*</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company: Company) => {
                const companyMaterials = materials.filter(m => m.companyId === company.id);
                const avgPrice = companyMaterials.length > 0 
                  ? companyMaterials.reduce((sum: number, m: Material) => sum + m.price, 0) / companyMaterials.length 
                  : 0;
                
                let estTransport = 'N/A';
                if (currentUser) {
                  estTransport = formatCurrency(calculateTransportCost(
                    company.lat, company.lng,
                    currentUser.lat || 9.0320, currentUser.lng || 38.7469,
                    100
                  ));
                }
                
                return (
                  <tr key={company.id}>
                    <td><strong>{company.name}</strong></td>
                    <td>{company.location}</td>
                    <td>{companyMaterials.length} items</td>
                    <td>{formatCurrency(avgPrice)}</td>
                    <td>{company.rating || '4.5'}/5</td>
                    <td>{estTransport}</td>
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

  const renderPriceForecast = () => (
    <main className="main-content">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <i className="fas fa-chart-bar"></i>
          <h1>AI Price Forecasting</h1>
        </div>
        <p className="dashboard-subtitle">Machine learning predictions for construction material prices in Addis Ababa</p>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">30-Day Price Forecast</h3>
          <div className="badge badge-primary">Powered by AI</div>
        </div>
        <div className="p-2">
          <div className="forecast-chart-placeholder">
            <i className="fas fa-chart-line" style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem' }}></i>
            <p>Price forecasting chart would be displayed here</p>
          </div>
        </div>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Cement Forecast</h3>
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
            <h3 className="card-title">Steel Forecast</h3>
            <div className="card-icon"><i className="fas fa-drafting-compass"></i></div>
          </div>
          <div className="stat-value">-1.8%</div>
          <p className="stat-label">Expected price decrease</p>
          <div className="mt-2">
            <p><small><strong>Factors:</strong> Import stabilization, reduced global prices</small></p>
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
            <strong>AI Suggestion:</strong> Based on current trends, we recommend purchasing cement and bricks now before expected price increases in the coming month.
          </div>
          <div className="alert alert-success">
            <i className="fas fa-lightbulb"></i>
            <strong>Cost Optimization:</strong> Consider ordering from suppliers in Bole area for central Addis Ababa deliveries to minimize transport costs.
          </div>
          <div className="alert alert-warning">
            <i className="fas fa-exclamation-triangle"></i>
            <strong>Market Alert:</strong> Aggregate prices may fluctuate during rainy season (June-September). Plan procurement accordingly.
          </div>
        </div>
      </div>
    </main>
  );

  const renderFooter = () => (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Mehari SupplyChain AI</h3>
          <p>AI-driven platform optimizing construction material supply chains in Ethiopia. Master's Program Project.</p>
          <p><i className="fas fa-map-marker-alt"></i> Addis Ababa, Ethiopia</p>
        </div>
        
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li><a href="#" onClick={(e) => { e.preventDefault(); navigateTo('home'); }}><i className="fas fa-chevron-right"></i> Home</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); navigateTo('search-materials'); }}><i className="fas fa-chevron-right"></i> Find Materials</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); navigateTo('supplier-map'); }}><i className="fas fa-chevron-right"></i> Supplier Map</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); navigateTo('price-forecast'); }}><i className="fas fa-chevron-right"></i> Price Forecast</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Contact</h3>
          <ul className="footer-links">
            <li><a href="#"><i className="fas fa-envelope"></i> meharinageb@gmail.com</a></li>
            <li><a href="#"><i className="fas fa-phone"></i> +251909919154</a></li>
            <li><a href="#"><i className="fas fa-university"></i> Mehari</a></li>
          </ul>
        </div>
      </div>
      
      <div className="copyright">
        <p>© 2024 Mehari AI Construction Supply Chain Platform | Master's Program Project | All data is stored locally in your browser</p>
      </div>
    </footer>
  );

  // Render current page
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
      default: return renderHome();
    }
  };

  return (
    <div className="app-container">
      {renderHeader()}
      {renderAlert()}
      {renderCurrentPage()}
      {renderFooter()}
    </div>
  );
}

export default App;