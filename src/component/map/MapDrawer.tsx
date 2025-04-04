import React, { useCallback, useEffect, useRef } from 'react';
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

interface EditFeatureEvent extends L.LeafletEvent {
  layers: L.LayerGroup;
}

function DrawingControl({ onPolygonComplete, enabled }: { 
  onPolygonComplete: (coordinates: DatabaseCoordinates) => void;
  enabled: boolean;
}) {
  const map = useMap();
  const drawControlRef = useRef<L.Control.Draw | null>(null);
  const featureGroupRef = useRef<L.FeatureGroup | null>(null);

  useEffect(() => {
    if (!enabled || !map) return;

    const initializeDrawControl = async () => {
      try {
        // Import leaflet-draw dynamically
        await import('leaflet-draw');
        
        // Create feature group if it doesn't exist
        if (!featureGroupRef.current) {
          featureGroupRef.current = new L.FeatureGroup();
          map.addLayer(featureGroupRef.current);
        }

        // Remove existing draw control if it exists
        if (drawControlRef.current) {
          map.removeControl(drawControlRef.current);
        }

        // Initialize draw control
        const drawControl = new L.Control.Draw({
          position: 'topleft',
          draw: {
            rectangle: false,
            circle: false,
            circlemarker: false,
            marker: false,
            polyline: false,
            polygon: {
              allowIntersection: false,
              showArea: true,
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
            featureGroup: featureGroupRef.current,
            edit: {
              selectedPathOptions: {
                color: '#ff0000',
                fillColor: '#ff0000',
                fillOpacity: 0.3
              }
            },
            remove: true
          }
        });

        map.addControl(drawControl);
        drawControlRef.current = drawControl;

        // Handle draw events
        const handleDrawCreated = (e: L.LeafletEvent) => {
          const event = e as DrawCreatedEvent;
          const layer = event.layer;
          if (event.layerType === 'polygon') {
            // Clear existing layers before adding new one
            if (featureGroupRef.current) {
              featureGroupRef.current.clearLayers();
            }
            
            // Add the new layer
            if (featureGroupRef.current) {
              featureGroupRef.current.addLayer(layer);
            }

            const coordinates = layer.getLatLngs()[0] as L.LatLng[];
            const points: [number, number][] = coordinates.map((coord: L.LatLng) => [coord.lat, coord.lng]);
            
            const bounds = layer.getBounds();
            const center = bounds.getCenter();

            onPolygonComplete({
              polygon: points,
              center: { lat: center.lat, lng: center.lng },
              zoom: map.getZoom()
            });
          }
        };

        // Add event listeners
        map.on('draw:created', handleDrawCreated);
        map.on('draw:edited', (e: L.LeafletEvent) => {
          const editEvent = e as EditFeatureEvent;
          editEvent.layers.eachLayer((layer) => {
            if (layer instanceof L.Polygon) {
              const coordinates = layer.getLatLngs()[0] as L.LatLng[];
              const points: [number, number][] = coordinates.map((coord: L.LatLng) => [coord.lat, coord.lng]);
              
              const bounds = layer.getBounds();
              const center = bounds.getCenter();

              onPolygonComplete({
                polygon: points,
                center: { lat: center.lat, lng: center.lng },
                zoom: map.getZoom()
              });
            }
          });
        });

        return () => {
          map.off('draw:created', handleDrawCreated);
          map.off('draw:edited');
        };
      } catch (error) {
        console.error('Error initializing leaflet-draw:', error);
      }
    };

    initializeDrawControl();

    return () => {
      // Cleanup on unmount
      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current);
      }
      if (featureGroupRef.current) {
        map.removeLayer(featureGroupRef.current);
      }
    };
  }, [enabled, map, onPolygonComplete]);

  return null;
}

const MapDrawer: React.FC<MapDrawerProps> = ({
  coordinates,
  onCoordinatesUpdate,
  drawingEnabled = true
}) => {
  const mapId = useRef(`map-${Math.random().toString(36).substr(2, 9)}`);
  const handlePolygonComplete = useCallback((coords: DatabaseCoordinates) => {
    onCoordinatesUpdate(coords);
  }, [onCoordinatesUpdate]);

  return (
    <div style={{ height: '100%', width: '100%' }} id={mapId.current}>
      <MapContainer
        style={{ height: '100%', width: '100%' }}
        center={[coordinates.center.lat, coordinates.center.lng]}
        zoom={coordinates.zoom}
        zoomControl={false}
        key={mapId.current}
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