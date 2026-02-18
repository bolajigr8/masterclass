// import FAQ from '@/components/faq'
// import Footer from '@/components/footer'
// import Hero from '@/components/hero'
// import MeetTheExperts from '@/components/meet-instructor'
// import Navbar from '@/components/Navbar'
// import ReserveAccessSection from '@/components/Booking/reserve-access'
// import TrustedByInvestors from '@/components/trust'
// import WhatYouWillMaster from '@/components/what-master'
// import HeroStats from '@/components/Hero-stats'
// import MeetTheInstructor from '@/components/meet-instructor'
// import Pricing from '@/components/pricing'
// import Testimonials from '@/components/testimonials'
// import ReserveAccess from '@/components/Reserve-access'

// export default function Home() {
//   return (
//     <>
//       <Navbar />
//       <Hero />
//       <HeroStats />
//       <section id='what-you-will-master'>
//         <WhatYouWillMaster />
//       </section>
//       <section id='meet-the-experts'>
//         <MeetTheInstructor />
//       </section>
//       <Pricing />

//       <Testimonials />

//       <ReserveAccess />

//       <section id='reserve-access'>
//         <ReserveAccessSection />
//       </section>
//       <TrustedByInvestors />
//       <section id='faq'>
//         <FAQ />
//       </section>
//       <Footer />
//     </>
//   )
// }

import Navbar from '@/components/Navbar'
import Hero from '@/components/hero'

import Footer from '@/components/footer'
import HeroStats from '@/components/Hero-stats'
import WhatYouWillMaster from '@/components/what-master'
import MeetTheInstructor from '@/components/meet-instructor'
import Pricing from '@/components/pricing'
import Testimonials from '@/components/testimonials'
import ReserveAccess from '@/components/Reserve-access'

export default function Home() {
  return (
    <>
      <Navbar />

      {/* Hero — id="hero" used by logo click & scroll-to-top */}
      <Hero />

      {/* Social proof stats + scrolling cities */}
      <HeroStats />

      {/* Programme — id="programme" targeted by navbar */}
      <section id='programme'>
        <WhatYouWillMaster />
      </section>

      {/* Meet the Instructor — id="meet-the-experts" targeted by footer */}
      <section id='meet-the-experts'>
        <MeetTheInstructor />
      </section>

      {/* Pricing — id="pricing" targeted by navbar */}
      <section id='pricing'>
        <Pricing />
      </section>

      {/* Testimonials — id="testimonials" targeted by navbar */}
      <section id='testimonials'>
        <Testimonials />
      </section>

      {/* Reserve Access / Contact form — id="reserve-access" targeted by CTAs */}
      <section id='reserve-access'>
        <ReserveAccess />
      </section>

      {/* Footer — id="contact" targeted by navbar Contact link */}
      <Footer />
    </>
  )
}
