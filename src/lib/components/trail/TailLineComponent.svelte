<script lang="ts">
	import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
	import InformationComponent from './InformationComponent.svelte';
	import TrailComponent from './TrailComponent.svelte';

	interface Props {
		trail: Trail;
		index: number;
		isLast?: boolean;
	}
	let { trail, index, isLast = false }: Props = $props();
</script>

<trail-line class="line">
	<enumerate>
		<span class="line-item chakra-petch-medium">
			<p>{index}.</p>
		</span>
	</enumerate>
	<TrailComponent {trail} {isLast} />
	<InformationComponent {trail} />
</trail-line>

<style>
	.line {
		width: 100%;
		display: flex;
		position: relative;
		align-items: end;
		gap: 0.5rem;
	}

	.line-item {
		font-size: 1.5rem;
		opacity: 0.5;
	}

	enumerate {
		display: flex;
		justify-content: center;
		width: var(--button-size);
		height: var(--button-size);
		position: relative;
		align-items: center;
		z-index: 100;
		background-color: red;
	}

	enumerate p {
		font-size: 1rem;
	}
</style>
