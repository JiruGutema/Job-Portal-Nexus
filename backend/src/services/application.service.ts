import { ApplicationRepository } from "../repositories/application.repository";
import {
  Application,
  ApplyToJobData,
  UpdateApplicationStatus,
} from "../models/Application";

export class ApplicationService {
  private applicationRepository: ApplicationRepository;

  constructor() {
    this.applicationRepository = new ApplicationRepository();
  }

  // Apply to a job with duplicate check
  async applyToJob(applyData: ApplyToJobData): Promise<Application> {
    const { job_id, seeker_id } = applyData;

    // Check if user already applied to this job
    const existingApplication =
      await this.applicationRepository.checkExistingApplication(
        job_id,
        seeker_id
      );

    if (existingApplication) {
      throw new Error("You have already applied to this job");
    }

    // Create new application
    return await this.applicationRepository.applyToJob(applyData);
  }

  // Get applications for a specific job with ownership check
  async getApplicationsForJob(
    jobId: number,
    employerId: number
  ): Promise<Application[]> {
    if (!jobId || jobId <= 0) {
      throw new Error("Valid job ID is required");
    }

    // Use the repository method that already includes ownership check
    const ownsJob =
      await this.applicationRepository.checkEmployerJobOwnershipByJobId(
        jobId,
        employerId
      );

    if (!ownsJob) {
      throw new Error("You can only view applications for your own jobs");
    }

    return await this.applicationRepository.getApplicationsForJob(jobId);
  }

  // Get applications for a job seeker
  async getApplicationsForSeeker(seekerId: number): Promise<Application[]> {
    if (!seekerId || seekerId <= 0) {
      throw new Error("Valid seeker ID is required");
    }

    return await this.applicationRepository.getApplicationsForSeeker(seekerId);
  }

  // Update application status with ownership check
  async updateApplicationStatus(
    applicationId: number,
    statusData: UpdateApplicationStatus,
    employerId: number
  ): Promise<Application | null> {
    const { status } = statusData;

    if (!applicationId || applicationId <= 0) {
      throw new Error("Valid application ID is required");
    }

    // Check if application exists and get job details
    const applicationWithJob =
      await this.applicationRepository.getApplicationWithJobDetails(
        applicationId
      );

    if (!applicationWithJob) {
      throw new Error("Application not found");
    }

    // Verify that the employer owns the job for this application
    const ownsJob = await this.applicationRepository.checkEmployerJobOwnership(
      applicationId,
      employerId
    );

    if (!ownsJob) {
      throw new Error("You can only update applications for your own jobs");
    }

    return await this.applicationRepository.updateApplicationStatus(
      applicationId,
      statusData
    );
  }

  // Withdraw application with ownership check
  async withdrawApplication(
    applicationId: number,
    seekerId: number
  ): Promise<boolean> {
    if (!applicationId || applicationId <= 0) {
      throw new Error("Valid application ID is required");
    }

    // Check if application exists and belongs to seeker
    const existingApplication =
      await this.applicationRepository.getApplicationById(applicationId);

    if (!existingApplication) {
      throw new Error("Application not found");
    }

    if (existingApplication.seeker_id !== seekerId) {
      throw new Error("You can only withdraw your own applications");
    }

    return await this.applicationRepository.withdrawApplication(
      applicationId,
      seekerId
    );
  }

  // Get application by ID
  async getApplicationById(applicationId: number): Promise<Application | null> {
    if (!applicationId || applicationId <= 0) {
      throw new Error("Valid application ID is required");
    }

    return await this.applicationRepository.getApplicationById(applicationId);
  }
}
