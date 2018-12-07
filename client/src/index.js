import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';

import Advertiser from './components/Advertiser'
import Publisher from './components/Publisher'

ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <Route path="/publisher" component={Publisher}/>
      <Route path="/advertiser" component={Advertiser}/>
      <Route path="/" component={Advertiser}/>
    </Switch>
  </BrowserRouter>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
