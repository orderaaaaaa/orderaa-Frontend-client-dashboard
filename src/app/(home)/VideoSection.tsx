'use client';
import { useState } from 'react';
import Image from 'next/image';

export default function VideoSection() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="relative py-5 sm:py-20 text-white px-4">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-10 px-2 md:px-6">
        {/* Left text */}
        <div className="w-full md:w-[40%] text-right order-2 md:order-1">
          <h2 className="text-3xl md:text-3xl font-bold mb-4 md:mb-6">
            شاهد هذا الفيديو لتتعرف على{' '}
            <span className="text-[#8E6BFF]">Orderaa</span>
          </h2>
          <p className="text-gray-300 text-[16px] md:text-[22px] leading-relaxed">
            افهم في دقيقتين كيف يساعدك النظام على إدارة الطلبات، متابعة العملاء،
            وتحقيق مبيعاتك بسهولة – كل شيء في مكان واحد.
          </p>
        </div>

        {/* Right: video area */}
        <div className="relative w-full md:w-1/2 rounded-3xl overflow-hidden border border-[#5D24E1]/40 shadow-[0_0_30px_rgba(93,36,225,0.2)] order-1 md:order-2">
          {!isPlaying ? (
            <>
              {/* Preview image */}
              <Image
                src="/icons/Dashboard3.svg"
                alt="Dashboard Preview"
                width={800}
                height={300}
                className="w-full h-50 bg-black sm:h-130 block"
              />

              {/* Play button overlay */}
              <button
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 flex items-center cursor-pointer justify-center bg-black/30 hover:bg-black/50 transition-all"
              >
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center hover:scale-110 transition-transform">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="white"
                    viewBox="0 0 24 24"
                    className="w-10 h-10"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </button>
            </>
          ) : (
            <div className="relative w-full aspect-video">
              {/* ✅ Video stays inside this div — same exact place */}
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-3xl"
                src="https://www.youtube.com/embed/dQw4w9WgQ?autoplay=1"
                title="Orderaa Demo Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
