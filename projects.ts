import type { Hono } from "npm:hono@4";
import { getDb } from "./config.ts";

export const STATIC_PROJECTS_LIST = [
  {
    category: "Web Application",
    created_at: "2026-08-01T00:00:00.000Z",
    description:
      "Application d'IA en ligne web directement et simplement pour discuter avec l'IA mAI.",
    features: ["Chat Web", "Interface fluide", "Streaming en direct"],
    id: "proj_web",
    is_public: true,
    label: "Alpha",
    name: "Web",
    project_id: "web",
    repository: "https://github.com/mDevsLabs/Web",
    status: "alpha",
    version: "0.1.0",
  },
  {
    category: "Extensions",
    created_at: "2026-08-05T00:00:00.000Z",
    description:
      "Ensemble d'extensions pour diverses applications pour discuter avec mAI directement (navigateur, VS Code...).",
    features: ["Extension navigateur", "Extension VS Code", "Accès contextuel"],
    id: "proj_pulse",
    is_public: true,
    label: "Bêta",
    name: "Pulse",
    project_id: "pulse",
    repository: "https://github.com/mDevsLabs/Pulse",
    status: "beta",
    version: "0.2.0",
  },
  {
    category: "Developer Tools",
    created_at: "2026-08-10T00:00:00.000Z",
    description:
      "Discussions et séances de codage dans le terminal CLI via mAI.",
    features: [
      "Terminal interactif",
      "Génération de code",
      "Workflows développeur",
    ],
    id: "proj_cli",
    is_public: true,
    label: "Bêta",
    name: "CLI",
    project_id: "cli",
    repository: "https://github.com/mDevsLabs/CLI",
    status: "beta",
    version: "0.5.0",
  },
  {
    category: "Developer Tools",
    created_at: "2026-08-20T00:00:00.000Z",
    description:
      "IDE IA de nouvelle génération avec agents IA autonomes, orchestration multi-modèles et support natif des outils MCP.",
    features: ["IDE IA Intelligent", "Agents Autonomes", "Outils MCP", "Multi-Modèles"],
    id: "proj_coder",
    is_public: true,
    label: "Alpha",
    name: "Coder",
    project_id: "coder",
    repository: "https://github.com/mDevsLabs/Coder",
    status: "alpha",
    version: "0.1.0",
  },
  {
    category: "Cloud & Storage",
    created_at: "2026-08-15T00:00:00.000Z",
    description:
      "Stockage cloud de documents et intégration d'mAI pour des résumés.",
    features: ["Stockage sécurisé", "Résumés automatiques", "Indexation de documents"],
    id: "proj_cloud",
    is_public: true,
    label: "Réflexion",
    name: "Cloud",
    project_id: "cloud",
    repository: "",
    status: "conception",
    version: "0.0.1",
  },
  {
    category: "Productivity",
    created_at: "2026-08-12T00:00:00.000Z",
    description:
      "Création de documents et présentations assistée par mAI.",
    features: ["Génération de documents", "Présentations interactives", "Export multi-format"],
    id: "proj_office",
    is_public: true,
    label: "Archivé",
    name: "Office",
    project_id: "office",
    repository: "https://github.com/mDevsLabs/Office",
    status: "archived",
    version: "0.1.0",
  },
  {
    category: "Search Engine",
    created_at: "2026-02-01T00:00:00.000Z",
    description:
      "Moteur de recherche sémantique et d'indexation vectorielle ultra-rapide.",
    features: ["Indexation hybride", "Recherche locale"],
    id: "proj_msearch",
    is_public: true,
    label: "Archivé",
    name: "mSearch",
    project_id: "msearch",
    repository: "https://github.com/mDevsLabs/mSearch",
    status: "archived",
    version: "1.0.3",
  },
  {
    category: "API Gateway",
    created_at: "2026-03-01T00:00:00.000Z",
    description:
      "Hub universel d'agrégation et de routage intelligent d'API et modèles LLM.",
    features: ["Load balancing", "Multi-fournisseurs"],
    id: "proj_openprovider",
    is_public: true,
    label: "Archivé",
    name: "OpenProvider",
    project_id: "openprovider",
    repository: "https://github.com/mDevsLabs/OpenProvider",
    status: "archived",
    version: "0.5.0",
  },
  {
    category: "Games",
    created_at: "2026-03-15T00:00:00.000Z",
    description: "Jeu vidéo du style Block Blast",
    features: ["Video game", "Assembler"],
    id: "proj_snob",
    is_public: true,
    label: "Archivé",
    name: "Snob",
    project_id: "snob",
    repository: "https://github.com/mDevsLabs/Snob",
    status: "archived",
    version: "1.0.1",
  },
  {
    category: "AI Suite",
    created_at: "2026-01-15T00:00:00.000Z",
    description:
      "Ancienne interface web de mAI.",
    features: ["Chat Completions", "Embeddings"],
    id: "proj_mai_legacy",
    is_public: true,
    label: "Archivé",
    name: "mAI Web (Legacy)",
    project_id: "mai",
    repository: "https://github.com/mDevsLabs/mAI",
    status: "archived",
    version: "2.4.0",
  },
];

