import PackageCard from "@/components/PackageCard";
import Header from "../components/Header"
import Footer from "../components/Footer"
 
export default function HolidayPackagesPage() {
  return (
    <>
    <Header />
    <header class="bg-[#0B1523] text-white p-3 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
         
        <div class="flex-1 min-w-[110px] bg-[#1E2A38] px-3 py-1.5 rounded h-[54px] flex flex-col justify-center">
            <label class="block text-[9px] uppercase text-gray-400 tracking-wider font-medium">Trip Type</label>
            <div class="flex justify-between items-center mt-0.5 cursor-pointer">
                <span class="text-xs font-bold">One Way</span>
                <i class="fa-solid fa-chevron-down text-[10px] text-gray-400"></i>
            </div> 
        </div> 

        <div class="flex-[2.5] min-w-[320px] bg-[#1E2A38] rounded h-[54px] flex items-center relative px-4">
            <div class="flex-1 flex flex-col justify-center pr-4">
                <label class="block text-[9px] uppercase text-orange-500 tracking-wider font-bold">From</label>
                <div class="text-xs font-black mt-0.5 whitespace-nowrap text-white">New Delhi (DEL)</div>
            </div>
               
            <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center h-full">
                <div class="h-8 border-l border-gray-600/50 absolute"></div>
                <div class="bg-[#1E2A38] border border-gray-600 rounded-full w-5 h-5 flex items-center justify-center z-10 cursor-pointer text-gray-400 hover:text-white transition-colors">
                    <i class="fa-solid fa-arrows-left-right text-[9px]"></i>
                </div>
              </div>

            <div class="flex-1 flex flex-col justify-center pl-8">
                <label class="block text-[9px] uppercase text-orange-500 tracking-wider font-bold">To</label>
                <div class="text-xs font-black mt-0.5 whitespace-nowrap text-white">Leh (IXL)</div>
            </div>
        </div>

        <div class="flex-1 min-w-[140px] bg-[#1E2A38] px-3 py-1.5 rounded h-[54px] flex flex-col justify-center">
            <label class="block text-[9px] uppercase text-gray-400 tracking-wider font-medium">Departure</label>
            <div class="text-xs font-black mt-0.5 flex justify-between items-center whitespace-nowrap">
                <span>Thu, 2 Jul '26</span>
                <i class="fa-regular fa-calendar text-[11px] text-gray-400 ml-1"></i>
            </div>
        </div>   

        <div class="flex-1 min-w-[140px] bg-[#1E2A38] px-3 py-1.5 rounded h-[54px] flex flex-col justify-center opacity-60">
            <label class="block text-[9px] uppercase text-gray-400 tracking-wider font-medium">Return</label>
            <div class="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1 cursor-pointer whitespace-nowrap">
                <i class="fa-regular fa-calendar text-[10px]"></i> <span>Add return details</span>
            </div>
        </div>

        <div class="flex-1 min-w-[150px] bg-[#1E2A38] px-3 py-1.5 rounded h-[54px] flex flex-col justify-center">
            <label class="block text-[9px] uppercase text-gray-400 tracking-wider font-medium">Travellers & Class</label>
            <div class="flex justify-between items-center mt-0.5 cursor-pointer">
                <span class="text-xs font-black whitespace-nowrap">1 Pass, Economy</span>
                <i class="fa-solid fa-chevron-down text-[10px] text-gray-400"></i>
            </div>
        </div>

        <button class="bg-gradient-to-r from-[#0B1523] to-orange-500 text-white text-base rounded-tr-full rounded-br-full px-6 h-[54px] ml-1.5 rounded font-black uppercase tracking-wider hover:opacity-95 transition-all flex items-center justify-center shadow-md">
            Search
        </button>
        
    </div>
</header> 
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
