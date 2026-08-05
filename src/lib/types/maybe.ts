type Just<T> = {
	kind: 'just';
	value: T;
	fromJust: () => NonNullable<T>;
	isJust: () => boolean;
	isNothing: () => boolean;
};

type Nothing = {
	kind: 'nothing';
	value?: never;
	fromJust: () => never;
	isJust: () => boolean;
	isNothing: () => boolean;
};

export type Maybe<T> = NonNullable<Just<T> | Nothing>;

export const isJust = <T>(m: Maybe<T>): m is Just<T> => {
	return m.kind == 'just';
};

export const isNothing = <T>(m: Maybe<T>): m is Nothing => {
	return m.kind == 'nothing';
};

export const makeJust = <T>(value: T): Just<T> => ({
	kind: 'just',
	value,
	fromJust: function (this: Just<T>) {
		return fromJust(this);
	},
	isJust: function (this: Just<T>) {
		return isJust(this);
	},
	isNothing: function (this: Just<T>) {
		return isNothing(this);
	}
});

export const makeNothing = (): Nothing => ({
	kind: 'nothing',
	fromJust: function (this: Nothing) {
		throw new Error('Attempted to unwrap a nothing value');
	},
	isJust: function (this: Nothing) {
		return false;
	},
	isNothing: function (this: Nothing) {
		return true;
	}
});

export type UnwrapMaybe = <T>(e: Maybe<T>) => NonNullable<T>;

const unwrapMaybe: UnwrapMaybe = <T>({ kind, value }: Maybe<T>) => {
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

export const fromJust = unwrapMaybe;
