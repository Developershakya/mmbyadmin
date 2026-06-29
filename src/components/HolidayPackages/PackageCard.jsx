import Image from "next/image";
import { FaPhoneAlt } from "react-icons/fa";

export default function PackageCard({ item }) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative w-full h-55">
        <Image src={item.image} alt={item.title} fill
          className="object-cover" />
      </div>
      <div className="p-4">
        <h3 className="text-md font-semibold">
          {item.title}</h3>
        <p className="text-gray-500">
           {item.duration}</p>
        <div className="mt-5 bg-[#B3802F] text-white rounded-lg px-4 py-2 flex justify-between items-center">
          <span className="text-1xl font-bold">{item.price}</span>
         <button className="text-white flex items-center justify-center cursor-pointer hover:text-gray-200 transition-colors duration-300">
            <FaPhoneAlt size={18} />
        </button>
        </div>
      </div>
    </div>
  );
}