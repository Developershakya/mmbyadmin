import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  initialPackageBookings,
  initialBusBookings,
  initialFlightBookings,
  initialHotelBookings,
  initialCabBookings,
  initialPackages,
  initialDestinations,
  initialBlogs,
  initialBlogCategories,
  initialUsers,
  initialTransactions,
  initialNotifications,
  initialCustomizationConfig
} from './lib/mockData.js';

const createCombinedInitialBookings = () => {
  const combined = [];
  const maxLen = Math.max(
    initialFlightBookings.length,
    initialPackageBookings.length,
    initialHotelBookings.length,
    initialCabBookings.length,
    initialBusBookings.length
  );
  for (let i = 0; i < maxLen; i++) {
    if (initialFlightBookings[i]) combined.push({ ...initialFlightBookings[i], type: 'flight' });
    if (initialHotelBookings[i]) combined.push({ ...initialHotelBookings[i], type: 'hotel' });
    if (initialPackageBookings[i]) combined.push({ ...initialPackageBookings[i], type: 'package' });
    if (initialCabBookings[i]) combined.push({ ...initialCabBookings[i], type: 'cab' });
    if (initialBusBookings[i]) combined.push({ ...initialBusBookings[i], type: 'bus' });
  }
  return combined;
};

const initialBookings = createCombinedInitialBookings();

import { fetchPackages, savePackage, deletePackageApi } from './lib/api/packages.js';

// Layout components
import Sidebar from './components/admin/Sidebar.jsx';
import TopNavbar from './components/admin/TopNavbar.jsx';

// Views
import DashboardView from './views/DashboardView.jsx';
import PackageBookingsView from './views/PackageBookingsView.jsx';
import BusBookingsView from './views/BusBookingsView.jsx';
import FlightBookingsView from './views/FlightBookingsView.jsx';
import HotelBookingsView from './views/HotelBookingsView.jsx';
import CabBookingsView from './views/CabBookingsView.jsx';
import HolidayPackagesView from './views/HolidayPackagesView.jsx';
import PackageCustomizationView from './views/PackageCustomizationView.jsx';
import DestinationsView from './views/DestinationsView.jsx';
import BlogsView from './views/BlogsView.jsx';
import BlogCategoriesView from './views/BlogCategoriesView.jsx';
import UsersView from './views/UsersView.jsx';
import PaymentsView from './views/PaymentsView.jsx';
import ReportsView from './views/ReportsView.jsx';
import NotificationsView from './views/NotificationsView.jsx';
import SettingsView from './views/SettingsView.jsx';
import PackageBuilderView from './views/PackageBuilderView.jsx';

// Modals
import InvoiceModal from './components/admin/InvoiceModal.jsx';
import TicketModal from './components/admin/TicketModal.jsx';
import ConfirmationModal from './components/admin/ConfirmationModal.jsx';
import AddPackageModal from './components/admin/AddPackageModal.jsx';
import AddBlogModal from './components/admin/AddBlogModal.jsx';
import Toast from './components/admin/Toast.jsx';

