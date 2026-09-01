"use client";
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CountUp from 'react-countup';
import {
  Users,
  Target,
  Heart,
  Zap,
  Award,
  Globe,
  Star,
  ArrowRight,
  CheckCircle,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const companyValues = [
  {
    icon: <Heart className="h-12 w-12 text-red-500" />,
    title: "Customer First",
    description:
      "We put our customers at the center of everything we do, ensuring their success is our success.",
    gradient: "from-red-100 to-pink-100",
  },
  {
    icon: <Zap className="h-12 w-12 text-yellow-500" />,
    title: "Innovation",
    description:
      "We constantly push boundaries and embrace new technologies to deliver cutting-edge solutions.",
    gradient: "from-yellow-100 to-amber-100",
  },
  {
    icon: <Users className="h-12 w-12 text-blue-500" />,
    title: "Collaboration",
    description:
      "We believe in the power of teamwork and foster an inclusive environment where everyone thrives.",
    gradient: "from-blue-100 to-indigo-100",
  },
  {
    icon: <Award className="h-12 w-12 text-purple-500" />,
    title: "Excellence",
    description:
      "We maintain the highest standards in everything we deliver, from products to customer service.",
    gradient: "from-purple-100 to-violet-100",
  },
];

const achievements = [
  {
    icon: <CheckCircle className="h-6 w-6 text-green-500" />,
    text: "ISO 9001:2015 Certified",
  },
  {
    icon: <CheckCircle className="h-6 w-6 text-green-500" />,
    text: "Award-winning customer service",
  },
  {
    icon: <CheckCircle className="h-6 w-6 text-green-500" />,
    text: "24/7 travel support",
  },
  {
    icon: <CheckCircle className="h-6 w-6 text-green-500" />,
    text: "Sustainable tourism advocate",
  },
];

// Slide-in animation function
const fadeIn = (direction, delay) => {
  return {
    hidden: {
      opacity: 0,
      x: direction === "left" ? -100 : direction === "right" ? 100 : 0,
      y: 0,
    },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        delay: delay,
        ease: "easeOut",
      },
    },
  };
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-orange-500 via-white to-orange-500 text-justify">
        {/* Enhanced Hero Section with Floating Elements */}
        <section className="relative py-21 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/img/bg/breadcumb-bg.jpg"
              alt="Background"
              fill
              className="object-cover brightness-[0.3]"
            />
            {/* Animated floating elements */}
            <div className="absolute top-20 left-10 w-20 h-20 bg-orange-400/20 rounded-full animate-pulse"></div>
            <div className="absolute top-40 right-20 w-16 h-16 bg-red-400/20 rounded-full animate-bounce"></div>
            <div className="absolute bottom-20 left-20 w-24 h-24 bg-yellow-400/20 rounded-full animate-pulse"></div>
          </div>

          <div className="relative max-w-6xl mx-auto text-center text-white z-10">
            <div className="animate-fade-in-up">
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-none px-6 py-2 text-sm font-semibold mb-8 animate-pulse">
                🌟 MakeMyBharatYatra
              </Badge>

              <h1 className="text-2xl sm:text-xl md:text-5xl lg:text-7xl font-black uppercase tracking-wider mb-5 bg-gradient-to-r from-white via-orange-100 to-white bg-clip-text text-transparent leading-tight">
                About Our Company
              </h1>

              <p className="text-xl sm:text-2xl max-w-4xl mx-auto mb-8 leading-relaxed font-light">
                Since <span className="font-bold text-orange-300">2010</span>,
                we've been crafting unforgettable journeys with love, passion,
                and precision — bringing dreams to life through travel.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button
                  size="lg"
                  className="group bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded shadow-2xl px-8 py-4 font-semibold text-lg transform hover:scale-110 transition-all duration-300"
                >
                  <Link href="/contactUs" className="flex items-center gap-2">
                    Get in Touch
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm border-white/30 text-white rounded shadow-2xl px-8 py-4 font-semibold text-lg hover:bg-white hover:text-orange-600 transform hover:scale-110 transition-all duration-300"
                >
                  <Link href="/career">Join Our Team</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </section>



  <section className="py-10 px-4 sm:px-6 lg:px-8 relative ">
      <div className="max-w-7xl mx-auto">
        <Card className="shadow-2xl hover:shadow-3xl transition-all duration-500 border-0 bg-gradient-to-br from-white to-orange-50/50 backdrop-blur-sm">
          <CardContent className="p-12">
            {/* Heading */}
            <motion.div
              variants={fadeIn("up", 0.1)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, amount: 0.3 }} // repeat on scroll
              className="text-center mb-16"
            >
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white mb-4">
                Our Expertise
              </Badge>
              <h2 className="text-5xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                What Makes Us Different
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto rounded-full"></div>
            </motion.div>

            {/* Grid */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left Column */}
              <div className="space-y-8">
                <motion.div
                  variants={fadeIn("left", 0.2)}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: false }}
                  className="flex items-start gap-4 p-6 bg-white/80 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="bg-gradient-to-br from-orange-500 to-red-500 p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-800 mb-2">
                      Tour and Travel Services
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                       We specialize in creating unique domestic and
                          international tour packages, whether you seek
                          serenity, adventure, or cultural exploration.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  variants={fadeIn("left", 0.4)}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: false }}
                  className="flex items-start gap-4 p-6 bg-white/80 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-3 rounded-full">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-800 mb-2">
                      Customized Itineraries
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      Every journey should be personal. We design custom
                      itineraries that align with your unique preferences.
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                <motion.div
                  variants={fadeIn("right", 0.6)}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: false }}
                  className="flex items-start gap-4 p-6 bg-white/80 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="bg-gradient-to-br from-green-500 to-teal-500 p-3 rounded-full">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-800 mb-2">
                      Local and Global Reach
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      Our extensive partnerships across India and worldwide
                          enable us to offer diverse travel options and
                          exclusive experiences that go beyond the ordinary.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  variants={fadeIn("right", 0.8)}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: false }}
                  className="flex items-start gap-4 p-6 bg-white/80 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-3 rounded-full">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-800 mb-2">
                      Registered Entity
                    </h3>
                   <p className="text-slate-600 leading-relaxed ">
                          Make My Bharat Yatra is a fully registered entity with
                          Domestic and International Airline Services and Travel
                          & Tourism certifications from NCT{" "}
                          <span className="font-semibold text-orange-600">
                            NATIONAL CAPITAL TERRITORY
                          </span>{" "}
                          Government of India since 2015,{" "}
                          <span className="font-semibold text-orange-600">
                            MSME
                          </span>{" "}
                          registration from 2018, and is officially registered
                          under the MCA{" "}
                          <span className="font-semibold text-orange-600 uppercase">
                            Ministry of Corporate Affairs
                          </span>{" "}
                          with CIN{" "}
                          <span className="font-semibold text-orange-600">
                            U79110UP2024PTC208828
                          </span>{" "}
                          as of 2024 , ensuring credibility and excellence.
                        </p>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Achievements */}
            <motion.div
              variants={fadeIn("up", 1)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: false }}
              className="mt-16 p-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl"
            >
              <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">
                Our Achievements
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={index}
                    variants={fadeIn("up", 1.1 + index * 0.2)}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: false }}
                    className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    {achievement.icon}
                    <span className="text-gray-700 font-medium text-sm">
                      {achievement.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </section>

    
        {/* Enhanced Mission & Vision with Improved Layout */}
        <section className="p-5 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 via-white to-red-50 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-200/30 to-transparent rounded-full -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-red-200/30 to-transparent rounded-full -ml-48 -mb-48"></div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-10">
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white mb-4">
                Mission & Vision
              </Badge>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                Our Purpose & Direction
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto rounded-full"></div>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-stretch">
              {/* Mission */}
              <Card className="group shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-500 border-0 bg-gradient-to-br from-white to-orange-50 overflow-hidden">
                <CardContent className="p-10 text-center h-full flex flex-col">
                  <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="bg-gradient-to-br from-orange-500 to-red-500 p-4 rounded-2xl group-hover:rotate-12 transition-transform duration-500">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      Our Mission
                    </h3>
                  </div>
                  <p className="text-lg text-slate-700 mb-8 leading-relaxed flex-grow">
                    To enhance usability, expand offerings, and deliver
                    personalized travel experiences. We aim to engage customers,
                    partner with local gems, and build trust across India.
                  </p>
                  <div className="relative h-80 rounded-2xl overflow-hidden shadow-xl group-hover:shadow-2xl transition-shadow duration-500">
                    <Image
                      src="/images/mission.jfif"
                      alt="Mission"
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-orange-900/50 to-transparent"></div>
                  </div>
                </CardContent>
              </Card>

              {/* Vision */}
              <Card className="group shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-500 border-0 bg-gradient-to-br from-white to-green-50 overflow-hidden">
                <CardContent className="p-10 text-center h-full flex flex-col">
                  <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-4 rounded-2xl group-hover:rotate-12 transition-transform duration-500">
                      <Globe className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      Our Vision
                    </h3>
                  </div>
                  <p className="text-lg text-slate-700 mb-8 leading-relaxed flex-grow">
                    To become India's leading travel platform, promoting
                    sustainable tourism, connecting travelers globally, and
                    offering innovative, effortless, and memorable experiences.
                  </p>
                  <div className="relative h-80 rounded-2xl overflow-hidden shadow-xl group-hover:shadow-2xl transition-shadow duration-500">
                    <Image
                      src="/images/vision1.jpg"
                      alt="Vision"
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-green-900/50 to-transparent"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Enhanced Values Section with Modern Cards */}
        <section className="p-8 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-100 via-white to-red-100 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white mb-4">
                Our Values
              </Badge>
              <h2 className="text-4xl font-bold mb- bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Core Values That Drive Us
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Principles that guide every decision and solution at Make My
                Bharat Yatra.
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto rounded-full mt-5"></div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {companyValues.map((value, index) => (
                <Card
                  key={index}
                  className={`group text-center shadow-xl hover:shadow-3xl hover:-translate-y-4 transition-all duration-500 border-0 bg-gradient-to-br ${value.gradient} backdrop-blur-sm overflow-hidden relative`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="p-8 relative z-10">
                    <div className="flex justify-center mb-6 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                      {value.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-800 group-hover:text-gray-900 transition-colors">
                      {value.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Stats Section with Animated Counters */}
        <section className="p-8 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 text-white relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/pattern.png')] opacity-10"></div>
            <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-24 h-24 bg-white/10 rounded-full animate-bounce"></div>
          </div>

          <div className=" ">
            <div className="text-center mb-4">
              <h2 className="text-4xl font-bold mb-4">Our Impact in Numbers</h2>
              <p className="text-xl text-white/90">
                Achievements that speak for themselves
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8 text-center">
              {[
                { number: 500, label: "Happy Clients", icon: "😊" },
                { number: 50, label: "Team Members", icon: "👥" },
                { number: 1000, label: "Projects Completed", icon: "✅" },
                { number: 5, label: "Years of Excellence", icon: "⭐" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="group p-2 rounded-2xl bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 border border-white/20"
                >
                  <div className="text-xl mb-4 group-hover:animate-bounce">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-black mb-3 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
                    
                    <CountUp end={stat.number} duration={2} />+
                  </div>
                  <div className="text-white/90 font-semibold text-lg">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="py-2 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-yellow-400/20 to-transparent rounded-full -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-red-400/20 to-transparent rounded-full -ml-48 -mb-48"></div>
          </div>

          <div className=" mx-auto text-center mt-2 ">
            <Badge className="bg-white/20 text-white mb-3">
              Let's Work Together
            </Badge>
            <h2 className="text-2xl sm:text-xl font-black mb-2 leading-tight">
              Ready to Work Together?
            </h2>
            <p className="text-2xl mb-7 text-white/90 leading-relaxed max-w-3xl mx-auto">
              Let's bring your vision to life! Our team is excited to build
              unforgettable experiences with you.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                size="lg"
                className="group  text-orange-600 font-bold border border-white cursor-pointer rounded hover:bg-gray-100  text-xl shadow-2xl transform hover:scale-110 transition-all duration-300"
              >
                <Link href="/contactUs" className="flex items-center gap-2">
                  Start a Project
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-2 border-white text-white rounded  cursor-pointer hover:bg-white hover:text-orange-600  text-xl shadow-2xl transform hover:scale-110 transition-all duration-300 font-bold"
              >
                <Link href="/portfolio">View Our Work</Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-5 flex flex-wrap justify-center items-center gap-20 opacity-80">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="font-semibold">4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-semibold">100% Satisfaction</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-400" />
                <span className="font-semibold">Award Winning</span>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
