
export default {
    template: `
        <div class="container-fluid py-4 px-3 px-lg-5 bg-light min-vh-100">

            <!-- Header -->
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <div class="text-primary small fw-semibold mb-2">
                        EXAMINATION APP / STUDENT
                    </div>
                    <h2 class="fw-bold text-dark mb-1">Student Dashboard</h2>
                    <p class="text-secondary mb-0">
                        Discover examinations, manage bookings and view your results.
                    </p>
                </div>

                <button class="btn btn-outline-secondary"
                        @click="refreshAll"
                        :disabled="loading">
                    <span v-if="loading"
                          class="spinner-border spinner-border-sm me-2"></span>
                    <span v-else class="me-2">&#8635;</span>
                    Refresh
                </button>
            </div>

            <!-- Alerts -->
            <div v-if="message" class="alert alert-success">
                {{ message }}
            </div>

            <div v-if="error" class="alert alert-danger">
                {{ error }}
            </div>

            <!-- Dashboard statistics -->
            <div class="row g-3 mb-4">
                <div class="col-6 col-xl-3"
                     v-for="item in dashboardCards"
                     :key="item.label">
                    <div class="card border-0 shadow-sm rounded-4 h-100">
                        <div class="card-body p-4">
                            <div class="text-secondary small mb-2">
                                {{ item.label }}
                            </div>
                            <div class="fs-2 fw-bold">
                                {{ item.value }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Navigation -->
            <ul class="nav nav-pills flex-wrap gap-2 mb-4">
                <li class="nav-item">
                    <button class="nav-link"
                            :class="{ active: activeTab === 'examinations' }"
                            @click="activeTab = 'examinations'">
                        <i class="bi bi-journal-text me-1"></i>
                        Examinations
                    </button>
                </li>

                <li class="nav-item">
                    <button class="nav-link"
                            :class="{ active: activeTab === 'slots' }"
                            @click="openSlotsTab">
                        Available Slots
                    </button>
                </li>

                <li class="nav-item">
                    <button class="nav-link"
                            :class="{ active: activeTab === 'bookings' }"
                            @click="activeTab = 'bookings'">
                        My Bookings
                    </button>
                </li>

                <li class="nav-item">
                    <button class="nav-link"
                            :class="{ active: activeTab === 'history' }"
                            @click="activeTab = 'history'">
                        Booking History
                    </button>
                </li>

                <li class="nav-item">
                    <button class="nav-link"
                            :class="{ active: activeTab === 'results' }"
                            @click="activeTab = 'results'">
                        Results
                    </button>
                </li>

                <li class="nav-item">
                    <button class="nav-link"
                            :class="{ active: activeTab === 'profile' }"
                            @click="openProfile">
                        My Profile
                    </button>
                </li>
            </ul>

            <!-- ===================================== -->
            <!-- EXAMINATIONS -->
            <!-- ===================================== -->

            <div v-if="activeTab === 'examinations'"
                 class="card border-0 shadow-sm rounded-4">

                <div class="card-header bg-white border-0 p-4">
                    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
                        <div>
                            <h5 class="fw-bold mb-1">Available Examinations</h5>
                            <p class="text-secondary small mb-0">
                                Search and explore examinations available to you.
                            </p>
                        </div>

                        <input class="form-control"
                               style="max-width: 300px"
                               v-model="examSearch"
                               placeholder="Search by exam or course...">
                    </div>
                </div>

                <div v-if="loadingExaminations" class="p-4">
                    Loading examinations...
                </div>

                <div v-else-if="!filteredExaminations.length"
                     class="p-4 text-secondary">
                    No examinations found.
                </div>

                <div v-else class="table-responsive">
                    <table class="table align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th class="ps-4">Examination</th>
                                <th>Course</th>
                                <th>Type</th>
                                <th>Duration</th>
                                <th>Max Marks</th>
                                <th>Status</th>
                                <th class="text-end pe-4">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr v-for="exam in filteredExaminations"
                                :key="exam.exam_id">

                                <td class="ps-4">
                                    <div class="fw-semibold">
                                        {{ exam.exam_name }}
                                    </div>
                                    <small class="text-secondary">
                                        ID: {{ exam.exam_id }}
                                    </small>
                                </td>

                                <td>{{ exam.course_name || '—' }}</td>
                                <td>{{ exam.exam_type || '—' }}</td>
                                <td>{{ exam.duration || '—' }} min</td>
                                <td>{{ exam.max_marks || '—' }}</td>

                                <td>
                                    <span class="badge rounded-pill"
                                          :class="statusClass(exam.exam_status)">
                                        {{ exam.exam_status || 'Pending' }}
                                    </span>
                                </td>

                                <td class="text-end pe-4">
                                    <button class="btn btn-sm btn-primary"
                                            @click="viewExamSlots(exam)"
                                            :disabled="!exam.booking_open">
                                        View Slots
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- ===================================== -->
            <!-- AVAILABLE SLOTS -->
            <!-- ===================================== -->

            <div v-if="activeTab === 'slots'"
                 class="card border-0 shadow-sm rounded-4">

                <div class="card-header bg-white p-4">
                    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
                        <div>
                            <h5 class="fw-bold mb-1">
                                Available Examination Slots
                            </h5>
                            <p class="text-secondary small mb-0">
                                Select an available slot to book your examination.
                            </p>
                        </div>

                        <button v-if="selectedExam"
                                class="btn btn-outline-secondary btn-sm"
                                @click="selectedExam = null">
                            Show All Examinations
                        </button>
                    </div>
                </div>

                <div class="p-4">
                    <input class="form-control mb-3"
                           v-model="slotSearch"
                           placeholder="Search examination, date or examiner...">

                    <div v-if="loadingSlots" class="text-secondary">
                        Loading available slots...
                    </div>

                    <div v-else-if="!filteredSlots.length"
                         class="text-secondary">
                        No available slots found.
                    </div>

                    <div v-else class="row g-3">
                        <div class="col-12 col-md-6 col-xl-4"
                             v-for="slot in filteredSlots"
                             :key="slot.slot_id">

                            <div class="card border rounded-4 h-100">
                                <div class="card-body p-4">
                                    <div class="d-flex justify-content-between align-items-start mb-3">
                                        <span class="badge text-bg-primary">
                                            {{ slot.exam_name || examName(slot.exam_id) }}
                                        </span>

                                        <span class="badge text-bg-success">
                                            Available
                                        </span>
                                    </div>

                                    <h6 class="fw-bold mb-3">
                                        Examination Slot
                                    </h6>

                                    <p class="small text-secondary mb-2">
                                        <strong>Date:</strong>
                                        {{ slot.date }}
                                    </p>

                                    <p class="small text-secondary mb-2">
                                        <strong>Time:</strong>
                                        {{ slot.start_time }} - {{ slot.end_time }}
                                    </p>

                                    <p class="small text-secondary mb-2">
                                        <strong>Examiner:</strong>
                                        {{ slot.examiner_name || 'Assigned Examiner' }}
                                    </p>

                                    <p class="small text-secondary mb-3">
                                        <strong>Available Seats:</strong>
                                        {{ slot.available_seats }}
                                    </p>

                                    <button class="btn btn-primary w-100"
                                            @click="bookSlot(slot)"
                                            :disabled="bookingSlotId === slot.slot_id || Number(slot.available_seats) <= 0">
                                        <span v-if="bookingSlotId === slot.slot_id"
                                              class="spinner-border spinner-border-sm me-2"></span>
                                        Book This Slot
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ===================================== -->
            <!-- MY BOOKINGS -->
            <!-- ===================================== -->

            <div v-if="activeTab === 'bookings'"
                 class="card border-0 shadow-sm rounded-4">

                <div class="card-header bg-white p-4">
                    <h5 class="fw-bold mb-1">My Examination Bookings</h5>
                    <p class="text-secondary small mb-0">
                        View and manage your upcoming examination slots.
                    </p>
                </div>

                <div v-if="loadingBookings" class="p-4">
                    Loading bookings...
                </div>

                <div v-else-if="!activeBookings.length"
                     class="p-4 text-secondary">
                    You have no active bookings.
                </div>

                <div v-else class="table-responsive">
                    <table class="table align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th class="ps-4">Examination</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Examiner</th>
                                <th>Status</th>
                                <th class="text-end pe-4">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr v-for="booking in activeBookings"
                                :key="booking.booking_id">

                                <td class="ps-4">
                                    <div class="fw-semibold">
                                        {{ booking.exam_name || examName(booking.exam_id) }}
                                    </div>
                                    <small class="text-secondary">
                                        Booking #{{ booking.booking_id }}
                                    </small>
                                </td>

                                <td>{{ booking.date || '—' }}</td>

                                <td>
                                    {{ booking.start_time || '—' }}
                                    -
                                    {{ booking.end_time || '—' }}
                                </td>

                                <td>{{ booking.examiner_name || '—' }}</td>

                                <td>
                                    <span class="badge"
                                          :class="statusClass(booking.booking_status)">
                                        {{ booking.booking_status }}
                                    </span>
                                </td>

                                <td class="text-end pe-4">
                                    <button class="btn btn-sm btn-outline-danger"
                                            @click="cancelBooking(booking)"
                                            :disabled="!booking.can_cancel || cancellingBookingId === booking.booking_id">
                                        <span v-if="cancellingBookingId === booking.booking_id"
                                              class="spinner-border spinner-border-sm"></span>
                                        <span v-else>Cancel</span>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- ===================================== -->
            <!-- BOOKING HISTORY -->
            <!-- ===================================== -->

            <div v-if="activeTab === 'history'"
                 class="card border-0 shadow-sm rounded-4">

                <div class="card-header bg-white p-4">
                    <h5 class="fw-bold mb-1">Booking History</h5>
                    <p class="text-secondary small mb-0">
                        Review all your previous and current bookings.
                    </p>
                </div>

                <div v-if="loadingHistory" class="p-4">
                    Loading booking history...
                </div>

                <div v-else-if="!history.length"
                     class="p-4 text-secondary">
                    No booking history available.
                </div>

                <div v-else class="table-responsive">
                    <table class="table align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th class="ps-4">Booking ID</th>
                                <th>Examination</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Booking Status</th>
                                <th>Evaluation</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr v-for="booking in history"
                                :key="booking.booking_id">

                                <td class="ps-4">
                                    #{{ booking.booking_id }}
                                </td>

                                <td>
                                    {{ booking.exam_name || examName(booking.exam_id) }}
                                </td>

                                <td>{{ booking.date || '—' }}</td>

                                <td>
                                    {{ booking.start_time || '—' }}
                                    -
                                    {{ booking.end_time || '—' }}
                                </td>

                                <td>
                                    <span class="badge"
                                          :class="statusClass(booking.booking_status)">
                                        {{ booking.booking_status }}
                                    </span>
                                </td>

                                <td>
                                    {{ booking.evaluation_status || 'Pending' }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- ===================================== -->
            <!-- RESULTS -->
            <!-- ===================================== -->

            <div v-if="activeTab === 'results'"
                 class="card border-0 shadow-sm rounded-4">

                <div class="card-header bg-white p-4">
                    <h5 class="fw-bold mb-1">Published Examination Results</h5>
                    <p class="text-secondary small mb-0">
                        View your published marks and examiner remarks.
                    </p>
                </div>

                <div v-if="loadingResults" class="p-4">
                    Loading results...
                </div>

                <div v-else-if="!results.length"
                     class="p-4 text-secondary">
                    No published results are available yet.
                </div>

                <div v-else class="p-4">
                    <div class="row g-3">
                        <div class="col-12 col-lg-6"
                             v-for="result in results"
                             :key="result.evaluation_id">

                            <div class="card border rounded-4 h-100">
                                <div class="card-body p-4">

                                    <div class="d-flex justify-content-between align-items-start mb-3">
                                        <div>
                                            <h6 class="fw-bold mb-1">
                                                {{ result.exam_name }}
                                            </h6>
                                            <small class="text-secondary">
                                                {{ result.course_name || 'Examination' }}
                                            </small>
                                        </div>

                                        <span class="badge text-bg-success">
                                            Published
                                        </span>
                                    </div>

                                    <div class="row g-3 mb-3">
                                        <div class="col-6">
                                            <div class="bg-light rounded-3 p-3">
                                                <small class="text-secondary">
                                                    Marks Obtained
                                                </small>
                                                <h4 class="fw-bold mb-0">
                                                    {{ result.marks_obtained }}
                                                </h4>
                                            </div>
                                        </div>

                                        <div class="col-6">
                                            <div class="bg-light rounded-3 p-3">
                                                <small class="text-secondary">
                                                    Maximum Marks
                                                </small>
                                                <h4 class="fw-bold mb-0">
                                                    {{ result.total_marks }}
                                                </h4>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="mb-2">
                                        <strong class="small">Examiner Remarks</strong>
                                        <p class="text-secondary small mt-1 mb-0">
                                            {{ result.remarks || 'No remarks provided.' }}
                                        </p>
                                    </div>

                                    <div class="small text-secondary mt-3">
                                        Evaluation Date:
                                        {{ result.evaluation_date || '—' }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ===================================== -->
            <!-- PROFILE -->
            <!-- ===================================== -->

            <div v-if="activeTab === 'profile'"
                 class="row justify-content-center">

                <div class="col-12 col-lg-8 col-xl-6">
                    <div class="card border-0 shadow-sm rounded-4">

                        <div class="card-header bg-white p-4">
                            <h5 class="fw-bold mb-1">My Profile</h5>
                            <p class="text-secondary small mb-0">
                                View and update your student information.
                            </p>
                        </div>

                        <div class="card-body p-4">
                            <form @submit.prevent="updateProfile">

                                <div class="mb-3">
                                    <label class="form-label fw-semibold">
                                        Username
                                    </label>
                                    <input type="text"
                                           class="form-control"
                                           v-model.trim="profile.username"
                                           required>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label fw-semibold">
                                        Email Address
                                    </label>
                                    <input type="email"
                                           class="form-control"
                                           v-model.trim="profile.email"
                                           required>
                                </div>

                                <div class="mb-4">
                                    <label class="form-label fw-semibold">
                                        New Password
                                    </label>
                                    <input type="password"
                                           class="form-control"
                                           v-model="profile.new_password"
                                           placeholder="Leave blank to keep current password">
                                    <small class="text-secondary">
                                        Only enter a password if you want to change it.
                                    </small>
                                </div>

                                <button type="submit"
                                        class="btn btn-primary w-100"
                                        :disabled="savingProfile">
                                    <span v-if="savingProfile"
                                          class="spinner-border spinner-border-sm me-2"></span>
                                    Save Profile
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    `,

    data() {
        return {
            apiBase: "http://localhost:5000/api/student",

            activeTab: "examinations",

            loading: false,
            loadingExaminations: false,
            loadingSlots: false,
            loadingBookings: false,
            loadingHistory: false,
            loadingResults: false,
            loadingProfile: false,

            savingProfile: false,

            error: "",
            message: "",

            examinations: [],
            slots: [],
            bookings: [],
            history: [],
            results: [],

            selectedExam: null,

            examSearch: "",
            slotSearch: "",

            bookingSlotId: null,
            cancellingBookingId: null,

            stats: {
                available_examinations: 0,
                available_slots: 0,
                upcoming_examinations: 0,
                booked_examinations: 0
            },

            profile: {
                username: "",
                email: "",
                new_password: ""
            }
        };
    },

    computed: {
        dashboardCards() {
            return [
                {
                    label: "Available Examinations",
                    value: this.stats.available_examinations
                },
                {
                    label: "Available Slots",
                    value: this.stats.available_slots
                },
                {
                    label: "Upcoming Examinations",
                    value: this.stats.upcoming_examinations
                },
                {
                    label: "My Bookings",
                    value: this.stats.booked_examinations
                }
            ];
        },

        filteredExaminations() {
            const query = this.examSearch.trim().toLowerCase();

            if (!query) return this.examinations;

            return this.examinations.filter(exam =>
                String(exam.exam_name || "")
                    .toLowerCase().includes(query) ||
                String(exam.course_name || "")
                    .toLowerCase().includes(query) ||
                String(exam.exam_type || "")
                    .toLowerCase().includes(query)
            );
        },

        filteredSlots() {
            let data = this.slots;

            if (this.selectedExam) {
                data = data.filter(slot =>
                    String(slot.exam_id) === String(this.selectedExam)
                );
            }

            const query = this.slotSearch.trim().toLowerCase();

            if (!query) return data;

            return data.filter(slot =>
                String(slot.exam_name || this.examName(slot.exam_id))
                    .toLowerCase().includes(query) ||
                String(slot.date || "").toLowerCase().includes(query) ||
                String(slot.examiner_name || "").toLowerCase().includes(query)
            );
        },

        activeBookings() {
            return this.bookings.filter(booking =>
                !["cancelled", "canceled", "completed"].includes(
                    String(booking.booking_status || "").toLowerCase()
                )
            );
        }
    },

    mounted() {
        this.refreshAll();
    },

    methods: {

        // =====================================
        // COMMON API REQUEST
        // =====================================

        async apiRequest(path, options = {}) {
            const token = localStorage.getItem("auth-token");

            if (!token) {
                throw new Error("Please log in with your student account.");
            }

            const response = await fetch(`${this.apiBase}${path}`, {
                ...options,
                headers: {
                    ...(options.headers || {}),
                    "Content-Type": "application/json",
                    "Authentication-Token": token
                }
            });

            const result = await response.json().catch(() => ({}));

            if (response.status === 401 || response.status === 403) {
                throw new Error(
                    result.message || "You are not authorized to access this page."
                );
            }

            if (!response.ok) {
                throw new Error(
                    result.message || `Request failed: ${response.status}`
                );
            }

            return result;
        },

        // =====================================
        // REFRESH DASHBOARD
        // =====================================

        async refreshAll() {
            this.loading = true;
            this.error = "";
            this.message = "";

            const results = await Promise.allSettled([
                this.loadDashboard(),
                this.loadExaminations(),
                this.loadSlots(),
                this.loadBookings()
            ]);

            const failed = results.find(
                result => result.status === "rejected"
            );

            if (failed) {
                this.error = failed.reason.message ||
                    "Some dashboard data could not be loaded.";
            }

            this.loading = false;
        },

        // =====================================
        // DASHBOARD STATISTICS
        // =====================================

        async loadDashboard() {
            const result = await this.apiRequest("/dashboard");

            if (result.stats) {
                this.stats = {
                    ...this.stats,
                    ...result.stats
                };
            }
        },

        // =====================================
        // EXAMINATIONS
        // =====================================

        async loadExaminations() {
            this.loadingExaminations = true;

            try {
                const result = await this.apiRequest("/examinations");

                this.examinations = result.examinations || [];

                this.stats.available_examinations =
                    this.examinations.filter(
                        exam => exam.booking_open
                    ).length;
            } finally {
                this.loadingExaminations = false;
            }
        },

        examName(examId) {
            const exam = this.examinations.find(
                item => String(item.exam_id) === String(examId)
            );

            return exam ? exam.exam_name : `Examination #${examId || "—"}`;
        },

        viewExamSlots(exam) {
            this.selectedExam = exam.exam_id;
            this.slotSearch = "";
            this.activeTab = "slots";
            this.error = "";
        },

        openSlotsTab() {
            this.selectedExam = null;
            this.activeTab = "slots";
        },

        // =====================================
        // AVAILABLE SLOTS
        // =====================================

        async loadSlots() {
            this.loadingSlots = true;

            try {
                const result = await this.apiRequest("/slots");

                this.slots = result.slots || [];

                this.stats.available_slots = this.slots.length;
            } finally {
                this.loadingSlots = false;
            }
        },

        // =====================================
        // BOOK SLOT
        // =====================================

        async bookSlot(slot) {
            if (!window.confirm(
                `Are you sure you want to book ${slot.exam_name || this.examName(slot.exam_id)} on ${slot.date}?`
            )) {
                return;
            }

            this.error = "";
            this.message = "";
            this.bookingSlotId = slot.slot_id;

            try {
                const result = await this.apiRequest(
                    `/slots/${slot.slot_id}/book`,
                    {
                        method: "POST",
                        body: JSON.stringify({})
                    }
                );

                this.message = result.message ||
                    "Examination slot booked successfully.";

                await Promise.all([
                    this.loadSlots(),
                    this.loadBookings(),
                    this.loadDashboard()
                ]);

                this.activeTab = "bookings";
            } catch (err) {
                this.error = err.message;
            } finally {
                this.bookingSlotId = null;
            }
        },

        // =====================================
        // BOOKINGS
        // =====================================

        async loadBookings() {
            this.loadingBookings = true;

            try {
                const result = await this.apiRequest("/bookings");

                this.bookings = result.bookings || [];

                this.stats.booked_examinations =
                    this.activeBookings.length;
            } finally {
                this.loadingBookings = false;
            }
        },

        // =====================================
        // CANCEL BOOKING
        // =====================================

        async cancelBooking(booking) {
            if (!booking.can_cancel) {
                this.error = "The cancellation deadline has passed.";
                return;
            }

            if (!window.confirm(
                "Are you sure you want to cancel this booking?"
            )) {
                return;
            }

            this.error = "";
            this.message = "";
            this.cancellingBookingId = booking.booking_id;

            try {
                const result = await this.apiRequest(
                    `/bookings/${booking.booking_id}/cancel`,
                    {
                        method: "PATCH",
                        body: JSON.stringify({})
                    }
                );

                this.message = result.message ||
                    "Booking cancelled successfully.";

                await Promise.all([
                    this.loadBookings(),
                    this.loadSlots(),
                    this.loadDashboard()
                ]);
            } catch (err) {
                this.error = err.message;
            } finally {
                this.cancellingBookingId = null;
            }
        },

        // =====================================
        // BOOKING HISTORY
        // =====================================

        async loadHistory() {
            this.loadingHistory = true;

            try {
                const result = await this.apiRequest("/history");

                this.history = result.history || [];
            } finally {
                this.loadingHistory = false;
            }
        },

        // =====================================
        // RESULTS
        // =====================================

        async loadResults() {
            this.loadingResults = true;

            try {
                const result = await this.apiRequest("/results");

                this.results = result.results || [];
            } finally {
                this.loadingResults = false;
            }
        },

        // =====================================
        // PROFILE
        // =====================================

        async openProfile() {
            this.activeTab = "profile";
            this.error = "";
            this.message = "";

            if (this.profile.email) return;

            this.loadingProfile = true;

            try {
                const result = await this.apiRequest("/profile");

                this.profile = {
                    username: result.profile.username || "",
                    email: result.profile.email || "",
                    new_password: ""
                };
            } catch (err) {
                this.error = err.message;
            } finally {
                this.loadingProfile = false;
            }
        },

        async updateProfile() {
            this.error = "";
            this.message = "";
            this.savingProfile = true;

            try {
                const payload = {
                    username: this.profile.username,
                    email: this.profile.email
                };

                if (this.profile.new_password) {
                    payload.new_password = this.profile.new_password;
                }

                const result = await this.apiRequest("/profile", {
                    method: "PUT",
                    body: JSON.stringify(payload)
                });

                this.message = result.message ||
                    "Profile updated successfully.";

                this.profile.new_password = "";
            } catch (err) {
                this.error = err.message;
            } finally {
                this.savingProfile = false;
            }
        },

        // =====================================
        // STATUS BADGES
        // =====================================

        statusClass(status) {
            const value = String(status || "").toLowerCase();

            if (
                ["active", "available", "confirmed", "booked",
                 "published", "completed", "submitted"].includes(value)
            ) {
                return "text-bg-success";
            }

            if (
                ["pending", "scheduled", "upcoming", "in_progress"].includes(value)
            ) {
                return "text-bg-warning";
            }

            if (
                ["cancelled", "canceled", "closed", "inactive",
                 "rejected"].includes(value)
            ) {
                return "text-bg-secondary";
            }

            return "text-bg-light text-dark border";
        }
    },

    watch: {
        activeTab(newTab) {
            this.error = "";

            if (newTab === "history") {
                this.loadHistory().catch(err => {
                    this.error = err.message;
                });
            }

            if (newTab === "results") {
                this.loadResults().catch(err => {
                    this.error = err.message;
                });
            }
        }
    }
};
