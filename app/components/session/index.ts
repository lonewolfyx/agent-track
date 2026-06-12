import type { App } from 'vue'
import type { AsyncData } from '#app'
import { createContext } from 'reka-ui'
import { createApp, defineComponent, h, ref } from 'vue'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import SessionDetail from '~/components/session/SessionDetail.vue'
import { cn } from '~/lib/utils'

export const [useSession, useSessionProvider] = createContext<AsyncData<any, any>>('codex-session')

export function handleSessionDetail() {
    return h('div', {})
}

export interface HandleDrawerShowerOptions {
    title: string
    id: string
}

export function handleDrawerShower(options: HandleDrawerShowerOptions) {
    if (typeof document === 'undefined') {
        return
    }

    const container = document.createElement('div')
    document.body.appendChild(container)

    let app: App<Element>

    function destroy() {
        setTimeout(() => {
            app.unmount()
            container.remove()
        }, 300)
    }

    const drawerContent = () => h(
        DrawerContent,
        {
            class: cn(
                'data-[vaul-drawer-direction=right]:sm:max-w-auto data-[vaul-drawer-direction=right]:w-10/12',
                'rounded-tl-xl mt-20',
                'overflow-hidden',
                'border border-input border-r-0 border-b-0 shadow-lg',
                'bg-white/50 backdrop-blur-[7px]',
            ),
        },
        {
            default: () =>
                h('div', {
                    'class': 'min-h-0 flex-1 overflow-y-auto overflow-x-hidden touch-pan-y select-text',
                    'data-vaul-no-drag': '',
                }, [
                    h(SessionDetail, options),
                ]),
        },
    )

    const DrawerApp = defineComponent({
        name: 'ProgrammaticDrawer',

        setup() {
            const open = ref(true)

            function handleOpenChange(value: boolean) {
                open.value = value

                if (!value) {
                    destroy()
                }
            }

            return () =>
                h(
                    Drawer,
                    {
                        'direction': 'right',
                        'open': open.value,
                        'onUpdate:open': handleOpenChange,
                    },
                    {
                        default: drawerContent(),
                    },
                )
        },
    })

    app = createApp(DrawerApp)
    app.mount(container)

    return {
        close() {
            app.unmount()
            container.remove()
        },
    }
}
