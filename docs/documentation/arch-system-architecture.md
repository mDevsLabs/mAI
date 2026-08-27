---
title: "Architecture"
description: "Vue d'ensemble des modules, microservices et flux de données de la suite mDevsLabs."
category: "Architecture"
order: 1
---

# Architecture Système globale de mDevsLabs 

L'architecture globale de l'écosystème **mDevsLabs** repose sur une découpe modulable en microservices isolés garantissant flexibilité, scalabilité et résilience.

---

## Vue d'Ensemble des Composants

```

                     Front-end & User Layer                      
      mAI Web (Next.js)          mAI Pulse / Office   mAI CLI  

                                 

                     API Gateway & Auth Layer                    
            JWT Verification / Rate Limiting / CORS              

                                 
         
                                                          
      
     Inference Engine (mAI)                Vector & RAG Storage        
   Ollama / Llama.cpp backend            HNSW Dense Vector Store       
      
```

---

## Microservices Principaux

1. **mAI Inference Core** : Serveur d'inférence de modèles LLM et multimodaux.
2. **mAI Storage & Indexing Service** : Moteur de stockage et recherche sémantique documentaire.
3. **Agent Manager** : Orchestrateur de tâches asynchrones, d'outils externes et de communication inter-agents.
4. **mAI Portal** : Portail web et centre de documentation interactif.

---

## Flux de Données

### Scénario Chat Standard

```
Client → API Gateway → Auth Layer → mAI Inference Core → Ollama Engine → Response
```

### Scénario RAG

```
User Query → mSearch Hybrid Search → Vector Store → Context Injection → mAI Generation → Response
```

### Scénario Tool Calling

```
User Query → mAI Reasoning → Tool Selection → Agent Execution → Result Processing → Response
```

---

## Stack Technologique

| Couche | Technologie | Usage |
|--------|-------------|-------|
| Frontend | Next.js 15 + React 18 | Application web |
| Styling | Tailwind CSS v4 | Design system |
| Backend | Node.js 20+ | API Gateway |
| Inférence | Ollama + llama.cpp | Exécution modèles |
| Vector Store | HNSW (FAISS) | Recherche vectorielle |
| Auth | JWT + Bearer Token | Sécurité API |
| Cache | Redis | Sessions & Rate Limiting |
| Déploiement | Docker + Kubernetes | Scalabilité |

---

## Sécurité & Conformité

- **Chiffrement TLS 1.3** : Toutes les communications sont chiffrées.
- **Isolation des données** : Aucune donnée utilisateur n'est persistée sans consentement.
- **RGPD Compliant** : Architecture "right to be forgotten" intégrée.

---

## Monitoring & Observabilité

- **Metrics** : Prometheus + Grafana pour les métriques d'inférence.
- **Logs** : Loki pour la journalisation centralisée.
- **Tracing** : OpenTelemetry pour le suivi des requêtes.

---

## Déploiement

### Production (Kubernetes)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mai-inference
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mai-inference
  template:
    spec:
      containers:
      - name: ollama
        image: ollama/ollama:latest
        resources:
          limits:
            nvidia.com/gpu: 1
            memory: "16Gi"
```

### Scaling Horizontal

- **HPA** : Auto-scaling basé sur le temps de réponse.
- **GPU Autoscaling** : Nodes GPU dédiés pour l'inférence.

---

## Ressources

- **RAG Pipeline** : [Guide détaillé](/docs?doc=arch-rag-pipeline)
- **Indexation Vectorielle** : [HNSW Documentation](/docs?doc=arch-vector-indexing)
- **Benchmarks** : [Performance Tests](/docs?doc=arch-performance-benchmarks)
