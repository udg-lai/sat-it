export type Tuple<T, U> = {
	fst: T;
	snd: U;
};

export const makeTuple = <T, U>(fst: T, snd: U): Tuple<T, U> => ({ fst, snd });
