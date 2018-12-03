var datas = {};
var notifications = [];
var sessions = [];
var errors = [];
var currentRoute;
var routeDatas = [];
var url = 'http://api/';
var homepage = 'home';


/** config init **/
var hashCurrentRoute = function( hashRoute )
{
    routeDatas = hashRoute.split('/');
    currentRoute = routeDatas[0];
};

/**
 * Setup the process of the loading the page 
 * within all specifications coming from the routes.json file
 * 
 * @returns {jqXHR}
 */
var dataRoute = function()
{
    hashCurrentRoute( location.hash.slice(1) );
    
    var request = new XMLHttpRequest();
    
    request.open( 'GET', 'public/js/routes.json', true );

    request.onload = function() 
    {
        if( request.status >= 200 && request.status < 400 ){

            var jsonStr = JSON.parse( request.responseText );

            datas = jsonStr.routes[currentRoute];
            secureRouteAccess();
            setCurRouterDatas();
            getCurRouterSessions();
            getCurRouterNotifications();
            backlinkConversion();
            apiDatas();
        }
    };
    
    request.onerror = function()
    {
        location.hash = homepage;
    };
    
    request.send();
};

var secureRouteAccess = function()
{
    if( !isLoguedIn() && datas.public === 'false' )
    {
        location.hash = homepage;
    }
};

/** Login & logout **/
var loguedin = function( userDatas )
{
    if( userDatas.process === 'success' )
    {
        setSession('login', true);
        setSession('Id', userDatas.id);
        setSession('FirstnameUser', userDatas.firstname);
        setSession('LastnameUser', userDatas.lastname);
        window.location = "";
    }    
};

var logout = function()
{
    removeSession('login');
    removeSession('Id');
    removeSession('FirstnameUser');
    removeSession('LastnameUser');
    loadPage();
};

var isLoguedIn = function()
{
    if( getSession('login') )
    { 
        datas.isLoguedIn = true; 
        return true; 
    }
    else
    { 
        datas.isLoguedIn = false; 
        return false; 
    } 
};


/** API Manager  **/


var urlInfosConvert = function( urlInfo )
{
    if( localStorage.getItem('Id') && urlInfo.indexOf( '[Id]' ) !== -1 )
    {
        urlInfo = urlInfo.replace( '[Id]', localStorage.getItem('Id') );
    }
    
    return urlInfo;
};


/**
 * Callback method is called from the datas coming from the API.
 * 
 * @see apiDatas() method
 * @returns void
 */
var checkDynamicUrls = function()
{
    if( datas.dynamicUrlsMethod )
    {
        window[datas.dynamicUrlsMethod]();
    }
};

/**
 * Transforms backlinks url infos that is set in the routes.json for the current page
 * Those infos are set by brackets [] that are set in the URL (ex. results/[m]/[d]).
 * It sets back the datas.backUrl with the URL transformed.
 * 
 * @returns void
 */
var backlinkConversion = function()
{
    if( datas.hasOwnProperty('backUrl') )
    {
        datas.backUrl = urlInfosConvert( datas.backUrl );
    }
};


/**
 * Transforms api url infos that is set in the routes.json for the current page
 * Those infos are set by brackets [] that are set in the URL (ex. api/users/stats/[Id]/days/[Y]-[m]-[d]).
 * The API is called and the datas sent back are sets in datas.apiDatas as an object.
 * The process ends with the call of the setup of the interface - setInterface() method.
 * 
 * @returns void
 */
var apiDatas = function()
{
    if( datas.hasOwnProperty('apiURL') )
    {
        var apiUrlConverted = urlInfosConvert( datas.apiURL );

        var request = new XMLHttpRequest();

        request.open( 'GET', url + apiUrlConverted, true );

        request.onload = function() 
        {
            if( request.status >= 200 && request.status < 400 ){

                var jsonStr = JSON.parse( request.responseText );
                
                datas.internetConnexion = true;

                datas.apiDatas = jsonStr;

                checkDynamicUrls();
                
                setInterface();
            }
            else
            {
                datas.internetConnexion = false;
                setNotification( 'La connexion Internet n\'est pas disponible. Certaines informations ne peuvent pas être mises à jour.' );
                setInterface();  
            }
        };
        
        request.onerror = function()
        {
            datas.internetConnexion = false;
            setNotification( 'La connexion Internet n\'est pas disponible. Certaines informations ne peuvent pas être mises à jour.' );
            setInterface();
        };

        request.send();
    }
    else
    {
        setInterface();
    }
};


/** Requests & Sessions **/

