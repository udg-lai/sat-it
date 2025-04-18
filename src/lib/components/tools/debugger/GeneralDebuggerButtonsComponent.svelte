<script lang="ts">
	import './style.css';

	import { onMount } from 'svelte';
	import { emitEditorViewEvent } from './events.svelte.ts';
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import {
		ArrowRightAltSolid,
		CaretDownSolid,
		CaretUpSolid,
		ReplySolid,
		StackoverflowSolid
	} from 'flowbite-svelte-icons';

	let expanded = $state(true);
	let textCollapse = $derived(expanded ? 'Collaps trails' : 'Expand Trails');

	const generalProps = {
		class: 'h-7 w-7 cursor-pointer'
	};

	const toggleExpandProps = {
		class: 'h-6 w-6 cursor-pointer'
	};

	onMount(() => {
		emitEditorViewEvent(expanded);
	});

	function toggleExpand() {
		expanded = !expanded;
		emitEditorViewEvent(expanded);
	}
</script>

<div class="flex h-full flex-col gap-1">
	<div class="flex w-full flex-[2] flex-row place-content-around">
		<button class="btn general-btn" title="Solve">
			<DynamicRender component={StackoverflowSolid} props={generalProps} />
		</button>
		<button class="btn general-btn mx-1" title="Solve trail">
			<DynamicRender component={ArrowRightAltSolid} props={generalProps} />
		</button>
		<button class="btn general-btn" title="Undo">
			<DynamicRender component={ReplySolid} props={generalProps} />
		</button>
	</div>
	<button
		class="btn flex w-full flex-[1] items-center justify-center"
		title={textCollapse}
		onclick={toggleExpand}
	>
		<DynamicRender component={expanded ? CaretUpSolid : CaretDownSolid} props={toggleExpandProps} />
	</button>
</div>
