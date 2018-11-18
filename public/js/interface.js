// interface.js loads common page events

var interface = function( datas )
{       
    if( datas.tache && datas.currentRoute === 'app' )
    {
        switch( datas.tache )
        {
            case '1':
                document.querySelector('main div').innerHTML = 'Changer les pneus de la voiture.';
            break;
            
            case '2':
                document.querySelector('main div').innerHTML = 'Faire une sauvegarde des données.'; 
            break;
            
            case '3':
                document.querySelector('main div').innerHTML = 'Développer la fonctionnalité de l\'interface.';
            break;
            
            case '4':
                document.querySelector('main div').innerHTML = 'Sortir les poubelles.';
            break;
            
            default:
                document.querySelector('main div').innerHTML = 'Vous avez complété toutes vos tâches !';
            break;
        }
    }
    
};