const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// In-memory storage (replace with database in production)
let bookings = [];
let contactMessages = [];
let newsletters = [];

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes

// Get all bookings
app.get('/api/bookings', (req, res) => {
    res.json({
        success: true,
        data: bookings,
        count: bookings.length
    });
});

// Create new booking
app.post('/api/bookings', (req, res) => {
    try {
        const { name, email, datetime, destination, message } = req.body;
        
        // Validation
        if (!name || !email || !datetime || !destination) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all required fields'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address'
            });
        }

        const newBooking = {
            id: Date.now().toString(),
            name: name.trim(),
            email: email.trim().toLowerCase(),
            datetime,
            destination,
            message: message ? message.trim() : '',
            status: 'pending',
            createdAt: new Date().toISOString(),
            bookingReference: `TUR${Date.now().toString().slice(-6)}`
        };

        bookings.push(newBooking);

        res.status(201).json({
            success: true,
            message: 'Booking created successfully!',
            data: newBooking
        });
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
});

// Get single booking by ID
app.get('/api/bookings/:id', (req, res) => {
    const booking = bookings.find(b => b.id === req.params.id);
    
    if (!booking) {
        return res.status(404).json({
            success: false,
            message: 'Booking not found'
        });
    }

    res.json({
        success: true,
        data: booking
    });
});

// Update booking status
app.patch('/api/bookings/:id', (req, res) => {
    const { status } = req.body;
    const bookingIndex = bookings.findIndex(b => b.id === req.params.id);
    
    if (bookingIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Booking not found'
        });
    }

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid status. Must be: pending, confirmed, or cancelled'
        });
    }

    bookings[bookingIndex].status = status;
    bookings[bookingIndex].updatedAt = new Date().toISOString();

    res.json({
        success: true,
        message: 'Booking status updated successfully',
        data: bookings[bookingIndex]
    });
});

// Delete booking
app.delete('/api/bookings/:id', (req, res) => {
    const bookingIndex = bookings.findIndex(b => b.id === req.params.id);
    
    if (bookingIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Booking not found'
        });
    }

    const deletedBooking = bookings.splice(bookingIndex, 1)[0];

    res.json({
        success: true,
        message: 'Booking deleted successfully',
        data: deletedBooking
    });
});

// Contact form submission
app.post('/api/contact', (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all fields'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address'
            });
        }

        const newMessage = {
            id: Date.now().toString(),
            name: name.trim(),
            email: email.trim().toLowerCase(),
            subject: subject.trim(),
            message: message.trim(),
            status: 'unread',
            createdAt: new Date().toISOString()
        };

        contactMessages.push(newMessage);

        res.status(201).json({
            success: true,
            message: 'Thank you for your message! We will get back to you soon.',
            data: newMessage
        });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
});

// Newsletter subscription
app.post('/api/newsletter', (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address'
            });
        }

        // Check if email already exists
        const existingSubscription = newsletters.find(n => n.email === email.trim().toLowerCase());
        if (existingSubscription) {
            return res.status(400).json({
                success: false,
                message: 'This email is already subscribed to our newsletter'
            });
        }

        const newSubscription = {
            id: Date.now().toString(),
            email: email.trim().toLowerCase(),
            status: 'active',
            subscribedAt: new Date().toISOString()
        };

        newsletters.push(newSubscription);

        res.status(201).json({
            success: true,
            message: 'Successfully subscribed to our newsletter!',
            data: newSubscription
        });
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
});

// Get all contact messages (admin)
app.get('/api/contact', (req, res) => {
    res.json({
        success: true,
        data: contactMessages,
        count: contactMessages.length
    });
});

// Get all newsletter subscriptions (admin)
app.get('/api/newsletter', (req, res) => {
    res.json({
        success: true,
        data: newsletters,
        count: newsletters.length
    });
});

// Package details endpoint
app.get('/api/packages', (req, res) => {
    const packages = [
        {
            id: 1,
            name: 'Lakshadweep Paradise',
            location: 'Lakshadweep',
            duration: '3 days',
            persons: '2 Person',
            price: '₹15,000.00',
            rating: 4,
            image: 'img/Lakshadweep2.jpg',
            description: 'Escape to paradise: Dive into turquoise waters, bask in sun-kissed beaches of Lakshadweep.',
            includes: ['Accommodation', 'Meals', 'Water Sports', 'Island Hopping']
        },
        {
            id: 2,
            name: 'Tirumala Spiritual Journey',
            location: 'Tirumala',
            duration: '3 days',
            persons: '2 Person',
            price: '₹13,999.00',
            rating: 5,
            image: 'img/tirupati2.jpg',
            description: 'Celebrate spiritual serenity at Tirumala. Discover divine bliss in majestic landscapes and traditions.',
            includes: ['Accommodation', 'Darshan Tickets', 'Meals', 'Local Transport']
        },
        {
            id: 3,
            name: 'Alleppey Backwaters',
            location: 'Alleppey',
            duration: '3 days',
            persons: '2 Person',
            price: '₹10,899.00',
            rating: 5,
            image: 'img/Alleppey2.jpg',
            description: 'Experience serene backwaters, lush landscapes, and cultural richness in Alleppey.',
            includes: ['Houseboat Stay', 'Meals', 'Backwater Cruise', 'Village Tours']
        }
    ];

    res.json({
        success: true,
        data: packages
    });
});

// Get single package
app.get('/api/packages/:id', (req, res) => {
    const packages = [
        {
            id: 1,
            name: 'Lakshadweep Paradise',
            location: 'Lakshadweep',
            duration: '3 days',
            persons: '2 Person',
            price: '₹15,000.00',
            rating: 4,
            image: 'img/Lakshadweep2.jpg',
            description: 'Escape to paradise: Dive into turquoise waters, bask in sun-kissed beaches of Lakshadweep.',
            includes: ['Accommodation', 'Meals', 'Water Sports', 'Island Hopping']
        },
        {
            id: 2,
            name: 'Tirumala Spiritual Journey',
            location: 'Tirumala',
            duration: '3 days',
            persons: '2 Person',
            price: '₹13,999.00',
            rating: 5,
            image: 'img/tirupati2.jpg',
            description: 'Celebrate spiritual serenity at Tirumala. Discover divine bliss in majestic landscapes and traditions.',
            includes: ['Accommodation', 'Darshan Tickets', 'Meals', 'Local Transport']
        },
        {
            id: 3,
            name: 'Alleppey Backwaters',
            location: 'Alleppey',
            duration: '3 days',
            persons: '2 Person',
            price: '₹10,899.00',
            rating: 5,
            image: 'img/Alleppey2.jpg',
            description: 'Experience serene backwaters, lush landscapes, and cultural richness in Alleppey.',
            includes: ['Houseboat Stay', 'Meals', 'Backwater Cruise', 'Village Tours']
        }
    ];

    const packageId = parseInt(req.params.id);
    const package = packages.find(p => p.id === packageId);
    
    if (!package) {
        return res.status(404).json({
            success: false,
            message: 'Package not found'
        });
    }

    res.json({
        success: true,
        data: package
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

app.listen(PORT, () => {
    console.log(`Tourist Travel Server is running on port ${PORT}`);
    console.log(`Visit: http://localhost:${PORT}`);
});

module.exports = app;