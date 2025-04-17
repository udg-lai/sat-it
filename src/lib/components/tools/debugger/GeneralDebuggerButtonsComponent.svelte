<script lang="ts">
	import './style.css';

	import { onMount } from "svelte";
	import { emitEditorViewEvent } from "./events.svelte.ts";
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import { ArrowRightAltSolid, RectangleListSolid, ReplySolid, StackoverflowSolid } from 'flowbite-svelte-icons';

	let expanded = $state(true);
	//let textCollapse = $derived(expanded ? 'Expanded' : 'Collapsed');

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

<div class="flex flex-col h-full gap-1">
	<div class="flex flex-row place-content-around flex-[2] w-full">
		<button class="general-btn"> 
			<DynamicRender component={StackoverflowSolid} props={generalProps} />	
		</button>
		<button class="general-btn mx-1"> 
			<DynamicRender component={ArrowRightAltSolid} props={generalProps} />		
		</button>
		<button class="general-btn"> 
			<DynamicRender component={ReplySolid} props={generalProps} />	
		</button>
	</div>
	<button class="btn-expand flex-[1] w-full" onclick={toggleExpand}>
    <DynamicRender component={RectangleListSolid} props={toggleExpandProps} />	
  </button>
</div>

