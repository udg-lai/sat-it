import VariablePool from './VariablePool.svelte.ts';
import { type IVariablePool } from '../utils/interfaces/IVariablePool.ts';

export type PoolType = 'VariableCollection' | 'VariablePool';

class VariablePoolBuilder {
	static build(type: PoolType, capacity: number): IVariablePool {
		return new VariablePool(capacity);
	}
}
export default VariablePoolBuilder;
