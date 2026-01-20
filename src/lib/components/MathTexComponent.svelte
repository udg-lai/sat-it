<script lang="ts">
	import katex from 'katex';

	interface Props {
		equation: string;
		fontSize?: string;
	}

	let { equation, fontSize = 'var(--TeX-font-size)' }: Props = $props();

	const equationHtml = $derived(
		katex.renderToString(equation, {
			displayMode: true,
			output: 'mathml'
		})
	);
</script>

<span style="--fontSize:{fontSize}">
	{@html equationHtml}
</span>

<style>
	span {
		display: table;
		margin: 0;
		height: 100%;
		font-size: var(--fontSize);
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
