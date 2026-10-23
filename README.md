# TalentFlow AI 🚀
### AI-Powered Recruitment and Talent Management Platform

TalentFlow AI is a recruitment management application designed to streamline job and candidate management through a web interface and REST API. The project combines a React frontend, FastAPI backend, PostgreSQL database, Docker containerization, and AWS infrastructure automation using Terraform.

**GitHub Repository:** https://github.com/indumahitha/TalentFlow-AI

---

## 📌 Project Overview

TalentFlow AI provides a foundation for managing recruitment workflows, including job listings, candidate records, and resume-related operations.

The project also explores cloud deployment practices, container image management, infrastructure as code, and AWS security fundamentals.

### Key Features

- Job management through REST API endpoints
- Candidate registration and management
- PostgreSQL database integration using SQLAlchemy
- Interactive API documentation using FastAPI Swagger UI
- Resume upload functionality in the backend
- React-based frontend
- Docker image creation for the backend
- Amazon ECR container image storage
- Terraform-managed AWS networking and storage resources

## 🛠️ Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React, JavaScript, Vite |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Containerization | Docker |
| Container Registry | Amazon ECR |
| Cloud Platform | AWS |
| Infrastructure as Code | Terraform |
| Version Control | Git, GitHub |

## 🏗️ Architecture

```text
                User
                 |
                 v
          React Frontend
                 |
                 v
          FastAPI REST API
                 |
                 v
             SQLAlchemy
                 |
                 v
            PostgreSQL


       Backend Container Image
                 |
                 v
          Amazon ECR

      Terraform-managed AWS:
       VPC, Subnets, Security
       Groups and Amazon S3
```

The application can be deployed to an AWS compute service using the image stored in ECR. A complete live AWS hosting environment is not currently claimed as deployed.

## 📂 Project Structure

```text
TalentFlow-AI/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .dockerignore
│   └── .env.example
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── infrastructure/
│   ├── main.tf
│   ├── storage.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── README.md
│
└── .gitignore
```

## ⚙️ Local Setup

### Prerequisites

Install the following tools:

- Python 3
- Node.js and npm
- PostgreSQL
- Docker (optional for local container execution)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/indumahitha/TalentFlow-AI.git
cd TalentFlow-AI
```

### 2. Configure the backend

Open a terminal in the project root and run:

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment.

**Windows PowerShell:**

```powershell
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure the database

Create a PostgreSQL database named `talentflow_db`.

Set the `DATABASE_URL` environment variable to match your local PostgreSQL configuration. For example, in Windows PowerShell:

```powershell
$env:DATABASE_URL = "postgresql+psycopg://USERNAME:PASSWORD@localhost:5432/talentflow_db"
```

Replace `USERNAME` and `PASSWORD` with your local PostgreSQL credentials. Do not commit real credentials to GitHub.

### 4. Start the backend

From the `backend` directory, run:

```bash
python -m uvicorn main:app --reload
```

When the server starts successfully, open:

- **API documentation:** http://127.0.0.1:8000/docs
- **Local API:** http://127.0.0.1:8000

These addresses work on your own computer while the backend is running. They are not public deployment URLs.

### 5. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite in the terminal. Configure the frontend API URL to point to the running backend, according to the frontend's existing configuration.

## 🐳 Docker

Build the backend image from the project root:

```bash
docker build -t talentflow-ai-backend ./backend
```

Run the image by providing a valid `DATABASE_URL` and the required database connectivity:

```bash
docker run --rm -p 8000:8000 -e DATABASE_URL="YOUR_DATABASE_URL" talentflow-ai-backend
```

Replace `YOUR_DATABASE_URL` with a valid connection string. The database hostname must be reachable from inside the container. `localhost` inside a container refers to that container, not automatically to your host machine.

## ☁️ AWS Implementation

The project includes Terraform configuration for selected AWS resources.

| AWS resource | Implementation status |
|---|---|
| Amazon VPC | Configured |
| Public and private subnet definitions | Configured |
| Internet Gateway and public routing | Configured |
| Security Groups | Configured |
| Amazon S3 | Bucket created with public-access blocking, encryption, and versioning |
| Amazon ECR | Repository created; backend image pushed |
| EC2 / ECS application hosting | Not currently verified as running |
| Application Load Balancer | Not currently verified as deployed |
| Amazon RDS and event-driven services | Future implementation / not verified as deployed |

**AWS region:** `eu-north-1`

**ECR repository:**

`202533542986.dkr.ecr.eu-north-1.amazonaws.com/talentflow-ai-backend`

The Docker image has been pushed to Amazon ECR with the `latest` tag. Additional AWS services should be treated as planned enhancements unless they are separately deployed and tested.

## 🔐 Security Considerations

- Keep passwords, tokens, AWS credentials, and private keys out of source control.
- Use environment variables or a secrets manager for sensitive configuration.
- Do not commit candidate resumes or personal data.
- Keep S3 public access blocked unless public access is explicitly required.
- Apply least-privilege IAM permissions.
- Review AWS resource usage and clean up resources that are no longer needed.

## 💰 Cost Awareness

Some AWS services may incur charges, including EC2, RDS, ECR storage, S3, load balancers, NAT gateways, and data transfer.

Review AWS billing and resource usage before creating additional services. Stop or remove resources that are no longer needed, while preserving any evidence required for project evaluation.

## 🚧 Future Enhancements

- Complete AWS application deployment and expose a tested endpoint
- Connect the frontend to the deployed backend
- Add managed database hosting and private database networking
- Configure HTTPS, DNS, and load balancing
- Add CloudWatch alarms and comprehensive application monitoring
- Integrate event-driven workflows with Lambda, SQS, SNS, and EventBridge
- Expand automated infrastructure provisioning and security validation

## 👩‍💻 Author

**Indu Mahitha Madireddy**

GitHub: https://github.com/indumahitha

## 📄 License

No license has been specified yet. All rights remain with the project owner unless a license is added to this repository.
