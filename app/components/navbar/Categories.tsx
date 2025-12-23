"use client";

import Container from "../Container";
import { FaUmbrellaBeach } from "react-icons/fa";
import { FaMountain } from "react-icons/fa";
import { FaSwimmingPool } from "react-icons/fa";
import { GiBarn } from "react-icons/gi";
import { GiBoatFishing } from "react-icons/gi";
import { GiCactus } from "react-icons/gi";
import { GiCastle } from "react-icons/gi";
import { GiCaveEntrance } from "react-icons/gi";
import { GiForestCamp } from "react-icons/gi";
import { GiIsland } from "react-icons/gi";
import { GiWindmill } from "react-icons/gi";
import { FaSkiing } from "react-icons/fa";
import { GiCutDiamond } from "react-icons/gi";
import { FaHome } from "react-icons/fa";
import { FaSnowflake } from "react-icons/fa";
import CategoryBox from "../CategoryBox";
import { usePathname, useSearchParams } from "next/navigation";


export const categories = [
   {
      label: "Beach",
      icon: FaUmbrellaBeach,
      description: "This property is close to the beach",
   },
   {
      label: "Windmills",
      icon: GiWindmill,
      description: "This property has windmill",
   },
   {
      label: "Modern",
      icon: FaHome,
      description: "This property is modern",
   },
   {
      label: "Countryside",
      icon: FaMountain,
      description: "This property is mountain",
   },
   {
      label: "Pools",
      icon: FaSwimmingPool,
      description: "This property has a pool",
   },
   {
      label: "Islands",
      icon: GiIsland,
      description: "This property is on Island",
   },
   {
      label: "Lake",
      icon: GiBoatFishing,
      description: "This property is close to the lake",
   },
   {
      label: "Skiing",
      icon: FaSkiing,
      description: "This property has skiing activities",
   },
   {
      label: "Castles",
      icon: GiCastle,
      description: "This property is in a castle",
   },
   {
      label: "Camping",
      icon: GiForestCamp,
      description: "This property has camping activities",
   },
   {
      label: "Arctic",
      icon: FaSnowflake,
      description: "This property is newar arctic",
   },
   {
      label: "Cave",
      icon: GiCaveEntrance,
      description: "This property has cave tours",
   },
   {
      label: "Desert",
      icon: GiCactus,
      description: "This property is in the desert",
   },
   {
      label: "Barns",
      icon: GiBarn,
      description: "This property is in the barn",
   },
   {
      label: "Lux",
      icon: GiCutDiamond,
      description: "This property is luxurious",
   },
];



const Categories = () => {
    const params = useSearchParams();
    const category = params?.get('category');
    const pathname = usePathname();

    const isMainPage = pathname === '/';

    if(!isMainPage) {
        return null;
    }
    return (
        <Container>
            <div className="p-4 flex flex-row items-center justify-between overflow-x-auto">
                {categories.map((item) => (
                    <CategoryBox key={item.label} label={item.label} selected={category === item.label} icon={item.icon}/>
                ))}
            </div>                
        </Container>
    )
}

export default Categories;