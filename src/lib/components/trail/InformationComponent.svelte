<script lang="ts">
	import type { TrailState } from '$lib/entities/Trail.svelte.ts';
	import {
		CheckOutline,
		CloseOutline,
		CogOutline,
		HammerOutline,
		MinimizeOutline,
	} from 'flowbite-svelte-icons';
	import DynamicRender from '../DynamicRender.svelte';

	interface Props {
		onToggleExpand?: () => void;
		expanded: boolean;
		trailState: TrailState;
		classStyle?: string;
	}

	let { trailState, onToggleExpand, expanded, classStyle = ''}: Props = $props();

	const iconProps = {
		class: 'h-7 w-7 cursor-pointer'
	};

	function onToggleExpandClick() {
		onToggleExpand?.();
	}
</script>

<button
	onclick={onToggleExpandClick}
	class="notification {classStyle}"
	class:unsat={trailState === 'unsat'}
	class:sat={trailState === 'sat'}
	class:conflict={trailState === 'conflict'}
>
	{#if expanded}
		<DynamicRender component={MinimizeOutline} props={iconProps} />
	{:else if trailState === 'unsat'}
		<DynamicRender component={CloseOutline} props={iconProps} />
	{:else if trailState === 'sat'}
		<DynamicRender component={CheckOutline} props={iconProps} />
	{:else if trailState === 'conflict'}
		<DynamicRender component={HammerOutline} props={iconProps} />
	{:else}
		<div class="running">
			<DynamicRender component={CogOutline} props={iconProps} />
		</div>
	{/if}
</button>

<style>
	.notification {
		width: var(--trail-literal-min-width);
		height: var(--trail-literal-min-width);
		display: flex;
		justify-content: center;
		align-items: end;
		cursor: none;
	}

	.notification.conflict {
		color: var(--conflict-color);
		cursor: pointer;
	}

	.notification.unsat {
		color: var(--unsatisfied-color);
		cursor: pointer;
	}

	.notification.sat {
		cursor: pointer;
		color: var(--satisfied-color);
	}

	.notification .running {
		animation: rotate-once 1s linear infinite;
		cursor: none;
	}

	@keyframes rotate-once {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(180deg);
		}
	}

	:global(.app-popover) {
		background-color: var(--main-bg-color);
		border-color: var(--border-color);
		color: black;
		padding: 0.3rem 0.5rem;
	}

	:global(.app-popover .popover-content) {
		display: flex;
		flex-direction: row;
		align-items: center;
		font-size: var(--popover-font-size);
		gap: 0.5rem;
	}

	:global(.app-popover .clause-id) {
		color: var(--clause-id-color);
	}

	:global(.app-popover > .py-2) {
		padding: 0rem;
	}

	:global(.app-popover > .px-3) {
		padding: 0rem;
	}
</style>
