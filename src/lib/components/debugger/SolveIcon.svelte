<script>
	import { ArrowRightOutline } from 'flowbite-svelte-icons';
</script>

<div class="solve-icon">
	<div class="arrow fst-arrow">
		<ArrowRightOutline size="sm" />
	</div>
	<div class="arrow snd-arrow">
		<ArrowRightOutline size="sm" />
	</div>
	<div class="arrow third-arrow">
		<ArrowRightOutline size="sm" />
	</div>
</div>

<style>
	.solve-icon {
		position: relative;
		height: 40px;
		width: 40px;
		display: flex;
		justify-content: center;
	}

	.arrow {
		position: absolute;
	}

	.fst-arrow {
		top: 7px;
		left: 11px;
	}

	.snd-arrow {
		top: 14px;
		left: 15px;
	}

	.third-arrow {
		bottom: 5px;
		left: 11px;
	}
</style>
