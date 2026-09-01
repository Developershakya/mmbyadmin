"use client"
import { Sidebar } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function Home({ isMobile }) {
  const [device, setDevice] = useState(isMobile ? "mobile" : "desktop");

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "24px",
        color: "white",
        background: device === "mobile" ? "#2196F3" : "#4CAF50",
      }}
    >
      {device === "mobile" ? (
    <mobileSidebar/>
      ) : (
      <div className="  py-4 border-t">
                 <nav className="flex flex-col space-y-4">
                   <Link
                     href="/"
                     className="text-gray-700 hover:text-orange-500 bg- font-medium"
                   >
                     Home
                   </Link>
                   <Link
                     href="/aboutUs"
                     className="text-gray-700 hover:text-orange-500 font-medium"
                   >
                     About Us
                   </Link>
                   <Link
                     href="#"
                     className="text-gray-700 hover:text-orange-500 font-medium"
                   >
                     Travel Packages
                   </Link>
                   <Link
                     href="#"
                     className="text-gray-700 hover:text-orange-500 font-medium"
                   >
                     Travel Attraction
                   </Link>
                   <Link
                     href="/blog"
                     className="text-gray-700 hover:text-orange-500 font-medium"
                   >
                     Blog
                   </Link>
                   <Link
                     href="/contactUs"
                     className="text-gray-700 hover:text-orange-500 font-medium"
                   >
                     Contact Us
                   </Link>
                 </nav>
                 <div className="flex flex-col space-y-2 mt-4">
                   
                   <Button className="justify-center font-semibold bg-">
                     <User className="w-4 h-4 mr-2 " /> 
                     <Link href="/login"> Login</Link>
                   </Button>
                 </div>
               </div>
      )}
    </div>
  );
}

// Server-Side User-Agent detection
export async function getServerSideProps({ req }) {
  const userAgent = req.headers["user-agent"] || "";
  const isMobile = /iphone|ipad|android|mobile/i.test(userAgent);

  return {
    props: { isMobile }, // pass to component
  };
}
