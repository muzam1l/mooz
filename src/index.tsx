import React, {
    FunctionComponent,
    lazy,
    Suspense,
    useEffect,
    ReactNode,
    useRef,
    ReactText,
} from 'react'
import ReactDOM from 'react-dom'
import { initializeIcons, mergeStyles, Spinner } from '@fluentui/react'
import { RecoilRoot, useRecoilState, useRecoilValue } from 'recoil'
import { ToastContainer, Slide } from 'react-toastify'
import { nanoid } from 'nanoid'
import toast, { toastClasses, dismissToast, Timeout } from './comps/toast'
import Landing from './landing'
import reportWebVitals from './reportWebVitals'
import { DebugObserver, roomState, socketState, Room } from './atoms'
import ThemeProvider from './utils/theme/theme-context'
import 'react-toastify/dist/ReactToastify.css'

// enforce https
if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
    window.location.href = `https://${window.location.href.slice(7)}`
}

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
    const connectToast = useRef<ReactText>()
    useEffect(() => {
        socket.on('joined_room', (r: Room) => {
            const name = r.name || `by ${r.created_by}` || `with id ${r.id}`
            setRoom(r)
            toast(`Joined room ${name}`)
        })
        socket.on('disconnect', () => {
            connectToast.current = toast('Reconnecting socket, chill!', { autoClose: Timeout.PERSIST })
        })
        socket.on('connect', () => {
            const id = sessionStorage.getItem('ID') || nanoid()
            socket.emit('register', { sessionId: id, roomId: room?.id })
            sessionStorage.setItem('ID', id)

            toast('Socket connected!', { autoClose: Timeout.SHORT })
        if (connectToast.current) dismissToast(connectToast.current)
            connectToast.current = undefined
        })
    }, []) // eslint-disable-line
    let content: ReactNode
    if (!room) content = <Landing />
    else content = <App />

    return (
        <>
            <ToastContainer
                bodyClassName={toastClasses.body}
                toastClassName={toastClasses.container}
                transition={Slide}
                position="bottom-left"
                autoClose={Timeout.MEDIUM}
                closeOnClick={false}
                closeButton={false}
                rtl={false}
                hideProgressBar
                newestOnTop
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            {content}
        </>
    )
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
