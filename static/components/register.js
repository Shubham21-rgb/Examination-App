
export default {
    template: `
    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-md-6 col-lg-5">

                <div class="card shadow border-0">
                    <div class="card-body p-4 p-md-5">

                        <div class="text-center mb-4">
                            <h2 class="fw-bold">Create Account</h2>
                            <p class="text-muted">
                                Register as a student to access examinations
                            </p>
                        </div>

                        <div v-if="successMessage"
                             class="alert alert-success">
                            {{ successMessage }}
                        </div>

                        <div v-if="errorMessage"
                             class="alert alert-danger">
                            {{ errorMessage }}
                        </div>

                        <form @submit.prevent="registerStudent">

                            <div class="mb-3">
                                <label class="form-label">
                                    Username
                                </label>

                                <input
                                    type="text"
                                    class="form-control"
                                    v-model.trim="form.username"
                                    placeholder="Enter your username"
                                    required
                                    minlength="3"
                                >
                            </div>

                            <div class="mb-3">
                                <label class="form-label">
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    class="form-control"
                                    v-model.trim="form.email"
                                    placeholder="Enter your email"
                                    required
                                >
                            </div>

                            <div class="mb-3">
                                <label class="form-label">
                                    Password
                                </label>

                                <div class="input-group">
                                    <input
                                        :type="showPassword ? 'text' : 'password'"
                                        class="form-control"
                                        v-model="form.password"
                                        placeholder="Create a password"
                                        minlength="8"
                                        required
                                    >

                                    <button
                                        type="button"
                                        class="btn btn-outline-secondary"
                                        @click="showPassword = !showPassword"
                                    >
                                        {{ showPassword ? 'Hide' : 'Show' }}
                                    </button>
                                </div>

                                <small class="text-muted">
                                    Minimum 8 characters.
                                </small>
                            </div>

                            <div class="mb-3">
                                <label class="form-label">
                                    Confirm Password
                                </label>

                                <input
                                    type="password"
                                    class="form-control"
                                    v-model="form.confirmPassword"
                                    placeholder="Re-enter your password"
                                    required
                                >
                            </div>

                            <div class="form-check mb-3">
                                <input
                                    class="form-check-input"
                                    type="checkbox"
                                    v-model="acceptedTerms"
                                    id="terms"
                                >

                                <label class="form-check-label"
                                       for="terms">
                                    I agree to the terms and conditions.
                                </label>
                            </div>

                            <button
                                type="submit"
                                class="btn btn-primary w-100 py-2"
                                :disabled="loading"
                            >
                                {{ loading ? 'Creating Account...' : 'Register' }}
                            </button>

                        </form>

                        <hr class="my-4">

                        <p class="text-center mb-0">
                            Already have an account?
                            <router-link to="/login">
                                Login here
                            </router-link>
                        </p>

                    </div>
                </div>

                <p class="text-center text-muted mt-3">
                    Examination Management System
                </p>

            </div>
        </div>
    </div>
    `,

    data() {
        return {
            form: {
                username: "",
                email: "",
                password: "",
                confirmPassword: ""
            },

            acceptedTerms: false,
            showPassword: false,
            loading: false,
            successMessage: "",
            errorMessage: ""
        };
    },

    methods: {
        async registerStudent() {

            this.successMessage = "";
            this.errorMessage = "";

            if (this.form.username.length < 3) {
                this.errorMessage =
                    "Username must contain at least 3 characters.";
                return;
            }

            if (this.form.password.length < 8) {
                this.errorMessage =
                    "Password must contain at least 8 characters.";
                return;
            }

            if (this.form.password !== this.form.confirmPassword) {
                this.errorMessage =
                    "Passwords do not match.";
                return;
            }

            if (!this.acceptedTerms) {
                this.errorMessage =
                    "Please accept the terms and conditions.";
                return;
            }

            this.loading = true;

            try {
                const response = await fetch(
                    "/api/register",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            username: this.form.username,
                            email: this.form.email,
                            password: this.form.password
                        })
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message || "Registration failed."
                    );
                }

                this.successMessage =
                    "Registration successful! Redirecting to login...";

                this.form = {
                    username: "",
                    email: "",
                    password: "",
                    confirmPassword: ""
                };

                this.acceptedTerms = false;

                setTimeout(() => {
                    this.$router.push("/login");
                }, 1500);

            } catch (error) {
                this.errorMessage =
                    error.message || "Something went wrong.";
            } finally {
                this.loading = false;
            }
        }
    }
};
