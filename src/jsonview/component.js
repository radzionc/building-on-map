import React from 'react'

import './styles.css'

const prettyJson = (obj) => JSON.stringify(obj, null, 2)

export default (props) => (
    <div className={'jsonview'}>
        <h2>JSON output</h2>
        <div><pre>{prettyJson(props.value)}</pre></div>
    </div>
)