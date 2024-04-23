<script lang="ts">
	import type { SearchResult } from '$lib/types';
	import { onMount } from 'svelte';
	import { Ragged, t } from '../../../../ragged';
	import { searchWiki } from '$lib/api/wiki';

	// STATE

	let r: Ragged;
	let commandInput = '';
	let assistantOutput = '';
	let results: SearchResult[] = [];

	// ACTIONS

	const doSearch = async (text: string) => {
		try {
			results = await searchWiki(text);
		} catch (e) {
			console.error('Error while searching', e);
		}
	};

	// RAGGED ENTRYPOINT

	const processCommand = async (command: string) => {
		console.log('command', command);
		console.log('results', results);

		let input: string =
			'# Command\n\nExecute the user command below, taking the Currently Displayed Results into account.';
		input += `# User Command\n\n${command}\n\n`;
		input += `# Currently Displayed Results\n\n${JSON.stringify(results)}\n\n`;

		const p$ = r.predictStream(input, {
			tools,
			requestOverrides: {
				model: 'gpt-4-turbo'
			}
		});

		// HANDLING RAGGED EVENTS

		p$.subscribe((s) => {
			console.log('event', s);
			if (s.type === 'tool_use_finish') {
				if (s.data.name === 'search-wikipedia') {
					doSearch(s.data.arguments.searchTerm);
				}
			}

			if (s.type === 'collected') {
				assistantOutput = s.data;
			}
		});
	};

	// LLM TOOLS
	const tools = [
		t
			.tool()
			.title('search-wikipedia')
			.description(
				'Search Wikipedia for a term. This will return a list of results. It will also display the results to the user. You must only call this function when you are explicitly asked to run a search.'
			)
			.inputs({
				searchTerm: t.string().description('The term to search for on Wikipedia.').isRequired()
			})
	];

	// SETUP

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
			</div>
			<div class="flex flex-col">
				<h2 class="text-lg font-bold">Assistant Output</h2>
				<p>{assistantOutput}</p>
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
