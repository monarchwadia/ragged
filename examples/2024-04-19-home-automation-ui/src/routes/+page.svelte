<script lang="ts">
	import RadialIndicator from '$lib/components/RadialIndicator.svelte';
	import type { SpaceShip, LoggedInUser } from '../types';

	// state

	let loggedInUser: LoggedInUser = 'Crew';

	let spaceship: SpaceShip = {
		name: 'USS Enterprise',
		shieldStrength: 100,
		sections: [
			{ id: 1, name: 'Command Bridge', hullStrength: 100 },
			{ id: 2, name: 'Engineering Bay', hullStrength: 50 },
			{ id: 3, name: 'Crew Quarters', hullStrength: 25 }
		]
	};

	// utils

	const getHullStrengthRgb = (hullStrength: number) => {
		if (hullStrength > 75) {
			return 'rgb(0, 255, 0)';
		} else if (hullStrength > 50) {
			return 'rgb(255, 255, 0)';
		} else if (hullStrength > 25) {
			return 'rgb(255, 165, 0)';
		} else if (hullStrength === 0) {
			return 'rgb(100,100,100)';
		} else {
			return 'rgb(255, 0, 0)';
		}
	};

	const getAvgHullStrength = (spaceship: SpaceShip) => {
		return (
			spaceship.sections.reduce((acc, section) => acc + section.hullStrength, 0) /
			spaceship.sections.length
		);
	};
</script>

<div class="flex flex-row gap-8 p-8">
	<div class="flex flex-col w-fit gap-4">
		<h1 class="text-3xl font-bold">{spaceship.name}</h1>
		<div class="flex flex-row gap-2">
			<RadialIndicator
				label="Shields"
				color={getHullStrengthRgb(spaceship.shieldStrength)}
				value={spaceship.shieldStrength}
			/>
			<RadialIndicator
				label="Avg Hull"
				color={getHullStrengthRgb(getAvgHullStrength(spaceship))}
				value={getAvgHullStrength(spaceship)}
			/>
		</div>
		{#each spaceship.sections as section}
			<div class="card bg-base-200 card-compact card-bordered shadow-lg">
				<div class="card-body">
					<h2 class="card-title">{section.name}</h2>
					<div class="flex flex-col text-center w-fit">
						<RadialIndicator
							label="Hull"
							color={getHullStrengthRgb(section.hullStrength)}
							value={section.hullStrength}
						/>
					</div>
				</div>
			</div>
		{/each}
	</div>
	<div class="flex flex-col gap-2">
		<h1 class="text-3xl font-bold">Controls</h1>
		<label class="label" for="user-select">User Select</label>
		<select
			class="select select-bordered"
			name="user-select"
			id="user-select"
			bind:value={loggedInUser}
		>
			<option value="Crew">Crew</option>
			<option value="Captain">Captain</option>
		</select>
	</div>
</div>
