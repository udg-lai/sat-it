import { logFatal } from '$lib/stores/toasts.ts';
import { isTautology } from '$lib/algorithms/tautology.ts';
import { isRight, makeLeft, makeRight, unwrapEither, type Either } from '$lib/types/either.ts';
import { type ErrorMessage } from '$lib/types/types.ts';

export interface Claim {
	id?: number;
	comments: string[];
	literals: number[];
}

export interface Summary {
	comments: string[];
	varCount: number;
	clauseCount: number;
	claims: Claim[];
	nTautology: number;
	nClauseSimplified: number;
}

const emptySummary = (): Summary => {
	const summary: Summary = {
		comments: [],
		varCount: -1,
		clauseCount: -1,
		claims: [],
		nTautology: 0,
		nClauseSimplified: 0
	};
	return summary;
};

let parsedLine: number = 0;

export default function parseDimacs(dimacs: string): Summary {
	const content = dimacs;

	let lines: string[] = content.trim().split('\n');

	const summary = emptySummary();

	// comments from dimacs file at the top
	const eitherComments: Either<ErrorMessage, CommentsResult> = parseComments(lines);
	if (isRight(eitherComments)) {
		const { comments, endLine } = unwrapEither(eitherComments);
		summary.comments = comments;
		lines = lines.slice(endLine);
	} else {
		logFatal('Problem parsing summary', unwrapEither(eitherComments));
	}

	// summary line, i.e., p cnf <number of clauses> <number of variables>
	const eitherSummary = parseSummary(lines);
	if (isRight(eitherSummary)) {
		const { varCount, clauseCount, endLine } = unwrapEither(eitherSummary);
		summary.varCount = varCount;
		summary.clauseCount = clauseCount;
		lines = lines.slice(endLine);
	} else {
		logFatal('Problem parsing summary', unwrapEither(eitherSummary));
	}

	// clauses and comments, without simplifying the problem
	const eitherClaims = parseClaims(lines, summary.clauseCount, summary.varCount);
	if (isRight(eitherClaims)) {
		const { claims, endLine } = unwrapEither(eitherClaims);
		summary.claims = claims;
		lines = lines.slice(endLine + 1);
	} else {
		logFatal('Problem parsing claims', unwrapEither(eitherClaims));
	}
	const { claims, nTautology, nClauseSimplified } = simplifyClaims(summary.claims);
	summary.claims = [...claims];
	summary.nTautology = nTautology;
	summary.nClauseSimplified = nClauseSimplified;

	return summary;
}

interface CommentsResult {
	comments: string[];
	endLine: number;
}

function isCommentLine(line: string): boolean {
	return line.at(0) === 'c';
}

function parseComments(lines: string[]): Either<ErrorMessage, CommentsResult> {
	const comments: string[] = [];
	let l = 0;
	let scape = false;
	let error = false;
	while (!scape && !error && l < lines.length) {
		const line = lines[l];
		if (isCommentLine(line)) {
			comments.push(line);
			l += 1;
			parsedLine += 1;
		} else if (line.at(0) === 'p') {
			scape = true;
		} else {
			error = true;
		}
	}
	if (error) {
		return makeLeft(`Unexpected token at line ${parsedLine}`);
	} else {
		return makeRight({ comments, endLine: l });
	}
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
	parsedLine += 1;
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

function parseClaims(
	lines: string[],
	clauseCount: number,
	varCount: number
): Either<ErrorMessage, ClaimsResult> {
	const claims: Claim[] = [];
	let count = 0;
	let l = 0;
	let error = false;
	let errorMessage: ErrorMessage = '';
	while (l < lines.length && !error) {
		const comments: string[] = [];
		let line: string = lines[l];

		// reading comments
		while (l < lines.length && isCommentLine(line)) {
			comments.push(line);
			l += 1;
			line = lines[l];
			parsedLine += 1;
		}

		try {
			// reading literals
			if (l < lines.length) {
				// checking not reading more clauses than needed
				if (count > clauseCount) {
					throw new Error(`Expected not more than ${clauseCount} clauses but ${count} were parsed`);
				}
				line = line.replace(/[−–—]/g, '-');
				
				let literals = line
					.trim()
					.split(/\s+/)
					.map((lit) => parseInt(lit));

				const eos = literals.at(-1);
				if (eos !== 0) {
					throw Error('Expected EOS <0> at end of the end of the line');
				} else {
					literals = literals.slice(0, -1);
				}
				const wrongLiteral = literals.find((l: number) => {
					const isZero = l === 0;
					const outOfRange = Math.abs(l) > varCount;
					return isZero || outOfRange;
				});
				if (wrongLiteral) {
					throw Error(`Wrong literal ${wrongLiteral}`);
				}
				claims.push({ id: count, comments, literals });
				count += 1;
			}
		} catch (e: unknown) {
			error = true;
			if (e instanceof Error) {
				errorMessage = `Error ${e.message.toLowerCase()} at line ${parsedLine}`;
			} else {
				errorMessage = `Unknown error at line ${parsedLine}`;
			}
		}
		l += 1;
	}

	if (count != clauseCount) {
		throw new Error(`Expected ${clauseCount} clauses but ${count} were parsed`);
	}

	if (error) {
		return makeLeft(errorMessage);
	} else {
		return makeRight({ claims, endLine: l });
	}
}

interface SimplifiedResult {
	claims: Claim[];
	nTautology: number;
	nClauseSimplified: number;
}

function simplifyClaims(claims: Claim[]): SimplifiedResult {
	const simplified: Claim[] = [];
	let nTautology = 0;
	let nClauseSimplified = 0;
	let commentBuffer: string[] = [];

	let count = 0;

	for (const claim of claims) {
		const { comments, literals } = claim;
		const uniques: Set<number> = new Set(literals);

		commentBuffer = [...commentBuffer, ...comments];
		if (isTautology(uniques)) {
			nTautology += 1;
		} else {
			if (uniques.size !== literals.length) {
				nClauseSimplified += 1;
			}
			simplified.push({
				id: count,
				comments: commentBuffer,
				literals: Array.from(uniques)
			});
			commentBuffer = [];
			count += 1;
		}
	}

	return {
		claims: simplified,
		nTautology,
		nClauseSimplified
	};
}
