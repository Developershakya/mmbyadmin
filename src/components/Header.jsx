"use client";
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  Menu,
  X,
  User,
  ChevronDown,
  MapPin,
  Plane,
  Hotel,
  Bus,
  Car,
  Clock,
  Headphones,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/img/make-my-bharat-yatra-logo.png"
              alt="Make My Bharat Yatra Logo"
              width={300}
              height={48}
              className="object-contain object-center h-15"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-600">
            {/* Destination dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 text-orange-600 pb-1 border-b-2 border-orange-600">
                <span>Destination</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute left-0 top-full mt-3 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 p-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
                <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 transition">
                  <span className="w-9 h-9 flex items-center justify-center rounded-full bg-orange-50 text-orange-600">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-gray-800">Hill Stations</span>
                    <span className="block text-[11px] text-gray-400">Manali, Shimla, Leh</span>
                  </span>
                </a>
                <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 transition">
                  <span className="w-9 h-9 flex items-center justify-center rounded-full bg-orange-50 text-orange-600">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-gray-800">Beaches</span>
                    <span className="block text-[11px] text-gray-400">Goa, Andaman, Pondicherry</span>
                  </span>
                </a>
                <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 transition">
                  <span className="w-9 h-9 flex items-center justify-center rounded-full bg-orange-50 text-orange-600">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-gray-800">Spiritual &amp; Heritage</span>
                    <span className="block text-[11px] text-gray-400">Varanasi, Rishikesh, Jaipur</span>
                  </span>
                </a>
                <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 transition">
                  <span className="w-9 h-9 flex items-center justify-center rounded-full bg-orange-50 text-orange-600">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-gray-800">International</span>
                    <span className="block text-[11px] text-gray-400">Dubai, Singapore, Bali</span>
                  </span>
                </a>
              </div>
            </div>

            {/* Journey dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 hover:text-orange-600 transition">
                <span>Journey</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute left-0 top-full mt-3 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 p-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
                <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 transition">
                  <span className="w-9 h-9 flex items-center justify-center rounded-full bg-orange-50 text-orange-600">
                    <Plane className="w-4 h-4" />
                  </span>
                  <span className="text-sm font-semibold text-gray-800">Flights</span>
                </a>
                <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 transition">
                  <span className="w-9 h-9 flex items-center justify-center rounded-full bg-orange-50 text-orange-600">
                    <Hotel className="w-4 h-4" />
                  </span>
                  <span className="text-sm font-semibold text-gray-800">Hotels</span>
                </a>
                <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 transition">
                  <span className="w-9 h-9 flex items-center justify-center rounded-full bg-orange-50 text-orange-600">
                    <Bus className="w-4 h-4" />
                  </span>
                  <span className="text-sm font-semibold text-gray-800">Buses</span>
                </a>
                <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 transition">
                  <span className="w-9 h-9 flex items-center justify-center rounded-full bg-orange-50 text-orange-600">
                    <Car className="w-4 h-4" />
                  </span>
                  <span className="text-sm font-semibold text-gray-800">Cabs</span>
                </a>
                <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 transition">
                  <span className="w-9 h-9 flex items-center justify-center rounded-full bg-orange-50 text-orange-600">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <span className="text-sm font-semibold text-gray-800">Holiday Packages</span>
                </a>
              </div>
            </div>

            <Link href="#" className="hover:text-orange-600 transition">
              Adventures
            </Link>
            <Link href="/blog" className="hover:text-orange-600 transition">
              Blog
            </Link>
            <Link href="/aboutUs" className="hover:text-orange-600 transition">
              About Us
            </Link>
          </nav>

          {/* Right side (desktop) */}
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-600">
            {/* Customer Service dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 hover:text-orange-600 transition">
                <Headphones className="w-3.5 h-3.5" />
                <span>Customer Service</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 p-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
                <a href="tel:01143131313" className="flex items-start gap-3 p-3 rounded-lg hover:bg-orange-50 transition">
                  <span className="w-9 h-9 flex items-center justify-center rounded-full bg-orange-50 text-orange-600 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-gray-800">Call Support</span>
                    <span className="block text-[11px] text-gray-400">Tel: 011-43131313, 43030303</span>
                  </span>
                </a>
                <a href="mailto:care@bharatyatra.com" className="flex items-start gap-3 p-3 rounded-lg hover:bg-orange-50 transition">
                  <span className="w-9 h-9 flex items-center justify-center rounded-full bg-orange-50 text-orange-600 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-gray-800">Mail Support</span>
                    <span className="block text-[11px] text-gray-400">care@bharatyatra.com</span>
                  </span>
                </a>
              </div>
            </div>

            <Link href="/login">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg px-4 py-2 transition">
                Login / Signup
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-700 hover:text-orange-500 font-medium">
                Home
              </Link>
              <Link href="#" className="text-gray-700 hover:text-orange-500 font-medium">
                Destination
              </Link>
              <Link href="#" className="text-gray-700 hover:text-orange-500 font-medium">
                Journey
              </Link>
              <Link href="#" className="text-gray-700 hover:text-orange-500 font-medium">
                Adventures
              </Link>
              <Link href="/blog" className="text-gray-700 hover:text-orange-500 font-medium">
                Blog
              </Link>
              <Link href="/aboutUs" className="text-gray-700 hover:text-orange-500 font-medium">
                About Us
              </Link>
              <Link href="/contactUs" className="text-gray-700 hover:text-orange-500 font-medium">
                Contact Us
              </Link>
            </nav>
            <div className="flex flex-col space-y-2 mt-4">
              <Link href="/login">
                <Button className="justify-center font-semibold w-full">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}