import { SvelteSet } from "svelte/reactivity";

let variableBreakpoint: SvelteSet<number> = $state(new SvelteSet<number>());

let clauseBreakpoint: SvelteSet<number> = $state(new SvelteSet<number>());

export type Assignment = {
  type: 'variable' | 'clause';
  id: number;
}

export type VariableBreakpoint = {
  type: 'variable';
  variableId: number;
};

export type ClauseBreakpoint = {
  type: 'clause',
  clauseId: number,
};

export type Breakpoint = VariableBreakpoint | ClauseBreakpoint;

export const addBreakpoint = (breakpoint: Breakpoint): void => {
  if (breakpoint.type === 'variable') {
    variableBreakpoint.add(breakpoint.variableId);
  } else if (breakpoint.type === 'clause') {
    clauseBreakpoint.add(breakpoint.clauseId);
  }
}

export const checkBreakpoint = (assignment: Assignment): boolean => {
  let checkVariableId: boolean = false;
  let checkClauseId: boolean = false;
  if (assignment.type === 'variable') {
    checkVariableId = variableBreakpoint.has(assignment.id);
  } else if (assignment.type === 'clause') {
    checkClauseId = clauseBreakpoint.has(assignment.id);
  }
  return checkClauseId || checkVariableId;
}

