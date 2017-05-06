// @flow
import type {Nodes} from '../models'
import {Node} from '../models'
import type {OverpassElement} from './models'
import {Building} from './models'
import type {BuildingShape} from './models'

const m = window.google.maps

const url = 'https://overpass-api.de/api/interpreter'

export const toRadians = (degrees: number): number => degrees * Math.PI / 180
export const toDegrees = (radians: number): number => radians * 180 / Math.PI
export const latInKm  = 110.574 //km
export const lonInKm = (lat: number): number => 111.320 * Math.cos(toRadians(lat))

const inLat = (km: number): number => km / latInKm
const inLon = (lat: number, km: number): number => km / lonInKm(lat)

export const urlForGetAllInsideSquare = (center: Node, km: number): string => {
    const lat = inLat(km)
    const lon = inLon(lat, km)
    const polyline = `${center.lat - lat} ${center.lon + lon} ${center.lat + lat} ${center.lon + lon} ${center.lat + lat} ${center.lon - lon} ${center.lat - lat} ${center.lon - lon}`
    const query = `?data=[out:json];way(poly:"${polyline}")["building"];(._;>;);out body;`

    return url + query
}


export const fromOverpassElementsToBuildings = (elements: Array<OverpassElement>): Array<Building> => {
    const nodes = elements.filter(e => e.type === 'node')
    const buildings = elements.filter(e => e.type !== 'node')

    return buildings.map((building) => new Building(
        building.nodes.slice(0, -1).map((id) => {
                const node = nodes.find(t => t.id === id)
                return new Node(node.lat, node.lon)
            })
    ))
}

export const getAngle = (a: Node, b: Node, c: Node): number => {
    const ab = m.geometry.spherical.computeHeading(new m.LatLng(a.lat, a.lon), new m.LatLng(b.lat, b.lon))
    const cb = m.geometry.spherical.computeHeading(new m.LatLng(b.lat, b.lon), new m.LatLng(c.lat, c.lon))
    
    return (ab > cb)? ab - cb: cb - ab
}

export const getAngles = (nodes: Nodes): Array<number> => {
    return nodes.map((node, index) => {
            const a = node
            let b, c
            if (index === nodes.length - 2) {
                b = nodes[index + 1]
                c = nodes[0]
            } else if (index === nodes.length - 1) {
                b = nodes[0]
                c = nodes[1]
            } else {
                b = nodes[index + 1]
                c = nodes[index + 2]
            }
            return getAngle(a, b, c)
        })
}

export const getEdgesLen = (nodes: Nodes): Array<number> => {
        return nodes.map((node, index) => {
            const nextIndex = (index === nodes.length - 1) ? 0: index + 1
            const nextNode = nodes[nextIndex]

            return m.geometry.spherical.computeDistanceBetween(node.googleLatLng(), nextNode.googleLatLng())
        })
    }

export const getShape = (nodes: Nodes): BuildingShape => {
    const nodesLen = nodes.length
    const edgesLen = getEdgesLen(nodes)
    const angles = getAngles(nodes)
    const numberOfRightAngles = angles.filter((a) => ((a > 80 && a < 100) || (a > 260 && a < 280))).length
    const rectangular = numberOfRightAngles === nodes.length || numberOfRightAngles === nodes.length - 1
    if (nodesLen === 4) {
        if (rectangular) {
            const ratio = edgesLen[0] / edgesLen[1]
            return (ratio > 3/4.5 && ratio < 4.5/3)? 'square': 'rectangle'
        }
        return 'simpleshape'
    } else if (nodesLen === 5) {
        return (Math.min(...edgesLen) < 10 && rectangular)? 'rectangle': 'simpleshape'
    } else {
        // check if looks like circle
        const area = m.geometry.spherical.computeArea(nodes.map((v) => new m.LatLng(v.lat, v.lon)))
        const perimetr = edgesLen.reduce((sum, v) => sum + v)
        const t = 4 * Math.PI * (area / (perimetr * perimetr))
        if (t > 0.8 && t < 1.2) {
            return 'circlelike'
        } else if (rectangular) {
            return 'angular'
        } else if (angles.length < 10) {
            return 'simpleshape'
        }
    }
    return 'complex'
}
