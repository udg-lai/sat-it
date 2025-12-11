import { logError } from "$lib/states/toasts.svelte.ts";
import type { Lit } from "$lib/types/types.ts";
import type { V } from "vitest/dist/chunks/environment.d.cL3nLXbE.js";
import type Clause from "./Clause.svelte.ts";
import type Literal from "./Literal.svelte.ts";
import type VariableAssignment from "./VariableAssignment.ts";
import { isPropagationReason, type Propagation, type Reason } from "./VariableAssignment.ts";
import { getClausePool } from "$lib/states/problem.svelte.ts";

export class ConflictAnalysis {
    clause: Clause;
    ldlPropagations: VariableAssignment[];
    pointer: number;

    constructor(conflictClause: Clause, ldlPropagations: VariableAssignment[]) {
        if (!conflictClause.falsified()) {
            logError('Conflict Analysis Error', 'The conflict clause must be falsified to start conflict analysis');
        }
        if (ldlPropagations.length === 0) {
            logError('Conflict Analysis Error', 'There must be at least one literal from the last decision level in the propagations');
        }
        for (const lit of ldlPropagations) {
            if (!lit.wasPropagated()) {
                logError('Conflict Analysis Error', 'All literals in the last decision level propagations must be propagated literals');
            }
        }
        this.clause = conflictClause;
        this.ldlPropagations = ldlPropagations;
        this.pointer = ldlPropagations.length - 1;
    }

    // Conflict analysis finished when the clause has only one literal from the current decision level

    finished(): boolean {
        const literals: Lit[] = this.clause.getLiterals().map((lit: Literal) => lit.toInt());
        return this.pointer < 0 || this.clause.isAssertive(literals);
    }

    update(resolvent: Clause): void {
        if (!resolvent.falsified()) {
            logError('Conflict Analysis Error', 'The resolvent clause must be falsified to continue conflict analysis');
        }
        // Updates the clause being analyzed
        this.clause = resolvent;
    }

    getClause(): Clause {
        return this.clause;
    }

    step(): Clause {
        // Does the resolution between the current and the reason literal pointed by the pointer
        if (this.pointer < 0) {
            logError('Conflict Analysis Error', 'No more literals to analyze in the last decision level propagations');
        }
        const propagation: VariableAssignment = this.ldlPropagations[this.pointer];
        const r: Reason = propagation.getReason();
        if (!isPropagationReason(r)) {
            logError('Conflict Analysis Error', 'The reason must be a propagation reason to continue conflict analysis');
        }
        const reason: Clause = getClausePool().at((r as Propagation).cRef);
        this.clause = this.clause.resolution(reason);
        this.pointer -= 1;
        return this.clause.copy();
    }
}