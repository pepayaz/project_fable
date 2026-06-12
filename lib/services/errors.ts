export class ServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ServiceError";
  }
}

export function getServiceErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ServiceError) {
    return error.message;
  }

  return fallback;
}
