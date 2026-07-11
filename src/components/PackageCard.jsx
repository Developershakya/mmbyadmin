import Image from "next/image";
import { FaPhoneAlt } from "react-icons/fa";

const packages = [
  {
    id: 1,
    image: "/img/sikkim/sikkim-banner-i.webp",
    title: "Gangtok 6 Days 5 Nights Package",
    duration: "6 Days 5 Nights",
    price: "₹13,800",
  },
  {
    id: 2,
    image: "/img/sikkim/sikkim1.jpg",
    title: "Gangtok 4 Days 3 Nights Tour Package",
    duration: "4 Days 3 Nights",
    price: "₹4,400",
  },
  {
    id: 3,
    image: "/img/sikkim/sikkim3.jpg",
    title: "Sikkim 3 Days 2 Nights Tour Package",
    duration: "3 Days 2 Nights",
    price: "₹9,067",
  },
  {
    id: 4,
    image: "/img/sikkim/sikkim2.jpg",
    title: "Bhutan with Gangtok Tour Package",
    duration: "8 Days 7 Nights",
    price: "₹41,080",
  },
];

export default function PackageCard() {
  return (
    <>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {packages.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          <div className="relative w-full h-55">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover"
            />
          </div>

          <div className="p-4">
            <h3 className="text-md font-semibold">{item.title}</h3>

            <p className="text-gray-500">{item.duration}</p>

            <div className="mt-5 bg-[#B3802F] text-white rounded-lg px-4 py-2 flex justify-between items-center">
              <span className="text-lg font-bold">{item.price}</span>

              <button className="text-white hover:text-gray-200">
                <FaPhoneAlt size={18} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
    </>
  );
}