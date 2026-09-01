import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function ContactUsPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen" style={{ backgroundImage: "url('/img/bg/map.png')" }}> 
        {/* Header Section */}
        <div
          className=" "
          style={{ backgroundImage: "url('/img/hero/hero_bg_1_2.jpg')" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <Badge>MakeMyBharatYatra</Badge>
              <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl uppercase">
                Contact Us
              </h1>
              <p className="mt-4 text-xl text-slate-50 max-w-2xl mx-auto">
                We’d love to hear from you. Send us a message and we’ll respond
                as soon as possible.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Send us a message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we’ll get back to you within 24
                    hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> */}
                    <div className="space-y-2">
                      <Label htmlFor="name"> Name</Label>
                      <input
                      id="name"
                      type="text"
                      placeholder="Enter your Name"
                      className="w-full h-12 px-4 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      required
                    />
                      {/* </div> */}
                      {/* <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" />
                    </div> */}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                       <input
                      id="email"
                      type="text"
                      placeholder="Enter your Email"
                      className="w-full h-12 px-4 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      required
                    />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                       <input
                      id="phone"
                      type="tel"
                      placeholder="Enter your mobile number"
                      className="w-full h-12 px-4 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      required
                    />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us more about your inquiry..."
                        className="min-h-[120px] w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      />
                    </div>

                    <Button type="submit" className="w-full sm:w-auto">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              {/* Contact Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    Reach out to us through any of these channels.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Address</p>
                      <p className="text-slate-900">
                        D-59, D-BLock, Sector 63
                        <br />
                        Noida, Distt-Gautam Budh Nagar
                        <br />
                        Uttar Pradesh Delhi (NCR) 201301, India{" "}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Phone</p>
                      <p className="text-slate-900">+91 9871980066</p>
                      <p className="text-slate-900">+91 1204223100</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-slate-900">
                        info@makemybharatyatra.com
                      </p>
                      <p className="text-slate-900">
                        support@makemybharatyatra.com
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Business Hours
                      </p>
                      <p className="text-slate-900">
                        Monday - Sunday: 9:30 AM - 6:30 PM
                       
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Contact */}
              <div className="mb-5">
                <Card>
                  <CardHeader>
                    <CardTitle>Need immediate help?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-blue-800 mb-4">
                      For urgent matters, call us directly or send an email.
                    </p>
                    <div className="space-y-2">
                      <Button className="w-full justify-start ">
                        <Link href="tel:+91 9871980066">
                          <Phone className="w-4 h-4 mr-2" />
                          Call Now
                        </Link>
                      </Button>
                      <Button className="w-full items-center">
                        <Link href="mailto:support@makemybharatyatra.com">
                          <Mail className="w-4 h-4 mr-2  " />
                          Send Email
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          {/* Map Placeholder */}
          <Card>
             <CardHeader>
                    <CardTitle>Find Us On Google Maps</CardTitle>
                  </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-lg overflow-hidden">
                <iframe
                  title="Google Map"
                  width="100%"
                  height="100%"
                  className="w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3529.632733211838!2d77.38250744391812!3d28.61850002463281!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ceff4f6c9264f%3A0xda17d39d29f4b5ae!2sMake%20My%20Bharat%20Yatra%20Pvt.%20Ltd.!5e1!3m2!1smr!2sin!4v1753853615500!5m2!1smr!2sin"
                ></iframe>
                {/* <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3529.632733211838!2d77.38250744391812!3d28.61850002463281!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ceff4f6c9264f%3A0xda17d39d29f4b5ae!2sMake%20My%20Bharat%20Yatra%20Pvt.%20Ltd.!5e1!3m2!1smr!2sin!4v1753853615500!5m2!1smr!2sin" width="600" height="450"   loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe> */}
              </div>
            </CardContent>
          </Card>

          {/* <Card >
              <CardContent >
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 font-medium">Interactive Map</p>
                    <p className="text-sm text-gray-400">Location preview</p>
                  </div>
                </div>
              </CardContent>
            </Card> */}

          {/* FAQ Section */}
          {/* <div className="mt-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">
                Frequently Asked Questions
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Quick answers to common questions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>How quickly do you respond?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    We typically respond to all inquiries within 24 hours during
                    business days.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Do you offer phone consultations?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Yes, we offer free 15-minute phone consultations to discuss
                    your needs.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>What information should I include?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Please include as much detail as possible about your project
                    or inquiry.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Do you work with international clients?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Yes, we work with clients worldwide and can accommodate
                    different time zones.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div> */}
        </div>
      </div>
      <Footer />
    </>
  );
}
