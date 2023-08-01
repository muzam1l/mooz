type Maybe<T> = T | null | undefined

export function transformSdp(sdp: string, bandwidth: number) {
    // follow unified plan, fuck older browsers
    const modifier = 'TIAS'
    bandwidth = (bandwidth >>> 0) * 1000

    sdp = sdp.replace(new RegExp('b=' + modifier + ':.*\r\n'), '')
    sdp = sdp.replace(/(m=video.*\r\n)/g, `$1b=${modifier}:${bandwidth}\r\n`)

    return sdp
}

export const capitalize = (str?: Maybe<string>) => {
    if (!str) return ''
    return `${str[0].toLocaleUpperCase()}${str.slice(1)}`
}

export const truncate = (str?: Maybe<string>, max: number = 0, suffix: string = '...') => {
    if (!str) return ''
    return str.length <= max ? str : str.slice(0, max) + suffix
}

export const userLabel = ({ userId, userName }: { userName?: string, userId: string }) => {
    return capitalize(userName) || `<${userId}>`
}

export const debug = (...args: any[]) => {
    if (process.env.NODE_ENV === "development") {
        console.debug(args)
    }
}