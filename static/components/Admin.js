
export default {
    template: `
        <div class="container my-5">

            <div v-if="loading" class="text-center">
                <h4>Loading Admin Dashboard...</h4>
            </div>

            <div v-else-if="!authenticated" class="alert alert-danger">
                You are not authorized to access this page.
            </div>

            <div v-else>
            <div>
            <button @click="logout">Logout</button>
            </div>
                <h1 class="text-center mb-4">
                    Admin Dashboard
                </h1>

                <div v-if="error" class="alert alert-danger">
                    {{ error }}
                </div>

                <div v-if="message" class="alert alert-success">
                    {{ message }}
                </div>

                <!-- Dashboard Statistics -->
                <div class="row g-3 mb-4">
                    <div class="col-md-4" v-for="item in statistics"
                         :key="item.label">
                        <div class="card shadow-sm h-100">
                            <div class="card-body text-center">
                                <h6>{{ item.label }}</h6>
                                <h2>{{ item.value }}</h2>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Management Actions -->
                <h3>Management</h3>

                <div class="row g-3 mb-4">
                    <div class="col-md-4"
                         v-for="item in actions"
                         :key="item.label">
                        <button class="btn btn-outline-primary w-100"
                                @click="runAction(item.action)">
                            {{ item.label }}
                        </button>
                    </div>
                </div>

                <!-- Slot and Booking Controls -->
                <h3>Examination Controls</h3>

                <div class="card p-3 mb-4">
                    <label class="form-label">Select Examination</label>

                    <select v-model="selectedExam"
                            class="form-select mb-3">
                        <option value="">Select an examination</option>
                        <option v-for="exam in examinations"
                                :key="exam.exam_id"
                                :value="exam.exam_id">
                            {{ exam.exam_name }}
                        </option>
                    </select>

                    <div class="d-flex flex-wrap gap-2">
                        <button class="btn btn-success"
                                :disabled="!selectedExam"
                                @click="setExamControl('slots', true)">
                            Open Slot Creation
                        </button>

                        <button class="btn btn-secondary"
                                :disabled="!selectedExam"
                                @click="setExamControl('slots', false)">
                            Close Slot Creation
                        </button>

                        <button class="btn btn-success"
                                :disabled="!selectedExam"
                                @click="setExamControl('booking', true)">
                            Open Student Booking
                        </button>

                        <button class="btn btn-secondary"
                                :disabled="!selectedExam"
                                @click="setExamControl('booking', false)">
                            Close Student Booking
                        </button>
                    </div>
                </div>

                <!-- Search -->
                <h3>Search Records</h3>

                <div class="row g-2 mb-3">
                    <div class="col-md-3">
                        <select v-model="searchType" class="form-select">
                            <option value="students">Students</option>
                            <option value="examiners">Examiners</option>
                            <option value="examinations">Examinations</option>
                            <option value="bookings">Bookings</option>
                        </select>
                    </div>

                    <div class="col-md-7">
                        <input v-model="searchQuery"
                               class="form-control"
                               placeholder="Enter a name, email, or ID"
                               @keyup.enter="searchRecords">
                    </div>

                    <div class="col-md-2">
                        <button class="btn btn-primary w-100"
                                @click="searchRecords">
                            Search
                        </button>
                    </div>
                </div>

                <div class="table-responsive">
                    <table class="table table-bordered table-striped">
                        <thead>
                            <tr>
                                <th v-for="column in resultColumns"
                                    :key="column">
                                    {{ column }}
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr v-for="(record, index) in searchResults"
                                :key="record.id || record.booking_id ||
                                      record.exam_id || record.student_id ||
                                      record.examiner_id || index">
                                <td v-for="column in resultColumns"
                                    :key="column">
                                    {{ record[column] ?? '-' }}
                                </td>
                            </tr>

                            <tr v-if="searchResults.length === 0">
                                <td :colspan="resultColumns.length || 1"
                                    class="text-center">
                                    No records found.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <button class="btn btn-outline-dark"
                        @click="loadDashboard">
                    Refresh Dashboard
                </button>
            </div>
        </div>
    `,

data() {
        return {
            apiBase: "http://localhost:5000/api/admin",

            authenticated: false,
            loading: true,
            error: "",
            message: "",

            dashboard: {
                total_courses: 0,
                total_examinations: 0,
                total_students: 0,
                total_examiners: 0,
                total_slots: 0,
                total_bookings: 0
            },

            examinations: [],
            selectedExam: "",

            searchType: "students",
            searchQuery: "",
            searchResults: [],
            resultColumns: []
        };
    },

    computed: {
        statistics() {
            return [
                {
                    label: "Total Courses",
                    value: this.dashboard.total_courses
                },
                {
                    label: "Total Examinations",
                    value: this.dashboard.total_examinations
                },
                {
                    label: "Total Students",
                    value: this.dashboard.total_students
                },
                {
                    label: "Total Examiners",
                    value: this.dashboard.total_examiners
                },
                {
                    label: "Total Examination Slots",
                    value: this.dashboard.total_slots
                },
                {
                    label: "Total Bookings",
                    value: this.dashboard.total_bookings
                }
            ];
        },

        actions() {
            return [
                { label: "Manage Courses", action: "courses" },
                { label: "Manage Examinations", action: "examinations" },
                { label: "Manage Rubrics", action: "rubrics" },
                { label: "Add Examiners", action: "examiners" },
                { label: "View Examiner Slots", action: "slots" },
                { label: "View All Bookings", action: "bookings" },
                { label: "Publish Results", action: "results" }
            ];
        }
    },

    mounted() {
        this.authenticate();
    },

    methods: {
        logout(){
            localStorage.removeItem("auth-token");
            localStorage.removeItem("role");
            this.$router.push('/login');
        },
        async authenticate() {
            const token = localStorage.getItem("auth-token");

            if (!token) {
                this.authenticated = false;
                this.loading = false;
                return;
            }

            try {
                // Ask Flask to validate the token and admin role.
                const result = await this.apiRequest("/dashboard");

                this.dashboard = result;
                this.authenticated = true;

                await this.loadExaminations();

            } catch (err) {
                this.authenticated = false;
                this.error = err.message;
                console.error("Admin authentication failed:", err);

            } finally {
                this.loading = false;
            }
        },

        async apiRequest(path, options = {}) {
            const token = localStorage.getItem("auth-token");

            if (!token) {
                this.authenticated = false;
                throw new Error("Please log in first.");
            }

            const response = await fetch(`${this.apiBase}${path}`, {
                ...options,
                headers: {
                    ...options.headers,
                    "Content-Type": "application/json",
                    "Authentication-Token": token
                }
            });

            const result = await response.json().catch(() => ({}));

            if (response.status === 401 || response.status === 403) {
                this.authenticated = false;

                throw new Error(
                    result.message || "You are not authorized to access this resource."
                );
            }

            if (!response.ok) {
                throw new Error(
                    result.message || `Request failed: ${response.status}`
                );
            }

            return result;
        },

        async loadDashboard() {
            this.error = "";
            this.message = "";

            try {
                this.dashboard = await this.apiRequest("/dashboard");
                await this.loadExaminations();

                this.message = "Dashboard refreshed.";

            } catch (err) {
                this.error = err.message;
            }
        },

        async loadExaminations() {
            const result = await this.apiRequest("/examinations");

            this.examinations = result.examinations || [];
        },

        async setExamControl(control, enabled) {
            this.error = "";
            this.message = "";

            if (!this.selectedExam) {
                this.error = "Please select an examination first.";
                return;
            }

            try {
                const result = await this.apiRequest(
                    `/examinations/${this.selectedExam}/controls`,
                    {
                        method: "PATCH",
                        body: JSON.stringify({
                            control,
                            enabled
                        })
                    }
                );

                this.message = result.message;
                await this.loadExaminations();

            } catch (err) {
                this.error = err.message;
            }
        },

        async searchRecords() {
            this.error = "";
            this.searchResults = [];
            this.resultColumns = [];

            try {
                const result = await this.apiRequest(
                    `/search?type=${encodeURIComponent(this.searchType)}` +
                    `&q=${encodeURIComponent(this.searchQuery)}`
                );

                this.searchResults = result.results || [];

                if (this.searchResults.length > 0) {
                    this.resultColumns = Object.keys(
                        this.searchResults[0]
                    );
                }

            } catch (err) {
                this.error = err.message;
            }
        },

        runAction(action) {
            const routes = {
                courses: "/admin/courses",
                examinations: "/admin/examinations",
                rubrics: "/admin/rubrics",
                examiners: "/admin/examiners",
                slots: "/admin/slots",
                bookings: "/admin/bookings",
                results: "/admin/results"
            };

            if (!routes[action]) {
                this.error = "Unknown admin action.";
                return;
            }

            if (!this.$router) {
                this.error = "Vue Router is not configured.";
                return;
            }

            this.$router.push(routes[action]);
        }
    }
};
