import WipVariablePool from './WipVariablePool.ts';
import { type VariablePool } from '../utils/interfaces/VariablePool.ts';

export type PoolType = 'VariableCollection' | 'WipVariablePool';

class VariablePoolBuilder {
	static build(type: PoolType, capacity: number): VariablePool {
		console.log(`Creating default pool for ${type} pool type`);
		return new WipVariablePool(capacity);
	}
}
export default VariablePoolBuilder;
