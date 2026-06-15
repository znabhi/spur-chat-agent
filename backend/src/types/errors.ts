// Custom typed error classes
// Each error carries: internal message (for logs) + statusCode + userMessage (for client)

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly userMessage: string;

  constructor(message: string, statusCode: number, userMessage: string) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.userMessage = userMessage;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, `${resource} not found.`);
  }
}

export class LLMTimeoutError extends AppError {
  constructor() {
    super(
      'LLM request timed out',
      503,
      'Our support agent is a bit slow right now. Please try again in a moment.'
    );
  }
}

export class LLMRateLimitError extends AppError {
  constructor() {
    super(
      'LLM rate limit exceeded',
      429,
      'Too many requests. Please wait a moment and try again.'
    );
  }
}

export class LLMInvalidKeyError extends AppError {
  constructor() {
    super(
      'Invalid LLM API key configured',
      500,
      'Our AI agent is currently unavailable. Please try again later.'
    );
  }
}

export class LLMContentFilterError extends AppError {
  constructor() {
    super(
      'LLM content filter triggered',
      422,
      "I'm not able to respond to that. Can I help you with something else?"
    );
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Database error') {
    super(message, 503, 'Service is temporarily unavailable. Please try again shortly.');
  }
}
