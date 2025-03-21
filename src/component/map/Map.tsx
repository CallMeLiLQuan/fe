"use client";

import React, { useEffect, useRef } from 'react';
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-draw";
import { Coordinates } from "@/model/coordinate.model";
import PolygonLayer from "./PolygonLayer";

interface MapProps {
  coordinates: Coordinates;
  onCoordinatesUpdate: (coordinates: Coordinates) => void;
}

interface MapUpdaterProps {
  center: L.LatLng;
  zoom: number;
}

const MapUpdater: React.FC<MapUpdaterProps> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], zoom);
  }, [map, center, zoom]);
  return null;
};

interface DrawControlProps {
  polygon: L.LatLng[];
  onPolygonUpdate: (polygon: L.LatLng[]) => void;
}

interface DrawCreatedEvent extends L.LeafletEvent {
  layer: L.Polygon;
  layerType: string;
}

interface DrawEditedEvent extends L.LeafletEvent {
  layers: L.LayerGroup;
}

const DrawControl: React.FC<DrawControlProps> = ({ polygon, onPolygonUpdate }) => {
  const map = useMap();
  const drawControlRef = useRef<L.Control.Draw | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);

  useEffect(() => {
    if (!map) return;

    // Initialize the FeatureGroup to store editable layers
    const drawnItems = new L.FeatureGroup();
    drawnItemsRef.current = drawnItems;
    map.addLayer(drawnItems);

    // Add the initial polygon if it exists
    if (polygon.length > 0) {
      const latLngs = polygon.map(point => [point.lat, point.lng]);
      const polygonLayer = L.polygon(latLngs as L.LatLngTuple[]);
      drawnItems.addLayer(polygonLayer);
      
      // Fit the map to the polygon bounds
      map.fitBounds(polygonLayer.getBounds());
    }

    // Initialize the draw control
    const drawControl = new L.Control.Draw({
      draw: {
        marker: false,
        circle: false,
        circlemarker: false,
        rectangle: false,
        polyline: false,
        polygon: {
          allowIntersection: false,
          drawError: {
            color: '#e1e100',
            message: '<strong>Oh snap!<strong> you can\'t draw that!'
          },
          shapeOptions: {
            color: '#97009c'
          }
        }
      },
      edit: {
        featureGroup: drawnItems,
        remove: true
      }
    });
    drawControlRef.current = drawControl;
    map.addControl(drawControl);

    // Event handlers
    map.on('draw:created', ((e: DrawCreatedEvent) => {
      const layer = e.layer;
      drawnItems.clearLayers();
      drawnItems.addLayer(layer);
      const coordinates = (layer.getLatLngs()[0] as L.LatLng[]).map(point => 
        new L.LatLng(point.lat, point.lng)
      );
      onPolygonUpdate(coordinates);
    }) as L.LeafletEventHandlerFn);

    map.on('draw:edited', ((e: DrawEditedEvent) => {
      const layers = e.layers;
      layers.eachLayer(((layer) => {
        if (layer instanceof L.Polygon) {
          const coordinates = (layer.getLatLngs()[0] as L.LatLng[]).map(point => 
            new L.LatLng(point.lat, point.lng)
          );
          onPolygonUpdate(coordinates);
        }
      }));
    }) as L.LeafletEventHandlerFn);

    map.on('draw:deleted', () => {
      onPolygonUpdate([]);
    });

    return () => {
      map.removeControl(drawControl);
      map.removeLayer(drawnItems);
    };
  }, [map, polygon, onPolygonUpdate]);

  return null;
};

const Map: React.FC<MapProps> = ({ coordinates, onCoordinatesUpdate }) => {
  console.log('Raw coordinates:', coordinates);
  
  const defaultCenter = new L.LatLng(20.994711, 105.867888); // Default center (Times City)
  const defaultZoom = 16; // Default zoom level

  // Ensure valid center coordinates
  const center = coordinates?.center || { lat: defaultCenter.lat, lng: defaultCenter.lng };
  const zoom = coordinates?.zoom || defaultZoom;

  // When drawing a new polygon on the map
  const handlePolygonUpdate = (polygon: L.LatLng[]) => {
    console.log('New polygon coordinates:', polygon);
    
    // Convert to [lat, lng] array format
    const convertedPolygon = polygon.map(point => [point.lat, point.lng] as [number, number]);

    // Calculate center point
    const bounds = L.latLngBounds(polygon);
    const center = bounds.getCenter();

    onCoordinatesUpdate({
      polygon: convertedPolygon,
      center: {
        lat: center.lat,
        lng: center.lng
      },
      zoom: coordinates.zoom || defaultZoom
    });
  };

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      style={{ height: "100%", width: "100%", zIndex: 1 }}
    >
      <TileLayer
        url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
        maxZoom={20}
        subdomains={["mt0", "mt1", "mt2", "mt3"]}
        attribution="&copy; Google Maps"
      />

      {/* Display polygon from database */}
      {coordinates?.polygon && coordinates.polygon.length > 0 && (
        <PolygonLayer 
          coordinates={coordinates.polygon.map(([lat, lng]) => new L.LatLng(lat, lng))}
          highlightColor="#ff0000"
          fillColor="#ff000033"
        />
      )}

      {/* New polygon drawing tools */}
      <DrawControl 
        polygon={coordinates.polygon.map(([lat, lng]) => new L.LatLng(lat, lng))} 
        onPolygonUpdate={handlePolygonUpdate} 
      />
      
      {/* Update position when changed */}
      <MapUpdater center={new L.LatLng(center.lat, center.lng)} zoom={zoom} />
    </MapContainer>
  );
};

export default Map;