export const STATIC_PROJECTS_MAP: Record<string, any> = {
  web: {
    category: "Web Application",
    created_at: "2026-08-01T00:00:00.000Z",
    description:
      "Application d'IA en ligne web directement et simplement pour discuter avec l'IA mAI.",
    is_public: true,
    label: "Alpha",
    name: "Web",
    project_id: "web",
    repository: "https://github.com/mDevsLabs/Web",
    status: "alpha",
  },
  pulse: {
    category: "Extensions",
    created_at: "2026-08-05T00:00:00.000Z",
    description:
      "Ensemble d'extensions pour diverses applications pour discuter avec mAI directement (navigateur, VS Code...).",
    is_public: true,
    label: "Bêta",
    name: "Pulse",
    project_id: "pulse",
    repository: "https://github.com/mDevsLabs/Pulse",
    status: "beta",
  },
  cli: {
    category: "Developer Tools",
    created_at: "2026-08-10T00:00:00.000Z",
    description:
      "Discussions et séances de codage dans le terminal CLI via mAI.",
    is_public: true,
    label: "Bêta",
    name: "CLI",
    project_id: "cli",
    repository: "https://github.com/mDevsLabs/CLI",
    status: "beta",
  },
  coder: {
    category: "Developer Tools",
    created_at: "2026-08-20T00:00:00.000Z",
    description:
      "IDE IA de nouvelle génération avec agents IA autonomes, orchestration multi-modèles et support natif des outils MCP.",
    is_public: true,
    label: "Alpha",
    name: "Coder",
    project_id: "coder",
    repository: "https://github.com/mDevsLabs/Coder",
    status: "alpha",
  },
  office: {
    category: "Productivity",
    created_at: "2026-08-12T00:00:00.000Z",
    description:
      "Création de documents et présentations avec mAI.",
    is_public: true,
    label: "Archivé",
    name: "Office",
    project_id: "office",
    repository: "https://github.com/mDevsLabs/Office",
    status: "archived",
  },
  cloud: {
    category: "Cloud & Storage",
    created_at: "2026-08-15T00:00:00.000Z",
    description:
      "Stockage cloud de documents et intégration d'mAI pour des résumés.",
    is_public: true,
    label: "Réflexion",
    name: "Cloud",
    project_id: "cloud",
    repository: "",
    status: "conception",
  },
  mai: {
    category: "AI Suite",
    created_at: "2026-01-15T00:00:00.000Z",
    description:
      "Ancienne interface web de mAI.",
    is_public: true,
    label: "Archivé",
    name: "mAI Web (Legacy)",
    project_id: "mai",
    repository: "https://github.com/mDevsLabs/mAI",
    status: "archived",
  },
  maicli: {
    category: "CLI Tool",
    created_at: "2026-02-10T00:00:00.000Z",
    description:
      "Interface en ligne de commande professionnelle pour l'écosystème mAI.",
    is_public: true,
    label: "Archivé",
    name: "mAI CLI (Legacy)",
    project_id: "maicli",
    repository: "https://github.com/mDevsLabs/mAI-CLI",
    status: "archived",
  },
  msearch: {
    category: "Search Engine",
    created_at: "2026-02-01T00:00:00.000Z",
    description:
      "Moteur de recherche sémantique et d'indexation vectorielle.",
    is_public: true,
    label: "Archivé",
    name: "mSearch",
    project_id: "msearch",
    repository: "https://github.com/mDevsLabs/mSearch",
    status: "archived",
  },
  openprovider: {
    category: "API Gateway",
    created_at: "2026-03-01T00:00:00.000Z",
    description:
      "Hub universel d'agrégation et de routage d'API et modèles LLM.",
    is_public: true,
    label: "Archivé",
    name: "OpenProvider",
    project_id: "openprovider",
    repository: "https://github.com/mDevsLabs/OpenProvider",
    status: "archived",
  },
  snob: {
    category: "Games",
    created_at: "2026-03-15T00:00:00.000Z",
    description:
      "Jeu vidéo du style Block Blast.",
    is_public: true,
    label: "Archivé",
    name: "Snob",
    project_id: "snob",
    repository: "https://github.com/mDevsLabs/Snob",
    status: "archived",
  },
};

