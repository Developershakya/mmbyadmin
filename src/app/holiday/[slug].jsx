"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams, usePathname, useSearchParams } from "next/navigation";
import { AiOutlineDown, AiOutlineUp } from "react-icons/ai";
import { FiArrowLeft } from "react-icons/fi";
import { RiShareForwardFill } from "react-icons/ri";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";
import Header from "@/components/Header";
import SearchBar from "../../components/SearchBar";
import Gallery from "../../components/Gallery";

const IMAGE_BASE = "https://makemybharatyatra.com/uploads/packages/";

function decodeHtmlEntities(html) {
  if (!html) return '';
  let decoded = html;
  // Double-encoded content ke liye 2 baar decode pass karo
  for (let i = 0; i < 2; i++) {
    decoded = decoded
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }
  return decoded;
}

export default function HolidayPage() {
  const [isLarge, setIsLarge] = useState(false);
  const [selectedTab, setSelectedTab] = useState("itinerary");
  const [itineraryOpen, setitineraryOpen] = useState(true);
  const [policiesOpen, setPoliciesOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const slug = params?.slug;

  const [pkg, setPkg] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [itinerary, setItinerary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;

    async function fetchPackage() {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`/api/holidays/${slug}`);
        const data = await res.json();
        if (!data.success) {
          setError(data.message || 'Package nahi mila.');
          return;
        }
        setPkg(data.package);
        setPhotos(data.photos || []);
        setItinerary(data.itinerary || []);
      } catch (err) {
        console.error('fetchPackage error:', err);
        setError('Package fetch nahi ho paaya.');
      } finally {
        setLoading(false);
      }
    }

    fetchPackage();
  }, [slug]);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: pkg?.package_name || "Check this out!",
          text: "Mujhe laga tumhe pasand aayega 👇",
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

  const handleBookNow = () => {
    sessionStorage.setItem('selectedHolidayPackage', JSON.stringify({
      packageName: pkg.package_name,
      slug,
      photo: pkg.photo,
      price: pkg.offer_price,
      duration: pkg.duration,
      location: pkg.location,
    }));
    router.push('/holiday/booking');
  };
  const toggleDropdown = (tab) => {
    if (tab === "itinerary") setitineraryOpen(!itineraryOpen);
    if (tab === "policies") setPoliciesOpen(!policiesOpen);
    if (tab === "summary") setSummaryOpen(!summaryOpen);
  };

  useEffect(() => {
    const handleResize = () => setIsLarge(window.innerWidth >= 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 font-semibold">
        Package load ho raha hai...
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-500 font-semibold gap-3">
        <p>{error || 'Package nahi mila.'}</p>
        <button onClick={() => router.push('/')} className="text-blue-600 underline text-sm">
          Home pe wapas jao
        </button>
      </div>
    );
  }

  // ⭐ Gallery ke liye real photos, Gallery component ka original {category, cover, photos} shape follow karte hue
  const galleryPhotos = photos.length > 0
    ? photos.map((p) => `${IMAGE_BASE}${p}`)
    : [`${IMAGE_BASE}${pkg.photo}`];

  const galleryData = [
    {
      category: "Package Photos",
      cover: galleryPhotos[0],
      photos: galleryPhotos,
    },
  ];

  // Grid mein dikhane ke liye pehli 4 images (kam hone par photo repeat/fallback)
  const gridImages = [
    galleryPhotos[0],
    galleryPhotos[1] || galleryPhotos[0],
    galleryPhotos[2] || galleryPhotos[0],
    galleryPhotos[3] || galleryPhotos[0],
  ];

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

        {isLarge && <SearchBar />}

        <div className="relative">
          <div
            className="h-[300px] w-full relative flex justify-center items-center bg-black"
            style={{
              backgroundImage: `url('${IMAGE_BASE}${pkg.photo}')`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
          >
            <div className="absolute inset-0 bg-black/40"></div>

            <div className="relative flex flex-col items-center justify-center text-center px-4">
              <h1 className="capitalize text-3xl font-semibold text-white mb-2">
                {pkg.package_name}
              </h1>
              <p className="text-lg text-gray-200 mb-1">{pkg.duration}</p>
              <p className="text-2xl font-extrabold text-orange-400 mb-4">
                ₹{Number(pkg.offer_price).toLocaleString('en-IN')} / Person
              </p>
              {/* <button className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-6 py-2 rounded-xl shadow-lg hover:scale-105 transition">
                Book Now
              </button> */}
            </div>
          </div>

          <div className="max-w-7xl mx-auto p-5 space-y-4">
            <div className="sticky top-15 space-y-3 z-60 bg-white">
              <h1 className="capitalize text-2xl md:text-3xl font-bold text-gray-900">
                {pkg.package_name}
              </h1>

              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="border sm:bg-[#26B5A9] sm:text-white px-2 py-1 rounded-sm text-xs font-medium">
                  {pkg.duration}
                </span>
                <span className="text-[#4A4A4A] font-bold">{pkg.location}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-[250px] rounded-xl">
              <div
                className="relative rounded-sm overflow-hidden cursor-pointer"
                onClick={() => setOpen(true)}
              >
                <img
                  className="absolute inset-0 w-full h-full object-cover"
                  src={gridImages[0]}
                  alt=""
                />
                <div className="absolute flex justify-around items-center bottom-3 left-5 text-white bg-black/70 p-2 rounded-lg border border-[#848483]">
                  VIEW GALLERY
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div
                  className="relative rounded-sm overflow-hidden cursor-pointer"
                  onClick={() => setOpen(true)}
                >
                  <img className="absolute inset-0 w-full h-full object-cover" src={gridImages[1]} alt="" />
                </div>

                <div className={`grid gap-3 ${isLarge ? "grid-rows-2" : "grid-cols-2"}`}>
                  <div
                    className="relative rounded-sm overflow-hidden cursor-pointer"
                    onClick={() => setOpen(true)}
                  >
                    <img className="absolute inset-0 w-full h-full object-cover" src={gridImages[2]} alt="" />
                  </div>
                  <div
                    className="relative rounded-sm overflow-hidden cursor-pointer"
                    onClick={() => setOpen(true)}
                  >
                    <img className="absolute inset-0 w-full h-full object-cover" src={gridImages[3]} alt="" />
                  </div>
                </div>
              </div>
            </div>

            {open && <Gallery images={galleryData} onClose={() => setOpen(false)} />}
            {!isLarge && <SearchBar />}
          </div>

          <div className={`py-6 ${isLarge ? "md:mb-0 px-4" : "mb-24"}`}>
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
                      <div className="bg-gray-50 transition-all duration-300 ease-in-out">
                        {tab === "itinerary" && (
                          <ItineraryContent itinerary={itinerary} imageBase={IMAGE_BASE} />
                        )}
                        {tab === "policies" && (
                          <div className="bg-white shadow p-8 text-sm text-gray-700 leading-relaxed">
                            <div dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(pkg.policy || pkg.terms || 'Policy details available soon.') }} />
                          </div>
                        )}
                        {tab === "summary" && (
                          <div className="bg-white shadow p-8 text-sm text-gray-700 leading-relaxed">
                            <div dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(pkg.description || pkg.short_description || '') }} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {isLarge && (
              <div className="max-w-7xl mx-auto mt-6 mb-24 md:mb-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-2 bg-white rounded-lg shadow p-8">
                  {selectedTab === "itinerary" && (
                    <ItineraryContent itinerary={itinerary} imageBase={IMAGE_BASE} />
                  )}

                  {selectedTab === "policies" && (
                    <div className="text-sm text-gray-700 leading-relaxed">
                      <h2 className="text-2xl font-semibold mb-4">Cancellation & Policies</h2>
                      <div dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(pkg.policy || pkg.terms || 'Policy details available soon.') }} />
                    </div>
                  )}

                  {selectedTab === "summary" && (
                    <div className="text-sm text-gray-700 leading-relaxed">
                      <h2 className="text-2xl font-semibold mb-4">Package Summary</h2>
                      <div dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(pkg.description || pkg.short_description || '') }} />
                    </div>
                  )}
                </div>

                <aside className="col-span-1 hidden md:block space-y-6">
                  <div className="bg-white sticky top-30 z-60 rounded-lg shadow p-6">
                    {pkg.ragular_price && Number(pkg.ragular_price) > Number(pkg.offer_price) && (
                      <p className="text-sm line-through text-gray-500">
                        ₹{Number(pkg.ragular_price).toLocaleString('en-IN')}
                      </p>
                    )}
                    <p className="text-4xl font-bold text-green-600">
                      ₹{Number(pkg.offer_price).toLocaleString('en-IN')} <span className="text-base">/ Adult</span>
                    </p>
