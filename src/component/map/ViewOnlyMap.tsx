"use client";

import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Polygon, useMap, ZoomControl, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { DatabaseCoordinates } from '@/model/coordinate.model';

interface ViewOnlyMapProps {
  coordinates: DatabaseCoordinates;
  areas?: Array<{
    id: number;
    name: string;
    coordinates: DatabaseCoordinates;
    status: string;
    tooltip: string;
  }>;
}

interface MapControllerProps {
  coordinates: {
    polygon: L.LatLng[];
    center: L.LatLng;
    zoom: number;
  };
}

interface BlinkingPolygonProps {
  coordinates: [number, number][];
  status: string;
  tooltip: string;
}

function BlinkingPolygon({ coordinates, status, tooltip }: BlinkingPolygonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return '#4CAF50';
      case 'in-use':
        return '#FFC107';
      case 'pending':
        return '#FF5722';
      default:
        return '#FF0000';
    }
  };

  return (
    <Polygon
      positions={coordinates}
      pathOptions={{
        color: getStatusColor(status),
        fillColor: getStatusColor(status),
        fillOpacity: isHovered ? 0.6 : 0.4,
        weight: isHovered ? 3 : 2
      }}
      eventHandlers={{
        mouseover: () => setIsHovered(true),
        mouseout: () => setIsHovered(false),
      }}
    >
      <Tooltip 
        permanent={isHovered}
        direction="center"
        className="custom-tooltip"
      >
        <div className="whitespace-pre-line text-sm bg-white p-2 rounded shadow-lg">
          {tooltip}
        </div>
      </Tooltip>
    </Polygon>
  );
}

function MapController({ coordinates }: MapControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (coordinates.polygon.length > 0) {
      const bounds = L.latLngBounds(coordinates.polygon);
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 18
      });
    } else {
      map.setView([coordinates.center.lat, coordinates.center.lng], coordinates.zoom);
    }
  }, [coordinates, map]);

  return null;
}

export default function ViewOnlyMap({ coordinates, areas = [] }: ViewOnlyMapProps) {
  useEffect(() => {
    // Fix for map container not rendering properly
    window.dispatchEvent(new Event('resize'));
  }, []);

  console.log('Raw coordinates:', coordinates);
  console.log('Areas:', areas);

  // Convert coordinates to LatLng objects for the controller
  const points = coordinates.polygon;
  const latLngs = points.map(([lat, lng]) => new L.LatLng(lat, lng));

  return (
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

      {/* Main land boundary */}
      <Polygon
        positions={coordinates.polygon}
        pathOptions={{
          color: '#FF0000',
          fillColor: '#FF0000',
          fillOpacity: 0.2,
          weight: 2
        }}
      >
        <Tooltip permanent>
          <div className="font-semibold">Ranh giới khu đất</div>
        </Tooltip>
      </Polygon>

      {/* Areas */}
      {areas.map((area) => (
        <BlinkingPolygon
          key={area.id}
          coordinates={area.coordinates.polygon}
          status={area.status}
          tooltip={area.tooltip}
        />
      ))}

      <ZoomControl position="bottomright" />
      <MapController coordinates={{
        polygon: latLngs,
        center: new L.LatLng(coordinates.center.lat, coordinates.center.lng),
        zoom: coordinates.zoom
      }} />
    </MapContainer>
  );
} 