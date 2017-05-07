import { connect } from 'react-redux'
import store from '../store'

import component from './component'
import { fetchBuildings, setZoomed } from './actions'
import {Building} from './models'
import { urlForGetAllInsideSquare } from './utils'

const mapStateToProps = (state) => ({
    polygon: state.map.polygon,
    center: state.map.center,
    buildings: state.analyzer.buildings,
})

const mapDispatchToProps = (dispatch: Function) => ({
    fetch: (km = 1) => {
        if (!store.getState().analyzer.loading) {
            const center = store.getState().map.center
            dispatch(fetchBuildings(urlForGetAllInsideSquare(center, km)))
        }
    },
    setZoomed: (zoomed: Building) => dispatch(setZoomed(zoomed)),
    setSelected: (selected: Building) => dispatch(setZoomed(selected)),
})

export default connect(mapStateToProps, mapDispatchToProps)(component)