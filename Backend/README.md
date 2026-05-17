# Backend Deployment Guide (Amazon Linux 2023)

This guide explains how to deploy the Dhuno Backend as a standalone container on an AWS EC2 instance running Amazon Linux 2023.

## 1. Prepare EC2 Instance

### Security Group
Ensure your EC2 Security Group allows:
- **SSH**: Port 22
- **API**: Port 4000 (Custom TCP)

### Install Docker
Connect to your instance via SSH and run:

```bash
# Update system
sudo dnf update -y

# Install Docker
sudo dnf install docker -y

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to the docker group (to run without sudo)
sudo usermod -aG docker $USER

# RE-CONNECT to your SSH session for group changes to take effect
```

## 2. Deploy the Backend

1. **Clone/Copy Files**:
   Navigate to the `Backend` folder on your server.

2. **Configure Environment**:
   Create a `.env` file with your production credentials:
   ```bash
   nano .env
   ```

3. **Build the Image**:
   ```bash
   docker build -t dhuno-backend .
   ```

4. **Run the Container**:
   ```bash
   docker run -d \
     --name dhuno-api \
     -p 4000:4000 \
     --env-file .env \
     --restart always \
     dhuno-backend
   ```

## 3. Auto-Deployment (CI/CD)

A GitHub Action is configured in `.github/workflows/backend-deploy.yml`. To enable auto-deploy:

### Set up GitHub Secrets
In your GitHub repository, go to **Settings > Secrets and variables > Actions** and add the following:

1.  **`EC2_HOST`**: The Public IP of your EC2 instance.
2.  **`EC2_USER`**: Your SSH username (e.g., `ec2-user` for Amazon Linux).
3.  **`EC2_SSH_KEY`**: The full content of your private `.pem` key.

### Ensure GitHub can connect
1.  **Permissions**: Ensure your private key on GitHub has permissions to connect.
2.  **Path**: The workflow assumes the project is cloned at `~/Dhuno`. If you cloned it elsewhere, update the `cd` command in `.github/workflows/backend-deploy.yml`.

## 4. Maintenance

- **View Logs**: `docker logs -f dhuno-api`
- **Stop API**: `docker stop dhuno-api`
- **Update API**:
  ```bash
  git pull
  docker build -t dhuno-backend .
  docker stop dhuno-api
  docker rm dhuno-api
  # Run the container again (step 4 above)
  ```