var setCurRouterDatas = function()
{
    routeDatas.forEach(function( value, key )
    {
        if( key > 0 )
        {
            currentUrlVars = value.split('=');
            
            datas[currentUrlVars[0]] = currentUrlVars[1];  
        }
    });
    
    datas['currentRoute'] = currentRoute;
};

var setSession = function( variable, value )
{
    localStorage.setItem( variable, value );
};

var getSession = function( variable )
{
    return localStorage.getItem( variable );
};

var removeSession = function( variable )
{
    localStorage.removeItem( variable );
};


var updateSessionDatas = function()
{
    if( datas.apiDatas[0].LastnameUser )
    {
        setSession( 'LastnameUser', datas.apiDatas[0].LastnameUser );
    }
    if( datas.apiDatas[0].FirstnameUser )
    {
        setSession( 'FirstnameUser', datas.apiDatas[0].FirstnameUser );
    }
};

var getCurRouterSessions = function()
{
    for ( var i = 0; i < localStorage.length; ++i ) 
    {
        sessions[ localStorage.key( i ) ] = localStorage.getItem( localStorage.key( i ) );
    }
    datas.sessions = sessions;
};


var homeNotifications = function()
{
    var notifications = {
        "account":[
            "Don't forget to create an account so you can get access to even more features."
        ],
        "member":[
            "It's great to have you with us !",
            "It's surely a great time to get on this one !"
        ]        
    };
    
    if( datas.sessions && datas.sessions['FirstnameUser'] && datas.sessions['FirstnameUser'] === '' )
    {
        var factor = 'account';
    }
    else
    {
        var factor = 'member';
    }
    
    var nbNotifs = notifications[ factor ].length;
  
    var randomNum = Math.floor( ( Math.random() * nbNotifs ) );

    return notifications[ factor ][ randomNum ];
};


var setNotification = function( notification )
{
    notifications[ notifications.length ] = notification;
};


var getCurRouterNotifications = function()
{
    if( currentRoute === 'home' )
    {
        var homeNotif = homeNotifications();
        
        if( homeNotif )
        {
            setNotification( homeNotif );
        }
    }
    else
    {
        notifications = [];
    }
    datas.notifications = notifications;
};


/** Routes & Views Manager**/

var setInterface = function()
{
    document.querySelector('body').setAttribute( 'class', '' );
    document.querySelector('body').classList.add( currentRoute );

    if( datas.skin === 'true' )
    {
        var bodyColor = ( datas.sessions.color ) ? datas.sessions.color : 'green';
        document.querySelector('body').classList.add( bodyColor );
    }
    
    var scriptsLoaded = document.querySelectorAll( 'script.pagescript' );
    
    if( scriptsLoaded && scriptsLoaded.length > 0 )
    {
        Array.prototype.forEach.call( scriptsLoaded, function( scriptLoaded )
        {
            scriptLoaded.parentNode.removeChild( scriptLoaded );
        });
    }
        
    loadViewContent( 'views/partials/header.ejs', 'header', function()
    {
        loadViewContent( 'views/partials/footer.ejs', 'footer', function()
        {
            loadViewContent( 'views/pages/' + currentRoute + '.ejs', 'main', function()
            {
                if( datas.scripts && datas.scripts.length > 0 )
                {
                    loadJsContent( datas.scripts, 0, datas.scripts.length );
                }
            });
        });       
    });
    
};

var loadViewContent = function( getUrl, htmlSection, callback )
{
    var request = new XMLHttpRequest();
    
    request.open('GET', getUrl, true);

    request.onload = function() 
    {
        if( request.status >= 200 && request.status < 400 ) 
        {
            var view = request.responseText;

            html = ejs.render( view, datas );
     
            document.querySelector( htmlSection ).innerHTML  = html;
            
            if( typeof callback !== 'undefined')
            {
                callback();
            }
        }
    };
      
    request.send();
};



var loadJsContent = function( scripts, nScript, nbScripts )
{
    var script = document.createElement('script');
                
    script.onload = function()
    {
        if( scripts[nScript][1] ) 
        {
            window[ scripts[nScript][1] ]( datas );
        }
        
        var nextScript = ( nScript + 1 );
        
        if( nextScript < nbScripts )
        {
            loadJsContent( scripts, nextScript, nbScripts );
        }
    };
    script.src = 'public/js/' + scripts[nScript][0] + '?' + new Date().getTime();

    script.classList.add( 'pagescript' );

    document.querySelector('body').appendChild( script );
};


var loadPage = function()
{
    window.location.reload();
};


/** Page loading - navigation **/

/**
 * Called when an anchor is set in the URL (ex. : #home)
 */
window.onhashchange = function()
{
    dataRoute();
};


window.onload = function()
{
    if( location.hash === '#' + homepage )
    {
        window.location = "";
    }
    
    location.hash = homepage;
};