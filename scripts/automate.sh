#!/usr/bin/env bash
# automate.sh -- One-file fully automated pipeline (DockerHub build+push -> Terraform -> FQDN env update -> deploy)
set -euo pipefail
IFS=$'\n\t'

### ---------- CONFIG ----------
LOCATION="centralindia"
RESOURCE_GROUP="devops-rg"
VM_NAME="devops-vm"
VM_USERNAME="azureuser"
SSH_KEY_PATH="${HOME}/.ssh/devops_intern_key"
TF_DIR="$(cd "$(dirname "$0")/../terraform" && pwd)"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

IMAGE_FRONTEND="vanshp17/devops-frontend:latest"
IMAGE_BACKEND="vanshp17/devops-backend:latest"

### ---------- CHECKS ----------
command -v az >/dev/null || { echo "Install Azure CLI"; exit 1; }
command -v terraform >/dev/null || { echo "Install Terraform"; exit 1; }
command -v docker >/dev/null || { echo "Install Docker"; exit 1; }

az account show >/dev/null 2>&1 || { echo "Run 'az login' first in this terminal"; exit 1; }

### ---------- SSH KEY ----------
if [[ ! -f "$SSH_KEY_PATH" ]]; then
  mkdir -p "$(dirname "$SSH_KEY_PATH")"
  ssh-keygen -t rsa -b 4096 -f "$SSH_KEY_PATH" -N "" >/dev/null
fi
SSH_PUB_KEY="$(cat "${SSH_KEY_PATH}.pub")"

### ---------- BUILD + PUSH IMAGES ----------
echo "🔐 DockerHub Login (enter password for vanshp17)"
read -s DH_PASS
echo
echo "$DH_PASS" | docker login -u "vanshp17" --password-stdin

echo "🐳 Building frontend image..."
docker build -t "$IMAGE_FRONTEND" "$ROOT_DIR/app/frontend"

echo "🐳 Building backend image..."
docker build -t "$IMAGE_BACKEND" "$ROOT_DIR/app/backend"

echo "📤 Pushing images to DockerHub..."
docker push "$IMAGE_FRONTEND" || { echo "ERROR: push frontend failed"; exit 1; }
docker push "$IMAGE_BACKEND" || { echo "ERROR: push backend failed"; exit 1; }

### ---------- ENSURE RESOURCE GROUP ----------
echo "-> Ensuring resource group exists: $RESOURCE_GROUP"
az group create --name "$RESOURCE_GROUP" --location "$LOCATION" --output none

### ---------- TERRAFORM APPLY ----------
pushd "$TF_DIR" >/dev/null
terraform init -input=false -no-color
terraform apply -auto-approve -input=false \
  -var "resource_group=$RESOURCE_GROUP" \
  -var "location=$LOCATION" \
  -var "vm_name=$VM_NAME" \
  -var "vm_username=$VM_USERNAME" \
  -var "ssh_public_key=$SSH_PUB_KEY"
# Fetch outputs (vm ip and fqdn). If fqdn not set in TF, public_fqdn may be empty.
VM_IP="$(terraform output -raw vm_public_ip || true)"
FQDN="$(terraform output -raw public_fqdn || true)"
popd >/dev/null

if [[ -z "$VM_IP" ]]; then
  echo "ERROR: Could not read vm_public_ip from Terraform outputs. Aborting."
  exit 1
fi
echo "🌍 VM Public IP = $VM_IP"

# If FQDN missing, attempt to fetch from Azure public IP resource
if [[ -z "$FQDN" || "$FQDN" == "null" ]]; then
  # try to discover the public IP resource name
  PIP_NAME="$(az network public-ip list -g "$RESOURCE_GROUP" --query "[0].name" -o tsv || true)"
  if [[ -n "$PIP_NAME" ]]; then
    FQDN="$(az network public-ip show -g "$RESOURCE_GROUP" -n "$PIP_NAME" --query "dnsSettings.fqdn" -o tsv || true)"
    if [[ "$FQDN" == "null" ]]; then
      FQDN=""
    fi
  fi
fi

# fall back to IP if fqdn still empty
if [[ -z "$FQDN" ]]; then
  echo "⚠️ public_fqdn not available from Terraform/Azure. Falling back to IP-based URLs."
  FQDN="$VM_IP"
fi

echo "🌐 FQDN = $FQDN"

### ---------- UPDATE .env FILES (overwrite safely) ----------
BACKEND_ENV="$ROOT_DIR/app/backend/.env"
FRONTEND_ENV="$ROOT_DIR/app/frontend/.env"

