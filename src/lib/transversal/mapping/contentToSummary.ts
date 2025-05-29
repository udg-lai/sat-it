import { isTautology } from '$lib/transversal/algorithms/tautology.ts';
import {
	isRight,
	makeLeft,
	makeRight,
	unwrapEither,
	type Either
} from '$lib/transversal/types/either.ts';
import {
	fromJust,
	isJust,
	makeJust,
	makeNothing,
	type Maybe
} from '$lib/transversal/types/maybe.ts';
import { type ErrorMessage } from '$lib/transversal/types/types.ts';
import { logFatal } from '$lib/store/toasts.ts';

export type RawClause = number[]; // this contains the eos '0'
export type LiteralSet = number[]; // this contains just the literals
export type CNF = LiteralSet[];

export interface Claim {
	comments: string[];
	clause: RawClause;
}

export interface Summary {
	name: string;
	description: string;
	varCount: number;
	clauseCount: number;
	claims: Claim[];
	cnf: CNF;
}

const emptySummary = (): Summary => {
	const summary: Summary = {
		name: '',
		description: '',
		varCount: -1,
		clauseCount: -1,
		claims: [],
		cnf: []
	};
	return summary;
};

export interface Input {
	content: string;
	name: string;
}

export default function content2summary(input: Input): Summary {
	const { content, name } = input;

	let lines: string[] = content.trim().split('\n');

	const summary = emptySummary();
	summary.name = name;

	const { description, endLine } = parseDescription(lines);
	summary.description = description;
	lines = lines.slice(endLine);

	const eitherSummary = parseSummary(lines);
	if (isRight(eitherSummary)) {
		const { varCount, clauseCount, endLine } = unwrapEither(eitherSummary);
		summary.varCount = varCount;
		summary.clauseCount = clauseCount;
		lines = lines.slice(endLine);
	} else {
		logFatal('Problem parsing summary', unwrapEither(eitherSummary));
	}

	const eitherClaims = parseClaims(lines, summary.clauseCount);
	if (isRight(eitherClaims)) {
		const { claims, endLine } = unwrapEither(eitherClaims);
		summary.claims = claims;
		lines = lines.slice(endLine + 1);
	} else {
		logFatal('Problem parsing claims', unwrapEither(eitherClaims));
	}

	const eitherClauses = makeClauses(summary.claims, summary.varCount);
	if (isRight(eitherClauses)) {
		const { clauses } = unwrapEither(eitherClauses);
		summary.cnf = clauses;
	} else {
		logFatal('Problem simplifying claims to clauses', unwrapEither(eitherClauses));
	}

	return summary;
}

interface DescriptionResult {
	description: string;
	endLine: number;
}

function parseDescription(lines: string[]): DescriptionResult {
	const description: string[] = [];
	let endLine = 0;
	let scape = false;
	while (!scape && endLine < lines.length) {
		const line = lines[endLine];
		if (line.at(0) === 'p') {
			scape = true;
		} else {
			description.push(line);
			endLine += 1;
		}
	}
	return {
		description: description.join('\n'),
		endLine: endLine
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
		endLine: 1
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
	clauses: RawClause[];
}

function makeClauses(claims: Claim[], varCount: number): Either<ErrorMessage, MakeClausesResult> {
	const rawClauses = claims.map((claim) => claim.clause);

	const asserts: Maybe<ErrorMessage>[] = rawClauses.map((rawClause, idx) => {
		const [eos, ...literals] = [...rawClause].reverse();

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
		const clauses = rawClauses
			.map((rawClause) => {
				const literals = rawClause.slice(0, -1);
				return new Set(literals);
			})
			.filter((clause) => !isTautology(clause))
			.map((clause) => [...Array.from(clause)]);
		return makeRight({ clauses });
	}
}
