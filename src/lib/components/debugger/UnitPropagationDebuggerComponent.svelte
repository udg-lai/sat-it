<script>
	// @ts-nocheck

	import { ArrowRightOutline, CaretRightOutline, ReplyOutline } from 'flowbite-svelte-icons';
	import DynamicRender from '../DynamicRender.svelte';
	import { emitUPEvent } from './events.svelte.ts';

	const assignmentProps = {
		class: 'h-8 w-8'
	};
	const reverseProps = {
		class: 'h-8 w-8 transform -scale-x-100'
	};
</script>

<button
	class="btn general-btn"
	title="Step"
	onclick={() => {
		emitUPEvent({ type: 'step' });
	}}
>
	<DynamicRender component={CaretRightOutline} props={assignmentProps} />
</button>

<button
	class="btn general-btn"
	title="Following Variable"
	onclick={() => emitUPEvent({ type: 'following' })}
>
	<DynamicRender component={ReplyOutline} props={reverseProps} />
</button>

<button
	class="btn general-btn"
	title="Finish unit propagations"
	onclick={() => emitUPEvent({ type: 'finish' })}
>
	<DynamicRender component={ArrowRightOutline} props={assignmentProps} />
</button>
