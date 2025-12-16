"use client";

import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { HeroSection } from "@/src/components/sections/HeroSection";
import { ReviewsSection } from "@/src/components/sections/ReviewsSection";
import { FAQSection } from "@/src/components/sections/FAQSection";
import { faqItems, reviews } from "@/src/data/courses";
import dynamic from "next/dynamic";

const HomeContent = dynamic(() =>
  import("@/src/components/sections/HomeContent"), {
    ssr: false,
  }
);

export default function Home() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HomeContent heroComponent={<HeroSection />} reviewsComponent={<ReviewsSection reviews={reviews} />} faqComponent={<FAQSection items={faqItems} />} />
      </main>
      <Footer />
    </div>
  );
}