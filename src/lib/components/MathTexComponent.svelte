<script lang="ts">
	import katex from 'katex';

	interface Props {
		equation: string;
	}

	let { equation }: Props = $props();

	const equationHtml = $derived(
		katex.renderToString(equation, {
			displayMode: true,
			output: 'html'
		})
	);
</script>

<span>
	{@html equationHtml}
</span>

<style>
	span {
		display: table;
		margin: 0 auto;
	}
</style>
