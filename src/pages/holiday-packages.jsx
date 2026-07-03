import PackageCard from "@/components/PackageCard";
import Header from "../components/Header"
import Footer from "../components/Footer"

export default function HolidayPackagesPage() {
  return (
    <>
    <Header />
    <section className="w-full px-10 py-10">
      <div className="text-center mb-5">
        <h2 className="text-2xl font-bold text-[#B3802F]">
          Top Selling Holiday Packages
        </h2>

        <p className="mt-3 text-gray-500">
          Experience Our Most Loved Journeys
        </p>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <h3 className="text-2xl font-bold text-[#B3802F]">
          Best Seller Sikkim
        </h3>

        <div className="flex-1 h-[2px] bg-gray-300"></div>
      </div>

      <PackageCard />

      <div className="flex items-center gap-4 mt-20 mb-8">
        <h3 className="text-2xl font-bold text-[#B3802F]">
          Best Seller Himachal
        </h3>

        <div className="flex-1 h-[2px] bg-gray-300"></div>
      </div>

      <PackageCard />
    </section>
      <Footer />
      </>
  );
}
