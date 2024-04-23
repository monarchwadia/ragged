<script lang="ts">
	import type { EventHistory } from './Console.types';

	export let history: EventHistory[] = [];
	export let incomingStream: string | undefined;
	const bannedEvents = ['chunk', 'collected'];

	const mappedHistory = (history: EventHistory[]) => {
		const step1 = history
			.filter((event) => {
				if (event.type === 'ragged') {
					debugger;
					if (bannedEvents.includes(event.data.type)) {
						return false;
					}
				}

				return true;
			})
			.toReversed();

		const items: string[] = [];
		let numToolUses = 0;
		for (let i = 0; i < step1.length; i++) {
			const event = step1[i];
			if (event.type === 'chat') {
				let senderString: string = '';
				if (event.data.sender === 'ai') {
					senderString = '🦉 AI: ';
				} else {
					// display 'user' with a person emoji
					senderString = '🧑 User: ';
				}

				items.push(senderString + ': ' + event.data.message);
			}

			if (event.type === 'wiki-search') {
				items.push(`📖 Wikipedia search results: [${event.data.titles.join(', ')}]`);
			}

			if (event.type === 'ragged') {
				if (event.data.type === 'tool_use_start') {
					numToolUses++;
				} else {
					if (numToolUses > 0) {
						items.push(`⚒️ Tool use x${numToolUses}`);
						numToolUses = 0;
					}
				}
			}
		}

		return items;
	};
</script>

<div
	class="text-green-600 bg-green-950 min-h-full font-mono flex flex-col gap-2 p-2 border border-green-900"
>
	{#if mappedHistory(history).length === 0 && !incomingStream}
		{'>'}
	{:else}
		{#if incomingStream}
			<p>{'> 🦉 AI: '} {incomingStream}</p>
		{/if}
		{#each mappedHistory(history) as event}
			<p>{'>'} {event}</p>
		{/each}
	{/if}
</div>
