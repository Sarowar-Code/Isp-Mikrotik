import { AxiosError } from "axios";

export function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.response) {
      const message =
        (error.response.data as { message?: string })?.message ||
        `Error ${error.response.status}`;
      return message;
    }
    if (error.request) {
      return "No response received from the server.";
    }
    return error.message;
  }
  return "An unexpected error occurred.";
}
