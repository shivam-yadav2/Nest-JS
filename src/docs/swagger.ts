import type { OpenAPIObject } from '@nestjs/swagger';

const swaggerSpec: OpenAPIObject = {
  openapi: '3.0.3',
  info: {
    title: 'OTT API',
    version: '1.0.0',
    description:
      'Static OpenAPI specification for OTT backend. This is maintained manually in a single file, similar to Archive.',
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Versioned API',
    },
  ],
  tags: [
    { name: 'System', description: 'System endpoints' },
    { name: 'Auth', description: 'Authentication and profile operations' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ApiEnvelope: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object' },
          message: { type: 'string', example: 'Success' },
        },
      },
      RequestOtpDto: {
        type: 'object',
        required: ['phone'],
        properties: {
          phone: { type: 'string', example: '9999999999' },
        },
      },
      VerifyOtpDto: {
        type: 'object',
        required: ['userId', 'code'],
        properties: {
          userId: { type: 'integer', example: 1 },
          code: { type: 'string', example: '123456' },
        },
      },
      UpdateProfileDto: {
        type: 'object',
        properties: {
          displayName: { type: 'string', example: 'John Doe' },
          avatarUrl: { type: 'string', example: 'https://cdn.example.com/avatar.jpg' },
          locale: { type: 'string', example: 'en' },
          password: { type: 'string', example: 'StrongPassword123!' },
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          phone: { type: 'string', example: '9999999999' },
        },
      },
      UserResponse: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          email: { type: 'string', nullable: true, example: 'user@example.com' },
          phone: { type: 'string', nullable: true, example: '9999999999' },
          displayName: { type: 'string', nullable: true, example: 'John Doe' },
          avatarUrl: { type: 'string', nullable: true, example: 'https://cdn.example.com/avatar.jpg' },
          locale: { type: 'string', example: 'en' },
          isActive: { type: 'boolean', example: true },
          isVerified: { type: 'boolean', example: true },
          lastLoginAt: { type: 'string', format: 'date-time', nullable: true },
        },
      },
    },
  },
  paths: {
    '/': {
      get: {
        tags: ['System'],
        summary: 'Basic service status endpoint',
        responses: {
          '200': {
            description: 'Hello response',
            content: {
              'application/json': {
                schema: { type: 'string', example: 'Hello World!' },
              },
            },
          },
        },
      },
    },
    '/auth/register-phone': {
      post: {
        tags: ['Auth'],
        summary: 'Request OTP for login/registration',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RequestOtpDto' },
            },
          },
        },
        responses: {
          '200': {
            description: 'OTP generated and sent',
          },
        },
      },
    },
    '/auth/verify-otp': {
      post: {
        tags: ['Auth'],
        summary: 'Verify OTP and receive access token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/VerifyOtpDto' },
            },
          },
        },
        responses: {
          '200': {
            description: 'OTP verified and token returned',
          },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Current user fetched successfully',
          },
        },
      },
    },
    '/auth/update-profile': {
      put: {
        tags: ['Auth'],
        summary: 'Update current user profile',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateProfileDto' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Profile updated successfully',
          },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout current user',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Logged out successfully',
          },
        },
      },
    },
  },
};

export default swaggerSpec;