<script lang="ts">
	import ConfigurationDebugger from './ConfigurationDebuggerComponent.svelte';
	import BacktrackingDebugger from './BacktrackingDebuggerComponent.svelte';
	import GeneralDebuggerButtons from './GeneralDebuggerButtonsComponent.svelte';
</script>

<div class="flex-center debugger flex-row">
	<div class="my-2 mr-2 w-1/5">
		<ConfigurationDebugger />
	</div>
	<!-- Here we should have an if deppending on the algorithm view -->

	<div class="division w-3/5">
		<BacktrackingDebugger />
		<!-- End Of If  -->
	</div>

	<div class="my-2 ml-2 mr-2 w-2/5">
		<GeneralDebuggerButtons />
	</div>
</div>

<style>
	.debugger {
		width: 100%;
		height: 100%;
		display: flex;
		border-bottom: 1px;
		border-color: var(--border-color);
		border-style: solid;
	}
	.division {
		padding-left: 1rem;
		padding-right: 1rem;
		border-left: 1px;
		border-right: 1px;
		border-color: var(--border-color);
		border-style: solid;
	}
</style>
