<script lang="ts">
	import { AppBus } from '$lib/bus/AppBus';
	import type { SearchResult } from '$lib/types';
	import { onMount } from 'svelte';

	let searchTerm = '';
	let results: SearchResult[] = [];

	onMount(() => {
		AppBus.subscribe((message) => {
			if (message.type === 'search.response') {
				results = message.payload.results;
			}
		});
	});

	const doSearch = () => {
		AppBus.next({
			type: 'search.request',
			payload: {
				searchTerm
			}
		});
	};
</script>

<div class="h-full w-full p-4">
	<div class="sticky top-0 flex flex-col gap-4 bg-base-100 p-4 border-2 border-accent my-4">
		<h1 class="text-xl font-bold">Smart Reader</h1>
		<form class="form w-3xl" on:submit={(e) => doSearch()}>
			<label for="search-input" class="label font-bold">Search Wikipedia</label>
			<input
				type="text"
				id="search-input"
				name="search-input"
				class="input input-bordered"
				placeholder="Search Wikipedia"
				bind:value={searchTerm}
			/>
			<input type="submit" class="btn" value="Search" />
		</form>
	</div>
	<div class="flex flex-row gap-4 border-2 border-red-50 m-auto">
		<div class="flex flex-col gap-4 w-7/12">x</div>
		<div class="flex flex-col gap-4 w-5/12">
			{#if results.length === 0}
				<p>No results found</p>
			{:else}
				{#each results as result}
					<div class="border-2 border-gray-200 p-4">
						<h2 class="text-lg font-bold">{result.title}</h2>
						<p>{result.extract}</p>
					</div>
				{/each}
			{/if}
		</div>
	</div>
</div>
