var datas = {};
var currentRoute;
var routeDatas = [];
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
    
    return $.getJSON('public/js/routes.json', function( jsonStr )
    {
        datas = jsonStr.routes[currentRoute];

        setCurRouterDatas();
    
        setInterface();
    });
};

var setCurRouterDatas = function()
{
    $.each( routeDatas, function( key, value ){
        if( key > 0 ){
            currentUrlVars = value.split('=');
            datas[currentUrlVars[0]] = currentUrlVars[1];  
        }
    });
    datas['currentRoute'] = currentRoute;
};

/** Routes & Views Manager**/

var setInterface = function()
{
    $('body').removeClass().addClass( currentRoute );

    loadContent( 'views/pages/' + currentRoute + '.ejs', 'main');
    loadContent( 'views/partials/header.ejs', 'header');
    loadContent( 'views/partials/footer.ejs', 'footer');
    loadContent( 'views/partials/scripts.ejs', 'div#scripts', 'interface');
};

var loadContent = function( getUrl, htmlSection, callback )
{
    $.get( getUrl, function( view ) 
    {
console.log(datas);
        
        html = ejs.render( view, datas );
        
        $( htmlSection ).html( html );
    })
    .done( function()
    {
        if( callback ) 
        {
            window[callback]( datas );
        }
   });
};


/** Page loading - navigation **/

/**
 * Called when an anchor is set in the URL (ex. : #home)
 */
$(window).on('hashchange', function()
{
    dataRoute();
});


$(window).on('load', function()
{
    if( location.hash === '#' + homepage )
    {
        window.location = "";
    }
    
    location.hash = homepage;
});