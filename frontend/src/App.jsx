
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://16.16.187.71:8000";

const emptyCandidate = {
  full_name: "",
  email: "",
  phone: "",
  skills: "",
  job_id: "",
};

function App() {
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [candidateLoading, setCandidateLoading] = useState(true);
  const [error, setError] = useState("");
  const [candidateError, setCandidateError] = useState("");
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [candidateForm, setCandidateForm] = useState(emptyCandidate);
  const [savingCandidate, setSavingCandidate] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [formError, setFormError] = useState(false);

  const [resumeFiles, setResumeFiles] = useState({});
  const [resumeMessages, setResumeMessages] = useState({});
  const [uploadingResume, setUploadingResume] = useState({});

  async function loadJobs() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/jobs`);
      if (!response.ok) throw new Error("Unable to load jobs");

      const data = await response.json();
      setJobs(data.jobs || []);
    } catch {
      setError(
        "Could not load jobs. Check that FastAPI is running on port 8001."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadCandidates() {
    try {
      setCandidateLoading(true);
      setCandidateError("");

      const response = await fetch(`${API_URL}/candidates`);
      if (!response.ok) throw new Error("Unable to load candidates");

      const data = await response.json();
      setCandidates(data.candidates || []);
    } catch {
      setCandidateError("Could not load candidates. Please try again.");
    } finally {
      setCandidateLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
    loadCandidates();
  }, []);

  function updateCandidate(field, value) {
    setCandidateForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleRegisterCandidate(event) {
    event.preventDefault();
    setSavingCandidate(true);
    setFormMessage("");
    setFormError(false);

    const payload = {
      ...candidateForm,
      job_id: candidateForm.job_id
        ? Number(candidateForm.job_id)
        : null,
    };

    try {
      const response = await fetch(`${API_URL}/candidates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Could not register candidate."
        );
      }

      setFormMessage("Candidate registered successfully!");
      setCandidateForm(emptyCandidate);
      setShowCandidateForm(false);
      await loadCandidates();
    } catch (err) {
      setFormError(true);
      setFormMessage(err.message || "Could not connect to the backend.");
    } finally {
      setSavingCandidate(false);
    }
  }

  function handleResumeSelection(candidateId, file) {
    setResumeFiles((previous) => ({
      ...previous,
      [candidateId]: file || null,
    }));

    setResumeMessages((previous) => ({
      ...previous,
      [candidateId]: "",
    }));
  }

  async function handleResumeUpload(candidateId) {
    const file = resumeFiles[candidateId];

    if (!file) {
      setResumeMessages((previous) => ({
        ...previous,
        [candidateId]: "Please choose a resume file first.",
      }));
      return;
    }

    const allowedExtensions = [".pdf", ".doc", ".docx"];
    const extension = file.name
      .slice(file.name.lastIndexOf("."))
      .toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      setResumeMessages((previous) => ({
        ...previous,
        [candidateId]: "Only PDF, DOC, and DOCX files are allowed.",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setResumeMessages((previous) => ({
        ...previous,
        [candidateId]: "Resume must be 5 MB or smaller.",
      }));
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    setUploadingResume((previous) => ({
      ...previous,
      [candidateId]: true,
    }));

    setResumeMessages((previous) => ({
      ...previous,
      [candidateId]: "",
    }));

    try {
      const response = await fetch(
        `${API_URL}/candidates/${candidateId}/resume`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Resume upload failed."
        );
      }

      setResumeMessages((previous) => ({
        ...previous,
        [candidateId]: `Resume uploaded successfully: ${data.filename}`,
      }));

      setResumeFiles((previous) => ({
        ...previous,
        [candidateId]: null,
      }));

      await loadCandidates();
    } catch (err) {
      setResumeMessages((previous) => ({
        ...previous,
        [candidateId]:
          err.message || "Could not connect to the backend.",
      }));
    } finally {
      setUploadingResume((previous) => ({
        ...previous,
        [candidateId]: false,
      }));
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">T</div>
          <div>
            <h1>
              TalentFlow <span>AI</span>
            </h1>
            <p>Recruitment Management Platform</p>
          </div>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          Local workspace
        </div>
      </header>

      <main className="container">
        <section className="welcome">
          <div>
            <p className="eyebrow">TALENT MANAGEMENT</p>
            <h2>Find your next great hire.</h2>
            <p className="subtitle">
              Manage job openings, register candidates, and upload resumes
              in one recruitment workspace.
            </p>
          </div>
          <div className="welcome-art">✦</div>
        </section>

        <section className="stats">
          <div className="stat-card">
            <p>Total job openings</p>
            <h3>{jobs.length}</h3>
            <span>Jobs in your workspace</span>
          </div>

          <div className="stat-card">
            <p>Total candidates</p>
            <h3>{candidates.length}</h3>
            <span>Registered candidates</span>
          </div>

          <div className="stat-card">
            <p>Platform status</p>
            <h3 className="active-text">
              {error ? "Offline" : loading ? "Loading..." : "Active"}
            </h3>
            <span>FastAPI connection</span>
          </div>
        </section>

        <section className="jobs-section">
          <div className="section-heading">
            <div>
              <h2>Job openings</h2>
              <p>Roles currently stored in your database.</p>
            </div>
            <button className="refresh-button" onClick={loadJobs}>
              ↻ Refresh
            </button>
          </div>

          {loading && <p className="message">Loading jobs...</p>}
          {error && <div className="error-message">{error}</div>}

          {!loading && !error && jobs.length === 0 && (
            <div className="empty-state">No jobs found yet.</div>
          )}

          {!loading && !error && (
            <div className="job-list">
              {jobs.map((job) => {
                const skills = Array.isArray(job.required_skills)
                  ? job.required_skills
                  : (job.required_skills || "")
                      .split(",")
                      .map((skill) => skill.trim())
                      .filter(Boolean);

                return (
                  <article className="job-card" key={job.id}>
                    <div className="job-icon">JD</div>
                    <div className="job-details">
                      <h3>{job.title}</h3>
                      <p className="company">
                        {job.company} · {job.location}
                      </p>
                      <p className="description">{job.description}</p>
                      <div className="skills">
                        {skills.map((skill) => (
                          <span className="skill" key={skill}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="job-id">ID #{job.id}</span>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="jobs-section">
          <div className="section-heading">
            <div>
              <h2>Registered candidates</h2>
              <p>Candidate profiles and their resume uploads.</p>
            </div>

            <button
              type="button"
              className="refresh-button"
              onClick={() => {
                setShowCandidateForm((visible) => !visible);
                setFormMessage("");
              }}
            >
              {showCandidateForm ? "Cancel" : "+ Register Candidate"}
            </button>
          </div>

          {formMessage && (
            <p className={formError ? "form-error" : "form-success"}>
              {formMessage}
            </p>
          )}

          {showCandidateForm && (
            <form
              className="create-job-form"
              onSubmit={handleRegisterCandidate}
            >
              <h3>Register a candidate</h3>

              <label>
                Full name
                <input
                  required
                  value={candidateForm.full_name}
                  onChange={(event) =>
                    updateCandidate("full_name", event.target.value)
                  }
                  placeholder="Candidate full name"
                />
              </label>

              <label>
                Email
                <input
                  required
                  type="email"
                  value={candidateForm.email}
                  onChange={(event) =>
                    updateCandidate("email", event.target.value)
                  }
                  placeholder="candidate@example.com"
                />
              </label>

              <label>
                Phone
                <input
                  value={candidateForm.phone}
                  onChange={(event) =>
                    updateCandidate("phone", event.target.value)
                  }
                  placeholder="Phone number"
                />
              </label>

              <label>
                Skills (comma-separated)
                <input
                  value={candidateForm.skills}
                  onChange={(event) =>
                    updateCandidate("skills", event.target.value)
                  }
                  placeholder="Python, SQL, Excel"
                />
              </label>

              <label>
                Link to a job
                <select
                  value={candidateForm.job_id}
                  onChange={(event) =>
                    updateCandidate("job_id", event.target.value)
                  }
                >
                  <option value="">No job assigned</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} (ID #{job.id})
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="submit"
                className="refresh-button"
                disabled={savingCandidate}
              >
                {savingCandidate ? "Registering..." : "Register Candidate"}
              </button>
            </form>
          )}

          {candidateLoading && (
            <p className="message">Loading candidates...</p>
          )}

          {candidateError && (
            <div className="error-message">
              {candidateError}
              <button onClick={loadCandidates}>Try again</button>
            </div>
          )}

          {!candidateLoading &&
            !candidateError &&
            candidates.length === 0 && (
              <div className="empty-state">
                No candidates registered yet.
              </div>
            )}

          {!candidateLoading &&
            !candidateError &&
            candidates.length > 0 && (
              <div className="job-list">
                {candidates.map((candidate) => (
                  <article className="job-card" key={candidate.id}>
                    <div className="job-icon">
                      {candidate.full_name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>

                    <div className="job-details">
                      <h3>{candidate.full_name}</h3>
                      <p className="company">{candidate.email}</p>
                      <p className="description">
                        Phone: {candidate.phone || "Not provided"}
                      </p>

                      <div className="skills">
                        {(candidate.skills || "")
                          .split(",")
                          .map((skill) => skill.trim())
                          .filter(Boolean)
                          .map((skill) => (
                            <span className="skill" key={skill}>
                              {skill}
                            </span>
                          ))}
                      </div>

                      <p className="company">
                        Linked job:{" "}
                        {candidate.job_id
                          ? jobs.find((job) => job.id === candidate.job_id)
                              ?.title || `Job #${candidate.job_id}`
                          : "Not assigned"}
                      </p>

                      <p className="company">
                        Resume:{" "}
                        {candidate.resume_filename || "Not uploaded yet"}
                      </p>

                      <div className="resume-upload">
                        <label>
                          Upload resume (PDF, DOC, DOCX, max 5 MB)
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(event) =>
                              handleResumeSelection(
                                candidate.id,
                                event.target.files?.[0] || null
                              )
                            }
                          />
                        </label>

                        <button
                          type="button"
                          className="refresh-button"
                          disabled={Boolean(uploadingResume[candidate.id])}
                          onClick={() => handleResumeUpload(candidate.id)}
                        >
                          {uploadingResume[candidate.id]
                            ? "Uploading..."
                            : "Upload Resume"}
                        </button>

                        {resumeMessages[candidate.id] && (
                          <p
                            className={
                              resumeMessages[candidate.id].startsWith(
                                "Resume uploaded successfully"
                              )
                                ? "form-success"
                                : "form-error"
                            }
                          >
                            {resumeMessages[candidate.id]}
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="job-id">ID #{candidate.id}</span>
                  </article>
                ))}
              </div>
            )}
        </section>

        <footer>
          TalentFlow AI · Built with React, FastAPI and PostgreSQL
        </footer>
      </main>
    </div>
  );
}

export default App;
