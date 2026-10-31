// Seeds sample hotels + rooms so the site has data to show.
//   npm run seed            -> seeds only if there are no hotels yet
//   npm run seed -- --reset -> wipes ALL hotels and rooms, then seeds
import dotenv from "dotenv";
import mongoose from "mongoose";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";

dotenv.config({ quiet: true });

const img = {
  a: "https://cf.bstatic.com/xdata/images/hotel/square600/13125860.webp?k=e148feeb802ac3d28d1391dad9e4cf1e12d9231f897d0b53ca067bde8a9d3355&o=&s=1",
  b: "https://i.pinimg.com/736x/ac/b1/b9/acb1b9af630dac34421a484a228c4371.jpg",
  c: "https://i.pinimg.com/736x/14/13/39/141339a58a42d89a7adec62465b504e6.jpg",
  d: "https://i.pinimg.com/736x/db/56/46/db5646f3e0dc56de39bc46312f605863.jpg",
  e: "https://i.pinimg.com/736x/3e/2d/63/3e2d635d2d8037d449be00577c24ca0f.jpg",
  f: "https://i.pinimg.com/736x/98/11/28/9811281d2cfc1b9c593fb750f0f32d44.jpg",
  g: "https://i.pinimg.com/736x/8d/95/12/8d9512bf267d21ed63826e44480a5b21.jpg",
  h: "https://i.pinimg.com/736x/01/fa/08/01fa08f7b25f0fbbe619a29eae53ed36.jpg",
};
const photos = (...keys) => keys.map((k) => img[k]);

const hotels = [
  { name: "Aparthotel Stare Miasto", type: "apartment", city: "Madrid", address: "Calle Mayor 12", distance: "500", photos: photos("a", "e", "h"), title: "Bright apartments in the old town", description: "Spacious, modern apartments with kitchenettes, steps from Plaza Mayor and the best tapas bars in Madrid.", rating: 4.5, cheapestPrice: 120, featured: true },
  { name: "The Grand Estancia", type: "hotel", city: "Madrid", address: "Gran Via 45", distance: "300", photos: photos("e", "a", "c"), title: "Classic luxury on Gran Via", description: "An elegant hotel with a rooftop pool, a spa and sweeping views over the city skyline.", rating: 4.4, cheapestPrice: 160, featured: true },
  { name: "Comfort Suites Airport", type: "hotel", city: "Austin", address: "7501 E Ben White Blvd", distance: "8000", photos: photos("b", "d", "f"), title: "Easy stay near the airport", description: "Free airport shuttle, complimentary breakfast and comfortable suites for business and leisure travellers.", rating: 4.7, cheapestPrice: 140, featured: true },
  { name: "Lakeside Cabin Retreat", type: "cabin", city: "Austin", address: "Lake Travis Rd 210", distance: "25000", photos: photos("g", "h", "b"), title: "Quiet cabin by the lake", description: "A cosy wooden cabin with a private dock, fire pit and stunning sunsets over Lake Travis.", rating: 4.6, cheapestPrice: 95, featured: false },
  { name: "Four Seasons Resort", type: "resort", city: "Dubai", address: "Jumeirah Beach Rd", distance: "12000", photos: photos("c", "f", "e"), title: "Beachfront resort with private beach", description: "A five-star beachfront resort with several pools, fine dining and direct access to a private beach.", rating: 4.4, cheapestPrice: 99, featured: true },
  { name: "Hilton Garden Inn", type: "hotel", city: "Berlin", address: "Mittelstrasse 18", distance: "700", photos: photos("d", "b", "a"), title: "Modern comfort in Mitte", description: "Contemporary rooms close to the Brandenburg Gate, with a fitness centre and an on-site restaurant.", rating: 4.5, cheapestPrice: 105, featured: true },
  { name: "The Royal Crest", type: "hotel", city: "London", address: "22 Kensington High St", distance: "2500", photos: photos("f", "c", "d"), title: "Boutique elegance in Kensington", description: "A boutique hotel in a Victorian townhouse, a short walk from Hyde Park and the museums.", rating: 4.7, cheapestPrice: 140, featured: true },
  { name: "The Rose Cottage", type: "villa", city: "Krakow", address: "ul. Floriańska 9", distance: "1200", photos: photos("g", "a", "e"), title: "Charming villa with a garden", description: "A romantic villa with a rose garden, a fireplace and homemade breakfast every morning.", rating: 4.4, cheapestPrice: 99, featured: true },
  { name: "The Meridian Grand", type: "hotel", city: "Budapest", address: "Andrássy út 30", distance: "900", photos: photos("h", "d", "f"), title: "Grand hotel on Andrássy Avenue", description: "Historic grandeur meets modern comfort, close to the Opera House and the thermal baths.", rating: 4.5, cheapestPrice: 105, featured: true },
  { name: "Liffey View Apartments", type: "apartment", city: "Dublin", address: "14 Ormond Quay", distance: "400", photos: photos("a", "b", "g"), title: "Riverside apartments in the centre", description: "Self-catering apartments overlooking the River Liffey, a few minutes from Temple Bar.", rating: 4.3, cheapestPrice: 130, featured: false },
  { name: "Silver Legacy Resort", type: "resort", city: "Reno", address: "407 N Virginia St", distance: "200", photos: photos("c", "h", "d"), title: "Casino resort downtown", description: "A lively resort with a casino, a spa and several restaurants in the heart of Reno.", rating: 4.2, cheapestPrice: 89, featured: false },
];

const roomTemplates = [
  { title: "Standard Double Room", maxPeople: 2, desc: "1 queen bed, private bathroom, free Wi-Fi.", priceOffset: 0, numbers: [101, 102, 103] },
  { title: "Family Suite", maxPeople: 4, desc: "2 queen beds, sofa bed, kitchenette and a city view.", priceOffset: 60, numbers: [201, 202] },
];

await mongoose.connect(process.env.MONGO);
const reset = process.argv.includes("--reset");

if (!reset && (await Hotel.countDocuments()) > 0) {
  console.log("Hotels already exist - skipping. Use `npm run seed -- --reset` to replace them.");
} else {
  if (reset) await Promise.all([Hotel.deleteMany({}), Room.deleteMany({})]);
  for (const h of hotels) {
    const rooms = await Room.insertMany(
      roomTemplates.map(({ priceOffset, numbers, ...r }) => ({
        ...r,
        price: h.cheapestPrice + priceOffset,
        roomNumbers: numbers.map((number) => ({ number, unavailableDates: [] })),
      }))
    );
    await Hotel.create({ ...h, rooms: rooms.map((r) => r._id.toString()) });
  }
  console.log(`Seeded ${hotels.length} hotels with ${hotels.length * roomTemplates.length} room types.`);
}
await mongoose.disconnect();
