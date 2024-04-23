import type { RaggedLlmStreamEvent } from '../../../../../ragged/build/src/driver/types';

export type ChatData = {
	sender: 'ai' | 'user';
	message: string;
};

export type ToolUseData = {
	toolName: string;
	inputs: string;
	outputs: string;
};

// if it is a chat response from the AI, display as text
// if it is a tool use, display as tool use that is expandable.
// if there are multiple tool uses, display as a list of tool uses.
export type EventHistory =
	| { type: 'chat'; data: ChatData }
	| { type: 'ragged'; data: RaggedLlmStreamEvent }
	| { type: 'wiki-search'; data: { titles: string[] } };
