type Just<T> = {
	kind: 'just';
	value: T;
};
type Nothing = {
	kind: 'nothing';
	value?: never;
};

export type Maybe<T> = NonNullable<Just<T> | Nothing>;

export const isJust = <T>(m: Maybe<T>): m is Just<T> => {
	return m.kind == 'just';
};

export const isNothing = <T>(m: Maybe<T>): m is Nothing => {
	return m.kind == 'nothing';
};

export const makeJust = <T>(value: T): Just<T> => ({ kind: 'just', value: value });

export const makeNothing = (): Nothing => ({ kind: 'nothing' });

export type UnwrapMaybe = <T>(e: Maybe<T>) => NonNullable<T>;

export const unwrapMaybe: UnwrapMaybe = <T>({ kind, value }: Maybe<T>) => {
	if (kind == 'nothing') {
		throw new Error(`Attempted to unwrap a nothing value`);
		/*
         We're throwing in this function because this can only occur at runtime if justthing
         happens that the TypeScript compiler couldn't anticipate. That means the application
         is in an unexpected state and we should terminate immediately.
        */
	}
	return value as NonNullable<T>;
};
