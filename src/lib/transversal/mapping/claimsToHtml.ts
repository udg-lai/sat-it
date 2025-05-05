import { logFatal } from '../logging.ts';
import { fromJust, isJust, makeJust, makeNothing, type Maybe } from '../types/maybe.ts';
import type { Claim, RawClause } from './contentToSummary.ts';

type Html = string;

export default function claims2html(claims: Claim[]): Html[] {
	const items: Html[] = claims.flatMap(claimToHtml);
	return items;
}

const clauseToHtml = (clause: RawClause): Html => {
	return (
		`<p class="clause">` +
		clause
			.map((lit) => {
				return `<span class="${lit === 0 ? 'delimiter' : 'literal'}">${lit}</span>`;
			})
			.join('') +
		`</p>`
	);
};

const commentToHtml = (comment: string): Maybe<Html> => {
	const trimmed = comment.trim();
	if (trimmed.length === 0 || trimmed === '%c') {
		return makeNothing();
	} else {
		return makeJust(`<p class="comment">` + '% ' + trimmed.slice(2) + `</p>`);
	}
};

const claimToHtml = (claim: Claim): Html[] => {
	const { comments, clause } = claim;

	const htmlComments: Html[] = comments.map(commentToHtml).filter(isJust).map(fromJust);

	const eos = clause[clause.length - 1];
	if (eos !== 0) {
		logFatal('Claim end of sequence not found');
	}
	const htmlClause = clauseToHtml(clause);

	return [...htmlComments, htmlClause];
};
