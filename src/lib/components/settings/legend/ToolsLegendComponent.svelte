<script lang="ts">
	import DescriptionComponent from './DescriptionComponent.svelte';
	import {
		AdjustmentsVerticalOutline,
		ArrowDownToBracketOutline,
		ArrowUpFromBracketOutline,
		BookOpenOutline,
		BookOutline,
		ClipboardOutline,
		ExclamationCircleOutline,
		PlusOutline
	} from 'flowbite-svelte-icons';
	import './style.css';

	const regularProps = {
		size: 'lg'
	};

	const addInstanceProps = {
		size: 'lg',
		class: 'addInstance'
	};
</script>

<div class="heading-class">
	<span class="pt-1">Tools</span>
</div>
<div class="body-class">
	<DescriptionComponent
		component={PlusOutline}
		componentProps={addInstanceProps}
		description={'Tool to add one or multiple instances'}
	/>
	<DescriptionComponent
		component={ExclamationCircleOutline}
		componentProps={regularProps}
		description={'Button to open the legend view where the different main program components are presented'}
	/>
	<DescriptionComponent
		component={BookOpenOutline}
		componentProps={regularProps}
		description={'Button to open the instance view where the different instances can be selected, previsualized and deleted'}
	/>
	<DescriptionComponent
		component={AdjustmentsVerticalOutline}
		componentProps={regularProps}
		description={'Button to open the engine view where different solving parameters can be modified'}
	/>
	<DescriptionComponent
		component={ArrowDownToBracketOutline}
		componentProps={regularProps}
		description={'Button to close the settings view'}
	/>
	<DescriptionComponent
		component={ArrowUpFromBracketOutline}
		componentProps={regularProps}
		description={'Button to open the settings view'}
	/>
	<DescriptionComponent
		component={BookOutline}
		componentProps={regularProps}
		description={'View to revise the current state of the clauses and learned clauses of selected problem'}
	/>
	<DescriptionComponent
		component={ClipboardOutline}
		componentProps={regularProps}
		description={'Tool that helps the user analyze and see which are the different clauses that are being checked during the revision of a occurrence list'}
	/>
</div>

<style>
	:global(.addInstance) {
		color: white;
		background-color: var(--conflict-color);
		border-radius: 50px;
	}
</style>
