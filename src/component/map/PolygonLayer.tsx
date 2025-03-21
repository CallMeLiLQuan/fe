import { useEffect } from 'react';
import { Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';

interface PolygonLayerProps {
  coordinates: L.LatLng[];
  highlightColor?: string;
  fillColor?: string;
}

export default function PolygonLayer({ 
  coordinates, 
  highlightColor = '#ff0000', 
  fillColor = '#ff000033' 
}: PolygonLayerProps) {
  const map = useMap();

  useEffect(() => {
    if (coordinates.length > 0) {
      // Create a bounds object from the points
      const bounds = L.latLngBounds(coordinates);
      // Fit the map to show the entire polygon
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, coordinates]);

  if (coordinates.length === 0) return null;

  const points = coordinates.map(coord => [coord.lat, coord.lng] as [number, number]);

  return (
    <>
      {/* Main polygon with fill */}
      <Polygon
        positions={points}
        pathOptions={{
          color: highlightColor,
          weight: 2,
          fillColor: fillColor,
          fillOpacity: 0.35,
          opacity: 1
        }}
      />
      
      {/* Highlight border */}
      <Polygon
        positions={points}
        pathOptions={{
          color: highlightColor,
          weight: 3,
          fill: false,
          dashArray: '5, 10',
          opacity: 0.8
        }}
      />

      {/* Vertex markers */}
      {points.map((point, index) => (
        <Polygon
          key={index}
          positions={[point]}
          pathOptions={{
            color: highlightColor,
            fillColor: '#ffffff',
            fillOpacity: 1,
            weight: 2
          }}
        />
      ))}
    </>
  );
} 