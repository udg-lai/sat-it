<script lang="ts">
	import {
		conflictDetectedEventBus,
		openSettingsViewEventBus,
		visitingComplementaryOccEventBus
	} from '$lib/events/events.ts';
	import { logFatal } from '$lib/states/toasts.svelte.ts';
	import {
		ArrowUpFromBracketOutline,
		BookOutline,
		ClipboardOutline,
		ShareNodesSolid
	} from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
	import Button from './Button.svelte';
	import ImplicationGraphComponent from './ImplicationGraphComponent.svelte';
	import OccurrenceListComponent from './OccurrenceListComponent.svelte';
	import SolutionSummaryComponent from './SolutionSummaryComponent.svelte';
	import './style.css';

	let toolsViewRef: HTMLElement;

	let isResizing = $state(false);

	type ToolName = 'clause-database' | 'ow-list' | 'implication-graph';

	interface Tool {
		name: ToolName;
		active: boolean;
	}

	let tools: Tool[] = $state([]);
	let lastActiveViewIndex: number = $state(0);
	let closed: boolean = $derived(tools.every((v) => v.active === false));

	onMount(() => {
		tools = [
			{
				name: 'clause-database',
				active: true
			},
			{
				name: 'ow-list',
				active: false
			},
			{
				name: 'implication-graph',
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

	function activateTool(toolName: ToolName): void {
		const tool = tools.find((v) => v.name === toolName);
		if (!tool) logFatal('activateTool', `Tool ${toolName} not found.`);

		for (const t of tools) {
			if (t.name === toolName) {
				if (t.active) {
					toolsViewRef.style.width = '0px';
				} else {
					toolsViewRef.style.width = 'var(--max-width-tools)';
				}
				t.active = !t.active;
			} else {
				t.active = false;
			}
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

	function focusOnToolView(toolName: ToolName): void {
		const tool = tools.find((v) => v.name === toolName);
		if (!tool) logFatal('focusOnToolView', `Tool ${toolName} not found.`);

		for (const t of tools) {
			if (t.name === toolName) {
				t.active = true;
				toolsViewRef.style.width = 'var(--max-width-tools)';
			} else {
				t.active = false;
			}
		}
		tools = [...tools];
	}

	onMount(() => {
		const subs: (() => void)[] = [];
		subs.push(visitingComplementaryOccEventBus.subscribe(() => focusOnToolView('ow-list')));
		subs.push(conflictDetectedEventBus.subscribe(() => focusOnToolView('implication-graph')));
		return () => {
			subs.forEach((f) => f());
		};
	});
</script>

<tools>
	<div class="tools-container">
		<div class="options-tools">
			{#each tools as { name }, id}
				<div class="toggle-button">
					{#if name === 'clause-database'}
						{@render clauseDatabase(id)}
					{:else if name === 'ow-list'}
						{@render owList(id)}
					{:else if name === 'implication-graph'}
						{@render implicationGraph(id)}
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
						{#if name === 'clause-database'}
							<SolutionSummaryComponent />
						{:else if name === 'ow-list'}
							{@render snippetOccurrenceList()}
						{:else if name === 'implication-graph'}
							<ImplicationGraphComponent />
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

{#snippet clauseDatabase(id: number)}
	<Button
		onClick={() => activateTool('clause-database')}
		icon={BookOutline}
		active={tools[id].active}
		title="Clauses"
	/>
{/snippet}

{#snippet owList(id: number)}
	<Button
		onClick={() => activateTool('ow-list')}
		icon={ClipboardOutline}
		active={tools[id].active}
		title="Occurrence list"
	/>
{/snippet}

{#snippet implicationGraph(id: number)}
	<Button
		onClick={() => activateTool('implication-graph')}
		icon={ShareNodesSolid}
		active={tools[id].active}
		title="Implication graph"
	/>
{/snippet}

{#snippet settings()}
	<Button onClick={onOpenViewMoreEvent} icon={ArrowUpFromBracketOutline} title="Settings" />
{/snippet}

{#snippet snippetOccurrenceList()}
	<OccurrenceListComponent />
{/snippet}

{#snippet notImplementedYet(what?: string)}
	<p>Missing {what}</p>
{/snippet}
