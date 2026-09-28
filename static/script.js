const routes =[
    {path:'/',component:Home}
]
const router = new VueRouter({ // used to define the paths
    routes
})

const app = new Vue({
    el:"#app", // This is to mount with the element in index.html page
    router, // This is to use the router in the Vue instance
    template:`
    <div>
        <div class="container"><h1>Examination App</h1></div>
        <ul>
            <li><router-link to="/">Home</router-link></li>
        </ul>
        <router-view></router-view>
    </div>
    `

})