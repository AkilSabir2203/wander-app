interface FormattedCity {
  value: string;
  label: string;
  country: string;
  latlng: [number, number];
  state?: string;
}

const curatedCities: FormattedCity[] = [
  { value: "Bengaluru-IN", label: "Bengaluru", country: "IN", state: "Karnataka", latlng: [12.9716, 77.5946] },
  { value: "Mumbai-IN", label: "Mumbai", country: "IN", state: "Maharashtra", latlng: [19.076, 72.8777] },
  { value: "Delhi-IN", label: "Delhi", country: "IN", state: "Delhi", latlng: [28.6139, 77.209] },
  { value: "Goa-IN", label: "Goa", country: "IN", state: "Goa", latlng: [15.2993, 74.124] },
  { value: "Shimla-IN", label: "Shimla", country: "IN", state: "Himachal Pradesh", latlng: [31.1048, 77.1734] },
  { value: "Manali-IN", label: "Manali", country: "IN", state: "Himachal Pradesh", latlng: [32.2396, 77.1887] },
  { value: "New York-US", label: "New York", country: "US", state: "New York", latlng: [40.7128, -74.006] },
  { value: "Los Angeles-US", label: "Los Angeles", country: "US", state: "California", latlng: [34.0522, -118.2437] },
  { value: "London-GB", label: "London", country: "GB", state: "England", latlng: [51.5074, -0.1278] },
  { value: "Paris-FR", label: "Paris", country: "FR", state: "Île-de-France", latlng: [48.8566, 2.3522] },
  { value: "Dubai-AE", label: "Dubai", country: "AE", state: "Dubai", latlng: [25.2048, 55.2708] },
  { value: "Singapore-SG", label: "Singapore", country: "SG", state: "Singapore", latlng: [1.3521, 103.8198] },
  { value: "Sydney-AU", label: "Sydney", country: "AU", state: "New South Wales", latlng: [-33.8688, 151.2093] },
  { value: "Tokyo-JP", label: "Tokyo", country: "JP", state: "Tokyo", latlng: [35.6762, 139.6503] },
  { value: "Cape Town-ZA", label: "Cape Town", country: "ZA", state: "Western Cape", latlng: [-33.9249, 18.4241] },
];

const allFormattedCities = curatedCities;
const formattedCities = curatedCities;

const useCities = () => {
  const getAll = () => formattedCities;

  const getByValue = (value: string) => {
    if (!value) {
      return undefined;
    }

    const exactMatch = allFormattedCities.find((item) => item.value === value);

    if (exactMatch) {
      return exactMatch;
    }

    const fallbackMatch = allFormattedCities.find((item) => {
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
