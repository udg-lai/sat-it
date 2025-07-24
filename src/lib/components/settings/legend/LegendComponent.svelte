<script lang="ts">
	import LAI from '$lib/assets/LAI.svg';
	import UDG from '$lib/assets/UDG.png';
	import { Modal } from 'flowbite-svelte';
	import ButtonsLegend from './ButtonsLegendComponent.svelte';
	import ToolsLegend from './ToolsLegendComponent.svelte';
	import TrailLegend from './TrailLegendComponent.svelte';

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
		<Modal
			title="Acknowledgements"
			bind:open={openModal}
			size="md"
			bodyClass="p-2 md:p-4 space-y-4 flex-1 overflow-y-auto overscroll-contain"
			headerClass="dark:bg-white dark:text-gray-500 dark:border-gray-200 dark:divide-gray-200 flex justify-between items-center p-4 md:p-5 rounded-t-lg"
			class="modal-style dark:divide-gray-200 dark:border-gray-200 dark:bg-white  dark:text-gray-500 "
		>
			<ack-modal>
				<content>
					<span
						>SAT-IT is the result of Pau Ferrer i Font's thesis, developed in collaboration with the
						PhD candidate Wilber Bermeo Quito. The work was supervised by Dr. Jordi Coll Caballero
						and Dr. Mateu Villaret Ausellé, within the Logic and Artificial Intelligence (LAI)
						research group at the University of Girona. We would like to thank Marc Cané and Marc
						Rojo for the original version of SAT-IT, which served as inspiration.
					</span>
					<images>
						<a href="https://imae.udg.edu/Recerca/LAI/" target="_blank" rel="noopener noreferrer">
							<img src={LAI} alt={'LAI research group logo'} class="lai-img" />
						</a>
						<a href="https://www.udg.edu/en/" target="_blank" rel="noopener noreferrer">
							<img src={UDG} alt={'UDG logo'} />
						</a>
					</images>
					<span>
						SAT-IT is an open source GitHub project and can be consulted <a
							class="github"
							href="https://github.com/udg-lai/sat-it"
							target="_blank"
							rel="noopener noreferrer">here</a
						>.
					</span>
					<span class="how-to-cite">Cite:</span> <br />
					<div class="how-to-cite-body">
						{'@misc{pau2025satit,'}
						<span class="how-to-cite-line"
							>{'  author       = {Wilber Bermeo and Jordi Coll and Pau Ferrer and Mateu Villaret},'}</span
						>
						<span class="how-to-cite-line"
							>{'  title        = {{SAT-IT, The Interactive SAT Tracer}},'}</span
						>
						<span class="how-to-cite-line">{'  year         = {2025},'}</span>
						<span class="how-to-cite-line"
							>{'  url          = {https://sat-it.udg.edu/},'}</span
						>
						<span class="how-to-cite-line">{'  note         = {Accessed: \\today}'}</span>
						{'}'}
					</div>

					<div class="how-to-cite-body">
						{'@inproceedings{DBLP:conf/ccia/CaneCRV23,'}<br />
						<span class="how-to-cite-line"
							>{"author       = {Marc Can{'{e}} and Jordi Coll and Marc Rojo and Mateu Villaret},"}</span
						>
						<span class="how-to-cite-line"
							>{'title        = {{SAT-IT:} The Interactive {SAT} Tracer},'}</span
						>
						<span class="how-to-cite-line"
							>{'booktitle    = {Artificial Intelligence Research and Development - Proceedings of the 25th International Conference of the Catalan Association for Artificial Intelligence, {CCIA}},'}</span
						>
						<span class="how-to-cite-line"
							>{'series       = {Frontiers in Artificial Intelligence and Applications},'}</span
						>
						<span class="how-to-cite-line">{'volume       = {375},'}</span>
						<span class="how-to-cite-line">{'pages        = {337--346},'}</span>
						<span class="how-to-cite-line">{'publisher    = {{IOS} Press},'}</span>
						<span class="how-to-cite-line">{'year         = {2023},'}</span>
						<span class="how-to-cite-line"
							>{'url          = {https://doi.org/10.3233/FAIA230704},'}</span
						>
						<span class="how-to-cite-line">{'doi          = {10.3233/FAIA230704}'}</span>
						{'}'}
					</div>
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
		height: 100%;
		align-items: center;
	}
	.ack-button:hover {
		color: var(--icon-base);
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
		scale: 0.8;
	}
	.lai-img {
		scale: 0.7;
	}
	a {
		padding-top: 10px;
		padding-bottom: 10px;
		font-size: 14px;
		text-align: center;
		font-weight: bold;
	}

	a.github:hover {
		color: var(--icon-base);
	}

	.how-to-cite {
		padding: 0px;
		font-size: 15px;
	}
	.how-to-cite-body {
		padding: 5px;
		font-size: 12px;
		border: 1px solid var(--border-color);
		border-bottom: 1px solid var(--border-color);
		background-color: var(--cite-bg-color);
		overflow-x: auto;
		overflow-y: hidden;
		white-space: nowrap;
		margin-bottom: 10px;
	}
	.how-to-cite-line {
		font-size: 12px;
		padding: 0px 0px 0px 20px;
		display: flex;
		flex: 1;
	}
</style>
