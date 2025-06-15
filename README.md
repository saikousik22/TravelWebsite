# Tourist Travel Web Application

A modern travel agency web application built with Node.js (Express) and a responsive HTML/CSS/JS frontend. Users can browse travel packages, book trips, contact the agency, and subscribe to newsletters. All data is managed via RESTful APIs.

## Features

- **Dynamic Packages:** View curated travel packages with details and images.
- **Booking System:** Book a trip with name, email, date/time, destination, and message.
- **Contact Form:** Send messages to the agency (admin view available).
- **Newsletter Subscription:** Subscribe to updates (prevents duplicate emails).
- **Admin Endpoints:** View all bookings, contact messages, and newsletter subscriptions.
- **Responsive Design:** Mobile-friendly, modern UI with Bootstrap and jQuery.

## Project Structure

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v14+ recommended)

### Installation
1. **Clone or Download** this repository.
2. Place all files as shown in the structure above.
3. Install dependencies (if any):
   ```bash
   npm install express body-parser cors
   ```

### Running the Server
```bash
node server.js
```
- The server will start on [http://localhost:3000](http://localhost:3000)
- Open `http://localhost:3000` in your browser to view the site.

## API Endpoints

### Bookings
- `GET /api/bookings` — List all bookings
- `POST /api/bookings` — Create a new booking
- `GET /api/bookings/:id` — Get a booking by ID
- `PATCH /api/bookings/:id` — Update booking status
- `DELETE /api/bookings/:id` — Delete a booking

### Contact
- `POST /api/contact` — Submit a contact message
- `GET /api/contact` — List all contact messages

### Newsletter
- `POST /api/newsletter` — Subscribe to newsletter
- `GET /api/newsletter` — List all newsletter subscriptions

### Packages
- `GET /api/packages` — List all packages
- `GET /api/packages/:id` — Get a package by ID

## Customization
- **Images:** Place your own images in the `img/` folder.
- **Packages:** Edit the packages array in `server.js` to add or change travel packages.
- **Styling:** Modify `css/style.css` for custom styles.

## Notes
- All data is stored in-memory (resets on server restart). For production, connect to a real database.
- The project is for educational/demo purposes.

## License
MIT
