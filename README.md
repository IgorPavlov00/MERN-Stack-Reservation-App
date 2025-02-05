# Booking.com Clone - MERN Stack

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A full-stack web application cloning core Booking.com functionality using the MERN stack.  Users can search, browse, and manage bookings.  Built with modern technologies for a robust and scalable platform.

![Booking.com Clone Preview](booking-clone-preview.png)  *(Replace with your image filename)*

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)  *(New section)*
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Authentication:** Secure user registration and login using JWT (JSON Web Tokens) and HTTP-only cookies for enhanced security.
- **Accommodation Search:**  Search for accommodations by destination, dates, and guest count.
- **Property Listings:** Detailed property listings with images, descriptions, amenities, and user reviews.
- **Booking Management:** Users can create, update, and delete bookings. View booking details and manage all bookings in one place.
- **Admin Panel (Optional):**  Manage properties, users, and bookings through an administrative interface.
- **Responsive Design:**  Seamless experience across desktops, tablets, and mobile devices.

## Technologies

- **Frontend:**
  - React  <img src="https://img.icons8.com/color/30/000000/react-native.png" width="20" height="20" alt="React Icon"/>
  - Redux (for state management) <img src="https://img.icons8.com/color/30/000000/redux.png" width="20" height="20" alt="Redux Icon"/>
  - HTML5 <img src="https://img.icons8.com/color/30/000000/html-5--v1.png" width="20" height="20" alt="HTML5 Icon"/>
  - CSS3 (or a CSS framework like styled-components or Material-UI) <img src="https://img.icons8.com/color/30/000000/css3.png" width="20" height="20" alt="CSS3 Icon"/>
- **Backend:**
  - Node.js <img src="https://img.icons8.com/color/30/000000/nodejs.png" width="20" height="20" alt="Node.js Icon"/>
  - Express.js <img src="https://img.icons8.com/fluency/30/000000/express-js.png" width="20" height="20" alt="Express.js Icon"/>
- **Database:**
  - MongoDB <img src="https://img.icons8.com/color/30/000000/mongodb.png" width="20" height="20" alt="MongoDB Icon"/>
- **Other:**
  - Git (for version control) <img src="https://img.icons8.com/color/30/000000/git-squared.png" width="20" height="20" alt="Git Icon"/>
  - npm or yarn (for package management) <img src="https://img.icons8.com/color/30/000000/npm.png" width="20" height="20" alt="npm Icon"/>

## Installation

*(Same as before)*

## Usage

*(Same as before)*

## API Endpoints *(New Section)*

This section documents the key API endpoints available in the backend.

- **Authentication:**
    - `POST /api/auth/register`: Register a new user.
    - `POST /api/auth/login`: Login a user and generate a JWT.
    - `POST /api/auth/logout`: Logout a user (clear cookie).

- **Users:**
    - `GET /api/users/:id`: Get user details. *(Protected)*

- **Properties:**
    - `GET /api/properties`: Get all properties.
    - `GET /api/properties/:id`: Get a specific property.
    - `POST /api/properties`: Create a new property. *(Admin Only)*
    - `PUT /api/properties/:id`: Update a property. *(Admin Only)*
    - `DELETE /api/properties/:id`: Delete a property. *(Admin Only)*

- **Bookings:**
    - `GET /api/bookings`: Get all bookings. *(Admin Only)*
    - `GET /api/bookings/:id`: Get a specific booking. *(Protected)*
    - `POST /api/bookings`: Create a new booking. *(Protected)*
    - `PUT /api/bookings/:id`: Update a booking. *(Protected)*
    - `DELETE /api/bookings/:id`: Delete a booking. *(Protected)*

*(And so on for other relevant endpoints)*

## Project Structure

*(Same as before)*

## Screenshots

*(Include screenshots here)*

## Contributing

*(Same as before)*

## License

*(Same as before)*
