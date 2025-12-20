export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const isApiError = (err: unknown): err is ApiError => {
  return typeof err === "object" && err !== null && "status" in err;
};
