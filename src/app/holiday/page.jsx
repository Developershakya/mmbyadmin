"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { AiOutlineDown, AiOutlineUp } from "react-icons/ai";
import { FiArrowLeft } from "react-icons/fi";
import { RiShareForwardFill } from "react-icons/ri"; // Remix Icons
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";
import Header from "@/components/Header"; // Assuming you have a Header component
import SearchBar from "../../components/SearchBar";
import Gallery from "../../components/Gallery";
import TermsAndConditions from "../../components/Term&Condition";
import SlideUpModal from "../../components/SlideUpModal";


export default function HolidayPage() {
  const [isLarge, setIsLarge] = useState(false);
  const [selectedTab, setSelectedTab] = useState("itinerary");
  const [itineraryOpen, setitineraryOpen] = useState(true);
  const [policiesOpen, setPoliciesOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const galleryData = [
    {
      category: "Around the Destination",
      cover: "https://makemybharatyatra.com/assets/images/manali-view-img3.cms",
      photos: [
        "https://makemybharatyatra.com/assets/images/manali-view-img3.cms",
        "https://makemybharatyatra.com/assets/images/manali-attraction4-img.webp",
        "https://makemybharatyatra.com/assets/images/manali-attraction1-img.webp",
      ],
    },
    {
      category: "Property Photos",
      cover: "https://makemybharatyatra.com/assets/images/manali-view-img3.cms",
      photos: [
        "https://images.pexels.com/photos/223123/pexels-photo-223123.jpeg",
        "https://images.pexels.com/photos/223124/pexels-photo-223124.jpeg",
      ],
    },
    {
      category: "Activities & Sightseeing",
      cover: "https://images.pexels.com/photos/323123/pexels-photo-323123.jpeg",
      photos: [
        "https://images.pexels.com/photos/323123/pexels-photo-323123.jpeg",
      ],
    },
    {
      category: "Package Highlights",
      cover:
        "https://makemybharatyatra.com/assets/images/manali-attraction4-img.webp",
      photos: [
        "https://images.pexels.com/photos/423123/pexels-photo-423123.jpeg",
      ],
    },
  ];

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check this out!",
          text: "Mujhe laga tumhe pasand aayega 👇",
          url: shareUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback if navigator.share is not supported
      navigator.clipboard.writeText(shareUrl);
      alert("Link copied: " + shareUrl);
    }
  };
  // Dropdown toggle for small screens
  const toggleDropdown = (tab) => {
    if (tab === "itinerary") setitineraryOpen(!itineraryOpen);
    if (tab === "policies") setPoliciesOpen(!policiesOpen);
    if (tab === "summary") setSummaryOpen(!summaryOpen);
  };
  useEffect(() => {
    const handleResize = () => setIsLarge(window.innerWidth >= 640); // lg breakpoint = 1024px
    handleResize(); // initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    if (policiesOpen) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [policiesOpen]);
  return (
    <>
      <div className={`${open ? "fixed inset-0 overflow-hidden" : ""}`}>
        {isLarge ? (
          <Header />
        ) : (
          <button
            onClick={() => router.back()}
            className="flex items-center p-3"
          >
            <FiArrowLeft className="text-gray-500 text-2xl" />
          </button>
        )}
        {/* search engine */}
        {isLarge && <SearchBar />}
        <div className="relative">
          <div
            className="h-[300px] w-full relative flex justify-center items-center bg-black"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1470&q=80')",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Content */}
            <div className="relative flex flex-col items-center justify-center text-center">
              <h1 className="capitalize text-3xl font-semibold text-white mb-2">
                Goa Hero package with complimentary activities
              </h1>
              <p className="text-lg text-gray-200 mb-1">4 Nights / 5 Days</p>
              <p className="text-2xl font-extrabold text-orange-400 mb-4">
                ₹12,999 / Person
              </p>
              <button className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-6 py-2 rounded-xl shadow-lg hover:scale-105 transition">
                Book Now
              </button>
            </div>
          </div>

          <div className="max-w-7xl mx-auto  p-5 space-y-4">
            {/* Title */}
            <div className="sticky top-15 space-y-3 z-60 bg-white">
            <h1 className="capitalize  text-2xl md:text-3xl  font-bold md:font-bold text-gray-900">
              Goa hero package with complimentary activities
            </h1>

            {/* Trip Info */}
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="border  sm:bg-[#26B5A9] sm:text-white px-2 py-1 rounded-sm text-xs font-medium">
                3N/4D
              </span>
              <span className="border sm:bg-black capitalize sm:text-white px-2 py-1 rounded-sm text-xs font-medium">
                package
              </span>
              <span className="border sm:bg-black capitalize sm:text-white px-2 py-1 rounded-sm text-xs font-medium">
                Customizable
              </span>
              <span className="text-[#4A4A4A] font-bold">3N Goa</span>
            </div>
            <div className="flex items-center gap-3 ml-4 text-sm text-gray-600">
              <ul className="flex gap-6">
                <li className="relative   px-2 py-1 rounded-sm text-xs font-medium">
                  <span className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-600 rounded-full flex items-center"></span>
                  2D Delhi
                </li>
                <li className="relative  px-2 py-1 rounded-sm text-xs font-medium">
                  <span className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-600 rounded-full flex items-center"></span>
                  1D Lucknow
                </li>
                <li className="relative   px-2 py-1 rounded-sm text-xs font-medium ">
                  <span className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-600 rounded-full flex items-center"></span>
                  1D City
                </li>
              </ul>
            </div>
          </div>
            {/* Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-[250px] rounded-xl">
              {/* Left Big Image */}
              <div
                className="relative rounded-sm overflow-hidden cursor-pointer"
                onClick={() => setOpen(true)} // <-- yaha click event add kiya
              >
                <img
                  className="absolute inset-0 w-full h-full object-cover"
                  src="https://images.pexels.com/photos/206359/pexels-photo-206359.jpeg"
                  alt=""
                />
                <div className="absolute flex justify-around items-center bottom-3 left-5 text-white bg-black/70 p-2 rounded-lg border border-[#848483]">
                  VIEW GALLERY
                </div>
              </div>

              {/* Right Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Top Right Image */}
                <div
                  className="relative rounded-sm overflow-hidden cursor-pointer"
                  onClick={() => setOpen(true)}
                >
                  <img
                    className="absolute inset-0 w-full h-full object-cover"
                    src="https://images.pexels.com/photos/206648/pexels-photo-206648.jpeg"
                    alt=""
                  />
                </div>

                {/* Bottom Two Small Images */}
                <div
                  className={`grid gap-3 ${
                    isLarge ? "grid-rows-2" : "grid-cols-2"
                  }`}
                >
                  <div
                    className="relative rounded-sm overflow-hidden cursor-pointer"
                    onClick={() => setOpen(true)}
                  >
                    <img
                      className="absolute inset-0 w-full h-full object-cover"
                      src="https://images.pexels.com/photos/709552/pexels-photo-709552.jpeg"
                      alt=""
                    />
                  </div>
                  <div
                    className="relative rounded-sm overflow-hidden cursor-pointer"
                    onClick={() => setOpen(true)}
                  >
                    <img
                      className="absolute inset-0 w-full h-full object-cover"
                      src="https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg"
                      alt=""
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Gallery Modal */}
            {open && (
              <Gallery images={galleryData} onClose={() => setOpen(false)} />
            )}
            {!isLarge && <SearchBar />}
          </div>
          <div className={` py-6 ${isLarge ? "md:mb-0 px-4 " : "mb-24 "}  `}>
            {/* Tabs or Dropdown Header */}
            {isLarge ? (
              <div className="max-w-7xl sticky top-15 z-50 mx-auto flex justify-between bg-white p-4 shadow-md rounded-t-lg -mt-2">
                <div className="w-full sticky flex space-x-8">
                  {["itinerary", "policies", "summary"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSelectedTab(tab)}
                      className={`font-semibold md:text-2xl cursor-pointer hover:text-blue-600 transition-all pb-1 ${
                        selectedTab === tab
                          ? "text-blue-600 border-blue-600 border-b-4"
                          : "text-gray-600"
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleShare}
                  className="flex items-center cursor-pointer gap-2 text-gray-600 px-4 py-2"
                >
                  <RiShareForwardFill size={20} /> Share
                </button>
              </div>
            ) : (
              <div className="max-w-7xl mx-auto">
                {["itinerary", "policies", "summary"].map((tab) => (
                  <div key={tab}>
                    <div
                      className="p-3 border-b-2 border-gray-300 flex justify-between items-center cursor-pointer bg-white shadow-lg"
                      onClick={() => {
                        setSelectedTab(tab);
                        toggleDropdown(tab);
                      }}
                    >
                      <span className="font-semibold text-gray-700">
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </span>
                      <span>
                        {(tab === "policies" && policiesOpen) ||
                        (tab === "summary" && summaryOpen) ||
                        (tab === "itinerary" && selectedTab === "itinerary") ? (
                          <RiArrowUpSLine size={15} />
                        ) : (
                          <RiArrowDownSLine size={15} />
                        )}
                      </span>
                    </div>

                    {/* Dropdown content */}
                    {((tab === "itinerary" && itineraryOpen) ||
                      (tab === "policies" && policiesOpen) ||
                      (tab === "summary" && summaryOpen)) && (
                      <div className="bg-gray-50 transition-all duration-300 ease-in-out">
                        {tab === "itinerary" && (
                          <div className="col-span-2  bg-white rounded-lg shadow p-8">
                            <div className="">
                              <span>Itinerary</span>{" "}
                            </div>
                            <h2 className="text-2xl font-semibold mb-6">
                              4 Day Plan
                            </h2>

                            {/* Day 1 */}
                            <section className="mb-8">
                              <h3 className="text-lg font-bold text-gray-800">
                                Day 1: Arrival in Goa
                              </h3>
                              <p className="text-sm text-red-600">
                                Note: You need to reach Goa on your own.
                              </p>

                              <div className="mt-4 border p-5 rounded-lg bg-gray-50">
                                <h4 className="font-semibold">
                                  Private Transfer
                                </h4>
                                <p className="text-sm text-gray-700">
                                  Airport to hotel via private cab
                                </p>
                              </div>

                              <div className="mt-4 border p-5 rounded-lg bg-gray-50">
                                <h4 className="font-semibold">
                                  Resort Stay: Luxury Goa Resort
                                </h4>
                                <p className="text-sm text-gray-700">
                                  3 Nights | Deluxe Room w/ Balcony
                                </p>
                                <img
                                  src="https://images.pexels.com/photos/136721/pexels-photo-136721.jpeg"
                                  alt="Resort Room"
                                  className="mt-3 w-full h-48 object-cover rounded-lg"
                                />
                              </div>
                            </section>

                            {/* Day 2 */}
                            <section className="mb-8">
                              <h3 className="text-lg font-bold text-gray-800">
                                Day 2: Water Sports Activity
                              </h3>
                              <div className="mt-4 border p-5 rounded-lg bg-gray-50">
                                <h4 className="font-semibold">
                                  Double Decker Boat Party with Water Sports
                                </h4>
                                <p className="text-sm text-gray-700">
                                  4 Hours | Includes water sports, lunch &
                                  transfers
                                </p>
                                <img
                                  src="https://images.pexels.com/photos/326212/pexels-photo-326212.jpeg"
                                  alt="Boat Party"
                                  className="mt-3 w-full h-48 object-cover rounded-lg"
                                />
                              </div>
                            </section>

                            {/* Day 3 */}
                            <section className="mb-8">
                              <h3 className="text-lg font-bold text-gray-800">
                                Day 3: Leisure Day
                              </h3>
                              <p className="text-sm text-gray-700">
                                Enjoy resort amenities or add optional
                                activities as you like.
                              </p>
                            </section>

                            {/* Day 4 */}
                            <section>
                              <h3 className="text-lg font-bold text-gray-800">
                                Day 4: Departure
                              </h3>
                              <p className="text-sm text-red-600">
                                Note: Departure from Goa on your own.
                              </p>
                            </section>
                          </div>
                        )}
                        {tab === "policies" && (
                          <SlideUpModal
                            isOpen={isModalOpen}
                            onClose={() => {
                              setIsModalOpen(false);
                              toggleDropdown(tab);
                            }}
                          >
                            <TermsAndConditions />
                          </SlideUpModal>
                        )}
                        {tab === "summary" && (
                          <div className="  bg-white shadow p-4">
                            {summaryOpen && (
                              <div className=" p-2 border bg-gray-50">
                                {/* Actual policies content */}
                                <p>Policy 1: Lorem ipsum...</p>
                                <p>Policy 2: Lorem ipsum...</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Main Content for Large Screen */}
            {isLarge && (
              <div className="max-w-7xl mx-auto mt-6 mb-24 md:mb-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-2 bg-white rounded-lg shadow p-8">
                  {selectedTab === "itinerary" && (
                    <div className="col-span-2  bg-white rounded-lg shadow p-8">
                      <div className="">
                        <span>Itinerary</span>{" "}
                      </div>
                      <h2 className="text-2xl font-semibold mb-6">
                        4 Day Plan
                      </h2>

                      {/* Day 1 */}
                      <section className="mb-8">
                        <h3 className="text-lg font-bold text-gray-800">
                          Day 1: Arrival in Goa
                        </h3>
                        <p className="text-sm text-red-600">
                          Note: You need to reach Goa on your own.
                        </p>

                        <div className="mt-4 border p-5 rounded-lg bg-gray-50">
                          <h4 className="font-semibold">Private Transfer</h4>
                          <p className="text-sm text-gray-700">
                            Airport to hotel via private cab
                          </p>
                        </div>

                        <div className="mt-4 border p-5 rounded-lg bg-gray-50">
                          <h4 className="font-semibold">
                            Resort Stay: Luxury Goa Resort
                          </h4>
                          <p className="text-sm text-gray-700">
                            3 Nights | Deluxe Room w/ Balcony
                          </p>
                          <img
                            src="https://images.pexels.com/photos/136721/pexels-photo-136721.jpeg"
                            alt="Resort Room"
                            className="mt-3 w-full h-48 object-cover rounded-lg"
                          />
                        </div>
                      </section>

                      {/* Day 2 */}
                      <section className="mb-8">
                        <h3 className="text-lg font-bold text-gray-800">
                          Day 2: Water Sports Activity
                        </h3>
                        <div className="mt-4 border p-5 rounded-lg bg-gray-50">
                          <h4 className="font-semibold">
                            Double Decker Boat Party with Water Sports
                          </h4>
                          <p className="text-sm text-gray-700">
                            4 Hours | Includes water sports, lunch & transfers
                          </p>
                          <img
                            src="https://images.pexels.com/photos/326212/pexels-photo-326212.jpeg"
                            alt="Boat Party"
                            className="mt-3 w-full h-48 object-cover rounded-lg"
                          />
                        </div>
                      </section>

                      {/* Day 3 */}
                      <section className="mb-8">
                        <h3 className="text-lg font-bold text-gray-800">
                          Day 3: Leisure Day
                        </h3>
                        <p className="text-sm text-gray-700">
                          Enjoy resort amenities or add optional activities as
                          you like.
                        </p>
                      </section>

                      {/* Day 4 */}
                      <section>
                        <h3 className="text-lg font-bold text-gray-800">
                          Day 4: Departure
                        </h3>
                        <p className="text-sm text-red-600">
                          Note: Departure from Goa on your own.
                        </p>
                      </section>
                    </div>
                  )}
                  {selectedTab === "policies" && (
                    <div className="col-span-2  bg-white rounded-lg shadow p-8">
                      <div
                        className="border rounded-md p-2 cursor-pointer flex justify-between items-center"
                        onClick={() => setPoliciesOpen(!policiesOpen)}
                      >
                        <span>View Policies</span>
                        <span>
                          {policiesOpen ? (
                            <RiArrowUpSLine size={15} />
                          ) : (
                            <RiArrowDownSLine size={15} />
                          )}
                        </span>
                      </div>
                      {policiesOpen && (
                        <div className="mt-2 p-2 border rounded-md bg-gray-50">
                          {/* Actual policies content */}
                          <p>Policy 1: Lorem ipsum...</p>
                          <p>Policy 2: Lorem ipsum...</p>
                        </div>
                      )}
                    </div>
                  )}
                  {selectedTab === "summary" && (
                    <div className="col-span-2  bg-white rounded-lg shadow p-8">
                      {isLarge ? (
                        // Full content directly visible on large screens
                        <div className="p-2 border rounded-md bg-gray-50">
                          <p>
                            Summary content directly visible on large screens.
                          </p>
                        </div>
                      ) : (
                        // Dropdown wrapper on small screens
                        <div>
                          <div
                            className="border rounded-md p-2 cursor-pointer flex justify-between items-center"
                            onClick={() => setSummaryOpen(!summaryOpen)}
                          >
                            <span>View Summary</span>
                            <span>
                              {summaryOpen ? (
                                <AiOutlineUp size={15} />
                              ) : (
                                <AiOutlineDown size={15} />
                              )}
                            </span>
                          </div>
                          {summaryOpen && (
                            <div className="mt-2 p-2 border rounded-md bg-gray-50">
                              <p>
                                Summary content visible when dropdown opened.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <aside className="col-span-1 hidden md:block space-y-6">
                  <div className="bg-white sticky top-30 z-60 rounded-lg shadow p-6">
                    <p className="text-sm line-through text-gray-500">
                      ₹12,295
                    </p>
                    <p className="text-4xl font-bold text-green-600">
                      ₹8,550 <span className="text-base">/ Adult</span>
                    </p>
                    <button className="w-full mt-4 bg-gradient-to-r from-orange-400 to-pink-500 text-white py-3 rounded-lg font-semibold hover:opacity-90">
                      Proceed to Payment
                    </button>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="font-semibold text-gray-800 mb-3">
                      Coupons & Offers
                    </h3>
                    <div className="bg-gray-100 p-4 rounded-lg mb-2">
                      <p className="text-sm font-medium text-gray-800">
                        FREEDOMSALE
                      </p>
                      <p className="text-xs text-green-600">₹696 OFF applied</p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-800">
                        MMTHLD
                      </p>
                      <p className="text-xs text-green-600">
                        ₹161 OFF available
                      </p>
                    </div>
                  </div>
                </aside>
              </div>
            )}
          </div>
          <div className="bg-black fixed items-center  w-full  justify-between bottom-0 left-0 shadow p-4 lg:hidden md:hidden flex">
            <div className="flex flex-col">
              <p className="text-sm line-through text-gray-300">₹12,295</p>
              <p className="text-3xl font-bold text-white">₹8,550</p>
              <span className="text-gray-300">Per Person</span>
            </div>
            <button className="bg-gradient-to-r  from-orange-400 to-pink-500 text-white px-6 py-3 text-1xl font-bold rounded-xl shadow-lg hover:scale-105 transition">
              BOOK NOW
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
