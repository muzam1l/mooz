import React from 'react'
import ReactDOM from 'react-dom'
import { initializeIcons } from '@fluentui/react'
import { RecoilRoot } from 'recoil'
import App from './app'
import reportWebVitals from './reportWebVitals'

initializeIcons()

ReactDOM.render(
    <React.StrictMode>
        <RecoilRoot>
            <App />
        </RecoilRoot>
    </React.StrictMode>,
    document.getElementById('root'),
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// eslint-disable-next-line
reportWebVitals(console.log)
