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

