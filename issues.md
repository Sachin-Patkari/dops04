# Issues and Fixes Documentation

## 📦 1. Docker & Local Development Issues

### Issue 1 — Wrong Docker Images Used

**Cause:** `docker-compose.prod.yml` used images belonging to another intern (`vanshp17/project-backend:latest`, `vanshp17/project-frontend:latest`). These private images cannot be pulled.

**Fix:** Replaced with correct image names for this project.

---

### Issue 2 — Backend Failed to Build (Missing package-lock.json)

**Cause:** Dockerfile used `RUN npm ci --only=production` but `npm ci` requires `package-lock.json`, which did not exist.

**Fix:** Replaced with `RUN npm install --production`.

---

### Issue 3 — Wrong Backend Port

**Cause:** Backend was changed from 5000 → 5001 in `docker-compose.prod.yml`.

**Fix:** Updated ports consistently across compose files.

---

### Issue 4 — Wrong Backend Start Command

**Cause:** Original command was `CMD ["node", "index.js"]` but backend entry file was actually `server.js`.

**Fix:** Updated to `CMD ["node", "server.js"]`.

---

### Issue 5 — No MongoDB Container / Env Variables

**Cause:** Backend expected MongoDB, but no DB service or environment variables were provided.

**Fix:** Added missing DB variables and corrected configuration.

---

### Issue 6 — Frontend Sending Wrong API Request

**Cause:** Frontend attempted `/REACT_APP_API_URL/api/orders` instead of `http://localhost:5001/api/orders`.

**Fix:** Corrected `.env` and updated reverse proxy settings.

---

### Issue 7 — Backend Dockerfile Was Broken

**Cause:** Missing `WORKDIR`, wrong `COPY` order, missing dependencies, wrong exposed port.

**Fix:** Rewrote complete Dockerfile, added `WORKDIR /app`, corrected `COPY` + install, exposed correct port (5000).

---

### Issue 8 — Frontend Could Not Reach Backend

**Cause:** Hardcoded IPs inside frontend.

**Fix:** Introduced Nginx reverse proxy, updated all API calls to `/api/*`, updated `proxy_pass http://backend:5000;`.

---

### Issue 9 — React SPA Refresh Returned 404

**Cause:** Nginx default config does not support SPA routing.

**Fix:** Added `try_files $uri /index.html;`.

---

### Issue 10 — nginx.conf Not Copied Into Docker Image

**Fix:** Corrected Dockerfile path and ensured `COPY nginx.conf /etc/nginx/conf.d/default.conf`.

---

### Issue 11 — Containers Couldn't Talk to Each Other

**Cause:** Wrong service names, missing network, missing `depends_on`, wrong backend port.

**Fix:** Created shared network, corrected ports, corrected service names, added `depends_on`.

---

### Issue 12 — Backend Not Reachable Inside Docker Network

**Fix:** Ensured backend reachable at `http://backend:5000`, updated Nginx `proxy_pass`, updated env variables.

---

### Issue 13 — Missing .dockerignore

**Fix:** Cleaned and optimized `.dockerignore`.

---

## ☁️ 2. Terraform / AWS Infrastructure Issues

### Issue 14 — Missing Variables

**Cause:** `main.tf` referenced undefined variables.

**Fix:** Added `variables.tf` with region + AMI variables.

---

### Issue 15 — Wrong AMI / Region

**Cause:** AMI belonged to another region.

**Fix:** Updated AMI for `ap-south-1` and hardcoded region if needed.

---

### Issue 16 — Broken Terraform File Structure

**Cause:** Mixed modules + raw resources.

**Fix:** Refactored Terraform folder, ran `terraform fmt`, passed `terraform validate`.

---

## 🔄 3. CI/CD (GitHub Actions) Issues

### Issue 17 — CI/CD YAML Indentation Errors

**Fix:** Rewrote CI/CD workflow and validated YAML syntax.

---

### Issue 18 — Wrong Dockerfile Paths

