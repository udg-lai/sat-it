import type ClausePool from "./transversal/entities/ClausePool.svelte.ts";
import { Eval } from "./transversal/interfaces/IClausePool.ts";
import { logError } from "./transversal/logging.ts";

type Alg = CD | UCD

type CD = (pool: ClausePool) => Eval

type UCD = (pool: ClausePool) => Set<number>

type InputCDState = 'ucd';

type InputState = InputCDState

interface State {
    algorithm: Alg
}

interface NonFinalState extends State {
    neighbor: Map<InputState, State>;
}

const conflictDetection: CD = (pool: ClausePool) => {
    return Eval.SAT
}

const unitClauseDetection: UCD = (pool: ClausePool) => {
    return new Set()
}

const ucd_state: NonFinalState = {
    algorithm: unitClauseDetection,
    neighbor: (new Map()),
}

const cd_state: NonFinalState = {
    algorithm: conflictDetection,
    neighbor: (new Map()).set('ucd', ucd_state),
}

const next = (state: NonFinalState, input: InputState): State => {
    if (!state.neighbor.has(input)) {
        logError("mjdsflasfj")
    }
    const { neighbor } = state;
    return neighbor.get(input) as State
}

type StateID = number

const states: Map<StateID, State> = new Map();
let id = 0;

const addState = (state: State): void => {
    states.set(id, state)
    id += 1
}

addState(cd_state)
addState(ucd_state)

const current_state = states.get(0) as NonFinalState;

let next_state = undefined

if (current_state !== undefined) {
    next_state = next(current_state, 'ucd')
}

console.log(next_state)


