import React, { FunctionComponent, lazy, Suspense, useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { initializeIcons, mergeStyles, Spinner } from '@fluentui/react'
import { RecoilRoot, useRecoilState, useRecoilValue } from 'recoil'
import Landing from './landing'
import reportWebVitals from './reportWebVitals'
import { DebugObserver, roomState, socketState, Room } from './atoms'
import ThemeProvider from './utils/theme/theme-context'

const AppImport = import('./app') // preloading
const App = lazy(() => AppImport)
initializeIcons()

const spinner = mergeStyles({
    height: '100vh',
    overflow: 'hidden',
})

const Eagle: FunctionComponent = () => {
    const socket = useRecoilValue(socketState)
    const [room, setRoom] = useRecoilState(roomState)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        socket.on('room_joined', (r: Room) => {
            setRoom(r)
        })
        socket.on('disconnect', () => {
            setLoading(true)
        })
        socket.on('connect', () => {
            setLoading(false)
        })
    }, []) // eslint-disable-line

    if (loading) return <Spinner className={spinner} size={3} />
    if (!room) return <Landing />
    return <App />
}

ReactDOM.render(
    <React.StrictMode>
        <RecoilRoot>
            <ThemeProvider>
                <DebugObserver />
                <Suspense fallback={<Spinner label="Joining" className={spinner} size={3} />}>
                    <Eagle />
                </Suspense>
            </ThemeProvider>
        </RecoilRoot>
    </React.StrictMode>,
    document.getElementById('root'),
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// eslint-disable-next-line
reportWebVitals(console.log)
