'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Briefcase, Mail, Linkedin, Twitter, ChevronRight } from 'lucide-react'

interface TeamMember {
  name: string
  role: string
  experience: string
  department: string
  bio: string
  tags: string[]
  extraTags: number
  avatar: string
  accentColor: string
  accentRgb: string
  badgeLetter: string
}

const teamMembers: TeamMember[] = [
  {
    name: 'Roland G.',
    role: 'CTO',
    experience: '8yr+ experience',
    department: 'Global Business Infrastructure / CTO',
    bio: "Roland architects the technology backbone powering Trila's global operations. With over 8 years leading enterprise-grade infrastructure across multiple continents, he ensures every platform, system, and digital touchpoint operates at institutional scale — from tokenization engines to deal management platforms. As CTO, Roland drives Trila's mission as a pioneer real estate infrastructure company empowering the new generation of entrepreneurs and developers at global scale.",
    tags: [
      'Enterprise Architecture',
      'Cloud Infrastructure',
      'Blockchain Systems',
    ],
    extraTags: 2,
    avatar: '/roland.png',
    accentColor: '#0066FF',
    accentRgb: '0, 102, 255',
    badgeLetter: 'R',
  },
  {
    name: 'Zain Travis.',
    role: 'CPO',
    experience: '10yr+ experience',
    department: 'Chief Product Officer, QA Engineer & AI Lead',
    bio: "Zain drives product innovation and quality assurance across the Trila ecosystem. With a decade of experience spanning product strategy, AI/ML implementation, and quality engineering, he ensures every product delivers exceptional user experiences while leveraging cutting-edge artificial intelligence to optimize deal flow and market analysis. His work underpins Trila's fractional ownership, STR, and JaaS platforms.",
    tags: ['Product Strategy', 'AI & Machine Learning', 'Quality Assurance'],
    extraTags: 2,
    avatar: '/zain.png',
    accentColor: '#c9a84c',
    accentRgb: '201, 168, 76',
    badgeLetter: 'Z',
  },
  {
    name: 'Salma Philip.',
    role: 'VP of Acquisition',
    experience: '11yr+ experience',
    department:
      'VP of Acquisition, Investor Relations, Data Analyst & Growth Strategist',
    bio: "Salma leads Trila's acquisition strategy and investor relations with over 11 years of expertise. She manages relationships with HNWIs, family offices, and institutional investors while leveraging deep data analytics to identify growth opportunities and optimize capital deployment across global markets. Her strategic vision fuels Trila's expansion in fractional ownership and JaaS.",
    tags: ['Investor Relations', 'M&A Strategy', 'Data Analytics'],
    extraTags: 2,
    avatar: '/salma.jpg',
    accentColor: '#0066FF',
    accentRgb: '0, 102, 255',
    badgeLetter: 'S',
  },
  {
    name: 'Chidi Israel',
    role: 'CMO',
    experience: '6yr+ experience',
    department: 'CMO — Chief Developer Partners, Global JaaS Accelerator',
    bio: "Chidi spearheads Trila's marketing engine and developer partnership ecosystem. As CMO, he manages the Global JaaS Accelerator program, building strategic alliances with developers, brands, and communities worldwide to scale the JaaS model and drive adoption across emerging and established markets. He champions Trila's narrative as a pioneer real estate infrastructure company.",
    tags: ['Brand Strategy', 'Developer Relations', 'Accelerator Programs'],
    extraTags: 2,
    avatar: '/chidi.png',
    accentColor: '#c9a84c',
    accentRgb: '201, 168, 76',
    badgeLetter: 'C',
  },
]

