import countryList from "country-list";

export const countries = countryList.getData().map((country) => ({
  value: country.name, // Use name as value for simplicity in this app, or code if preferred. 
                       // The user asked for "countries", usually storing the name is fine unless we need ISO codes.
                       // Given the existing data uses "Thailand" (name), I'll stick to name.
  label: country.name,
})).sort((a, b) => a.label.localeCompare(b.label));

// Add some common ones at the top if needed, or just keep alphabetical.
// Let's keep it alphabetical for now.
