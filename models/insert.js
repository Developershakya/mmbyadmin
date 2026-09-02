import Package from "./Package.js"


const data = [
    {
      packageName: "Manali Package Trip",
      coverLocation: ["solang valley", "rohtang"],
      city: "Manali",
      state: "Himachal",
      totalPrice: 39000,
      offerPrice: 38000,
      hotel: ["manali luxury hotel"],
      foodType: ["Breakfast"],
      totalTransfer: 3,
      rating: "5",
      days: 4,
      tagType: "Best",
      coverImage: "https://i.ytimg.com/vi/7NKk41YVWyA/maxresdefault.jpg",
    },

    {
      packageName: "Manali Premium Adventure",
      coverLocation: ["kasol", "manikaran"],
      city: "Manali",
      state: "Himachal",
      totalPrice: 40000,
      offerPrice: 36000,
      hotel: ["mountain view resort"],
      foodType: ["Breakfast", "Lunch"],
      totalTransfer: 2,
      rating: "1",
      days: 5,
      tagType: "Popular",
      coverImage:
        "https://i.pinimg.com/736x/c4/1b/24/c41b245b832fffa9e3ea316f8bcec015.jpg",
    },
    {
      packageName: "Shimla & Kufri Explorer",
      coverLocation: ["mall road", "kufri"],
      city: "Shimla",
      state: "Himachal",
      totalPrice: 32000,
      offerPrice: 28000,
      hotel: ["shimla grand residency"],
      foodType: ["Breakfast", "Dinner"],
      totalTransfer: 4,
      rating: "4",
      days: 3,
      tagType: "Trending",
      coverImage:
        "https://i.pinimg.com/736x/61/76/11/617611ac168f92de98f485c0bcece2db.jpg",
    },
    {
      packageName: "Goa Beach Party Trip",
      coverLocation: ["baga beach", "calangute"],
      city: "North Goa",
      state: "Goa",
      totalPrice: 45000,
      offerPrice: 41000,
      hotel: ["goa beach resort"],
      foodType: ["Breakfast", "Lunch", "Dinner"],
      totalTransfer: 5,
      rating: "5",
      days: 6,
      tagType: "Best Seller",
      coverImage:
        "https://i.pinimg.com/1200x/f5/df/90/f5df90f664d65b29009c6e91cadd1f24.jpg",
    },
    {
      packageName: "Kerala Backwaters & Hills",
      coverLocation: ["munnar", "alleppey"],
      city: "Munnar",
      state: "Kerala",
      totalPrice: 50000,
      offerPrice: 46000,
      hotel: ["tea valley resort", "houseboat"],
      foodType: ["Breakfast", "Dinner"],
      totalTransfer: 3,
      rating: "5",
      days: 5,
      tagType: "Recommended",
      coverImage:
        "https://i.pinimg.com/736x/3a/48/77/3a4877acae3645a2199e34afe8fc14fc.jpg",
    },
  ]

async function insertPackage (){
    try{
        await Package.bulkCreate(data)
        console.log("all data inserted")
    }catch(error){
        console.log(error.message)
    }
}
insertPackage()