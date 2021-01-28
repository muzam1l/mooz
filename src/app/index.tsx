import { useEffect, useState } from 'react'
import type { FunctionComponent } from 'react'
import { useRecoilValue } from 'recoil'
import CommanBar from './command-bar'
import SidePanel from './side-panel'
import VideoBoxes from './video-boxes'
import Connections from './connections'
import Fullscreen from '../comps/full-screen'
import { roomState } from '../atoms'

const App: FunctionComponent = () => {
    const room = useRecoilValue(roomState)
    const [panel, setPanel] = useState<'people' | 'chat' | ''>('')
    const [fullscreen, setFullscreen] = useState(false)

    const onClickChat = () => (panel !== 'chat' ? setPanel('chat') : setPanel(''))
    const onClickPeople = () => (panel !== 'people' ? setPanel('people') : setPanel(''))
    const onClickFullscreen = () => setFullscreen(!fullscreen)

    useEffect(() => {
        document.title =
            room?.name || (room?.created_by && `Meeting by ${room?.created_by}`) || 'A Mooz meeting'
        return () => {
            document.title = 'Mooz'
        }
    }, [room])

    return (
        <Fullscreen on={fullscreen} dblclick fullbody>
            <CommanBar
                onClickFullscreen={onClickFullscreen}
                onClickChat={onClickChat}
                onClickPeople={onClickPeople}
            />
            <VideoBoxes />

            <SidePanel setPanel={setPanel} panel={panel} onDismiss={() => setPanel('')} />

            <Connections />
        </Fullscreen>
    )
}

export default App
