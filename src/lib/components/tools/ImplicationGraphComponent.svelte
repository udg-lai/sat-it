<script lang="ts">
	import { getImplicationGraph } from '$lib/entities/ImplicationGraph.svelte.ts';
	import * as d3 from 'd3';
	import { onMount } from 'svelte';

	const implicationGraph = $derived(getImplicationGraph());

	$effect(() => {
		console.log('Implication graph changed:', implicationGraph);
	});

	let svg;

	const width = 1200;
	const height = 700;

	export const nodes = [
		{ id: '¬a', level: 0 },

		{ id: 'b', level: 1, decision: true },
		{ id: 'c', level: 1 },
		{ id: 'd', level: 1 },
		{ id: 'e', level: 1 },

		{ id: 'f', level: 2, decision: true },
		{ id: 'g', level: 2 },

		{ id: '⊥', level: 3, conflict: true }
	];

	export const edges = [
		{ source: '¬a', target: 'c' },

		{ source: 'b', target: 'c' },
		{ source: 'b', target: 'd' },

		{ source: 'c', target: 'e' },
		{ source: 'd', target: 'e' },

		{ source: 'f', target: 'g' },

		{ source: 'e', target: '⊥' },
		{ source: 'g', target: '⊥' }
	];

	function layout(nodes) {
		const groups = new Map();

		for (const n of nodes) {
			if (!groups.has(n.level)) groups.set(n.level, []);

			groups.get(n.level).push(n);
		}

		const Y = 150;
		const X = 180;

		groups.forEach((group) => {
			group.forEach((node, i) => {
				node.x = 100 + i * X;
				node.y = 80 + node.level * Y;
			});
		});
	}

	layout(nodes);

	onMount(() => {
		const root = d3.select(svg);

		const g = root.append('g');

		root.call(
			d3.zoom().on('zoom', (e) => {
				g.attr('transform', e.transform);
			})
		);

		g.selectAll('line')
			.data(edges)
			.join('line')
			.attr('x1', (d) => find(d.source).x)
			.attr('y1', (d) => find(d.source).y)
			.attr('x2', (d) => find(d.target).x)
			.attr('y2', (d) => find(d.target).y)
			.attr('stroke', '#777');

		const node = g
			.selectAll('g.node')
			.data(nodes)
			.join('g')
			.attr('transform', (d) => `translate(${d.x},${d.y})`);

		node
			.append('circle')
			.attr('r', 28)
			.attr('fill', (d) => {
				if (d.conflict) return '#ff5555';

				if (d.decision) return '#66ccff';

				return '#ddd';
			});

		node
			.append('text')
			.text((d) => d.id)
			.attr('text-anchor', 'middle')
			.attr('dy', 5);

		function find(id) {
			return nodes.find((n) => n.id === id);
		}
	});
</script>

<svg bind:this={svg} {width} {height} />
