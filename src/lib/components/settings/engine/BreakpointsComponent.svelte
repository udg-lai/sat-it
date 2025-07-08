<script lang="ts">
	import ClauseComponent from '$lib/components/ClauseComponent.svelte';
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import Clause from '$lib/entities/Clause.svelte.ts';
	import Literal from '$lib/entities/Literal.svelte.ts';
	import {
		addBreakpoint,
		getBreakpoints,
		isBreakpoint,
		removeBreakpoint
	} from '$lib/states/breakpoints.svelte.ts';
	import { getProblemStore, getVariablePool, type Problem } from '$lib/states/problem.svelte.ts';
	import { logInfo } from '$lib/stores/toasts.ts';
	import { BugOutline } from 'flowbite-svelte-icons';
	import './style.css';

	interface Props {
		iconClass: { size: string };
	}

	let { iconClass }: Props = $props();
	const elementClass: string =
		'rounded-lg bg-[var(--main-bg-color)] border border-[var(--border-color)] p-2';

	const breakpoints: number[][] = $derived(
		Array.from(getBreakpoints().values())
			.map((lit) => [Math.abs(lit), lit])
			.sort((a, b) => {
				const [va, la] = a;
				const [vb, lb] = b;
				if (va === vb) {
					return la - lb;
				} else {
					return va - vb;
				}
			})
	);

	const variables = $derived(getVariablePool());

	const clauses: Clause[] = $derived.by(() => {
		return breakpoints.map(([, literal]) => {
			return new Clause([Literal.buildFrom(literal, variables)], {
				comments: [`Breakpoint: ${literal}`],
				tag: literal
			});
		});
	});

	let literalBreakpoint: number | undefined = $state();

	const problem: Problem = $derived(getProblemStore());

	let max: number = $derived(problem.variables.size());
	let min: number = $derived(max * -1);

	const addLiteralBreakpoint = (): void => {
		if (literalBreakpoint === undefined) return;

		if (isBreakpoint(literalBreakpoint)) {
			logInfo(
				'Breakpoint',
				`Variable ${Math.abs(literalBreakpoint)} for ${literalBreakpoint > 0} assignment already added`
			);
		}
		if (!isNaN(literalBreakpoint) && problem.variables.includes(Math.abs(literalBreakpoint))) {
			addBreakpoint({ type: 'literal', literal: literalBreakpoint });
		}
		literalBreakpoint = undefined;
	};

	const validateInput = (event: Event): void => {
		const input: HTMLInputElement = event.target as HTMLInputElement;

		if (input.value === '-') {
			return;
		}

		if (input.value === '') {
			return;
		}

		const value: number = Number(input.value);

		if (isNaN(value)) {
			literalBreakpoint = undefined;
			input.value = '';
			return;
		}

		if (value < min || value > max || value === 0) {
			literalBreakpoint = undefined;
			input.setCustomValidity(`Valid breakpoints in [${min} : ${max}] except zero`);
			input.reportValidity();
			return;
		} else {
			input.setCustomValidity('');
		}

		literalBreakpoint = value;
	};
</script>

<div class="heading-class">
	<DynamicRender component={BugOutline} props={iconClass} />
	<span class="pt-1">Breakpoints</span>
</div>
<div class="body-class">
	<variables class="{elementClass} flex items-center justify-between">
		<label for="baselineDelay" class="whitespace-nowrap text-gray-900">Literal:</label>
		<input
			id="baselineDelay"
			type="text"
			class="w-32 rounded-lg border border-[var(--border-color)] text-right focus:outline-none focus:ring-0"
			bind:value={literalBreakpoint}
			onchange={addLiteralBreakpoint}
			oninput={validateInput}
			placeholder=""
			{max}
		/>
	</variables>
	<variables-display class="breakpoint-display">
		<div class="scrollable">
			<ul>
				{#each clauses as clause}
					<li>
						<button
							onclick={() => {
								removeBreakpoint(clause.getTag() as number);
							}}
							class="variable-text"
						>
							<ClauseComponent {clause} classStyle={'bp-clause'} />
						</button>
					</li>
				{/each}
			</ul>
		</div>
	</variables-display>
</div>

<style>
	.breakpoint-display {
		flex: 1;
		width: 100%;
		scrollbar-width: none; /* Firefox */
		display: flex;
		padding: 1rem 0rem;
		height: calc(100% - 4rem);
		border: 1px solid var(--border-color);
		border-radius: 0.5rem;
		background-color: var(--main-bg-color);
	}

	.breakpoint-display::-webkit-scrollbar {
		display: none; /* Safari and Chrome */
	}

	.variable-text {
		width: 100%;
		border-radius: 10px;
		background-color: white;
		border: solid;
		border-width: 1px;
		border-color: var(--border-color);
		padding: 0.5rem;
		transition:
			color 300ms,
			background-color 300ms,
			border-color 300ms;
		height: 3rem;
	}

	.variable-text:hover {
		background-color: rgb(255, 185, 185);
		color: rgb(202, 53, 53);
		border-color: rgb(245, 42, 42);
	}

	.scrollable {
		height: 100%;
		width: 100%;
		overflow: auto;
		scrollbar-width: none;
		padding: var(--breakpoints-gap);
		scroll-behavior: smooth;
	}

	.scrollable::-webkit-scrollbar {
		display: none;
	}

	ul {
		display: flex;
		flex-direction: column;
		gap: var(--breakpoints-gap);
	}

	li {
		width: 100%;
		list-style-type: none;
	}

	:global(.bp-clause) {
		justify-content: center;
		align-items: center;
	}
</style>
