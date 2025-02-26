
import { type ErrorMessage, type InfoMessage, type Message, type WarningMessage } from '$lib/transversal/utils/types/types.ts';
import { isRight, makeLeft, makeRight, unwrapEither, type Either } from '$lib/transversal/utils/types/either.ts';
import { type Tuple, makeTuple } from './types/tuple.ts';

export interface Summary {
    comment: string,
    varCount: number,
    clauseCount: number,
    claims: number[][]
}

export default function parser(input: string): Summary {
    let logs = [];
    let lines: string[] = input.trim().split("\n")
    const summary: Summary = {
        comment: "",
        varCount: -1,
        clauseCount: -1,
        claims: [],
    }
    const commentEither = parseComment(lines);
    if (isRight(commentEither)) {
        const right = unwrapEither(commentEither)
        summary.comment = right.fst
        lines = lines.slice(right.snd)
        logs.push(`parser comment result ${JSON.stringify(right)}`)
    } else {
        const msg = unwrapEither(commentEither)
        logs.push(msg)
    }
    logs.forEach(console.log)
    return summary;
}

function parseComment(lines: string[]): Either<Message, Tuple<string, number>> {
    console.log(lines)
    let idx = 0;
    let endComment = false;
    let comment = "";
    while (!endComment && idx < lines.length) {
        const line = lines[idx];
        endComment = line.at(0) !== 'c';
        if (!endComment) {
            const lineContent = line.split(" ").slice(1).join(" ");
            comment = comment.concat(lineContent, "\n");
            idx = idx + 1;
        }
    }
    if (comment == "") {
        return makeLeft("[INFO]: no comment was found in the DIMACs file")
    } else {
        return makeRight(makeTuple(comment, idx))
    }
}