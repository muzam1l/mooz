import type { FunctionComponent } from 'react'
import CommanBar from './comps/command-bar'

import ThemeProvider from './utils/theme-context'

const App: FunctionComponent = () => (
    <ThemeProvider>
        <CommanBar />
        <p>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ducimus dicta nulla rem vero
            voluptas distinctio facere impedit sapiente deleniti eos molestias officia esse error
            tempora mollitia earum, dolorum fugit? Ex?
        </p>
    </ThemeProvider>
)

export default App
