<script lang="ts">
	import DescriptionComponent from "./DescriptionComponent.svelte";
	import ChildlessDecision from '$lib/assets/trail/ChildlessImage.png';
	import CollapsedDecision from '$lib/assets/trail/CollapsedImage.png';
	import Up from '$lib/assets/trail/UPImage.png';
	import ConflictTrail from '$lib/assets/trail/ConflictTrailImage.png';
	import Running from '$lib/assets/trail/RunningImage.png';
	import Conflict from '$lib/assets/trail/ConflictImage.png';
	import Close from '$lib/assets/trail/CloseImage.png';
	import Sat from '$lib/assets/trail/SatImage.png';
	import Unsat from '$lib/assets/trail/UnsatImage.png';

</script>

<div class="heading-class">
	<span class="pt-1">Trail</span>
</div>
<div class="body-class">
	<DescriptionComponent
		image={ChildlessDecision} 
		imageAlt='Childless decision trail representation'
		description={'Decision with no propagations or with expanded propagations. If pressed, collapse decision level and revert up to here options can be displayed'}
	/>
	<DescriptionComponent
		image={CollapsedDecision} 
		imageAlt='Collapsed decision trail representation'
		description={'Decision with collapsed propagations. If pressed, expand decision level and revert up to here options can be displayed'}
	/>
	<DescriptionComponent
		image={Up} 
		imageAlt='Unit propagation trail representation'
		description={'Unit propagation. If pressed, it shows the id and literals from the clause that caused the propagation'}
	/>
	<DescriptionComponent
		image={ConflictTrail} 
		imageAlt='Conflict trail representation'
		description={'Conflict representation. If pressed, and is a backjumping, it shows the id and literals from the clauses that caused the propagation'}
	/>
	<DescriptionComponent
		image={Running} 
		imageAlt='Running trail information'
		description={'Icon that represents that the trail doesn\'t have an outcome. If pressed, the trail information view is displayed'}
	/>
	<DescriptionComponent
		image={Conflict} 
		imageAlt='Conflict trail information'
		description={'Icon that represents that the trail has a conflict. If pressed, the trail information view is displayed'}
	/>
	<DescriptionComponent
		image={Close} 
		imageAlt='Close trail information'
		description={'Icon that represents that the trail information view is opened. If pressed, this view is closed.'}
	/>
	<DescriptionComponent
		image={Sat} 
		imageAlt='Sat trail information'
		description={'Icon that represents that the trail has reached a SAT state'}
	/>
	<DescriptionComponent
		image={Unsat} 
		imageAlt='Unsat trail information'
		description={'Icon that represents that the trail has reached an UnSAT state'}
	/>
</div>
