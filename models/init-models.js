import AirportList from "./airport_list.js";
import Cities from "./cities.js";
import Hotel from "./hotel.js";
import Package from "./Package.js";
import User from "./User.js";

export default function initModels() {
  return {
    airport_list: AirportList,
    cities: Cities,
    hotel: Hotel,
    packages: Package,
    users: User,
  };
}
