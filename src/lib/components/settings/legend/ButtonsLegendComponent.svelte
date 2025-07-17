<script lang="ts">
	import { ArrowRightOutline, CaretRightOutline, CheckCircleOutline } from 'flowbite-svelte-icons';
	import DescriptionComponent from './DescriptionComponent.svelte';
	import SolveIcon from '$lib/components/debugger/SolveIcon.svelte';
</script>

<div class="heading-class">
	<span class="pt-1">Buttons</span>
</div>
<div class="body-class">
	<DescriptionComponent icon={CaretRightOutline} description={'Single step button'} />
	<DescriptionComponent icon={ArrowRightOutline} description={'Complete a trail until reaching a final state or a conflict'} />
	<DescriptionComponent icon={SolveIcon} description={'Solve the problem until reaching a final state'} />
</div>
