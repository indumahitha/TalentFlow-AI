
from sqlalchemy import Column, Integer, String, Text, ForeignKey
from database import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    company = Column(String(200), nullable=False)
    location = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    required_skills = Column(Text, nullable=False)


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(200), nullable=False)
    email = Column(String(200), unique=True, nullable=False, index=True)
    phone = Column(String(30), nullable=True)
    skills = Column(Text, nullable=False, default="")
    resume_filename = Column(String(255), nullable=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=True)
