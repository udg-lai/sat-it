<script lang="ts">
	import FinishConflictDetectionComponent from './buttons/FinishConflictDetectionComponent.svelte';
	import UP1Component from './buttons/UP1Component.svelte';
</script>

<unit-propagation-debugger>
	<UP1Component />

	<FinishConflictDetectionComponent />
</unit-propagation-debugger>

<style>
	unit-propagation-debugger {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
	}
</style>
