(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Initiate the wowjs
    new WOW().init();


    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 45) {
            $('.navbar').addClass('sticky-top shadow-sm');
        } else {
            $('.navbar').removeClass('sticky-top shadow-sm');
        }
    });
    
    
    // Dropdown on mouse hover
    const $dropdown = $(".dropdown");
    const $dropdownToggle = $(".dropdown-toggle");
    const $dropdownMenu = $(".dropdown-menu");
    const showClass = "show";
    
    $(window).on("load resize", function() {
        if (this.matchMedia("(min-width: 992px)").matches) {
            $dropdown.hover(
            function() {
                const $this = $(this);
                $this.addClass(showClass);
                $this.find($dropdownToggle).attr("aria-expanded", "true");
                $this.find($dropdownMenu).addClass(showClass);
            },
            function() {
                const $this = $(this);
                $this.removeClass(showClass);
                $this.find($dropdownToggle).attr("aria-expanded", "false");
                $this.find($dropdownMenu).removeClass(showClass);
            }
            );
        } else {
            $dropdown.off("mouseenter mouseleave");
        }
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        center: true,
        margin: 24,
        dots: true,
        loop: true,
        nav : false,
        responsive: {
            0:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:3
            }
        }
    });
    
    // Loading spinner for forms
    function showLoading(button) {
        const originalText = button.html();
        button.html('<span class="spinner-border spinner-border-sm me-2" role="status"></span>Loading...')
              .prop('disabled', true);
        return originalText;
    }
    
    function hideLoading(button, originalText) {
        button.html(originalText).prop('disabled', false);
    }
    
    // Enhanced message display with auto-hide
    function showSuccessMessage(selector, message, autoHide = true) {
        const html = `<div class="alert alert-success alert-dismissible fade show" role="alert">
            <i class="fas fa-check-circle me-2"></i><strong>Success!</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
        $(selector).html(html);
        $('html, body').animate({ scrollTop: $(selector).offset().top - 100 }, 600);
        
        if (autoHide) {
            setTimeout(() => {
                $(selector + ' .alert').fadeOut(500, function() {
                    $(this).remove();
                });
            }, 5000);
        }
    }
    
    function showErrorMessage(selector, message, autoHide = true) {
        const html = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i><strong>Error!</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
        $(selector).html(html);
        $('html, body').animate({ scrollTop: $(selector).offset().top - 100 }, 600);
        
        if (autoHide) {
            setTimeout(() => {
                $(selector + ' .alert').fadeOut(500, function() {
                    $(this).remove();
                });
            }, 8000);
        }
    }

    // Form validation helper
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function validateForm(formData, requiredFields) {
        const errors = [];
        
        requiredFields.forEach(field => {
            if (!formData[field] || formData[field].trim() === '') {
                errors.push(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
            }
        });
        
        if (formData.email && !validateEmail(formData.email)) {
            errors.push('Please enter a valid email address');
        }
        
        return errors;
    }

    // Enhanced booking form submission
    $('#bookingForm').on('submit', function (e) {
        e.preventDefault();
        
        const submitBtn = $(this).find('button[type="submit"]');
        const originalText = showLoading(submitBtn);
        
        // Clear previous messages
        $('#booking-message').html('');
        
        const data = {
            name: $('#bookingName').val().trim(),
            email: $('#bookingEmail').val().trim(),
            datetime: $('#bookingDatetime').val(),
            destination: $('#bookingDestination').val(),
            message: $('#bookingMessageInput').val().trim()
        };
        
        // Client-side validation
        const errors = validateForm(data, ['name', 'email', 'datetime', 'destination']);
        if (errors.length > 0) {
            hideLoading(submitBtn, originalText);
            showErrorMessage('#booking-message', errors.join(', '));
            return;
        }
        
        // Check if datetime is in the future
        const selectedDate = new Date(data.datetime);
        const now = new Date();
        if (selectedDate <= now) {
            hideLoading(submitBtn, originalText);
            showErrorMessage('#booking-message', 'Please select a future date and time');
            return;
        }
        
        $.ajax({
            url: '/api/bookings',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (res) {
                hideLoading(submitBtn, originalText);
                if (res.success) {
                    showSuccessMessage('#booking-message', 
                        `${res.message} Your booking reference is: ${res.data.bookingReference}`);
                    $('#bookingForm')[0].reset();
                } else {
                    showErrorMessage('#booking-message', res.message);
                }
            },
            error: function (xhr) {
                hideLoading(submitBtn, originalText);
                let msg = 'Booking failed. Please try again later.';
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    msg = xhr.responseJSON.message;
                }
                showErrorMessage('#booking-message', msg);
            }
        });
    });

    // Enhanced newsletter form submission
    $('#newsletterForm').on('submit', function (e) {
        e.preventDefault();
        
        const submitBtn = $(this).find('button[type="submit"]');
        const originalText = showLoading(submitBtn);
        
        // Clear previous messages
        $('#newsletter-message').html('');
        
        const email = $('#newsletterEmail').val().trim();
        
        if (!email) {
            hideLoading(submitBtn, originalText);
            showErrorMessage('#newsletter-message', 'Email address is required');
            return;
        }
        
        if (!validateEmail(email)) {
            hideLoading(submitBtn, originalText);
            showErrorMessage('#newsletter-message', 'Please enter a valid email address');
            return;
        }
        
        const data = { email: email };
        
        $.ajax({
            url: '/api/newsletter',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (res) {
                hideLoading(submitBtn, originalText);
                if (res.success) {
                    showSuccessMessage('#newsletter-message', res.message);
                    $('#newsletterForm')[0].reset();
                } else {
                    showErrorMessage('#newsletter-message', res.message);
                }
            },
            error: function (xhr) {
                hideLoading(submitBtn, originalText);
                let msg = 'Subscription failed. Please try again later.';
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    msg = xhr.responseJSON.message;
                }
                showErrorMessage('#newsletter-message', msg);
            }
        });
    });

    // Enhanced contact form submission
    $('#contactForm').on('submit', function (e) {
        e.preventDefault();
        
        const submitBtn = $(this).find('button[type="submit"]');
        const originalText = showLoading(submitBtn);
        
        // Clear previous messages
        $('#contact-message').html('');
        
        const data = {
            name: $('#contactName').val().trim(),
            email: $('#contactEmail').val().trim(),
            subject: $('#contactSubject').val().trim(),
            message: $('#contactMessageInput').val().trim()
        };
        
        // Client-side validation
        const errors = validateForm(data, ['name', 'email', 'subject', 'message']);
        if (errors.length > 0) {
            hideLoading(submitBtn, originalText);
            showErrorMessage('#contact-message', errors.join(', '));
            return;
        }
        
        $.ajax({
            url: '/api/contact',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (res) {
                hideLoading(submitBtn, originalText);
                if (res.success) {
                    showSuccessMessage('#contact-message', res.message);
                    $('#contactForm')[0].reset();
                } else {
                    showErrorMessage('#contact-message', res.message);
                }
            },
            error: function (xhr) {
                hideLoading(submitBtn, originalText);
                let msg = 'Message failed to send. Please try again later.';
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    msg = xhr.responseJSON.message;
                }
                showErrorMessage('#contact-message', msg);
            }
        });
    });

    // Enhanced package loading with error handling and loading state
    function loadPackages() {
        const packagesContainer = $('#packages-list');
        
        // Show loading state
        packagesContainer.html(`
            <div class="col-12 text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading packages...</span>
                </div>
                <p class="mt-2">Loading packages...</p>
            </div>
        `);
        
        $.ajax({
            url: '/api/packages',
            method: 'GET',
            success: function (res) {
                if (res.success && Array.isArray(res.data) && res.data.length > 0) {
                    let html = '';
                    res.data.forEach(pkg => {
                        // Generate star rating
                        const starRating = '★'.repeat(pkg.rating) + '☆'.repeat(5 - pkg.rating);
                        
                        html += `
                        <div class="col-lg-4 col-md-6 mb-4">
                            <div class="package-item bg-white rounded shadow-sm overflow-hidden h-100">
                                <div class="position-relative">
                                    <img src="${pkg.image}" class="img-fluid w-100" alt="${pkg.name}" style="height: 250px; object-fit: cover;">
                                    <div class="position-absolute top-0 end-0 m-3">
                                        <span class="badge bg-primary">${pkg.rating}/5</span>
                                    </div>
                                </div>
                                <div class="p-4 d-flex flex-column">
                                    <div class="d-flex justify-content-between align-items-start mb-2">
                                        <h5 class="mb-0">${pkg.name}</h5>
                                        <small class="text-muted">${pkg.location}</small>
                                    </div>
                                    <p class="text-muted mb-3">${pkg.description}</p>
                                    <div class="mb-3">
                                        <h6>Package Includes:</h6>
                                        <ul class="list-unstyled">
                                            ${pkg.includes.map(item => `<li><i class="fas fa-check text-success me-2"></i>${item}</li>`).join('')}
                                        </ul>
                                    </div>
                                    <div class="mt-auto">
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <div>
                                                <span class="h5 text-primary mb-0">${pkg.price}</span>
                                                <small class="text-muted d-block">${pkg.duration} • ${pkg.persons}</small>
                                            </div>
                                            <div class="text-warning">
                                                ${starRating}
                                            </div>
                                        </div>
                                        <button class="btn btn-primary w-100 book-package-btn" 
                                                data-package-id="${pkg.id}" 
                                                data-package-name="${pkg.name}">
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>`;
                    });
                    packagesContainer.html(html);
                } else {
                    packagesContainer.html(`
                        <div class="col-12 text-center">
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle me-2"></i>
                                No packages available at the moment. Please check back later.
                            </div>
                        </div>
                    `);
                }
            },
            error: function () {
                packagesContainer.html(`
                    <div class="col-12 text-center">
                        <div class="alert alert-danger">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            Failed to load packages. Please refresh the page to try again.
                        </div>
                        <button class="btn btn-primary" onclick="loadPackages()">
                            <i class="fas fa-refresh me-2"></i>Retry
                        </button>
                    </div>
                `);
            }
        });
    }
    
    // Auto-populate booking form when "Book Now" is clicked
    $(document).on('click', '.book-package-btn', function() {
        const packageName = $(this).data('package-name');
        const packageId = $(this).data('package-id');
        
        // Set the destination in booking form
        $('#bookingDestination').val(packageName);
        
        // Scroll to booking section
        $('html, body').animate({
            scrollTop: $('#booking').offset().top - 100
        }, 1000);
        
        // Optional: Show a message
        $('#booking-message').html(`
            <div class="alert alert-info alert-dismissible fade show" role="alert">
                <i class="fas fa-info-circle me-2"></i>
                <strong>Package Selected:</strong> ${packageName}. Please fill in your details below.
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `);
    });
    
    // Load packages on page load
    if ($('#packages-list').length > 0) {
        loadPackages();
    }
    
    // Set minimum date for booking datetime
    if ($('#bookingDatetime').length > 0) {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        $('#bookingDatetime').attr('min', now.toISOString().slice(0, 16));
    }
    
    // Add some interactive effects
    $('.package-item').hover(
        function() {
            $(this).addClass('shadow-lg').css('transform', 'translateY(-5px)');
        },
        function() {
            $(this).removeClass('shadow-lg').css('transform', 'translateY(0)');
        }
    );

})(jQuery);