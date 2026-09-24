'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar.jsx';
import TopNavbar from '@/components/admin/TopNavbar.jsx';
import ConfirmationModal from '@/components/admin/ConfirmationModal.jsx';
import Toast from '@/components/admin/Toast.jsx';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setSidebarOpen(prev => !prev);
    } else {
      setMobileSidebarOpen(prev => !prev);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  return (
    <div className="min-h-screen bg-[#F6F7FB] flex flex-col antialiased">
      <Sidebar
        currentPath={pathname}
        sidebarOpen={sidebarOpen}
        mobileSidebarOpen={mobileSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
        onNavigate={(path) => router.push(path)}
        onOpenLogoutModal={() => setLogoutModalOpen(true)}
      />

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? 'lg:pl-[250px]' : 'lg:pl-0'}`}>
        <TopNavbar
          sidebarOpen={sidebarOpen}
          mobileSidebarOpen={mobileSidebarOpen}
          setMobileSidebarOpen={setMobileSidebarOpen}
          onToggleSidebar={handleToggleSidebar}
          onNavigate={(path) => router.push(path)}
          notifications={[]}
          onMarkNotificationRead={() => {}}
          onMarkAllNotificationsRead={() => {}}
          onOpenLogoutModal={() => setLogoutModalOpen(true)}
          allMockData={{}}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-16">
          {children}
        </main>
      </div>

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
