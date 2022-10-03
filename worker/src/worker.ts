const AVAILABLE_JOBS = []

const job_runner = () => {
  AVAILABLE_JOBS.forEach(job => {
    job.start()
  })
}

job_runner()
