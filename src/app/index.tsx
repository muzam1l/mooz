import { useEffect, useState } from 'react'
import type { FunctionComponent } from 'react'
import { useRecoilValue } from 'recoil'
import CommanBar from './command-bar'
import SidePanel from './side-panel'
import VideoBoxes from './video-boxes'
import Connections from './connections'
import { roomState } from '../atoms'

const App: FunctionComponent = () => {
    const room = useRecoilValue(roomState)
    const [panel, setPanel] = useState<'people' | 'chat' | ''>('')
    const onClickChat = () => (panel !== 'chat' ? setPanel('chat') : setPanel(''))
    const onClickPeople = () => (panel !== 'people' ? setPanel('people') : setPanel(''))

    useEffect(() => {
        document.title =
            room?.name || (room?.created_by && `Meeting by ${room?.created_by}`) || 'A Mooz meeting'
        return () => {
            document.title = 'Mooz'
        }
    }, [room])

    return (
        <>
            <CommanBar onClickChat={onClickChat} onClickPeople={onClickPeople} />
            <VideoBoxes />

            <SidePanel setPanel={setPanel} panel={panel} onDismiss={() => setPanel('')} />

            <Connections />
        </>
    )
}

export default App
