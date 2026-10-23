import mimetypes
import boto3
from botocore.exceptions import BotoCoreError, ClientError
import os
import shutil
from pathlib import Path

from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from database import SessionLocal, engine, Base
from models import Job, Candidate


# -------------------- APP SETUP --------------------

app = FastAPI(
    title="TalentFlow AI",
    description="AI-powered recruitment and candidate management API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
S3_BUCKET = os.getenv("S3_BUCKET", "").strip()
AWS_REGION = os.getenv("AWS_REGION", "eu-north-1")

s3_client = boto3.client("s3", region_name=AWS_REGION)


# -------------------- DATABASE --------------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------------------- REQUEST SCHEMAS --------------------

class JobCreate(BaseModel):
    title: str
    company: str
    location: str
    description: str
    required_skills: str


class CandidateCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str | None = None
    skills: str = ""
    job_id: int | None = None


# -------------------- HEALTH CHECK --------------------

@app.get("/")
def home():
    return {
        "message": "Welcome to TalentFlow AI!",
        "status": "running",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "TalentFlow AI API",
    }


# -------------------- JOB ENDPOINTS --------------------

@app.get("/jobs")
def list_jobs(db: Session = Depends(get_db)):
    jobs = db.query(Job).order_by(Job.id.desc()).all()
    return {"total": len(jobs), "jobs": jobs}


@app.post("/jobs", status_code=201)
def create_job(job_data: JobCreate, db: Session = Depends(get_db)):
    job = Job(**job_data.model_dump())
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@app.get("/jobs/{job_id}")
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@app.put("/jobs/{job_id}")
def update_job(
    job_id: int,
    job_data: JobCreate,
    db: Session = Depends(get_db),
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    for key, value in job_data.model_dump().items():
        setattr(job, key, value)

    db.commit()
    db.refresh(job)
    return job


@app.delete("/jobs/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    db.delete(job)
    db.commit()
    return {"message": "Job deleted successfully"}


# -------------------- CANDIDATE ENDPOINTS --------------------

@app.get("/candidates")
def list_candidates(db: Session = Depends(get_db)):
    candidates = (
        db.query(Candidate)
        .order_by(Candidate.id.desc())
        .all()
    )
    return {"total": len(candidates), "candidates": candidates}


@app.post("/candidates", status_code=201)
def create_candidate(
    candidate_data: CandidateCreate,
    db: Session = Depends(get_db),
):
    existing = (
        db.query(Candidate)
        .filter(Candidate.email == str(candidate_data.email))
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="A candidate with this email already exists",
        )

    if candidate_data.job_id is not None:
        job = db.query(Job).filter(
            Job.id == candidate_data.job_id
        ).first()

        if not job:
            raise HTTPException(
                status_code=404,
                detail="Linked job not found",
            )

  
    candidate_payload = candidate_data.model_dump()
    candidate_payload["email"] = str(candidate_data.email)

    candidate = Candidate(**candidate_payload)

    db.add(candidate)
    db.commit()
    db.refresh(candidate)

    return candidate



# -------------------- RESUME UPLOAD --------------------

# -------------------- RESUME UPLOAD --------------------

@app.post("/candidates/{candidate_id}/resume")
async def upload_resume(
    candidate_id: int,
    resume: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    candidate = (
        db.query(Candidate)
        .filter(Candidate.id == candidate_id)
        .first()
    )

    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    extension = Path(resume.filename or "").suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, DOC, and DOCX resumes are allowed",
        )

    content = await resume.read(MAX_FILE_SIZE + 1)
    await resume.close()

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Resume must be 5 MB or smaller",
        )

    safe_filename = f"candidate_{candidate_id}{extension}"
    content_type = (
        resume.content_type
        or mimetypes.guess_type(safe_filename)[0]
        or "application/octet-stream"
    )

    if S3_BUCKET:
        object_key = f"resumes/{safe_filename}"

        try:
            s3_client.put_object(
                Bucket=S3_BUCKET,
                Key=object_key,
                Body=content,
                ContentType=content_type,
                ServerSideEncryption="AES256",
            )
        except (BotoCoreError, ClientError) as exc:
            raise HTTPException(
                status_code=502,
                detail="Resume could not be stored in S3",
            ) from exc

        storage_location = "s3"
    else:
        destination = UPLOAD_DIR / safe_filename
        destination.write_bytes(content)
        storage_location = "local"

    candidate.resume_filename = safe_filename
    db.commit()
    db.refresh(candidate)

    return {
        "message": "Resume uploaded successfully",
        "candidate_id": candidate_id,
        "filename": safe_filename,
        "storage": storage_location,
        "size_bytes": len(content),
    }


@app.get("/candidates/{candidate_id}/resume")
def get_resume_details(
    candidate_id: int,
    db: Session = Depends(get_db),
):
    candidate = (
        db.query(Candidate)
        .filter(Candidate.id == candidate_id)
        .first()
    )

    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    if not candidate.resume_filename:
        raise HTTPException(
            status_code=404,
            detail="No resume uploaded for this candidate",
        )

    if S3_BUCKET:
        object_key = f"resumes/{candidate.resume_filename}"

        try:
            download_url = s3_client.generate_presigned_url(
                "get_object",
                Params={
                    "Bucket": S3_BUCKET,
                    "Key": object_key,
                },
                ExpiresIn=900,
            )
        except (BotoCoreError, ClientError) as exc:
            raise HTTPException(
                status_code=502,
                detail="Could not create resume download link",
            ) from exc

        return {
            "candidate_id": candidate_id,
            "filename": candidate.resume_filename,
            "storage": "s3",
            "download_url": download_url,
            "expires_in_seconds": 900,
        }

    local_file = UPLOAD_DIR / candidate.resume_filename

    if not local_file.is_file():
        raise HTTPException(
            status_code=404,
            detail="Resume file was not found in local storage",
        )

    return {
        "candidate_id": candidate_id,
        "filename": candidate.resume_filename,
        "storage": "local",
    }

