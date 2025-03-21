import axiosInstance from "@/utils/axiosInstance";
import { Land } from "../model/land.model";
import { Area } from "../model/area.model";
import { AxiosError } from 'axios';

export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
};

export const fetchLands = async () => {
  const token = localStorage.getItem('access_token');
  const response = await axiosInstance.get("land", {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

export const getLandById = async (id: number) => {
  const token = localStorage.getItem('access_token');
  try {
    console.log('Fetching land with ID:', id);
    const response = await axiosInstance.get(`land/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.data) {
      console.error('No data received from server');
      throw new Error('No data received from server');
    }

    console.log('Raw response data:', response.data);
    
    // Validate and parse coordinate data
    if (!response.data.coordinate) {
      console.warn('No coordinate data found, setting defaults');
      response.data.coordinate = {
        polygon: [[21.0235276, 105.8420103]],
        center: { lat: 21.0235276, lng: 105.8420103 },
        zoom: 15
      };
    } else {
      try {
        // Parse polygon if it's a string
        if (typeof response.data.coordinate.polygon === 'string') {
          response.data.coordinate.polygon = JSON.parse(response.data.coordinate.polygon);
        }
        
        // Parse center if it's a string
        if (typeof response.data.coordinate.center === 'string') {
          response.data.coordinate.center = JSON.parse(response.data.coordinate.center);
        }

        // Ensure zoom has a default value
        if (!response.data.coordinate.zoom) {
          response.data.coordinate.zoom = 15;
        }
      } catch (parseError) {
        console.error('Error parsing coordinates:', parseError);
        response.data.coordinate = {
          polygon: [[21.0235276, 105.8420103]],
          center: { lat: 21.0235276, lng: 105.8420103 },
          zoom: 15
        };
      }
    }

    // Ensure areas array exists and parse coordinates
    if (!response.data.areas) {
      response.data.areas = [];
    } else {
      response.data.areas = response.data.areas.map((area: Area) => {
        if (!area.coordinates) {
          area.coordinates = {
            polygon: [[21.0235276, 105.8420103]],
            center: { lat: 21.0235276, lng: 105.8420103 },
            zoom: 15
          };
        } else {
          try {
            // Parse polygon if it's a string
            if (typeof area.coordinates.polygon === 'string') {
              area.coordinates.polygon = JSON.parse(area.coordinates.polygon);
            }
            
            // Parse center if it's a string
            if (typeof area.coordinates.center === 'string') {
              area.coordinates.center = JSON.parse(area.coordinates.center);
            }

            // Ensure zoom has a default value
            if (!area.coordinates.zoom) {
              area.coordinates.zoom = 15;
            }
          } catch (parseError) {
            console.error('Error parsing area coordinates:', parseError);
            area.coordinates = {
              polygon: [[21.0235276, 105.8420103]],
              center: { lat: 21.0235276, lng: 105.8420103 },
              zoom: 15
            };
          }
        }
        return area;
      });
    }

    // Ensure properties array exists
    if (!response.data.properties) {
      response.data.properties = [];
    }

    console.log('Processed data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching land:', error);
    if (error instanceof AxiosError) {
      console.error('API Error details:', {
        status: error.response?.status,
        data: error.response?.data
      });
    }
    throw error;
  }
};

export const getLandsByRegion = async (regionId: number) => {
  try {
    const response = await axiosInstance.get(`land/region/${regionId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching lands by region:", error);
    return [];
  }
};

export const createLand = async (payload: Omit<Land, 'id' | 'created_date' | 'modified_date'>) => {
  const token = getToken();
  try {
    // Ensure coordinate data is properly formatted
    const coordinatePayload = {
      polygon: JSON.stringify(payload.coordinate.polygon),
      center: JSON.stringify(payload.coordinate.center),
      zoom: payload.coordinate.zoom
    };

    const formattedPayload = {
      name: payload.name,
      address: payload.address,
      area: payload.area,
      price: payload.price,
      location: payload.location,
      areaCount: 0,
      properties: [],
      coordinate: coordinatePayload,
      areas: [],
      planningMapUrl: '',
      googleMapUrl: '',
      owner: {
        id: payload.owner.id,
        name: payload.owner.name || '',
        phone: payload.owner.phone || ''
      },
      region: {
        id: payload.region.id,
        name: payload.region.name || ''
      }
    };

    console.log('Creating land with payload:', JSON.stringify(formattedPayload, null, 2));
    const response = await axiosInstance.post("land", formattedPayload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Server response:', response.data);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error('Error creating land:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        error: error.response?.data?.error,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data ? JSON.parse(error.config.data) : {},
          headers: error.config?.headers
        }
      });
    }
    throw error;
  }
};

export const updateLand = async (id: number, payload: Partial<Land>) => {
  const token = getToken();
  const response = await axiosInstance.put(`land/${id}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const deleteLand = async (id: number) => {
  const token = getToken();
  const response = await axiosInstance.delete(`land/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};