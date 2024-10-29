import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Utensils, MapPin, AlertCircle, Info } from 'lucide-react';

interface Restaurant {
  id: string;
  name: string;
  vicinity: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

function App() {
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchRadius, setSearchRadius] = useState<number>(1500);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries: ['places']
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          setError('Error: The Geolocation service failed.');
        }
      );
    } else {
      setError('Error: Your browser doesn\'t support geolocation.');
    }
  }, []);

  const searchRestaurants = () => {
    if (isLoaded && userLocation) {
      console.log('Searching for restaurants...');
      console.log('User location:', userLocation);
      console.log('Search radius:', searchRadius);

      const service = new google.maps.places.PlacesService(document.createElement('div'));
      const request = {
        location: userLocation,
        radius: searchRadius,
        type: 'restaurant'
      };

      service.nearbySearch(request, (results, status) => {
        console.log('Places API response status:', status);
        console.log('Results:', results);

        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          setRestaurants(results as Restaurant[]);
          setError(null);
        } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          setRestaurants([]);
          setError('No restaurants found within the current search radius. Try increasing the radius.');
        } else {
          setError(`Error fetching restaurants: ${status}`);
        }
      });
    }
  };

  useEffect(() => {
    if (isLoaded && userLocation) {
      searchRestaurants();
    }
  }, [isLoaded, userLocation, searchRadius]);

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p className="font-bold flex items-center"><AlertCircle className="mr-2" /> Error Loading Google Maps</p>
          <p>{loadError.message}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Restaurant Finder</h1>
      {error && (
        <div className="mb-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
          <p className="font-bold flex items-center"><Info className="mr-2" /> Notice</p>
          <p>{error}</p>
        </div>
      )}
      <div className="mb-4">
        <label htmlFor="radius" className="block text-sm font-medium text-gray-700">Search Radius (meters)</label>
        <input
          type="number"
          id="radius"
          value={searchRadius}
          onChange={(e) => setSearchRadius(Number(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        <button
          onClick={searchRestaurants}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Search
        </button>
      </div>
      {userLocation ? (
        <div className="mb-4">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={userLocation}
            zoom={14}
          >
            <Marker position={userLocation} icon={{url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'}} />
            {restaurants.map((restaurant) => (
              <Marker
                key={restaurant.id}
                position={restaurant.geometry.location}
                onClick={() => setSelectedRestaurant(restaurant)}
              />
            ))}
          </GoogleMap>
        </div>
      ) : (
        <div className="mb-4 text-center">Loading map...</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {restaurants.map((restaurant) => (
          <div key={restaurant.id} className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">{restaurant.name}</h2>
            <p className="text-gray-600 flex items-center">
              <MapPin className="mr-2" size={16} />
              {restaurant.vicinity}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;