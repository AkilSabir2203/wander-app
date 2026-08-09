import cities from "cities.json";

interface City {
  name: string;
  country: string;
  lat: number | string;
  lng: number | string;
  subcountry?: string;
}

interface FormattedCity {
  value: string;
  label: string;
  country: string;
  latlng: [number, number];
  state?: string;
}

const rawCities = cities as City[];

const formattedCities: FormattedCity[] = rawCities.map((city) => ({
  value: `${city.name}-${city.country}`, // unique id
  label: city.name,                      // shown in dropdown
  country: city.country,                 // ISO code (IN / US / JP…)
  state: city.subcountry,                // optional
  latlng: [Number(city.lat), Number(city.lng)], // for the map
}));

const useCities = () => {
  const getAll = () => formattedCities;

  const getByValue = (value: string) => {
    return formattedCities.find((item) => item.value === value);
  };

  return {
    getAll,
    getByValue,
  };
};

export default useCities;
