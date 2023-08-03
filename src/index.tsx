import React, { FC, lazy, Suspense, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { initializeIcons, mergeStyles, Spinner } from '@fluentui/react'
import { ToastContainer, Slide, Id } from 'react-toastify'
import process from 'process'
import toast, { toastClasses, dismissToast, Timeout } from './comps/toast'
import Landing from './landing'
import reportWebVitals from './reportWebVitals'
import {
  IRoom,
  abortRoom,
  enterRoom,
  setupLocalMediaListeners,
  useLocalState,
  useRemoteState,
} from './state'
import ThemeProvider from './utils/theme/theme-context'

import 'react-toastify/dist/ReactToastify.css'
import { DOUBLE_CLICK_MS } from './state/constants'
import { debug } from './utils/helpers'

window.process = process

// enforce https in production
if (
  process.env.NODE_ENV === 'production' &&
  window.location.hostname !== 'localhost' &&
  window.location.protocol === 'http:'
) {
  window.location.href = `https://${window.location.href.slice(7)}`
}

const AppImport = import('./app') // preloading
const App = lazy(() => AppImport)
initializeIcons()

const spinner = mergeStyles({
  height: '100vh',
  overflow: 'hidden',
})

setupLocalMediaListeners()

const Eagle: FC = () => {
  const [socket, currRoom] = useRemoteState(state => [state.socket, state.room])
  const [sessionId] = useLocalState(state => [state.sessionId])

  const connectToast = useRef<Id>()

  useEffect(() => {
    if (connectToast.current) return
    connectToast.current = toast('Connecting to the signalling server...', {
      autoClose: Timeout.PERSIST,
    })
  }, [])

  useEffect(() => {
    if (currRoom) {
      document.title = currRoom.name
    } else {
      document.title = 'Mooz'
    }
  }, [currRoom])

  const lastClickRef = useRef<CustomEvent<MouseEvent>>()
  useEffect(() => {
    const onLeavePage = () => {
      if (!currRoom) return
      socket.emit('request:leave_room', {
        roomId: currRoom.id,
      })
    }
    const onRoomJoined = ({ room }: { room: IRoom }) => {
      enterRoom(room)
    }
    const onRoomLeft = () => {
      abortRoom()
    }
    const onDisconnect = () => {
      if (connectToast.current) {
        dismissToast(connectToast.current)
      }
      connectToast.current = toast('Reconnecting to the signalling server...', {
        autoClose: Timeout.PERSIST,
      })
    }
    const onConnect = () => {
      if (connectToast.current) dismissToast(connectToast.current)
      connectToast.current = undefined

      toast('Connected to the signalling server.', { autoClose: Timeout.SHORT })
    }

    const clickHandler = (e: MouseEvent) => {
      if (e.button != 0) return

      const delay = e.timeStamp - (lastClickRef.current?.timeStamp || 0)

      const samePos =
        e.clientX === lastClickRef.current?.detail.clientX &&
        e.clientY === lastClickRef.current?.detail.clientY
      let ev: CustomEvent<MouseEvent>
      if (samePos && delay < DOUBLE_CLICK_MS) {
        ev = new CustomEvent('doubleclick', {
          detail: e,
        })
      } else {
        ev = new CustomEvent('singleclick', {
          detail: e,
        })
      }
      lastClickRef.current = ev
      document.body.dispatchEvent(ev)
    }

    document.body.addEventListener('click', clickHandler)
    window.addEventListener('beforeunload', onLeavePage)

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('action:room_connection_established', onRoomJoined)
    socket.on('action:room_connection_terminated', onRoomLeft)
    return () => {
      document.body.removeEventListener('click', clickHandler)
      window.removeEventListener('beforeunload', onLeavePage)
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('action:room_connection_established', onRoomJoined)
      socket.off('action:room_connection_terminated', onRoomLeft)
    }
  }, [currRoom, sessionId, socket])
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
      {currRoom ? <App /> : <Landing />}
    </>
  )
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <Suspense
        fallback={<Spinner label="Loading..." className={spinner} size={3} />}
      >
        <Eagle />
      </Suspense>
    </ThemeProvider>
  </React.StrictMode>,
)

if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line no-console
  reportWebVitals(debug)
}
