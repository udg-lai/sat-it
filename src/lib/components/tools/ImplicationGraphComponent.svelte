<script lang="ts">
	import { getFocusedTrail } from '$lib/states/trails.svelte.ts';
	import { ImplicationGraph } from '$lib/entities/ImplicationGraph.svelte.ts';
	import type ClausePool from '$lib/entities/ClausePool.svelte.ts';
	import { getClausePool } from '$lib/states/problem.svelte.ts';
	import { isLeft, fromLeft } from '$lib/types/either.ts';

	import * as d3 from 'd3';

	let trail = $derived(getFocusedTrail());
	let assignments = $derived(trail.getAssignments());
	let element: HTMLDivElement | null = null;

	type GraphNode = d3.SimulationNodeDatum & {
		nodeIndex: number;
		group: string;
		title: string;
	};

	type GraphLink = d3.SimulationLinkDatum<GraphNode>;

	$effect(() => {
		if (!element) return;

		const cPool: ClausePool = getClausePool();

		const data: ImplicationGraph = new ImplicationGraph(assignments, cPool);

		if (trail.getState() === 'conflict') {
			data.addConflict(trail.getConflictiveClause());
			const ctx = trail.getResolutionContext();
			const clauses = trail.getUPContext();
			ctx.reverse().map((c, i) => {
				if (isLeft(c) && i > 0) {
					let j = clauses.length - i;
					let clauseCut = cPool.at(fromLeft(clauses[j]).reasonCRef);
					data.addCut(clauseCut);
				}
			});
		}

		const css = getComputedStyle(document.documentElement);

		const chart = ForceGraph(data, {
			nodeGroups: [
				'conflict',
				'decision',
				'propagation',
				'conflictReason',
				'cutFrontier',
				'learned'
			],
			colors: [
				css.getPropertyValue('--lemma-border-color').trim(), // Conflict
				css.getPropertyValue('--secondary-font-color').trim(), // Decisio
				css.getPropertyValue('--temporal-color').trim(), //UP
				css.getPropertyValue('--unsatisfied-color').trim(), // Cut (conflictReason)
				css.getPropertyValue('--unsatisfied-color-o').trim(), // Cut frontier
				css.getPropertyValue('--boolean-constraint-propagation').trim() // Learned
			],
			height: 600,
			width: element?.clientWidth ?? 800
		});

		element.innerHTML = '';
		element.appendChild(chart);
	});

	function ForceGraph(
		implicationGraph: ImplicationGraph,
		{
			nodeGroups,
			colors,
			width,
			height
		}: {
			nodeGroups: string[];
			colors: readonly string[];
			width: number;
			height: number;
		}
	): SVGSVGElement {
		const nodeRadius = 15;

		const nodes: GraphNode[] = implicationGraph.getNodes().map((n) => ({
			nodeIndex: n.index(),
			group: n.group(),
			title: n.title()
		}));

		const links: GraphLink[] = implicationGraph.getLinks().map((l) => ({
			source: l.getSource(),
			target: l.getTarget()
		}));

		const color = d3.scaleOrdinal<string, string>(nodeGroups, colors);
		const nodeDepths = getNodeDepths(nodes, links);
		const maxDepth = Math.max(0, ...Array.from(nodeDepths.values()));
		const horizontalPadding = Math.max(nodeRadius * 6, 40);
		const usableWidth = Math.max(width - horizontalPadding * 2, 1);
		const levelWidth = maxDepth > 0 ? usableWidth / maxDepth : 0;

		const forceNode = d3.forceManyBody<GraphNode>();
		const forceLink = d3
			.forceLink<GraphNode, GraphLink>(links)
			.id((d) => d.nodeIndex)
			.strength(0.5);
		const forceCollide = d3.forceCollide(nodeRadius * 2).strength(0.3);
		const forceX = d3
			.forceX<GraphNode>((d) => {
				const depth = nodeDepths.get(d.nodeIndex) ?? 0;
				return -width / 2 + horizontalPadding + depth * levelWidth;
			})
			.strength(1);

		const simulation = d3
			.forceSimulation<GraphNode>(nodes)
			.force('link', forceLink)
			.force('charge', forceNode)
			.force('collide', forceCollide)
			.force('x', forceX)
			.force('center', d3.forceCenter())
			.on('tick', ticked);

		nodes.forEach((node) => {
			const depth = nodeDepths.get(node.nodeIndex) ?? 0;
			node.x = -width / 2 + horizontalPadding + depth * levelWidth;
		});

		const svg = d3
			.create('svg')
			.attr('width', width)
			.attr('height', height)
			.attr('viewBox', [-width / 2, -height / 2, width, height])
			.attr('style', 'background: white; max-width: 100%; height: auto;');

		svg
			.append('defs')
			.append('marker')
			.attr('id', 'arrow')
			.attr('viewBox', '0 -5 10 10')
			.attr('refX', 10)
			.attr('refY', 0)
			.attr('markerWidth', 6)
			.attr('markerHeight', 6)
			.attr('orient', 'auto')
			.append('path')
			.attr('d', 'M0,-5L10,0L0,5')
			.attr('fill', '#999');

		const link = svg
			.append('g')
			.attr('stroke', '#999')
			.attr('stroke-opacity', 0.6)
			.attr('stroke-width', 1.5)
			.attr('stroke-linecap', 'round')
			.selectAll('line')
			.data(links)
			.join('line')
			.attr('marker-end', 'url(#arrow)');

		const node = svg
			.append('g')
			.attr('stroke', '#000')
			.attr('stroke-width', 1.5)
			.selectAll<SVGCircleElement, GraphNode>('circle')
			.data(nodes)
			.join('circle')
			.attr('r', nodeRadius)
			.call(drag(simulation));

		const nodeText = svg
			.append('g')
			.selectAll('text')
			.data(nodes)
			.join('text')
			.text((d) => d.title)
			.attr('text-anchor', 'middle')
			.attr('dominant-baseline', 'middle')
			.style('font-size', `${Math.max(Math.floor(nodeRadius * 0.65), 8)}px`)
			.style('fill', '#000')
			.style('pointer-events', 'none');

		node.attr('fill', (d) => color(String(d.group)) ?? null);
		node.append('title').text((d) => d.title);

		function getNodeDepths(nodes: GraphNode[], links: GraphLink[]): Map<number, number> {
			const adjacency = new Map<number, number[]>();
			const incoming = new Map<number, number>();
			const depths = new Map<number, number>();

			nodes.forEach((node) => {
				const index = node.nodeIndex;
				adjacency.set(index, []);
				incoming.set(index, 0);
				depths.set(index, 0);
			});

			links.forEach((link) => {
				const source = Number(link.source);
				const target = Number(link.target);
				adjacency.get(source)?.push(target);
				incoming.set(target, (incoming.get(target) ?? 0) + 1);
			});

			const queue = nodes
				.map((node) => node.nodeIndex)
				.filter((index) => (incoming.get(index) ?? 0) === 0);

			while (queue.length > 0) {
				const current = queue.shift();
				if (current === undefined) continue;

				for (const next of adjacency.get(current) ?? []) {
					const nextDepth = (depths.get(current) ?? 0) + 1;
					if (nextDepth > (depths.get(next) ?? 0)) {
						depths.set(next, nextDepth);
					}

					const remainingIncoming = (incoming.get(next) ?? 0) - 1;
					incoming.set(next, remainingIncoming);
					if (remainingIncoming === 0) {
						queue.push(next);
					}
				}
			}

			return depths;
		}

		function ticked() {
			const margin = nodeRadius;

			node
				.attr('cx', (d) => {
					d.x = Math.max(-width / 2 + margin, Math.min(width / 2 - margin, d.x ?? 0));
					return d.x;
				})
				.attr('cy', (d) => {
					d.y = Math.max(-height / 2 + margin, Math.min(height / 2 - margin, d.y ?? 0));
					return d.y;
				});

			link
				.attr('x1', (d) => {
					const { x1 } = getLinkEndpoints(d);
					return x1;
				})
				.attr('y1', (d) => {
					const { y1 } = getLinkEndpoints(d);
					return y1;
				})
				.attr('x2', (d) => {
					const { x2 } = getLinkEndpoints(d);
					return x2;
				})
				.attr('y2', (d) => {
					const { y2 } = getLinkEndpoints(d);
					return y2;
				});

			nodeText.attr('x', (d) => d.x ?? 0).attr('y', (d) => d.y ?? 0);
		}

		function getLinkEndpoints(d: GraphLink) {
			const source = typeof d.source === 'object' ? d.source : null;
			const target = typeof d.target === 'object' ? d.target : null;
			const sourceX = source?.x ?? 0;
			const sourceY = source?.y ?? 0;
			const targetX = target?.x ?? 0;
			const targetY = target?.y ?? 0;
			const dx = targetX - sourceX;
			const dy = targetY - sourceY;
			const distance = Math.hypot(dx, dy) || 1;
			const offsetX = (dx / distance) * nodeRadius;
			const offsetY = (dy / distance) * nodeRadius;

			return {
				x1: sourceX + offsetX,
				y1: sourceY + offsetY,
				x2: targetX - offsetX,
				y2: targetY - offsetY
			};
		}

		function drag(simulation: d3.Simulation<GraphNode, GraphLink>) {
			function dragstarted(event: d3.D3DragEvent<SVGCircleElement, GraphNode, GraphNode>) {
				if (!event.active) simulation.alphaTarget(0.3).restart();
				event.subject.fx = event.subject.x;
				event.subject.fy = event.subject.y;
			}

			function dragged(event: d3.D3DragEvent<SVGCircleElement, GraphNode, GraphNode>) {
				event.subject.fx = event.x;
				event.subject.fy = event.y;
			}

			function dragended(event: d3.D3DragEvent<SVGCircleElement, GraphNode, GraphNode>) {
				if (!event.active) simulation.alphaTarget(0);
				event.subject.fx = null;
				event.subject.fy = null;
			}

			return d3
				.drag<SVGCircleElement, GraphNode>()
				.on('start', dragstarted)
				.on('drag', dragged)
				.on('end', dragended);
		}

		return svg.node() as SVGSVGElement;
	}
</script>

<div
	bind:this={element}
	style="width: 100%; height: 600px; border: 1px solid #ccc; background: white; overflow: auto;"
></div>

<style>
	div {
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
