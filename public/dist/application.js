"use strict";var ApplicationConfiguration=function(){var applicationModuleName="forwardly",applicationModuleVendorDependencies=["ngResource","ngCookies","ngAnimate","ngTouch","ngSanitize","ui.router","ui.bootstrap","ui.utils","textAngular"],registerModule=function(moduleName,dependencies){angular.module(moduleName,dependencies||[]),angular.module(applicationModuleName).requires.push(moduleName)};return{applicationModuleName:applicationModuleName,applicationModuleVendorDependencies:applicationModuleVendorDependencies,registerModule:registerModule}}();angular.module(ApplicationConfiguration.applicationModuleName,ApplicationConfiguration.applicationModuleVendorDependencies),angular.module(ApplicationConfiguration.applicationModuleName).config(["$locationProvider",function($locationProvider){$locationProvider.hashPrefix("!")}]),angular.element(document).ready(function(){"#_=_"===window.location.hash&&(window.location.hash="#!"),angular.bootstrap(document,[ApplicationConfiguration.applicationModuleName])}),ApplicationConfiguration.registerModule("companies"),ApplicationConfiguration.registerModule("core"),ApplicationConfiguration.registerModule("listings"),ApplicationConfiguration.registerModule("referrals"),ApplicationConfiguration.registerModule("users"),angular.module("companies").run(["Menus",function(Menus){Menus.addMenuItem("topbar","Companies","companies","dropdown","/companies(/create)?"),Menus.addSubMenuItem("topbar","companies","List Companies","companies"),Menus.addSubMenuItem("topbar","companies","New Company","companies/create")}]),angular.module("companies").config(["$stateProvider",function($stateProvider){$stateProvider.state("listCompanies",{url:"/companies",templateUrl:"modules/companies/views/list-companies.client.view.html"}).state("createCompany",{url:"/companies/create",templateUrl:"modules/companies/views/create-company.client.view.html"}).state("viewCompany",{url:"/companies/:companyId",templateUrl:"modules/companies/views/view-company.client.view.html"}).state("editCompany",{url:"/companies/:companyId/edit",templateUrl:"modules/companies/views/edit-company.client.view.html"})}]),angular.module("companies").controller("CompaniesController",["$scope","$stateParams","$location","Authentication","Companies",function($scope,$stateParams,$location,Authentication,Companies){$scope.authentication=Authentication,$scope.create=function(){var company=new Companies({name:this.name,description:this.description,url:this.url,imageUrl:this.imageUrl});company.$save(function(response){$location.path("companies/"+response._id),$scope.name=""},function(errorResponse){$scope.error=errorResponse.data.message})},$scope.remove=function(company){if(company){company.$remove();for(var i in $scope.companies)$scope.companies[i]===company&&$scope.companies.splice(i,1)}else $scope.company.$remove(function(){$location.path("companies")})},$scope.update=function(){var company=$scope.company;company.$update(function(){$location.path("companies/"+company._id)},function(errorResponse){$scope.error=errorResponse.data.message})},$scope.find=function(){$scope.companies=Companies.query()},$scope.findOne=function(){$scope.company=Companies.get({companyId:$stateParams.companyId})}}]),angular.module("companies").factory("Companies",["$resource",function($resource){return $resource("companies/:companyId",{companyId:"@_id"},{update:{method:"PUT"}})}]),angular.module("core").config(["$stateProvider","$urlRouterProvider",function($stateProvider,$urlRouterProvider){$urlRouterProvider.otherwise("/"),$stateProvider.state("home",{url:"/",templateUrl:"modules/core/views/home.client.view.html"})}]),angular.module("core").controller("HeaderController",["$scope","Authentication","Menus",function($scope,Authentication,Menus){$scope.authentication=Authentication,$scope.isCollapsed=!1,$scope.menu=Menus.getMenu("topbar"),$scope.toggleCollapsibleMenu=function(){$scope.isCollapsed=!$scope.isCollapsed},$scope.$on("$stateChangeSuccess",function(){$scope.isCollapsed=!1})}]),angular.module("core").controller("HomeController",["$scope","Authentication","Random",function($scope,Authentication,Random){$scope.authentication=Authentication,$scope.data={firstName:"",lastName:""},$scope.upload={progressing:!1,percent:0,complete:!1,url:"",error:!1,errorMessage:""},$scope.s3_upload=function(target){$scope.upload={progressing:!1,percent:0,complete:!1,url:"",error:!1,errorMessage:""};var namePrefix=$scope.data.firstName+$scope.data.lastName;if(namePrefix||(namePrefix="Candidate"),!target.files[0]||!target.files[0].type)return void $scope.$apply(function(){$scope.upload.error=!0,$scope.upload.errorMessage="Unable to read content type of resume"});var type=target.files[0].type,suffix="";if("application/pdf"===type)suffix=".pdf";else if("application/msword"===type)suffix=".doc";else if("application/rtf"===type)suffix=".rtf";else{if("text/plain"!==type)return void $scope.$apply(function(){$scope.upload.error=!0,$scope.upload.errorMessage="Resume must be pdf, doc, rtf, or txt file"});suffix=".txt"}var name=Random.generateString(24)+"/"+namePrefix+"Resume"+suffix;new S3Upload({s3_object_name:name,file_dom_selector:"files",s3_sign_put_url:"/sign_s3",onProgress:function(percent){$scope.$apply(function(){$scope.upload.progressing=!0,$scope.upload.percent=percent})},onFinishS3Put:function(public_url){$scope.$apply(function(){$scope.upload.progressing=!1,$scope.upload.complete=!0,$scope.upload.url=public_url})},onError:function(status){$scope.$apply(function(){$scope.upload.progressing=!1,$scope.upload.complete=!1,$scope.upload.error=!0,$scope.upload.errorMessage=status})}})}}]),angular.module("core").service("Menus",[function(){this.defaultRoles=["*"],this.menus={};var shouldRender=function(user){if(!user)return this.isPublic;if(~this.roles.indexOf("*"))return!0;for(var userRoleIndex in user.roles)for(var roleIndex in this.roles)if(this.roles[roleIndex]===user.roles[userRoleIndex])return!0;return!1};this.validateMenuExistance=function(menuId){if(menuId&&menuId.length){if(this.menus[menuId])return!0;throw new Error("Menu does not exists")}throw new Error("MenuId was not provided")},this.getMenu=function(menuId){return this.validateMenuExistance(menuId),this.menus[menuId]},this.addMenu=function(menuId,isPublic,roles){return this.menus[menuId]={isPublic:isPublic||!1,roles:roles||this.defaultRoles,items:[],shouldRender:shouldRender},this.menus[menuId]},this.removeMenu=function(menuId){this.validateMenuExistance(menuId),delete this.menus[menuId]},this.addMenuItem=function(menuId,menuItemTitle,menuItemURL,menuItemType,menuItemUIRoute,isPublic,roles,position){return this.validateMenuExistance(menuId),this.menus[menuId].items.push({title:menuItemTitle,link:menuItemURL,menuItemType:menuItemType||"item",menuItemClass:menuItemType,uiRoute:menuItemUIRoute||"/"+menuItemURL,isPublic:null===isPublic||"undefined"==typeof isPublic?this.menus[menuId].isPublic:isPublic,roles:null===roles||"undefined"==typeof roles?this.menus[menuId].roles:roles,position:position||0,items:[],shouldRender:shouldRender}),this.menus[menuId]},this.addSubMenuItem=function(menuId,rootMenuItemURL,menuItemTitle,menuItemURL,menuItemUIRoute,isPublic,roles,position){this.validateMenuExistance(menuId);for(var itemIndex in this.menus[menuId].items)this.menus[menuId].items[itemIndex].link===rootMenuItemURL&&this.menus[menuId].items[itemIndex].items.push({title:menuItemTitle,link:menuItemURL,uiRoute:menuItemUIRoute||"/"+menuItemURL,isPublic:null===isPublic||"undefined"==typeof isPublic?this.menus[menuId].items[itemIndex].isPublic:isPublic,roles:null===roles||"undefined"==typeof roles?this.menus[menuId].items[itemIndex].roles:roles,position:position||0,shouldRender:shouldRender});return this.menus[menuId]},this.removeMenuItem=function(menuId,menuItemURL){this.validateMenuExistance(menuId);for(var itemIndex in this.menus[menuId].items)this.menus[menuId].items[itemIndex].link===menuItemURL&&this.menus[menuId].items.splice(itemIndex,1);return this.menus[menuId]},this.removeSubMenuItem=function(menuId,submenuItemURL){this.validateMenuExistance(menuId);for(var itemIndex in this.menus[menuId].items)for(var subitemIndex in this.menus[menuId].items[itemIndex].items)this.menus[menuId].items[itemIndex].items[subitemIndex].link===submenuItemURL&&this.menus[menuId].items[itemIndex].items.splice(subitemIndex,1);return this.menus[menuId]},this.addMenu("topbar")}]),angular.module("core").service("Random",[function(){var chars="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghiklmnopqrstuvwxyz";this.generateString=function(length){length=length?length:32;for(var string="",i=0;length>i;i++){var randomNumber=Math.floor(Math.random()*chars.length);string+=chars.substring(randomNumber,randomNumber+1)}return string}}]),angular.module("listings").run(["Menus",function(Menus){Menus.addMenuItem("topbar","Listings","listings","dropdown","/listings(/create)?"),Menus.addSubMenuItem("topbar","listings","List Listings","listings"),Menus.addSubMenuItem("topbar","listings","New Listing","listings/create")}]),angular.module("listings").config(["$stateProvider",function($stateProvider){$stateProvider.state("listListings",{url:"/listings",templateUrl:"modules/listings/views/list-listings.client.view.html"}).state("createListing",{url:"/listings/create",templateUrl:"modules/listings/views/create-listing.client.view.html"}).state("viewListing",{url:"/listings/:listingId",templateUrl:"modules/listings/views/view-listing.client.view.html"}).state("editListing",{url:"/listings/:listingId/edit",templateUrl:"modules/listings/views/edit-listing.client.view.html"}).state("applyListing",{url:"/listings/:listingId/apply",templateUrl:"modules/listings/views/apply-listing.client.view.html"}).state("viewListingReferral",{url:"/listings/:listingId/referrals/:referralId",templateUrl:"modules/listings/views/view-listing.client.view.html"}).state("applyListingReferral",{url:"/listings/:listingId/apply/:referralId",templateUrl:"modules/listings/views/apply-listing.client.view.html"})}]),angular.module("listings").controller("ListingsController",["$scope","$stateParams","$location","Authentication","Listings","Companies","Referrals",function($scope,$stateParams,$location,Authentication,Listings,Companies,Referrals){$scope.authentication=Authentication,$scope.create=function(){console.log(this);var listing=new Listings({company:this.company,headline:this.headline,description:this.description,location:this.location,role:this.role,tags:this.tags,referralFee:this.referralFee});listing.$save(function(response){$location.path("listings/"+response._id),$scope.name=""},function(errorResponse){$scope.error=errorResponse.data.message})},$scope.remove=function(listing){if(listing){listing.$remove();for(var i in $scope.listings)$scope.listings[i]===listing&&$scope.listings.splice(i,1)}else $scope.listing.$remove(function(){$location.path("listings")})},$scope.update=function(){var listing=$scope.listing;listing.$update(function(){$location.path("listings/"+listing._id)},function(errorResponse){$scope.error=errorResponse.data.message})},$scope.find=function(){$scope.listings=Listings.query()},$scope.findOne=function(){$scope.listing=Listings.get({listingId:$stateParams.listingId}),$stateParams.referralId&&($scope.referral=Referrals.get({referralId:$stateParams.referralId}))},$scope.roles=[{name:"Software Engineer"},{name:"Backend Developer"},{name:"Data Scientist"},{name:"DevOps"},{name:"Frontend Developer"},{name:"Full-Stack Developer"},{name:"Mobile Developer"},{name:"Attorney"},{name:"UI/UX Designer"},{name:"Finance/Accounting"},{name:"Hardware Engineer"},{name:"H.R."},{name:"Marketing"},{name:"Office Manager"},{name:"Operations"},{name:"Product Manager"},{name:"Sales"}],$scope.companies=Companies.query()}]),angular.module("listings").factory("Listings",["$resource",function($resource){return $resource("listings/:listingId",{listingId:"@_id"},{update:{method:"PUT"}})}]),angular.module("referrals").config(["$stateProvider",function($stateProvider){$stateProvider.state("listReferrals",{url:"/referrals",templateUrl:"modules/referrals/views/list-referrals.client.view.html"}).state("createReferral",{url:"/referrals/create/:listingId",templateUrl:"modules/referrals/views/create-referral.client.view.html"}).state("createReferral2",{url:"/referrals/create/:listingId/:referralId",templateUrl:"modules/referrals/views/create-referral.client.view.html"}).state("viewReferral",{url:"/referrals/:referralId",templateUrl:"modules/referrals/views/view-referral.client.view.html"}).state("editReferral",{url:"/referrals/:referralId/edit",templateUrl:"modules/referrals/views/edit-referral.client.view.html"})}]),angular.module("referrals").controller("ReferralsController",["$scope","$stateParams","$location","Authentication","Referrals",function($scope,$stateParams,$location,Authentication,Referrals){$scope.authentication=Authentication,$scope.create=function(){var referral=new Referrals({listing:$stateParams.listingId,parentReferral:$stateParams.referralId,email:this.email,firstName:this.firstName,lastName:this.lastName,customMessage:this.customMessage});referral.$save(function(response){console.log("Referral Created: ",response._id);var destination="listings/"+response.listing;destination+=response.parentReferral?"/referrals/"+response.parentReferral:"",$location.path(destination),$scope.name=""},function(errorResponse){$scope.error=errorResponse.data.message})},$scope.remove=function(referral){if(referral){referral.$remove();for(var i in $scope.referrals)$scope.referrals[i]===referral&&$scope.referrals.splice(i,1)}else $scope.referral.$remove(function(){$location.path("referrals")})},$scope.update=function(){var referral=$scope.referral;referral.$update(function(){$location.path("referrals/"+referral._id)},function(errorResponse){$scope.error=errorResponse.data.message})},$scope.find=function(){$scope.referrals=Referrals.query()},$scope.findOne=function(){$scope.referral=Referrals.get({referralId:$stateParams.referralId})}}]),angular.module("referrals").factory("Referrals",["$resource",function($resource){return $resource("referrals/:referralId",{referralId:"@_id"},{update:{method:"PUT"}})}]),angular.module("users").config(["$httpProvider",function($httpProvider){$httpProvider.interceptors.push(["$q","$location","Authentication",function($q,$location,Authentication){return{responseError:function(rejection){switch(rejection.status){case 401:Authentication.user=null,$location.path("signin");break;case 403:}return $q.reject(rejection)}}}])}]),angular.module("users").config(["$stateProvider",function($stateProvider){$stateProvider.state("profile",{url:"/settings/profile",templateUrl:"modules/users/views/settings/edit-profile.client.view.html"}).state("password",{url:"/settings/password",templateUrl:"modules/users/views/settings/change-password.client.view.html"}).state("accounts",{url:"/settings/accounts",templateUrl:"modules/users/views/settings/social-accounts.client.view.html"}).state("signup",{url:"/signup",templateUrl:"modules/users/views/authentication/signup.client.view.html"}).state("signin",{url:"/signin",templateUrl:"modules/users/views/authentication/signin.client.view.html"}).state("forgot",{url:"/password/forgot",templateUrl:"modules/users/views/password/forgot-password.client.view.html"}).state("reset-invlaid",{url:"/password/reset/invalid",templateUrl:"modules/users/views/password/reset-password-invalid.client.view.html"}).state("reset-success",{url:"/password/reset/success",templateUrl:"modules/users/views/password/reset-password-success.client.view.html"}).state("reset",{url:"/password/reset/:token",templateUrl:"modules/users/views/password/reset-password.client.view.html"})}]),angular.module("users").controller("AuthenticationController",["$scope","$http","$location","Authentication",function($scope,$http,$location,Authentication){$scope.authentication=Authentication,$scope.authentication.user&&$location.path("/"),$scope.signup=function(){$http.post("/auth/signup",$scope.credentials).success(function(response){$scope.authentication.user=response,$location.path("/")}).error(function(response){$scope.error=response.message})},$scope.signin=function(){$http.post("/auth/signin",$scope.credentials).success(function(response){$scope.authentication.user=response,$location.path("/")}).error(function(response){$scope.error=response.message})}}]),angular.module("users").controller("PasswordController",["$scope","$stateParams","$http","$location","Authentication",function($scope,$stateParams,$http,$location,Authentication){$scope.authentication=Authentication,$scope.authentication.user&&$location.path("/"),$scope.askForPasswordReset=function(){$scope.success=$scope.error=null,$http.post("/auth/forgot",$scope.credentials).success(function(response){$scope.credentials=null,$scope.success=response.message}).error(function(response){$scope.credentials=null,$scope.error=response.message})},$scope.resetUserPassword=function(){$scope.success=$scope.error=null,$http.post("/auth/reset/"+$stateParams.token,$scope.passwordDetails).success(function(response){$scope.passwordDetails=null,Authentication.user=response,$location.path("/password/reset/success")}).error(function(response){$scope.error=response.message})}}]),angular.module("users").controller("SettingsController",["$scope","$http","$location","Users","Authentication",function($scope,$http,$location,Users,Authentication){$scope.user=Authentication.user,$scope.user||$location.path("/"),$scope.hasConnectedAdditionalSocialAccounts=function(){for(var i in $scope.user.additionalProvidersData)return!0;return!1},$scope.isConnectedSocialAccount=function(provider){return $scope.user.provider===provider||$scope.user.additionalProvidersData&&$scope.user.additionalProvidersData[provider]},$scope.removeUserSocialAccount=function(provider){$scope.success=$scope.error=null,$http["delete"]("/users/accounts",{params:{provider:provider}}).success(function(response){$scope.success=!0,$scope.user=Authentication.user=response}).error(function(response){$scope.error=response.message})},$scope.updateUserProfile=function(isValid){if(isValid){$scope.success=$scope.error=null;var user=new Users($scope.user);user.$update(function(response){$scope.success=!0,Authentication.user=response},function(response){$scope.error=response.data.message})}else $scope.submitted=!0},$scope.changeUserPassword=function(){$scope.success=$scope.error=null,$http.post("/users/password",$scope.passwordDetails).success(function(){$scope.success=!0,$scope.passwordDetails=null}).error(function(response){$scope.error=response.message})}}]),angular.module("users").factory("Authentication",[function(){var _this=this;return _this._data={user:window.user},_this._data}]),angular.module("users").factory("Users",["$resource",function($resource){return $resource("users",{},{update:{method:"PUT"}})}]);