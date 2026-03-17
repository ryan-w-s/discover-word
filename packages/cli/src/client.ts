import { treaty } from "@elysiajs/eden"

import type { App } from "../../../api/app"

export const DEFAULT_API_URL = "http://localhost:3000"
export const DEFAULT_DISCOVERY_SOURCE = "cli"

export type ServiceMeta = Readonly<{
  service: string
  status: string
  routes: string[]
}>

export type RecentWord = Readonly<{
  id: string
  term: string
  source: string
  discoveredAt: string
}>

export type RecentWordsResponse = Readonly<{
  items: RecentWord[]
  count: number
}>

export type CheckWordResponse = Readonly<{
  exists: boolean
  term: string
  normalizedTerm: string
}>

export type AddWordResponse = Readonly<{
  created: boolean
  exists: boolean
  term?: string
  normalizedTerm?: string
  item?: RecentWord
}>

export class ApiClientError extends Error {
  status?: number
  payload?: unknown

  constructor(
    message: string,
    options?: Readonly<{ status?: number; payload?: unknown }>
  ) {
    super(message)
    this.name = "ApiClientError"
    this.status = options?.status
    this.payload = options?.payload
  }
}

export type ApiClient = Readonly<{
  getStatus: () => Promise<ServiceMeta>
  getRecentWords: () => Promise<RecentWordsResponse>
  checkWord: (term: string) => Promise<CheckWordResponse>
  addWord: (term: string, source?: string) => Promise<AddWordResponse>
}>

type TreatyResponse<T> = Readonly<{
  data: T | null
  error: null | Readonly<{ status: number; value: unknown }>
  status: number
}>

function resolveApiUrl(apiUrl?: string) {
  const candidate =
    apiUrl?.trim() || process.env.DISCOVER_WORD_API_URL || DEFAULT_API_URL

  try {
    return new URL(candidate).toString().replace(/\/$/, "")
  } catch {
    throw new ApiClientError(
      `Invalid API URL \"${candidate}\". Set --api-url or DISCOVER_WORD_API_URL to a valid absolute URL.`
    )
  }
}

function createTreaty(apiUrl?: string) {
  return treaty<App>(resolveApiUrl(apiUrl))
}

function unwrapResponse<T>(
  response: TreatyResponse<T>,
  fallbackMessage: string
) {
  if (response.data) {
    return response.data
  }

  if (response.error) {
    throw new ApiClientError(fallbackMessage, {
      status: response.error.status,
      payload: response.error.value,
    })
  }

  throw new ApiClientError(fallbackMessage, {
    status: response.status,
  })
}

export function createApiClient(apiUrl?: string): ApiClient {
  const api = createTreaty(apiUrl).api

  return {
    async getStatus() {
      const response = (await api.get()) as TreatyResponse<ServiceMeta>

      return unwrapResponse(
        response,
        "Unable to reach the API status endpoint."
      )
    },
    async getRecentWords() {
      const response =
        (await api.words.recent.get()) as TreatyResponse<RecentWordsResponse>

      return unwrapResponse(response, "Unable to load recent discoveries.")
    },
    async checkWord(term) {
      const response = (await api.words.check.get({
        query: { term },
      })) as TreatyResponse<CheckWordResponse>

      return unwrapResponse(response, `Unable to check \"${term}\".`)
    },
    async addWord(term, source = DEFAULT_DISCOVERY_SOURCE) {
      const response = (await api.words.post(
        { term },
        {
          headers: {
            "x-discovery-source": source,
          },
        }
      )) as TreatyResponse<AddWordResponse>

      if (response.data) {
        return response.data
      }

      if (response.error?.status === 409) {
        return response.error.value as AddWordResponse
      }

      throw new ApiClientError(`Unable to add \"${term}\".`, {
        status: response.error?.status ?? response.status,
        payload: response.error?.value,
      })
    },
  }
}
