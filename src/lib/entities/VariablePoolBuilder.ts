import { VariablePool, type IVariablePool } from './VariablePool.svelte.ts';

export type PoolType = 'VariableCollection' | 'VariablePool';

class VariablePoolBuilder {
	static build(type: PoolType, capacity: number): IVariablePool {
		return new VariablePool(capacity);
	}
}
export default VariablePoolBuilder;
