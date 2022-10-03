import { populateForLiberty } from '@jobs/populate-for-liberty.job'

const AVAILABLE_JOBS = [populateForLiberty]

const job_runner = () => {
  AVAILABLE_JOBS.forEach(job => {
    job.start()
  })
}

job_runner()
