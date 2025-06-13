<script lang="ts">
	import './_style.css';
	import { CaretRightOutline, CodeMergeOutline } from 'flowbite-svelte-icons';
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import { stateMachineEventBus, userActionEventBus } from '$lib/transversal/events.ts';
	import { updateAssignment } from '$lib/store/assignment.svelte.ts';

	interface Props {
		onConflict: boolean;
		finished: boolean;
		onConflictDetection: boolean;
		nextVariable: number | undefined;
	}

	let { onConflict, finished, onConflictDetection, nextVariable }: Props = $props();

	const assignmentProps = {
		size: 'md'
	};
</script>

<automatic-debugger>
	<div class="join-variable">
		{#if nextVariable !== undefined}
			<div class="next-variable">
				<span>
					{nextVariable}
				</span>
			</div>
		{:else}
			<div class="next-variable" class:conflict={onConflict}>
				<span>X</span>
			</div>
		{/if}

		{#if !onConflict}
			<button
				class="btn general-btn next-button"
				class:invalidOption={finished || onConflictDetection}
				onclick={() => {
					updateAssignment('automated');
					stateMachineEventBus.emit('step');
					userActionEventBus.emit('record');
				}}
				title="Decide"
				disabled={finished || onConflictDetection}
			>
				<DynamicRender component={CaretRightOutline} props={assignmentProps} />
			</button>
		{:else}
			<button
				class="btn general-btn bkt-btn next-button"
				class:invalidOption={finished || onConflictDetection}
				onclick={() => {
					stateMachineEventBus.emit('step');
				}}
				title="Backtrack"
				disabled={finished || onConflictDetection}
			>
				<DynamicRender component={CodeMergeOutline} props={assignmentProps} />
			</button>
		{/if}
	</div>
</automatic-debugger>

<style>
	automatic-debugger {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
	}

	.next-variable {
		display: flex;
		width: var(--button-size);
		height: var(--button-size);
		align-items: center;
		justify-content: center;
		border: 1px solid var(--border-color);
		border-radius: 6px 0px 0px 6px;
		border-right: none;
		background-color: var(--button-color);
		border-color: var(--button-border-color);
	}

	.join-variable {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.next-button {
		border-radius: 0 6px 6px 0;
		border-left: none;
	}

	.conflict {
		color: var(--conflict-color);
		border: 1px dashed var(--conflict-color);
		border-radius: 6px 0px 0px 6px;
		border-right: none;
	}
</style>
