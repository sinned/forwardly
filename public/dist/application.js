'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
	// Init module configuration options
	var applicationModuleName = 'forwardly';
	var applicationModuleVendorDependencies = ['ngResource', 'ngCookies',  'ngAnimate',  'ngTouch',  'ngSanitize',  'ui.router', 'ui.bootstrap', 'ui.utils', 'textAngular'];

	// Add a new vertical module
	var registerModule = function(moduleName, dependencies) {
		// Create angular module
		angular.module(moduleName, dependencies || []);

		// Add the module to the AngularJS configuration file
		angular.module(applicationModuleName).requires.push(moduleName);
	};

	return {
		applicationModuleName: applicationModuleName,
		applicationModuleVendorDependencies: applicationModuleVendorDependencies,
		registerModule: registerModule
	};
})();
'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('companies');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('listings');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('referrals');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');

'use strict';

// Configuring the Articles module
angular.module('companies').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Companies', 'companies', 'dropdown', '/companies(/create)?');
		Menus.addSubMenuItem('topbar', 'companies', 'List Companies', 'companies');
		Menus.addSubMenuItem('topbar', 'companies', 'New Company', 'companies/create');
	}
]);
'use strict';

//Setting up route
angular.module('companies').config(['$stateProvider',
	function($stateProvider) {
		// Companies state routing
		$stateProvider.
		state('listCompanies', {
			url: '/companies',
			templateUrl: 'modules/companies/views/list-companies.client.view.html'
		}).
		state('createCompany', {
			url: '/companies/create',
			templateUrl: 'modules/companies/views/create-company.client.view.html'
		}).
		state('viewCompany', {
			url: '/companies/:companyId',
			templateUrl: 'modules/companies/views/view-company.client.view.html'
		}).
		state('editCompany', {
			url: '/companies/:companyId/edit',
			templateUrl: 'modules/companies/views/edit-company.client.view.html'
		});
	}
]);
'use strict';

