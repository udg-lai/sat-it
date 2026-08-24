declare module 'elkjs/lib/elk.bundled.js' {
	import type { ELK, ELKConstructorArguments } from 'elkjs/lib/elk-api';

	const ElkConstructor: {
		new (args?: ELKConstructorArguments): ELK;
	};

	export default ElkConstructor;
}
