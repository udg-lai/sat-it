import { VariablePool } from '$lib/transversal/entities/VariablePool.svelte.ts';
import type { IVariablePool } from '$lib/transversal/entities/VariablePool.svelte.ts';

export type PoolType = 'VariableCollection' | 'VariablePool';

class VariablePoolBuilder {
	static build(type: PoolType, capacity: number): IVariablePool {
		return new VariablePool(capacity);
	}
}
export default VariablePoolBuilder;
