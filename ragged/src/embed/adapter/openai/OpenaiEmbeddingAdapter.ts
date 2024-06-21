import { ApiClient } from "../../../support/ApiClient";
import { Logger } from "../../../support/logger/Logger";
import { BaseEmbeddingAdapter, EmbeddingRequest, EmbeddingResponse } from "../../Embed.types";
import { OpenaiEmbeddingResponse } from "./OpenaiEmbeddingTypes";

type OpenaiEmbeddingAdapterConstructorParams = {
    apiKey: string;
    apiClient: ApiClient;
}

/**
 * Adapter to get embeddings from OpenAI.
 */
export class OpenaiEmbeddingAdapter implements BaseEmbeddingAdapter {
    private static logger: Logger = new Logger('OpenaiEmbeddingAdapter');
    constructor(private params: OpenaiEmbeddingAdapterConstructorParams) { }
    async embed(request: EmbeddingRequest): Promise<EmbeddingResponse> {
        const response: OpenaiEmbeddingResponse = await this.params.apiClient.post('https://api.openai.com/v1/embeddings', {
            body: {
                input: request.text,
                model: request.model || "text-embedding-3-small"
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.params.apiKey}`
            }
        });

        if (response.data.length > 1) {
            OpenaiEmbeddingAdapter.logger.warn('Recived more than one embedding from OpenAI. This is not currently supported. Returning only the first one.');
        }

        const responseObj: EmbeddingResponse = {
            model: response.model,
            provider: 'openai',
            embedding: response.data[0].embedding
        }


        return responseObj;
    }
}

/*
const fetch = require('node-fetch');  // This line is only needed if you're using Node.js

const apiKey = 'YOUR_OPENAI_API_KEY';
const url = 'https://api.openai.com/v1/embeddings';

const data = {
  input: 'Your text string goes here',
  model: 'text-embedding-3-small'
};

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  },
  body: JSON.stringify(data)
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));

  */