import { writable, type Writable } from 'svelte/store';
import type { IVariablePool } from '../transversal/utils/interfaces/IVariablePool.ts';

export const pool: Writable<IVariablePool> = writable();

export const persistVariable = (variableId:number , assignment:boolean) => {
  pool.update((curretPool) => {
    curretPool.persist(variableId,assignment);
    return curretPool;
  });
};

export const disposeVariable = (variableId:number) => {
  pool.update((currentPool)=> {
    currentPool.dispose(variableId);
    return currentPool;
  });
};