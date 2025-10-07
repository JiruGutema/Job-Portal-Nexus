import { describe, expect, it, beforeEach, vi } from 'vitest';
import { getProfile, putSeekerProfile, putEmployerProfile, getPublicProfile } from '../controllers/profile.controller';
import * as profileService from '../services/profile.service';

// Mock the service
vi.mock('../services/profile.service');

describe('Profile Controller', () => {
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    // Create mock request and response
    mockReq = {};
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
  });

  describe('getProfile', () => {
    it('should get profile when user exists', async () => {
      // Setup
      mockReq.user = { id: 1, role: 'seeker' };
  const mockProfile = { id: 1, skills: ['JavaScript'] };
  const mockUser = { id: 1, name: 'Alice', email: 'alice@example.com' };
  (profileService.getOwnProfile as any).mockResolvedValue({ profile: mockProfile, user: mockUser });

      // Execute
      await getProfile(mockReq, mockRes);

      // Verify
      expect(profileService.getOwnProfile).toHaveBeenCalledWith({ id: 1, role: 'seeker' });
  expect(mockRes.json).toHaveBeenCalledWith({ profile: mockProfile, user: mockUser });
    });

    it('should return 401 when no user', async () => {
      // Setup
      mockReq.user = undefined;

      // Execute
      await getProfile(mockReq, mockRes);

      // Verify
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('should return 404 when profile not found', async () => {
      // Setup
      mockReq.user = { id: 1, role: 'seeker' };
      (profileService.getOwnProfile as any).mockResolvedValue(null);

      // Execute
      await getProfile(mockReq, mockRes);

      // Verify
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        message: 'First create your profile using PUT profile/seeker or PUT profile/employer' 
      });
    });
  });

  describe('putSeekerProfile', () => {
    it('should update seeker profile', async () => {
      // Setup
      mockReq.user = { id: 1, role: 'seeker' };
      mockReq.body = { skills: ['React'] };
      const updatedProfile = { id: 1, skills: ['React'] };
      (profileService.updateSeekerProfile as any).mockResolvedValue(updatedProfile);

      // Execute
      await putSeekerProfile(mockReq, mockRes);

      // Verify
      expect(profileService.updateSeekerProfile).toHaveBeenCalledWith(1, { skills: ['React'] });
      expect(mockRes.json).toHaveBeenCalledWith({ profile: updatedProfile });
    });

    it('should reject non-seekers', async () => {
      // Setup
      mockReq.user = { id: 1, role: 'employer' };

      // Execute
      await putSeekerProfile(mockReq, mockRes);

      // Verify
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        message: 'Only seekers can update seeker profile' 
      });
    });
  });

  describe('putEmployerProfile', () => {
    it('should update employer profile', async () => {
      // Setup
      mockReq.user = { id: 2, role: 'employer' };
      mockReq.body = { company_name: 'Tech Co' };
      const updatedProfile = { id: 2, company_name: 'Tech Co' };
      (profileService.updateEmployerProfile as any).mockResolvedValue(updatedProfile);

      // Execute
      await putEmployerProfile(mockReq, mockRes);

      // Verify
      expect(profileService.updateEmployerProfile).toHaveBeenCalledWith(2, { company_name: 'Tech Co' });
      expect(mockRes.json).toHaveBeenCalledWith({ profile: updatedProfile });
    });

    it('should reject non-employers', async () => {
      // Setup
      mockReq.user = { id: 1, role: 'seeker' };

      // Execute
      await putEmployerProfile(mockReq, mockRes);

      // Verify
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        message: 'Only employers can update employer profile' 
      });
    });
  });

  describe('getPublicProfile', () => {
    it('should get public profile with valid id', async () => {
      // Setup
      mockReq.params = { id: '123' };
      const publicProfile = { role: 'seeker', profile: { id: 123, skills: ['JS'] } };
      (profileService.getPublicProfileById as any).mockResolvedValue(publicProfile);

      // Execute
      await getPublicProfile(mockReq, mockRes);

      // Verify
      expect(profileService.getPublicProfileById).toHaveBeenCalledWith(123);
      expect(mockRes.json).toHaveBeenCalledWith(publicProfile);
    });

    it('should reject invalid id', async () => {
      // Setup
      mockReq.params = { id: 'abc' };

      // Execute
      await getPublicProfile(mockReq, mockRes);

      // Verify
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid id' });
    });

    it('should return 404 when profile not found', async () => {
      // Setup
      mockReq.params = { id: '999' };
      (profileService.getPublicProfileById as any).mockResolvedValue(null);

      // Execute
      await getPublicProfile(mockReq, mockRes);

      // Verify
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Profile not found' });
    });
  });
});