// Companies controller
angular.module('companies').controller('CompaniesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Companies',
	function($scope, $stateParams, $location, Authentication, Companies ) {
		$scope.authentication = Authentication;

		// Create new Company
		$scope.create = function() {
			// Create new Company object
			var company = new Companies ({
				name: this.name,
				description: this.description,
				url: this.url,
				imageUrl: this.imageUrl
			});

			// Redirect after save
			company.$save(function(response) {
				$location.path('companies/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Company
		$scope.remove = function( company ) {
			if ( company ) { company.$remove();

				for (var i in $scope.companies ) {
					if ($scope.companies [i] === company ) {
						$scope.companies.splice(i, 1);
					}
				}
			} else {
				$scope.company.$remove(function() {
					$location.path('companies');
				});
			}
		};

		// Update existing Company
		$scope.update = function() {
			var company = $scope.company ;

			company.$update(function() {
				$location.path('companies/' + company._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Companies
		$scope.find = function() {
			$scope.companies = Companies.query();
		};

		// Find existing Company
		$scope.findOne = function() {
			$scope.company = Companies.get({ 
				companyId: $stateParams.companyId
			});
		};
	}
]);
'use strict';

//Companies service used to communicate Companies REST endpoints
angular.module('companies').factory('Companies', ['$resource',
	function($resource) {
		return $resource('companies/:companyId', { companyId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('home', {
			url: '/',
			templateUrl: 'modules/core/views/home.client.view.html'
		});
	}
]);
'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus',
	function($scope, Authentication, Menus) {
		$scope.authentication = Authentication;
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});
	}
]);
/* globals S3Upload */
'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication', 'Random',
	function($scope, Authentication, Random) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		$scope.data = {
			firstName : '',
			lastName : ''
		};
		$scope.upload = {
			progressing: false,
			percent:0,
			complete:false,
			url:'',
			error:false,
			errorMessage:''
		};
		$scope.s3_upload = function(target) {
			$scope.upload = {
				progressing: false,
				percent:0,
				complete:false,
				url:'',
				error:false,
				errorMessage:''
			};
			var namePrefix = $scope.data.firstName+$scope.data.lastName;
			if (!namePrefix) {
				namePrefix = 'Candidate';
			}
			if (!target.files[0] || !target.files[0].type) {
				$scope.$apply(function() {
					$scope.upload.error = true;
					$scope.upload.errorMessage = 'Unable to read content type of resume';
				});
				return;
			}
			var type = target.files[0].type;
			var suffix = '';
			if (type === 'application/pdf') {
				suffix = '.pdf';
			} else if (type === 'application/msword') {
				suffix = '.doc';
			} else if (type === 'application/rtf') {
				suffix = '.rtf';
			} else if (type === 'text/plain') {
				suffix = '.txt';
			} else {
				$scope.$apply(function() {
					$scope.upload.error = true;
					$scope.upload.errorMessage = 'Resume must be pdf, doc, rtf, or txt file';
				});
				return;
			}
			var name = Random.generateString(24)+'/'+namePrefix+'Resume'+suffix;
			var s3upload = new S3Upload({
				s3_object_name: name,
				file_dom_selector: 'files',
				s3_sign_put_url: '/sign_s3',
				onProgress: function(percent, message) {
					$scope.$apply(function() {
						$scope.upload.progressing = true;
						$scope.upload.percent = percent;
					});
				},
				onFinishS3Put: function(public_url) {
					$scope.$apply(function() {
						$scope.upload.progressing = false;
						$scope.upload.complete = true;
						$scope.upload.url = public_url;
					});
				},
				onError: function(status) {
					$scope.$apply(function() {
						$scope.upload.progressing = false;
						$scope.upload.complete = false;
						$scope.upload.error = true;
						$scope.upload.errorMessage = status;
					});
				}
			});
		};
	}
]);

'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [

	function() {
		// Define a set of default roles
		this.defaultRoles = ['*'];

		// Define the menus object
		this.menus = {};

		// A private function for rendering decision 
		var shouldRender = function(user) {
			if (user) {
				if (!!~this.roles.indexOf('*')) {
					return true;
				} else {
					for (var userRoleIndex in user.roles) {
						for (var roleIndex in this.roles) {
							if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
								return true;
							}
						}
					}
				}
			} else {
				return this.isPublic;
			}

			return false;
		};

		// Validate menu existance
		this.validateMenuExistance = function(menuId) {
			if (menuId && menuId.length) {
				if (this.menus[menuId]) {
					return true;
				} else {
					throw new Error('Menu does not exists');
				}
			} else {
				throw new Error('MenuId was not provided');
			}

			return false;
		};

		// Get the menu object by menu id
		this.getMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			return this.menus[menuId];
		};

		// Add new menu object by menu id
		this.addMenu = function(menuId, isPublic, roles) {
			// Create the new menu
			this.menus[menuId] = {
				isPublic: isPublic || false,
				roles: roles || this.defaultRoles,
				items: [],
				shouldRender: shouldRender
			};

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			delete this.menus[menuId];
		};

		// Add menu item object
		this.addMenuItem = function(menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Push new menu item
			this.menus[menuId].items.push({
				title: menuItemTitle,
				link: menuItemURL,
				menuItemType: menuItemType || 'item',
				menuItemClass: menuItemType,
				uiRoute: menuItemUIRoute || ('/' + menuItemURL),
				isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].isPublic : isPublic),
				roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].roles : roles),
				position: position || 0,
				items: [],
				shouldRender: shouldRender
			});

			// Return the menu object
			return this.menus[menuId];
		};

		// Add submenu item object
		this.addSubMenuItem = function(menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
					// Push new submenu item
					this.menus[menuId].items[itemIndex].items.push({
						title: menuItemTitle,
						link: menuItemURL,
						uiRoute: menuItemUIRoute || ('/' + menuItemURL),
						isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].items[itemIndex].isPublic : isPublic),
						roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : roles),
						position: position || 0,
						shouldRender: shouldRender
					});
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenuItem = function(menuId, menuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
					this.menus[menuId].items.splice(itemIndex, 1);
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeSubMenuItem = function(menuId, submenuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
					if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
						this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
					}
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		//Adding the topbar menu
		this.addMenu('topbar');
	}
]);
'use strict';

angular.module('core').service('Random', [
	function() {
		var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghiklmnopqrstuvwxyz';
		this.generateString = function(length) {
			length = length ? length : 32;
			var string = '';
			for (var i = 0; i < length; i++) {
				var randomNumber = Math.floor(Math.random() * chars.length);
				string += chars.substring(randomNumber, randomNumber + 1);
			}
			return string;
		};
	}
]);

'use strict';

// Configuring the Articles module
angular.module('listings').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Listings', 'listings', 'dropdown', '/listings(/create)?');
		Menus.addSubMenuItem('topbar', 'listings', 'List Listings', 'listings');
		Menus.addSubMenuItem('topbar', 'listings', 'New Listing', 'listings/create');
	}
]);
'use strict';

