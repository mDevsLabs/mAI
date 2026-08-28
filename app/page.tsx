import { getNewsArticles } from "@/lib/news";
import { HeroSection } from "@/components/home/hero-section";
import { ModelsShowcase } from "@/components/home/models-showcase";
import { ProjectsShowcase } from "@/components/home/projects-showcase";
import { FeaturesSection } from "@/components/home/features-section";
import { NewsAndUpdates } from "@/components/home/news-and-updates";
import { CommunitySection } from "@/components/home/community-section";

export default async function Home() {
  const news = getNewsArticles();

  return (
    <div className="flex flex-col gap-6 md:gap-12 w-full relative z-10">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Flagship Models Showcase (mAI-1.5 Series) */}
      <ModelsShowcase />

      {/* 3. Products & Projects Showcase */}
      <ProjectsShowcase />

      {/* 4. Core Features & Value Propositions */}
      <FeaturesSection />

      {/* 5. Activité Récente (3 Derniers Articles de Blog) */}
      <NewsAndUpdates news={news} />

      {/* 6. Communauté & Bandeau Call to Action */}
      <CommunitySection />
    </div>
  );
}