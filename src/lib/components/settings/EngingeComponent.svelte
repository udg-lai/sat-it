<script lang="ts">
	import { problemStore, updateAlgorithm, type Algorithm } from '$lib/store/problem.store.ts';

	let currentAlgorithm: Algorithm = $state('backtracking');
	const changeAlgorithm = (): void => {
		const newAlgorithm: Algorithm = currentAlgorithm === 'backtracking' ? 'dpll' : 'backtracking';
		updateAlgorithm(newAlgorithm);
		currentAlgorithm = newAlgorithm;
	};
	$effect(() => {
		console.log($problemStore);
	});
</script>

<button onclick={() => changeAlgorithm()}>
	<p>{currentAlgorithm}</p>
</button>
