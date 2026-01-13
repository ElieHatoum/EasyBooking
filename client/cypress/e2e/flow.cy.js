describe("EasyBooking E2E Flow", () => {
    const apiUrl = "http://localhost:3000/api";

    // --- MOCK DATA ---
    const mockUser = {
        username: "CypressUser",
        email: "cypress@test.com",
        password: "password123",
    };

    const mockAuthResponse = {
        accessToken: "fake-jwt-token",
        userId: "user123",
    };

    const mockRooms = [
        { _id: "room1", name: "Salle A", capacity: 20 },
        { _id: "room2", name: "Salle B", capacity: 5 },
    ];

    const getFutureDate = (hoursToAdd = 24) => {
        const date = new Date();
        date.setHours(date.getHours() + hoursToAdd);
        return date.toISOString();
    };

    const mockBooking = {
        _id: "booking123",
        roomId: "room1",
        startTime: getFutureDate(24),
        endTime: getFutureDate(25),
        room: { name: "Salle A" },
    };

    // --- SETUP INTERCEPTORS BEFORE EACH TEST ---
    beforeEach(() => {
        // Intercept Register
        cy.intercept("POST", `${apiUrl}/auth/register`, {
            statusCode: 201,
            body: { message: "User created" },
        }).as("registerUser");

        // Intercept Login
        cy.intercept("POST", `${apiUrl}/auth/login`, {
            statusCode: 200,
            body: mockAuthResponse,
        }).as("loginUser");

        // Intercept Get Rooms
        cy.intercept("GET", `${apiUrl}/rooms*`, {
            statusCode: 200,
            body: mockRooms,
        }).as("getRooms");

        // Intercept Availability Check
        cy.intercept("GET", `${apiUrl}/rooms/*/availability*`, {
            statusCode: 200,
            body: {
                roomId: "room1",
                availableSlots: [
                    { startTime: getFutureDate(0), endTime: getFutureDate(10) },
                ],
            },
        }).as("getAvailability");

        // Intercept Create Booking
        cy.intercept("POST", `${apiUrl}/bookings`, {
            statusCode: 201,
            body: mockBooking,
        }).as("createBooking");

        // Intercept Get My Bookings
        cy.intercept("GET", `${apiUrl}/bookings/my-bookings`, {
            statusCode: 200,
            body: [mockBooking],
        }).as("getMyBookings");

        // Intercept Delete Booking
        cy.intercept("DELETE", `${apiUrl}/bookings/*`, {
            statusCode: 200,
            body: { message: "Booking deleted" },
        }).as("deleteBooking");
    });

    it("Complete User Journey: Register -> Login -> Book -> Cancel", () => {
        // Registration
        cy.visit("http://localhost:5173/register");

        // Check UI
        cy.contains("Create an Account").should("be.visible");

        // Fill Form
        cy.get('input[placeholder="John Doe"]').type(mockUser.username);
        cy.get('input[type="email"]').type(mockUser.email);
        cy.get('input[type="password"]').type(mockUser.password);

        // Mock Window Alert for registration
        let registrationAlertCalled = false;
        cy.on("window:alert", (msg) => {
            if (msg === "Account created successfully! Please login.") {
                registrationAlertCalled = true;
            }
        });

        // Submit
        cy.get('button[type="submit"]').click();

        // Verify API call and Redirect
        cy.wait("@registerUser")
            .its("request.body")
            .should("deep.include", mockUser);
        cy.url().should("include", "/login");
        cy.then(() => {
            expect(registrationAlertCalled).to.be.true;
        });

        // Login
        cy.contains("Welcome Back").should("be.visible");

        // Fill Form
        cy.get('input[type="email"]').type(mockUser.email);
        cy.get('input[type="password"]').type(mockUser.password);
        cy.get('button[type="submit"]').click();

        // Verify API call and Redirect
        cy.wait("@loginUser");
        cy.url().should("eq", "http://localhost:5173/"); // Dashboard

        // Verify Navbar updated
        cy.get("nav").contains("Logout").should("be.visible");
        cy.get("nav").contains("My Bookings").should("be.visible");

        // Dashboard & Search
        // Verify rooms loaded
        cy.wait("@getRooms");
        cy.contains("Salle A").should("be.visible");
        cy.contains("Capacity: 20").should("be.visible");
        cy.contains("Salle B").should("be.visible");
        cy.contains("Capacity: 5").should("be.visible");

        // Test Search Filter
        cy.intercept("GET", `${apiUrl}/rooms?capacity=15`, {
            statusCode: 200,
            body: [mockRooms[0]], // Return ONLY Salle A
        }).as("getFilteredRooms");

        cy.get('input[placeholder="e.g. 10"]').type("15{enter}");

        cy.wait("@getFilteredRooms");

        cy.contains("Salle A").should("be.visible");
        cy.contains("Salle B").should("not.exist");

        // Booking a room
        // Reset intercept for specific room booking flow
        cy.contains("h3", "Salle A").parent().next().find("button").click();

        // Modal should appear
        cy.contains("Booking: Salle A").should("be.visible");

        // Check if availability slots are rendered
        cy.contains("Available Slots").should("be.visible");

        // Setup Alert handler for Booking Success
        let bookingAlertCalled = false;
        cy.on("window:alert", (msg) => {
            if (msg === "Room booked successfully!") {
                bookingAlertCalled = true;
            }
        });

        // Select Time
        cy.get("label").contains("End Time").next("select").select("10:00");

        // Confirm Booking
        cy.contains("Confirm Booking").click();

        // Verify API Call
        cy.wait("@createBooking").then((interception) => {
            expect(interception.request.body).to.have.property(
                "roomId",
                "room1"
            );
        });

        // Verify Success Alert and Modal Close
        cy.then(() => {
            expect(bookingAlertCalled).to.be.true;
        });
        cy.contains("Booking: Salle A").should("not.exist");

        // My Bookings and cancellation
        cy.get("nav").contains("My Bookings").click();
        cy.url().should("include", "/my-bookings");

        cy.wait("@getMyBookings");

        // Verify Booking Card content
        cy.contains("My Reservations").should("be.visible");
        cy.contains("Salle A").should("be.visible");
        cy.contains("Confirmed").should("be.visible");

        // Stub Window Confirm (User clicks OK to cancel)
        cy.on("window:confirm", () => true);

        // Click Cancel
        cy.contains("Cancel Reservation").click();

        // Verify API Call
        cy.wait("@deleteBooking")
            .its("request.url")
            .should("include", "/bookings/booking123");

        // Verify UI Update
        cy.contains("Salle A").should("not.exist");
        cy.contains("No upcoming bookings found").should("be.visible");
    });

    it("Should handle Login Errors gracefully", () => {
        // Override default intercept for this specific test
        cy.intercept("POST", `${apiUrl}/auth/login`, {
            statusCode: 401,
            body: { msg: "Invalid credentials" },
        }).as("loginFail");

        cy.visit("http://localhost:5173/login");

        cy.get('input[type="email"]').type("wrong@test.com");
        cy.get('input[type="password"]').type("wrongpass");
        cy.get('button[type="submit"]').click();

        cy.wait("@loginFail");

        // Assert Error Message Box appears
        cy.contains("Invalid credentials").should("be.visible");
        // Assert we are still on login page
        cy.url().should("include", "/login");
    });
});
