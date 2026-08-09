"use client";

import useCities from "@/app/hooks/useCities";
import Select from "react-select";

export type CountrySelectValue = {
   value: string;
   label: string;
   country: string;
   latlng: number[];
   state?: string;
};

interface CountrySelectProps {
   value?: CountrySelectValue | null;
   onChange: (value: CountrySelectValue | null) => void;
}

const CountrySelect: React.FC<CountrySelectProps> = ({ value, onChange }) => {
   const { getAll } = useCities();
   const options = getAll();

   return (
      <div>
         <Select
            placeholder="Anywhere"
            isClearable
            options={options}
            value={value ?? null}
            onChange={(selectedValue) => onChange(selectedValue as CountrySelectValue | null)}
            getOptionLabel={(option) => `${option.label}${option.state ? `, ${option.state}` : ""}`}
            getOptionValue={(option) => option.value}
            classNames={{
               control: () => "p-3 border-2",
               input: () => "text-lg",
               option: () => "text-lg",
            }}
            theme={(theme) => ({
               ...theme,
               borderRadius: 6,
               colors: {
                  ...theme.colors,
                  primary: "black",
                  primary25: "#ffe4e6",
               },
            })}
         />
      </div>
   );
};
export default CountrySelect;