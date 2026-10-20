export default {
    template: `
        <div class="container-fluid py-4 px-3 px-lg-5 bg-light min-vh-100">

            <!-- Page Header -->
            <div class="d-flex flex-wrap justify-content-between
                        align-items-center gap-3 mb-4">

                <div>
                    <div class="text-primary small fw-semibold mb-2">
                        ADMINISTRATION / COURSES
                    </div>
                    <h2 class="fw-bold text-dark mb-1">
                        Course Management
                    </h2>
                    <p class="text-secondary mb-0">
                        Create and manage courses for your examinations.
                    </p>
                </div>

                <button class="btn btn-outline-secondary"
                        @click="goback">
                    <span v-else class="me-2">&#8635;</span>
                    Back
                </button>

                <button class="btn btn-outline-secondary"
                        @click="loadCourses"
                        :disabled="loadingCourses">
                    <span v-if="loadingCourses"
                          class="spinner-border spinner-border-sm me-2">
                    </span>
                    <span v-else class="me-2">&#8635;</span>
                    Refresh
                </button>
            </div>

            <!-- Notification -->
            <div v-if="message"
                 class="alert alert-success d-flex align-items-start
                        justify-content-between"
                 role="status">
                <div>
                    <strong>Success!</strong>
                    <div>{{ message }}</div>
                </div>
                <button type="button"
                        class="btn-close ms-3"
                        aria-label="Dismiss"
                        @click="message = ''">
                </button>
            </div>

            <div v-if="error"
                 class="alert alert-danger"
                 role="alert">
                <strong>Unable to complete the request.</strong>
                <div>{{ error }}</div>
            </div>

            <div v-else class="row g-4">

                <!-- Create Course Form -->
                <div class="col-12 col-xl-5">
                    <div class="card border-0 shadow-sm rounded-4 h-100">

                        <div class="card-header bg-white border-bottom
                                    px-4 py-4 rounded-top-4">
                            <div class="d-flex align-items-center gap-3">
                                <div class="course-icon">
                                    <span>&#43;</span>
                                </div>

                                <div>
                                    <h5 class="fw-bold mb-1">
                                        Create New Course
                                    </h5>
                                    <p class="text-secondary small mb-0">
                                        Enter the course details below.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div class="card-body p-4">

                            <form @submit.prevent="createCourse"
                                  novalidate>

                                <!-- Course Name -->
                                <div class="mb-4">
                                    <label for="courseName"
                                           class="form-label fw-semibold">
                                        Course Name
                                        <span class="text-danger">*</span>
                                    </label>

                                    <input
                                        id="courseName"
                                        v-model="form.course_name"
                                        type="text"
                                        class="form-control form-control-lg"
                                        :class="{
                                            'is-invalid': submitted &&
                                                !form.course_name.trim()
                                        }"
                                        placeholder="e.g. Computer Science"
                                        maxlength="100"
                                        autocomplete="off"
                                        required
                                    >

                                    <div class="d-flex justify-content-between
                                                mt-2">
                                        <small class="text-secondary">
                                            Enter a unique course name.
                                        </small>
                                        <small class="text-secondary">
                                            {{ form.course_name.length }}/100
                                        </small>
                                    </div>

                                    <div class="invalid-feedback">
                                        Course name is required.
                                    </div>
                                </div>

                                <!-- Course Code -->
                                <div class="mb-4">
                                    <label for="courseCode"
                                           class="form-label fw-semibold">
                                        Course Code
                                        <span class="text-danger">*</span>
                                    </label>

                                    <input
                                        id="courseCode"
                                        v-model="form.course_code"
                                        type="text"
                                        class="form-control form-control-lg
                                               text-uppercase"
                                        :class="{
                                            'is-invalid': submitted &&
                                                !form.course_code.trim()
                                        }"
                                        placeholder="e.g. CS101"
                                        maxlength="10"
                                        autocomplete="off"
                                        required
                                    >

                                    <div class="d-flex justify-content-between
                                                mt-2">
                                        <small class="text-secondary">
                                            A unique identifier, maximum
                                            10 characters.
                                        </small>
                                        <small class="text-secondary">
                                            {{ form.course_code.length }}/10
                                        </small>
                                    </div>

                                    <div class="invalid-feedback">
                                        Course code is required.
                                    </div>
                                </div>

                                <!-- Description -->
                                <div class="mb-4">
                                    <label for="courseDescription"
                                           class="form-label fw-semibold">
                                        Description
                                        <span class="text-secondary
                                                     fw-normal">
                                            (Optional)
                                        </span>
                                    </label>

                                    <textarea
                                        id="courseDescription"
                                        v-model="form.description"
                                        class="form-control"
                                        rows="4"
                                        maxlength="255"
                                        placeholder="Briefly describe the course, its scope and learning objectives..."
                                    ></textarea>

                                    <div class="text-end mt-2">
                                        <small class="text-secondary">
                                            {{ form.description.length }}/255
                                        </small>
                                    </div>
                                </div>

                                <!-- Status -->
                                <div class="mb-4">
                                    <label for="courseStatus"
                                           class="form-label fw-semibold">
                                        Course Status
                                    </label>

                                    <select id="courseStatus"
                                            v-model="form.status"
                                            class="form-select form-select-lg">
                                        <option value="active">
                                            Active
                                        </option>
                                        <option value="inactive">
                                            Inactive
                                        </option>
                                    </select>

                                    <small class="text-secondary d-block mt-2">
                                        Active courses can be selected when
                                        creating examinations.
                                    </small>
                                </div>

                                <!-- Preview -->
                                <div class="preview-panel rounded-3 p-3 mb-4">
                                    <div class="small text-secondary mb-2">
                                        COURSE PREVIEW
                                    </div>

                                    <div class="d-flex align-items-start
                                                justify-content-between gap-3">

                                        <div class="overflow-hidden">
                                            <h6 class="fw-bold mb-1
                                                       text-break">
                                                {{ form.course_name.trim()
                                                   || "Course name" }}
                                            </h6>

                                            <span class="badge bg-light
                                                         text-dark border">
                                                {{ form.course_code.trim()
                                                   .toUpperCase()
                                                   || "COURSE CODE" }}
                                            </span>
                                        </div>

                                        <span class="badge rounded-pill"
                                              :class="form.status === 'active'
                                                  ? 'text-bg-success'
                                                  : 'text-bg-secondary'">
                                            {{ form.status }}
                                        </span>
                                    </div>
                                </div>

                                <!-- Buttons -->
                                <div class="d-flex flex-wrap gap-2">
                                    <button type="submit"
                                            class="btn btn-primary btn-lg
                                                   flex-grow-1"
                                            :disabled="saving">

                                        <span v-if="saving"
                                              class="spinner-border
                                                     spinner-border-sm me-2">
                                        </span>

                                        {{ saving
                                            ? "Creating Course..."
                                            : "Create Course" }}
                                    </button>

                                    <button type="button"
                                            class="btn btn-outline-secondary
                                                   btn-lg"
                                            :disabled="saving"
                                            @click="resetForm">
                                        Reset
                                    </button>
                                </div>

                                <p class="small text-secondary mt-3 mb-0">
                                    <span class="text-danger">*</span>
                                    Required fields
                                </p>

                            </form>
                        </div>
                    </div>
                </div>

                <!-- Existing Courses -->
                <div class="col-12 col-xl-7">
                    <div class="card border-0 shadow-sm rounded-4">

                        <div class="card-header bg-white border-bottom
                                    p-4 rounded-top-4">

                            <div class="d-flex flex-wrap
                                        justify-content-between
                                        align-items-center gap-3">

                                <div>
                                    <h5 class="fw-bold mb-1">
                                        Existing Courses
                                    </h5>
                                    <p class="text-secondary small mb-0">
                                        View the courses registered in the
                                        system.
                                    </p>
                                </div>

                                <span class="badge bg-primary-subtle
                                             text-primary rounded-pill px-3 py-2">
                                    {{ filteredCourses.length }} courses
                                </span>
                            </div>

                            <div class="mt-3">
                                <input
                                    v-model="courseSearch"
                                    type="search"
                                    class="form-control"
                                    placeholder="Search by name, code or status..."
                                    aria-label="Search courses"
                                >
                            </div>
                        </div>

                        <div class="card-body p-0">

                            <div v-if="loadingCourses"
                                 class="text-center py-5">
                                <div class="spinner-border text-primary
                                            mb-3">
                                </div>
                                <p class="text-secondary mb-0">
                                    Loading courses...
                                </p>
                            </div>

                            <div v-else-if="filteredCourses.length === 0"
                                 class="text-center py-5 px-3">

                                <div class="empty-icon mx-auto mb-3">
                                    &#9776;
                                </div>

                                <h6 class="fw-bold">
                                    {{ courseSearch
                                        ? "No matching courses"
                                        : "No courses yet" }}
                                </h6>

                                <p class="text-secondary small mb-0">
                                    {{ courseSearch
                                        ? "Try a different search term."
                                        : "Create your first course using the form." }}
                                </p>
                            </div>

                            <div v-else class="table-responsive">
                                <table class="table align-middle mb-0">
                                    <thead class="table-light">
                                        <tr>
                                            <th class="ps-4 py-3">
                                                Course
                                            </th>
                                            <th class="py-3">
                                                Code
                                            </th>
                                            <th class="py-3">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        <tr v-for="course in filteredCourses"
                                            :key="course.course_id">

                                            <td class="ps-4 py-3">
                                                <div class="fw-semibold
                                                            text-dark">
                                                    {{ course.course_name }}
                                                </div>
                                                <small class="text-secondary">
                                                    ID: {{ course.course_id }}
                                                </small>
                                            </td>

                                            <td>
                                                <span class="badge bg-light
                                                             text-dark border">
                                                    {{ course.course_code }}
                                                </span>
                                            </td>

                                            <td>
                                                <span class="badge rounded-pill"
                                                      :class="course.status === 'active'
                                                          ? 'text-bg-success'
                                                          : 'text-bg-secondary'">
                                                    {{ course.status }}
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div class="card-footer bg-white border-top p-3
                                    text-secondary small rounded-bottom-4">
                            Course records are loaded from your Flask
                            backend.
                        </div>
                    </div>
                </div>

            </div>
        </div>
    `,

    data() {
        return {
            apiBase: "http://localhost:5000/api/admin",

            form: {
                course_name: "",
                course_code: "",
                description: "",
                status: "active"
            },

            courses: [],
            courseSearch: "",

            loadingCourses: false,
            saving: false,
            submitted: false,

            error: "",
            message: ""
        };
    },

    computed: {
        filteredCourses() {
            const query = this.courseSearch.trim().toLowerCase();

            if (!query) {
                return this.courses;
            }

            return this.courses.filter(course =>
                (course.course_name || "").toLowerCase().includes(query) ||
                (course.course_code || "").toLowerCase().includes(query) ||
                (course.status || "").toLowerCase().includes(query)
            );
        }
    },

    mounted() {
        this.loadCourses();
    },

    methods: {
        async apiRequest(path, options = {}) {
            const token = localStorage.getItem("auth-token");

            if (!token) {
                throw new Error("Please log in before managing courses.");
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
                throw new Error(
                    result.message ||
                    "You are not authorized to manage courses."
                );
            }

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    `Request failed with status ${response.status}.`
                );
            }

            return result;
        },

        async loadCourses() {
            this.loadingCourses = true;
            this.error = "";

            try {
                const result = await this.apiRequest("/courses");
                this.courses = result.courses || [];
            } catch (err) {
                this.error = err.message;
            } finally {
                this.loadingCourses = false;
            }
        },
        goback(){
            this.$router.push('/admin');
        },

        async createCourse() {
            this.submitted = true;
            this.error = "";
            this.message = "";

            const courseName = this.form.course_name.trim();
            const courseCode = this.form.course_code.trim().toUpperCase();
            const description = this.form.description.trim();

            if (!courseName || !courseCode) {
                this.error = "Please provide both the course name and course code.";
                return;
            }

            if (courseName.length > 100 || courseCode.length > 10) {
                this.error = "Course name must be at most 100 characters and course code at most 10 characters.";
                return;
            }

            if (description.length > 255) {
                this.error = "Description must be at most 255 characters.";
                return;
            }

            // Catch common duplicates before sending the request.
            const duplicate = this.courses.some(course =>
                course.course_name.toLowerCase() === courseName.toLowerCase() ||
                course.course_code.toUpperCase() === courseCode
            );

            if (duplicate) {
                this.error = "A course with this name or code already exists.";
                return;
            }

            this.saving = true;

            try {
                const result = await this.apiRequest("/courses", {
                    method: "POST",
                    body: JSON.stringify({
                        course_name: courseName,
                        course_code: courseCode,
                        description: description || null,
                        status: this.form.status
                    })
                });

                this.message = result.message || "Course created successfully.";

                this.form = {
                    course_name: "",
                    course_code: "",
                    description: "",
                    status: "active"
                };

                this.submitted = false;

                await this.loadCourses();

            } catch (err) {
                this.error = err.message;
            } finally {
                this.saving = false;
            }
        },

        resetForm() {
            if (this.saving) {
                return;
            }

            this.form = {
                course_name: "",
                course_code: "",
                description: "",
                status: "active"
            };

            this.submitted = false;
            this.error = "";
            this.message = "";
        }
    }
};
