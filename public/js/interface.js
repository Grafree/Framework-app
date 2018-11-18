// interface.js loads common page events

var interface = function( datas )
{       
    console.log( datas.title );
    
    if( datas.tache && datas.currentRoute === 'app' )
    {
        switch( datas.tache ){
            case '1':
                $('main div').html('Changer les pneus de la voiture.');
            break;
            case '2':
                $('main div').html('Faire une sauvegarde des données.'); 
            break;
            case '3':
                $('main div').html('Développer la fonctionnalité de l\'interface.');
            break;
            case '4':
                $('main div').html('Sortir les poubelles.');
            break;
            default:
                $('main div').html('Vous avez complété toutes vos tâches !');
            break;
        }
    }
    
};