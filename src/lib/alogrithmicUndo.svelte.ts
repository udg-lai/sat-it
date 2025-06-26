import type { Trail } from "$lib/entities/Trail.svelte.ts";
import type VariableAssignment from "$lib/entities/VariableAssignment.ts";
import { decreaseNoConflicts, decreaseNoDecision, decreaseNoUnitPropagations } from "$lib/states/statistics.svelte.ts";
import { getLatestTrail, stackTrail, unstackTrail } from "$lib/states/trails.svelte.ts";
import { logFatal } from "$lib/stores/toasts.ts";
import type TemporalClause from "./entities/TemporalClause.ts";

export const algorithmicUndo = (objectiveAssignment: VariableAssignment, objectiveTrail: Trail): void => {
    //First of all we have to reach the trail we want to go to.
    let latestTrail: Trail | undefined = getLatestTrail();
    while(latestTrail !== undefined && latestTrail !== objectiveTrail) {
        //We can't delete all the trail at once as we have to get rid of all the assignments that were made in this trail to update the statistics
        const trailAssignments: VariableAssignment[] = latestTrail.getFollowUpAssignments();
        latestTrail.forEach(assignment => {
            undoAssignmentFromStatistics(assignment);
        });

        //Once we have cleaned the trail, we have to check if there was a learned clause to delete it.
        //THIS NEEDS TO BE CHECKED
        const learnedClauseId: TemporalClause | undefined = latestTrail.getLearnedClause();

        unstackTrail();
        latestTrail = getLatestTrail();
    }

    if(latestTrail === undefined) {
        logFatal("Algorithmic undo error", "It is not possible to undo the problem to a trail that does not exist xD");
    }

    // Then it is needed to reach the assignment the user has said.
    let latestAssignment: VariableAssignment | undefined;
    
    do {
        latestAssignment = latestTrail.pop();
          if(latestAssignment === undefined) {
            logFatal("Algorithmic undo error", "It is not possible to undo the problem to a position that does not exist xD");
        }
        undoAssignmentFromStatistics(latestAssignment);
    } while(latestAssignment !== objectiveAssignment && latestAssignment !== undefined) 

    //Now we are in the position the user said, we just have to reset the state machine in the app component and we are good to go
}

const undoAssignmentFromStatistics = (assignment: VariableAssignment): void => {
    if(assignment.isD()) decreaseNoDecision();
    else if(assignment.isBJ() || assignment.isK()) decreaseNoConflicts();
    else if(assignment.isUP()) decreaseNoUnitPropagations();
    else logFatal("Statistics error", "There is an assignment that was no registered kind");
}