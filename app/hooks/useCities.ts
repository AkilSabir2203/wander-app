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
    if (!value) {
      return undefined;
    }

    const exactMatch = formattedCities.find((item) => item.value === value);

    if (exactMatch) {
      return exactMatch;
    }

    const fallbackMatch = formattedCities.find((item) => {
      const normalizedValue = value.toLowerCase();
      const normalizedLabel = item.label.toLowerCase();
      const normalizedCountry = item.country.toLowerCase();

      return (
        normalizedValue.includes(normalizedLabel) ||
        normalizedLabel.includes(normalizedValue) ||
        normalizedValue.includes(normalizedCountry) ||
        normalizedCountry.includes(normalizedValue)
      );
    });

    return fallbackMatch;
  };

  return {
    getAll,
    getByValue,
  };
};

export default useCities;
