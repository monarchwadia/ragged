<script lang="ts">
	export let label: string;
	export let color: string;
	export let value: number;
</script>

<div class="flex flex-col text-center w-fit">
	<div
		class="radial-progress text-xs"
		style={`--value:${value}; --size:3.2em; color:${color}`}
		role="progressbar"
	>
		{Math.floor(value)}%
	</div>
	<div class={`text-xs`} style={`color:${color}`}>{label}</div>
</div>
