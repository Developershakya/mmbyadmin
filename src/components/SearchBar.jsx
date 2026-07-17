"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const BookingSearch = () => {
  const router = useRouter();
  const [startingFrom, setStartingFrom] = useState("New Delhi");
  const [travellingOn, setTravellingOn] = useState("Tue, 21 Oct 2025");
  const [roomsGuests, setRoomsGuests] = useState("2 Adults");
  const [isLarge, setIsLarge] = useState(false);
  const startingOptions = ["New Delhi", "Mumbai", "Bangalore", "Chennai"];
  const travellingOptions = [
    "Tue, 21 Oct 2025",
    "Wed, 22 Oct 2025",
    "Thu, 23 Oct 2025",
  ];
  const roomsOptions = ["1 Adult", "2 Adults", "3 Adults", "2 Adults, 1 Child"];

  const handleSearch = () => {
    // Holiday search - redirect to search page
    const encodedDestination = encodeURIComponent(startingFrom);
    const encodedDate = encodeURIComponent(travellingOn);
    const encodedGuests = encodeURIComponent(roomsGuests);
    
    router.push(
      `/holiday/search?destination=${encodedDestination}&startDate=${encodedDate}&guests=${encodedGuests}`
    );
  };
  useEffect(() => {
    const handleResize = () => setIsLarge(window.innerWidth >= 640); // lg breakpoint = 1024px
    handleResize(); // initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
<div
  className={`flex ${
    isLarge
      ? "bg-[#1E2A38] items-center gap-3 p-4"
      : "border-blue-300 border-2 rounded-full py-2 max-w-xs mx-auto"
  }`}
>

      {/* Starting From */}
      <div className="flex  gap-3 md:gap-4 items-center mx-auto max-w-7xl">
        <div
          className={`relative ${
            isLarge
              ? "bg-[#475566]  flex flex-col py-1 rounded-sm pl-2 md:space-x-16 space-y-1"
              : ""
          }   space-x-8  `}
        >
          <label
            className={` ${
              isLarge ? "block" : "hidden"
            }  text-xs text-orange-400 font-semibold `}
          >
            STARTING FROM
          </label>

          <div className={` ${ isLarge ? "text-white " : "text-gray-500 text-xs"}  font-semibold `}>
            New Delhi
          </div>
        </div>
  {!isLarge && <div className="w-1 h-1 bg-orange-400 rounded-full"></div>}
        {/* Travelling On */}

        <div
          className={`relative ${
            isLarge
              ? "bg-[#475566]  flex flex-col py-1 rounded-sm pl-2 md:space-x-16 space-y-1"
              : ""
          }   space-x-8  `}
        >
          <label
            className={` ${
              isLarge ? "black" : "hidden"
            }  text-xs text-orange-400 font-semibold `}
          >
            TRAVELLING ON
          </label>
           <div className={` ${ isLarge ? "text-white " : "text-gray-500 text-xs"}  font-semibold `}>
            2, OCT 2025
          </div>
        </div>
  {!isLarge && <div className="w-1 h-1 bg-orange-400 rounded-full"></div>}
        {/* Rooms & Guests */}
        <div
          className={`relative ${
            isLarge
              ? "bg-[#475566]  flex flex-col py-1 rounded-sm pl-2 md:space-x-16 space-y-1"
              : ""
          }   space-x-8  `}
        >
          <label
            className={` ${
              isLarge ? "black" : "hidden"
            }  text-xs text-orange-400 font-semibold `}
          >
            Rooms & Guests
          </label>
          <div className={` ${ isLarge ? "text-white " : "text-gray-500 text-xs"}  font-semibold `}>
            2 Adults
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className={` ${
            isLarge
              ? " bg-gradient-to-r from-[#1E2A38]-400 to-orange-500 text-white text-2xl rounded-tr-full rounded-br-full px-6 py-2 ml-4  rounded "
              : "text-sm text-blue-600"
          }  font-semibold cursor-pointer `}
        >
          {isLarge ? "SEARCH" : "Modify"}
        </button>
      </div>
    </div>
  );
};

export default BookingSearch;
