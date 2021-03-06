(function(){
    angular
        .module('app', [
            'app.controllers',
            'app.services',
            'app.factories',
            'app.directives',
            'app.config',
            'app.constants',
            'ngRoute',
            'ui.bootstrap'
        ]);

    angular.module('app.controllers', []);
    angular.module('app.services', []);
    angular.module('app.factories', []);
    angular.module('app.directives', []);
    angular.module('app.constants', []);
    angular.module('app.config', ['ngRoute']);

}());

(function(){
    angular
        .module('app.config')
        .config(Route)
        .run(RouteInterceptor);

    RouteInterceptor.$inject = ['$rootScope', '$location', 'auth'];

    function Route($routeProvider, $locationProvider){
        $routeProvider
            .when('/', {
                templateUrl: 'public/views/home/home.html',
                controller: 'HomeController as vm'
            })
            .when('/login', {
                templateUrl: 'public/views/login/login.html',
                controller: 'LoginController as vm'
            })
            .when('/register', {
                templateUrl: 'public/views/register/register.html',
                controller: 'RegisterController as vm'
            })
            .when('/dashboard', {
                templateUrl: 'public/views/dashboard/dashboard.html',
                controller: 'DashboardController as vm',
                requiresLogin: true
            })
            .when('/admin', {
                templateUrl: 'public/views/admin/admin.html',
                controller: 'AdminController as vm',
                requiresAdmin: true
            })
            .otherwise({redirectTo: '/'});

    }
    function RouteInterceptor($rootScope, $location, auth){
        $rootScope.$on('$routeChangeStart', function(event, next){
            var authenticated = auth.isAuthed();
            var admin = auth.isAdmin();
            if(next.requiresLogin){
               if(!authenticated){
                   event.preventDefault();
                   $location.path('/');
               }
            }

            if(next.requiresAdmin){
                if(!admin){
                    event.preventDefault();
                    history.go(-1);
                }
            }


        })
    }

}());
/**
 * Created by HWhewell on 11/01/2016.
 */
(function(){
    angular
        .module('app.config')
        .config(authConfig);


    function authConfig($httpProvider){
        $httpProvider.defaults.headers.common = {};
        $httpProvider.defaults.headers.post = {};
        $httpProvider.defaults.headers.put = {};
        $httpProvider.defaults.headers.patch = {};

        $httpProvider.interceptors.push('authInterceptor');
    }
}());
/**
 * Created by HWhewell on 11/01/2016.
 */
(function(){
    angular
        .module('app.constants')
        .constant('API', 'http://localhost:8080/api');

}());
/**
 * Created by HWhewell on 11/01/2016.
 */
(function(){
    angular
        .module('app.factories')
        .factory('authInterceptor', authInterceptor);

    authInterceptor.$inject = ['API', 'auth', '$location'];

    function authInterceptor(API, auth, $location){
        return {
            // automatically attach Authorization header
            request: function(config) {

                var token = auth.getToken();
                if(config.url.indexOf(API) === 0 && token) {
                    config.headers.Authorization = 'Bearer ' + token;
                }

                return config;
            },

            // If a token was sent back, save it
            response: function(res) {

                if(res.config.url.indexOf(API) === 0 && res.data.token) {
                    auth.saveToken(res.data.token);
                }
                return res;
            },

            responseError: function(rejection){
                if(rejection.status === 401 || rejection.status === 403){
                    console.log('Response Error 401', rejection);
                    $location.path('#/');
                }
                return rejection;
            }
        }
    }
}());
/**
 * Created by HWhewell on 11/01/2016.
 */
(function(){
    angular
        .module('app.services')
        .service('auth', authService);

    authService.$inject = ['$window','$location'];

    function authService($window, $location){
        var vm = this;

        // decode jwt
        vm.parseJwt = function(token) {
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace('-', '+').replace('_', '/');
            console.log('JSON: ',JSON.parse($window.atob(base64)));
            return JSON.parse($window.atob(base64));
        };

        // save token to local storage
        vm.saveToken = function(token) {
            $window.localStorage['jwtToken'] = token;
        };

        // retrieve token from localStorage
        vm.getToken = function() {
            return $window.localStorage['jwtToken'];
        };

        vm.isAuthed = function() {
            var token = vm.getToken();
            if(token) {
                var params = vm.parseJwt(token);

                //Unix Time is in seconds while JavaScript Date.now()
                // returns milliseconds, so a conversion is necessary
                return Math.round(new Date().getTime() / 1000) <= params.exp;
            } else {
                return false;
            }
        };

        vm.isAdmin = function() {
            var token = vm.getToken();
            if(token){
                var params = vm.parseJwt(token);
                var role = params.role;

                return role == 'admin';

            } else {
                return false;
            }
        }

        vm.logout = function() {
            $window.localStorage.removeItem('jwtToken');
            $location.path('/');
        }
    }
}());
/**
 * Created by HWhewell on 11/01/2016.
 */
(function(){
    angular
        .module('app.services')
        .service('user', userService);

    userService.$inject = ['$http', 'API', '$location'];

    function userService($http, API, $location){
        var vm = this;


        vm.register = function(name, email, password, role){
            return $http({
                method: 'POST',
                url: API + '/user/register',
                data:'name=' + name + '&' + 'email=' +email + '&'
                + 'password=' +password + '&' + 'role=' + role,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function successCallback(res){
                    if(res.data.success == true){
                        $location.path('/login');
                    }
                    else{
                        window.alert('Could not Register!')
                    }
                }

            )
        };

        vm.login = function(email, password) {
            return $http({
                method: 'POST',
                url: API + '/authenticate',
                data: 'email=' +email + '&' + 'password=' +password,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function successCallback(res){
                    if(res.data.success == true){
                        $location.path('/dashboard');
                    }
                    else{
                        window.alert('Wrong Login Credentials!')
                    }
                }

            )
        };
    }
}());
/**
 * Created by HWhewell on 20/01/2016.
 */

(function(){
    angular
        .module('app.controllers')
        .controller('AdminController', adminController);

    function adminController(){
        var vm = this;
    }
}());
/**
 * Created by HWhewell on 12/01/2016.
 */
(function(){
    angular
        .module('app.controllers')
        .controller('DashboardController', dashboardController);

    dashboardController.$inject = ['auth'];

    function dashboardController(auth){
        var vm = this;


        vm.logout = function(){
            auth.logout && auth.logout()
        };

        vm.isAuthed = function() {
            return auth.isAuthed ? auth.isAuthed() : false
        };

        vm.isAdmin = function() {
            return auth.isAdmin ? auth.isAdmin() : false
        };

    }
}());
(function(){
    angular
        .module('app.controllers')
        .controller('HomeController', homeController);


    function homeController(){
        var vm = this;

    }
}());


/**
 * Created by HWhewell on 12/01/2016.
 */
(function(){
    angular
        .module('app.controllers')
        .controller('LoginController', loginController);

    loginController.$inject = ['user', '$location'];

    function loginController(user, $location){
        var vm = this;
        vm.login = function(){
            user.login(vm.email, vm.password);
        };

    }
}());
/**
 * Created by HWhewell on 12/01/2016.
 */
(function(){
    angular
        .module('app.controllers')
        .controller('RegisterController', registerController);

    registerController.$inject = ['user','$location'];

    function registerController(user, $location){
        var vm = this;

        vm.register = function(){
            user.register(vm.name, vm.email, vm.password, vm.role);
        };
    }
}());