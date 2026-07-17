"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import { FiArrowLeft } from "react-icons/fi";
import { RiShareForwardFill } from "react-icons/ri";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";

export default function HolidayDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [holiday, setHoliday] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTab, setSelectedTab] = useState("itinerary");
  const [isLarge, setIsLarge] = useState(false);
  const [open, setOpen] = useState(false);
  const [itineraryOpen, setItineraryOpen] = useState(true);
  const [policiesOpen, setPoliciesOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  // Fetch holiday data from database
  useEffect(() => {
    if (!id) return;

    async function fetchHolidayData() {
      try {
        setLoading(true);
        setError('');

        const res = await fetch(`/api/holiday/${id}`);

        if (!res.ok) {
          throw new Error('Holiday data fetch nahi ho paya');
        }

        const data = await res.json();

        if (!data.success) {
          setError(data.message || 'Holiday data fetch nahi ho paya');
          return;
        }

        setHoliday(data.result);
      } catch (err) {
        console.error('fetchHolidayData error:', err);
        setError('Holiday details load nahi ho paaye. Baad me try karo.');
      } finally {
        setLoading(false);
      }
    }

    fetchHolidayData();
  }, [id]);

  useEffect(() => {
    const handleResize = () => setIsLarge(window.innerWidth >= 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${router.asPath}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: holiday?.title,
          text: "Check this amazing holiday package!",
          url: shareUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Link copied: " + shareUrl);
    }
  };

  const toggleDropdown = (tab) => {
    if (tab === "itinerary") setItineraryOpen(!itineraryOpen);
    if (tab === "policies") setPoliciesOpen(!policiesOpen);
    if (tab === "summary") setSummaryOpen(!summaryOpen);
  };

  if (loading) {
    return (
      <div className="bg-[#F4F6F9] min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Holiday details ko load kar rahe hain...</p>
      </div>
    );
  }

  if (error || !holiday) {
    return (
      <div className="bg-[#F4F6F9] min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-red-600">{error || 'Holiday nahi mila'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`${open ? "fixed inset-0 overflow-hidden" : ""}`}>
        {isLarge ? (
          <Header />
        ) : (
          <button onClick={() => router.back()} className="flex items-center p-3">
            <FiArrowLeft className="text-gray-500 text-2xl" />
          </button>
        )}

        {/* Hero Image */}
        <div className="relative">
          <div
            className="h-[300px] w-full relative flex justify-center items-center bg-black"
            style={{
              backgroundImage: `url('${holiday.image}')`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
          >
            <div className="absolute inset-0 bg-black/40"></div>

            <div className="relative flex flex-col items-center justify-center text-center">
              <h1 className="capitalize text-3xl font-semibold text-white mb-2">
                {holiday.title}
              </h1>
              <p className="text-lg text-gray-200 mb-1">{holiday.duration}</p>
              <p className="text-2xl font-extrabold text-orange-400 mb-4">
                ₹{Number(holiday.price).toLocaleString()} / Person
              </p>
              <button className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-6 py-2 rounded-xl shadow-lg hover:scale-105 transition">
                Book Now
              </button>
            </div>
          </div>

          <div className="max-w-7xl mx-auto p-5 space-y-4">
            {/* Title Section */}
            <div className="sticky top-15 space-y-3 z-60 bg-white">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {holiday.title}
              </h1>

              <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
                {holiday.duration && (
                  <span className="border sm:bg-[#26B5A9] sm:text-white px-2 py-1 rounded-sm text-xs font-medium">
                    {holiday.duration}
                  </span>
                )}
                {holiday.category && (
                  <span className="border sm:bg-black sm:text-white px-2 py-1 rounded-sm text-xs font-medium capitalize">
                    {holiday.category}
                  </span>
                )}
                {holiday.difficulty && (
                  <span className="border sm:bg-black sm:text-white px-2 py-1 rounded-sm text-xs font-medium">
                    {holiday.difficulty}
                  </span>
                )}
                <span className="text-[#4A4A4A] font-bold">{holiday.destination}</span>
              </div>

              {holiday.rating && (
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500 text-lg">★ {holiday.rating}</span>
                  <span className="text-gray-600 text-sm">({holiday.reviewCount} reviews)</span>
                </div>
              )}
            </div>

            {/* Gallery */}
            {holiday.images && holiday.images.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-[250px] rounded-xl">
                <div
                  className="relative rounded-sm overflow-hidden cursor-pointer"
                  onClick={() => setOpen(true)}
                >
                  <img
                    className="absolute inset-0 w-full h-full object-cover"
                    src={holiday.images[0]}
                    alt="Gallery"
                  />
                  <div className="absolute flex justify-around items-center bottom-3 left-5 text-white bg-black/70 p-2 rounded-lg border border-[#848483]">
                    VIEW GALLERY ({holiday.images.length} photos)
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {holiday.images.slice(1, 4).map((img, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-sm overflow-hidden cursor-pointer"
                      onClick={() => setOpen(true)}
                    >
                      <img
                        className="absolute inset-0 w-full h-full object-cover"
                        src={img}
                        alt={`Gallery ${idx + 2}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="py-6">
            {isLarge ? (
              <div className="max-w-7xl sticky top-15 z-50 mx-auto flex justify-between bg-white p-4 shadow-md rounded-t-lg -mt-2">
                <div className="w-full flex space-x-8">
                  {["itinerary", "policies", "summary"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSelectedTab(tab)}
                      className={`font-semibold md:text-xl cursor-pointer hover:text-blue-600 transition-all pb-1 ${
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
                        (tab === "itinerary" && itineraryOpen) ? (
                          <RiArrowUpSLine size={15} />
                        ) : (
                          <RiArrowDownSLine size={15} />
                        )}
                      </span>
                    </div>

                    {((tab === "itinerary" && itineraryOpen) ||
                      (tab === "policies" && policiesOpen) ||
                      (tab === "summary" && summaryOpen)) && (
                      <div className="px-4 py-6">
                        {tab === "itinerary" && (
                          <div className="col-span-2 bg-white rounded-lg shadow p-8">
                            {holiday.itinerary && Array.isArray(holiday.itinerary) ? (
                              holiday.itinerary.map((day, idx) => (
                                <section key={idx} className="mb-8">
                                  <h3 className="text-lg font-bold text-gray-800">
                                    Day {day.day}: {day.title}
                                  </h3>
                                  {day.activities && Array.isArray(day.activities) && (
                                    <ul className="mt-4 space-y-2">
                                      {day.activities.map((activity, actIdx) => (
                                        <li key={actIdx} className="text-sm text-gray-700 flex items-start gap-2">
                                          <span className="text-orange-500 mt-1">•</span>
                                          <span>{activity}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </section>
                              ))
                            ) : (
                              <p>Itinerary coming soon</p>
                            )}
                          </div>
                        )}

                        {tab === "policies" && (
                          <div className="bg-white rounded-lg shadow p-8">
                            <h3 className="font-semibold text-lg mb-4">Cancellation & Policies</h3>
                            <p className="text-sm text-gray-700 mb-4">{holiday.cancellationPolicy || 'Policy details coming soon'}</p>
                            
                            {holiday.inclusions && (
                              <div className="mb-6">
                                <h4 className="font-semibold text-gray-800 mb-2">Inclusions:</h4>
                                <ul className="space-y-1">
                                  {holiday.inclusions.map((item, idx) => (
                                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                      <span className="text-green-500">✓</span>
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {holiday.exclusions && (
                              <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Exclusions:</h4>
                                <ul className="space-y-1">
                                  {holiday.exclusions.map((item, idx) => (
                                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                      <span className="text-red-500">✗</span>
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {tab === "summary" && (
                          <div className="bg-white rounded-lg shadow p-8">
                            <h3 className="font-semibold text-lg mb-4">Summary</h3>
                            <div className="space-y-3 text-sm text-gray-700">
                              <p><strong>Destination:</strong> {holiday.destination}</p>
                              <p><strong>Duration:</strong> {holiday.duration}</p>
                              <p><strong>Category:</strong> {holiday.category}</p>
                              <p><strong>Difficulty:</strong> {holiday.difficulty}</p>
                              <p><strong>Best Time to Visit:</strong> {holiday.bestTimeToVisit}</p>
                              <p><strong>Max Group Size:</strong> {holiday.maxGroupSize} people</p>
                              <p><strong>Description:</strong> {holiday.description}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Main Content for Desktop */}
            {isLarge && (
              <div className="max-w-7xl mx-auto mt-6 mb-24 md:mb-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Content */}
                <div className="col-span-2">
                  {selectedTab === "itinerary" && (
                    <div className="bg-white rounded-lg shadow p-8">
                      {holiday.itinerary && Array.isArray(holiday.itinerary) ? (
                        holiday.itinerary.map((day, idx) => (
                          <section key={idx} className="mb-8">
                            <h3 className="text-lg font-bold text-gray-800">
                              Day {day.day}: {day.title}
                            </h3>
                            {day.activities && Array.isArray(day.activities) && (
                              <ul className="mt-4 space-y-2">
                                {day.activities.map((activity, actIdx) => (
                                  <li key={actIdx} className="text-sm text-gray-700 flex items-start gap-2">
                                    <span className="text-orange-500 mt-1">•</span>
                                    <span>{activity}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </section>
                        ))
                      ) : (
                        <p>Itinerary coming soon</p>
                      )}
                    </div>
                  )}

                  {selectedTab === "policies" && (
                    <div className="bg-white rounded-lg shadow p-8">
                      <h3 className="font-semibold text-lg mb-4">Cancellation & Policies</h3>
                      <p className="text-sm text-gray-700 mb-4">{holiday.cancellationPolicy || 'Policy details coming soon'}</p>
                      
                      {holiday.inclusions && (
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-800 mb-2">Inclusions:</h4>
                          <ul className="space-y-1">
                            {holiday.inclusions.map((item, idx) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-green-500">✓</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {holiday.exclusions && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Exclusions:</h4>
                          <ul className="space-y-1">
                            {holiday.exclusions.map((item, idx) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-red-500">✗</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedTab === "summary" && (
                    <div className="bg-white rounded-lg shadow p-8">
                      <h3 className="font-semibold text-lg mb-4">Summary</h3>
                      <div className="space-y-3 text-sm text-gray-700">
                        <p><strong>Destination:</strong> {holiday.destination}</p>
                        <p><strong>Duration:</strong> {holiday.duration}</p>
                        <p><strong>Category:</strong> {holiday.category}</p>
                        <p><strong>Difficulty:</strong> {holiday.difficulty}</p>
                        <p><strong>Best Time to Visit:</strong> {holiday.bestTimeToVisit}</p>
                        <p><strong>Max Group Size:</strong> {holiday.maxGroupSize} people</p>
                        <p><strong>Description:</strong> {holiday.description}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <aside className="col-span-1 hidden md:block space-y-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    {holiday.originalPrice && (
                      <p className="text-sm line-through text-gray-500">
                        ₹{Number(holiday.originalPrice).toLocaleString()}
                      </p>
                    )}
                    <p className="text-4xl font-bold text-green-600">
                      ₹{Number(holiday.price).toLocaleString()}
                      <span className="text-base text-gray-600"> / Person</span>
                    </p>
                    {holiday.discount > 0 && (
                      <p className="text-sm text-green-600 font-semibold mt-1">{holiday.discount}% OFF</p>
                    )}
                    <button className="w-full mt-4 bg-gradient-to-r from-orange-400 to-pink-500 text-white py-3 rounded-lg font-semibold hover:opacity-90">
                      Proceed to Payment
                    </button>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="font-semibold text-gray-800 mb-3">Package Details</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>📍 Destination: {holiday.destination}</p>
                      <p>⏱️ Duration: {holiday.duration}</p>
                      <p>🎯 Category: {holiday.category}</p>
                      <p>⭐ Rating: {holiday.rating}</p>
                    </div>
                  </div>
                </aside>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
