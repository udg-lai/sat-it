import type Clause from "$lib/transversal/entities/Clause.ts";

let defaultClauses: Clause[] = $state([])

export const setDefaultClauses = (clauses: Clause[]) => {
    defaultClauses = [...clauses];
}

export const getDefaultClauses = () => defaultClauses;
