import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { createResolver } from 'nuxt/kit'

const rootPath = dirname(fileURLToPath(import.meta.url))
const homeCodexPath = join(homedir(), '.codex', 'sessions')

const { resolve } = createResolver(import.meta.url)

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    runtimeConfig: {
        // codexSessionsPath: rootPath,
        codexSessionsPath: homeCodexPath,
    },

    modules: [
        // '@nuxt/content',
        '@nuxt/eslint',
        '@nuxt/icon',
        '@vueuse/nuxt',
        'shadcn-nuxt',
    ],

    devtools: {
        enabled: true,
    },

    ssr: false,

    icon: {
        mode: 'svg',
        customCollections: [
            {
                prefix: 'active',
                dir: resolve('./app/assets/icon'),
            },
        ],
    },

    app: {
        head: {
            title: 'Agent Track',
            viewport: 'width=device-width,initial-scale=1',
            link: [
                { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
                { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' },
                { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
            ],
            meta: [
                { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
            ],
        },
    },

    css: [
        '~/assets/css/main.css',
    ],
    compatibilityDate: '2026-06-04',

    vite: {
        plugins: [
            tailwindcss(),
        ],
    },

    nitro: {
        experimental: {
            websocket: true,
        },
        output: {
            dir: 'dist',
        },
        preset: 'node',
        serveStatic: 'node',
        sourceMap: false,
    },

    eslint: {
        config: {
            stylistic: {
                indent: 4, // 4, or 'tab'
                quotes: 'single', // or 'double'
            },
        },
    },

    shadcn: {
        prefix: '',
        componentDir: './app/components/ui',
    },
})
