import { defineConfig } from 'skills-config'

export default defineConfig({
    skills: [
        {
            repo: 'gh:lonewolfyx/skills#master',
            skills: ['code-convergence-and-abstraction-boundary'],
        },
    ],
    agents: 'codex',
})
