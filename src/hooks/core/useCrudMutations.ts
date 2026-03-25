import { useQueryClient } from "@tanstack/react-query";
import { useMutationHelper } from "./useMutationHelper";

type CreateFn<TInput, TOutput> = (input: TInput) => Promise<TOutput>;
type UpdateFn<TInput, TOutput> = (input: TInput) => Promise<TOutput>;
type DeleteFn<TInput, TOutput> = (input: TInput) => Promise<TOutput>;

type CrudConfig<TCreateInput, TUpdateInput, TDeleteInput, TEntity> = {
  createFn: CreateFn<TCreateInput, TEntity>;
  updateFn: UpdateFn<TUpdateInput, TEntity>;
  deleteFn: DeleteFn<TDeleteInput, void>;

  queryKey: readonly unknown[];
};

export function useCrudMutations<
  TEntity,
  TCreateInput,
  TUpdateInput,
  TDeleteInput,
>({
  createFn,
  updateFn,
  deleteFn,
  queryKey,
}: CrudConfig<TCreateInput, TUpdateInput, TDeleteInput, TEntity>) {
  const queryClient = useQueryClient();

  // CREATE
  const create = useMutationHelper<
    TEntity,
    TCreateInput,
    { previous: TEntity[] }
  >({
    mutationFn: createFn,
    invalidateKeys: [queryKey],

    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<TEntity[]>(queryKey) ?? [];

      // optimistic insert (optional)
      queryClient.setQueryData<TEntity[]>(queryKey, (old = []) => [
        ...old,
        input as unknown as TEntity, // safe fallback when structure differs
      ]);

      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(queryKey, ctx.previous);
      }
    },

    onSuccess: async ()=> {
      await queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
  });

  // UPDATE
  const update = useMutationHelper<
    TEntity,
    TUpdateInput,
    { previous: TEntity[] }
  >({
    mutationFn: updateFn,
    invalidateKeys: [queryKey],

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<TEntity[]>(queryKey) ?? [];

      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(queryKey, ctx.previous);
      }
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
  });

  // DELETE
  const remove = useMutationHelper<void, TDeleteInput, { previous: TEntity[] }>(
    {
      mutationFn: deleteFn,
      invalidateKeys: [queryKey],

      onMutate: async () => {
        await queryClient.cancelQueries({ queryKey });

        const previous = queryClient.getQueryData<TEntity[]>(queryKey) ?? [];

        return { previous };
      },

      onError: (_err, _vars, ctx) => {
        if (ctx?.previous) {
          queryClient.setQueryData(queryKey, ctx.previous);
        }
      },

      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: [queryKey] });
      },
    },
  );

  return {
    create,
    update,
    delete: remove,
  };
}
