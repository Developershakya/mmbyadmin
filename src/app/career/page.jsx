import Image from 'next/image';
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import Header from '@/components/Header';
import Footer from '@/components/Footer';


const jobListings = [
  {
    title: "TOURISM MANAGER",
    image: "/images/tourism-manager-img.webp",
    reverse: false,
    description: `Join Make My Bharat Yatra as our Tourism Manager to become the leader who develops exceptional travel experiences. Managers in tourist operations maintain full responsibility for every aspect of operational activities including itinerary management and client satisfaction in this position. As part of Make My Bharat Yatra, we want you to fulfill client dreams through your organizational skills while focusing on travel excellence and customer satisfaction.`,
  },
  {
    title: "TOURISM EXECUTIVE",
    image: "/images/tourism-executive.jpg",
    reverse: true,
    description: `The Make My Bharat Yatra Tourism Executive role allows you to develop extraordinary tours and travels experiences for our customer base. Our energetic workplace welcomes prospective colleagues who want to experience growth and opportunities for making a sustainable impact while embracing the vibrant tourism industry.`,
  },
  {
    title: "CUSTOMER SERVICE ASSOCIATE",
    image: "/images/Customer-Service-Associate-Jobs.jpg",
    reverse: false,
    description: `The travel industry offers a fulfilling career opportunity to Customer Support Associates through Make My Bharat Yatra. Our customer support team delivers outstanding assistance to customers by handling queries and resolving problems to offer them perfect travel experiences. The job offers exciting workplace conditions with developmental prospects together with a meaningful impact on customer travel experiences.`,
  },
  {
    title: "TOUR AGENT",
    image: "/images/tour-agent.jpg",
    reverse: true,
    description: `Joining Make My Bharat Yatra as a tour agent opens up enriching prospects in the travel industry. Your team responsibilities at Make My Bharat Yatra include booking management alongside itinerary organization and maintaining travelers exceptional service quality. A career at Make My Bharat Yatra as a tour agent offers you both career growth possibilities and supportive colleagues while providing generous welfare plans.`,
  },
  {
    title: "TICKET SERVICE EXECUTIVE",
    image: "/images/ticket-service.jpg",
    reverse: false,
    description: `Become a Ticket Support Executive at Make My Bharat Yatra and deliver world-class customer service! Help travelers with questions, resolve problems, and make travel a breeze. Join a high-energy team that's passionate about crafting unforgettable experiences while learning valuable skills and experiencing growth. If you love travel and customer care, this is your opportunity to make a difference.`,
  },
  {
    title: "PASSENGER SERVICE ASSOCIATE",
    image: "/images/passenger-service.webp",
    reverse: true,
    description: `Join as a Passenger Service Associate on Make My Bharat Yatra and start a rewarding career with us in the travel industry! Assist passengers' travel needs, deliver exceptional customer service, and make travel hassle-free. Expect opportunities to grow, a warm and supportive team, and the chance to make memories with travelers. Be part of a dynamic team who strives to make every journey outstanding.`,
  },
  {
    title: "SALES EXECUTIVE/MANAGER",
    image: "/images/sales-executive-manager.jpg",
    reverse: false,
    description: `Join Make My Bharat Yatra as a Sales Executive/Manager and be a part of a thrilling experience in the travel sector! Your contribution will be instrumental in selling our varied travel products and services, assisting customers in creating memories to last a lifetime. Join a team that is passionate about what they do, learn continuously, and develop your career in a fast-paced environment.`,
  },
  {
    title: "RELATIONSHIP EXECUTIVE/MANAGER",
    image: "/images/relationship-manager-executive.webp",
    reverse: true,
    description: `Join Make My Bharat Yatra as a Relationship Executive/Manager! Foster and maintain strong customer relationships, offer personalized support, and deliver satisfaction. In this exciting role, you'll respond to queries, enrich customer experiences, and be an integral part of turning travel fantasies into reality. Join our dedicated team in the travel sector and start a fulfilling career path.`,
  },
];

export default function Career() {
    return(
        <>
          <Header />
         {/* Hero Section */}
   <div className="min-h-screen" style={{ backgroundImage: "url('/img/bg/map.png')" }}>
      {/* Hero Section */}
      <div className=" bg-blue-100 text-center">
      
      
      </div> 
       <section className="flex items-center justify-center h-64 bg-gradient-to-r from-orange-500 to-orange-600 text-white"> 

            <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <Badge>MakeMyBharatYatra</Badge>
              <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl uppercase tracking-tight mt-1">
                Career Opportunities
              </h1>
              <p className="mt-4 text-xl text-slate-50 max-w-2xl mx-auto">
                 Joining Bharat Yatra opens the door to an exciting career in the lively travel industry.
          Set off on a journey brimming with growth, learning, and adventure. Explore travel and tourism jobs!
              </p>
            </div>
          </div>
          </section>
         



       {/* <section className="flex items-center justify-center h-64 bg-gradient-to-r from-orange-500 to-orange-600 text-white"> 
        <h1 className="text-4xl md:text-5xl font-bold">Career Opportunities</h1>
      </section> */}

      {/* Intro */}
      

      {/* Job Listings */}
      <div className="space-y-16 px-4 max-w-7xl mx-auto m-8">
        {jobListings.map((job, index) => (
          <div
            key={index}
            className={`flex flex-col md:flex-row ${
              job.reverse ? "md:flex-row-reverse" : ""
            } items-center gap-8`}
          >
            <div className="md:w-1/2 w-full">
              <Image
                src={job.image}
                alt={job.title}
                width={700}
                height={500}
                className="rounded-lg object- w-full h-64 md:h-80"
              />
            </div>
            <div className="md:w-1/2 w-full bg-gray-800 text-white p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold mb-2">{job.title}</h3>
              <hr className="border-gray-600 mb-4" />
              <p className="text-sm text-gray-300 mb-6 leading-relaxed">{job.description}</p>
              <Link
                href=""
                className="inline-block bg-orange-500 hover:bg-orange-700 text-white px-6 py-2 rounded transition"
              >
                Apply Now
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
      <Footer />
        </>
    )
}