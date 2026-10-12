import axios from 'axios'

// The ONE axios instance. Every request in the app goes through it.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

export interface ApiError {
  message: string
  status: number | null // null when the server could not be reached
}

// Turns any failed request into { message, status }, using the server's own { message }
export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError<{ message?: string }>(error) && error.response) {
    return {
      message: error.response.data?.message ?? `Request failed (${error.response.status})`,
      status: error.response.status,
    }
  }
  if (axios.isAxiosError(error)) {
    return { message: 'Could not reach the server. Is it running?', status: null }
  }
  return { message: 'Something went wrong', status: null }
}

export default api
