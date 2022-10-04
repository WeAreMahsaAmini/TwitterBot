import { populateForLiberty } from '@jobs/populate-for-liberty.job'

const AVAILABLE_JOBS = [populateForLiberty]

const job_runner = () => {
  Promise.all(AVAILABLE_JOBS.map(job => job()))
}

job_runner()