export default function App() {
  // Navigation State - default to the new TravelPro package builder design
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path && path.startsWith('/admin')) {
        return path;
      }
      const hash = window.location.hash.replace(/^#/, '');
      if (hash && hash.startsWith('/admin')) {
        return hash;
      }
    }
    return '/admin/packages/builder';
  });

  // Sidebar Layout State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Global Mock Data State
  const [bookings, setBookings] = useState(initialBookings);
  const [packages, setPackages] = useState(initialPackages);
  const [destinations, setDestinations] = useState(initialDestinations);
  const [blogs, setBlogs] = useState(initialBlogs);
  const [blogCategories, setBlogCategories] = useState(initialBlogCategories);
  const [users, setUsers] = useState(initialUsers);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [customizationConfig, setCustomizationConfig] = useState(initialCustomizationConfig);

  // Global Modal States
  const [activeInvoiceBooking, setActiveInvoiceBooking] = useState(null);
  const [activeTicketBooking, setActiveTicketBooking] = useState(null);
  const [confirmationState, setConfirmationState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    isDanger: true,
    onConfirm: null
  });

  const [packageModalState, setPackageModalState] = useState({
    isOpen: false,
    initialData: null
  });

  const [blogModalState, setBlogModalState] = useState({
    isOpen: false,
    initialData: null
  });

  // Package Builder State
  const [builderEditingPackage, setBuilderEditingPackage] = useState(null);

  // Global Toast Notification State
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }));
  }, []);

  // Fetch packages from database
  useEffect(() => {
    let isMounted = true;
    fetchPackages().then((dbPackages) => {
      if (isMounted && Array.isArray(dbPackages)) {
        setPackages(dbPackages);
      }
    }).catch(err => console.warn('Could not load DB packages:', err));
    return () => { isMounted = false; };
  }, []);

  // Sync with browser URL / history
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path && path.startsWith('/admin')) {
        setCurrentPath(path);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = useCallback((path) => {
    setCurrentPath(path);
    if (window.history.pushState) {
      window.history.pushState({}, '', path);
    }
    // Close mobile drawer on navigation
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Filter specific booking collections
  const packageBookings = useMemo(() => bookings.filter(b => b.type === 'package'), [bookings]);
  const busBookings = useMemo(() => bookings.filter(b => b.type === 'bus'), [bookings]);
  const flightBookings = useMemo(() => bookings.filter(b => b.type === 'flight'), [bookings]);
  const hotelBookings = useMemo(() => bookings.filter(b => b.type === 'hotel'), [bookings]);
  const cabBookings = useMemo(() => bookings.filter(b => b.type === 'cab'), [bookings]);

  // Cancel Booking Action
  const handleCancelBooking = (booking) => {
    setConfirmationState({
      isOpen: true,
      title: 'Cancel Travel Booking?',
      message: `Are you sure you want to cancel booking ${booking.id} for ${booking.customer?.name}? This will initiate the refund policy and notify the traveler.`,
      confirmText: 'Yes, Cancel Booking',
      cancelText: 'Keep Booking',
      isDanger: true,
      onConfirm: () => {
        setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: 'Cancelled' } : b));
        showToast(`Booking ${booking.id} was successfully cancelled.`, 'info');
        setConfirmationState(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Add / Edit Package
  const handleSavePackage = (packageData) => {
    if (packageModalState.initialData) {
      // Edit
      setPackages(prev => prev.map(p => p.id === packageData.id ? packageData : p));
      showToast(`Package "${packageData.name}" was updated.`);
    } else {
      // Add
      const newPkg = {
        ...packageData,
        id: `PKG-${Date.now().toString().slice(-4)}`
      };
      setPackages(prev => [newPkg, ...prev]);
      showToast(`Package "${packageData.name}" created successfully!`);
    }
  };

  const handleSaveBuilderPackage = async (packageData) => {
    try {
      const res = await savePackage(packageData);
      if (res && res.success) {
        showToast(`Package "${packageData.name || packageData.packageName || 'Custom Package'}" saved successfully!`);
        const refreshed = await fetchPackages();
        if (Array.isArray(refreshed)) {
          setPackages(refreshed);
        }
        handleNavigate('/admin/packages');
        return res;
      } else {
        showToast(res?.error || 'Failed to save package to database', 'error');
        return res;
      }
    } catch (err) {
      showToast(err.message || 'Error saving package', 'error');
      return { success: false, error: err.message };
    }
  };

  const handleDeletePackage = (pkg) => {
    setConfirmationState({
      isOpen: true,
      title: 'Delete Tour Package?',
      message: `Are you sure you want to permanently delete "${pkg.name || pkg.packageName}"? Active bookings for this package will remain preserved in historical records.`,
      confirmText: 'Delete Package',
      isDanger: true,
      onConfirm: async () => {
        if (pkg.id && !String(pkg.id).startsWith('PKG-')) {
          await deletePackageApi(pkg.id);
        }
        setPackages(prev => prev.filter(p => p.id !== pkg.id));
        showToast(`Package "${pkg.name || pkg.packageName}" deleted.`, 'info');
        setConfirmationState(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Add / Edit Blog
  const handleSaveBlog = (blogData) => {
    if (blogModalState.initialData) {
      setBlogs(prev => prev.map(b => b.id === blogData.id ? blogData : b));
      showToast(`Article "${blogData.title}" updated.`);
    } else {
      const newBlog = {
        ...blogData,
        id: `BLOG-${Date.now().toString().slice(-4)}`,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        views: 0
      };
      setBlogs(prev => [newBlog, ...prev]);
      showToast(`Article "${blogData.title}" published!`);
    }
  };

  const handleDeleteBlog = (blog) => {
    setConfirmationState({
      isOpen: true,
      title: 'Delete Blog Article?',
      message: `Are you sure you want to remove "${blog.title}"?`,
      confirmText: 'Delete Article',
      isDanger: true,
      onConfirm: () => {
        setBlogs(prev => prev.filter(b => b.id !== blog.id));
        showToast(`Article deleted.`, 'info');
        setConfirmationState(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Destinations & Categories Actions
  const handleAddDestination = (newDest) => {
    setDestinations(prev => [newDest, ...prev]);
    showToast(`Destination "${newDest.name}" added successfully!`);
  };

  const handleDeleteDestination = (dest) => {
    setConfirmationState({
      isOpen: true,
      title: 'Delete Destination?',
      message: `Delete ${dest.name} from destination list?`,
      confirmText: 'Delete',
      isDanger: true,
      onConfirm: () => {
        setDestinations(prev => prev.filter(d => d.id !== dest.id));
        showToast(`Destination "${dest.name}" removed.`, 'info');
        setConfirmationState(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleAddCategory = (newCat) => {
    setBlogCategories(prev => [...prev, newCat]);
    showToast(`Category "${newCat.name}" created.`);
  };

  const handleDeleteCategory = (cat) => {
    setBlogCategories(prev => prev.filter(c => c.id !== cat.id));
    showToast(`Category removed.`, 'info');
  };

  // Users & Payments Actions
  const handleToggleUserStatus = (userId) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'Active' ? 'Inactive' : 'Active';
        showToast(`User ${u.name} is now ${nextStatus}.`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleRefundTransaction = (tx) => {
    setConfirmationState({
      isOpen: true,
      title: 'Process Full Refund?',
      message: `Initiate full gateway reversal of ₹${tx.amount.toLocaleString('en-IN')} for transaction ${tx.id} (${tx.customer?.name})?`,
      confirmText: 'Issue Refund',
      isDanger: true,
      onConfirm: () => {
        setTransactions(prev => prev.map(t => t.id === tx.id ? { ...t, status: 'Refunded' } : t));
        showToast(`Refund for ${tx.id} processed successfully via ${tx.method}.`);
        setConfirmationState(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Notifications Actions
  const handleMarkNotificationRead = (notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast('All notifications marked as read.');
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    showToast('Notifications cleared.');
  };

  // Unread notifications count
  const unreadCount = notifications.filter(n => !n.read).length;

  // View routing renderer
  const renderCurrentView = () => {
    const rawPath = (currentPath || '').trim();
    const cleanPath = rawPath.replace(/\/+$/, '') || '/admin/dashboard';
    const pathWithoutQuery = cleanPath.split('?')[0].replace(/\/+$/, '') || '/admin/dashboard';
    const queryParams = new URLSearchParams(cleanPath.includes('?') ? cleanPath.split('?')[1] : (typeof window !== 'undefined' ? window.location.search : ''));
    const queryPackageId = queryParams.get('id');

    switch (pathWithoutQuery) {
      case '/admin':
      case '/admin/dashboard':
        return (
          <DashboardView
            bookings={bookings}
            packageBookings={packageBookings}
            busBookings={busBookings}
            flightBookings={flightBookings}
            hotelBookings={hotelBookings}
            cabBookings={cabBookings}
            onViewInvoice={(b) => setActiveInvoiceBooking(b)}
            onViewTicket={(b) => setActiveTicketBooking(b)}
            onCancelBooking={handleCancelBooking}
            onNavigate={handleNavigate}
            onOpenAddPackage={() => setPackageModalState({ isOpen: true, initialData: null })}
            onOpenAddBlog={() => setBlogModalState({ isOpen: true, initialData: null })}
          />
        );

      case '/admin/bookings/package':
      case '/admin/bookings/packages':
      case '/admin/package-bookings':
      case '/admin/package':
        return (
          <PackageBookingsView
            bookings={packageBookings}
            onViewInvoice={(b) => setActiveInvoiceBooking(b)}
            onCancelBooking={handleCancelBooking}
            onOpenAddBooking={() => showToast('New booking form drawer ready for API integration.')}
            onNavigate={handleNavigate}
          />
        );

      case '/admin/bookings/bus':
      case '/admin/bookings/buses':
      case '/admin/bus-bookings':
      case '/admin/bus':
      case '/admin/buses':
        return (
          <BusBookingsView
            bookings={busBookings}
            onViewTicket={(b) => setActiveTicketBooking(b)}
            onCancelBooking={handleCancelBooking}
            onOpenAddBooking={() => showToast('Bus booking ticket dispatch modal ready for API.')}
            onNavigate={handleNavigate}
          />
        );

      case '/admin/bookings/flight':
      case '/admin/bookings/flights':
      case '/admin/flight-bookings':
      case '/admin/flight':
      case '/admin/flights':
        return (
          <FlightBookingsView
            bookings={flightBookings}
            onViewTicket={(b) => setActiveTicketBooking(b)}
            onCancelBooking={handleCancelBooking}
            onInvoice={(b) => setActiveInvoiceBooking(b)}
            onNavigate={handleNavigate}
          />
        );

      case '/admin/bookings/hotel':
      case '/admin/bookings/hotels':
      case '/admin/hotel-bookings':
      case '/admin/hotel':
      case '/admin/hotels':
        return (
          <HotelBookingsView
            bookings={hotelBookings}
            onInvoice={(b) => setActiveInvoiceBooking(b)}
            onCancelBooking={handleCancelBooking}
            onNavigate={handleNavigate}
          />
        );

      case '/admin/bookings/cab':
      case '/admin/bookings/cabs':
      case '/admin/bookings/car':
      case '/admin/bookings/cars':
      case '/admin/cab-bookings':
      case '/admin/car-bookings':
      case '/admin/cab':
      case '/admin/cabs':
      case '/admin/car':
      case '/admin/cars':
        return (
          <CabBookingsView
            bookings={cabBookings}
            onInvoice={(b) => setActiveInvoiceBooking(b)}
            onCancelBooking={handleCancelBooking}
            onNavigate={handleNavigate}
          />
        );

      case '/admin/packages':
        return (
          <HolidayPackagesView
            packages={packages}
            onOpenAddPackage={() => {
              setBuilderEditingPackage(null);
              handleNavigate('/admin/packages/builder');
            }}
            onOpenEditPackage={(pkg) => {
              setBuilderEditingPackage(pkg);
              handleNavigate(`/admin/packages/builder?id=${pkg.id}`);
            }}
            onOpenBuilder={() => {
              setBuilderEditingPackage(null);
              handleNavigate('/admin/packages/builder');
            }}
            onEditInBuilder={(pkg) => {
              setBuilderEditingPackage(pkg);
              handleNavigate(`/admin/packages/builder?id=${pkg.id}`);
            }}
            onDeletePackage={handleDeletePackage}
            onNavigate={handleNavigate}
          />
        );

      case '/admin/packages/builder':
      case '/admin/packages/create':
      case '/admin/package-builder': {
        const pkgToEdit = builderEditingPackage || (queryPackageId ? packages.find(p => String(p.id) === String(queryPackageId)) : null);
        return (
          <PackageBuilderView
            initialPackage={pkgToEdit}
            onSavePackage={handleSaveBuilderPackage}
            onCancel={() => handleNavigate('/admin/packages')}
            onNavigate={handleNavigate}
            showToast={showToast}
          />
        );
      }

      case '/admin/packages/customization':
        return (
          <PackageCustomizationView
            packages={packages}
            customizationConfig={customizationConfig}
            onSaveCustomization={(cfg) => setCustomizationConfig(cfg)}
            onShowToast={showToast}
            onNavigate={handleNavigate}
          />
        );

      case '/admin/destinations':
        return (
          <DestinationsView
            destinations={destinations}
            onAddDestination={handleAddDestination}
            onDeleteDestination={handleDeleteDestination}
            onNavigate={handleNavigate}
          />
        );

      case '/admin/blogs':
        return (
          <BlogsView
            blogs={blogs}
            categories={blogCategories}
            onOpenAddBlog={() => setBlogModalState({ isOpen: true, initialData: null })}
            onOpenEditBlog={(blog) => setBlogModalState({ isOpen: true, initialData: blog })}
            onDeleteBlog={handleDeleteBlog}
            onNavigate={handleNavigate}
          />
        );

      case '/admin/blogs/categories':
      case '/admin/blog-categories':
        return (
          <BlogCategoriesView
            categories={blogCategories}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onNavigate={handleNavigate}
          />
        );

      case '/admin/users':
        return (
          <UsersView
            users={users}
            onToggleStatus={handleToggleUserStatus}
            onNavigate={handleNavigate}
          />
        );

      case '/admin/payments':
        return (
          <PaymentsView
            transactions={transactions}
            onRefund={handleRefundTransaction}
            onNavigate={handleNavigate}
          />
        );

      case '/admin/reports':
        return (
          <ReportsView
            onShowToast={showToast}
            onNavigate={handleNavigate}
          />
        );

      case '/admin/notifications':
        return (
          <NotificationsView
            notifications={notifications}
            onMarkNotificationRead={handleMarkNotificationRead}
            onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
            onClearNotifications={handleClearNotifications}
            onNavigate={handleNavigate}
          />
        );

      case '/admin/settings':
        return (
          <SettingsView
            onShowToast={showToast}
            onNavigate={handleNavigate}
          />
        );

      default:
        // Smart keyword fallback in case of custom URL formats or query params
        if (cleanPath.includes('flight')) {
          return (
            <FlightBookingsView
              bookings={flightBookings}
              onViewTicket={(b) => setActiveTicketBooking(b)}
              onCancelBooking={handleCancelBooking}
              onInvoice={(b) => setActiveInvoiceBooking(b)}
              onNavigate={handleNavigate}
            />
          );
        }
        if (cleanPath.includes('hotel')) {
          return (
            <HotelBookingsView
              bookings={hotelBookings}
              onInvoice={(b) => setActiveInvoiceBooking(b)}
              onCancelBooking={handleCancelBooking}
              onNavigate={handleNavigate}
            />
          );
        }
        if (cleanPath.includes('cab') || cleanPath.includes('car')) {
          return (
            <CabBookingsView
              bookings={cabBookings}
              onInvoice={(b) => setActiveInvoiceBooking(b)}
              onCancelBooking={handleCancelBooking}
              onNavigate={handleNavigate}
            />
          );
        }
        if (cleanPath.includes('bus')) {
          return (
            <BusBookingsView
              bookings={busBookings}
              onViewTicket={(b) => setActiveTicketBooking(b)}
              onCancelBooking={handleCancelBooking}
              onOpenAddBooking={() => showToast('Bus booking ticket dispatch modal ready for API.')}
              onNavigate={handleNavigate}
            />
          );
        }
        return (
          <DashboardView
            bookings={bookings}
            packageBookings={packageBookings}
            busBookings={busBookings}
            flightBookings={flightBookings}
            hotelBookings={hotelBookings}
            cabBookings={cabBookings}
            onViewInvoice={(b) => setActiveInvoiceBooking(b)}
            onViewTicket={(b) => setActiveTicketBooking(b)}
            onCancelBooking={handleCancelBooking}
            onNavigate={handleNavigate}
            onOpenAddPackage={() => setPackageModalState({ isOpen: true, initialData: null })}
            onOpenAddBlog={() => setBlogModalState({ isOpen: true, initialData: null })}
          />
        );
    }
  };

  return (
    <div id="admin-root" className="min-h-screen bg-[#F6F7FB] flex text-[#0F172A] font-sans antialiased">
      {/* Reusable Sidebar Navigation */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={handleNavigate}
        mobileSidebarOpen={sidebarOpen}
        setMobileSidebarOpen={setSidebarOpen}
        onOpenLogoutModal={() => {}}
        unreadNotificationsCount={unreadCount}
      />

      {/* Main Content Layout Container */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:pl-[250px]">
        {/* Top Navbar */}
        <TopNavbar
          onNavigate={handleNavigate}
          mobileSidebarOpen={sidebarOpen}
          setMobileSidebarOpen={setSidebarOpen}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          allMockData={{ packages, bookings }}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-16">
          {renderCurrentView()}
        </main>
      </div>

      {/* Global Invoice Modal */}
      <InvoiceModal
        isOpen={Boolean(activeInvoiceBooking)}
        onClose={() => setActiveInvoiceBooking(null)}
        booking={activeInvoiceBooking}
      />

      {/* Global Ticket Modal */}
      <TicketModal
        isOpen={Boolean(activeTicketBooking)}
        onClose={() => setActiveTicketBooking(null)}
        booking={activeTicketBooking}
      />

      {/* Global Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationState.isOpen}
        onClose={() => setConfirmationState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmationState.onConfirm}
        title={confirmationState.title}
        message={confirmationState.message}
        confirmText={confirmationState.confirmText}
        cancelText={confirmationState.cancelText}
        isDanger={confirmationState.isDanger}
      />

      {/* Add / Edit Package Modal */}
      <AddPackageModal
        isOpen={packageModalState.isOpen}
        onClose={() => setPackageModalState({ isOpen: false, initialData: null })}
        onSave={handleSavePackage}
        initialData={packageModalState.initialData}
      />

      {/* Add / Edit Blog Modal */}
      <AddBlogModal
        isOpen={blogModalState.isOpen}
        onClose={() => setBlogModalState({ isOpen: false, initialData: null })}
        onSave={handleSaveBlog}
        categories={blogCategories}
        initialData={blogModalState.initialData}
      />

      {/* Global Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </div>
  );
}
