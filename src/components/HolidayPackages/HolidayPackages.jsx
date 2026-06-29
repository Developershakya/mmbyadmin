import PackageCard from "./PackageCard";

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
export default function HolidayPackages() {
  return (
    <section className="w-full px-10 py-10">
    {/* Main Heading */}
    <div className="text-center mb-5">
        <h2 className="text-2xl md:text-2xl font-bold text-[#B3802F]">
        Top Selling Holiday Packages </h2>
        <p className="mt-3 text-md text-gray-500">
        Experience Our Most Loved Journeys</p>
    </div>

    {/* Section Heading */}
    <div className="flex items-center gap-4 mb-8">
    <h3 className="text-1xl md:text-2xl font-bold text-[#B3802F] whitespace-nowrap">
        Best Seller Sikkim</h3>
        {/* Line */}
    <div className="flex-1 h-[2px] bg-gray-300"></div>
    </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map((item) => (
          <PackageCard key={item.id} item={item} />
        ))}
      </div>
      {/* Section Heading */}
    <div className="flex items-center gap-4 mt-20 mb-8">
    <h3 className="text-1xl md:text-2xl font-bold text-[#B3802F] whitespace-nowrap">
        Best Seller Himachal</h3>
        {/* Line */}
    <div className="flex-1 h-[2px] bg-gray-300"></div>
    </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map((item) => (
          <PackageCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}