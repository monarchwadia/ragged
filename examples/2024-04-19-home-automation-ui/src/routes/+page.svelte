<script lang="ts">
	type SpaceshipSection = {
		id: number;
		name: string;
	};
	const rooms: SpaceshipSection[] = [
		{ id: 1, name: 'Command Bridge' },
		{ id: 2, name: 'Engineering Bay' },
		{ id: 3, name: 'Crew Quarters' }
	];
</script>

<div class="flex flex-col w-fit gap-4 p-8">
	<h1 class="text-3xl font-bold">Spaceship</h1>
	{#each rooms as room}
		<div class="card bg-base-200 card-compact card-bordered shadow-lg">
			<div class="card-body">
				<h5 class="card-title">{room.name}</h5>
			</div>
		</div>
	{/each}
</div>
