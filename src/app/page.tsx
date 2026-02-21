import Navbar from '@/components/Navbar'
import Hero from '@/components/hero'

import Footer from '@/components/footer'
import HeroStats from '@/components/Hero-stats'
import WhatYouWillMaster from '@/components/what-master'
import MeetTheInstructor from '@/components/meet-instructor'
import Pricing from '@/components/Booking-New/pricing'
import Testimonials from '@/components/testimonials'
import ReserveAccess from '@/components/Booking-New/Reserve-access'
import AboutSection from '@/components/about'
import TeamSection from '@/components/team-section'
import JaaSActivationPack from '@/components/activation-pack'
import Launchpad from '@/components/launch-pad'
import PaymentOptions from '@/components/payment-options'

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <HeroStats />

      <section id='about'>
        <AboutSection />
      </section>
      <section id='team-section'>
        <TeamSection />
      </section>

      <section id='programme'>
        <WhatYouWillMaster />
      </section>

      <section id='activation-pack'>
        <JaaSActivationPack />
      </section>

      <section id='launchpad'>
        <Launchpad />
      </section>

      <section id='pricing'>
        <Pricing />
      </section>

      <section id='payment-options'>
        <PaymentOptions />
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
