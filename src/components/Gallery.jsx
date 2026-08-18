"use client";
import Masonry from "react-masonry-css";
import { useState } from "react";
import { RiCloseLine } from "react-icons/ri";
import { FiArrowLeft } from "react-icons/fi";
const breakpointColumnsObj = {
  default: 4,  // desktop
  1024: 3,     // tablet
  768: 2,      // small tablet 
  500: 1       // mobile
};

export default function Gallery({ images, onClose }) {
  const [selectedCategory, setSelectedCategory] = useState();
  const [fullImage, setFullImage] = useState(null);

  const currentImages =
    images.find((img) => img.category === selectedCategory)?.photos || [];

  return (
<div className="fixed inset-0 z-9990 bg-blue-50 bg-opacity-70 flex flex-col overflow-hidden">
  {/* Modal Header */}
  <div className="w-full flex sticky top-0 bg-white justify-between items-center mb-4 z-10">
    <button onClick={onClose} className="flex items-center p-3">
      <FiArrowLeft className="text-gray-500 text-2xl" />
    </button>
  </div>

  {/* Categories Scroll */}
  <div className="w-full max-w-7xl md:p-6 md:mb-4 my-scroll flex shadow-lg flex-nowrap gap-4 sticky top-16 z-10 overflow-x-auto">
    {images.map((img) => (
      <div
        key={img.category}
        className={`flex md:rounded-lg md:bg-white   md:border-2 overflow-hidden shrink-0 cursor-pointer ${
          selectedCategory === img.category
            ? "border-blue-500 border-b-4  "
            : "border-transparent"
        }`}
        onClick={() =>
          setSelectedCategory(
            selectedCategory === img.category ? null : img.category
          )
        }
      >
        <p className="px-2 text-sm flex py-1 flex-col">
          {img.category}
          <span className="text-gray-500">Photos ({img.photos.length})</span>
        </p>

        <div className="hidden md:block">
          <img
            src={img.cover}
            alt={img.category}
            className="w-20 h-17 object-cover"
          />
        </div>
      </div>
    ))}
  </div>

  {/* Images Grid */}
  <div className="w-full flex-1 p-6 my-scroll md:max-w-full mb-4 hide-scrollbar  border-gray-400 overflow-y-auto">
    {images
      .filter(
        (cat) => !selectedCategory || cat.category === selectedCategory
      )
      .map((category) => (
        <div key={category.category} className="mb-8 p-4 w-full">
          {/* Heading */}
          <h2 className="text-3xl font-semibold mb-4">{category.category}</h2>

          {/* Image Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
            {category.photos.map((photo, idx) => (
              <div
                key={idx}
                className="cursor-pointer w-full"
                onClick={() => setFullImage(photo)}
              >
                <img
                  src={photo}
                  alt={`Gallery ${idx}`}
                  className="w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
  </div>

  {/* Full Image Modal */}
  {fullImage && (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
      <button
        className="absolute top-4 right-4 text-white text-3xl"
        onClick={() => setFullImage(null)}
      >
        <RiCloseLine />
      </button>
      <img
        src={fullImage}
        alt="Full"
        className="max-h-full w-auto max-w-full object-contain"
      />
    </div>
  )}
</div>
 );
}