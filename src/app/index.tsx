import { useState } from 'react'
import type { FunctionComponent } from 'react'
import CommanBar from './command-bar'
import SidePanel from './side-panel'
import VideoBoxes from './video-boxes'
import Connections from './connections'

const App: FunctionComponent = () => {
    const [panel, setPanel] = useState<'people' | 'chat' | ''>('')
    const onClickChat = () => (panel !== 'chat' ? setPanel('chat') : setPanel(''))
    const onClickPeople = () => (panel !== 'people' ? setPanel('people') : setPanel(''))

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
