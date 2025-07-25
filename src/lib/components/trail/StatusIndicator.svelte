<script lang="ts">
	import type { TrailState } from '$lib/entities/Trail.svelte.ts';
	import {
		CheckOutline,
		CloseOutline,
		CogOutline,
		CompressOutline,
		HammerOutline
	} from 'flowbite-svelte-icons';
	import DynamicRender from '../DynamicRender.svelte';

	interface Props {
		onToggleExpand?: () => void;
		expanded: boolean;
		trailState: TrailState;
		btnClassStyle?: string;
		iconClassStyle?: string;
		ofLastTrail?: boolean; // Optional prop to indicate if this is the last trail
		disableClick?: boolean;
	}

	let {
		trailState,
		onToggleExpand,
		expanded,
		btnClassStyle = '',
		ofLastTrail = false,
		disableClick = true
	}: Props = $props();

	let iconProps = $derived({
		class: `h-7 w-7 ${disableClick ? 'cursor-default' : 'cursor-pointer'}`
	});

	function onToggleExpandClick() {
		onToggleExpand?.();
	}

	let status = $derived.by(() => {
		if (expanded) {
			return 'Click to collapse';
		} else if (trailState === 'unsat') {
			return 'The problem is unsatisfiable';
		} else if (trailState === 'sat') {
			return 'The problem has been satisfied';
		} else if (trailState === 'conflict') {
			return 'A conflict has been detected';
		} else {
			return 'Running...';
		}
	});
</script>

<status-indicator class="status">
	<button
		title={status}
		onclick={onToggleExpandClick}
		class="notification {btnClassStyle}"
		class:unsat={trailState === 'unsat'}
		class:sat={trailState === 'sat'}
		class:conflict={trailState === 'conflict'}
		class:disableClick
	>
		<div class="dynamic-render">
			{#if expanded && !ofLastTrail}
				<DynamicRender component={CompressOutline} props={iconProps} />
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
		</div>
	</button>
</status-indicator>

<style>
	.status {
		height: fit-content;
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.disableClick {
		cursor: default;
	}

	.notification {
		width: 100%;
		height: var(--trail-height);
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.notification.conflict {
		color: var(--conflict-color);
	}

	.notification.unsat {
		color: var(--unsatisfied-color);
	}

	.notification.sat {
		color: var(--satisfied-color);
	}

	.notification .running {
		animation: rotate-once 5s linear infinite;
		cursor: none;
	}

	.dynamic-render {
		margin-top: var(--trail-gap);
	}

	@keyframes rotate-once {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
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
