"use client";
import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Link2Icon,
  // YoutubeIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 sm:grid-cols-2 gap-8">
          {/* Company Info */}
          <div>
             <Link href="/" className="flex items-center">
            <div className="flex items-center">
              <Image
                src="/img/make-my-bharat-yatra-logo.png"
                alt="Make My Bharat Yatra Logo"
                width={400}
                height={300}
                className="object-contain object-center h-15 "
              />
            </div>
          </Link>
            <p className="text-gray-300 mb-4">
              Make My Bharat Yatra offers expertly crafted, personalized Travel
              experiences across India. Enjoy exceptional service, unique
              adventures, and seamless journeys to India s top destinations with
              us{" "}
            </p>
            <div className="flex space-x-4">
              <Link href="https://www.facebook.com/profile.php?id=61565956004249"><Facebook className="w-10 h-10 cursor-pointer hover:text-blue-400 " /></Link>
              <Link href="https://x.com/Mmby0410"><Twitter className="w-10 h-10 cursor-pointer hover:text-blue-400" /></Link>
              <Link href="https://www.instagram.com/make_my_bharat_yatra/"><Instagram className="w-10 h-10 cursor-pointer hover:text-pink-400" /></Link>
              <Link href="https://www.linkedin.com/in/make-my-bharat-yatra/"><Link2Icon className="w-10 h-10 cursor-pointer hover:text-blue-400" /></Link>
              {/* <Link href=""><YoutubeIcon className="w-5 h-5 cursor-pointer hover:text-red-400" /></Link> */}

            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-orange-500 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="" className="text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="aboutUs" className="text-gray-300 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="ourServices" className="text-gray-300 hover:text-white">
                  Our Services
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white">
                  Membership
                </Link>
              </li>
              <li>
                <Link href="career" className="text-gray-300 hover:text-white">
                  Career
                </Link>
              </li>
              <li>
                <Link href="/blogs" className="text-gray-300 hover:text-white">
                  Blog
                </Link>
              </li>
               <li>
                <Link href="/term-and-conditions" className="text-gray-300 hover:text-white">
                  Term & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-bold text-orange-500 mb-4">
              Top Destinations
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  Delhi
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  Goa Tour
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  Manali
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  Kerala
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  Coimbatore
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  Mussoorie
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold text-orange-500 mb-4">
              Contact Us
            </h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-3" />
                <Link href="tel:+911204223100">
                  <span className="text-gray-300">+91 1204223100</span>
                </Link>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-3" />
                <Link href="tel:+919871980066">
                  <span className="text-gray-300">+91 9871980066</span>
                </Link>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-3" />
                <Link href="mailto:info@makemybharatyatra.com">
                  <span className="text-gray-300">
                    info@makemybharatyatra.com
                  </span>
                </Link>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-3" />
                <Link href="mailto:support@makemybharatyatra.com">
                  <span className="text-gray-300">
                    support@makemybharatyatra.com
                  </span>
                </Link>
              </div>
              <div className="flex items-start">
                <MapPin className="w-8 h-7 mr-3 mt-1" />
                <span className="text-gray-300">
                  D-59, D-Block, Sector 63, Noida, Gautam Budh Nagar, Delhi
                  NCR(UP), 201301, India
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-300 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © 2025 Make My Bharat Yatra | All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
