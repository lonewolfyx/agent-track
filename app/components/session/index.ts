import type { App } from 'vue'
import type { AsyncData } from '#app'
import type { SessionQueryParam } from '#shared/types/session.query'
import { createContext } from 'reka-ui'
import { createApp, defineComponent, h, ref } from 'vue'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import SessionDetail from '~/components/session/SessionDetail.vue'
import { cn } from '~/lib/utils'

export { default as Session } from './Session.vue'
export { default as SessionDetail } from './SessionDetail.vue'
export { default as SessionProvider } from './SessionProvider.vue'
export { default as SessionTimeLine } from './SessionTimeLine.vue'
export { default as SessionTimeLineGroup } from './SessionTimeLineGroup.vue'
export { default as SessionTimeLineHeader } from './SessionTimeLineHeader.vue'
export { default as SessionTimeLineItem } from './SessionTimeLineItem.vue'
export { default as SessionTimeLineList } from './SessionTimeLineList.vue'

export const [useSession, useSessionProvider] = createContext<AsyncData<any, any>>('codex-session')

export function handleSessionDetail(options: SessionQueryParam) {
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
                'data-[vaul-drawer-direction=right]:sm:max-w-auto data-[vaul-drawer-direction=right]:w-11/12',
                'rounded-tl-xl mt-20',
                'overflow-hidden',
                'border border-input border-r-0 border-b-0 shadow-lg',
                'bg-white/50 backdrop-blur-[7px]',
                'focus-visible:outline-0 focus:outline-transparent',
            ),
        },
        {
            default: () => h(SessionDetail, options),
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
                        default: drawerContent,
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
