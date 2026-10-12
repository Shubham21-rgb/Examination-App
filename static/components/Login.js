export default{
    template:`
        <div>
        <label for="username">Username:</label>
        <input type="text" placeholder="Username" v-model="username">
        <br><br><br>
        <label for="username">Password:</label>
        <input type="password" placeholder="***********" v-model="password">
        <button @click="Login"> Login </button>
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