<script lang="ts">
	import { CodeBranchOutline } from "flowbite-svelte-icons";

  interface Props {
    onClick?: () => void
  }

  let { onClick }: Props = $props();

</script>

<button onclick={onClick} type="button" class="button-high-contrast !p-2">
				<CodeBranchOutline class="h-10 w-10" />
</button>

<style>

.button-high-contrast {
  background-color: transparent;
  padding: 8px 16px;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  outline: none;
  transition: background 0.2s, color 0.2s;
  border: 1px solid transparent;
  color: var(--secondary-font-color);
}

.button-high-contrast:hover {
  border-width: 1px;
  border-style: dashed;
  border-color: var(--focus-border-color);
  color: var(--main-font-color);
}

.button-high-contrast:active {
  border-style: solid;
}



</style>