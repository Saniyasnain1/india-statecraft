import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import {
  MapMode,
  TerritoryCode,
  StateProfile,
} from '@india-statecraft/shared-types';
import {
  MAP_MODES,
  getMapColorForValue,
  STATE_CENTROIDS,
  MAJOR_CITIES,
  RAILWAY_CORRIDORS,
  formatUSD,
} from '@india-statecraft/map-data';

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
  const popupRef = useRef<maplibregl.Popup | null>(null);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Dark high-contrast base style inspired by OpenFront.io / Dummynation
    const baseMapStyle: maplibregl.StyleSpecification = {
      version: 8,
      sources: {
        'openmaptiles': {
          type: 'raster',
          tiles: [
            'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution: '© OpenStreetMap | India: Statecraft',
        },
      },
      layers: [
        {
          id: 'background',
          type: 'background',
          paint: {
            'background-color': '#070b14',
          },
        },
        {
          id: 'osm-tiles',
          type: 'raster',
          source: 'openmaptiles',
          paint: {
            'raster-opacity': 0.22,
            'raster-brightness-min': 0.05,
            'raster-brightness-max': 0.45,
            'raster-saturation': -0.9,
          },
        },
      ],
    };

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: baseMapStyle,
      center: [78.9629, 22.5937], // Center of India
      zoom: 4.5,
      minZoom: 2.5,
      maxZoom: 10,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 15,
      className: 'strategy-map-popup',
    });
    popupRef.current = popup;

    map.on('load', async () => {
      try {
        const response = await fetch('/data/india-states.geojson');
        const geojsonData = await response.json();

        // 1. Add States GeoJSON Source
        map.addSource('india-states', {
          type: 'geojson',
          data: geojsonData,
        });

        // 2. States Fill Layer (Thematic Choropleth)
        map.addLayer({
          id: 'states-fill',
          type: 'fill',
          source: 'india-states',
          paint: {
            'fill-color': '#1e293b',
            'fill-opacity': 0.88,
          },
        });

        // 3. States Crisp Border Outlines
        map.addLayer({
          id: 'states-borders',
          type: 'line',
          source: 'india-states',
          paint: {
            'line-color': '#38bdf8',
            'line-width': 1.6,
            'line-opacity': 0.75,
          },
        });

        // 4. Selected State Glow / Highlight Border
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

        // 5. Build Railway Network GeoJSON
        const railwayGeoJSON: GeoJSON.FeatureCollection = {
          type: 'FeatureCollection',
          features: RAILWAY_CORRIDORS.map((c, i) => ({
            type: 'Feature',
            id: i,
            properties: { from: c.fromCity, to: c.toCity },
            geometry: {
              type: 'LineString',
              coordinates: [c.fromCoords, c.toCoords],
            },
          })),
        };

        map.addSource('railway-corridors', {
          type: 'geojson',
          data: railwayGeoJSON,
        });

        // Railway corridor line layer (dashed high-tech transit look)
        map.addLayer({
          id: 'railway-lines',
          type: 'line',
          source: 'railway-corridors',
          paint: {
            'line-color': '#fbbf24',
            'line-width': 1.8,
            'line-opacity': 0.65,
            'line-dasharray': [3, 2],
          },
        });

        // 6. Strategic Major Cities Source & Points
        const citiesGeoJSON: GeoJSON.FeatureCollection = {
          type: 'FeatureCollection',
          features: MAJOR_CITIES.map((city, idx) => ({
            type: 'Feature',
            id: idx,
            properties: {
              name: city.name,
              code: city.stateCode,
              isCapital: city.isCapital,
              pop: `${city.populationM}M`,
            },
            geometry: {
              type: 'Point',
              coordinates: city.coords,
            },
          })),
        };

        map.addSource('major-cities', {
          type: 'geojson',
          data: citiesGeoJSON,
        });

        // Cities point dots
        map.addLayer({
          id: 'cities-points',
          type: 'circle',
          source: 'major-cities',
          paint: {
            'circle-radius': ['case', ['get', 'isCapital'], 5, 3.5],
            'circle-color': ['case', ['get', 'isCapital'], '#f59e0b', '#38bdf8'],
            'circle-stroke-width': 1.5,
            'circle-stroke-color': '#0f172a',
          },
        });

        // Click interaction on state
        map.on('click', 'states-fill', (e) => {
          if (!e.features || e.features.length === 0) return;
          const code = e.features[0].properties?.code as TerritoryCode;
          if (code) {
            onSelectState(code);
          }
        });

        // Hover tooltip popup on state
        map.on('mousemove', 'states-fill', (e) => {
          if (!e.features || e.features.length === 0) return;
          const feat = e.features[0];
          const code = feat.properties?.code as TerritoryCode;
          const st = states[code];
          if (!st) return;

          map.getCanvas().style.cursor = 'pointer';

          const modeConfig = MAP_MODES[activeMode];
          const modeValFormatted = modeConfig ? modeConfig.formatValue(modeConfig.getValue(st)) : '';

          const html = `
            <div style="background: rgba(10, 15, 29, 0.95); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 8px 12px; color: #f8fafc; font-family: sans-serif; font-size: 11px; min-width: 140px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
              <div style="font-weight: 800; font-size: 12px; color: #f59e0b; display: flex; justify-content: space-between; align-items: center;">
                <span>${st.name}</span>
                <span style="font-size: 9px; color: #38bdf8; font-family: monospace; background: rgba(56, 189, 248, 0.15); padding: 1px 4px; border-radius: 3px;">${st.code}</span>
              </div>
              <div style="color: #94a3b8; margin-top: 4px;">Capital: <strong style="color: #e2e8f0;">${st.capital}</strong></div>
              <div style="color: #94a3b8;">GDP: <strong style="color: #10b981; font-family: monospace;">${formatUSD(st.economy.gdpUSD)}</strong></div>
              <div style="color: #94a3b8;">Pop: <strong style="color: #e2e8f0; font-family: monospace;">${(st.demographics.population / 1000000).toFixed(1)}M</strong></div>
              <div style="margin-top: 4px; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 10px; color: #cbd5e1;">
                ${modeConfig?.label || 'Mode'}: <strong style="color: #38bdf8; font-family: monospace;">${modeValFormatted}</strong>
              </div>
            </div>
          `;

          popup.setLngLat(e.lngLat).setHTML(html).addTo(map);
        });

        map.on('mouseleave', 'states-fill', () => {
          map.getCanvas().style.cursor = '';
          popup.remove();
        });

        isLoadedRef.current = true;
        updateMapColors(map, states, activeMode);
      } catch (err) {
        console.error('Error loading GeoJSON layer:', err);
      }
    });

    mapRef.current = map;

    return () => {
      popup.remove();
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
        zoom: 2.8,
        duration: 1500,
      });
    } else if (zoomTarget === 'INDIA') {
      mapRef.current.flyTo({
        center: [78.9629, 22.5937],
        zoom: 4.5,
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

  const matchExpr: any[] = ['match', ['get', 'code']];

  for (const [code, stateProfile] of Object.entries(states) as [TerritoryCode, StateProfile][]) {
    const rawVal = modeConfig.getValue(stateProfile);
    const color = getMapColorForValue(activeMode, rawVal);
    matchExpr.push(code, color);
  }

  // Fallback color
  matchExpr.push('#1e293b');

  map.setPaintProperty('states-fill', 'fill-color', matchExpr);
}
