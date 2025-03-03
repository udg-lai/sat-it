import type { VariablePool } from '../utils/interfaces/VariablePool.ts';

class VariablePoolBuilder {
	static build(): VariablePool {
		return new VariableMapping();
	}
}

export class VariableMapping implements VariablePool {
	poolCapacity: number = 0;
}

export default VariablePoolBuilder;
