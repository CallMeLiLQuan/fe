import React, { useCallback, useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { DatabaseCoordinates } from '@/model/coordinate.model';

// Initialize Leaflet icons
if (typeof window !== 'undefined') {
  // @ts-expect-error - _getIconUrl is a private property
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/images/marker-icon-2x.png',
    iconUrl: '/leaflet/images/marker-icon.png',
    shadowUrl: '/leaflet/images/marker-shadow.png',
  });
}

interface MapDrawerProps {
  coordinates: DatabaseCoordinates;
  onCoordinatesUpdate: (coordinates: DatabaseCoordinates) => void;
  drawingEnabled?: boolean;
}

interface DrawCreatedEvent extends L.LeafletEvent {
  layer: L.Polygon;
  layerType: string;
}

function DrawingControl({ onPolygonComplete, enabled }: { 
  onPolygonComplete: (coordinates: DatabaseCoordinates) => void;
  enabled: boolean;
}) {
  const map = useMap();
  const [drawControl, setDrawControl] = useState<L.Control.Draw | null>(null);

  useEffect(() => {
    if (!enabled || !map) return;

    const initializeDrawControl = async () => {
      try {
        // Import leaflet-draw dynamically
        await import('leaflet-draw');
        
        const featureGroup = new L.FeatureGroup();
        map.addLayer(featureGroup);

        // Initialize draw control
        const control = new L.Control.Draw({
          position: 'topleft',
          draw: {
            marker: false,
            circlemarker: false,
            circle: false,
            rectangle: false,
            polyline: false,
            polygon: {
              allowIntersection: false,
              drawError: {
                color: '#e1e100',
                message: '<strong>Oh snap!</strong> you can\'t draw that!'
              },
              shapeOptions: {
                color: '#ff0000',
                fillColor: '#ff0000',
                fillOpacity: 0.3
              }
            }
          },
          edit: {
            featureGroup: featureGroup,
            remove: false,
            edit: false
          }
        });

        map.addControl(control);
        setDrawControl(control);

        // Handle draw events
        const handleDrawCreated = (e: L.LeafletEvent) => {
          const event = e as DrawCreatedEvent;
          const layer = event.layer;
          if (event.layerType === 'polygon') {
            const coordinates = layer.getLatLngs()[0] as L.LatLng[];
            const points: [number, number][] = coordinates.map((coord: L.LatLng) => [coord.lat, coord.lng]);
            
            const bounds = layer.getBounds();
            const center = bounds.getCenter();

            onPolygonComplete({
              polygon: points,
              center: { lat: center.lat, lng: center.lng },
              zoom: map.getZoom()
            });

            // Clear existing layers and add the new one
            featureGroup.clearLayers();
            featureGroup.addLayer(layer);
          }
        };

        map.on('draw:created', handleDrawCreated);

        return () => {
          map.off('draw:created', handleDrawCreated);
          if (featureGroup) {
            map.removeLayer(featureGroup);
          }
        };
      } catch (error) {
        console.error('Error initializing leaflet-draw:', error);
      }
    };

    initializeDrawControl();

    return () => {
      if (drawControl) {
        map.removeControl(drawControl);
      }
    };
  }, [enabled, map, onPolygonComplete, drawControl]);

  return null;
}

const MapDrawer: React.FC<MapDrawerProps> = ({
  coordinates,
  onCoordinatesUpdate,
  drawingEnabled = true
}) => {
  const handlePolygonComplete = useCallback((coords: DatabaseCoordinates) => {
    onCoordinatesUpdate(coords);
  }, [onCoordinatesUpdate]);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer
        style={{ height: '100%', width: '100%' }}
        center={[coordinates.center.lat, coordinates.center.lng]}
        zoom={coordinates.zoom}
        zoomControl={false}
      >
        {/* Satellite Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com">Esri</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
        />
        {/* Labels Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          opacity={0.5}
        />
        <ZoomControl position="bottomright" />
        <DrawingControl onPolygonComplete={handlePolygonComplete} enabled={drawingEnabled} />
      </MapContainer>
    </div>
  );
};

export default MapDrawer; 