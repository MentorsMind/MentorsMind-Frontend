export interface ApiValidationError {
  field: string; // e.g. "email", "password"
  message: string; // e.g. "Email already in use"
}

export interface ApiErrorResponse {
  message: string;
  errors?: ApiValidationError[];
  status?: number;
}

export class ApiError extends Error {
  status: number;
  validationErrors?: Record<string, string>;

  constructor(
    message: string,
    status: number,
    validationErrors?: Record<string, string>,
  ) {
    super(message);
    this.status = status;
    this.validationErrors = validationErrors;
  }
}
