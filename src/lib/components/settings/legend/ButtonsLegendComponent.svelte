<script lang="ts">
	import { CheckCircleOutline } from 'flowbite-svelte-icons';
	import DescriptionComponent from './DescriptionComponent.svelte';
</script>

<div class="heading-class">
	<span class="pt-1">Buttons</span>
</div>
<div class="body-class">
	<DescriptionComponent icon={CheckCircleOutline} description={'hola'} />
	<DescriptionComponent icon={CheckCircleOutline} description={'hola'} />
	<DescriptionComponent icon={CheckCircleOutline} description={'hola'} />
</div>
