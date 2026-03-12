'use client';

import { FadeIn } from "./FadeIn";

import Image from "next/image";
import Socials from "./Socials";
import GlowCard from "./GlowCard";

export default function About() {
  return (
    <div className="container mx-auto">
      <div className="mx-auto max-w-6xl px-4 sm:px-8 lg:px-12 py-6 text-white">
        <div className="flex flex-col gap-8 mt-24 @lg:flex-row justify-between">
          <div className="md:max-w-7xl w-full  flex-auto">
            <h3 className="text-lg font-semibold leading-8 tracking-tight text-white">Tebi Njeik Bless</h3>
            <p className="text-white font-sans text-[24px] md:text-[34px] lg:text-[44px] leading-[1.3] md:leading-[1.4] font-normal tracking-tight text-balance flex flex-wrap justify-center gap-x-[0.3em]">Full-stack Developer experienced in building scalable applications and responsive Applications using MERN,MEAN etc. I build production-ready applications with strong frontend-backend integration and clean architecture. I am a quick learner and I am always looking to improve my skills and knowledge.</p>
          
          </div>
         
        </div>
      </div>

      <div className="flex gap-5 mt-16 flex-col @3xl:flex-row justify-between">
        <div>
          <FadeIn
            variants={{
              hidden: { opacity: 0, x: -20 },
              visible: { opacity: 1, x: 0 },
            }}
          >
            <h4 className="text-about_me_green mb-1">| Languages</h4>
            <div className="border-y py-2 border-gray-500/30 mb-6">
              <div className="flex flex-wrap gap-x-6">
                <div className="text-lg font-bold leading-9 tracking-tight flex gap-1">
                  <p className="text-white">English</p> - <p className="text-gray-500">Native</p>
                </div>
                <div className="text-lg font-bold leading-9 tracking-tight flex gap-1">
                  <p className="text-white">French</p> - <p className="text-gray-500">Fluent</p>
                </div>
              </div>
            </div>
          </FadeIn>
          <Socials />
        </div>
        {/* <FadeIn
          variants={{
            hidden: { opacity: 0, x: 20 },
            visible: { opacity: 1, x: 0 },
          }}
        >
          <GlowCard className="hover:shadow-about_me_green/90" glowClassName="from-[#6bc072] to-[#6bc072]">
            <div className="flex flex-col gap-8 @lg:flex-row justify-between">
              <div className="flex-none mx-auto self-center">
                <Image className="rounded-2xl object-fill" src="/3.jpeg" alt="" width={144} height={144} />
              </div>
              <div className="max-w-xl flex-auto">
                <h3 className="text-lg font-semibold leading-8 tracking-tight text-white">B.S. in Computer Science and Technology</h3>
                <p className="text-base leading-7 text-about_me_green">Instituto Tecnologico de Monterrey</p>
              </div>
            </div>
          </GlowCard>
        </FadeIn> */}
      </div>
    </div>)
}