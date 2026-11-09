
export default {
    template: `
    <div class="container my-5">

        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2>Examiner Management</h2>
                <p class="text-muted">
                    Register and manage examination evaluators.
                </p>
            </div>

            <button class="btn btn-outline-secondary"
                    @click="$router.push('/admin')">
                Back to Dashboard
            </button>
        </div>

        <div v-if="error" class="alert alert-danger">
            {{ error }}
        </div>

        <div v-if="message" class="alert alert-success">
            {{ message }}
        </div>

        <!-- Registration Form -->
        <div class="card shadow-sm mb-4">

            <div class="card-header bg-primary text-white">
                <h5 class="mb-0">Register New Examiner</h5>
            </div>

            <div class="card-body">

                <form @submit.prevent="registerExaminer">

                    <div class="row g-3">

                        <div class="col-md-6">
                            <label class="form-label">
                                Username
                            </label>

                            <input
                                type="text"
                                class="form-control"
                                v-model.trim="form.username"
                                placeholder="Enter username"
                                minlength="3"
                                required
                            >
                        </div>

                        <div class="col-md-6">
                            <label class="form-label">
                                Email Address
                            </label>

                            <input
                                type="email"
                                class="form-control"
                                v-model.trim="form.email"
                                placeholder="Enter email address"
                                required
                            >
                        </div>

                        <div class="col-md-6">
                            <label class="form-label">
                                Password
                            </label>

                            <input
                                type="password"
                                class="form-control"
                                v-model="form.password"
                                placeholder="Create a password"
                                minlength="8"
                                required
                            >
                        </div>

                        <div class="col-md-6">
                            <label class="form-label">
                                Confirm Password
                            </label>

                            <input
                                type="password"
                                class="form-control"
                                v-model="form.confirmPassword"
                                placeholder="Confirm password"
                                required
                            >
                        </div>

                    </div>

                    <div class="mt-4">
                        <button
                            type="submit"
                            class="btn btn-primary"
                            :disabled="loading"
                        >
                            {{ loading ? 'Registering...' : 'Register Examiner' }}
                        </button>

                        <button
                            type="button"
                            class="btn btn-outline-secondary ms-2"
                            @click="resetForm"
                        >
                            Clear
                        </button>
                    </div>

                </form>
            </div>
        </div>

        <!-- Registered Examiners -->
        <div class="card shadow-sm">

            <div class="card-header">
                <div class="d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Registered Examiners</h5>

                    <button class="btn btn-sm btn-outline-primary"
                            @click="loadExaminers">
                        Refresh
                    </button>
                </div>
            </div>

            <div class="card-body">

                <div v-if="listLoading" class="text-center">
                    Loading examiners...
                </div>

                <div v-else class="table-responsive">

                    <table class="table table-bordered table-striped">

                        <thead>
                            <tr>
                                <th>Examiner ID</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Account Status</th>
                            </tr>
                        </thead>

                        <tbody>

                            <tr v-for="examiner in examiners"
                                :key="examiner.examiner_id">

                                <td>{{ examiner.user_id }}</td>
                                <td>{{ examiner.username }}</td>
                                <td>{{ examiner.email }}</td>

                                <td>
                                    <span class="badge"
                                          :class="examiner.active ? 'bg-success' : 'bg-secondary'">
                                        {{ examiner.active ? 'Active' : 'Inactive' }}
                                    </span>
                                </td>

                            </tr>

                            <tr v-if="examiners.length === 0">
                                <td colspan="4" class="text-center">
                                    No examiners registered yet.
                                </td>
                            </tr>

                        </tbody>

                    </table>

                </div>
            </div>
        </div>

    </div>
    `,

    data() {
        return {
            apiBase: "http://localhost:5000/api/admin",

            form: {
                username: "",
                email: "",
                password: "",
                confirmPassword: ""
            },

            examiners: [],

            loading: false,
            listLoading: false,

            error: "",
            message: ""
        };
    },

    mounted() {
        this.loadExaminers();
    },

    methods: {

        async apiRequest(path, options = {}) {

            const token = localStorage.getItem("auth-token");

            if (!token) {
                throw new Error("Please login as administrator.");
            }

            const response = await fetch(
                `${this.apiBase}${path}`,
                {
                    ...options,

                    headers: {
                        ...options.headers,
                        "Content-Type": "application/json",
                        "Authentication-Token": token
                    }
                }
            );

            const result = await response.json().catch(() => ({}));
            console.log(result)

            if (!response.ok) {
                throw new Error(
                    result.message || "Request failed."
                );
            }

            return result;
        },

        resetForm() {
            this.form = {
                username: "",
                email: "",
                password: "",
                confirmPassword: ""
            };
        },

        async registerExaminer() {

            this.error = "";
            this.message = "";

            if (this.form.username.length < 3) {
                this.error = "Username must have at least 3 characters.";
                return;
            }

            if (this.form.password.length < 8) {
                this.error = "Password must have at least 8 characters.";
                return;
            }

            if (this.form.password !== this.form.confirmPassword) {
                this.error = "Passwords do not match.";
                return;
            }

            this.loading = true;

            try {

                const result = await this.apiRequest(
                    "/examiners",
                    {
                        method: "POST",

                        body: JSON.stringify({
                            username: this.form.username,
                            email: this.form.email,
                            password: this.form.password
                        })
                    }
                );

                this.message = result.message;
                // this.examiners=result.user_details

                this.resetForm();

                await this.loadExaminers();

            } catch (err) {

                this.error = err.message;

            } finally {

                this.loading = false;

            }
        },

        async loadExaminers() {

            this.listLoading = true;
            this.error = "";

            try {

                const result = await this.apiRequest("/examiners");

                this.examiners = result.examiners || [];

            } catch (err) {

                this.error = err.message;

            } finally {

                this.listLoading = false;

            }
        }
    }
};
