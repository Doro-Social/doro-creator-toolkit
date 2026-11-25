import React from 'react';
import {createRoot} from 'react-dom/client';
import {CarouselWorkspace} from '../../../tools/carousel/ui/CarouselWorkspace';
if(location.pathname.startsWith('/design/'))history.replaceState(null,'','/');
createRoot(document.getElementById('root')!).render(<CarouselWorkspace/>);