# preserve MONGO_URI if present
existing_mongo=""
if [[ -f "$BACKEND_ENV" ]]; then
  existing_mongo="$(grep -E '^MONGO_URI=' "$BACKEND_ENV" | cut -d'=' -f2- || true)"
fi

echo "🔧 Writing backend .env (preserving MONGO_URI if found)"
mkdir -p "$(dirname "$BACKEND_ENV")"
cat > "$BACKEND_ENV" <<EOF
MONGO_URI=${existing_mongo}
PORT=5000
SERVER_URL=http://$FQDN
EOF

echo "🔧 Writing frontend .env"
mkdir -p "$(dirname "$FRONTEND_ENV")"
cat > "$FRONTEND_ENV" <<EOF
REACT_APP_API_URL=http://$FQDN:5000
EOF

### ---------- PREPARE docker-compose on local and deploy to VM ----------
cat > /tmp/docker-compose.prod.yml <<EOF
version: "3.8"
services:
  backend:
    image: $IMAGE_BACKEND
    restart: always
    ports:
      - "5000:5000"
    environment:
      - SERVER_URL=http://$FQDN

  frontend:
    image: $IMAGE_FRONTEND
    restart: always
    ports:
      - "80:80"
    environment:
      - REACT_APP_API_URL=http://$FQDN:5000

  node-exporter:
    image: prom/node-exporter:latest
    restart: always
    pid: "host"
    network_mode: "host"
EOF

# Ensure SSH is reachable (retry loop)
echo "⏳ Waiting for SSH on VM ($VM_IP) to become available..."
SSH_OK=1
RETRIES=0
MAX_RETRIES=30
while [[ $RETRIES -lt $MAX_RETRIES ]]; do
  if ssh -o BatchMode=yes -o ConnectTimeout=5 -o StrictHostKeyChecking=no -i "$SSH_KEY_PATH" "$VM_USERNAME@$VM_IP" 'echo ok' >/dev/null 2>&1; then
    SSH_OK=0
    break
  fi
  RETRIES=$((RETRIES+1))
  echo " - SSH not ready yet ($RETRIES/$MAX_RETRIES). Waiting 5s..."
  sleep 5
done

if [[ $SSH_OK -ne 0 ]]; then
  echo "ERROR: SSH not available on $VM_IP after retries. Please check VM/networking and retry."
  exit 1
fi
echo "✅ SSH reachable."

# Copy compose file (explicit options)
echo "Copying docker-compose to VM..."
scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i "$SSH_KEY_PATH" /tmp/docker-compose.prod.yml "$VM_USERNAME@$VM_IP:/home/$VM_USERNAME/docker-compose.yml" || {
  echo "ERROR: scp failed. Aborting."
  exit 1
}

# On VM: install docker (if needed), place file, bring up containers
echo "Deploying compose on VM..."
ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i "$SSH_KEY_PATH" "$VM_USERNAME@$VM_IP" bash -s <<'REMOTE_EOF'
set -euo pipefail
# Ensure docker installed
if ! command -v docker >/dev/null 2>&1; then
  sudo apt-get update -y
  sudo apt-get install -y docker.io docker-compose-plugin
fi

mkdir -p ~/deploy
# Move compose file into deploy directory (overwrite)
mv -f ~/docker-compose.yml ~/deploy/docker-compose.yml || true

# Start containers
docker compose -f ~/deploy/docker-compose.yml pull || true
docker compose -f ~/deploy/docker-compose.yml up -d --remove-orphans

# small wait and show status
sleep 3
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
REMOTE_EOF

echo "✅ Remote deploy commands executed."

### ---------- POST-DEPLOY HEALTH CHECKS ----------
echo "Checking container & HTTP health on VM..."

ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i "$SSH_KEY_PATH" "$VM_USERNAME@$VM_IP" bash -s <<'CHECKS_EOF'
set -euo pipefail
echo "=== docker ps ==="
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"

echo
echo "=== backend health (local) ==="
if curl -s -I http://127.0.0.1:5000 | head -n1 | grep -q "200\|301\|302"; then
  echo "Backend HTTP OK (127.0.0.1:5000)"
else
  echo "Warning: Backend did not return 200 on 127.0.0.1:5000 (it might still be starting)"
fi

echo
echo "=== frontend health (local) ==="
if curl -s -I http://127.0.0.1 | head -n1 | grep -q "200\|301\|302"; then
  echo "Frontend HTTP OK (127.0.0.1)"
else
  echo "Warning: Frontend did not return 200 on 127.0.0.1 (it might still be starting)"
fi
CHECKS_EOF

echo
echo "✅ Deployment finished. Access app at: http://$FQDN  (or http://$VM_IP)"
