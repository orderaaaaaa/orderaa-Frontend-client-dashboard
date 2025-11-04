import React from 'react';
import Header from './(home)/Header';
import Hero from './(home)/Hero';
import Image from 'next/image';
import { Zain } from 'next/font/google';
import Features from './(home)/Features';
import Pricing from './(home)/Pricing';
import FaqSection from './(home)/FaqSection';
import Footer from './(home)/Footer';
import SmartMarketing from './(home)/SmartMarketing';
import Departments from './(home)/Departments';
import InventorySection from './(home)/InventorySection';
import AIDepartments from './(home)/AIDepartments';
import VideoSection from './(home)/VideoSection';
import TeamManagementSection from './(home)/TeamManagementSection';
import SmartAccountsAndSuppliers from './(home)/SmartAccountsAndSuppliers';
import DepartmentsFinanceAndOps from './(home)/DepartmentsFinanceAndOps';
import FullControlSection from './(home)/FullControlSection';

const zain = Zain({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

const Page = () => {
  return (
    <main className={`${zain.className} relative bg-[#040711] text-white`}>
      {/* Background Images - Hidden on mobile */}
      <div className="absolute inset-0 z-0 pointer-events-none hidden md:block">
        <Image
          src="/icons/group.svg"
          alt=""
          width={1400}
          height={1400}
          className="absolute top-0 right-[5px] w-[1300px]"
        />
        <Image
          src="/icons/Ellipse 1.svg"
          alt=""
          width={1006}
          height={1006}
          className="absolute  top-0 right-0 w-full max-w-[1006px]"
        />
        <Image
          src="/icons/Ellipse 2.svg"
          alt=""
          width={1006}
          height={1006}
          className="absolute top-[-40px] left-0 w-full max-w-[806px]"
        />
      </div>
      {/* Foreground Content */}
      <div className="relative z-10">
        <Header />
        <Hero />
        <Features />
        <InventorySection />
        <TeamManagementSection />
        <Departments />
        <FullControlSection />
        <SmartAccountsAndSuppliers />
        <DepartmentsFinanceAndOps />
        <VideoSection />
        <AIDepartments />
        <SmartMarketing />
        <Pricing />
        <FaqSection />
        <Footer />
      </div>
    </main>
  );
};

export default Page;