//Setting up route
angular.module('listings').config(['$stateProvider',
	function($stateProvider) {
		// Listings state routing
		$stateProvider.
		state('listListings', {
			url: '/listings',
			templateUrl: 'modules/listings/views/list-listings.client.view.html'
		}).
		state('createListing', {
			url: '/listings/create',
			templateUrl: 'modules/listings/views/create-listing.client.view.html'
		}).
		state('viewListing', {
			url: '/listings/:listingId',
			templateUrl: 'modules/listings/views/view-listing.client.view.html'
		}).
		state('editListing', {
			url: '/listings/:listingId/edit',
			templateUrl: 'modules/listings/views/edit-listing.client.view.html'
		}).
        state('applyListing', {
            url: '/listings/:listingId/apply',
            templateUrl: 'modules/listings/views/apply-listing.client.view.html'
        }).
		state('viewListingReferral', {
			url: '/listings/:listingId/referrals/:referralId',
			templateUrl: 'modules/listings/views/view-listing.client.view.html'
		}).
		state('applyListingReferral', {
			url: '/listings/:listingId/apply/:referralId',
			templateUrl: 'modules/listings/views/apply-listing.client.view.html'
		})		
        ;
	}
]);

'use strict';

// Listings controller
angular.module('listings').controller('ListingsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Listings', 'Companies', 'Referrals',
	function($scope, $stateParams, $location, Authentication, Listings, Companies, Referrals ) {
		$scope.authentication = Authentication;

		// Create new Listing
		$scope.create = function() {
			// Create new Listing object
			console.log(this);
			var listing = new Listings ({
				company: this.company,
				headline: this.headline,
				description: this.description,
				location: this.location,
				role: this.role,
				tags: this.tags,
				referralFee: this.referralFee
			});

			// Redirect after save
			listing.$save(function(response) {
				$location.path('listings/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Listing
		$scope.remove = function( listing ) {
			if ( listing ) { listing.$remove();

				for (var i in $scope.listings ) {
					if ($scope.listings [i] === listing ) {
						$scope.listings.splice(i, 1);
					}
				}
			} else {
				$scope.listing.$remove(function() {
					$location.path('listings');
				});
			}
		};

		// Update existing Listing
		$scope.update = function() {
			var listing = $scope.listing ;

			listing.$update(function() {
				$location.path('listings/' + listing._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Listings
		$scope.find = function() {
			$scope.listings = Listings.query();
		};

		// Find existing Listing
		$scope.findOne = function() {
			$scope.listing = Listings.get({ 
				listingId: $stateParams.listingId
			});
			if ($stateParams.referralId) {
				$scope.referral = Referrals.get({
					referralId: $stateParams.referralId
				});
			}

		};

		// the list of roles
		$scope.roles = [
			{name: 'Software Engineer'},
			{name: 'Backend Developer'},
			{name: 'Data Scientist'}, 
			{name: 'DevOps'}, 
			{name: 'Frontend Developer'}, 
			{name: 'Full-Stack Developer'}, 
			{name: 'Mobile Developer'}, 
			{name: 'Attorney'}, 
			{name: 'UI/UX Designer'}, 
			{name: 'Finance/Accounting'}, 
			{name: 'Hardware Engineer'}, 
			{name: 'H.R.'}, 
			{name: 'Marketing'}, 
			{name: 'Office Manager'}, 
			{name: 'Operations'}, 
			{name: 'Product Manager'}, 
			{name: 'Sales' }
		];

		// the list of companies
		$scope.companies = Companies.query();	
		
	}
]);
'use strict';

//Listings service used to communicate Listings REST endpoints
angular.module('listings').factory('Listings', ['$resource',
	function($resource) {
		return $resource('listings/:listingId', { listingId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

//Setting up route
angular.module('referrals').config(['$stateProvider',
	function($stateProvider) {
		// Referrals state routing
		$stateProvider.
		state('listReferrals', {
			url: '/referrals',
			templateUrl: 'modules/referrals/views/list-referrals.client.view.html'
		}).
        state('createReferral', {
            url: '/referrals/create/:listingId',
            templateUrl: 'modules/referrals/views/create-referral.client.view.html'
        }).
		state('createReferral2', {
			url: '/referrals/create/:listingId/:referralId',
			templateUrl: 'modules/referrals/views/create-referral.client.view.html'
		}).
		state('viewReferral', {
			url: '/referrals/:referralId',
			templateUrl: 'modules/referrals/views/view-referral.client.view.html'
		}).
		state('editReferral', {
			url: '/referrals/:referralId/edit',
			templateUrl: 'modules/referrals/views/edit-referral.client.view.html'
		});
	}
]);

'use strict';

// Referrals controller
angular.module('referrals').controller('ReferralsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Referrals',
	function($scope, $stateParams, $location, Authentication, Referrals ) {
		$scope.authentication = Authentication;

		// Create new Referral
		$scope.create = function() {
			// Create new Referral object
			var referral = new Referrals ({
				listing: $stateParams.listingId,
                parentReferral: $stateParams.referralId,
                email: this.email,
                firstName: this.firstName,
                lastName: this.lastName,
                customMessage: this.customMessage
			});

			// Redirect after save
			referral.$save(function(response) {
				// with the response, we redirect back to the listing with the parent referral
				console.log('Referral Created: ', response._id);
				var destination = 'listings/' + response.listing._id;
				destination += response.parentReferral ? '/referrals/' + response.parentReferral : '';
				// TODO: Put a success flash message here
				$location.path(destination);
				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Referral
		$scope.remove = function( referral ) {
			if ( referral ) { referral.$remove();

				for (var i in $scope.referrals ) {
					if ($scope.referrals [i] === referral ) {
						$scope.referrals.splice(i, 1);
					}
				}
			} else {
				$scope.referral.$remove(function() {
					$location.path('referrals');
				});
			}
		};

		// Update existing Referral
		$scope.update = function() {
			var referral = $scope.referral ;

			referral.$update(function() {
				$location.path('referrals/' + referral._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Referrals
		$scope.find = function() {
			$scope.referrals = Referrals.query();
		};

		// Find existing Referral
		$scope.findOne = function() {
			$scope.referral = Referrals.get({ 
				referralId: $stateParams.referralId
			});
		};
	}
]);

'use strict';

//Referrals service used to communicate Referrals REST endpoints
angular.module('referrals').factory('Referrals', ['$resource',
	function($resource) {
		return $resource('referrals/:referralId', { referralId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
	function($httpProvider) {
		// Set the httpProvider "not authorized" interceptor
		$httpProvider.interceptors.push(['$q', '$location', 'Authentication',
			function($q, $location, Authentication) {
				return {
					responseError: function(rejection) {
						switch (rejection.status) {
							case 401:
								// Deauthenticate the global user
								Authentication.user = null;

								// Redirect to signin page
								$location.path('signin');
								break;
							case 403:
								// Add unauthorized behaviour 
								break;
						}

						return $q.reject(rejection);
					}
				};
			}
		]);
	}
]);
'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
	function($stateProvider) {
		// Users state routing
		$stateProvider.
		state('profile', {
			url: '/settings/profile',
			templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
		}).
		state('password', {
			url: '/settings/password',
			templateUrl: 'modules/users/views/settings/change-password.client.view.html'
		}).
		state('accounts', {
			url: '/settings/accounts',
			templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
		}).
		state('signup', {
			url: '/signup',
			templateUrl: 'modules/users/views/authentication/signup.client.view.html'
		}).
		state('signin', {
			url: '/signin',
			templateUrl: 'modules/users/views/authentication/signin.client.view.html'
		}).
		state('forgot', {
			url: '/password/forgot',
			templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
		}).
		state('reset-invlaid', {
			url: '/password/reset/invalid',
			templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
		}).
		state('reset-success', {
			url: '/password/reset/success',
			templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
		}).
		state('reset', {
			url: '/password/reset/:token',
			templateUrl: 'modules/users/views/password/reset-password.client.view.html'
		});
	}
]);
'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication',
	function($scope, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		$scope.signup = function() {
			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
	function($scope, $stateParams, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		//If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		// Submit forgotten password account id
		$scope.askForPasswordReset = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/forgot', $scope.credentials).success(function(response) {
				// Show user success message and clear form
				$scope.credentials = null;
				$scope.success = response.message;

			}).error(function(response) {
				// Show user error message and clear form
				$scope.credentials = null;
				$scope.error = response.message;
			});
		};

		// Change user password
		$scope.resetUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.passwordDetails = null;

				// Attach user profile
				Authentication.user = response;

				// And redirect to the index page
				$location.path('/password/reset/success');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication',
	function($scope, $http, $location, Users, Authentication) {
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		// Check if there are additional accounts 
		$scope.hasConnectedAdditionalSocialAccounts = function(provider) {
			for (var i in $scope.user.additionalProvidersData) {
				return true;
			}

			return false;
		};

		// Check if provider is already in use with current user
		$scope.isConnectedSocialAccount = function(provider) {
			return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
		};

		// Remove a user social account
		$scope.removeUserSocialAccount = function(provider) {
			$scope.success = $scope.error = null;

			$http.delete('/users/accounts', {
				params: {
					provider: provider
				}
			}).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.user = Authentication.user = response;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		// Update a user profile
		$scope.updateUserProfile = function(isValid) {
			if (isValid){
				$scope.success = $scope.error = null;
				var user = new Users($scope.user);
	
				user.$update(function(response) {
					$scope.success = true;
					Authentication.user = response;
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};

		// Change user password
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.passwordDetails = null;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);

'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', [

	function() {
		var _this = this;

		_this._data = {
			user: window.user
		};

		return _this._data;
	}
]);
'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
	function($resource) {
		return $resource('users', {}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);