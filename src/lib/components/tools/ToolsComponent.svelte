<script lang="ts">
	import { conflictDetectionEventBus, openSettingsViewEventBus } from '$lib/events/events.ts';
	import { ArrowUpFromBracketOutline, BookOutline, ClipboardOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
	import Button from './Button.svelte';
	import OccurrenceListComponent from './OccurrenceListComponent.svelte';
	import SolutionSummaryComponent from './SolutionSummaryComponent.svelte';
	import './style.css';

	let toolsViewRef: HTMLElement;

	let isResizing = $state(false);

	interface Tool {
		name: string;
		active: boolean;
	}

	let tools: Tool[] = $state([]);
	let lastActiveViewIndex: number = $state(0);
	let closed: boolean = $derived(tools.every((v) => v.active === false));

	onMount(() => {
		tools = [
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
		let activeViewIndex = tools.findIndex((v) => v.active);
		if (activeViewIndex !== -1) {
			lastActiveViewIndex = activeViewIndex;
		}
	});

	function activateTool(what: number): void {
		const alreadyActive = tools[what].active;
		if (alreadyActive) {
			tools[what].active = false;
		} else {
			tools = tools.map((v) => ({ ...v, active: false }));
			tools[what].active = true;
			toolsViewRef.style.width = 'var(--max-width-tools)';
		}
		tools = [...tools];
	}

	export function activateConflictDetectionView(): void {
		const alreadyActive = tools[1].active;
		if (alreadyActive) return;
		tools = tools.map((v) => ({ ...v, active: false }));
		tools[1].active = true;
		toolsViewRef.style.width = 'var(--max-width-tools)';
		tools = [...tools];
	}

	/*
	function openGutHubRepository() {
		window.open('https://github.com/udg-lai/edu.satit', '_blank');
	}
	*/

	function closeAllViews(): void {
		tools = tools.map((v) => ({ ...v, active: false }));
	}

	function openLastView(): void {
		tools[lastActiveViewIndex].active = true;
		tools = [...tools];
	}

	function resizeHandle(htmlElement: HTMLElement) {
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
				const minWidthTool = 300;
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

	function onOpenViewMoreEvent(): void {
		openSettingsViewEventBus.emit();
	}

	function openConflictDetectionView() {
		const alreadyActive = tools[1].active;
		if (alreadyActive) return;
		tools = tools.map((v) => ({ ...v, active: false }));
		tools[1].active = true;
		toolsViewRef.style.width = 'var(--max-width-tools)';
		tools = [...tools];
	}

	onMount(() => {
		const unsubscribeConflictDetection =
			conflictDetectionEventBus.subscribe(openConflictDetectionView);
		return () => {
			unsubscribeConflictDetection();
		};
	});
</script>

<tools>
	<div class="tools-container">
		<div class="options-tools">
			{#each tools as { name }, id}
				<div class="toggle-button">
					{#if name === 'viewA'}
						{@render toolA(id)}
					{:else if name === 'viewB'}
						{@render toolB(id)}
					{:else}
						{@render notImplementedYet()}
					{/if}
				</div>
			{/each}
			<div class="toggle-button settings-btn">
				{@render settings()}
			</div>
			<div class="vertical-separator"></div>
		</div>

		<div
			bind:this={toolsViewRef}
			class="tool-content scrollable-content"
			class:hide-tools-view={closed}
		>
			{#each tools as { name, active } (name)}
				{#if active}
					<div class="view">
						{#if name === 'viewA'}
							<SolutionSummaryComponent />
						{:else if name === 'viewB'}
							{@render snippetOccurrenceList()}
						{:else}
							{@render notImplementedYet()}
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
</tools>

{#snippet toolA(id: number)}
	<Button
		onClick={() => activateTool(id)}
		icon={BookOutline}
		active={tools[id].active}
		title="Clauses"
	/>
{/snippet}

{#snippet toolB(id: number)}
	<Button
		onClick={() => activateTool(id)}
		icon={ClipboardOutline}
		active={tools[id].active}
		title="Occurrence list"
	/>
{/snippet}

{#snippet settings()}
	<Button onClick={onOpenViewMoreEvent} icon={ArrowUpFromBracketOutline} title="Settings" />
{/snippet}

{#snippet snippetOccurrenceList()}
	<OccurrenceListComponent />
{/snippet}

<!--
{#snippet btnGitHub()}
	<Button onClick={() => openGutHubRepository()} icon={GithubSolid} />
{/snippet}
-->

{#snippet notImplementedYet(what?: string)}
	<p>Missing {what}</p>
{/snippet}
