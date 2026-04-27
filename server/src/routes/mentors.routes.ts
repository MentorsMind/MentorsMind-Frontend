import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { ApiResponse } from '../types/api.types.js';
import { asyncHandler } from '../middleware/error.middleware.js';

// Mock data - in a real app, this would come from a database
const mockMentors = {
  'm1': {
    id: 'm1',
    name: 'John Doe',
    email: 'john@example.com',
    bio: 'Senior software engineer with 8+ years of experience in frontend development. Passionate about React, TypeScript, and helping developers level up their skills.',
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'Tailwind CSS', 'Next.js'],
    languages: ['English', 'Spanish'],
    hourlyRate: 75,
    currency: 'USDC',
    rating: 4.9,
    reviewCount: 87,
    sessionCount: 142,
    verificationStatus: 'approved', // 'approved', 'pending', 'rejected'
    timezone: 'UTC-5',
    avatarUrl: null,
    joinDate: 'January 2023'
  }
};

const mockRatingSummary = {
  'm1': {
    average: 4.9,
    total: 87,
    breakdown: [
      { stars: 5, count: 42 },
      { stars: 4, count: 18 },
      { stars: 3, count: 6 },
      { stars: 2, count: 2 },
      { stars: 1, count: 1 }
    ]
  }
};

const mockAvailability = {
  'm1': [
    { date: '2026-04-24T10:00:00Z', duration: 60 },
    { date: '2026-04-24T14:00:00Z', duration: 60 },
    { date: '2026-04-25T13:00:00Z', duration: 60 }
  ]
};

const router = Router();

// GET /mentors/:id/verification-status
router.get('/:id/verification-status',
  param('id').isString().notEmpty(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid mentor ID' }
      } as ApiResponse);
    }

    const { id } = req.params;
    const mentor = mockMentors[id as keyof typeof mockMentors];

    if (!mentor) {
      return res.status(404).json({
        success: false,
        error: { code: 'MENTOR_NOT_FOUND', message: 'Mentor not found' }
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: {
        verificationStatus: mentor.verificationStatus
      }
    } as ApiResponse);
  })
);

// GET /users/:id/public
router.get('/users/:id/public',
  param('id').isString().notEmpty(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid user ID' }
      } as ApiResponse);
    }

    const { id } = req.params;
    const mentor = mockMentors[id as keyof typeof mockMentors];

    if (!mentor) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' }
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: {
        id: mentor.id,
        name: mentor.name,
        bio: mentor.bio,
        avatarUrl: mentor.avatarUrl,
        skills: mentor.skills,
        languages: mentor.languages,
        hourlyRate: mentor.hourlyRate,
        currency: mentor.currency,
        rating: mentor.rating,
        reviewCount: mentor.reviewCount,
        sessionCount: mentor.sessionCount,
        timezone: mentor.timezone,
        joinDate: mentor.joinDate
      }
    } as ApiResponse);
  })
);

// GET /mentors/:id/rating-summary
router.get('/:id/rating-summary',
  param('id').isString().notEmpty(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid mentor ID' }
      } as ApiResponse);
    }

    const { id } = req.params;
    const ratingSummary = mockRatingSummary[id as keyof typeof mockRatingSummary];

    if (!ratingSummary) {
      return res.status(404).json({
        success: false,
        error: { code: 'RATING_SUMMARY_NOT_FOUND', message: 'Rating summary not found' }
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: ratingSummary
    } as ApiResponse);
  })
);

// GET /mentors/:id/availability
router.get('/:id/availability',
  param('id').isString().notEmpty(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid mentor ID' }
      } as ApiResponse);
    }

    const { id } = req.params;
    const availability = mockAvailability[id as keyof typeof mockAvailability];

    if (!availability) {
      return res.status(404).json({
        success: false,
        error: { code: 'AVAILABILITY_NOT_FOUND', message: 'Availability not found' }
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: availability
    } as ApiResponse);
  })
);

export default router;