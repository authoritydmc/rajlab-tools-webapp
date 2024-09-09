// getIconByName.js

import { FaCog} from "react-icons/fa";
import iconMap from "./iconMap";

const getIconByName = (iconName) => {
  const IconComponent = iconMap[iconName];
  if (IconComponent) {
    return <IconComponent />;
  } else {
   
    return <FaCog/> ;
  }
};

export default getIconByName;
