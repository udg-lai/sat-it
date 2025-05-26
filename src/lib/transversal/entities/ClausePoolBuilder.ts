import type { IClausePool } from '../interfaces/IClausePool.ts';
import type Clause from './Clause.ts';
import ClausePool from './ClausePool.svelte.ts';

export type PoolType = 'ClausePool'; //In case some other Pool types are recommended

class ClausePoolBuilder {
	static build(type: PoolType, clauses: Clause[] = []): IClausePool {
		return new ClausePool(clauses);
	}
}

export default ClausePoolBuilder;
