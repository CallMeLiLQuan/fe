import { DatabaseCoordinates } from "@/model/coordinate.model";

export const updateCoordinates = async (landId: number, coordinates: DatabaseCoordinates): Promise<DatabaseCoordinates> => {
  try {
    const response = await fetch(`/api/lands/${landId}/coordinates`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        polygon: coordinates.polygon,
        center: coordinates.center,
        zoom: coordinates.zoom
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update coordinates');
    }

    const data: unknown = await response.json();
    if (!isValidDatabaseCoordinates(data)) {
      throw new Error('Invalid coordinates data received from server');
    }
    return data;
  } catch (error) {
    console.error('Error updating coordinates:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
};

function isValidDatabaseCoordinates(data: unknown): data is DatabaseCoordinates {
  return (
    typeof data === 'object' &&
    data !== null &&
    'polygon' in data &&
    'center' in data &&
    'zoom' in data &&
    Array.isArray((data as DatabaseCoordinates).polygon) &&
    typeof (data as DatabaseCoordinates).center === 'object' &&
    typeof (data as DatabaseCoordinates).zoom === 'number'
  );
}

export const getCoordinates = async (landId: number): Promise<DatabaseCoordinates> => {
  try {
    const response = await fetch(`/api/lands/${landId}/coordinates`);

    if (!response.ok) {
      throw new Error('Failed to get coordinates');
    }

    const data: unknown = await response.json();
    if (!isValidDatabaseCoordinates(data)) {
      throw new Error('Invalid coordinates data received from server');
    }
    return data;
  } catch (error) {
    console.error('Error getting coordinates:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
};