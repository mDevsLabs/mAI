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
  return {
    title: `${model.name} - Modèle IA | mAI`,
    description: model.tagline,
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
