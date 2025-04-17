<script lang="ts">
	import ConfigurationDebugger from './ConfigurationDebuggerComponent.svelte';
	import BacktrackingDebugger from './BacktrackingDebuggerComponent.svelte';
	import GeneralDebuggerButtons from './GeneralDebuggerButtonsComponent.svelte';

</script>

<div class="flex-center debugger flex-row">
	<div class="w-1/5 mr-2 my-2">
		<ConfigurationDebugger />
	</div>
	<!-- Here we should have an if deppending on the algorithm view -->
	 
	<div class="w-3/5 division ">
		<BacktrackingDebugger />
		<!-- End Of If  -->
	</div>
	
	<div class="w-2/5 ml-2 my-2 mr-2">
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
