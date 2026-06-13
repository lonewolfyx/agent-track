<template>
    <SessionTimeLine>
        <SessionTimeLineGroup
            v-for="session in sessions as CodexSessionMonthGroup[]"
            :key="session.label"
        >
            <SessionTimeLineHeader
                :date="session.label"
                :sessions="session.children.length"
            />
            <SessionTimeLineList>
                <SessionTimeLineItem
                    v-for="item in session.children"
                    :key="item.id"
                    :session="item"
                />
            </SessionTimeLineList>
        </SessionTimeLineGroup>
    </SessionTimeLine>
</template>

<script lang="ts" setup>
import { useSession } from '.'

defineOptions({
    name: 'Session',
})

const { data: sessions } = useSession()
</script>
