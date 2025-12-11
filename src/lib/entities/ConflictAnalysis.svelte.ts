import type { Lit } from "$lib/types/types.ts";
import type Clause from "./Clause.svelte.ts";

export class ConflictAnalysis {
    clause: Clause;
    ldlAssignments: Lit[];

    constructor(conflictClause: Clause, ldlAssignments: Lit[]) {
        this.clause = conflictClause;
        this.ldlAssignments = ldlAssignments;
    }

    // Conflict analysis finished when the clause has only one literal from the current decision level
    finished(): boolean {
        return this.clause.isAssertive(this.ldlAssignments);
    }

    update(resolvent: Clause): void {
        this.clause = resolvent;
    }
}