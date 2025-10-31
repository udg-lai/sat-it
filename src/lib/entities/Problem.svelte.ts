import type { MappingLiteral2Clauses } from "$lib/states/problem.svelte.ts";
import { SvelteSet } from "svelte/reactivity";
import ClausePool from "./ClausePool.svelte.ts";
import { VariablePool } from "./VariablePool.svelte.ts";
import { type Algorithm } from "$lib/types/algorithm.ts";
import type { DimacsInstance } from "$lib/instances/dimacs-instance.interface.ts";
import type Clause from "./Clause.svelte.ts";
import type { Trail } from "./Trail.svelte.ts";
import type Variable from "./Variable.svelte.ts";
import { getTrails } from "$lib/states/trails.svelte.ts";
import { logFatal } from "$lib/states/toasts.svelte.ts";

export default class Problem {
    variables: VariablePool;
	clauses: ClausePool;
	mapping: MappingLiteral2Clauses;
	algorithm: Algorithm;

    constructor(algorithm: Algorithm = "cdcl") {
        this.variables = new VariablePool(0);
        this.clauses = new ClausePool();
        this.mapping = new Map<number, SvelteSet<number>>();
        this.algorithm = algorithm;
    }

    getClausePool(): ClausePool {
        return this.clauses
    }

    getMapping(): MappingLiteral2Clauses {
        return this.mapping
    }

    getVariablePool() : VariablePool {
        return this.variables
    }

    updateProblemDomain(instance: DimacsInstance): void {
        const { varCount, claims } = instance.summary;

        this.variables = new VariablePool(varCount);
        this.clauses = ClausePool.buildFrom(claims, this.variables);
        this.mapping = this._literalToClauses();
    }

    updateAlgorithm(algorithm: Algorithm): void {
        this.variables.reset();
        algorithm = algorithm;
    }

    updateProblemFromTrail(trail: Trail) {
       //Reset the variables
        this.variables.reset();
        trail.forEach((assignment) => {
            const variable: Variable = assignment.getVariable();
            this.variables.assign(variable.getInt(), variable.getAssignment());
        });
       
        //Now we need to relearn the clauses
        this.clauses.clearLearnt();
       
        //The learnt clauses from the trails are added to the clause pool
        getTrails().forEach((trail) => {
            const learntClause = trail.getLearntClause();
            if (learntClause !== undefined) {
                this.clauses.addClause(learntClause);
            }
        });
       
        //Reset the mapping
        this.mapping = this._literalToClauses();

    }

    resetProblem() {
        this.variables.reset();
        this.clauses.clearLearnt();
        this.mapping = this._literalToClauses()
    }

    addClauseToClausePool(lemma: Clause) {
        this.clauses.addClause(lemma);
        
        if (lemma.getTag() === undefined)
            logFatal('Saving lemma', 'Lemma clause was not giving a tag at adding it into the pool');
    
        this._addClauseToMapping(lemma, lemma.getTag() as number, this.mapping);
    }

    private _literalToClauses(): MappingLiteral2Clauses {
        const mapping: Map<number, SvelteSet<number>> = new Map();

        this.clauses.getClauses().forEach((clause, clauseTag) => {
            this._addClauseToMapping(clause, clauseTag, mapping);
        });

        return mapping;
    }
    
    private _addClauseToMapping = (clause: Clause, clauseTag: number, mapping: MappingLiteral2Clauses) => {
        clause.getLiterals().forEach((literal) => {
            const literalId = literal.toInt();
            if (mapping.has(literalId)) {
                const s = mapping.get(literalId);
                s?.add(clauseTag);
            } else {
                const s = new SvelteSet([clauseTag]);
                mapping.set(literalId, s);
            }
        });
    };
}