import VariablePool from './VariablePool.ts';
import { type IVariablePool } from '../utils/interfaces/IVariablePool.ts';

export type PoolType = 'VariableCollection' | 'VariablePool';

class VariablePoolBuilder {
	static build(type: PoolType, capacity: number): IVariablePool {
		console.log(`Creating default pool for ${type} pool type`);
		return new VariablePool(capacity);
	}
}
export default VariablePoolBuilder;
