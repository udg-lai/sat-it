<script lang="ts">
	import DescriptionComponent from './DescriptionComponent.svelte';
	import AddInstance from '$lib/assets/tools/AddInstance.png';
	import CloseSettings from '$lib/assets/tools/CloseSettings.png';
	import OpenSettings from '$lib/assets/tools/OpenSettings.png';
	import Instance from '$lib/assets/tools/Instance.png';
	import Legend from '$lib/assets/tools/Legend.png';
	import Engine from '$lib/assets/tools/Engine.png';
	import OccurrenceList from '$lib/assets/tools/OccurrenceList.png';
	import Summary from '$lib/assets/tools/Summary.png';
	import './style.css';
</script>

<div class="heading-class">
	<span class="pt-1">Tools</span>
</div>
<div class="body-class">
	<DescriptionComponent
		image={AddInstance} 
		imageAlt='Add instance option'
		description={'Tool to add one or multiple instances'}
	/>
	<DescriptionComponent
		image={Legend} 
		imageAlt='Legend option'
		description={'Button to open the legend view where the different main program components are presented'}
	/>
	<DescriptionComponent
		image={Instance} 
		imageAlt='Instance option'
		description={'Button to open the instance view where the different instances can be selected, previsualized and deleted'}
	/>
	<DescriptionComponent
		image={Engine} 
		imageAlt='Engine option'
		description={'Button to open the engine view where different solving parameters can be modified'}
	/>
	<DescriptionComponent
		image={CloseSettings} 
		imageAlt='Close settings option'
		description={'Button to close the settings view'}
	/>
	<DescriptionComponent
		image={OpenSettings} 
		imageAlt='Open settings option'
		description={'Button to open the settings view'}
	/>
	<DescriptionComponent
		image={Summary} 
		imageAlt='Summary view'
		description={'View to revise the current state of the clauses and learned clauses of selected problem'}
	/>
	<DescriptionComponent
		image={OccurrenceList} 
		imageAlt='Occurrence list view'
		description={'Tool that helps the user analyze and see which are the different clauses that are being checked during the revision of a occurrence list'}
	/>
</div>
