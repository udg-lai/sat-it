import { type ErrorMessage } from '$lib/transversal/utils/types/types.ts';
import {
	isRight,
	makeLeft,
	makeRight,
	unwrapEither,
	type Either
} from '$lib/transversal/utils/types/either.ts';
import { type Tuple, makeTuple } from './types/tuple.ts';

export interface Summary {
	comment: string;
	varCount: number;
	clauseCount: number;
	claims: number[][];
}

export default function parser(input: string): Summary {
	let lines: string[] = input.trim().split('\n');
	const summary: Summary = {
		comment: '',
		varCount: -1,
		clauseCount: -1,
		claims: []
	};
	// comments
	const comments = parseComment(lines);
	summary.comment = comments.fst;
	lines = comments.snd;
	// summary
	const eitherSummary = parseSummary(lines);
	if (isRight(eitherSummary)) {
		const right = unwrapEither(eitherSummary);
		summary.varCount = right.fst;
		summary.clauseCount = right.snd;
		lines = lines.slice(1);
	} else {
		const msg = unwrapEither(eitherSummary);
		throw new Error(msg);
	}
	const eitherCNF = parseCNF(lines, summary.varCount, summary.clauseCount);
	if (isRight(eitherCNF)) {
		const right = unwrapEither(eitherCNF);
		summary.claims = right;
	} else {
		const msg = unwrapEither(eitherCNF);
		throw new Error(msg);
	}
	return summary;
}

function parseComment(oLines: string[]): Tuple<string, string[]> {
	const lines: string[] = [];
	let comments = '';
	let i = 0;
	while (i < oLines.length) {
		const line = oLines[i];
		const commentLine = line.at(0) == 'c';
		if (commentLine) {
			const content = line.split(' ').slice(1).join(' ');
			comments = comments.concat(content, '\n');
		} else {
			lines.push(oLines[i]);
		}
		i += 1;
	}
	return makeTuple(comments, lines);
}

function parseSummary(lines: string[]): Either<ErrorMessage, Tuple<number, number>> {
	if (lines.length == 0) {
		return makeLeft('[ERROR]: could not parser summary because lines are empty');
	}
	const [summary] = lines;
	const chunkSummary = summary.split(' ');
	if (chunkSummary.length != 4) {
		return makeLeft(`[ERROR]: summary header has more than four items ${summary}`);
	}
	const [p, cnf, vars, clauses] = chunkSummary;
	if (p !== 'p') {
		return makeLeft(`[ERROR]: symbol '${p}', expected 'p'`);
	}
	if (cnf !== 'cnf') {
		return makeLeft(
			`[ERROR]: boolean formula expected to be represented in Conjuntive Normal From (CNF)`
		);
	}
	const varsCount = parseInt(vars);
	if (Number.isNaN(varsCount)) {
		return makeLeft(
			`[ERROR]: could not parse expected variable count to number representation of ${vars}`
		);
	}
	const clausesCount = parseInt(clauses);
	if (Number.isNaN(clausesCount)) {
		return makeLeft(
			`[ERROR]: could not parse expected clauses count to number representation of ${clauses}`
		);
	}
	return makeRight(makeTuple(varsCount, clausesCount));
}

function parseCNF(
	lines: string[],
	varCount: number,
	clauseCount: number
): Either<ErrorMessage, number[][]> {
	if (lines.length > clauseCount) {
		return makeLeft(
			`[ERROR]: number of CNF greater than the number of expected clauses ${clauseCount}`
		);
	}
	const cnf = lines.map((line) =>
		line
			.trim()
			.split(' ')
			.map((n) => parseInt(n))
	);
	const assertCNF = cnf.map((line: number[], idx: number) => {
		const literals = line.splice(0, -1);
		const eos = line.at(-1);
		const assert = literals.every((l) => Math.abs(l) <= varCount) && eos === 0;
		return makeTuple(assert, idx);
	});
	const clauseError = assertCNF.find((c) => !c.fst);
	if (clauseError) {
		return makeLeft(`[ERROR]: parser error at line: ${clauseError.snd}`);
	}
	return makeRight(cnf);
}
