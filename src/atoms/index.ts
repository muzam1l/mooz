import { useEffect } from 'react'
import { useRecoilSnapshot } from 'recoil'

export * from './local-streams'
export * from './remote-streams'
export * from './socket'

/* eslint-disable */
export function DebugObserver(): null {
    const snapshot = useRecoilSnapshot()
    useEffect(() => {
        console.debug('The following atoms were modified:')
        for (const node of snapshot.getNodes_UNSTABLE({ isModified: true })) {
            console.debug(node.key, snapshot.getLoadable(node))
        }
    }, [snapshot])

    return null
}
