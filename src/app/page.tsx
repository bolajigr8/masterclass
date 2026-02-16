import FAQ from '@/components/faq'
import Footer from '@/components/footer'
import Hero from '@/components/hero'
import MeetTheExperts from '@/components/meet-experts'
import Navbar from '@/components/Navbar'
import ReserveAccessSection from '@/components/Booking/reserve-access'
import TrustedByInvestors from '@/components/trust'
import WhatYouWillMaster from '@/components/what-master'

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <section id='what-you-will-master'>
        <WhatYouWillMaster />
      </section>
      <section id='meet-the-experts'>
        <MeetTheExperts />
      </section>
      <section id='reserve-access'>
        <ReserveAccessSection />
      </section>
      <TrustedByInvestors />
      <section id='faq'>
        <FAQ />
      </section>
      <Footer />
    </>
  )
}
