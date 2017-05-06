// @flow

import component from './components/map'
import { connect } from 'react-redux';

import type {Nodes} from '../models'
import {Node} from '../models'
import { setPolygon, setEnters, setExits, setCenter } from './actions'

const mapStateToProps = (state) => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {
    setPolygon: (coordinates: Nodes) => dispatch(setPolygon(coordinates)),
    setEnters: (enters: Array<Nodes>) => dispatch(setEnters(enters)),
    setExits: (exits: Array<Nodes>) => dispatch(setExits(exits)), 
    setCenter: (center: Node) => dispatch(setCenter(center)),  
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(component)