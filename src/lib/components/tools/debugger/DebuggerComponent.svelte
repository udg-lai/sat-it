<script lang="ts">
	import { emitDecision, emitExpand } from './events.svelte.ts';

	let expanded = $state(true);

	function toggleExpand() {
		expanded = !expanded;
		emitExpand(expanded);
	}
</script>

<div class="flex-center debugger flex">
	<button class="btn" onclick={() => emitDecision('Automated')}>
		<h1>Decide</h1>
	</button>

	<button class="btn" onclick={toggleExpand}>
		<h1>Toggle</h1>
	</button>
</div>

<style>
	.debugger {
		width: 100%;
		height: 100%;
		background-color: antiquewhite;
		display: flex;
		justify-content: space-around;
	}

	.btn {
		background-color: aqua;
		width: 10rem;
		height: 10rem;
	}
</style>
