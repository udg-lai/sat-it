<script lang="ts">
	import { onMount } from 'svelte';
	import Button from './Button.svelte';
	import { CodeBranchOutline, AngleRightOutline, BugOutline } from 'flowbite-svelte-icons';
	import './styles.css';

	interface Props {
		hide: boolean;
	}

	let { hide }: Props = $props();

	let toolsHTMLElement: HTMLElement;
	let isResizing = $state(false);

	onMount(() => {
		const queryElement: HTMLElement | null = document.getElementById('tools-view');
		if (queryElement) toolsHTMLElement = queryElement;
		else console.error(`Tools view HTML element not found in the DOM`);
	});

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
					hide = true;
				} else {
					hide = false;
					if (newX < barWidth + minWidthTool) {
						toolsHTMLElement.style.width = `${minWidthTool}px`;
					} else {
						toolsHTMLElement.style.width = `calc(${newX}px - var(--bar-width))`;
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
		open: boolean;
	}
	let views: View[] = $state([
		{
			name: 'viewA',
			open: true
		},
		{
			name: 'viewB',
			open: false
		},
		{
			name: 'viewC',
			open: false
		},
		{
			name: 'viewD',
			open: false
		}
	]);

	function activateView(view: string): void {
		const viewIndex = views.findIndex((v) => v.name === view);
		const viewRef = viewIndex == -1 ? undefined : views[viewIndex];
		if (viewIndex === undefined) {
			console.warn(`Accessing to not defined view ${view}`);
		} else {
			const viewIsOpen: boolean = viewRef?.open || false;
			if (viewIsOpen) {
				hide = !hide;
			} else {
				views = views.map((v) => ({ ...v, open: false }));
				const newViewRef = views[viewIndex];
				newViewRef.open = true;
				if (hide) {
					hide = false;
					toolsHTMLElement.style.width = 'var(--max-width-tools)';
				}
			}
		}
	}
</script>

<div class="tools-container">
	<div class="options-tools">
		<div class="vertical-separator"></div>
		<div class="toggle-button">
			<Button onClick={() => activateView('viewA')} icon={CodeBranchOutline} />
		</div>
		<div class="toggle-button">
			<Button onClick={() => activateView('viewB')} icon={AngleRightOutline} />
		</div>
		<div class="toggle-button">
			<Button onClick={() => activateView('viewC')} icon={BugOutline} />
		</div>
		<div class="toggle-button"></div>
		<div class="toggle-button"></div>
	</div>
	<div id="tools-view" class="tools-view" class:hide-tools-view={hide}>
		{#if !hide}
			{#each views as { name, open } (name)}
				{#if open}
					<h2>{name}</h2>
				{/if}
			{/each}
		{/if}
	</div>
	<div use:resizeHandle class="draggable-bar cursor-col-resize" class:resizing={isResizing}></div>
</div>
