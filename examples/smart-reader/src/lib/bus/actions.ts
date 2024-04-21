import { searchWiki } from '$lib/api/wiki';
import type { AppBus } from './AppBus';

export const registerActions = (appBus: AppBus) => {
	appBus.subscribe(async (event) => {
		switch (event.type) {
			case 'search.request':
				try {
					const searchTerm = event.payload.searchTerm;
					const result = await searchWiki(searchTerm);
					appBus.next({
						type: 'search.response',
						payload: {
							results: result
						}
					});
				} catch (e) {
					console.error('Error while searching', e);
				}
				console.log(`Search request for: ${event.payload.searchTerm}`);
				break;
			case 'search.response':
				console.log(`Search response: ${event.payload.results.length} results`);
				break;
			case 'search.item.open':
				console.log(`Opening item: ${event.payload.item.title}`);
				break;
		}
	});
};
