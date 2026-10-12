export default{
    template:`
        <div class="container mt-5" style="max-width: 400px;">
  <div class="card p-4 shadow-sm">
    <h3 class="text-center mb-4">Login</h3>
    
    <!-- Username Field -->
    <div class="mb-3">
      <label for="username" class="form-label">Username:</label>
      <input 
        type="text" 
        id="username"
        class="form-control" 
        placeholder="Username" 
        v-model="username"
      >
    </div>

    <!-- Password Field -->
    <div class="mb-4">
      <label for="password" class="form-label">Password:</label>
      <input 
        type="password" 
        id="password"
        class="form-control" 
        placeholder="***********" 
        v-model="password"
      >
    </div>

    <!-- Login Button -->
    <button class="btn btn-primary w-100" @click="Login">
      Login
    </button>
  </div>
</div>
    `,
    data: function(){
        return{
            username:'',
            password:''
        }
    },
    methods:{
        Login: function(){
            fetch('/api/login',{
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    username:this.username,
                    password:this.password
                })

            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.success){
                    this.$router.push('/');
                }
                else {
                    alert('Invalid username or password');
                }
            })
        }
    }
}