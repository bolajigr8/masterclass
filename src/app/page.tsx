import Navbar from '@/components/Navbar'
import Hero from '@/components/hero'

import Footer from '@/components/footer'
import HeroStats from '@/components/Hero-stats'
import WhatYouWillMaster from '@/components/what-master'
import MeetTheInstructor from '@/components/meet-instructor'
import Pricing from '@/components/Booking-New/pricing'
import Testimonials from '@/components/testimonials'
import ReserveAccess from '@/components/Booking-New/Reserve-access'

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <HeroStats />

      <section id='programme'>
        <WhatYouWillMaster />
      </section>
      <section id='meet-the-experts'>
        <MeetTheInstructor />
      </section>
      <section id='pricing'>
        <Pricing />
      </section>
      <section id='testimonials'>
        <Testimonials />
      </section>

      <section id='reserve-access'>
        <ReserveAccess />
      </section>
      <Footer />
    </>
  )
}
