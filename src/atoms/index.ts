import { useEffect } from 'react'
import { useRecoilSnapshot } from 'recoil'

export * from './local'
export * from './connections'
export * from './chat'

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
