import { createContext, useContext, useState } from "react";

const SearchContext = createContext(null);

const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
const tomorrow = () => {
  const d = today();
  d.setDate(d.getDate() + 1);
  return d;
};

export const SearchProvider = ({ children }) => {
  const [search, setSearch] = useState({
    city: "",
    dates: [{ startDate: today(), endDate: tomorrow(), key: "selection" }],
    options: { adult: 1, children: 0, room: 1 },
  });
  return (
    <SearchContext.Provider value={{ ...search, setSearch }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);
