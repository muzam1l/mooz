import { useState } from 'react'
import type { FunctionComponent } from 'react'
import CommanBar from '../comps/command-bar'
import SidePanel from './side-panel'

import ThemeProvider from '../utils/theme-context'

const App: FunctionComponent = () => {
    const [panel, setPanel] = useState<'people' | 'chat' | ''>('')
    const onClickChat = () => (panel !== 'chat' ? setPanel('chat') : setPanel(''))
    const onClickPeople = () => (panel !== 'people' ? setPanel('people') : setPanel(''))
    return (
        <ThemeProvider>
            <CommanBar onClickChat={onClickChat} onClickPeople={onClickPeople} />
            <p>
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ducimus dicta nulla rem
                vero voluptas distinctio facere impedit sapiente deleniti eos molestias officia esse
                error tempora mollitia earum, dolorum fugit? Ex?
            </p>

            <SidePanel setPanel={setPanel} panel={panel} onDismiss={() => setPanel('')} />
        </ThemeProvider>
    )
}

export default App
