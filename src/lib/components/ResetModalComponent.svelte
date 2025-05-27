<script lang="ts">
	import { getResetModal } from "$lib/store/reset-modal.svelte.ts";
	import { Modal } from "flowbite-svelte";
	import { ExclamationCircleOutline } from "flowbite-svelte-icons";
	import { slide } from "svelte/transition";

  let resetModal:boolean = $state(getResetModal());

</script>

<Modal bind:open={resetModal} size="xs" autoclose transition={slide}>
  <div class="text-center">
    <ExclamationCircleOutline class="mx-auto mb-4 h-12 w-12 text-gray-400" />
    <h3 class="mb-5 text-lg font-normal text-gray-500">By doing action, all your trail progress will be lost. Are you sure?</h3>
    <button color="red" class="me-2">Yes, I'm sure</button>
    <button color="alternative">No, cancel</button>
  </div>
</Modal>