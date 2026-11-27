import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import {
  MapMode,
  TerritoryCode,
  StateProfile,
  BuildingCategory,
} from '@india-statecraft/shared-types';
import {
  MAP_MODES,
  getMapColorForValue,
  STATE_CENTROIDS,
  MAJOR_CITIES,
  formatUSD,
} from '@india-statecraft/map-data';

interface MapViewProps {
  states: Record<TerritoryCode, StateProfile>;
  activeMode: MapMode;
  selectedStateCode: TerritoryCode;
  playerStateCode: TerritoryCode;
  activeBuildTool: BuildingCategory | null;
  onPlaceBuilding: (stateCode: TerritoryCode, coords: [number, number], locationName?: string) => void;
  onSelectState: (code: TerritoryCode) => void;
  zoomTarget: 'WORLD' | 'INDIA' | 'STATE' | null;
  onZoomComplete: () => void;
}

export const MapView: React.FC<MapViewProps> = ({
  states,
  activeMode,
  selectedStateCode,
  playerStateCode,
  activeBuildTool,
  onPlaceBuilding,
  onSelectState,
  zoomTarget,
  onZoomComplete,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const isLoadedRef = useRef(false);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  // Latest props in refs for MapLibre event listeners
  const activeBuildToolRef = useRef<BuildingCategory | null>(activeBuildTool);
  const playerStateCodeRef = useRef<TerritoryCode>(playerStateCode);
  const onPlaceBuildingRef = useRef(onPlaceBuilding);
  const onSelectStateRef = useRef(onSelectState);
  activeBuildToolRef.current = activeBuildTool;
  playerStateCodeRef.current = playerStateCode;
  onPlaceBuildingRef.current = onPlaceBuilding;
  onSelectStateRef.current = onSelectState;

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Natural base style inspired by Dummynation:
    // Surrounding countries, oceans and continents remain naturally visible without artificial black overlays.
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
            'background-color': '#162338', // Natural deep ocean blue
          },
        },
        {
          id: 'osm-tiles',
          type: 'raster',
          source: 'openmaptiles',
          paint: {
            'raster-opacity': 0.92,
            'raster-brightness-min': 0.08,
            'raster-brightness-max': 0.98,
            'raster-saturation': -0.15, // Subtle clean desaturation
          },
        },
      ],
    };

    // Initial camera starts at regional world view
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: baseMapStyle,
      center: [78.9629, 21.0],
      zoom: 3.4,
      minZoom: 2.2,
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

        // 2. States Fill Layer (Thematic Choropleth with Golden Glow / Heatmap)
        map.addLayer({
          id: 'states-fill',
          type: 'fill',
          source: 'india-states',
          paint: {
            'fill-color': '#2e1c0c',
            'fill-opacity': 0.82,
          },
        });

        // 3. Crisp State Boundaries
        map.addLayer({
          id: 'states-borders',
          type: 'line',
          source: 'india-states',
          paint: {
            'line-color': '#38bdf8',
            'line-width': 1.4,
            'line-opacity': 0.80,
          },
        });

        // 4. Selected State Luminous Glow Outline
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

        // 5. Eligible Cities & Towns Layer (visible ONLY when placing a City in player's state)
        const townsGeoJSON: GeoJSON.FeatureCollection = {
          type: 'FeatureCollection',
          features: MAJOR_CITIES.map((city, idx) => ({
            type: 'Feature',
            id: idx,
            properties: {
              name: city.name,
              code: city.stateCode,
              isCapital: city.isCapital,
            },
            geometry: {
              type: 'Point',
              coordinates: city.coords,
            },
          })),
        };

        map.addSource('eligible-towns', {
          type: 'geojson',
          data: townsGeoJSON,
        });

        map.addLayer({
          id: 'eligible-towns-layer',
          type: 'circle',
          source: 'eligible-towns',
          paint: {
            'circle-radius': 7,
            'circle-color': '#38bdf8',
            'circle-opacity': 0.85,
            'circle-stroke-width': 2.5,
            'circle-stroke-color': '#fbbf24',
          },
          layout: {
            visibility: 'none',
          },
        });

        // 6. Player/State Placed Buildings Layer (only structures actually built on the map)
        map.addSource('placed-buildings', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });

        map.addLayer({
          id: 'placed-buildings-layer',
          type: 'circle',
          source: 'placed-buildings',
          paint: {
            'circle-radius': 6.5,
            'circle-color': [
              'match',
              ['get', 'type'],
              'RESIDENTIAL', '#38bdf8',
              'SEAPORT', '#8b5cf6',
              'FACTORY', '#f59e0b',
              'RAILWAY_DEPOT', '#10b981',
              '#e2e8f0',
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#0f172a',
          },
        });

        map.addLayer({
          id: 'placed-buildings-labels',
          type: 'symbol',
          source: 'placed-buildings',
          layout: {
            'text-field': ['get', 'label'],
            'text-size': 11,
            'text-offset': [0, 1.3],
            'text-anchor': 'top',
          },
          paint: {
            'text-color': '#f8fafc',
            'text-halo-color': '#0f172a',
            'text-halo-width': 1.5,
          },
        });

        // Click on eligible town target when placing a City
        map.on('click', 'eligible-towns-layer', (e) => {
          if (!e.features || e.features.length === 0) return;
          if (activeBuildToolRef.current !== 'RESIDENTIAL') return;
          e.originalEvent.stopPropagation();

          const feat = e.features[0];
          const townCode = feat.properties?.code as TerritoryCode;
          const townName = feat.properties?.name as string;
          const coords = (feat.geometry as GeoJSON.Point).coordinates as [number, number];

          if (townCode === playerStateCodeRef.current) {
            onPlaceBuildingRef.current(townCode, coords, townName);
          }
        });

        map.on('mouseenter', 'eligible-towns-layer', () => {
          map.getCanvas().style.cursor = 'crosshair';
        });
        map.on('mouseleave', 'eligible-towns-layer', () => {
          map.getCanvas().style.cursor = '';
        });

        // Click interaction on state:
        // If building tool active -> place building inside player state (Cities require town snap!)
        // Otherwise -> selects state & zooms into it
        map.on('click', 'states-fill', (e) => {
          if (!e.features || e.features.length === 0) return;
          const code = e.features[0].properties?.code as TerritoryCode;
          if (!code) return;

          const activeTool = activeBuildToolRef.current;
          if (activeTool) {
            // If placing a City, check if click is near an eligible town in player's state
            if (activeTool === 'RESIDENTIAL') {
              const townFeatures = map.queryRenderedFeatures(e.point, {
                layers: ['eligible-towns-layer'],
              });
              if (townFeatures.length > 0) {
                const town = townFeatures[0];
                const townCode = town.properties?.code as TerritoryCode;
                const townName = town.properties?.name as string;
                const coords = (town.geometry as GeoJSON.Point).coordinates as [number, number];
                onPlaceBuildingRef.current(townCode, coords, townName);
                return;
              }
              // Clicked empty land instead of a town
              onPlaceBuildingRef.current(code, [e.lngLat.lng, e.lngLat.lat], undefined);
              return;
            }

            // Other structures (Factory, Port, Rail Hub) can be placed directly in player state
            onPlaceBuildingRef.current(code, [e.lngLat.lng, e.lngLat.lat]);
            return;
          }

          onSelectStateRef.current(code);
          const centroid = STATE_CENTROIDS[code];
          if (centroid) {
            map.flyTo({
              center: centroid,
              zoom: 6.0,
              duration: 1000,
            });
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
            <div style="background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(255,255,255,0.18); border-radius: 8px; padding: 8px 12px; color: #f8fafc; font-family: sans-serif; font-size: 11px; min-width: 140px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
              <div style="font-weight: 800; font-size: 12px; color: #f59e0b; display: flex; justify-content: space-between; align-items: center;">
                <span>${st.name}</span>
                <span style="font-size: 9px; color: #38bdf8; font-family: monospace; background: rgba(56, 189, 248, 0.15); padding: 1px 4px; border-radius: 3px;">${st.code}</span>
              </div>
              <div style="color: #94a3b8; margin-top: 4px;">Capital: <strong style="color: #e2e8f0;">${st.capital}</strong></div>
              <div style="color: #94a3b8;">GDP: <strong style="color: #fbbf24; font-family: monospace;">${formatUSD(st.economy.gdpUSD)}</strong></div>
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
  // Preserves camera position and selected state completely!
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

  // Show eligible towns ONLY when placing a City in the player's state
  useEffect(() => {
    if (!mapRef.current || !isLoadedRef.current) return;
    const map = mapRef.current;
    if (map.getLayer('eligible-towns-layer')) {
      if (activeBuildTool === 'RESIDENTIAL') {
        map.setLayoutProperty('eligible-towns-layer', 'visibility', 'visible');
        map.setFilter('eligible-towns-layer', ['==', 'code', playerStateCode]);
      } else {
        map.setLayoutProperty('eligible-towns-layer', 'visibility', 'none');
      }
    }
    map.getCanvas().style.cursor = activeBuildTool ? 'crosshair' : '';
  }, [activeBuildTool, playerStateCode]);

  // Sync placed buildings on the map
  useEffect(() => {
    if (!mapRef.current || !isLoadedRef.current) return;
    const source = mapRef.current.getSource('placed-buildings') as maplibregl.GeoJSONSource | undefined;
    if (!source) return;

    const features: GeoJSON.Feature[] = [];
    for (const st of Object.values(states)) {
      for (const b of st.buildings) {
        if (b.coords) {
          const shortType =
            b.type === 'RESIDENTIAL'
              ? 'City'
              : b.type === 'SEAPORT'
              ? 'Port'
              : b.type === 'FACTORY'
              ? 'Factory'
              : 'Rail Hub';
          features.push({
            type: 'Feature',
            properties: {
              id: b.id,
              type: b.type,
              label: b.locationName ? `${b.locationName} (${shortType})` : shortType,
            },
            geometry: {
              type: 'Point',
              coordinates: b.coords,
            },
          });
        }
      }
    }

    source.setData({ type: 'FeatureCollection', features });
  }, [states]);

  // Handle camera zoom transitions from navigation controls
  useEffect(() => {
    if (!mapRef.current || !zoomTarget) return;

    if (zoomTarget === 'WORLD') {
      mapRef.current.flyTo({
        center: [78.9629, 21.0],
        zoom: 3.2,
        duration: 1200,
      });
    } else if (zoomTarget === 'INDIA') {
      mapRef.current.flyTo({
        center: [78.9629, 22.5937],
        zoom: 4.6,
        duration: 1200,
      });
    } else if (zoomTarget === 'STATE') {
      const centroid = STATE_CENTROIDS[selectedStateCode];
      if (centroid) {
        mapRef.current.flyTo({
          center: centroid,
          zoom: 6.0,
          duration: 1000,
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

  // --- NORMAL VIEW: distinct flat political colours per state ---
  if (activeMode === 'normal') {
    // A curated palette of 12 distinct muted-but-readable political colours
    const POLITICAL_PALETTE: string[] = [
      '#1e4d6b', '#2d6a4f', '#4a4080', '#6b3030',
      '#1a5c4a', '#5c4a1a', '#3d4a6b', '#6b4a2d',
      '#2d4a6b', '#4a6b2d', '#6b2d4a', '#2d6b5c',
    ];
    // Assign each state a stable colour by hashing its code
    const matchExpr: any[] = ['match', ['get', 'code']];
    for (const code of Object.keys(states)) {
      let hash = 0;
      for (let i = 0; i < code.length; i++) hash = (hash * 31 + code.charCodeAt(i)) % POLITICAL_PALETTE.length;
      matchExpr.push(code, POLITICAL_PALETTE[Math.abs(hash)]);
    }
    matchExpr.push('#1e3a5f'); // fallback
    map.setPaintProperty('states-fill', 'fill-color', matchExpr);
    map.setPaintProperty('states-fill', 'fill-opacity', 0.75);
    if (map.getLayer('states-borders')) {
      map.setPaintProperty('states-borders', 'line-color', '#7dd3fc');
      map.setPaintProperty('states-borders', 'line-width', 1.2);
    }
    return;
  }

  // --- ALL OTHER MODES: choropleth heatmap ---
  const modeConfig = MAP_MODES[activeMode];
  if (!modeConfig) return;

  const matchExpr: any[] = ['match', ['get', 'code']];

  for (const [code, stateProfile] of Object.entries(states) as [TerritoryCode, StateProfile][]) {
    const rawVal = modeConfig.getValue(stateProfile);
    const color = getMapColorForValue(activeMode, rawVal);
    matchExpr.push(code, color);
  }

  // Fallback color
  matchExpr.push('#334155');

  map.setPaintProperty('states-fill', 'fill-color', matchExpr);
  map.setPaintProperty('states-fill', 'fill-opacity', 0.82);

  // When in economy mode, border outlines glow warm gold
  if (map.getLayer('states-borders')) {
    map.setPaintProperty(
      'states-borders',
      'line-color',
      activeMode === 'economy' ? '#f59e0b' : '#38bdf8'
    );
    map.setPaintProperty('states-borders', 'line-width', 1.4);
  }
}
