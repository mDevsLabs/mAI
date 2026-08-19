---
title: "Déploiement"
description: "Guide de mise en production de clusters mAI avec mise à l'échelle automatique."
category: "Guides"
order: 3
---

# Déploiement sur Kubernetes & Clusters Dédiés ☸️🚀

Ce guide fournit les étapes d'architecture et de déploiement pour héberger les services **mAI** sur un cluster Kubernetes d'entreprise (EKS, GKE, AKS ou Kubernetes sur site).

---

## ☸️ Manifeste Helm / Kubernetes (`mai-deployment.yaml`)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mai-inference-deployment
  namespace: mdevslabs
  labels:
    app: mai-inference
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mai-inference
  template:
    metadata:
      labels:
        app: mai-inference
    spec:
      containers:
      - name: mai-container
        image: mdevslabs/mai-engine:latest
        resources:
          limits:
            nvidia.com/gpu: 1
            memory: "32Gi"
            cpu: "8"
          requests:
            nvidia.com/gpu: 1
            memory: "16Gi"
            cpu: "4"
        ports:
        - containerPort: 11434
        readinessProbe:
          httpGet:
            path: /api/version
            port: 11434
          initialDelaySeconds: 15
          periodSeconds: 10
```

---

## 📈 Auto-scaling avec KEDA (Kubernetes Event-driven Autoscaling)

Vous pouvez configurer l'auto-scaling basé sur la longueur de la file d'attente de requêtes HTTP ou l'utilisation VRAM du GPU.

```yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: mai-gpu-scaler
  namespace: mdevslabs
spec:
  scaleTargetRef:
    name: mai-inference-deployment
  minReplicaCount: 1
  maxReplicaCount: 10
  triggers:
  - type: prometheus
    metadata:
      serverAddress: http://prometheus-k8s.monitoring:9090
      metricName: mai_queue_latency_seconds
      threshold: '2.5'
      query: sum(mai_queue_latency_seconds)
```

---

## 📦 Déploiement avec Helm

### Installation du Chart

```bash
# Ajouter le repository Helm
helm repo add mdevslabs https://charts.mdevslabs.ai
helm repo update

# Installer le chart
helm install mai-release mdevslabs/mai-inference \
  --namespace mdevslabs \
  --create-namespace \
  --set image.tag=latest \
  --set resources.limits.nvidia.com/gpu=1 \
  --set resources.limits.memory=32Gi
```

### Configuration Personnalisée

```yaml
# values.yaml
image:
  repository: mdevslabs/mai-engine
  tag: v1.2.0
  pullPolicy: IfNotPresent

resources:
  limits:
    nvidia.com/gpu: 1
    memory: "32Gi"
    cpu: "8"
  requests:
    nvidia.com/gpu: 1
    memory: "16Gi"
    cpu: "4"

env:
  - name: OLLAMA_HOST
    value: "http://localhost:11434"
  - name: MDEVS_MODEL
    value: "mai-1"

service:
  type: LoadBalancer
  port: 80
  targetPort: 11434
```

---

## 🔧 Configuration GPU NVIDIA

### Device Plugin

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: nvidia-device-plugin
  namespace: kube-system
spec:
  selector:
    matchLabels:
      name: nvidia-device-plugin
  template:
    metadata:
      labels:
        name: nvidia-device-plugin
    spec:
      containers:
      - name: nvidia-device-plugin
        image: nvidia/nvidia-device-plugin:latest
        securityContext:
          capabilities:
            drop: ["ALL"]
        volumeMounts:
        - name: device-plugin
          mountPath: /var/lib/kubelet/device-plugins
      volumes:
      - name: device-plugin
        hostPath:
          path: /var/lib/kubelet/device-plugins
```

### GPU Scheduling

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: mai-gpu-pod
spec:
  containers:
  - name: mai-container
    image: mdevslabs/mai-engine:latest
    resources:
      limits:
        nvidia.com/gpu: 1
  nodeSelector:
    nvidia.com/gpu.present: "true"
  tolerations:
  - key: "nvidia.com/gpu"
    operator: "Exists"
    effect: "NoSchedule"
```

---

## 🌐 Service Mesh (Istio)

### VirtualService

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: mai-service
spec:
  hosts:
  - mai.mdevslabs.ai
  gateways:
  - mai-gateway
  http:
  - route:
    - destination:
        host: mai-inference-service
        port:
          number: 80
    retries:
      attempts: 3
      perTryTimeout: 2s
    timeout: 10s
```

### DestinationRule

```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: mai-destination
spec:
  host: mai-inference-service
  trafficPolicy:
    loadBalancer:
      simple: LEAST_CONN
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        http1MaxPendingRequests: 1000
        maxRequestsPerConnection: 10
```

---

## 📊 Monitoring & Alerting

### Prometheus Metrics

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: mai-monitor
  namespace: mdevslabs
spec:
  selector:
    matchLabels:
      app: mai-inference
  endpoints:
  - port: metrics
    interval: 30s
```

### Grafana Dashboard

```json
{
  "dashboard": {
    "title": "mAI Inference Metrics",
    "panels": [
      {
        "title": "Request Latency",
        "type": "graph",
        "targets": ["histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))"]
      },
      {
        "title": "GPU Utilization",
        "type": "gauge",
        "targets": ["nvidia_gpu_utilization{container='mai-container'}"]
      }
    ]
  }
}
```

---

## 🚀 CI/CD Pipeline (GitHub Actions)

```yaml
name: Deploy mAI to Kubernetes

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Kubeconfig
      uses: azure/setup-kubectl@v3
      with:
        version: 'v1.28.0'
    
    - name: Deploy to Kubernetes
      run: |
        kubectl config set-context --current --namespace=mdevslabs
        helm upgrade --install mai-release ./charts/mai-inference \
          --set image.tag=${{ github.sha }} \
          --wait
    
    - name: Run Smoke Tests
      run: |
        kubectl run test --rm -it --image=busybox -- sh -c "wget -qO- http://mai-inference-service/health"
```

---

## 📚 Ressources

- **Architecture** : [Vue d'ensemble](/docs?doc=arch-system-architecture)
- **Sécurité** : [Guide Privacy](/docs?doc=guide-security-privacy)
- **Ollama** : [Installation Guide](/docs?doc=guide-installation-ollama)
