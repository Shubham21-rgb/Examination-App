
export default {
    template: `
        <div class="container-fluid py-4 px-3 px-lg-5 bg-light min-vh-100">

            <!-- Header -->
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <div class="text-primary small fw-semibold mb-2">
                        EXAMINATION APP / EXAMINER
                    </div>
                    <h2 class="fw-bold text-dark mb-1">Examiner Dashboard</h2>
                    <p class="text-secondary mb-0">
                        Manage examinations, slots, bookings and evaluations.
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
            <div v-if="message" class="alert alert-success" role="status">
                {{ message }}
            </div>

            <div v-if="error" class="alert alert-danger" role="alert">
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
                            <div class="fs-2 fw-bold">{{ item.value }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Navigation tabs -->
            <ul class="nav nav-pills flex-wrap gap-2 mb-4">
                <li class="nav-item">
                    <button class="nav-link"
                            :class="{ active: activeTab === 'examinations' }"
                            @click="activeTab = 'examinations'">
                        Assigned Examinations
                    </button>
                </li>

                <li class="nav-item">
                    <button class="nav-link"
                            :class="{ active: activeTab === 'slots' }"
                            @click="activeTab = 'slots'">
                        My Slots
                    </button>
                </li>

                <li class="nav-item">
                    <button class="nav-link"
                            :class="{ active: activeTab === 'bookings' }"
                            @click="activeTab = 'bookings'">
                        Booked Students
                    </button>
                </li>

                <li class="nav-item">
                    <button class="nav-link"
                            :class="{ active: activeTab === 'evaluations' }"
                            @click="activeTab = 'evaluations'">
                        Evaluations
                    </button>
                </li>
            </ul>

            <!-- Assigned examinations -->
            <div v-if="activeTab === 'examinations'"
                 class="card border-0 shadow-sm rounded-4">

                <div class="card-header bg-white border-0 p-4">
                    <h5 class="fw-bold mb-1">Assigned Examinations</h5>
                    <p class="text-secondary small mb-0">
                        Examinations assigned to your account.
                    </p>
                </div>

                <div v-if="loadingExaminations" class="p-4">
                    Loading examinations...
                </div>

                <div v-else-if="!examinations.length"
                     class="p-4 text-secondary">
                    No examinations assigned.
                </div>

                <div v-else class="table-responsive">
                    <table class="table align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th class="ps-4">Examination</th>
                                <th>Course</th>
                                <th>Type</th>
                                <th>Duration</th>
                                <th>Status</th>
                                <th class="text-end pe-4">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr v-for="exam in examinations"
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

                                <td>
                                    <span class="badge rounded-pill"
                                          :class="statusClass(exam.exam_status)">
                                        {{ exam.exam_status || 'Pending' }}
                                    </span>
                                </td>

                                <td class="text-end pe-4 text-nowrap">
                                    <button class="btn btn-sm btn-outline-primary me-1"
                                            @click="prepareSlot(exam)">
                                        Create Slot
                                    </button>

                                    <button class="btn btn-sm btn-outline-success"
                                            @click="completeExamination(exam)"
                                            :disabled="String(exam.exam_status).toLowerCase() === 'completed'">
                                        Complete
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Slots -->
            <div v-if="activeTab === 'slots'" class="row g-4">

                <!-- Create/update slot form -->
                <div class="col-12 col-xl-4">
                    <div class="card border-0 shadow-sm rounded-4">
                        <div class="card-header bg-white p-4">
                            <h5 class="fw-bold mb-1">
                                {{ editingSlotId ? 'Update Slot' : 'Create Slot' }}
                            </h5>
                            <p class="text-secondary small mb-0">
                                Create or update your examination availability.
                            </p>
                        </div>

                        <div class="card-body p-4">
                            <form @submit.prevent="saveSlot">

                                <div class="mb-3">
                                    <label class="form-label fw-semibold">
                                        Examination
                                    </label>
                                    <select class="form-select"
                                            v-model="slotForm.exam_id"
                                            required>
                                        <option value="" disabled>
                                            Select examination
                                        </option>
                                        <option v-for="exam in examinations"
                                                :key="exam.exam_id"
                                                :value="String(exam.exam_id)">
                                            {{ exam.exam_name }}
                                        </option>
                                    </select>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label fw-semibold">
                                        Date
                                    </label>
                                    <input type="date"
                                           class="form-control"
                                           v-model="slotForm.date"
                                           required>
                                </div>

                                <div class="row g-3 mb-3">
                                    <div class="col-6">
                                        <label class="form-label fw-semibold">
                                            Start Time
                                        </label>
                                        <input type="time"
                                               class="form-control"
                                               v-model="slotForm.start_time"
                                               required>
                                    </div>

                                    <div class="col-6">
                                        <label class="form-label fw-semibold">
                                            End Time
                                        </label>
                                        <input type="time"
                                               class="form-control"
                                               v-model="slotForm.end_time"
                                               required>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label fw-semibold">
                                        Maximum Students
                                    </label>
                                    <input type="number"
                                           class="form-control"
                                           v-model.number="slotForm.max_student_capacity"
                                           min="1"
                                           required>
                                </div>

                                <div class="mb-4">
                                    <label class="form-label fw-semibold">
                                        Meeting Link
                                    </label>
                                    <input type="url"
                                           class="form-control"
                                           v-model.trim="slotForm.meet_link"
                                           placeholder="https://...">
                                </div>

                                <button type="submit"
                                        class="btn btn-primary w-100"
                                        :disabled="savingSlot">
                                    <span v-if="savingSlot"
                                          class="spinner-border spinner-border-sm me-2"></span>
                                    {{ editingSlotId ? 'Save Changes' : 'Create Slot' }}
                                </button>

                                <button v-if="editingSlotId"
                                        type="button"
                                        class="btn btn-outline-secondary w-100 mt-2"
                                        @click="resetSlotForm">
                                    Cancel
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <!-- Existing slots -->
                <div class="col-12 col-xl-8">
                    <div class="card border-0 shadow-sm rounded-4">
                        <div class="card-header bg-white p-4">
                            <h5 class="fw-bold mb-2">Created Slots</h5>
                            <input class="form-control"
                                   v-model="slotSearch"
                                   placeholder="Search examination or date...">
                        </div>

                        <div v-if="loadingSlots" class="p-4">
                            Loading slots...
                        </div>

                        <div v-else-if="!filteredSlots.length"
                             class="p-4 text-secondary">
                            No slots found.
                        </div>

                        <div v-else class="table-responsive">
                            <table class="table align-middle mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th class="ps-4">Examination</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Seats</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <tr v-for="slot in filteredSlots"
                                        :key="slot.slot_id">
                                        <td class="ps-4">
                                            {{ slot.exam_name || examName(slot.exam_id) }}
                                        </td>
                                        <td>{{ slot.date || '—' }}</td>
                                        <td>
                                            {{ slot.start_time || '—' }} -
                                            {{ slot.end_time || '—' }}
                                        </td>
                                        <td>
                                            {{ slot.available_seats }} /
                                            {{ slot.max_student_capacity }}
                                        </td>
                                        <td class="text-nowrap">
                                            <button class="btn btn-sm btn-outline-primary me-1"
                                                    @click="editSlot(slot)"
                                                    :disabled="!canModifySlot(slot)">
                                                Edit
                                            </button>

                                            <button class="btn btn-sm btn-outline-danger"
                                                    @click="deleteSlot(slot)"
                                                    :disabled="!canModifySlot(slot)">
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Booked students -->
            <div v-if="activeTab === 'bookings'"
                 class="card border-0 shadow-sm rounded-4">

                <div class="card-header bg-white p-4">
                    <h5 class="fw-bold mb-2">Booked Students</h5>
                    <input class="form-control"
                           v-model="bookingSearch"
                           placeholder="Search student or examination...">
                </div>

                <div v-if="loadingBookings" class="p-4">
                    Loading bookings...
                </div>

                <div v-else-if="!filteredBookings.length"
                     class="p-4 text-secondary">
                    No students have booked your slots.
                </div>

                <div v-else class="table-responsive">
                    <table class="table align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th class="ps-4">Student</th>
                                <th>Examination</th>
                                <th>Booking Status</th>
                                <th>Evaluation</th>
                                <th class="text-end pe-4">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr v-for="booking in filteredBookings"
                                :key="booking.booking_id">
                                <td class="ps-4">
                                    <div class="fw-semibold">
                                        {{ booking.student_username || booking.student_name || 'Student' }}
                                    </div>
                                    <small class="text-secondary">
                                        {{ booking.student_email || '' }}
                                    </small>
                                </td>

                                <td>
                                    {{ booking.exam_name || examName(booking.exam_id) }}
                                </td>

                                <td>
                                    <span class="badge"
                                          :class="statusClass(booking.booking_status)">
                                        {{ booking.booking_status || '—' }}
                                    </span>
                                </td>

                                <td>
                                    {{ booking.evaluation_status || 'Pending' }}
                                </td>

                                <td class="text-end pe-4">
                                    <button class="btn btn-sm btn-primary"
                                            @click="openEvaluation(booking)">
                                        Evaluate
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Evaluation form -->
            <div v-if="activeTab === 'evaluations'" class="row g-4">

                <div class="col-12 col-xl-5">
                    <div class="card border-0 shadow-sm rounded-4">
                        <div class="card-header bg-white p-4">
                            <h5 class="fw-bold mb-1">Evaluate Student</h5>
                            <p class="text-secondary small mb-0">
                                Enter marks for each predefined rubric criterion.
                            </p>
                        </div>

                        <div class="card-body p-4">
                            <div v-if="!evaluationForm.booking_id"
                                 class="alert alert-info">
                                Select a student from the Booked Students tab.
                            </div>

                            <form v-else @submit.prevent="submitEvaluation">
                                <div class="mb-3">
                                    <div class="fw-semibold">
                                        {{ evaluationForm.student_name }}
                                    </div>
                                    <small class="text-secondary">
                                        {{ evaluationForm.exam_name }}
                                    </small>
                                </div>

                                <div v-if="loadingRubrics">
                                    Loading rubric...
                                </div>

                                <div v-else-if="!rubrics.length"
                                     class="alert alert-warning">
                                    No rubric criteria found for this examination.
                                </div>

                                <div v-for="rubric in rubrics"
                                     :key="rubric.rubric_id"
                                     class="border rounded-3 p-3 mb-3">
                                    <div class="d-flex justify-content-between mb-2">
                                        <label class="form-label fw-semibold">
                                            {{ rubric.criterion_name }}
                                        </label>
                                        <span class="small text-secondary">
                                            Max: {{ rubric.max_marks }}
                                        </span>
                                    </div>

                                    <p v-if="rubric.description"
                                       class="small text-secondary">
                                        {{ rubric.description }}
                                    </p>

                                    <input type="number"
                                           class="form-control"
                                           v-model.number="evaluationMarks[rubric.rubric_id]"
                                           min="0"
                                           :max="Number(rubric.max_marks)"
                                           step="0.5"
                                           required>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label fw-semibold">
                                        Remarks
                                    </label>
                                    <textarea class="form-control"
                                              rows="3"
                                              v-model.trim="evaluationForm.remarks"
                                              placeholder="Feedback for the student"></textarea>
                                </div>

                                <div class="d-flex justify-content-between mb-3">
                                    <span class="text-secondary">Total Marks</span>
                                    <strong>
                                        {{ calculatedMarks }} / {{ maximumMarks }}
                                    </strong>
                                </div>

                                <button type="submit"
                                        class="btn btn-primary w-100"
                                        :disabled="submittingEvaluation || loadingRubrics || !rubrics.length">
                                    Submit Evaluation
                                </button>

                                <button type="button"
                                        class="btn btn-outline-secondary w-100 mt-2"
                                        @click="clearEvaluation">
                                    Cancel
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div class="col-12 col-xl-7">
                    <div class="card border-0 shadow-sm rounded-4">
                        <div class="card-header bg-white p-4">
                            <h5 class="fw-bold mb-1">Evaluation Queue</h5>
                            <p class="text-secondary small mb-0">
                                Select a booked student to enter marks.
                            </p>
                        </div>

                        <div v-if="!bookings.length"
                             class="p-4 text-secondary">
                            No booked students available.
                        </div>

                        <div v-else class="table-responsive">
                            <table class="table align-middle mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th class="ps-4">Student</th>
                                        <th>Examination</th>
                                        <th>Status</th>
                                        <th class="text-end pe-4">Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <tr v-for="booking in bookings"
                                        :key="booking.booking_id">
                                        <td class="ps-4">
                                            {{ booking.student_username || booking.student_name || ('Student #' + booking.student_id) }}
                                        </td>
                                        <td>
                                            {{ booking.exam_name || examName(booking.exam_id) }}
                                        </td>
                                        <td>
                                            {{ booking.evaluation_status || 'Pending' }}
                                        </td>
                                        <td class="text-end pe-4">
                                            <button class="btn btn-sm btn-outline-primary"
                                                    @click="openEvaluation(booking)">
                                                Open
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    data() {
        return {
            apiBase: "http://localhost:5000/api/examiner",

            activeTab: "examinations",

            loading: false,
            loadingExaminations: false,
            loadingSlots: false,
            loadingBookings: false,
            loadingRubrics: false,
            savingSlot: false,
            submittingEvaluation: false,

            error: "",
            message: "",

            examinations: [],
            slots: [],
            bookings: [],
            rubrics: [],

            stats: {
                assigned_examinations: 0,
                created_slots: 0,
                booked_students: 0,
                pending_evaluations: 0
            },

            slotSearch: "",
            bookingSearch: "",

            editingSlotId: null,

            slotForm: {
                exam_id: "",
                date: "",
                start_time: "",
                end_time: "",
                max_student_capacity: 1,
                meet_link: ""
            },

            evaluationForm: {
                booking_id: "",
                student_id: "",
                exam_id: "",
                student_name: "",
                exam_name: "",
                remarks: ""
            },

            evaluationMarks: {}
        };
    },

    computed: {
        dashboardCards() {
            return [
                {
                    label: "Assigned Examinations",
                    value: this.stats.assigned_examinations
                },
                {
                    label: "Created Slots",
                    value: this.stats.created_slots
                },
                {
                    label: "Booked Students",
                    value: this.stats.booked_students
                },
                {
                    label: "Pending Evaluations",
                    value: this.stats.pending_evaluations
                }
            ];
        },

        filteredSlots() {
            const query = this.slotSearch.trim().toLowerCase();

            if (!query) return this.slots;

            return this.slots.filter(slot =>
                String(slot.exam_name || this.examName(slot.exam_id))
                    .toLowerCase().includes(query) ||
                String(slot.date || "").toLowerCase().includes(query)
            );
        },

        filteredBookings() {
            const query = this.bookingSearch.trim().toLowerCase();

            if (!query) return this.bookings;

            return this.bookings.filter(booking =>
                String(booking.student_username || booking.student_name || "")
                    .toLowerCase().includes(query) ||
                String(booking.student_email || "").toLowerCase().includes(query) ||
                String(booking.exam_name || this.examName(booking.exam_id))
                    .toLowerCase().includes(query)
            );
        },

        maximumMarks() {
            return this.rubrics.reduce(
                (total, rubric) => total + Number(rubric.max_marks || 0),
                0
            );
        },

        calculatedMarks() {
            return this.rubrics.reduce((total, rubric) => {
                const mark = Number(this.evaluationMarks[rubric.rubric_id]);
                return total + (
                    Number.isFinite(mark) ? mark : 0
                );
            }, 0);
        }
    },

    mounted() {
        this.refreshAll();
    },

    methods: {
        async apiRequest(path, options = {}) { // It acts a wrapper for the backend route and return the data back
            const token = localStorage.getItem("auth-token");

            if (!token) {
                throw new Error("Please log in with your examiner account.");
            }

            const response = await fetch(`${this.apiBase}${path}`, { // http://localhost:5000/api/examiner/dashboard
                ...options,
                headers: {
                    ...(options.headers || {}),
                    "Content-Type": "application/json",
                    "Authentication-Token": token
                }
            });

            const result = await response.json().catch(() => ({})); // .json is only used for double security

            if (response.status === 401 || response.status === 403) {
                throw new Error(
                    result.message || "You are not authorized to access examiner features."
                );
            }

            if (!response.ok) {
                throw new Error(
                    result.message || `Request failed: ${response.status}`
                );
            }

            return result;
        },

        async refreshAll() {
            this.loading = true;
            this.error = "";
            this.message = "";

            try {
                const results = await Promise.allSettled([
                    this.loadExaminations(),
                    this.loadSlots(),
                    this.loadBookings(),
                    this.loadDashboard()
                ]);

                const failed = results.find(
                    result => result.status === "rejected"
                );

                if (failed) {
                    this.error = failed.reason.message ||
                        "Some dashboard data could not be loaded.";
                }
            } finally {
                this.loading = false;
            }
        },

        async loadDashboard() {
            const result = await this.apiRequest("/dashboard");

            if (result.stats) {
                this.stats = {
                    ...this.stats,
                    ...result.stats
                };
            }
        },

        async loadExaminations() {
            this.loadingExaminations = true;

            try {
                const result = await this.apiRequest("/examinations");

                this.examinations = result.examinations || [];
                this.stats.assigned_examinations = this.examinations.length;
            } finally {
                this.loadingExaminations = false;
            }
        },

        async loadSlots() {
            this.loadingSlots = true;

            try {
                const result = await this.apiRequest("/slots");

                this.slots = result.slots || [];
                this.stats.created_slots = this.slots.length;
            } finally {
                this.loadingSlots = false;
            }
        },

        async loadBookings() {
            this.loadingBookings = true;

            try {
                const result = await this.apiRequest("/bookings");

                this.bookings = result.bookings || [];
                this.stats.booked_students = this.bookings.length;

                this.stats.pending_evaluations = this.bookings.filter(
                    booking => !["submitted", "completed"].includes(
                        String(booking.evaluation_status || "").toLowerCase()
                    )
                ).length;
            } finally {
                this.loadingBookings = false;
            }
        },

        examName(examId) {
            const exam = this.examinations.find(
                item => String(item.exam_id) === String(examId)
            );

            return exam ? exam.exam_name : `Examination #${examId || "—"}`;
        },

        statusClass(status) {
            const value = String(status || "").toLowerCase();

            if (["active", "open", "available", "completed", "submitted", "confirmed"].includes(value)) {
                return "text-bg-success";
            }

            if (["pending", "scheduled", "booked", "in_progress"].includes(value)) {
                return "text-bg-warning";
            }

            if (["closed", "cancelled", "canceled", "inactive"].includes(value)) {
                return "text-bg-secondary";
            }

            return "text-bg-light text-dark border";
        },

        prepareSlot(exam) {
            this.resetSlotForm();
            this.slotForm.exam_id = String(exam.exam_id);
            this.activeTab = "slots";
            this.error = "";
            this.message = "";
        },

        canModifySlot(slot) {
            return slot.can_edit !== false &&
                slot.booking_started !== true &&
                slot.student_booking_open !== true;
        },

        editSlot(slot) {
            if (!this.canModifySlot(slot)) {
                this.error = "This slot cannot be changed after booking starts.";
                return;
            }

            this.editingSlotId = slot.slot_id;

            this.slotForm = {
                exam_id: String(slot.exam_id),
                date: slot.date || "",
                start_time: String(slot.start_time || "").slice(0, 5),
                end_time: String(slot.end_time || "").slice(0, 5),
                max_student_capacity: Number(slot.max_student_capacity || 1),
                meet_link: slot.meet_link || ""
            };

            this.activeTab = "slots";
            this.error = "";
            this.message = "";
        },

        resetSlotForm() {
            this.editingSlotId = null;

            this.slotForm = {
                exam_id: "",
                date: "",
                start_time: "",
                end_time: "",
                max_student_capacity: 1,
                meet_link: ""
            };
        },

        async saveSlot() {
            this.error = "";
            this.message = "";

            const form = this.slotForm;

            if (!form.exam_id || !form.date ||
                !form.start_time || !form.end_time) {
                this.error = "Please fill in all required slot fields.";
                return;
            }

            if (form.end_time <= form.start_time) {
                this.error = "End time must be later than start time.";
                return;
            }

            if (!Number.isInteger(Number(form.max_student_capacity)) ||
                Number(form.max_student_capacity) < 1) {
                this.error = "Student capacity must be a positive whole number.";
                return;
            }

            this.savingSlot = true;

            try {
                const payload = {
                    exam_id: Number(form.exam_id),
                    date: form.date,
                    start_time: form.start_time,
                    end_time: form.end_time,
                    max_student_capacity: Number(form.max_student_capacity),
                    meet_link: form.meet_link || null
                };

                const result = this.editingSlotId
                    ? await this.apiRequest(
                        `/slots/${this.editingSlotId}`,
                        {
                            method: "PUT",
                            body: JSON.stringify(payload)
                        }
                    )
                    : await this.apiRequest("/slots", {
                        method: "POST",
                        body: JSON.stringify(payload)
                    });

                this.message = result.message ||
                    (this.editingSlotId
                        ? "Slot updated successfully."
                        : "Slot created successfully.");

                this.resetSlotForm();

                await Promise.all([
                    this.loadSlots(),
                    this.loadDashboard()
                ]);
            } catch (err) {
                this.error = err.message;
            } finally {
                this.savingSlot = false;
            }
        },

        async deleteSlot(slot) {
            if (!this.canModifySlot(slot)) {
                this.error = "This slot cannot be removed after booking starts.";
                return;
            }

            if (!window.confirm("Are you sure you want to remove this slot?")) {
                return;
            }

            this.error = "";
            this.message = "";

            try {
                const result = await this.apiRequest(
                    `/slots/${slot.slot_id}`,
                    { method: "DELETE" }
                );

                this.message = result.message || "Slot removed successfully.";

                await Promise.all([
                    this.loadSlots(),
                    this.loadDashboard()
                ]);
            } catch (err) {
                this.error = err.message;
            }
        },

        async openEvaluation(booking) {
            this.error = "";
            this.message = "";
            this.rubrics = [];
            this.evaluationMarks = {};

            this.evaluationForm = {
                booking_id: booking.booking_id,
                student_id: booking.student_id,
                exam_id: booking.exam_id || "",
                student_name: booking.student_username ||
                    booking.student_name ||
                    `Student #${booking.student_id}`,
                exam_name: booking.exam_name ||
                    this.examName(booking.exam_id),
                remarks: booking.remarks || ""
            };

            this.activeTab = "evaluations";
            this.loadingRubrics = true;

            try {
                const result = await this.apiRequest(
                    `/examinations/${this.evaluationForm.exam_id}/rubrics`
                );

                this.rubrics = result.rubrics || [];

                this.rubrics.forEach(rubric => {
                    this.$set(
                        this.evaluationMarks,
                        rubric.rubric_id,
                        ""
                    );
                });
            } catch (err) {
                this.error = err.message;
            } finally {
                this.loadingRubrics = false;
            }
        },

        clearEvaluation() {
            this.evaluationForm = {
                booking_id: "",
                student_id: "",
                exam_id: "",
                student_name: "",
                exam_name: "",
                remarks: ""
            };

            this.rubrics = [];
            this.evaluationMarks = {};
        },

        async submitEvaluation() {
            this.error = "";
            this.message = "";

            for (const rubric of this.rubrics) {
                const value = this.evaluationMarks[rubric.rubric_id];
                const mark = Number(value);

                if (value === "" || value === null ||
                    !Number.isFinite(mark) ||
                    mark < 0 ||
                    mark > Number(rubric.max_marks)) {
                    this.error =
                        `Enter valid marks for ${rubric.criterion_name}.`;
                    return;
                }
            }

            this.submittingEvaluation = true;

            try {
                const marks = this.rubrics.map(rubric => ({
                    rubric_id: rubric.rubric_id,
                    marks_obtained: Number(
                        this.evaluationMarks[rubric.rubric_id]
                    )
                }));

                const result = await this.apiRequest(
                    `/bookings/${this.evaluationForm.booking_id}/evaluation`,
                    {
                        method: "POST",
                        body: JSON.stringify({
                            marks,
                            remarks: this.evaluationForm.remarks
                        })
                    }
                );

                this.message = result.message ||
                    "Evaluation submitted successfully.";

                this.clearEvaluation();

                await Promise.all([
                    this.loadBookings(),
                    this.loadDashboard()
                ]);
            } catch (err) {
                this.error = err.message;
            } finally {
                this.submittingEvaluation = false;
            }
        },

        async completeExamination(exam) {
            if (!window.confirm(
                `Mark "${exam.exam_name}" as completed?`
            )) {
                return;
            }

            this.error = "";
            this.message = "";

            try {
                const result = await this.apiRequest(
                    `/examinations/${exam.exam_id}/status`,
                    {
                        method: "PATCH",
                        body: JSON.stringify({
                            exam_status: "completed"
                        })
                    }
                );

                this.message = result.message ||
                    "Examination marked as completed.";

                await Promise.all([
                    this.loadExaminations(),
                    this.loadDashboard()
                ]);
            } catch (err) {
                this.error = err.message;
            }
        }
    }
};
