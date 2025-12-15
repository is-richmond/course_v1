import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { HeroSection } from "@/src/components/sections/HeroSection";
import { CoursesSection } from "@/src/components/sections/CoursesSection";
import { ReviewsSection } from "@/src/components/sections/ReviewsSection";
import { FAQSection } from "@/src/components/sections/FAQSection";
import { faqItems, reviews } from "@/src/data/courses";

export default function Home() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <CoursesSection />
        <ReviewsSection reviews={reviews} />
        <FAQSection items={faqItems} />
      </main>
      <Footer />
    </div>
  );
}