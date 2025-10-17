import { Response, NextFunction } from "express";
import { ApplicationService } from "../services/application.service";
import { ApplyToJobData, UpdateApplicationStatus } from "../models/Application";
import { AuthRequest } from "../middlewares/auth.middleware";

export class ApplicationController {
  private applicationService: ApplicationService;

  constructor() {
    this.applicationService = new ApplicationService();
  }

  // Apply to a job (Seeker only)
  async applyToJob(
    request: AuthRequest,
    response: Response,
    next: NextFunction
  ) {
    try {
      const job_id = parseInt(request.params.id);
      const seeker_id = request.user!.id;

      if (!job_id || job_id <= 0) {
        return response.status(400).json({
          success: false,
          message: "Valid job ID is required",
        });
      }

      const applyData: ApplyToJobData = {
        job_id,
        seeker_id,
      };

      const application = await this.applicationService.applyToJob(applyData);

      response.status(201).json({
        success: true,
        message: "Successfully applied to job",
        data: application,
      });
    } catch (error: any) {
      console.error("Apply to job error:", error);

      if (error.message === "You have already applied to this job") {
        return response.status(409).json({
          success: false,
          message: error.message,
        });
      }

      response.status(500).json({
        success: false,
        message: "Failed to apply to job",
      });
    }
  }

  // Get applications for a specific job (Employer only)
  async getApplicationsForJob(
    request: AuthRequest,
    response: Response,
    next: NextFunction
  ) {
    try {
      const job_id = parseInt(request.params.id);
      const employer_id = request.user!.id; // From auth middleware

      // Pass employer_id for ownership validation
      const applications = await this.applicationService.getApplicationsForJob(
        job_id,
        employer_id
      );

      response.json({
        success: true,
        data: applications,
      });
    } catch (error: any) {
      console.error("Get job applications error:", error);

      if (error.message === "Valid job ID is required") {
        return response.status(400).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message === "You can only view applications for your own jobs"
      ) {
        return response.status(403).json({
          success: false,
          message: error.message,
        });
      }

      response.status(500).json({
        success: false,
        message: "Failed to fetch job applications",
      });
    }
  }

  // Get logged-in seeker's applications
  async getMyApplications(
    request: AuthRequest,
    response: Response,
    next: NextFunction
  ) {
    try {
      const seeker_id = request.user!.id; // From auth middleware

      const applications =
        await this.applicationService.getApplicationsForSeeker(seeker_id);

      response.json({
        success: true,
        data: applications,
      });
    } catch (error: any) {
      console.error("Get my applications error:", error);
      response.status(500).json({
        success: false,
        message: "Failed to fetch your applications",
      });
    }
  }

  // Update application status (Employer only)
  async updateApplicationStatus(
    request: AuthRequest,
    response: Response,
    next: NextFunction
  ) {
    try {
      const application_id = parseInt(request.params.id);
      const { status }: { status: string } = request.body;
      const employer_id = request.user!.id; // From auth middleware

      if (!application_id || application_id <= 0) {
        return response.status(400).json({
          success: false,
          message: "Valid application ID is required",
        });
      }

      if (!status || !["reviewed", "rejected", "hired"].includes(status)) {
        return response.status(400).json({
          success: false,
          message: "Valid status is required (reviewed, rejected, hired)",
        });
      }

      const statusData: UpdateApplicationStatus = {
        status,
      } as UpdateApplicationStatus;

      // Pass employer_id for ownership validation
      const updatedApplication =
        await this.applicationService.updateApplicationStatus(
          application_id,
          statusData,
          employer_id
        );

      if (!updatedApplication) {
        return response.status(404).json({
          success: false,
          message: "Application not found",
        });
      }

      response.json({
        success: true,
        message: "Application status updated successfully",
        data: updatedApplication,
      });
    } catch (error: any) {
      console.error("Update application status error:", error);

      if (error.message === "Application not found") {
        return response.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message === "You can only update applications for your own jobs"
      ) {
        return response.status(403).json({
          success: false,
          message: error.message,
        });
      }

      response.status(500).json({
        success: false,
        message: "Failed to update application status",
      });
    }
  }

  // Withdraw application (Seeker only)
  async withdrawApplication(
    request: AuthRequest,
    response: Response,
    next: NextFunction
  ) {
    try {
      const application_id = parseInt(request.params.id);
      const seeker_id = request.user!.id; // From auth middleware

      if (!application_id || application_id <= 0) {
        return response.status(400).json({
          success: false,
          message: "Valid application ID is required",
        });
      }

      const result = await this.applicationService.withdrawApplication(
        application_id,
        seeker_id
      );

      if (!result) {
        return response.status(404).json({
          success: false,
          message: "Application not found or already withdrawn",
        });
      }

      response.json({
        success: true,
        message: "Application withdrawn successfully",
      });
    } catch (error: any) {
      console.error("Withdraw application error:", error);

      if (error.message === "Application not found") {
        return response.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message === "You can only withdraw your own applications") {
        return response.status(403).json({
          success: false,
          message: error.message,
        });
      }

      response.status(500).json({
        success: false,
        message: "Failed to withdraw application",
      });
    }
  }
}
