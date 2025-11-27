🐛 Issues & Fixes Documentation
A comprehensive list of all issues encountered during the project setup and their solutions.

📦 1. Docker & Local Development Issues
Issue 1 — Wrong Docker Images Used
Cause:

docker-compose.prod.yml used images belonging to another intern:

vanshp17/project-backend:latest
vanshp17/project-frontend:latest


These private images cannot be pulled

Fix:
✅ Replaced with correct image names for this project

Issue 2 — Backend Failed to Build (Missing package-lock.json)
Cause:

Dockerfile used: RUN npm ci --only=production
npm ci requires package-lock.json, which did not exist

Fix:
✅ Replaced with: RUN npm install --production

Issue 3 — Wrong Backend Port
Cause:

Backend was changed from 5000 → 5001 in docker-compose.prod.yml

Fix:
✅ Updated ports consistently across compose files

Issue 4 — Wrong Backend Start Command
Cause:

Original: CMD ["node", "index.js"]
Backend entry file was actually server.js

Fix:
✅ Updated to: CMD ["node", "server.js"]

Issue 5 — No MongoDB Container / Env Variables
Cause:

Backend expected MongoDB, but no DB service or environment variables were provided

Fix:

✅ Added missing DB variables
✅ Corrected configuration


Issue 6 — Frontend Sending Wrong API Request
Cause:

Frontend attempted: /REACT_APP_API_URL/api/orders
Instead of: http://localhost:5001/api/orders

Fix:

✅ Corrected .env
✅ Updated reverse proxy settings


Issue 7 — Backend Dockerfile Was Broken
Problems:

Missing WORKDIR
Wrong COPY order
Missing dependencies
Wrong exposed port

Fix:

✅ Rewrote complete Dockerfile
✅ Added WORKDIR /app
✅ Corrected COPY + install
✅ Exposed correct port (5000)


Issue 8 — Frontend Could Not Reach Backend
Cause:

Hardcoded IPs inside frontend

Fix:

✅ Introduced Nginx reverse proxy
✅ Updated all API calls to /api/*
✅ Updated proxy_pass http://backend:5000;


Issue 9 — React SPA Refresh Returned 404
Cause:

Nginx default config does not support SPA routing

Fix:
✅ Added: try_files $uri /index.html;

Issue 10 — nginx.conf Not Copied Into Docker Image
Fix:

✅ Corrected Dockerfile path
✅ Ensured: COPY nginx.conf /etc/nginx/conf.d/default.conf


Issue 11 — Containers Couldn't Talk to Each Other
Causes:

Wrong service names
Missing network
Missing depends_on
Wrong backend port

Fix:

✅ Created shared network
✅ Corrected ports
✅ Corrected service names
✅ Added depends_on


Issue 12 — Backend Not Reachable Inside Docker Network
Fix:

✅ Ensured backend reachable at: http://backend:5000
✅ Updated Nginx proxy_pass
✅ Updated env variables


Issue 13 — Missing .dockerignore
Fix:
✅ Cleaned and optimized .dockerignore

☁️ 2. Terraform / AWS Infrastructure Issues
Issue 14 — Missing Variables
Cause:

main.tf referenced undefined variables

Fix:

✅ Added variables.tf
✅ Added region + AMI variables


Issue 15 — Wrong AMI / Region
Cause:

AMI belonged to another region

Fix:

✅ Updated AMI for ap-south-1
✅ Hardcoded region if needed


Issue 16 — Broken Terraform File Structure
Cause:

Mixed modules + raw resources

Fix:

✅ Refactored Terraform folder
✅ Ran terraform fmt
✅ Passed terraform validate


🔄 3. CI/CD (GitHub Actions) Issues
Issue 17 — CI/CD YAML Indentation Errors
Fix:

✅ Rewrote CI/CD workflow
✅ Validated YAML syntax


Issue 18 — Wrong Dockerfile Paths
Wrong:

./backend.Dockerfile
./frontend.Dockerfile

Correct:

./backend/Dockerfile
./frontend/Dockerfile

Fix:
✅ Updated paths in workflow

Issue 19 — Docker Login Step Missing
Fix:

✅ Added: docker/login-action@v2
✅ Configured secrets


Issue 20 — Wrong Build Context
Cause:

Pipeline used . but needed folder-specific paths

Fix:

✅ docker build ./backend
✅ docker build ./frontend


Issue 21 — Missing OIDC Permissions
Fix:
✅ Added EC2 read-only permissions

📡 4. Monitoring (Prometheus & Grafana)
Issue 22 — Prometheus Couldn't Scrape Backend
Error:
lookup backend on 127.0.0.11: server misbehaving
Fix:

✅ Added extra_hosts
✅ Updated target: host.docker.internal:5000


Issue 23 — Prometheus Using Old Config
Fix:

✅ Restarted container
✅ Updated config


Issue 24 — Grafana Showed Empty Dashboards
Fix:

✅ Corrected datasource
✅ Imported valid dashboard IDs


Issue 25 — Provisioning Failed (Wrong File Names)
Fix:
✅ Updated:

datasource-prometheus.yaml
dashboard-provider.yaml


🐳 5. Kubernetes Issues
Issue 26 — Deployment & Service Label Mismatch
Fix:
✅ Unified:

app: backend
app: frontend


Issue 27 — Wrong containerPort
Cause:

Backend uses port 5000

Fix:
✅ Updated: containerPort: 5000

Issue 28 — Missing Namespace
Fix:
✅ Added: namespace: dops04

🟩 6. Backend Fixes (Prometheus + Metrics)
Issue 29 — Prometheus Metrics Failed Due to ES Modules
Fix:

✅ Converted require → ESM import
✅ Added /metrics endpoint

Result:
Backend now exposes: http://app-backend-1:5000/metrics

🟩 7. Docker / Networking Fixes
Issue 30 — Backend Port Not Published
Cause:

Original container showed: 5001/tcp (no published port)

Fix:
✅ Published port correctly:
yamlports:
  - "5001:5000"

Issue 31 — Monitoring Stack Failed Due to Missing Network
Fix:
✅ Added:
yamlnetworks:
  app_default:
    external: true

Issue 32 — Monitoring Files Missing on EC2
Cause:

No S3 permissions

Fix:

✅ Added S3 IAM policy
✅ EC2 now auto-downloads monitoring files


🟩 8. IAM Fixes
Issue 33 — EC2 Could Not Access S3
Fix:

✅ Created IAM policy (s3_monitoring_read)
✅ Attached to EC2 role


🟩 9. CI/CD Fixes (Advanced)
Issue 34 — Wrong S3 Upload Order
Fix:
✅ Upload monitoring → Deploy app → Deploy monitoring

Issue 35 — Incorrect S3 Sync Paths
Fix:
✅ Updated paths:

monitoring/docker-compose.monitor.yml
monitoring/prometheus.yml
monitoring/grafana/*


🟩 10. Prometheus Fixes (Final)
Issue 36 — Wrong Target Hostname
Fix:
✅ Updated to: app-backend-1:5000

🟩 11. Grafana Fixes (Final)
Issue 37 — Old Dashboard Using Deprecated cAdvisor Metrics
Fix:
✅ Installed correct dashboards:

12000 (Docker Monitoring)
14282 (cAdvisor Modern)


🟩 12. Terraform Fixes (Final)
Issue 38 — Missing Security Group Ports
Fix:
✅ Added inbound rules:

5001 — Backend
9090 — Prometheus
9100 — Node Exporter
8081 — cAdvisor
3000 — Grafana