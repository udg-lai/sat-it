import type Variable from "./variable.svelte.ts";

export class Interpretation extends Map<Variable, boolean> {
    nVariables: number;

    constructor(nVariables: number) { 
        super();
        this.nVariables = nVariables;
    }

    public updateLimitOfVariables(nVariables: number): void {
        this.nVariables = nVariables;
    }

    public complete(): boolean {
        return this.size == this.nVariables;
    }
}