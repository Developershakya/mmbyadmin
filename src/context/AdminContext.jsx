"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const AdminContext = createContext(null);

const defaultAdminValue = {
  bookings: [],
  packages: [],
  destinations: [],
  blogs: [],
  blogCategories: [],
  users: [],
  transactions: [],
  notifications: [],
  customizationConfig: {},
  activeInvoiceBooking: null,
  activeTicketBooking: null,
  confirmationState: {
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    isDanger: true,
    onConfirm: null,
  },
  packageModalState: { isOpen: false, initialData: null },
  blogModalState: { isOpen: false, initialData: null },
  builderEditingPackage: null,
  toast: { show: false, message: "", type: "success" },
  showToast: () => {},
  hideToast: () => {},
  setActiveInvoiceBooking: () => {},
  setActiveTicketBooking: () => {},
  setConfirmationState: () => {},
  setPackageModalState: () => {},
  setBlogModalState: () => {},
  setBuilderEditingPackage: () => {},
  handleCancelBooking: () => {},
  handleSavePackage: async () => ({ success: true }),
  handleSaveBuilderPackage: async () => ({ success: true }),
  handleDeletePackage: () => {},
  handleSaveBlog: async () => ({ success: true }),
  handleDeleteBlog: () => {},
  handleMarkNotificationRead: () => {},
  handleMarkAllNotificationsRead: () => {},
  packageBookings: [],
  busBookings: [],
  flightBookings: [],
  hotelBookings: [],
  cabBookings: [],
  usersList: [],
  setPackages: () => {},
  setNotifications: () => {},
};

export function AdminProvider({ children }) {
  const [bookings, setBookings] = useState([]);
  const [packages, setPackages] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [blogCategories, setBlogCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [customizationConfig, setCustomizationConfig] = useState({});
  const [activeInvoiceBooking, setActiveInvoiceBooking] = useState(null);
  const [activeTicketBooking, setActiveTicketBooking] = useState(null);
  const [confirmationState, setConfirmationState] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    isDanger: true,
    onConfirm: null,
  });
  const [packageModalState, setPackageModalState] = useState({ isOpen: false, initialData: null });
  const [blogModalState, setBlogModalState] = useState({ isOpen: false, initialData: null });
  const [builderEditingPackage, setBuilderEditingPackage] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  const handleCancelBooking = useCallback(() => {}, []);
  const handleSavePackage = useCallback(async () => ({ success: true }), []);
  const handleSaveBuilderPackage = useCallback(async () => ({ success: true }), []);
  const handleDeletePackage = useCallback(() => {}, []);
  const handleSaveBlog = useCallback(async () => ({ success: true }), []);
  const handleDeleteBlog = useCallback(() => {}, []);
  const handleMarkNotificationRead = useCallback(() => {}, []);
  const handleMarkAllNotificationsRead = useCallback(() => {}, []);

  const packageBookings = useMemo(() => bookings.filter((b) => b.type === "package"), [bookings]);
  const busBookings = useMemo(() => bookings.filter((b) => b.type === "bus"), [bookings]);
  const flightBookings = useMemo(() => bookings.filter((b) => b.type === "flight"), [bookings]);
  const hotelBookings = useMemo(() => bookings.filter((b) => b.type === "hotel"), [bookings]);
  const cabBookings = useMemo(() => bookings.filter((b) => b.type === "cab"), [bookings]);

  const value = useMemo(
    () => ({
      bookings,
      packages,
      destinations,
      blogs,
      blogCategories,
      users,
      transactions,
      notifications,
      customizationConfig,
      activeInvoiceBooking,
      activeTicketBooking,
      confirmationState,
      packageModalState,
      blogModalState,
      builderEditingPackage,
      toast,
      showToast,
      hideToast,
      setActiveInvoiceBooking,
      setActiveTicketBooking,
      setConfirmationState,
      setPackageModalState,
      setBlogModalState,
      setBuilderEditingPackage,
      setBookings,
      setPackages,
      setDestinations,
      setBlogs,
      setBlogCategories,
      setUsers,
      setTransactions,
      setNotifications,
      setCustomizationConfig,
      handleCancelBooking,
      handleSavePackage,
      handleSaveBuilderPackage,
      handleDeletePackage,
      handleSaveBlog,
      handleDeleteBlog,
      handleMarkNotificationRead,
      handleMarkAllNotificationsRead,
      packageBookings,
      busBookings,
      flightBookings,
      hotelBookings,
      cabBookings,
      usersList: users,
    }),
    [activeInvoiceBooking, activeTicketBooking, blogCategories, blogModalState, blogs, bookings, builderEditingPackage, busBookings, cabBookings, confirmationState, customizationConfig, destinations, flightBookings, handleCancelBooking, handleDeleteBlog, handleDeletePackage, handleMarkAllNotificationsRead, handleMarkNotificationRead, handleSaveBlog, handleSaveBuilderPackage, handleSavePackage, hideToast, hotelBookings, notifications, packageBookings, packageModalState, packages, setActiveInvoiceBooking, setActiveTicketBooking, setBlogCategories, setBlogModalState, setBuilderEditingPackage, setBlogs, setBookings, setConfirmationState, setCustomizationConfig, setDestinations, setNotifications, setPackageModalState, setPackages, setTransactions, setUsers, showToast, toast, transactions, users]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    return defaultAdminValue;
  }
  return context;
}
