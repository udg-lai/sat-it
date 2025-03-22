<script lang="ts">
	import Button from './Button.svelte';
	import UploadDimacsComponent from './upload-dimacs/UploadDimacsComponent.svelte';
	import { BugOutline, FileCirclePlusOutline } from 'flowbite-svelte-icons';
	import './styles.css';
	import DebuggerComponent from './debugger/DebuggerComponent.svelte';

	interface Props {
		closed: boolean;
	}

	let { closed }: Props = $props();

	let toolsViewRef: HTMLElement;
	let isResizing = $state(false);

	function enableResizeCursor(): void {
		document.body.style.cursor = 'col-resize';
	}

	function disableResizeCursor(): void {
		document.body.style.cursor = '';
	}

	function disableSelection() {
		document.body.style.userSelect = 'none';
	}

	function enableSelection() {
		document.body.style.userSelect = '';
	}

	function resizeHandle(htmlElement: HTMLElement) {
		function onMouseDown() {
			isResizing = true;
			document.addEventListener('mousemove', onMouseMove);
			document.addEventListener('mouseup', onMouseUp);
			enableResizeCursor();
			disableSelection();
		}

		function onMouseMove(event: MouseEvent) {
			if (isResizing) {
				const barWidth = 66;
				const minWidthTool = 240;
				let newX = event.clientX;
				if (newX < barWidth + minWidthTool / 2) {
					closed = true;
				} else {
					closed = false;
					if (newX < barWidth + minWidthTool) {
						toolsViewRef.style.width = `${minWidthTool}px`;
					} else {
						toolsViewRef.style.width = `calc(${newX}px - var(--bar-width))`;
					}
				}
			}
		}

		function onMouseUp() {
			isResizing = false;
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
			disableResizeCursor();
			enableSelection();
		}

		htmlElement.addEventListener('mousedown', onMouseDown);
		htmlElement.addEventListener('mouseup', onMouseUp);
		htmlElement.addEventListener('mousemove', onMouseMove);

		return {
			destroy() {
				htmlElement.removeEventListener('mousedown', onMouseDown);
				htmlElement.removeEventListener('mouseup', onMouseUp);
				htmlElement.removeEventListener('mousemove', onMouseMove);
			}
		};
	}

	interface View {
		name: string;
		active: boolean;
	}

	let views: View[] = $state([
		{
			name: 'viewA',
			active: true
		},
		{
			name: 'viewB',
			active: false
		}
	]);

	function activateView(what: number): void {
		const alreadyActive = views[what].active;
		if (alreadyActive) {
			views[what].active = false;
		} else {
			views = views.map((v) => ({ ...v, active: false }));
			views[what].active = true;
			toolsViewRef.style.width = 'var(--max-width-tools)';
		}
		views = [...views];
		closed = views.every((v) => v.active === false);
	}
</script>

<div class="tools-container">
	<div class="options-tools">
		{#each views as { name }, id}
			<div class="toggle-button">
				{#if name === 'viewA'}
					{@render btnViewA(id)}
				{:else if name === 'viewB'}
					{@render btnViewB(id)}
				{:else}
					{@render notImplementedYet()}
				{/if}
			</div>
		{/each}
		<div class="vertical-separator"></div>
	</div>

	<div bind:this={toolsViewRef} class="default-tools-width" class:hide-tools-view={closed}>
		{#each views as { name, active } (name)}
			{#if active}
				<div class="view-container">
					{#if name === 'viewA'}
						<UploadDimacsComponent />
					{:else}
						<DebuggerComponent />
					{/if}
				</div>
			{/if}
		{/each}
	</div>
	<div
		use:resizeHandle
		class="draggable-bar vertical-separator cursor-col-resize"
		class:resizing={isResizing}
	></div>
</div>

{#snippet btnViewA(id: number)}
	<Button onClick={() => activateView(id)} icon={FileCirclePlusOutline} active={views[id].active} />
{/snippet}

{#snippet btnViewB(id: number)}
	<Button onClick={() => activateView(id)} icon={BugOutline} active={views[id].active} />
{/snippet}

{#snippet notImplementedYet(what?: string)}
	<p>Missing {what}</p>
{/snippet}
