export default{
    template:`
        <div class="container text-center my-5">
        <div v-if="data">
        <h1>Hello This is Admin </h1>
        </div>
</div>

        `,
    data(){
            return{
                data:false
            }
        },
    mounted(){
        this.authenticate();
    },
    methods:{
        authenticate(){
        if (localStorage.getItem("auth-token")){
            console.log("Hello From Uuser")
            console.log(localStorage.getItem("auth-token"))
            this.data=true
        }
    }
    }
}