import { type ErrorMessage, type InfoMessage } from '$lib/transversal/utils/types/types.ts';
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
	const commentEither = parseComment(lines);
	if (isRight(commentEither)) {
		const right = unwrapEither(commentEither);
		summary.comment = right.fst;
		lines = lines.slice(right.snd);
	}
	const summaryEither = parseSummary(lines);
	if (isRight(summaryEither)) {
		const right = unwrapEither(summaryEither);
		summary.varCount = right.fst;
		summary.clauseCount = right.snd;
		lines = lines.slice(1);
	} else {
		const msg = unwrapEither(summaryEither);
		throw new Error(msg);
	}
	const cnfEither = parseCNF(lines, summary.varCount, summary.clauseCount);
	if (isRight(cnfEither)) {
		const right = unwrapEither(cnfEither);
		summary.claims = right;
	} else {
		const msg = unwrapEither(cnfEither);
		throw new Error(msg);
	}
	return summary;
}

function parseComment(lines: string[]): Either<InfoMessage, Tuple<string, number>> {
	let idx = 0;
	let endComment = false;
	let comment = '';
	while (!endComment && idx < lines.length) {
		const line = lines[idx];
		endComment = line.at(0) !== 'c';
		if (!endComment) {
			const lineContent = line.split(' ').slice(1).join(' ');
			comment = comment.concat(lineContent, '\n');
			idx = idx + 1;
		}
	}
	if (comment == '') {
		return makeLeft('[INFO]: no comment was found in the DIMACs file');
	} else {
		return makeRight(makeTuple(comment, idx));
	}
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
	const assertCNF = cnf.map((line, idx) => {
		const assertClause = line.every((l) => Math.abs(l) <= varCount);
		return makeTuple(assertClause, idx);
	});
	const clauseError = assertCNF.find((c) => !c.fst);
	if (clauseError) {
		return makeLeft(`[ERROR]: wrong literal at clause line ${clauseError.snd}`);
	}
	return makeRight(cnf);
}
