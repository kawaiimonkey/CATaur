// US and Canada location data for cascading dropdown
// Structure: Country → Province/State → Cities

export type CountryCode = "CA" | "US";

export const COUNTRIES: { code: CountryCode; name: string }[] = [
    { code: "CA", name: "Canada" },
    { code: "US", name: "United States" },
];

export type RegionMap = Record<CountryCode, { code: string; name: string }[]>;

export const REGIONS: RegionMap = {
    CA: [
        { code: "AB", name: "Alberta" },
        { code: "BC", name: "British Columbia" },
        { code: "MB", name: "Manitoba" },
        { code: "NB", name: "New Brunswick" },
        { code: "NL", name: "Newfoundland and Labrador" },
        { code: "NS", name: "Nova Scotia" },
        { code: "ON", name: "Ontario" },
        { code: "PE", name: "Prince Edward Island" },
        { code: "QC", name: "Québec" },
        { code: "SK", name: "Saskatchewan" },
    ],
    US: [
        { code: "CA", name: "California" },
        { code: "CO", name: "Colorado" },
        { code: "FL", name: "Florida" },
        { code: "GA", name: "Georgia" },
        { code: "IL", name: "Illinois" },
        { code: "MA", name: "Massachusetts" },
        { code: "NY", name: "New York" },
        { code: "OR", name: "Oregon" },
        { code: "TX", name: "Texas" },
        { code: "WA", name: "Washington" },
    ],
};

export type CityMap = Record<string, string[]>;

export const CITIES: Record<CountryCode, CityMap> = {
    CA: {
        AB: ["Calgary", "Edmonton", "Red Deer", "Lethbridge"],
        BC: ["Vancouver", "Victoria", "Burnaby", "Surrey", "Kelowna"],
        MB: ["Winnipeg", "Brandon"],
        NB: ["Fredericton", "Moncton", "Saint John"],
        NL: ["St. John's", "Corner Brook"],
        NS: ["Halifax", "Dartmouth", "Sydney"],
        ON: ["Toronto", "Ottawa", "Mississauga", "Brampton", "Hamilton", "London", "Kitchener"],
        PE: ["Charlottetown"],
        QC: ["Montréal", "Québec City", "Laval", "Gatineau", "Longueuil"],
        SK: ["Saskatoon", "Regina"],
    },
    US: {
        CA: ["San Francisco", "Los Angeles", "San Diego", "San Jose", "Sacramento"],
        CO: ["Denver", "Boulder", "Colorado Springs"],
        FL: ["Miami", "Orlando", "Tampa", "Jacksonville"],
        GA: ["Atlanta", "Savannah"],
        IL: ["Chicago", "Springfield"],
        MA: ["Boston", "Cambridge", "Worcester"],
        NY: ["New York City", "Buffalo", "Rochester", "Albany"],
        OR: ["Portland", "Eugene", "Salem"],
        TX: ["Austin", "Houston", "Dallas", "San Antonio"],
        WA: ["Seattle", "Bellevue", "Spokane", "Tacoma"],
    },
};
