import Home from './components/Home.js';
import Login from './components/Login.js';
import Admin from './components/Admin.js';
import create_admin_courses from './components/create_admin_courses.js';
import examiner from './components/examiner.js';


const routes =[
    {path:'/',component:Home},
    {path:'/login',component:Login},
    {path:'/admin',component:Admin},
    {path:'/admin/courses',component:create_admin_courses},
    {path:'/examiner',component:examiner}
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
        <router-view></router-view>
    </div>
    `

})