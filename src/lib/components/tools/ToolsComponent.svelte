<script lang="ts">
	import Button from './Button.svelte';
	import UploadDimacsComponent from './uploadDimacs/UploadDimacsComponent.svelte';
	import { AngleRightOutline, BugOutline, FileCirclePlusOutline } from 'flowbite-svelte-icons';
	import './styles.css';

	interface Props {
		hide: boolean;
	}

	let { hide }: Props = $props();

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
					hide = true;
				} else {
					hide = false;
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
					toolsViewRef.style.width = 'var(--max-width-tools)';
				}
			}
		}
	}
</script>

<div class="tools-container">
	<div class="options-tools">
		<div class="vertical-separator"></div>
		<div class="toggle-button">
			<Button onClick={() => activateView('viewA')} icon={FileCirclePlusOutline} />
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
	<div bind:this={toolsViewRef} class="tools-view" class:hide-tools-view={hide}>
		{#if !hide}
			<div class="tools-view-container">
				{#each views as { name, open } (name)}
					{#if open}
						{#if name === 'viewA'}
							<UploadDimacsComponent />
						{:else}
							<h2>{name}</h2>
						{/if}
					{/if}
				{/each}
			</div>
		{/if}
	</div>
	<div
		use:resizeHandle
		class="draggable-bar vertical-separator cursor-col-resize"
		class:resizing={isResizing}
	></div>
</div>
