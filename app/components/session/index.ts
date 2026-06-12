import type { AsyncData } from '#app'
import { createContext } from 'reka-ui'

export const [useSession, useSessionProvider] = createContext<AsyncData<any, any>>('codex-session')
