import { isTautology } from '$lib/transversal/algorithms/tautology.ts';
import {
	isRight,
	makeLeft,
	makeRight,
	unwrapEither,
	type Either
} from '$lib/transversal/utils/types/either.ts';
import {
	fromJust,
	isJust,
	makeJust,
	makeNothing,
	type Maybe
} from '$lib/transversal/utils/types/maybe.ts';
import { type ErrorMessage } from '$lib/transversal/utils/types/types.ts';
import { logFatal } from '../logging.ts';

type Clause = number[];

export interface Claim {
	comments: string[];
	clause: Clause;
}

export interface Summary {
	description: string;
	varCount: number;
	clauseCount: number;
	claims: Claim[];
	clauses: Clause[];
}

const emptySummary = (): Summary => {
	const summary: Summary = {
		description: '',
		varCount: -1,
		clauseCount: -1,
		claims: [],
		clauses: []
	};
	return summary;
};

export default function parser(dimacsInput: string): Summary {
	let lines: string[] = dimacsInput.trim().split('\n');

	const summary = emptySummary();

	const { description, endLine } = parseDescription(lines);
	summary.description = description;
	lines = lines.slice(endLine + 1);

	const eitherSummary = parseSummary(lines);
	if (isRight(eitherSummary)) {
		const { varCount, clauseCount, endLine } = unwrapEither(eitherSummary);
		summary.varCount = varCount;
		summary.clauseCount = clauseCount;
		lines = lines.slice(endLine + 1);
	} else {
		logFatal(unwrapEither(eitherSummary));
	}

	const eitherClaims = parseClaims(lines, summary.clauseCount);
	if (isRight(eitherClaims)) {
		const { claims, endLine } = unwrapEither(eitherClaims);
		summary.claims = claims;
		lines = lines.slice(endLine + 1);
	} else {
		logFatal(unwrapEither(eitherClaims));
	}

	const clauses = makeClauses(summary.claims, summary.varCount);

	return summary;
}

interface DescriptionResult {
	description: string;
	endLine: number;
}

function parseDescription(lines: string[]): DescriptionResult {
	const description: string[] = [];
	let i = 0;
	let scape = false;
	while (!scape && i < lines.length) {
		const line = lines[i];
		if (line.at(0) === 'p') {
			scape = true;
		} else {
			description.push(line);
			i += 1;
		}
	}
	return {
		description: description.join(' '),
		endLine: i
	};
}

interface SummaryResult {
	varCount: number;
	clauseCount: number;
	endLine: number;
}

function parseSummary(lines: string[]): Either<ErrorMessage, SummaryResult> {
	if (lines.length == 0) {
		return makeLeft('could not parser summary because lines are empty');
	}
	const summary = lines[0];
	const chunkSummary = summary.split(' ');
	if (chunkSummary.length !== 4) {
		return makeLeft(`summary should have four entries`);
	}
	const [p, cnf, vars, clauses] = chunkSummary;
	if (p !== 'p') {
		return makeLeft(`symbol '${p}', expected 'p'`);
	}
	if (cnf !== 'cnf') {
		return makeLeft(`boolean formula expected to be represented in Conjunctive Normal From (CNF)`);
	}
	const varCount = parseInt(vars);
	if (Number.isNaN(varCount)) {
		return makeLeft(`could not parse expected variable count to number representation of ${vars}`);
	}
	const clauseCount = parseInt(clauses);
	if (Number.isNaN(clauseCount)) {
		return makeLeft(
			`could not parse expected clauses count to number representation of ${clauses}`
		);
	}
	return makeRight({
		varCount,
		clauseCount,
		endLine: 0
	});
}

interface ClaimsResult {
	claims: Claim[];
	endLine: number;
}

function isLineComment(line: string): boolean {
	return line.at(0) === 'c';
}

function parseClaims(lines: string[], clauseCount: number): Either<ErrorMessage, ClaimsResult> {
	const nClauses = lines.filter((line) => !isLineComment(line)).length;
	if (nClauses !== clauseCount) {
		return makeLeft(`Number of clauses found ${nClauses} and it was expected to be ${clauseCount}`);
	}

	const claims: Claim[] = [];
	let c = 0;
	let i = 0;
	while (c < clauseCount) {
		const comments = [];
		while (isLineComment(lines[i])) {
			comments.push(lines[i]);
			i += 1;
		}
		const clause = lines[i]
			.trim()
			.split(' ')
			.map((lit) => parseInt(lit));
		claims.push({ comments, clause });
		c += 1;
		i += 1;
	}

	return makeRight({ claims, endLine: i });
}

interface MakeClausesResult {
	clauses: Clause[];
}

function makeClauses(claims: Claim[], varCount: number): Either<ErrorMessage, MakeClausesResult> {
	const asserts: Maybe<ErrorMessage>[] = claims.map(({ clause }, idx: number) => {
		const eos = clause.at(-1);
		const literals = clause.slice(0, -1);

		if (eos !== 0) {
			return makeJust(`Clause with no EOS '0' at ${idx}`);
		} else if (literals.some((l) => Math.abs(l) > varCount)) {
			return makeJust(`Literal at claim ${idx} out of range`);
		} else {
			return makeNothing();
		}
	});

	const firstError = asserts.find((c) => isJust(c));

	if (firstError) {
		return makeLeft(fromJust(firstError));
	} else {
		// 1) drops repeated literals (removing the eos)
		// 2) remove trivial true clauses
		// 3) builds the clause (adds the eos)
		const clauses = claims
			.map(({ clause }) => new Set(clause.slice(-1)))
			.filter((clause) => !isTautology(clause))
			.map((clause) => [...Array.from(clause), 0]);
		return makeRight({ clauses });
	}
}
