'use client';
import React from 'react';
import PageLoading from '@/components/ui/page-loading';
import Header from '../(home)/Header';
import Hero from '../(home)/Hero';
import Image from 'next/image';
import { Zain } from 'next/font/google';
import Features from '../(home)/Features';
import Pricing from '../(home)/Pricing';
import FaqSection from '../(home)/FaqSection';
import Footer from '../(home)/Footer';
import SmartMarketing from '../(home)/SmartMarketing';
import Departments from '../(home)/Departments';
import InventorySection from '../(home)/InventorySection';
import AIDepartments from '../(home)/AIDepartments';
import VideoSection from '../(home)/VideoSection';
import TeamManagementSection from '../(home)/TeamManagementSection';
import SmartAccountsAndSuppliers from '../(home)/SmartAccountsAndSuppliers';
import DepartmentsFinanceAndOps from '../(home)/DepartmentsFinanceAndOps';
import FullControlSection from '../(home)/FullControlSection';
import SmartReportsSection from '../(home)/SmartReportsSection';
import { useAuthGuard } from '@/hooks/useAuthGuard';

const zain = Zain({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

const Page = () => {
  const { isChecking } = useAuthGuard(false);

  if (isChecking) {
    return <PageLoading className="h-64 mt-10" />;
  }
  return (
    <main className={`${zain.className} relative bg-[#040711] text-white`}>
      <div className="absolute inset-0 z-0 pointer-events-none hidden md:block">
        <Image
          src="/Icons/group.svg"
          alt=""
          width={1400}
          height={1400}
          className="absolute top-0 right-[5px] w-[1300px]"
        />
        <Image
          src="/Icons/Ellipse 1.svg"
          alt=""
          width={1006}
          height={1006}
          className="absolute  top-0 right-0 w-full max-w-[1006px]"
        />
        <Image
          src="/Icons/Ellipse 2.svg"
          alt=""
          width={1006}
          height={1006}
          className="absolute top-[-40px] left-0 w-full max-w-[806px]"
        />
      </div>
      <div className="relative z-10">
        <Header />
        <Hero />
        <Features />
        <InventorySection />
        <TeamManagementSection />
        <Departments />
        <FullControlSection />
        <SmartAccountsAndSuppliers />
        <SmartReportsSection />
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
