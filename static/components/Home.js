export default{
    template:`
        <div class="container text-center my-5">
  <div class="row justify-content-center">
    <div class="col-md-8 col-lg-6">
      
      <!-- App Header -->
      <h1 class="display-4 fw-bold text-primary mb-3">Home Page</h1>
      <h2 class="h4 text-secondary mb-4">Welcome to the Examination App</h2>
      
      <!-- Description -->
      <p class="lead text-muted mb-5">
        This is the home page of the application.
      </p>
      
      <!-- Navigation Button -->
      <div>
        <router-link to="/login" class="btn btn-primary btn-lg px-5 shadow-sm">
          Go to Login
        </router-link>
      </div>

    </div>
  </div>
</div>

        `
}