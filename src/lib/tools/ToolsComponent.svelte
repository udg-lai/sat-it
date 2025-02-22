<script lang="ts">
	import { onMount } from 'svelte';
	import Button from './Button.svelte';
	import './styles.css';

	interface Props {
		hide: boolean;
	}

	let { hide }: Props = $props();

	let toolsView;

	onMount(() => {
		toolsView = document.getElementById('tools-view');
		console.log(toolsView);
	});

	function resizeHandle(node) {
		let isResizing = false;

		const component = node.parentElement;

		function onMouseDown(event) {
			console.log('mouse down');
			isResizing = true;
			document.addEventListener('mousemove', onMouseMove);
			document.addEventListener('mouseup', onMouseUp);
		}

		function onMouseMove(event) {
			if (isResizing) {
				console.log(event);
				console.log('resizing');
				// 	let newWidth = 100;
				//	toolsView.style.width = `${newWidth}px`;
			}
		}

		function onMouseUp() {
			console.log('mouse up');
			isResizing = false;
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
		}

		node.addEventListener('mousedown', onMouseDown);
		node.addEventListener('mouseup', onMouseUp);
		node.addEventListener('mousemove', onMouseMove);

		return {
			destroy() {
				node.removeEventListener('mousedown', onMouseDown);
				node.removeEventListener('mouseup', onMouseUp);
				node.removeEventListener('mousemove', onMouseMove);
			}
		};
	}

	let views = $state(
		new Map(
			Object.entries({
				viewA: false,
				viewB: false,
				viewC: false,
				viewD: false
			})
		)
	);

	function activateView(view: string): void {
		if (!views.has(view)) {
			console.warn(`Accessing to not defined view ${view}`);
		} else {
			const viewActive: boolean = views.get(view) as boolean;
			if (viewActive) {
				hide = !hide;
			} else {
				views = new Map<string, boolean>([...views].map(([k]) => [k, false]));
				views.set(view, true);
				if (hide) hide = !hide;
			}

			console.log(hide);
		}
	}
</script>

<div class="tools-container">
	<div class="options-tools">
		<div class="vertical-separator"></div>
		<div class="toggle-button">
			<Button onClick={() => activateView('viewA')} />
		</div>
		<div class="toggle-button">
			<Button onClick={() => activateView('viewB')} />
		</div>
		<div class="toggle-button">
			<Button onClick={() => activateView('viewC')} />
		</div>
		<div class="toggle-button"></div>
		<div class="toggle-button"></div>
	</div>
	<div id="tools-view" class="tools-view" class:hide-tools-view={hide}>
		{#if !hide}
			{#each views as [view, visible] (view)}
				{#if view === 'viewA' && visible}
					<span>{view}</span>
				{:else if view === 'viewB' && visible}
					<span>{view}</span>
				{:else if view === 'viewC' && visible}
					<span>{view}</span>
				{/if}
			{/each}
		{/if}
	</div>
	<div use:resizeHandle class="draggable-bar cursor-col-resize"></div>
</div>
