import { getModelById, getModels } from "@/lib/models";
import { notFound } from "next/navigation";
import { ModelDetailClient } from "./ModelDetailClient";

export async function generateStaticParams() {
  const models = getModels();
  return models.map((model) => ({
    id: model.id,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const model = getModelById(resolvedParams.id);
  if (!model) {
    return {
      title: "Modèle Introuvable | mAI",
    };
  }
  // Icône dédiée pour la génération mAI-2
  const icons = model.id.startsWith("mai-2") ? { icon: "/mai-2/icon.png" } : undefined;
  return {
    title: `${model.name} - Modèle IA | mAI`,
    description: model.tagline,
    icons,
  };
}

export default async function ModelPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const model = getModelById(resolvedParams.id);

  if (!model) {
    notFound();
  }

  return <ModelDetailClient model={model} />;
}
