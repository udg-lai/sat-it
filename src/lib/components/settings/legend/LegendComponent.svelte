<script lang="ts">
	import ButtonsLegend from './ButtonsLegendComponent.svelte';
	import TrailLegend from './TrailLegendComponent.svelte';
	import ToolsLegend from './ToolsLegendComponent.svelte';
	import LAI from '$lib/assets/LAI.svg';
	import UDG from '$lib/assets/UDG.png';
	import { Modal } from 'flowbite-svelte';

	let openModal: boolean = $state(false);
</script>

<legend-view>
	<legend>
		<div class="content-container">
			<ButtonsLegend />
		</div>
		<div class="division-container"></div>
		<div class="content-container">
			<TrailLegend />
		</div>
		<div class="division-container"></div>
		<div class="content-container">
			<ToolsLegend />
		</div>
	</legend>
	<acknowledge>
		<button onclick={() => (openModal = true)} class="ack-button">Acknowledgements</button>
		<Modal title="Acknowledgements" bind:open={openModal} size="md" class="modal-style" >
			<ack-modal>
				<content>
					<span>This project was developed as the thesis of Pau Ferrer i Font, jointly carried out with Wilber B. Quito, and was inspired by the former SAT-IT tool created by Marc Cané and Marc Rojo.</span>
					<span>It was supervised by Dr. Jordi Coll Caballero and Dr. Mateu Villaret Ausellé, in response to the needs of the LAI (Logic and Artificial Intelligence) research group.</span>
					<images>
						<img src={LAI} alt={'LAI research group logo'}>
						<img src={UDG} alt={'UDG logo'}>
					</images>
					<a href="https://github.com/udg-lai/sat-it" target="_blank" rel="noopener noreferrer">
						View the project on GitHub
					</a>
				</content>
				
				<button
					class="btn"
					onclick={() => {
						openModal = false;
					}}
				>
					<span>Close</span>
				</button>
			</ack-modal>
		</Modal>
	</acknowledge>
</legend-view>

<style>
	legend-view {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
	}
	legend {
		display: flex;
		flex-direction: row;
		width: 100%;
		height: calc(100% - 50px);
	}
	acknowledge {
		height: 50px;
		width: 100%;
		display: flex;
		border-top: 1px solid var(--border-color);
		align-items: center;
		background-color: var(--main-bg-color);
	}
	.division-container {
		height: 100%;
		width: 2px;
		background-color: var(--border-color);
	}
	.content-container {
		height: 100%;
		width: calc(33.33% - 4px);
		display: flex;
		flex-direction: column;
	}
	.btn {
		border: solid;
		border-width: 1px;
		border-radius: 0.5rem;
		border-color: var(--border-color);
		padding: 0.75rem;
	}
	:global(h3) {
		color: black;
	}
	:global(ack-modal) {
		display: flex;
		flex-direction: column;
	}
	.ack-button {
		display: flex;
		flex: 1;
		justify-content: center;
	}
	content {
		display: flex;
		flex-direction: column;
		text-align: justify;
	}
	content span {
		font-size: 15px;
		padding: 10px;
	}

	images {
		display: flex;
		flex-direction: row;
		justify-content: space-around;
		align-items: center;
		padding-top: 20px;
		padding-bottom: 20px;
		gap: 20px;  
	}
	img {
		height: 100px; 
		object-fit: contain;
	}
	a {
		padding-top: 10px;
		padding-bottom: 10px;
		font-size: 14px;
		text-align: center;
	}
</style>
