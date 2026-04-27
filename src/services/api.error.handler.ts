import { AxiosError } from "axios";
import { showErrorToast } from "../utils/toast.utils";
import { reportErrorToSentry, scrubPiiFromErrorPayload } from "../utils/error.reporting";

export const handleApiError = (error: unknown) => {
  const scrubbedError = scrubPiiFromErrorPayload(error);
  reportErrorToSentry(scrubbedError);

  if ((error as AxiosError).isAxiosError) {
    const err = error as AxiosError<{ msg?: string }>;
    showErrorToast(err.response?.data?.msg || "API Error");
  } else {
    showErrorToast("Unknown error");
  }
};
