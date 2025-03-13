import './App.css';
import NavigationBar from './components/NavigationBar';
import Content from './components/Content';

const App = () => {
 
 
return( <div className="App">
  <NavigationBar></NavigationBar>
  <h2>Welcome back, huseyinkadioglu. Here’s what we’ve been watching…  </h2>
  <p>This homepage will become customized as you follow active members on Letterboxd.</p>

  <hr></hr>
  <Content></Content>
</div>
);
    
}

export default App;
