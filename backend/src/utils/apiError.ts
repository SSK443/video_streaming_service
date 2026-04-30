export class ApiError extends Error {
  public statusCode: number;
  public data: null;
  public errors: string[];
  public success: boolean;

  constructor(
    statusCode: number,
    message: string = "Something went wrong",
    errors: string[] = [],
    stack: string = ""
  ) {
    super(message);

    this.name = "ApiError";
    this.statusCode = statusCode;
    this.data = null;
    this.errors = errors;
    this.success = false;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace?.(this, this.constructor);
    }
  }
}
