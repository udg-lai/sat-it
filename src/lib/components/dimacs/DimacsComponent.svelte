<script lang="ts">
	import type { DimacsInstance } from '$lib/dimacs/dimacs-instance.interface.ts';

</script>

<div class="dimacs-viewer">

</div>

<style>
	.dimacs-viewer {
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	:global(.accordion) {
		display: flex;
		flex-direction: column;
	}

	.dimacs-preview {
		padding: 0;
		display: flex;
		flex: 1;
	}
</style>
