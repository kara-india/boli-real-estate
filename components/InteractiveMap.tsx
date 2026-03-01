'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { GoogleMap, Polygon, useJsApiLoader } from '@react-google-maps/api'

const MAP_OPTIONS = {
    disableDefaultUI: true,
    styles: [
        { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
        { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
        { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
        { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
        { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
        { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e5e5e5' }] },
        { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
        { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
        { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#dadada' }] },
        { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
        { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
        { featureType: 'transit.line', elementType: 'geometry', stylers: [{ color: '#e5e5e5' }] },
        { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9c9c9' }] },
        { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] }
    ]
}

export default function InteractiveMap() {
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY || 'AIzaSyPlaceholderKeyForLocalTesting'
    })

    const mapRef = useRef<google.maps.Map | null>(null)
    const [areasGeoJSON, setAreasGeoJSON] = useState<any>(null)
    const [activeArea, setActiveArea] = useState<string | null>(null)
    const [projects, setProjects] = useState<any[]>([])

    useEffect(() => {
        async function fetchAreas() {
            try {
                const res = await fetch('http://localhost:3001/api/map/areas?center=mira-road')
                const data = await res.json()
                setAreasGeoJSON(data)
            } catch (err) {
                console.error('Error fetching areas:', err)
            }
        }
        fetchAreas()
    }, [])

    const onPolygonClick = async (areaId: string, bounds: google.maps.LatLngBounds) => {
        setActiveArea(areaId)
        if (mapRef.current) {
            mapRef.current.panToBounds(bounds)
        }

        // Phase 2 requires we trigger the fetch call for projects but not render markers yet
        try {
            const res = await fetch(`http://localhost:3001/api/map/areas/${areaId}/projects`)
            const data = await res.json()
            console.log(`Phase 2: Projects for area ${areaId} loaded`, data)
            setProjects(data.projects)
        } catch (err) {
            console.error('Error fetching projects:', err)
        }
    }

    if (!isLoaded) {
        return (
            <div className="h-[60vh] w-full animate-pulse bg-gray-200 rounded-xl mb-12 flex items-center justify-center">
                <span className="text-gray-400 font-bold uppercase tracking-widest text-sm">Loading Map...</span>
            </div>
        )
    }

    return (
        <div className="relative h-[60vh] w-full rounded-xl overflow-hidden shadow-2xl border border-gold/20 mb-12 ring-2 ring-gold/10">
            {/* Map Overlay Card for future phase */}
            <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg border-l-4 border-gold">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-1">Mira Road Market</h3>
                <p className="text-xs text-gray-500 font-medium">Select an area to explore BidMetric predictions.</p>
            </div>

            <GoogleMap
                mapContainerClassName="w-full h-full"
                center={{ lat: 19.278, lng: 72.868 }}
                zoom={13}
                options={MAP_OPTIONS}
                onLoad={map => { mapRef.current = map }}
            >
                {areasGeoJSON && areasGeoJSON.features && areasGeoJSON.features.map((feature: any) => {
                    const paths = feature.geometry.coordinates[0].map((coord: number[]) => ({
                        lat: coord[1],
                        lng: coord[0]
                    }))

                    return (
                        <Polygon
                            key={feature.properties.area_id}
                            paths={paths}
                            options={{
                                fillColor: feature.properties.color_hex,
                                fillOpacity: 0.6,
                                strokeColor: '#D4AF37', // Gold matching the UI
                                strokeWeight: 2,
                                clickable: true
                            }}
                            onClick={() => {
                                if (!window.google) return
                                const bounds = new window.google.maps.LatLngBounds()
                                paths.forEach((p: any) => bounds.extend(p))
                                onPolygonClick(feature.properties.area_id, bounds)
                            }}
                        />
                    )
                })}
            </GoogleMap>
        </div>
    )
}
