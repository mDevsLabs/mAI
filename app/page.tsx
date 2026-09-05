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
      {/* Fond cosmique galaxie (accueil uniquement) */}
      <div className="fixed inset-0 -z-10 bg-[#04040f] pointer-events-none" aria-hidden="true">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: "url(/galaxy/galaxy-total.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#04040f]/70 via-[#0a0a24]/85 to-[#04040f]" />
        <div className="absolute -top-32 left-1/4 w-[28rem] h-[28rem] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-24 w-[24rem] h-[24rem] bg-blue-600/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -left-24 w-[26rem] h-[26rem] bg-indigo-500/15 rounded-full blur-[120px]" />
      </div>

      {/* 1. Hero Section — Introducing mAI-2 (galaxie) */}
      <HeroSection />

      {/* 2. Flagship Models Showcase (mAI-2 Series) */}
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
