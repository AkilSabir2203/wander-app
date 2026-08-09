import cities from "cities.json";

interface City {
  name: string;
  country: string;
  lat: number | string;
  lng: number | string;
  admin1?: string;
  admin2?: string;
}

interface FormattedCity {
  value: string;
  label: string;
  country: string;
  latlng: [number, number];
  state?: string;
}

const rawCities = cities as City[];

const formattedCities: FormattedCity[] = rawCities
  .filter((city) => city.name && city.country)
  .map((city) => ({
    value: `${city.name}-${city.country}`,
    label: city.name,
    country: city.country,
    state: [city.admin1, city.admin2].filter(Boolean).join(", ") || undefined,
    latlng: [Number(city.lat), Number(city.lng)],
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
