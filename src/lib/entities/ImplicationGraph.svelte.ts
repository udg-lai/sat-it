import { logFatal } from "$lib/states/toasts.svelte.ts";
import { makeJust, makeNothing, type Maybe } from "$lib/types/maybe.ts";
import Clause from "./Clause.svelte.ts";
import { ConflictAnalysis } from "./ConflictAnalysis.svelte.ts";
import type { Trail } from "./Trail.svelte.ts";
import type VariableAssignment from "./VariableAssignment.ts";

type Node = {
    id: string;
    content: VariableAssignment | Clause;
    dl: number;
};

type Edge = {
    from: Node;
    to: Node;
};

export class ImplicationGraph {
    trail: Trail;

    nodes: Node[] = [];
    edges: Edge[] = [];

    constructor(trail: Trail) {
        if (!trail.hasConflictiveClause())
            logFatal('ImplicationGraph Error', 'Cannot create an ImplicationGraph from a trail without a conflictive clause');

        this.trail = trail;
        this._makeImplicationGraph();
    }

    private _makeImplicationGraph(): void {
        const dl = this.trail.getDL();
        const lastDecision = this.trail.lastDecision();
        const propagations = this.trail.getPropagationsAtLevel(dl);

        const conflictAnalysis: ConflictAnalysis = new ConflictAnalysis(
            this.trail.getConflictiveClause()!,
            lastDecision,
            propagations
        );

        const cc: Clause = conflictAnalysis.getConflictiveClause();

        // Adds the empty clause to the graph, it has its own dl, which is the last decision level + 1, since it is a lemma
        const falsum: Node = {
            id: 'falsum',
            content: Clause.falsum(),
            dl: dl + 1
        }
        this.nodes.push(falsum)

        for (const literal of cc.getLiterals()) {
            const variable = literal.getVariable();

            const trailSize = this.trail.size();
            let j = trailSize - 1;
            let assignmentFound = false;

            // Search the literal in the trail
            while (j >= 0 && !assignmentFound) {
                const assignment: VariableAssignment | undefined = this.trail.get(j);
                if (assignment == undefined) {
                    logFatal('ImplicationGraph Error', `Trail index - ${j} out of bounds while building implication graph`);
                }
                // Var assignment found in the trail
                if (assignment.toVar() === variable.toInt()) assignmentFound = true;
                else j--;
            }

            if (!assignmentFound) {
                logFatal('ImplicationGraph Error', `Literal ${literal.toString()} in conflict clause not found in trail`);
            }
            const assignment: VariableAssignment = this.trail.get(j) as VariableAssignment;
            const node: Node = {
                id: assignment.toLit().toString(),
                content: assignment,
                dl: assignment.dl()
            }
            this.nodes.push(node);

            this.edges.push({
                from: node,
                to: falsum
            });
        }
    }
}




let implicationGraph: Maybe<ImplicationGraph> = $state(makeNothing())

export const setImplicationGraph = (ig: ImplicationGraph): void => {
    implicationGraph = makeJust(ig);
}

export const getImplicationGraph = (): Maybe<ImplicationGraph> => {
    return implicationGraph;
}