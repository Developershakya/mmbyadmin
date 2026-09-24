'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAdmin } from '@/context/AdminContext.jsx';
import Sidebar from '@/components/admin/Sidebar.jsx';
import TopNavbar from '@/components/admin/TopNavbar.jsx';
import InvoiceModal from '@/components/admin/InvoiceModal.jsx';
import TicketModal from '@/components/admin/TicketModal.jsx';
import ConfirmationModal from '@/components/admin/ConfirmationModal.jsx';
import AddPackageModal from '@/components/admin/AddPackageModal.jsx';
import AddBlogModal from '@/components/admin/AddBlogModal.jsx';
import Toast from '@/components/admin/Toast.jsx';


export default function AdminLayout({ children }) {
  const router = useRouter();
   const pathname = usePathname();
   console.log(pathname)
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setSidebarOpen(prev => !prev);
    } else {
      setMobileSidebarOpen(prev => !prev);
    }
  };

  const {
    activeInvoiceBooking,
    setActiveInvoiceBooking,
    activeTicketBooking,
    setActiveTicketBooking,
    confirmationState,
    setConfirmationState,
    packageModalState,
    setPackageModalState,
    blogModalState,
    setBlogModalState,
    handleSavePackage,
    handleSaveBlog,
    toast,
    hideToast,
    showToast,
    notifications,
    handleMarkNotificationRead,
    handleMarkAllNotificationsRead,
    packages,
    packageBookings,
    busBookings,
    users
  } = useAdmin();

  return (
    <div className="min-h-screen bg-[#F6F7FB] flex flex-col antialiased">
      {/* Sidebar navigation */}
      <Sidebar
        currentPath={pathname}
        sidebarOpen={sidebarOpen}
        mobileSidebarOpen={mobileSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
        onNavigate={(path) => router.push(path)}
        onOpenLogoutModal={() => setLogoutModalOpen(true)}
      />

      {/* Main shell */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? 'lg:pl-[250px]' : 'lg:pl-0'}`}>
        <TopNavbar
          sidebarOpen={sidebarOpen}
          mobileSidebarOpen={mobileSidebarOpen}
          setMobileSidebarOpen={setMobileSidebarOpen}
          onToggleSidebar={handleToggleSidebar}
          onNavigate={(path) => router.push(path)}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          onOpenLogoutModal={() => setLogoutModalOpen(true)}
          allMockData={{
            packages,
            packageBookings,
            busBookings,
            users
          }}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-16">
          {children}
        </main>
      </div>

      {/* Global Modals */}
      {activeInvoiceBooking && (
        <InvoiceModal
          isOpen={Boolean(activeInvoiceBooking)}
          onClose={() => setActiveInvoiceBooking(null)}
          booking={activeInvoiceBooking}
        />
      )}

      {activeTicketBooking && (
        <TicketModal
          isOpen={Boolean(activeTicketBooking)}
          onClose={() => setActiveTicketBooking(null)}
          booking={activeTicketBooking}
        />
      )}

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

      {packageModalState.isOpen && (
        <AddPackageModal
          isOpen={packageModalState.isOpen}
          onClose={() => setPackageModalState({ isOpen: false, initialData: null })}
          onSave={handleSavePackage}
          initialData={packageModalState.initialData}
        />
      )}

      {blogModalState.isOpen && (
        <AddBlogModal
          isOpen={blogModalState.isOpen}
          onClose={() => setBlogModalState({ isOpen: false, initialData: null })}
          onSave={handleSaveBlog}
          initialData={blogModalState.initialData}
        />
      )}

      <ConfirmationModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={() => {
          setLogoutModalOpen(false);
          showToast('Signed out of admin session successfully.', 'info');
        }}
        title="Sign Out of Admin Console?"
        message="Are you sure you want to end your administrative session? You will need your security credentials to access booking management again."
        confirmText="Sign Out"
        cancelText="Cancel"
        isDanger={false}
      />


      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
}
