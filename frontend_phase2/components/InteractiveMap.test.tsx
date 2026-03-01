/**
 * @vitest-environment jsdom
 */
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import InteractiveMap from './InteractiveMap'

// Mock the google maps components and hook
vi.mock('@react-google-maps/api', () => {
    return {
        useJsApiLoader: () => ({ isLoaded: true }),
        GoogleMap: ({ children, onLoad }: any) => {
            // Simulate onLoad
            const mapMock = { panToBounds: vi.fn() }
            setTimeout(() => { if (onLoad) onLoad(mapMock) }, 0)
            return <div data-testid="google-map">{children}</div>
        },
        Polygon: ({ onClick, options }: any) => (
            <div
                data-testid="polygon"
                data-color={options?.fillColor}
                onClick={() => {
                    if (onClick) onClick()
                }}
            ></div>
        ),
    }
})

describe('InteractiveMap Component', () => {
    afterEach(() => {
        cleanup()
    })

    beforeEach(() => {
        vi.resetAllMocks()

        // Mock global window fetch for both areas and projects endpoints
        global.fetch = vi.fn((url: string | URL | Request) => {
            if (url.toString().includes('areas?center=mira-road')) {
                return Promise.resolve({
                    json: () => Promise.resolve({
                        features: [
                            { properties: { area_id: '1', color_hex: '#112233' }, geometry: { coordinates: [[[1, 2], [3, 4]]] } },
                            { properties: { area_id: '2', color_hex: '#445566' }, geometry: { coordinates: [[[5, 6], [7, 8]]] } },
                        ]
                    })
                })
            }
            if (url.toString().includes('/projects')) {
                return Promise.resolve({
                    json: () => Promise.resolve({
                        projects: [{ id: 'proj1' }]
                    })
                })
            }
            return Promise.reject(new Error('not mocked'))
        }) as any

        // Mock window.google
        window.google = {
            maps: {
                LatLngBounds: class {
                    extend = vi.fn()
                }
            }
        } as any
    })

    it('1. Fetches and renders polygons correctly with their respective colors', async () => {
        render(<InteractiveMap />)

        // Wait for the polygons to render from the first fetch
        await waitFor(() => {
            const polygons = screen.getAllByTestId('polygon')
            expect(polygons).toHaveLength(2)
            expect(polygons[0].getAttribute('data-color')).toBe('#112233')
            expect(polygons[1].getAttribute('data-color')).toBe('#445566')
        })

        expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/api/map/areas?center=mira-road')
    })

    it('2. Clicking a polygon triggers the correct fetch call for projects', async () => {
        render(<InteractiveMap />)

        await waitFor(() => {
            const polygons = screen.getAllByTestId('polygon')
            expect(polygons).toHaveLength(2)
        })

        const polygons = screen.getAllByTestId('polygon')
        fireEvent.click(polygons[0])

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/api/map/areas/1/projects')
        })
    })

    it('3. The map layout renders with loaded state base markers', async () => {
        render(<InteractiveMap />)

        await waitFor(() => {
            const uiLabel = screen.getByText('Mira Road Market')
            expect(uiLabel).toBeDefined()
        })

        const mapContainer = screen.getByTestId('google-map')
        expect(mapContainer).toBeDefined()
    })
})
