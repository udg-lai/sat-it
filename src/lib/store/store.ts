import { writable, type Writable } from 'svelte/store';
import type { IVariablePool } from '../transversal/utils/interfaces/IVariablePool.ts';
import VariablePoolBuilder from '../transversal/entities/VariablePoolBuilder.ts';

export const pool: Writable<IVariablePool> = writable(VariablePoolBuilder.build('VariablePool', 0));
