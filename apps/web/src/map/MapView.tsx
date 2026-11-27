import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import {
  MapMode,
  TerritoryCode,
  StateProfile,
} from '@india-statecraft/shared-types';
import { MAP_MODES, getMapColorForValue, STATE_CENTROIDS } from '@india-statecraft/map-data';

interface MapViewProps {
  states: Record<TerritoryCode, StateProfile>;
  activeMode: MapMode;
  selectedStateCode: TerritoryCode;
  onSelectState: (code: TerritoryCode) => void;
  zoomTarget: 'WORLD' | 'INDIA' | 'STATE' | null;
  onZoomComplete: () => void;
}

export const MapView: React.FC<MapViewProps> = ({
  states,
  activeMode,
  selectedStateCode,
  onSelectState,
  zoomTarget,
  onZoomComplete,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const isLoadedRef = useRef(false);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Clean, high-performance base style inspired by OpenFront.io
    const baseMapStyle: maplibregl.StyleSpecification = {
      version: 8,
      sources: {
        'openmaptiles': {
          type: 'raster',
          tiles: [
            'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors | India: Statecraft',
        },
      },
      layers: [
        {
          id: 'background',
          type: 'background',
          paint: {
            'background-color': '#080d1a',
          },
        },
        {
          id: 'osm-tiles',
          type: 'raster',
          source: 'openmaptiles',
          paint: {
            'raster-opacity': 0.35,
            'raster-brightness-min': 0.1,
            'raster-brightness-max': 0.6,
            'raster-saturation': -0.7,
          },
        },
      ],
    };

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: baseMapStyle,
      center: [78.9629, 22.5937], // Geographical center of India
      zoom: 4.6,
      minZoom: 2,
      maxZoom: 10,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

    map.on('load', async () => {
      try {
        const response = await fetch('/data/india-states.geojson');
        const geojsonData = await response.json();

        map.addSource('india-states', {
          type: 'geojson',
          data: geojsonData,
        });

        // Fill layer
        map.addLayer({
          id: 'states-fill',
          type: 'fill',
          source: 'india-states',
          paint: {
            'fill-color': '#334155',
            'fill-opacity': 0.85,
          },
        });

        // State boundaries outline
        map.addLayer({
          id: 'states-borders',
          type: 'line',
          source: 'india-states',
          paint: {
            'line-color': '#0ea5e9',
            'line-width': 1.5,
            'line-opacity': 0.7,
          },
        });

        // Highlight layer for selected state
        map.addLayer({
          id: 'state-selected-outline',
          type: 'line',
          source: 'india-states',
          paint: {
            'line-color': '#f59e0b',
            'line-width': 3.5,
          },
          filter: ['==', 'code', selectedStateCode],
        });

        // Click interaction
        map.on('click', 'states-fill', (e) => {
          if (!e.features || e.features.length === 0) return;
          const code = e.features[0].properties?.code as TerritoryCode;
          if (code) {
            onSelectState(code);
          }
        });

        // Hover cursor
        map.on('mouseenter', 'states-fill', () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'states-fill', () => {
          map.getCanvas().style.cursor = '';
        });

        isLoadedRef.current = true;
        updateMapColors(map, states, activeMode);
      } catch (err) {
        console.error('Error loading GeoJSON layer:', err);
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      isLoadedRef.current = false;
    };
  }, []);

  // Update choropleth colors dynamically when activeMode or states update
  useEffect(() => {
    if (!mapRef.current || !isLoadedRef.current) return;
    updateMapColors(mapRef.current, states, activeMode);
  }, [activeMode, states]);

  // Update selected state border highlight
  useEffect(() => {
    if (!mapRef.current || !isLoadedRef.current) return;
    if (mapRef.current.getLayer('state-selected-outline')) {
      mapRef.current.setFilter('state-selected-outline', ['==', 'code', selectedStateCode]);
    }
  }, [selectedStateCode]);

  // Handle camera zoom transitions
  useEffect(() => {
    if (!mapRef.current || !zoomTarget) return;

    if (zoomTarget === 'WORLD') {
      mapRef.current.flyTo({
        center: [78.9629, 20.5937],
        zoom: 2.5,
        duration: 1500,
      });
    } else if (zoomTarget === 'INDIA') {
      mapRef.current.flyTo({
        center: [78.9629, 22.5937],
        zoom: 4.6,
        duration: 1500,
      });
    } else if (zoomTarget === 'STATE') {
      const centroid = STATE_CENTROIDS[selectedStateCode];
      if (centroid) {
        mapRef.current.flyTo({
          center: centroid,
          zoom: 6.2,
          duration: 1200,
        });
      }
    }
    onZoomComplete();
  }, [zoomTarget, selectedStateCode]);

  return <div ref={mapContainerRef} className="map-container" />;
};

function updateMapColors(
  map: maplibregl.Map,
  states: Record<TerritoryCode, StateProfile>,
  activeMode: MapMode
) {
  if (!map.getLayer('states-fill')) return;

  const modeConfig = MAP_MODES[activeMode];
  if (!modeConfig) return;

  // Build match expression for MapLibre: ['match', ['get', 'code'], 'AP', '#color', ...]
  const matchExpr: any[] = ['match', ['get', 'code']];

  for (const [code, stateProfile] of Object.entries(states) as [TerritoryCode, StateProfile][]) {
    const rawVal = modeConfig.getValue(stateProfile);
    const color = getMapColorForValue(activeMode, rawVal);
    matchExpr.push(code, color);
  }

  // Fallback color
  matchExpr.push('#334155');

  map.setPaintProperty('states-fill', 'fill-color', matchExpr);
}
