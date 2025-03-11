<script lang="ts">
	import { display } from 'mathlifier';

	interface Props {
		equation: string;
	}

	let { equation }: Props = $props();
</script>

<span>
	{@html display(equation)}
</span>

<style>
	span {
		display: table;
		margin: 0;
		font-size: var(--TeX-font-size);
		text-align: center;
		vertical-align: center;
	}
</style>
