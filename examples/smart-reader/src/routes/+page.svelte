<script lang="ts">
	import type { SearchResult } from '$lib/types';
	import { onMount } from 'svelte';
	import { Ragged, t } from '../../../../ragged';
	import { searchWiki } from '$lib/api/wiki';

	let r: Ragged;
	let commandInput = '';
	let searchTerm = '';
	let analysis = '';
	let results: SearchResult[] = [];

	// actions
	const doSearch = async (text: string) => {
		try {
			results = await searchWiki(text);
		} catch (e) {
			console.error('Error while searching', e);
		}
	};

	const processCommand = async (command: string) => {
		console.log('command', command);
		console.log('results', results);
		const input = JSON.stringify({
			command,
			results
		});
		const p$ = r.predictStream(input, {
			tools,
			requestOverrides: {
				model: 'gpt-4'
			}
		});
		p$.subscribe((s) => {
			console.log('event', s);
			if (s.type === 'tool_use_finish') {
				if (s.data.name === 'provide-analysis') {
					analysis = s.data.arguments.results;
				}

				if (s.data.name === 'search-wikipedia') {
					doSearch(s.data.arguments.searchTerm);
				}
			}
		});
	};

	// tools
	const tools = [
		t
			.tool()
			.title('search-wikipedia')
			.description(
				'Search Wikipedia for a term. This will return a list of results. It will also display the results to the user.'
			)
			.inputs({
				searchTerm: t.string().description('The term to search for on Wikipedia.').isRequired()
			}),
		t
			.tool()
			.title('provide-analysis')
			.description(
				'Analyze the current results of a search in a particular way. This will display the results of the analysis to the user. The results to analyze will be provided in plaintext format.'
			)
			.inputs({
				results: t
					.string()
					.description(
						'Your analysis of the results, in plaintext format. If you have no analysis, you can say "No input received.".'
					)
					.isRequired()
			})
	];

	onMount(() => {
		r = new Ragged({
			provider: 'openai',
			config: {
				apiKey: import.meta.env.VITE_OPENAI_CREDS,
				dangerouslyAllowBrowser: true
			}
		});
	});
</script>

<div class="h-full w-full p-4">
	<div class="sticky top-0 flex flex-col gap-4 bg-base-100 p-4 border-2 border-accent my-4">
		<h1 class="text-xl font-bold">Smart Reader</h1>
		<div class="flex flex-row gap-4">
			<div class="flex flex-col gap-4">
				<form class="form w-3xl" on:submit={(e) => processCommand(commandInput)}>
					<label for="command-ai" class="label font-bold">Command AI</label>
					<input
						type="text"
						id="command-ai"
						name="command-ai"
						class="input input-bordered"
						placeholder="Command AI"
						bind:value={commandInput}
					/>
					<input type="submit" class="btn" value="Command" />
				</form>
				<form class="form w-3xl" on:submit={(e) => doSearch(searchTerm)}>
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
			<div class="flex flex-col">
				<h2 class="text-lg font-bold">Analysis</h2>
				<p>{analysis}</p>
			</div>
		</div>
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