<button onClick={handleBookNow} className="w-full mt-4 bg-gradient-to-r from-orange-400 to-pink-500 text-white py-3 rounded-lg font-semibold hover:opacity-90">
  Proceed to Payment
</button>
                  </div>
                </aside>
              </div>
            )}
          </div>

          <div className="bg-black fixed items-center w-full justify-between bottom-0 left-0 shadow p-4 lg:hidden md:hidden flex">
            <div className="flex flex-col">
              {pkg.ragular_price && Number(pkg.ragular_price) > Number(pkg.offer_price) && (
                <p className="text-sm line-through text-gray-300">
                  ₹{Number(pkg.ragular_price).toLocaleString('en-IN')}
                </p>
              )}
              <p className="text-3xl font-bold text-white">₹{Number(pkg.offer_price).toLocaleString('en-IN')}</p>
              <span className="text-gray-300">Per Person</span>
            </div>
            {/* <button className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-6 py-3 text-1xl font-bold rounded-xl shadow-lg hover:scale-105 transition">
              BOOK NOW
            </button> */}
          </div>
        </div>
      </div>
    </>
  );
}

// ⭐ Real itinerary table se day-wise content dikhata hai
function ItineraryContent({ itinerary, imageBase }) {
  if (!itinerary || itinerary.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-sm text-gray-500">
      The itinerary for this package is not available yet.
      </div>
    );
  }

  return (
    <div className="col-span-2 bg-white rounded-lg shadow p-8">
      <h2 className="text-2xl font-semibold mb-6">{itinerary.length} Day Plan</h2>

      {itinerary.map((day, idx) => (
        <section key={idx} className="mb-8 last:mb-0">
          <h3 className="text-lg font-bold text-gray-800">
            Day {day.day_number}: {day.title}
          </h3>
          <div
            className="text-sm text-gray-700 mt-2 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(day.description) }}
          />
          {day.image && (
            <img
              src={`${imageBase}${day.image}`}
              alt={day.title}
              className="mt-3 w-full h-48 object-cover rounded-lg"
            />
          )}
        </section>
      ))}
    </div>
  );
}