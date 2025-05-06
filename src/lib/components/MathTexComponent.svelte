<script lang="ts">
	import katex from 'katex';

	interface Props {
		equation: string;
		fontSize?: string;
	}

	let { equation, fontSize }: Props = $props();

	const equationHtml = $derived(
		katex.renderToString(equation, {
			displayMode: true,
			output: 'mathml'
		})
	);
</script>

<span style="--math-font-size:{fontSize ?? '--TeX-font-size'}">
	{@html equationHtml}
</span>

<style>
	span {
		display: table;
		margin: 0;
		font-size: var(--math-font-size);
		text-align: center;
		vertical-align: center;
	}
</style>
