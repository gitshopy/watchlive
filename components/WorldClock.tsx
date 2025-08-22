"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Maximize2, Minimize2, X, Search, Clock, Globe, Settings } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Flag from "react-flagkit"
import ReactClock from "react-clock"
import "react-clock/dist/Clock.css"

interface WorldClockProps {
  currentTime: Date
  getGlassStyle: () => React.CSSProperties
  themeStyles: any
}

interface Timezone {
  name: string
  timezone: string
  country: string
}

interface CustomTimezone {
  name: string
  timezone: string
  abbreviation: string
}

// Comprehensive world timezone data
const WORLD_TIMEZONES = [
  // North America
  { name: "New York", timezone: "America/New_York", country: "USA" },
  { name: "Los Angeles", timezone: "America/Los_Angeles", country: "USA" },
  { name: "Chicago", timezone: "America/Chicago", country: "USA" },
  { name: "Toronto", timezone: "America/Toronto", country: "Canada" },
  { name: "Vancouver", timezone: "America/Vancouver", country: "Canada" },
  { name: "Mexico City", timezone: "America/Mexico_City", country: "Mexico" },
  { name: "Houston", timezone: "America/Chicago", country: "USA" },
  { name: "Phoenix", timezone: "America/Phoenix", country: "USA" },
  { name: "Denver", timezone: "America/Denver", country: "USA" },
  { name: "Seattle", timezone: "America/Los_Angeles", country: "USA" },
  { name: "Miami", timezone: "America/New_York", country: "USA" },
  { name: "Atlanta", timezone: "America/New_York", country: "USA" },
  { name: "Boston", timezone: "America/New_York", country: "USA" },
  { name: "Detroit", timezone: "America/New_York", country: "USA" },
  { name: "Philadelphia", timezone: "America/New_York", country: "USA" },
  { name: "Washington DC", timezone: "America/New_York", country: "USA" },
  { name: "Dallas", timezone: "America/Chicago", country: "USA" },
  { name: "San Francisco", timezone: "America/Los_Angeles", country: "USA" },
  { name: "Las Vegas", timezone: "America/Los_Angeles", country: "USA" },
  { name: "Portland", timezone: "America/Los_Angeles", country: "USA" },
  { name: "San Diego", timezone: "America/Los_Angeles", country: "USA" },
  { name: "Minneapolis", timezone: "America/Chicago", country: "USA" },
  { name: "Kansas City", timezone: "America/Chicago", country: "USA" },
  { name: "St. Louis", timezone: "America/Chicago", country: "USA" },
  { name: "New Orleans", timezone: "America/Chicago", country: "USA" },
  { name: "Nashville", timezone: "America/Chicago", country: "USA" },
  { name: "Charlotte", timezone: "America/New_York", country: "USA" },
  { name: "Orlando", timezone: "America/New_York", country: "USA" },
  { name: "Tampa", timezone: "America/New_York", country: "USA" },
  { name: "Jacksonville", timezone: "America/New_York", country: "USA" },
  { name: "Austin", timezone: "America/Chicago", country: "USA" },
  { name: "San Antonio", timezone: "America/Chicago", country: "USA" },
  { name: "Fort Worth", timezone: "America/Chicago", country: "USA" },
  { name: "Columbus", timezone: "America/New_York", country: "USA" },
  { name: "Indianapolis", timezone: "America/New_York", country: "USA" },
  { name: "Milwaukee", timezone: "America/Chicago", country: "USA" },
  { name: "Oklahoma City", timezone: "America/Chicago", country: "USA" },
  { name: "Tulsa", timezone: "America/Chicago", country: "USA" },
  { name: "Wichita", timezone: "America/Chicago", country: "USA" },
  { name: "Omaha", timezone: "America/Chicago", country: "USA" },
  { name: "Des Moines", timezone: "America/Chicago", country: "USA" },
  { name: "St. Paul", timezone: "America/Chicago", country: "USA" },
  { name: "Cleveland", timezone: "America/New_York", country: "USA" },
  { name: "Cincinnati", timezone: "America/New_York", country: "USA" },
  { name: "Pittsburgh", timezone: "America/New_York", country: "USA" },
  { name: "Buffalo", timezone: "America/New_York", country: "USA" },
  { name: "Rochester", timezone: "America/New_York", country: "USA" },
  { name: "Syracuse", timezone: "America/New_York", country: "USA" },
  { name: "Albany", timezone: "America/New_York", country: "USA" },
  { name: "Hartford", timezone: "America/New_York", country: "USA" },
  { name: "Providence", timezone: "America/New_York", country: "USA" },
  { name: "Manchester", timezone: "America/New_York", country: "USA" },
  { name: "Burlington", timezone: "America/New_York", country: "USA" },
  { name: "Montreal", timezone: "America/Toronto", country: "Canada" },
  { name: "Ottawa", timezone: "America/Toronto", country: "Canada" },
  { name: "Calgary", timezone: "America/Edmonton", country: "Canada" },
  { name: "Edmonton", timezone: "America/Edmonton", country: "Canada" },
  { name: "Winnipeg", timezone: "America/Winnipeg", country: "Canada" },
  { name: "Quebec City", timezone: "America/Toronto", country: "Canada" },
  { name: "Halifax", timezone: "America/Halifax", country: "Canada" },
  { name: "St. John's", timezone: "America/St_Johns", country: "Canada" },
  { name: "Whitehorse", timezone: "America/Whitehorse", country: "Canada" },
  { name: "Yellowknife", timezone: "America/Yellowknife", country: "Canada" },
  { name: "Iqaluit", timezone: "America/Iqaluit", country: "Canada" },
  { name: "Guadalajara", timezone: "America/Mexico_City", country: "Mexico" },
  { name: "Monterrey", timezone: "America/Mexico_City", country: "Mexico" },
  { name: "Puebla", timezone: "America/Mexico_City", country: "Mexico" },
  { name: "Tijuana", timezone: "America/Tijuana", country: "Mexico" },
  { name: "Cancun", timezone: "America/Cancun", country: "Mexico" },
  { name: "Acapulco", timezone: "America/Mexico_City", country: "Mexico" },
  { name: "Mazatlan", timezone: "America/Mazatlan", country: "Mexico" },
  { name: "Puerto Vallarta", timezone: "America/Mexico_City", country: "Mexico" },
  { name: "Havana", timezone: "America/Havana", country: "Cuba" },
  { name: "Santo Domingo", timezone: "America/Santo_Domingo", country: "Dominican Republic" },
  { name: "San Juan", timezone: "America/Puerto_Rico", country: "Puerto Rico" },
  { name: "Kingston", timezone: "America/Jamaica", country: "Jamaica" },
  { name: "Port-au-Prince", timezone: "America/Port-au-Prince", country: "Haiti" },
  { name: "Nassau", timezone: "America/Nassau", country: "Bahamas" },
  { name: "Bridgetown", timezone: "America/Barbados", country: "Barbados" },
  { name: "Port of Spain", timezone: "America/Port_of_Spain", country: "Trinidad and Tobago" },
  { name: "Georgetown", timezone: "America/Guyana", country: "Guyana" },
  { name: "Paramaribo", timezone: "America/Paramaribo", country: "Suriname" },
  { name: "Cayenne", timezone: "America/Cayenne", country: "French Guiana" },
  { name: "Brasilia", timezone: "America/Sao_Paulo", country: "Brazil" },
  { name: "Rio de Janeiro", timezone: "America/Sao_Paulo", country: "Brazil" },
  { name: "Salvador", timezone: "America/Bahia", country: "Brazil" },
  { name: "Recife", timezone: "America/Recife", country: "Brazil" },
  { name: "Fortaleza", timezone: "America/Fortaleza", country: "Brazil" },
  { name: "Belo Horizonte", timezone: "America/Sao_Paulo", country: "Brazil" },
  { name: "Curitiba", timezone: "America/Sao_Paulo", country: "Brazil" },
  { name: "Porto Alegre", timezone: "America/Sao_Paulo", country: "Brazil" },
  { name: "Manaus", timezone: "America/Manaus", country: "Brazil" },
  { name: "Belem", timezone: "America/Belem", country: "Brazil" },
  { name: "Buenos Aires", timezone: "America/Argentina/Buenos_Aires", country: "Argentina" },
  { name: "Cordoba", timezone: "America/Argentina/Cordoba", country: "Argentina" },
  { name: "Rosario", timezone: "America/Argentina/Buenos_Aires", country: "Argentina" },
  { name: "Mendoza", timezone: "America/Argentina/Mendoza", country: "Argentina" },
  { name: "La Plata", timezone: "America/Argentina/Buenos_Aires", country: "Argentina" },
  { name: "Tucuman", timezone: "America/Argentina/Tucuman", country: "Argentina" },
  { name: "Salta", timezone: "America/Argentina/Salta", country: "Argentina" },
  { name: "San Luis", timezone: "America/Argentina/San_Luis", country: "Argentina" },
  { name: "Neuquen", timezone: "America/Argentina/Salta", country: "Argentina" },
  { name: "Comodoro Rivadavia", timezone: "America/Argentina/Catamarca", country: "Argentina" },
  { name: "Ushuaia", timezone: "America/Argentina/Ushuaia", country: "Argentina" },
  { name: "Santiago", timezone: "America/Santiago", country: "Chile" },
  { name: "Valparaiso", timezone: "America/Santiago", country: "Chile" },
  { name: "Concepcion", timezone: "America/Santiago", country: "Chile" },
  { name: "La Serena", timezone: "America/Santiago", country: "Chile" },
  { name: "Antofagasta", timezone: "America/Santiago", country: "Chile" },
  { name: "Iquique", timezone: "America/Santiago", country: "Chile" },
  { name: "Arica", timezone: "America/Santiago", country: "Chile" },
  { name: "Punta Arenas", timezone: "America/Punta_Arenas", country: "Chile" },
  { name: "Easter Island", timezone: "Pacific/Easter", country: "Chile" },
  { name: "Lima", timezone: "America/Lima", country: "Peru" },
  { name: "Arequipa", timezone: "America/Lima", country: "Peru" },
  { name: "Trujillo", timezone: "America/Lima", country: "Peru" },
  { name: "Chiclayo", timezone: "America/Lima", country: "Peru" },
  { name: "Piura", timezone: "America/Lima", country: "Peru" },
  { name: "Iquitos", timezone: "America/Lima", country: "Peru" },
  { name: "Cusco", timezone: "America/Lima", country: "Peru" },
  { name: "Puno", timezone: "America/Lima", country: "Peru" },
  { name: "Tacna", timezone: "America/Lima", country: "Peru" },
  { name: "Bogota", timezone: "America/Bogota", country: "Colombia" },
  { name: "Medellin", timezone: "America/Bogota", country: "Colombia" },
  { name: "Cali", timezone: "America/Bogota", country: "Colombia" },
  { name: "Barranquilla", timezone: "America/Bogota", country: "Colombia" },
  { name: "Cartagena", timezone: "America/Bogota", country: "Colombia" },
  { name: "Bucaramanga", timezone: "America/Bogota", country: "Colombia" },
  { name: "Pereira", timezone: "America/Bogota", country: "Colombia" },
  { name: "Manizales", timezone: "America/Bogota", country: "Colombia" },
  { name: "Pasto", timezone: "America/Bogota", country: "Colombia" },
  { name: "Neiva", timezone: "America/Bogota", country: "Colombia" },
  { name: "Villavicencio", timezone: "America/Bogota", country: "Colombia" },
  { name: "Monteria", timezone: "America/Bogota", country: "Colombia" },
  { name: "Valledupar", timezone: "America/Bogota", country: "Colombia" },
  { name: "Popayan", timezone: "America/Bogota", country: "Colombia" },
  { name: "Tunja", timezone: "America/Bogota", country: "Colombia" },
  { name: "Florencia", timezone: "America/Bogota", country: "Colombia" },
  { name: "Yopal", timezone: "America/Bogota", country: "Colombia" },
  { name: "Mitu", timezone: "America/Bogota", country: "Colombia" },
  { name: "Leticia", timezone: "America/Bogota", country: "Colombia" },
  { name: "San Andres", timezone: "America/Bogota", country: "Colombia" },
  { name: "Quito", timezone: "America/Guayaquil", country: "Ecuador" },
  { name: "Guayaquil", timezone: "America/Guayaquil", country: "Ecuador" },
  { name: "Cuenca", timezone: "America/Guayaquil", country: "Ecuador" },
  { name: "Manta", timezone: "America/Guayaquil", country: "Ecuador" },
  { name: "Machala", timezone: "America/Guayaquil", country: "Ecuador" },
  { name: "Portoviejo", timezone: "America/Guayaquil", country: "Ecuador" },
  { name: "Loja", timezone: "America/Guayaquil", country: "Ecuador" },
  { name: "Ambato", timezone: "America/Guayaquil", country: "Ecuador" },
  { name: "Ibarra", timezone: "America/Guayaquil", country: "Ecuador" },
  { name: "Tulcan", timezone: "America/Guayaquil", country: "Ecuador" },
  { name: "Esmeraldas", timezone: "America/Guayaquil", country: "Ecuador" },
  { name: "Tena", timezone: "America/Guayaquil", country: "Ecuador" },
  { name: "Macas", timezone: "America/Guayaquil", country: "Ecuador" },
  { name: "Zamora", timezone: "America/Guayaquil", country: "Ecuador" },
  { name: "Galapagos", timezone: "Pacific/Galapagos", country: "Ecuador" },
  { name: "Caracas", timezone: "America/Caracas", country: "Venezuela" },
  { name: "Maracaibo", timezone: "America/Caracas", country: "Venezuela" },
  { name: "Valencia", timezone: "America/Caracas", country: "Venezuela" },
  { name: "Barquisimeto", timezone: "America/Caracas", country: "Venezuela" },
  { name: "Maracay", timezone: "America/Caracas", country: "Venezuela" },
  { name: "Ciudad Guayana", timezone: "America/Caracas", country: "Venezuela" },
  { name: "San Cristobal", timezone: "America/Caracas", country: "Venezuela" },
  { name: "Maturin", timezone: "America/Caracas", country: "Venezuela" },
  { name: "Barcelona", timezone: "America/Caracas", country: "Venezuela" },
  { name: "Puerto La Cruz", timezone: "America/Caracas", country: "Venezuela" },
  { name: "Cumana", timezone: "America/Caracas", country: "Venezuela" },
  { name: "Merida", timezone: "America/Caracas", country: "Venezuela" },
  { name: "Barinas", timezone: "America/Caracas", country: "Venezuela" },
  { name: "Acarigua", timezone: "America/Caracas", country: "Venezuela" },
  { name: "Guanare", timezone: "America/Caracas", country: "Venezuela" },
  { name: "San Fernando", timezone: "America/Caracas", country: "Venezuela" },
  { name: "Ciudad Bolivar", timezone: "America/Caracas", country: "Venezuela" },
  { name: "Puerto Ayacucho", timezone: "America/Caracas", country: "Venezuela" },
  { name: "La Asuncion", timezone: "America/Caracas", country: "Venezuela" },
  { name: "Porlamar", timezone: "America/Caracas", country: "Venezuela" },
  { name: "La Guaira", timezone: "America/Caracas", country: "Venezuela" },
  { name: "Puerto Cabello", timezone: "America/Caracas", country: "Venezuela" },
  
  // Europe
  { name: "London", timezone: "Europe/London", country: "UK" },
  { name: "Paris", timezone: "Europe/Paris", country: "France" },
  { name: "Berlin", timezone: "Europe/Berlin", country: "Germany" },
  { name: "Rome", timezone: "Europe/Rome", country: "Italy" },
  { name: "Madrid", timezone: "Europe/Madrid", country: "Spain" },
  { name: "Amsterdam", timezone: "Europe/Amsterdam", country: "Netherlands" },
  { name: "Moscow", timezone: "Europe/Moscow", country: "Russia" },
  { name: "Vienna", timezone: "Europe/Vienna", country: "Austria" },
  { name: "Prague", timezone: "Europe/Prague", country: "Czech Republic" },
  { name: "Warsaw", timezone: "Europe/Warsaw", country: "Poland" },
  { name: "Budapest", timezone: "Europe/Budapest", country: "Hungary" },
  { name: "Bucharest", timezone: "Europe/Bucharest", country: "Romania" },
  { name: "Sofia", timezone: "Europe/Sofia", country: "Bulgaria" },
  { name: "Belgrade", timezone: "Europe/Belgrade", country: "Serbia" },
  { name: "Zagreb", timezone: "Europe/Zagreb", country: "Croatia" },
  { name: "Ljubljana", timezone: "Europe/Ljubljana", country: "Slovenia" },
  { name: "Bratislava", timezone: "Europe/Bratislava", country: "Slovakia" },
  { name: "Vilnius", timezone: "Europe/Vilnius", country: "Lithuania" },
  { name: "Riga", timezone: "Europe/Riga", country: "Latvia" },
  { name: "Tallinn", timezone: "Europe/Tallinn", country: "Estonia" },
  { name: "Helsinki", timezone: "Europe/Helsinki", country: "Finland" },
  { name: "Stockholm", timezone: "Europe/Stockholm", country: "Sweden" },
  { name: "Oslo", timezone: "Europe/Oslo", country: "Norway" },
  { name: "Copenhagen", timezone: "Europe/Copenhagen", country: "Denmark" },
  { name: "Reykjavik", timezone: "Atlantic/Reykjavik", country: "Iceland" },
  { name: "Dublin", timezone: "Europe/Dublin", country: "Ireland" },
  { name: "Edinburgh", timezone: "Europe/London", country: "Scotland" },
  { name: "Cardiff", timezone: "Europe/London", country: "Wales" },
  { name: "Belfast", timezone: "Europe/London", country: "Northern Ireland" },
  { name: "Brussels", timezone: "Europe/Brussels", country: "Belgium" },
  { name: "Luxembourg", timezone: "Europe/Luxembourg", country: "Luxembourg" },
  { name: "Bern", timezone: "Europe/Zurich", country: "Switzerland" },
  { name: "Zurich", timezone: "Europe/Zurich", country: "Switzerland" },
  { name: "Geneva", timezone: "Europe/Zurich", country: "Switzerland" },
  { name: "Monaco", timezone: "Europe/Monaco", country: "Monaco" },
  { name: "Vatican City", timezone: "Europe/Rome", country: "Vatican" },
  { name: "San Marino", timezone: "Europe/Rome", country: "San Marino" },
  { name: "Andorra", timezone: "Europe/Madrid", country: "Andorra" },
  { name: "Gibraltar", timezone: "Europe/Gibraltar", country: "Gibraltar" },
  { name: "Malta", timezone: "Europe/Malta", country: "Malta" },
  { name: "Cyprus", timezone: "Asia/Nicosia", country: "Cyprus" },
  { name: "Greece", timezone: "Europe/Athens", country: "Greece" },
  { name: "Albania", timezone: "Europe/Tirane", country: "Albania" },
  { name: "North Macedonia", timezone: "Europe/Skopje", country: "North Macedonia" },
  { name: "Kosovo", timezone: "Europe/Belgrade", country: "Kosovo" },
  { name: "Montenegro", timezone: "Europe/Podgorica", country: "Montenegro" },
  { name: "Bosnia", timezone: "Europe/Sarajevo", country: "Bosnia" },
  { name: "Moldova", timezone: "Europe/Chisinau", country: "Moldova" },
  { name: "Ukraine", timezone: "Europe/Kiev", country: "Ukraine" },
  { name: "Belarus", timezone: "Europe/Minsk", country: "Belarus" },
  { name: "Latvia", timezone: "Europe/Riga", country: "Latvia" },
  { name: "Estonia", timezone: "Europe/Tallinn", country: "Estonia" },
  
  // Asia
  { name: "Tokyo", timezone: "Asia/Tokyo", country: "Japan" },
  { name: "Beijing", timezone: "Asia/Shanghai", country: "China" },
  { name: "Seoul", timezone: "Asia/Seoul", country: "South Korea" },
  { name: "Singapore", timezone: "Asia/Singapore", country: "Singapore" },
  { name: "Dubai", timezone: "Asia/Dubai", country: "UAE" },
  { name: "Mumbai", timezone: "Asia/Kolkata", country: "India" },
  { name: "Jakarta", timezone: "Asia/Jakarta", country: "Indonesia" },
  { name: "Bangkok", timezone: "Asia/Bangkok", country: "Thailand" },
  { name: "Manila", timezone: "Asia/Manila", country: "Philippines" },
  { name: "Kuala Lumpur", timezone: "Asia/Kuala_Lumpur", country: "Malaysia" },
  { name: "Hanoi", timezone: "Asia/Ho_Chi_Minh", country: "Vietnam" },
  { name: "Phnom Penh", timezone: "Asia/Phnom_Penh", country: "Cambodia" },
  { name: "Yangon", timezone: "Asia/Yangon", country: "Myanmar" },
  { name: "Vientiane", timezone: "Asia/Vientiane", country: "Laos" },
  { name: "Dhaka", timezone: "Asia/Dhaka", country: "Bangladesh" },
  { name: "Kathmandu", timezone: "Asia/Kathmandu", country: "Nepal" },
  { name: "Colombo", timezone: "Asia/Colombo", country: "Sri Lanka" },
  { name: "Male", timezone: "Indian/Maldives", country: "Maldives" },
  { name: "Thimphu", timezone: "Asia/Thimphu", country: "Bhutan" },
  { name: "Ulaanbaatar", timezone: "Asia/Ulaanbaatar", country: "Mongolia" },
  { name: "Pyongyang", timezone: "Asia/Pyongyang", country: "North Korea" },
  { name: "Astana", timezone: "Asia/Almaty", country: "Kazakhstan" },
  { name: "Tashkent", timezone: "Asia/Tashkent", country: "Uzbekistan" },
  { name: "Bishkek", timezone: "Asia/Bishkek", country: "Kyrgyzstan" },
  { name: "Dushanbe", timezone: "Asia/Dushanbe", country: "Tajikistan" },
  { name: "Ashgabat", timezone: "Asia/Ashgabat", country: "Turkmenistan" },
  { name: "Tehran", timezone: "Asia/Tehran", country: "Iran" },
  { name: "Baghdad", timezone: "Asia/Baghdad", country: "Iraq" },
  { name: "Riyadh", timezone: "Asia/Riyadh", country: "Saudi Arabia" },
  { name: "Kuwait City", timezone: "Asia/Kuwait", country: "Kuwait" },
  { name: "Doha", timezone: "Asia/Qatar", country: "Qatar" },
  { name: "Manama", timezone: "Asia/Bahrain", country: "Bahrain" },
  { name: "Muscat", timezone: "Asia/Muscat", country: "Oman" },
  { name: "Sanaa", timezone: "Asia/Aden", country: "Yemen" },
  { name: "Amman", timezone: "Asia/Amman", country: "Jordan" },
  { name: "Beirut", timezone: "Asia/Beirut", country: "Lebanon" },
  { name: "Damascus", timezone: "Asia/Damascus", country: "Syria" },
  { name: "Jerusalem", timezone: "Asia/Jerusalem", country: "Israel" },
  { name: "Gaza", timezone: "Asia/Gaza", country: "Palestine" },
  { name: "Ankara", timezone: "Europe/Istanbul", country: "Turkey" },
  { name: "Baku", timezone: "Asia/Baku", country: "Azerbaijan" },
  { name: "Yerevan", timezone: "Asia/Yerevan", country: "Armenia" },
  { name: "Tbilisi", timezone: "Asia/Tbilisi", country: "Georgia" },
  
  // Australia & Oceania
  { name: "Sydney", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Melbourne", timezone: "Australia/Melbourne", country: "Australia" },
  { name: "Brisbane", timezone: "Australia/Brisbane", country: "Australia" },
  { name: "Perth", timezone: "Australia/Perth", country: "Australia" },
  { name: "Adelaide", timezone: "Australia/Adelaide", country: "Australia" },
  { name: "Canberra", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Darwin", timezone: "Australia/Darwin", country: "Australia" },
  { name: "Hobart", timezone: "Australia/Hobart", country: "Australia" },
  { name: "Gold Coast", timezone: "Australia/Brisbane", country: "Australia" },
  { name: "Newcastle", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Wollongong", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Geelong", timezone: "Australia/Melbourne", country: "Australia" },
  { name: "Townsville", timezone: "Australia/Brisbane", country: "Australia" },
  { name: "Cairns", timezone: "Australia/Brisbane", country: "Australia" },
  { name: "Toowoomba", timezone: "Australia/Brisbane", country: "Australia" },
  { name: "Ballarat", timezone: "Australia/Melbourne", country: "Australia" },
  { name: "Bendigo", timezone: "Australia/Melbourne", country: "Australia" },
  { name: "Albury", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Wagga Wagga", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Coffs Harbour", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Port Macquarie", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Tamworth", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Orange", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Dubbo", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Bathurst", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Armidale", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Lismore", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Grafton", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Taree", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Kempsey", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Forster", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Nelson Bay", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Maitland", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Cessnock", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Singleton", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Muswellbrook", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Scone", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Gunnedah", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Narrabri", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Moree", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Inverell", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Glen Innes", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Tenterfield", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Kyogle", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Casino", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Ballina", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Byron Bay", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Mullumbimby", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Brunswick Heads", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Yamba", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Evans Head", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Woolgoolga", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Sawtell", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Bellingen", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Dorrigo", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Guyra", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Uralla", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Walcha", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Nundle", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Quirindi", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Werris Creek", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Auckland", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Christchurch", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Dunedin", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Hamilton", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Tauranga", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Napier", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Palmerston North", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Rotorua", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "New Plymouth", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Whangarei", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Invercargill", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Nelson", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Blenheim", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Timaru", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Gisborne", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Whanganui", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Pukekohe", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Papakura", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Manukau", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "North Shore", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Waitakere", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Hibiscus Coast", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Franklin", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Rodney", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Papatoetoe", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Manurewa", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Otara", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Mangere", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Pakuranga", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Howick", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Botany Downs", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Flat Bush", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Orere Point", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Beachlands", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Maraetai", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Whitford", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Clevedon", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Waiuku", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Tuakau", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Pokeno", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Bombay", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Drury", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Karaka", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Takanini", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Manurewa East", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Weymouth", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Clendon", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Randwick Park", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Manukau Heights", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Wiri", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Tuhinui", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Redoubt", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Alfriston", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Conifer Grove", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Tauranga South", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Welcome Bay", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Pyes Pa", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Te Puke", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Katikati", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Waihi", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Paeroa", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Thames", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Coromandel", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Whitianga", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Tairua", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Pauanui", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Whangamata", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Waihi Beach", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Orewa", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Warkworth", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Snells Beach", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Mahurangi East", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Algies Bay", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Sandspit", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Matakana", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Gulf Harbour", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Stanmore Bay", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Manly", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Waiheke Island", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Great Barrier Island", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Kawau Island", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Rangitoto Island", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Motutapu Island", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Rakino Island", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Ponui Island", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Pakihi Island", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Motukorea Island", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Browns Island", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Motuihe Island", timezone: "Pacific/Auckland", country: "New Zealand" },
  { name: "Wellington", timezone: "Pacific/Auckland", country: "New Zealand" },
  
  // Pacific Islands
  { name: "Suva", timezone: "Pacific/Fiji", country: "Fiji" },
  { name: "Port Moresby", timezone: "Pacific/Port_Moresby", country: "Papua New Guinea" },
  { name: "Honiara", timezone: "Pacific/Guadalcanal", country: "Solomon Islands" },
  { name: "Port Vila", timezone: "Pacific/Efate", country: "Vanuatu" },
  { name: "Noumea", timezone: "Pacific/Noumea", country: "New Caledonia" },
  { name: "Papeete", timezone: "Pacific/Tahiti", country: "French Polynesia" },
  { name: "Apia", timezone: "Pacific/Apia", country: "Samoa" },
  { name: "Nuku'alofa", timezone: "Pacific/Tongatapu", country: "Tonga" },
  { name: "Majuro", timezone: "Pacific/Majuro", country: "Marshall Islands" },
  { name: "Palikir", timezone: "Pacific/Pohnpei", country: "Micronesia" },
  { name: "Koror", timezone: "Pacific/Palau", country: "Palau" },
  { name: "Yaren", timezone: "Pacific/Nauru", country: "Nauru" },
  { name: "Tarawa", timezone: "Pacific/Tarawa", country: "Kiribati" },
  { name: "Funafuti", timezone: "Pacific/Funafuti", country: "Tuvalu" },
  { name: "Pago Pago", timezone: "Pacific/Pago_Pago", country: "American Samoa" },
  { name: "Alofi", timezone: "Pacific/Niue", country: "Niue" },
  { name: "Avarua", timezone: "Pacific/Rarotonga", country: "Cook Islands" },
  { name: "Adamstown", timezone: "Pacific/Pitcairn", country: "Pitcairn Islands" },
  { name: "Hagatna", timezone: "Pacific/Guam", country: "Guam" },
  { name: "Saipan", timezone: "Pacific/Saipan", country: "Northern Mariana Islands" },
  
  // South America
  { name: "São Paulo", timezone: "America/Sao_Paulo", country: "Brazil" },
  
  // Africa
  { name: "Cairo", timezone: "Africa/Cairo", country: "Egypt" },
  { name: "Johannesburg", timezone: "Africa/Johannesburg", country: "South Africa" },
  { name: "Lagos", timezone: "Africa/Lagos", country: "Nigeria" },
  { name: "Nairobi", timezone: "Africa/Nairobi", country: "Kenya" },
  { name: "Addis Ababa", timezone: "Africa/Addis_Ababa", country: "Ethiopia" },
  { name: "Dar es Salaam", timezone: "Africa/Dar_es_Salaam", country: "Tanzania" },
  { name: "Kampala", timezone: "Africa/Kampala", country: "Uganda" },
  { name: "Khartoum", timezone: "Africa/Khartoum", country: "Sudan" },
  { name: "Kinshasa", timezone: "Africa/Kinshasa", country: "DR Congo" },
  { name: "Luanda", timezone: "Africa/Luanda", country: "Angola" },
  { name: "Maputo", timezone: "Africa/Maputo", country: "Mozambique" },
  { name: "Harare", timezone: "Africa/Harare", country: "Zimbabwe" },
  { name: "Lusaka", timezone: "Africa/Lusaka", country: "Zambia" },
  { name: "Gaborone", timezone: "Africa/Gaborone", country: "Botswana" },
  { name: "Windhoek", timezone: "Africa/Windhoek", country: "Namibia" },
  { name: "Maseru", timezone: "Africa/Maseru", country: "Lesotho" },
  { name: "Mbabane", timezone: "Africa/Mbabane", country: "Eswatini" },
  { name: "Antananarivo", timezone: "Indian/Antananarivo", country: "Madagascar" },
  { name: "Port Louis", timezone: "Indian/Mauritius", country: "Mauritius" },
  { name: "Victoria", timezone: "Indian/Mahe", country: "Seychelles" },
  { name: "Moroni", timezone: "Indian/Comoro", country: "Comoros" },
  { name: "Djibouti", timezone: "Africa/Djibouti", country: "Djibouti" },
  { name: "Asmara", timezone: "Africa/Asmara", country: "Eritrea" },
  { name: "Mogadishu", timezone: "Africa/Mogadishu", country: "Somalia" },
  { name: "Bamako", timezone: "Africa/Bamako", country: "Mali" },
  { name: "Ouagadougou", timezone: "Africa/Ouagadougou", country: "Burkina Faso" },
  { name: "Niamey", timezone: "Africa/Niamey", country: "Niger" },
  { name: "Nouakchott", timezone: "Africa/Nouakchott", country: "Mauritania" },
  { name: "Dakar", timezone: "Africa/Dakar", country: "Senegal" },
  { name: "Banjul", timezone: "Africa/Banjul", country: "Gambia" },
  { name: "Bissau", timezone: "Africa/Bissau", country: "Guinea-Bissau" },
  { name: "Conakry", timezone: "Africa/Conakry", country: "Guinea" },
  { name: "Freetown", timezone: "Africa/Freetown", country: "Sierra Leone" },
  { name: "Monrovia", timezone: "Africa/Monrovia", country: "Liberia" },
  { name: "Abidjan", timezone: "Africa/Abidjan", country: "Ivory Coast" },
  { name: "Accra", timezone: "Africa/Accra", country: "Ghana" },
  { name: "Lome", timezone: "Africa/Lome", country: "Togo" },
  { name: "Porto-Novo", timezone: "Africa/Porto-Novo", country: "Benin" },
  { name: "Yaounde", timezone: "Africa/Douala", country: "Cameroon" },
  { name: "Libreville", timezone: "Africa/Libreville", country: "Gabon" },
  { name: "Brazzaville", timezone: "Africa/Brazzaville", country: "Congo" },
  { name: "Bangui", timezone: "Africa/Bangui", country: "Central African Republic" },
  { name: "N'Djamena", timezone: "Africa/Ndjamena", country: "Chad" },
]

// Detect dark mode by reading the <html> class ("dark") and reacting to changes
function useIsDarkMode() {
  const [isDark, setIsDark] = useState(false)
  useEffect(() => {
    const root = document.documentElement
    const update = () => setIsDark(root.classList.contains("dark"))
    update()
    const observer = new MutationObserver(update)
    observer.observe(root, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])
  return isDark
}

// Custom CSS for better clock styling
const customClockStyles = `
  .react-clock {
    background: white;
    border: 3px solid #e5e7eb;
    border-radius: 50%;
    padding: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  
  .react-clock__face {
    background: white;
    border-radius: 50%;
  }
  
  .react-clock__number {
    color: #1f2937 !important;
    font-weight: 700 !important;
    font-size: 16px !important;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
  
  .react-clock__hand {
    background: #1f2937 !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  .react-clock__second-hand {
    background: #dc2626 !important;
    box-shadow: 0 2px 4px rgba(220, 38, 38, 0.3);
  }
  
  .react-clock__mark {
    background: #6b7280 !important;
  }
  
  .react-clock__mark__body {
    background: #6b7280 !important;
  }
`

export default function WorldClock({ currentTime, getGlassStyle, themeStyles }: WorldClockProps) {
  const isDark = useIsDarkMode()

  const [availableTimezones, setAvailableTimezones] = useState<Timezone[]>([])
  const [allTimezones] = useState(WORLD_TIMEZONES)
  const [filteredTimezones, setFilteredTimezones] = useState(WORLD_TIMEZONES)
  const [selectedCities, setSelectedCities] = useState<string[]>([
    "Vancouver", "New York", "London", "Tokyo"
  ])
  const [customTimezones, setCustomTimezones] = useState<CustomTimezone[]>([])
  const [newTimezone, setNewTimezone] = useState("")
  const [newTimezoneName, setNewTimezoneName] = useState("")
  const [timezoneSearch, setTimezoneSearch] = useState("")
  const [showAddTimezone, setShowAddTimezone] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState<typeof WORLD_TIMEZONES>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [suggestionTime, setSuggestionTime] = useState(new Date())
  const [currentTimeState, setCurrentTimeState] = useState(new Date())

  const [fullscreenTimebox, setFullscreenTimebox] = useState<string | null>(null)
  const [timeboxSize, setTimeboxSize] = useState<"normal" | "large">("normal")

  // Real-time clock updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeState(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Initialize filtered timezones
  useEffect(() => {
    setFilteredTimezones(WORLD_TIMEZONES)
  }, [])

  // Handle clicking outside search suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.search-container')) {
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Add timezone
  const addTimezone = () => {
    if (
      newTimezone &&
      newTimezoneName &&
      !availableTimezones.find((tz) => tz.timezone === newTimezone)
    ) {
      setAvailableTimezones([
        ...availableTimezones,
        { name: newTimezoneName, timezone: newTimezone, country: "Custom" },
      ])
      setNewTimezone("")
      setNewTimezoneName("")
      toast({
        title: "Timezone Added",
        description: `${newTimezoneName} has been added to your timezone list.`,
      })
    }
  }

  // Add custom timezone
  const addCustomTimezone = (timezone: {
    name: string
    timezone: string
    abbreviation: string
  }) => {
    const allAvailableTimezones = [
      ...availableTimezones.map((tz) => ({
        name: tz.name,
        timezone: tz.timezone,
        abbreviation: "",
      })),
      ...customTimezones,
    ]

    const exists = allAvailableTimezones.some(
      (tz) => tz.timezone === timezone.timezone
    )

    if (!exists) {
      setCustomTimezones((prev) => [...prev, timezone])
      toast({
        title: "Timezone Added!",
        description: `${timezone.name} has been added to your timezone list.`,
      })
    } else {
      toast({
        title: "Timezone Already Exists",
        description: `${timezone.name} is already in your timezone list.`,
        variant: "destructive",
      })
    }
    setTimezoneSearch("")
    setShowAddTimezone(false)
  }

  const removeTimezone = (timezoneValue: string) => {
    setAvailableTimezones(
      availableTimezones.filter((tz) => tz.timezone !== timezoneValue)
    )
    setCustomTimezones(
      customTimezones.filter((tz) => tz.timezone !== timezoneValue)
    )
    toast({
      title: "Timezone Removed",
      description: "Timezone has been removed from your list.",
    })
  }

  const toggleFullscreen = (timeboxId: string) => {
    setFullscreenTimebox((prev) => (prev === timeboxId ? null : timeboxId))
  }

  const resizeTimebox = () => {
    setTimeboxSize(timeboxSize === "normal" ? "large" : "normal")
  }

  // Search and filter timezones with IntelliSense
  const handleSearch = (searchTerm: string) => {
    setTimezoneSearch(searchTerm)
    
    if (searchTerm.trim() === "") {
      setFilteredTimezones(WORLD_TIMEZONES)
      setSearchSuggestions([])
      setShowSuggestions(false)
      setSelectedSuggestionIndex(-1)
    } else {
      const filtered = WORLD_TIMEZONES.filter(tz => 
        tz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tz.country.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredTimezones(filtered)
      
      // Generate search suggestions for IntelliSense
      const suggestions = WORLD_TIMEZONES.filter(tz => 
        tz.name.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
        tz.country.toLowerCase().startsWith(searchTerm.toLowerCase())
      ).slice(0, 8) // Limit to 8 suggestions
      
      setSearchSuggestions(suggestions)
      setShowSuggestions(suggestions.length > 0)
      setSelectedSuggestionIndex(-1)
    }
  }

  // Handle keyboard navigation for suggestions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedSuggestionIndex(prev => 
          prev < searchSuggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedSuggestionIndex >= 0 && searchSuggestions[selectedSuggestionIndex]) {
          const selected = searchSuggestions[selectedSuggestionIndex]
          setTimezoneSearch(selected.name)
          setFilteredTimezones([selected])
          setShowSuggestions(false)
          setSelectedSuggestionIndex(-1)
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        break
    }
  }

  // Select a suggestion
  const selectSuggestion = (suggestion: typeof WORLD_TIMEZONES[0]) => {
    setTimezoneSearch(suggestion.name)
    setFilteredTimezones([suggestion])
    setShowSuggestions(false)
    setSelectedSuggestionIndex(-1)
  }

  // Add city to selected cities
  const addToSelectedCities = (cityName: string) => {
    if (!selectedCities.includes(cityName)) {
      setSelectedCities([...selectedCities, cityName])
      toast({
        title: "City Added",
        description: `${cityName} has been added to your selected cities.`,
      })
    }
  }

  // Remove city from selected cities
  const removeFromSelectedCities = (cityName: string) => {
    setSelectedCities(selectedCities.filter(city => city !== cityName))
    toast({
      title: "City Removed",
      description: `${cityName} has been removed from your selected cities.`,
    })
  }

  // Get current time for a specific timezone
  const getTimeForTimezone = (timezone: string) => {
    try {
      const time = currentTimeState.toLocaleTimeString("en-US", {
        timeZone: timezone,
        hour12: true,
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit"
      })
      return time
    } catch (error) {
      console.error('Error getting time for timezone:', timezone, error)
      return "Invalid timezone"
    }
  }

  // Get current date for a specific timezone
  const getDateForTimezone = (timezone: string) => {
    try {
      const date = currentTimeState.toLocaleDateString("en-US", {
        timeZone: timezone,
        weekday: "short",
        month: "short",
        day: "numeric"
      })
      return date
    } catch (error) {
      console.error('Error getting date for timezone:', timezone, error)
      return "Invalid date"
    }
  }

  // Render flag with proper SVG icons
  const renderFlag = (country: string) => {
    // Map country names to ISO country codes for react-flagkit
    const countryCodeMap: { [key: string]: string } = {
      'USA': 'US',
      'Canada': 'CA',
      'Mexico': 'MX',
      'UK': 'GB',
      'France': 'FR',
      'Germany': 'DE',
      'Italy': 'IT',
      'Spain': 'ES',
      'Netherlands': 'NL',
      'Russia': 'RU',
      'Austria': 'AT',
      'Czech Republic': 'CZ',
      'Poland': 'PL',
      'Hungary': 'HU',
      'Romania': 'RO',
      'Bulgaria': 'BG',
      'Serbia': 'RS',
      'Croatia': 'HR',
      'Slovenia': 'SI',
      'Slovakia': 'SK',
      'Lithuania': 'LT',
      'Latvia': 'LV',
      'Estonia': 'EE',
      'Finland': 'FI',
      'Sweden': 'SE',
      'Norway': 'NO',
      'Denmark': 'DK',
      'Iceland': 'IS',
      'Ireland': 'IE',
      'Scotland': 'GB',
      'Wales': 'GB',
      'Northern Ireland': 'GB',
      'Belgium': 'BE',
      'Luxembourg': 'LU',
      'Switzerland': 'CH',
      'Monaco': 'MC',
      'Vatican': 'VA',
      'San Marino': 'SM',
      'Andorra': 'AD',
      'Gibraltar': 'GI',
      'Malta': 'MT',
      'Cyprus': 'CY',
      'Greece': 'GR',
      'Albania': 'AL',
      'North Macedonia': 'MK',
      'Kosovo': 'XK',
      'Montenegro': 'ME',
      'Bosnia': 'BA',
      'Moldova': 'MD',
      'Ukraine': 'UA',
      'Belarus': 'BY',
      'Japan': 'JP',
      'China': 'CN',
      'South Korea': 'KR',
      'Singapore': 'SG',
      'UAE': 'AE',
      'India': 'IN',
      'Indonesia': 'ID',
      'Thailand': 'TH',
      'Philippines': 'PH',
      'Malaysia': 'MY',
      'Vietnam': 'VN',
      'Cambodia': 'KH',
      'Myanmar': 'MM',
      'Laos': 'LA',
      'Bangladesh': 'BD',
      'Nepal': 'NP',
      'Sri Lanka': 'LK',
      'Maldives': 'MV',
      'Bhutan': 'BT',
      'Mongolia': 'MN',
      'North Korea': 'KP',
      'Kazakhstan': 'KZ',
      'Uzbekistan': 'UZ',
      'Kyrgyzstan': 'KG',
      'Tajikistan': 'TJ',
      'Turkmenistan': 'TM',
      'Iran': 'IR',
      'Iraq': 'IQ',
      'Saudi Arabia': 'SA',
      'Kuwait': 'KW',
      'Qatar': 'QA',
      'Bahrain': 'BH',
      'Oman': 'OM',
      'Yemen': 'YE',
      'Jordan': 'JO',
      'Lebanon': 'LB',
      'Syria': 'SY',
      'Israel': 'IL',
      'Palestine': 'PS',
      'Turkey': 'TR',
      'Azerbaijan': 'AZ',
      'Armenia': 'AM',
      'Georgia': 'GE',
      'Australia': 'AU',
      'New Zealand': 'NZ',
      'Fiji': 'FJ',
      'Papua New Guinea': 'PG',
      'Solomon Islands': 'SB',
      'Vanuatu': 'VU',
      'New Caledonia': 'NC',
      'French Polynesia': 'PF',
      'Samoa': 'WS',
      'Tonga': 'TO',
      'Marshall Islands': 'MH',
      'Micronesia': 'FM',
      'Palau': 'PW',
      'Nauru': 'NR',
      'Kiribati': 'KI',
      'Tuvalu': 'TV',
      'American Samoa': 'AS',
      'Niue': 'NU',
      'Cook Islands': 'CK',
      'Pitcairn Islands': 'PN',
      'Guam': 'GU',
      'Northern Mariana Islands': 'MP',
      'Brazil': 'BR',
      'Argentina': 'AR',
      'Peru': 'PE',
      'Colombia': 'CO',
      'Ecuador': 'EC',
      'Venezuela': 'VE',
      'Chile': 'CL',
      'Egypt': 'EG',
      'South Africa': 'ZA',
      'Nigeria': 'NG',
      'Kenya': 'KE',
      'Ethiopia': 'ET',
      'Tanzania': 'TZ',
      'Uganda': 'UG',
      'Sudan': 'SD',
      'DR Congo': 'CD',
      'Angola': 'AO',
      'Mozambique': 'MZ',
      'Zimbabwe': 'ZW',
      'Zambia': 'ZM',
      'Botswana': 'BW',
      'Namibia': 'NA',
      'Lesotho': 'LS',
      'Eswatini': 'SZ',
      'Madagascar': 'MG',
      'Mauritius': 'MU',
      'Seychelles': 'SC',
      'Comoros': 'KM',
      'Djibouti': 'DJ',
      'Eritrea': 'ER',
      'Somalia': 'SO',
      'Mali': 'ML',
      'Burkina Faso': 'BF',
      'Niger': 'NE',
      'Mauritania': 'MR',
      'Senegal': 'SN',
      'Gambia': 'GM',
      'Guinea-Bissau': 'GW',
      'Guinea': 'GN',
      'Sierra Leone': 'SL',
      'Liberia': 'LR',
      'Ivory Coast': 'CI',
      'Ghana': 'GH',
      'Togo': 'TG',
      'Benin': 'BJ',
      'Cameroon': 'CM',
      'Gabon': 'GA',
      'Congo': 'CG',
      'Central African Republic': 'CF',
      'Chad': 'TD',
      'Cuba': 'CU',
      'Dominican Republic': 'DO',
      'Puerto Rico': 'PR',
      'Jamaica': 'JM',
      'Haiti': 'HT',
      'Bahamas': 'BS',
      'Barbados': 'BB',
      'Trinidad and Tobago': 'TT',
      'Guyana': 'GY',
      'Suriname': 'SR',
      'French Guiana': 'GF'
    }

    const countryCode = countryCodeMap[country] || 'UN'
    
    try {
      return (
        <Flag 
          country={countryCode} 
          size={24}
          className="rounded-sm shadow-sm"
          title={country}
        />
      )
    } catch (error) {
      // Fallback to a globe icon if flag fails to load
      return (
        <div title={`${country} (flag not available)`}>
          <Globe className="w-6 h-6 text-gray-400" />
        </div>
      )
    }
  }

  const renderTimebox = (
    id: string,
    title: string,
    time: string,
    subtitle: string
  ) => {
    const isFullscreen = fullscreenTimebox === id

    // When fullscreen, force a solid bg based on theme and invert text for contrast
    const fullscreenBgClass = isFullscreen ? (isDark ? "bg-black" : "bg-white") : ""
    const fullscreenTextColor = isFullscreen ? (isDark ? "text-white" : "text-black") : themeStyles.textColor

    return (
      <div
        className={`transition-all duration-300 p-6 ${
          isFullscreen
            ? `fixed inset-0 z-50 ${fullscreenBgClass} backdrop-blur-md flex items-center justify-center`
            : ""
        }`}
        style={isFullscreen ? {} : getGlassStyle()}
      >
        <div className="text-center relative w-full">
          <div
            className={`flex justify-between items-center mb-4 ${
              isFullscreen ? "absolute top-4 left-4 right-4" : ""
            }`}
          >
            <h3 className={`text-lg font-semibold ${fullscreenTextColor}`}>
              {title}
            </h3>
            <div className="flex gap-2">
              <Button
                onClick={resizeTimebox}
                size="sm"
                className={`p-1 ${themeStyles.buttonBackground} ${fullscreenTextColor}`}
              >
                {timeboxSize === "normal" ? (
                  <Maximize2 className={`w-4 h-4 ${fullscreenTextColor}`} />
                ) : (
                  <Minimize2 className={`w-4 h-4 ${fullscreenTextColor}`} />
                )}
              </Button>
              <Button
                onClick={() => toggleFullscreen(id)}
                size="sm"
                className={`p-1 ${themeStyles.buttonBackground} ${fullscreenTextColor}`}
              >
                {isFullscreen ? (
                  <Minimize2 className={`w-4 h-4 ${fullscreenTextColor}`} />
                ) : (
                  <Maximize2 className={`w-4 h-4 ${fullscreenTextColor}`} />
                )}
              </Button>
            </div>
          </div>

          <div
            className={`font-mono font-bold ${fullscreenTextColor} ${
              isFullscreen
                ? "text-[10rem] leading-none"
                : timeboxSize === "large"
                ? "text-6xl"
                : "text-4xl"
            }`}
          >
            {time}
          </div>

          <div className={`text-sm ${fullscreenTextColor} opacity-70 mt-2`}>
            {subtitle}
          </div>
        </div>
      </div>
    )
  }

  // Render analog clock for a city
  const renderAnalogClock = (cityName: string, timezone: string) => {
    const cityData = WORLD_TIMEZONES.find(tz => tz.name === cityName)
    if (!cityData) return null

    // Calculate city time based on current time state
    let cityTime
    try {
      cityTime = new Date(currentTimeState.toLocaleString("en-US", { timeZone: timezone }))
    } catch (error) {
      cityTime = currentTimeState // fallback to current time
    }

    return (
      <div key={cityName} className="flex flex-col items-center p-6 bg-gradient-to-br from-white/20 to-white/10 rounded-xl backdrop-blur-md border border-white/30 hover:border-white/50 transition-all duration-300 hover:bg-gradient-to-br hover:from-white/25 hover:to-white/15 hover:shadow-xl hover:scale-105 shadow-lg">
        {/* City name prominently displayed at the top */}
        <div className="text-center mb-4">
          <div className="font-bold text-gray-900 text-xl mb-2 drop-shadow-lg">{cityName}</div>
          <div className="text-gray-700 text-sm font-medium">{cityData.country}</div>
        </div>
        
        {/* Flag above the clock */}
        <div className="mb-4 transform hover:scale-110 transition-transform duration-200">
          {renderFlag(cityData.country)}
        </div>
        
        {/* Analog clock with numbers */}
        <div className="relative w-28 h-28 mb-4 transform hover:scale-105 transition-transform duration-300">
          <ReactClock 
            value={cityTime}
            size={112}
            renderNumbers={true}
            renderMinuteMarks={true}
            renderHourMarks={true}
          />
        </div>
        
        {/* Digital time and date below the clock */}
        <div className="text-center mb-4">
          <div className="text-gray-900 text-base font-mono font-bold mb-1">{getTimeForTimezone(timezone)}</div>
          <div className="text-gray-700 text-sm">{getDateForTimezone(timezone)}</div>
        </div>
        
        {/* Remove button */}
        <Button
          onClick={() => removeFromSelectedCities(cityName)}
          size="sm"
          className="mt-2 p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-full w-8 h-8 border border-red-500/30 hover:border-red-500/50 transition-all duration-200"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto w-full p-4">
      {/* Inject custom clock styles */}
      <style dangerouslySetInnerHTML={{ __html: customClockStyles }} />
      
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className={`text-4xl font-bold mb-2 ${themeStyles.textColor}`}>
          The World Clock — Worldwide
        </h1>
        <p className={`text-lg ${themeStyles.textColor} opacity-70`}>
          Find current time, weather, sun, moon, and much more...
        </p>
      </div>

      {/* Search Bar with IntelliSense */}
      <div className="mb-8 flex justify-center">
        <div className="relative w-full max-w-md search-container">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for city or place..."
            value={timezoneSearch}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => timezoneSearch.trim() !== "" && setShowSuggestions(searchSuggestions.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className={`w-full pl-10 pr-4 py-3 rounded-lg ${themeStyles.buttonBackground} ${themeStyles.textColor} border ${themeStyles.sidebarBorder} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          
          {/* IntelliSense Suggestions Dropdown */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
              {searchSuggestions.map((suggestion, index) => (
                <div
                  key={suggestion.name}
                  className={`flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    index === selectedSuggestionIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={() => selectSuggestion(suggestion)}
                  onMouseEnter={() => setSelectedSuggestionIndex(index)}
                >
                  <div className="flex items-center space-x-3">
                    {renderFlag(suggestion.country)}
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {suggestion.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {suggestion.country}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 dark:text-gray-500">
                    {getTimeForTimezone(suggestion.timezone)}
                  </div>
                </div>
              ))}
              
              {/* Keyboard navigation hint */}
              <div className="p-2 text-xs text-gray-400 dark:text-gray-500 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                Use ↑↓ arrows to navigate, Enter to select, Esc to close
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Current Time Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {renderTimebox(
          "current",
          "Current Time",
          currentTimeState.toLocaleTimeString(),
          currentTimeState.toLocaleDateString()
        )}
        {renderTimebox(
          "local",
          "Local Time",
          currentTimeState.toLocaleTimeString(),
          Intl.DateTimeFormat().resolvedOptions().timeZone
        )}
        {renderTimebox(
          "utc",
          "UTC Time",
          currentTimeState.toUTCString().split(" ")[4],
          "Coordinated Universal Time"
        )}
      </div>

      {/* My Cities Section */}
      <div className="mb-8 p-8" style={getGlassStyle()}>
        <div className="flex justify-between items-center mb-8">
          <h2 className={`text-2xl font-bold ${themeStyles.textColor} drop-shadow-lg`}>
            My Cities (Personal World Clock)
          </h2>
          <Button
            onClick={() => setShowAddTimezone(true)}
            className={`px-6 py-3 ${themeStyles.buttonBackground} ${themeStyles.textColor} hover:opacity-80 transition-all duration-200 rounded-lg font-medium shadow-lg hover:shadow-xl`}
          >
            Add City
          </Button>
        </div>
        
        {/* Cities Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {selectedCities.map(cityName => {
            const cityData = WORLD_TIMEZONES.find(tz => tz.name === cityName)
            if (!cityData) {
              return (
                <div key={cityName} className="flex flex-col items-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                  <div className="text-red-500 text-sm text-center">City not found: {cityName}</div>
                </div>
              )
            }
            return renderAnalogClock(cityName, cityData.timezone)
          })}
        </div>
        
        {/* Empty state when no cities */}
        {selectedCities.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className={`text-lg ${themeStyles.textColor} opacity-70 mb-2`}>No cities added yet</p>
            <p className={`text-sm ${themeStyles.textColor} opacity-50`}>Click "Add City" to start building your personal world clock</p>
          </div>
        )}
      </div>

      {/* Add New City Modal */}
      {showAddTimezone && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add New City</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Search cities..."
                value={timezoneSearch}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredTimezones.slice(0, 20).map((tz) => (
                  <div
                    key={tz.name}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                    onClick={() => {
                      addToSelectedCities(tz.name)
                      setShowAddTimezone(false)
                      setTimezoneSearch("")
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      {renderFlag(tz.country)}
                      <span>{tz.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{tz.country}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                onClick={() => setShowAddTimezone(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* World Timezones Section */}
      <div className="p-6" style={getGlassStyle()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-semibold ${themeStyles.textColor}`}>
            Current Local Times Around the World
          </h2>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Cities Shown: {filteredTimezones.length}
            </div>
            <Settings className="w-5 h-5 text-gray-500 cursor-pointer" />
          </div>
        </div>

        {/* Timezone Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTimezones.map((tz) => {
            return (
              <div
                key={tz.name}
                className={`p-4 rounded-lg ${themeStyles.buttonBackground} border border-white/10 hover:border-white/20 transition-all cursor-pointer group`}
                onClick={() => addToSelectedCities(tz.name)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {renderFlag(tz.country)}
                    <span className={`font-semibold ${themeStyles.textColor}`}>
                      {tz.name}
                    </span>
                  </div>
                  {selectedCities.includes(tz.name) && (
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  )}
                </div>
                
                <div className={`text-lg font-mono ${themeStyles.textColor}`}>
                  {getTimeForTimezone(tz.timezone)}
                </div>
                
                <div className={`text-sm ${themeStyles.textColor} opacity-70`}>
                  {getDateForTimezone(tz.timezone)}
                </div>
                
                <div className={`text-xs ${themeStyles.textColor} opacity-50 mt-1`}>
                  {tz.country}
                </div>
              </div>
            )
          })}
        </div>

        {filteredTimezones.length === 0 && (
          <div className="text-center py-8">
            <Globe className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No cities found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  )
}
