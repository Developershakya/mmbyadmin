import Header from "../components/Header"
import HeroSection from "../components/HeroSection"
import PopularDestinations from "../components/PopularDestinations"
import TravelOffers from "../components/TravelPackages"
import Footer from "../components/Footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50" style={{ backgroundImage: "url('')" }} >
      <Header />
      <HeroSection />  
      <PopularDestinations />
      <TravelOffers />
      <Footer />
    </div>
  )
}