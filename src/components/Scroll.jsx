import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const Scroll = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Ye line screen ko top par bhej degi smoothly
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // Ya "smooth" bhi use kar sakte ho
    });
  }, [pathname]); // Jab bhi path badlega, ye chalega

  return null;
};

export default Scroll;