export function registerProjectRoutes(app: Hono) {
  // GET /v1/projects
  app.get("/v1/projects", async (c) => {
    try {
      const sql = getDb();
      const userId = c.get("userId");
      const dbProjects =
        await sql`SELECT * FROM mprojects_projects WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 50`;
      return c.json({ data: [...STATIC_PROJECTS_LIST, ...dbProjects], object: "list" });
    } catch (_err) {
      return c.json({ data: STATIC_PROJECTS_LIST, object: "list" });
    }
  });

  // POST /v1/projects
  app.post("/v1/projects", async (c) => {
    const sql = getDb();
    const userId = c.get("userId");
    const body = await c.req.json();
    if (!body.name) {
      return c.json({ error: "Le nom du projet est obligatoire." }, 400);
    }

    const projectId = "proj-" + Math.random().toString(36).substr(2, 9);

    await sql`
      INSERT INTO mprojects_projects (user_id, project_id, name, description, is_public)
      VALUES (${userId}, ${projectId}, ${body.name}, ${body.description || ""}, ${body.isPublic || false})
    `;

    return c.json({ name: body.name, project_id: projectId, success: true });
  });

  // GET /v1/projects/:id
  app.get("/v1/projects/:id", async (c) => {
    const projectId = c.req.param("id").toLowerCase();

    if (STATIC_PROJECTS_MAP[projectId]) {
      return c.json({ project: STATIC_PROJECTS_MAP[projectId] });
    }

    const sql = getDb();
    const userId = c.get("userId");
    const projects = await sql`
      SELECT * FROM mprojects_projects 
      WHERE (user_id = ${userId} OR is_public = TRUE) AND LOWER(project_id) = ${projectId} 
      LIMIT 1
    `;

    if (projects.length === 0) {
      return c.json({ error: "Project not found" }, 404);
    }

    return c.json({ project: projects[0] });
  });

  // PUT /v1/projects/:id
  app.put("/v1/projects/:id", async (c) => {
    const sql = getDb();
    const userId = c.get("userId");
    const projectId = c.req.param("id");
    const body = await c.req.json();

    const existing =
      await sql`SELECT id FROM mprojects_projects WHERE user_id = ${userId} AND project_id = ${projectId} LIMIT 1`;
    if (existing.length === 0) {
      return c.json({ error: "Projet non trouvé ou non autorisé." }, 404);
    }

    const name = body.name;
    const description = body.description;
    const isPublic = body.isPublic;

    await sql`
      UPDATE mprojects_projects
      SET name = COALESCE(${name}, name),
          description = COALESCE(${description}, description),
          is_public = COALESCE(${isPublic}, is_public),
          updated_at = NOW()
      WHERE user_id = ${userId} AND project_id = ${projectId}
    `;

    return c.json({
      message: "Projet mis à jour.",
      project_id: projectId,
      success: true,
    });
  });

  // DELETE /v1/projects/:id
  app.delete("/v1/projects/:id", async (c) => {
    const sql = getDb();
    const userId = c.get("userId");
    const projectId = c.req.param("id");

    const result = await sql`
      DELETE FROM mprojects_projects 
      WHERE user_id = ${userId} AND project_id = ${projectId}
      RETURNING id
    `;

    if (result.length === 0) {
      return c.json({ error: "Projet non trouvé ou déjà supprimé." }, 404);
    }

    return c.json({ message: "Projet supprimé avec succès.", success: true });
  });

  // GET /v1/projects/:id/stats
  app.get("/v1/projects/:id/stats", async (c) => {
    const sql = getDb();
    const userId = c.get("userId");
    const projectId = c.req.param("id");

    const projects =
      await sql`SELECT id, name, created_at FROM mprojects_projects WHERE user_id = ${userId} AND project_id = ${projectId} LIMIT 1`;
    if (projects.length === 0) {
      return c.json({ error: "Projet non trouvé." }, 404);
    }

    return c.json({
      active_deployments: 1,
      name: projects[0].name,
      project_id: projectId,
      requests_count: Math.floor(Math.random() * 500) + 12,
      status: "healthy",
      uptime_percentage: 99.98,
    });
  });
}