import { useState, useCallback } from "react";
import { toast } from "sonner";

interface AsyncOperationState<T = any> {
  isLoading: boolean;
  error: Error | null;
  data: T | null;
  progress: number;
}

interface AsyncOperationOptions {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  trackProgress?: boolean;
}

export const useAsyncOperation = <T = any,>(
  operation: (progressCallback?: (progress: number) => void) => Promise<T>,
  options: AsyncOperationOptions = {}
) => {
  const [state, setState] = useState<AsyncOperationState<T>>({
    isLoading: false,
    error: null,
    data: null,
    progress: 0,
  });

  const execute = useCallback(async () => {
    setState({
      isLoading: true,
      error: null,
      data: null,
      progress: 0,
    });

    try {
      const progressCallback = options.trackProgress
        ? (progress: number) => {
            setState((prev) => ({ ...prev, progress }));
          }
        : undefined;

      const result = await operation(progressCallback);

      setState({
        isLoading: false,
        error: null,
        data: result,
        progress: 100,
      });

      if (options.successMessage) {
        toast.success(options.successMessage);
      }

      if (options.onSuccess) {
        options.onSuccess(result);
      }

      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Unknown error");

      setState({
        isLoading: false,
        error: err,
        data: null,
        progress: 0,
      });

      if (options.errorMessage) {
        toast.error(options.errorMessage);
      } else {
        toast.error(err.message);
      }

      if (options.onError) {
        options.onError(err);
      }

      throw err;
    }
  }, [operation, options]);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      data: null,
      progress: 0,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
};
