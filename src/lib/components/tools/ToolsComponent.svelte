<script lang="ts">
	import { BugOutline, FileCirclePlusOutline, GithubSolid } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
	import Button from './Button.svelte';
	import DebuggerComponent from './debugger/DebuggerComponent.svelte';
	import './styles.css';
	import DimacsComponent from './dimacs/DimacsComponent.svelte';

	let toolsViewRef: HTMLElement;

	let isResizing = $state(false);

	interface View {
		name: string;
		active: boolean;
	}

	let views: View[] = $state([]);
	let lastActiveViewIndex: number = $state(0);
	let closed: boolean = $derived(views.every((v) => v.active === false));

	onMount(() => {
		views = [
			{
				name: 'viewA',
				active: true
			},
			{
				name: 'viewB',
				active: false
			}
		];
	});

	$effect(() => {
		let activeViewIndex = views.findIndex((v) => v.active);
		if (activeViewIndex !== -1) {
			lastActiveViewIndex = activeViewIndex;
		}
	});

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
	}

	function openGutHubRepository() {
		window.open('https://github.com/udg-lai/edu.satit', '_blank');
	}

	function closeAllViews(): void {
		views = views.map((v) => ({ ...v, active: false }));
	}

	function openLastView(): void {
		views[lastActiveViewIndex].active = true;
		views = [...views];
	}

	function lastViewClosed(): boolean {
		return closed;
	}

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
				const minWidthTool = 290;
				let newX = event.clientX;
				if (newX < barWidth + minWidthTool / 2) {
					closeAllViews();
				} else {
					if (lastViewClosed()) {
						openLastView();
					}
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
		<div class="fixed_bottom">
			{@render btnGitHub()}
		</div>
		<div class="vertical-separator"></div>
	</div>

	<div bind:this={toolsViewRef} class="default-tools-width" class:hide-tools-view={closed}>
		{#each views as { name, active } (name)}
			{#if active}
				<div class="view-container">
					{#if name === 'viewA'}
						<DimacsComponent />
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

{#snippet btnGitHub()}
	<Button onClick={() => openGutHubRepository()} icon={GithubSolid} />
{/snippet}

{#snippet notImplementedYet(what?: string)}
	<p>Missing {what}</p>
{/snippet}
