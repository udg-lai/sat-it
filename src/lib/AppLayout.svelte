<script lang="ts"></script>

<div class="grid-container">
	<sidebar></sidebar>
	<workspace class="grid-container">
		<trail></trail>
		<play-area></play-area>
	</workspace>

</div>

<style>

	trail, play-area {
		align-items: center;
		justify-content: center;
		flex: auto;
	}

	trail {
		background-color: yellow;
	}

	play-area {
		background-color: blue;
	}

	workspace {
		flex: auto;
	}

	sidebar {
		width: 10vw;
		background-color: brown;
	}

	.grid-container {
		display: flex;
		height: 100%;
	}
</style>
