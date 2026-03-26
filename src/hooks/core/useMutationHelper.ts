import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";

type MutationHelperArgs<TData, TVariables, TContext> = {
  mutationFn: (varibales: TVariables) => Promise<TData>;
  // cache + invalidation
  invalidateKeys?: QueryKey[];
  // optimistic update
  onMutate?: (variables: TVariables) => Promise<TContext> | TContext;
  onError?: (
    error: unknown,
    variables: TVariables,
    context: TContext | undefined,
  ) => void;
  onSuccess?: (
    data: TData,
    variables: TVariables,
    context: TContext | undefined,
  ) => void;
  // optional side effects
  onSettled?: () => void;
};

export function useMutationHelper<
  TData = unknown,
  TVariables = void,
  TContext = unknown,
>({
  mutationFn,
  onMutate,
  onError,
  onSettled,
  onSuccess,
  invalidateKeys,
}: MutationHelperArgs<TData, TVariables, TContext>) {
  const qc = useQueryClient();

  const m = useMutation<TData, unknown, TVariables, TContext>({
    mutationFn,
    onMutate: async (variables): Promise<TContext> => {
      let ctx: TContext | unknown;

      if (onMutate) {
        ctx = await onMutate(variables);
      }

      return ctx as TContext;
    },
    onError: (err, variables, ctx) => {
      if (onError) {
        onError(err, variables, ctx);
      }
    },
    onSuccess(data, variables, context) {
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },
    onSettled: () => {
      invalidateKeys?.forEach((k) => {
        qc.invalidateQueries({ queryKey: k });
      });

      if (onSettled) {
        onSettled();
      }
    },
  });

  return {
    mutate: m.mutate,
    mutateAsync: m.mutateAsync,
    isPending: m.isPending,
    isError: m.isError,
    isSuccess: m.isSuccess,
    error: m.error,
    reset: m.reset,
  };
}