**Cause:** Used `./backend.Dockerfile` and `./frontend.Dockerfile` instead of `./backend/Dockerfile` and `./frontend/Dockerfile`.

**Fix:** Updated paths in workflow.

---

### Issue 19 — Docker Login Step Missing

**Fix:** Added `docker/login-action@v2` and configured secrets.

---

### Issue 20 — Wrong Build Context

**Cause:** Pipeline used `.` but needed folder-specific paths.

**Fix:** Changed to `docker build ./backend` and `docker build ./frontend`.

---

### Issue 21 — Missing OIDC Permissions

**Fix:** Added EC2 read-only permissions.

---

## 📡 4. Monitoring (Prometheus & Grafana)

### Issue 22 — Prometheus Couldn't Scrape Backend

**Cause:** Error `lookup backend on 127.0.0.11: server misbehaving`.

**Fix:** Added `extra_hosts` and updated target to `host.docker.internal:5000`.

---

### Issue 23 — Prometheus Using Old Config

**Fix:** Restarted container and updated config.

---

### Issue 24 — Grafana Showed Empty Dashboards

**Fix:** Corrected datasource and imported valid dashboard IDs.

---

### Issue 25 — Provisioning Failed (Wrong File Names)

**Fix:** Updated to `datasource-prometheus.yaml` and `dashboard-provider.yaml`.

---

## 🐳 5. Backend Issues

### Issue 26 — Deployment & Service Label Mismatch

**Fix:** Unified labels to `app: backend` and `app: frontend`.

---

### Issue 27 — Wrong containerPort

**Cause:** Backend uses port 5000.

**Fix:** Updated to `containerPort: 5000`.

---

### Issue 28 — Missing Namespace

**Fix:** Added `namespace: dops04`.

---

## 🟩 6. Backend Fixes (Prometheus + Metrics)

### Issue 29 — Prometheus Metrics Failed Due to ES Modules

**Fix:** Converted `require` → ESM import and added `/metrics` endpoint. Backend now exposes `http://app-backend-1:5000/metrics`.

---

## 🟩 7. Docker / Networking Fixes

### Issue 30 — Backend Port Not Published

**Cause:** Original container showed `5001/tcp` with no published port.

**Fix:** Published port correctly:
```yaml
ports:
  - "5001:5000"
```

---

### Issue 31 — Monitoring Stack Failed Due to Missing Network

**Fix:** Added:
```yaml
networks:
  app_default:
    external: true
```

---

### Issue 32 — Monitoring Files Missing on EC2

**Cause:** No S3 permissions.

**Fix:** Added S3 IAM policy. EC2 now auto-downloads monitoring files.

---

## 🟩 8. IAM Fixes

### Issue 33 — EC2 Could Not Access S3

**Fix:** Created IAM policy (`s3_monitoring_read`) and attached to EC2 role.

---

## 🟩 9. CI/CD Fixes (Advanced)

### Issue 34 — Wrong S3 Upload Order

**Fix:** Changed order to: Upload monitoring → Deploy app → Deploy monitoring.

---

### Issue 35 — Incorrect S3 Sync Paths

**Fix:** Updated paths to `monitoring/docker-compose.monitor.yml`, `monitoring/prometheus.yml`, `monitoring/grafana/*`.

---

## 🟩 10. Prometheus Fixes (Final)

### Issue 36 — Wrong Target Hostname

**Fix:** Updated to `app-backend-1:5000`.

---

## 🟩 11. Grafana Fixes (Final)

### Issue 37 — Old Dashboard Using Deprecated cAdvisor Metrics

**Fix:** Installed correct dashboards: `12000` (Docker Monitoring) and `14282` (cAdvisor Modern).

---

## 🟩 12. Terraform Fixes (Final)

### Issue 38 — Missing Security Group Ports

**Fix:** Added inbound rules for:
- `5001` — Backend
- `9090` — Prometheus
- `9100` — Node Exporter
- `8081` — cAdvisor
- `3000` — Grafana