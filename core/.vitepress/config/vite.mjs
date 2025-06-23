import { resolve } from 'path'

// Vite 配置
export const viteConfig = {
    resolve: {
        alias: {
            '@': resolve(process.cwd(), 'core')
        }
    },
    build: {
        chunkSizeWarningLimit: 1000
    }
}
