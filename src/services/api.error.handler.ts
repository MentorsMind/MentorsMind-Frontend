import { AxiosError } from "axios";
import { showErrorToast } from "../utils/toast.utils";

export const handleApiError = (error: unknown) => {
  if ((error as AxiosError).isAxiosError) {
    const err = error as AxiosError<{ msg?: string }>;
    showErrorToast(err.response?.data?.msg || "API Error");
  } else {
    showErrorToast("Unknown error");
  }
};
