import FAQ from '@/components/faq'
import Footer from '@/components/footer'
import Hero from '@/components/hero'
import MeetTheExperts from '@/components/meet-experts'
import Navbar from '@/components/Navbar'
import ReserveAccessSection from '@/components/reserve-access'
import TrustedByInvestors from '@/components/trust'
import WhatYouWillMaster from '@/components/what-master'

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <WhatYouWillMaster />
      <MeetTheExperts />
      <ReserveAccessSection />
      <TrustedByInvestors />
      <FAQ />
      <Footer />
    </>
  )
}
