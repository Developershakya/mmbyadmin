import { Cuboid, Dice1, Dice4, Search } from "lucide-react";
import Header from "../../components/Header";
import { RiBowlLine } from "react-icons/ri";
export default function Blog() {
  return (
    <>
      <Header />
      <div className=" relative py-12 bg-gradient-to-bl from-green-500 to-green-950">
        <div className="grid place-items-center py-4 mb-6">
          <h2 className="text-5xl font-semibold mb-4">
            Travel Stories & Guides
          </h2>
          <p className="text-white tracking-wider text-sm">
            Real journeys, travel tips & hidden gems across India.
          </p>
        </div>
        <div className=" max-w-xl bg-white border border-gray-100 px-4 py-2 shadow-md rounded-2xl flex justify-between  mx-auto mb-8 items-center">
          <div className="flex gap-2 items-center">
            <Search size={25} className="text-gray-400 " />
            <input
              type="text"
              className="outline-none"
              placeholder="search stories"
            />
          </div>
          <button className="bg-orange-600 font-semibold text-white px-4 py-2 rounded-xl">
            Search
          </button>
        </div>
        <div className=" min-w-5xl absolute flex gap-2 bg-white shadow-md p-6 bottom-0 left-[50%] transfrom -translate-x-[50%] translate-y-[70%]  justify-between rounded-xl">
          <button className="flex  flex-col items-center hover:bg-gray-100 px-4 py-2 rounded-xl transition-all duration-100">
            <RiBowlLine size={16} className="" />
            <span className="text-sm ">All</span>
          </button>
          <button className="flex  flex-col items-center hover:bg-green-100 p-2 rounded-xl transition-all duration-100">
            <RiBowlLine size={16} className="text-orange-600" />
            <span className="text-sm text-gray-600">Destinations</span>
          </button>
          <button className="flex  flex-col items-center hover:bg-green-100 p-2 rounded-xl transition-all duration-100">
            <RiBowlLine size={16} className="text-orange-600" />
            <span className="text-sm text-gray-600">Foods</span>
          </button>
          <button className="flex  flex-col items-center hover:bg-green-100 p-2 rounded-xl transition-all duration-100">
            <RiBowlLine size={16} className="text-orange-600" />
            <span className="text-sm text-gray-600">Travel Tips</span>
          </button>
          <button className="flex  flex-col items-center hover:bg-green-100 p-2 rounded-xl transition-all duration-100">
            <RiBowlLine size={16} className="text-orange-600" />
            <span className="text-sm text-gray-600">Adventures</span>
          </button>
          <button className="flex  flex-col items-center hover:bg-green-100 p-2 rounded-xl transition-all duration-100">
            <RiBowlLine size={16} className="text-orange-600" />
            <span className="text-sm text-gray-600">Foods</span>
          </button>
        </div>
      </div>
      <div>
        <div></div>
        <div>
          <div></div>
          <div></div>
        </div>
      </div>
    </>
  );
}
