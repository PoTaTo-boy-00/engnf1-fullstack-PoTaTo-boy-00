import axios from "axios";

export function getApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;
    // console.log(responseData.error.message)
    if (responseData?.error?.message) {
      // console.log(responseData.error.message)
      return responseData.error.message;
    }

    if (responseData?.error?.code) {
      return responseData.error.code;
    }

    if (error.code === "ERR_NETWORK") {
      return "Unable to connect to the server. Please try again.";
    }

    return "Something went wrong. Please try again.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}