function MemberCard({ member }: { member: TeamMember }) {
  return (
    <div className='group bg-white/3 backdrop-blur-sm border border-white/6 rounded-2xl overflow-hidden transition-all duration-500 hover:bg-white/6 hover:border-white/10'>
      <div className='p-8'>
        {/* Avatar + Name */}
        <div className='flex items-start gap-5 mb-6'>
          <div className='relative shrink-0'>
            <Image
              src={member.avatar}
              alt={member.name}
              width={64}
              height={64}
              className='w-16 h-16 rounded-2xl object-cover'
              style={{ border: `2px solid rgba(${member.accentRgb}, 0.25)` }}
            />
            <div
              className='absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white'
              style={{ backgroundColor: member.accentColor }}
            >
              {member.badgeLetter}
            </div>
          </div>

          <div className='flex-1 min-w-0'>
            <h3 className='text-xl font-bold text-white'>{member.name}</h3>
            <p
              className='text-sm font-medium mt-0.5'
              style={{ color: member.accentColor }}
            >
              {member.role}
            </p>
            <div className='flex items-center gap-2 mt-2'>
              <span className='inline-flex items-center gap-1.5 text-xs text-white/40 bg-white/5 rounded-full px-3 py-1'>
                <Briefcase size={12} />
                {member.experience}
              </span>
            </div>
          </div>
        </div>

        {/* Department */}
        <p className='text-white/30 text-xs font-medium uppercase tracking-wider mb-2'>
          {member.department}
        </p>

        {/* Bio */}
        <p className='text-white/50 text-sm leading-relaxed line-clamp-3'>
          {member.bio}
        </p>

        {/* Tags */}
        <div className='flex flex-wrap gap-2 mt-5'>
          {member.tags.map((tag, i) => (
            <span
              key={i}
              className='text-xs font-medium px-3 py-1.5 rounded-full'
              style={{
                color: member.accentColor,
                background: `linear-gradient(135deg, rgba(${member.accentRgb}, 0.082), rgba(${member.accentRgb}, 0.03))`,
                border: `1px solid rgba(${member.accentRgb}, 0.125)`,
              }}
            >
              {tag}
            </span>
          ))}
          {member.extraTags > 0 && (
            <span className='text-xs text-white/30 px-2 py-1.5'>
              +{member.extraTags} more
            </span>
          )}
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between mt-6 pt-5 border-t border-white/5'>
          <div className='flex items-center gap-3'>
            <button className='w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all'>
              <Linkedin size={16} />
            </button>
            <button className='w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all'>
              <Twitter size={16} />
            </button>
            <button className='w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all'>
              <Mail size={16} />
            </button>
          </div>
          <button
            className='flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-80'
            style={{ color: member.accentColor }}
          >
            Read more
            <ChevronRight
              size={14}
              className='transition-transform group-hover:translate-x-0.5'
            />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TeamSection() {
  return (
    <section
      id='team'
      className='relative bg-[#0a1628] py-24 sm:py-32 overflow-hidden'
    >
      {/* Layered background */}
      <div className='absolute inset-0 bg-linear-to-b from-[#070e1a] via-[#0a1628] to-[#070e1a]' />
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-linear-to-r from-[#0066FF]/5 to-[#c9a84c]/5 rounded-full blur-[200px]' />

      <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Section header */}
        <div className='text-center mb-16 sm:mb-20'>
          <p className='text-[#c9a84c] text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase mb-4'>
            Leadership
          </p>
          <h2 className='text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4'>
            Our{' '}
            <span className='text-transparent bg-clip-text bg-linear-to-r from-[#0066FF] to-[#3399ff]'>
              Team
            </span>
          </h2>
          <p className='text-white/40 text-base sm:text-lg mt-4 max-w-2xl mx-auto'>
            A world-class leadership team with combined decades of experience in
            technology, real estate, finance, and global business infrastructure
            — driving Trila&apos;s mission to empower the next generation.
          </p>
        </div>

        {/* Cards grid */}
        <div className='grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto'>
          {teamMembers.map((member, index) => (
            <MemberCard key={index} member={member} />
          ))}
        </div>

        {/* Join CTA */}
        <div className='text-center mt-16'>
          <div className='bg-linear-to-r from-white/3 via-white/5 to-white/3 backdrop-blur-sm border border-white/6 rounded-2xl p-8 sm:p-10 max-w-3xl mx-auto'>
            <h3 className='text-xl sm:text-2xl font-bold text-white mb-3'>
              Want to Join Our Team?
            </h3>
            <p className='text-white/40 text-sm mb-6 max-w-lg mx-auto'>
              We&apos;re always looking for exceptional talent to join our
              mission of empowering the new generation of entrepreneurs and
              developers at global scale.
            </p>
            <Link
              href='#'
              className='inline-block bg-linear-to-r from-[#0066FF] to-[#0052cc] hover:from-[#0052cc] hover:to-[#003d99] text-white font-semibold text-sm px-8 py-3 rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-[#0066FF]/25'
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
