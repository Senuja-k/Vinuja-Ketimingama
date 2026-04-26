# TokoXpress Deployment Script

# 1. Build Frontend
cd frontend
npm run build
docker build -t tokoxpress-frontend .
cd ..

# 2. Build Backend
cd backend
docker build -t tokoxpress-backend .
cd ..

# 3. Apply Kubernetes Manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/mysql.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml

Write-Host "Deployment complete! Use 'kubectl get pods -n tokoxpress' to check status."
