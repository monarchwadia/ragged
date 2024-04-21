import type { SearchResult } from '$lib/types';
import { Subject } from 'rxjs';
import { registerActions } from './actions';

export type AppBusEvent =
	| {
			type: 'search.request';
			payload: {
				searchTerm: string;
			};
	  }
	| {
			type: 'search.response';
			payload: {
				results: SearchResult[];
			};
	  }
	| {
			type: 'search.item.open';
			payload: {
				item: SearchResult;
			};
	  };

export const AppBus = new Subject<AppBusEvent>();
export type AppBus = typeof AppBus;

registerActions(AppBus);
