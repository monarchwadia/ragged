import type { SearchResult } from '$lib/types';

const WIKI_ROOT = 'https://en.wikipedia.org';

export const searchWiki = async (searchTerm: string): Promise<SearchResult[]> => {
	const results = await _searchWikipedia(searchTerm);
	await _enrichSearchResults(results);
	return results;
};

// Function to perform a search on Wikipedia via the MediaWiki API
async function _searchWikipedia(searchTerm: string): Promise<SearchResult[]> {
	// Endpoint for the Wikipedia API
	const url = new URL(WIKI_ROOT + '/w/api.php');

	// Parameters for the API request

	// search = https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=Dune&format=json
	const params = {
		action: 'query',
		format: 'json',
		list: 'search',
		srsearch: searchTerm,
		origin: '*'
	};
	const urlParams = new URLSearchParams(params);

	// Append the parameters to the URL
	url.search = urlParams.toString();

	// Make the AJAX request using fetch
	const response = await fetch(url);
	const data = await response.json();

	return data.query.search.map((item: any): SearchResult => {
		return {
			pageid: item.pageid,
			url: `${WIKI_ROOT}/?curid=${item.pageid}`,
			title: item.title
		};
	});
}

async function _enrichSearchResults(searchResults: SearchResult[]) {
	const pageids = searchResults.map((result) => result.pageid).join('|');

	// get previews = https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=&explaintext=&titles=Dune|Dune:%20Part%20Two|Dune%20(franchise)

	const url = new URL(WIKI_ROOT + '/w/api.php');
	const params = {
		action: 'query',
		format: 'json',
		prop: 'extracts',
		exintro: '',
		explaintext: '',
		pageids,
		origin: '*'
	};
	const urlParams = new URLSearchParams(params);

	url.search = urlParams.toString();

	const response = await fetch(url);

	const data = await response.json();

	const pages = data.query.pages;

	Object.entries(pages).forEach(([key, enrichResult]: any) => {
		const searchResult = searchResults.find((result) => result.pageid === parseInt(key, 10));
		if (searchResult) {
			searchResult.extract = enrichResult.extract;
		}
	});
}
